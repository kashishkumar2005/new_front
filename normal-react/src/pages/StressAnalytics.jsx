import React, { useState, useEffect, useCallback } from 'react';
import '../styles/StressAnalytics.css';

const StressAnalytics = () => {
  const [period, setPeriod] = useState(7);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch analytics from backend
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stress/stats?days=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Backend may return { success:true, stats } or raw stats
        const stats = data.stats || data;
        setAnalytics(stats || {
          totalReadings: 0,
          averageStress: 0,
          maxStress: 0,
          minStress: 0,
          distribution: { critical: 0, high: 0, moderate: 0, low: 0 },
          trend: 'stable'
        });
      } else {
        // Set default data if backend returns nothing
        setAnalytics({
          totalReadings: 0,
          averageStress: 0,
          maxStress: 0,
          minStress: 0,
          distribution: { critical: 0, high: 0, moderate: 0, low: 0 },
          trend: 'stable'
        });
      }
    } catch (error) {
      console.log('Error fetching analytics:', error);
      setAnalytics({
        totalReadings: 0,
        averageStress: 0,
        maxStress: 0,
        minStress: 0,
        distribution: { critical: 0, high: 0, moderate: 0, low: 0 },
        trend: 'stable'
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !analytics) {
    return (
      <div className="stress-analytics">
        <h2>📊 Stress Analytics Dashboard</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {loading ? 'Loading analytics...' : 'Fetching data...'}
        </div>
      </div>
    );
  }

  const total = analytics.distribution.low + analytics.distribution.moderate + 
                analytics.distribution.high + analytics.distribution.critical;

  return (
    <div className="stress-analytics">
      <h2>📊 Stress Analytics Dashboard</h2>
      
      <div className="period-selector">
        {[1, 7, 14, 30].map(days => (
          <button
            key={days}
            className={period === days ? 'active' : ''}
            onClick={() => setPeriod(days)}
          >
            {days === 1 ? 'Today' : `${days}d`}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>📈 Average Stress</h3>
          <div className="stat-value">{analytics.averageStress || 0}</div>
          <div className="stat-label">out of 100</div>
        </div>
        
        <div className="stat-card">
          <h3>🔴 Peak Stress</h3>
          <div className="stat-value">{analytics.maxStress || 0}</div>
          <div className="stat-label">Maximum recorded</div>
        </div>
        
        <div className="stat-card">
          <h3>🟢 Lowest Stress</h3>
          <div className="stat-value">{analytics.minStress || 0}</div>
          <div className="stat-label">Minimum recorded</div>
        </div>
        
        <div className="stat-card">
          <h3>📊 Trend</h3>
          <div className="stat-value trend">
            {analytics.trend === 'increasing' && '📈'}
            {analytics.trend === 'decreasing' && '📉'}
            {analytics.trend === 'stable' && '➡️'}
          </div>
          <div className="stat-label">{analytics.trend}</div>
        </div>
      </div>

      <div className="charts">
        <div className="chart-container">
          <h3>Stress Distribution</h3>
          <div className="distribution-bars">
            <div className="bar-row">
              <span>🟢 Minimal (0-20)</span>
              <div className="bar minimal" style={{width: `${total > 0 ? (analytics.distribution.low / total) * 100 : 0}%`}}></div>
              <span>{analytics.distribution.low}</span>
            </div>
            <div className="bar-row">
              <span>🟡 Moderate (20-60)</span>
              <div className="bar moderate" style={{width: `${total > 0 ? (analytics.distribution.moderate / total) * 100 : 0}%`}}></div>
              <span>{analytics.distribution.moderate}</span>
            </div>
            <div className="bar-row">
              <span>🟠 High (60-80)</span>
              <div className="bar high" style={{width: `${total > 0 ? (analytics.distribution.high / total) * 100 : 0}%`}}></div>
              <span>{analytics.distribution.high}</span>
            </div>
            <div className="bar-row">
              <span>🔴 Critical (80-100)</span>
              <div className="bar critical" style={{width: `${total > 0 ? (analytics.distribution.critical / total) * 100 : 0}%`}}></div>
              <span>{analytics.distribution.critical}</span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3>📊 Readings Summary</h3>
          <div className="reading-count">
            <p>Total Readings: <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a9eff' }}>{analytics.totalReadings}</span></p>
            <p>Average per day: <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a9eff' }}>{(analytics.totalReadings / period).toFixed(1)}</span></p>
            {analytics.totalReadings === 0 && (
              <p style={{ marginTop: '1rem', fontSize: '0.9em', color: 'rgba(255,255,255,0.7)' }}>
                💡 Click "AI Stress" and start monitoring to generate stress data.
              </p>
            )}
          </div>
        </div>
      </div>

      <button onClick={fetchAnalytics} className="refresh-btn">
        🔄 Refresh Data
      </button>
    </div>
  );
};

export default StressAnalytics;
