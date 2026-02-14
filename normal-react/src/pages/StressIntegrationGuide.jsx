import React from 'react';
import StressMonitor from './pages/StressMonitor';
import StressAnalytics from './pages/StressAnalytics';
import './styles/StressIntegration.css';

/**
 * Integration Guide for Computer Vision Stress Detection
 * 
 * This component shows how to integrate the stress detection features
 * into your existing application
 */

export const StressIntegrationGuide = () => {
  const [activeTab, setActiveTab] = React.useState('monitor');

  return (
    <div className="stress-integration">
      <div className="tab-navigation">
        <button
          className={activeTab === 'monitor' ? 'active' : ''}
          onClick={() => setActiveTab('monitor')}
        >
          📸 Real-time Monitor
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={activeTab === 'guide' ? 'active' : ''}
          onClick={() => setActiveTab('guide')}
        >
          📖 Setup Guide
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'monitor' && <StressMonitor />}
        {activeTab === 'analytics' && <StressAnalytics />}
        {activeTab === 'guide' && <SetupGuide />}
      </div>
    </div>
  );
};

const SetupGuide = () => {
  return (
    <div className="setup-guide">
      <h1>🚀 Stress Detection Setup Guide</h1>

      <section>
        <h2>1. Installation</h2>
        <div className="code-block">
          <p>Backend:</p>
          <code>npm install</code>
          <p>Frontend:</p>
          <code>npm install</code>
        </div>
      </section>

      <section>
        <h2>2. Backend Configuration</h2>
        <div className="description">
          <p>The backend includes:</p>
          <ul>
            <li><strong>stress-detector.js</strong> - Core stress analysis engine</li>
            <li><strong>stress-routes.js</strong> - API endpoints</li>
            <li><strong>authMiddleware.js</strong> - Authentication</li>
          </ul>
        </div>

        <h3>API Endpoints:</h3>
        <div className="endpoint">
          <p><strong>POST /api/stress/analyze</strong></p>
          <p>Analyze stress from detection data</p>
          <code>{"{ detectionData, duration }"}</code>
        </div>

        <div className="endpoint">
          <p><strong>GET /api/stress/history</strong></p>
          <p>Get user's stress analysis history</p>
        </div>

        <div className="endpoint">
          <p><strong>GET /api/stress/stats?days=7</strong></p>
          <p>Get stress statistics for specified period</p>
        </div>
      </section>

      <section>
        <h2>3. Frontend Setup</h2>

        <h3>Add to your App.js routing:</h3>
        <div className="code-block">
          <code>{`import StressMonitor from './pages/StressMonitor';
import StressAnalytics from './pages/StressAnalytics';

<Route path="/stress-monitor" element={<StressMonitor />} />
<Route path="/stress-analytics" element={<StressAnalytics />} />`}</code>
        </div>

        <h3>Update Navigation:</h3>
        <div className="code-block">
          <code>{`<Link to="/stress-monitor">Stress Monitor</Link>
<Link to="/stress-analytics">Stress Analytics</Link>`}</code>
        </div>
      </section>

      <section>
        <h2>4. How It Works</h2>

        <h3>🔍 Computer Vision Analysis</h3>
        <div className="feature-list">
          <div className="feature">
            <h4>Posture Detection</h4>
            <p>Analyzes shoulder height, head position, spine alignment, and arm tension using MediaPipe Pose</p>
          </div>

          <div className="feature">
            <h4>Facial Expression Analysis</h4>
            <p>Detects eye openness, mouth shape, eyebrow position, and facial muscle tension using MediaPipe Face Mesh</p>
          </div>

          <div className="feature">
            <h4>Movement Patterns</h4>
            <p>Tracks gesture frequency and stillness levels to identify fidgeting or rigidity</p>
          </div>
        </div>

        <h3>📊 Stress Scoring</h3>
        <p>The system combines multiple factors to calculate stress level (0-100):</p>
        <ul>
          <li>Posture Analysis: 30%</li>
          <li>Facial Expression: 30%</li>
          <li>Movement Patterns: 20%</li>
          <li>Temporal Consistency: 20%</li>
        </ul>

        <h3>🎯 Stress Levels</h3>
        <div className="stress-levels">
          <div className="level minimal">Minimal: 0-20</div>
          <div className="level low">Low: 20-40</div>
          <div className="level moderate">Moderate: 40-60</div>
          <div className="level high">High: 60-80</div>
          <div className="level critical">Critical: 80-100</div>
        </div>
      </section>

      <section>
        <h2>5. Privacy & Security</h2>
        <div className="security-info">
          <ul>
            <li>🔒 All video processing happens in the browser (client-side)</li>
            <li>📹 Raw video frames are NOT sent to the server</li>
            <li>✅ Only analysis results are transmitted to backend</li>
            <li>🔐 All API requests require authentication token</li>
            <li>📊 Data is associated with user ID for privacy</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>6. Recommendations System</h2>
        <p>The system provides contextual recommendations based on stress level:</p>
        <div className="recommendations-table">
          <div className="table-row">
            <div className="table-cell header">Stress Level</div>
            <div className="table-cell header">Recommendation</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Critical (80+)</div>
            <div className="table-cell">Take immediate break, practice breathing</div>
          </div>
          <div className="table-row">
            <div className="table-cell">High (60-80)</div>
            <div className="table-cell">Take short break, hydrate</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Moderate (40-60)</div>
            <div className="table-cell">Maintain posture, periodic breaks</div>
          </div>
          <div className="table-row">
            <div className="table-cell">Low (0-40)</div>
            <div className="table-cell">Keep up good habits</div>
          </div>
        </div>
      </section>

      <section>
        <h2>7. Dependencies</h2>
        <div className="dependencies">
          <h3>Backend:</h3>
          <ul>
            <li>express - API framework</li>
            <li>mongoose - Database ORM</li>
            <li>jsonwebtoken - Authentication</li>
          </ul>

          <h3>Frontend:</h3>
          <ul>
            <li>@tensorflow/tfjs - ML foundation</li>
            <li>@tensorflow-models/pose-detection - Body posture</li>
            <li>@tensorflow-models/face-landmarks-detection - Facial features</li>
            <li>@mediapipe/* - ML inference</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>8. Future Enhancements</h2>
        <ul>
          <li>📱 Mobile app integration with native camera access</li>
          <li>🤖 ML model fine-tuning for better accuracy</li>
          <li>🔔 Real-time notifications based on stress thresholds</li>
          <li>📈 Predictive stress forecasting</li>
          <li>🎵 Integration with music/meditation apps</li>
          <li>👥 Peer stress level comparisons (anonymous)</li>
          <li>🏥 Integration with health APIs (heart rate, etc.)</li>
          <li>📝 Detailed stress journaling with tags</li>
        </ul>
      </section>

      <div className="info-box">
        <h3>💡 Quick Start</h3>
        <ol>
          <li>Install dependencies: <code>npm install</code></li>
          <li>Start backend: <code>npm run dev</code></li>
          <li>Start frontend: <code>npm start</code></li>
          <li>Navigate to Stress Monitor page</li>
          <li>Click "Enable Webcam" then "Start Monitoring"</li>
          <li>View real-time stress analysis and analytics</li>
        </ol>
      </div>
    </div>
  );
};

export default StressIntegrationGuide;
