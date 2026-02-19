// Stress Detection Routes
const express = require('express');
const router = express.Router();
const { analyzeStressFromVideo } = require('./stress-detector');
const authMiddleware = require('./authMiddleware'); // Adjust path as needed

// Stress Analysis Schema (MongoDB Model)
let StressAnalysis; // Will be initialized from server.js

const initializeStressModel = (mongoose) => {
  const stressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stressLevel: { type: Number, required: true, min: 0, max: 100 },
    intensity: String,
    factors: {
      posture: { score: Number, description: String },
      facial: { score: Number, description: String },
      movement: { score: Number, description: String },
      consistency: { score: Number, description: String }
    },
    recommendations: [String],
    detectionData: Object,
    timestamp: { type: Date, default: Date.now },
    duration: Number // seconds of analysis
  });

  StressAnalysis = mongoose.model('StressAnalysis', stressSchema);
  return StressAnalysis;
};

// Analyze stress from detection data (video frame analysis)
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { detectionData, duration } = req.body;

    if (!detectionData) {
      return res.status(400).json({ error: 'Detection data is required' });
    }

    // Analyze the detection data
    const analysis = analyzeStressFromVideo(detectionData);

    // Save to database
    const stressRecord = new StressAnalysis({
      userId: req.user.id,
      stressLevel: analysis.stressLevel,
      intensity: analysis.intensity,
      factors: analysis.factors,
      recommendations: analysis.recommendations,
      detectionData,
      duration: duration || 0
    });

    await stressRecord.save();

    res.json({
      success: true,
      analysis: {
        stressLevel: analysis.stressLevel,
        intensity: analysis.intensity,
        factors: analysis.factors,
        recommendations: analysis.recommendations
      },
      recordId: stressRecord._id
    });
  } catch (error) {
    console.error('Stress analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze stress' });
  }
});

// Get stress history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await StressAnalysis.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching stress history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get stress statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await StressAnalysis.find({
      userId: req.user.id,
      timestamp: { $gte: startDate }
    });

    const stats = {
      totalReadings: records.length,
      averageStress: records.length ? Math.round(records.reduce((sum, r) => sum + r.stressLevel, 0) / records.length) : 0,
      maxStress: records.length ? Math.max(...records.map(r => r.stressLevel)) : 0,
      minStress: records.length ? Math.min(...records.map(r => r.stressLevel)) : 0,
      distribution: {
        critical: records.filter(r => r.stressLevel >= 80).length,
        high: records.filter(r => r.stressLevel >= 60 && r.stressLevel < 80).length,
        moderate: records.filter(r => r.stressLevel >= 40 && r.stressLevel < 60).length,
        low: records.filter(r => r.stressLevel < 40).length
      },
      trend: calculateTrend(records)
    };

    res.json({
      success: true,
      period: `${days} days`,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

const calculateTrend = (records) => {
  if (records.length < 2) return 'insufficient_data';
  
  const sorted = records.sort((a, b) => a.timestamp - b.timestamp);
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);
  
  const avgFirst = firstHalf.reduce((sum, r) => sum + r.stressLevel, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, r) => sum + r.stressLevel, 0) / secondHalf.length;
  
  if (avgSecond > avgFirst + 5) return 'increasing';
  if (avgSecond < avgFirst - 5) return 'decreasing';
  return 'stable';
};

module.exports = {
  router,
  initializeStressModel
};
