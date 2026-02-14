import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/StressMonitor.css';
import EmotionPostureDetector from '../components/EmotionPostureDetector';

const StressMonitor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stressLevel, setStressLevel] = useState(0);
  const [intensity, setIntensity] = useState('Minimal');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [permissions, setPermissions] = useState(false);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [detectorActive, setDetectorActive] = useState(false);
  const detectorRef = useRef({});
  const [monitoringTime, setMonitoringTime] = useState(0);
  const streamRef = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const previousFrameRef = useRef(null);

  // Initialize webcam
  const initializeWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        setHasCameraAccess(true);
        console.log('✅ Webcam enabled successfully');
      }
    } catch (error) {
      console.log('Camera access not available:', error.message);
      setHasCameraAccess(false);
    } finally {
      setPermissions(true);
    }
  };

  // Analyze video frame for stress indicators
  const analyzeVideoFrame = useCallback(() => {
    if (!videoRef.current || !hasCameraAccess) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 480;
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, 640, 480);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, 640, 480);
      const data = imageData.data;
      
      // Calculate average brightness
      let brightness = 0;
      let colorVariance = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const pixelBrightness = (r + g + b) / 3;
        brightness += pixelBrightness;
        colorVariance += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
      }
      
      brightness = brightness / (data.length / 4);
      colorVariance = (colorVariance / (data.length / 4)) * 0.5;
      
      // Calculate movement (frame-to-frame difference)
      let movement = 0;
      if (previousFrameRef.current) {
        for (let i = 0; i < Math.min(data.length, previousFrameRef.current.length); i += 4) {
          const diff = Math.abs(data[i] - previousFrameRef.current[i]) +
                      Math.abs(data[i + 1] - previousFrameRef.current[i + 1]) +
                      Math.abs(data[i + 2] - previousFrameRef.current[i + 2]);
          movement += diff;
        }
        movement = movement / (data.length / 4) / 255 * 100;
      }
      
      previousFrameRef.current = new Uint8ClampedArray(data);
      
      // Calculate stress: brightness deviation + movement + color variance
      let stressBased = Math.abs((brightness - 128) / 128) * 30 + 
                       Math.min(movement, 50) + 
                       Math.min(colorVariance, 20) +
                       (Math.random() - 0.5) * 10;
      
      stressBased = Math.min(100, Math.max(0, stressBased));
      // If detector provided a combined score, prefer it (detector updates state separately)
      if (!detectorRef.current.combined) {
        setStressLevel(Math.round(stressBased));
      }
      
      // Determine intensity level
      if (stressBased >= 80) setIntensity('Critical');
      else if (stressBased >= 60) setIntensity('High');
      else if (stressBased >= 40) setIntensity('Moderate');
      else if (stressBased >= 20) setIntensity('Low');
      else setIntensity('Minimal');
    }
  }, [hasCameraAccess]);

  // Simulate stress detection (when camera not available)
  const simulateStress = useCallback(() => {
    let stress = 20;
    const randomChange = (Math.random() - 0.5) * 40;
    stress = Math.min(100, Math.max(0, stress + randomChange));
    setStressLevel(Math.round(stress));
    
    if (stress >= 80) setIntensity('Critical');
    else if (stress >= 60) setIntensity('High');
    else if (stress >= 40) setIntensity('Moderate');
    else if (stress >= 20) setIntensity('Low');
    else setIntensity('Minimal');
  }, []);

  // Start monitoring with continuous live feed
  const startMonitoring = async () => {
    if (!permissions) {
      await initializeWebcam();
    }
    
    setIsMonitoring(true);
    setMonitoringTime(0);
    setDetectorActive(true);
    
    // Start timer
    timerIntervalRef.current = setInterval(() => {
      setMonitoringTime(prev => prev + 1);
    }, 1000);
    
    const monitoringLoop = async () => {
      let isRunning = true;
      
      const intervalId = setInterval(async () => {
        if (!isRunning) return;
        
        if (hasCameraAccess) {
          analyzeVideoFrame();
        } else {
          simulateStress();
        }
      }, 500);
      
      // Run for continuous monitoring (no auto-stop)
      monitoringIntervalRef.current = intervalId;
    };
    
    monitoringLoop();
  };

  // Stop monitoring and save data
  const stopMonitoring = async () => {
    setIsMonitoring(false);
    setDetectorActive(false);
    
    // Clear timers
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    // Save stress data to backend
    try {
      await fetch('/api/stress/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          stressLevel,
          intensity,
          duration: monitoringTime,
          timestamp: new Date().toISOString()
        })
      });
      console.log('✅ Stress data saved:', { stressLevel, intensity, duration: monitoringTime });
    } catch (error) {
      console.log('Error saving stress data:', error);
    }
    
    setMonitoringTime(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleDetectorPrediction = useCallback(({ combined, faceScore, postureScore }) => {
    detectorRef.current = { combined, faceScore, postureScore };
    setStressLevel(combined);
    if (combined >= 80) setIntensity('Critical');
    else if (combined >= 60) setIntensity('High');
    else if (combined >= 40) setIntensity('Moderate');
    else if (combined >= 20) setIntensity('Low');
    else setIntensity('Minimal');
  }, []);

  return (
    <div className="stress-monitor">
      <h1>🧠 Real-Time Stress Monitor</h1>
      
      <div className="monitor-controls">
        {!permissions && (
          <button onClick={initializeWebcam} className="btn btn-primary">
            🎥 Enable Webcam
          </button>
        )}
        
        {permissions && (
          <>
            {!isMonitoring ? (
              <button onClick={startMonitoring} className="btn btn-success">
                ▶ Start Monitoring
              </button>
            ) : (
              <button onClick={stopMonitoring} className="btn btn-danger">
                ⏹ Stop Monitoring
              </button>
            )}
          </>
        )}
      </div>

      <div className="monitor-content">
        <div className="video-container">
          {hasCameraAccess ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  borderRadius: '12px',
                  display: 'block',
                  background: '#000'
                }}
              />
              {isMonitoring && <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '8px' }}>🔴 LIVE: Camera Feed Active</div>}
            </>
          ) : permissions ? (
            <>
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  borderRadius: '12px',
                  background: '#1a1a2e',
                  display: 'block'
                }}
              />
              {isMonitoring && <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '8px' }}>📊 Demo Mode: Simulated Analysis</div>}
            </>
          ) : (
            <div style={{
              width: '100%',
              maxWidth: '640px',
              height: '480px',
              background: '#1a1a2e',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <p>Click "Enable Webcam" to start</p>
              <small>Allow camera access for live analysis</small>
            </div>
          )}
        </div>

        {/* Background detector component: uses same videoRef for analysis */}
        <EmotionPostureDetector
          videoRef={videoRef}
          enabled={detectorActive && hasCameraAccess}
          onPrediction={handleDetectorPrediction}
        />

        {isMonitoring && (
          <div className="analysis-panel">
            <div className="stress-meter">
              <h2>Stress Level: <span style={{ fontSize: '32px' }}>{stressLevel}%</span></h2>
              <div className="stress-bar" 
                style={{ 
                  width: `${stressLevel}%`,
                  background: stressLevel >= 80 ? '#ef4444' :
                             stressLevel >= 60 ? '#f97316' :
                             stressLevel >= 40 ? '#eab308' :
                             '#22c55e'
                }}
              ></div>
              <p className={`intensity ${intensity.toLowerCase()}`}>
                {stressLevel >= 80 ? '🔴' : stressLevel >= 60 ? '🟠' : stressLevel >= 40 ? '🟡' : '🟢'} {intensity}
              </p>
            </div>

            <div className="recommendations">
              <h3>💡 Recommendations:</h3>
              <ul>
                {stressLevel >= 80 && (
                  <>
                    <li>✓ Take a 5-10 minute break immediately</li>
                    <li>✓ Practice deep breathing exercises</li>
                    <li>✓ Step outside for fresh air</li>
                  </>
                )}
                {stressLevel >= 60 && stressLevel < 80 && (
                  <>
                    <li>✓ Take a short 2-3 minute break</li>
                    <li>✓ Stretch your neck and shoulders</li>
                    <li>✓ Drink some water</li>
                  </>
                )}
                {stressLevel < 60 && (
                  <>
                    <li>✓ Keep maintaining your current pace</li>
                    <li>✓ Take periodic breaks every hour</li>
                    <li>✓ Stay hydrated and focused</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StressMonitor;
