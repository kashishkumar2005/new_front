// server.js - SkillPulse Backend API
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ROOT HEALTH CHECK ROUTE (ADD THIS)
app.get('/', (req, res) => {
  res.status(200).send('SkillPulse Backend API is running 🚀');
});


// MongoDB Atlas Connection with better error handling
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    console.error('💡 Make sure your MongoDB Atlas connection string is correct');
    console.error('💡 Check that your IP is whitelisted in MongoDB Atlas Network Access');
    console.error('💡 Verify your database user credentials');
    process.exit(1);
  });

// Connection event handlers
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Atlas disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB Atlas reconnected');
});

// ========== SCHEMAS ==========

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'mentor'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Check-in History Schema
const checkInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  timestamp: { type: Number, required: true },
  score: { type: Number, required: true },
  focus: { type: Number, required: true },
  motivation: { type: Number, required: true },
  stress: { type: Number, required: true },
  studyHours: { type: Number, required: true },
  sleep: { type: Number, required: true },
  breaks: { type: String, required: true }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: Number, required: true },
  mentorName: { type: String, required: true },
  date: { type: String, required: true },
  iso: { type: String, required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Student Report Schema
const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  mentorName: { type: String, required: true },
  sessionDate: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  helpfulness: { type: Number, required: true, min: 1, max: 5 },
  clarity: { type: Number, required: true, min: 1, max: 5 },
  wouldRecommend: { type: Boolean, required: true },
  feedback: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Settings Schema
const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  darkMode: { type: Boolean, default: false },
  soundEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const CheckIn = mongoose.model('CheckIn', checkInSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Report = mongoose.model('Report', reportSchema);
const Settings = mongoose.model('Settings', settingsSchema);

// ========== MIDDLEWARE ==========

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'skillpulse-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ========== AUTH ROUTES ==========

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['student', 'mentor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'skillpulse-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'skillpulse-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ========== CHECK-IN ROUTES ==========

// Create Check-In
app.post('/api/checkins', authenticateToken, async (req, res) => {
  try {
    const checkInData = {
      userId: req.user.userId,
      ...req.body
    };

    const checkIn = new CheckIn(checkInData);
    await checkIn.save();

    res.status(201).json({
      message: 'Check-in saved successfully',
      checkIn
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Error saving check-in' });
  }
});

// Get User Check-Ins (last 7 or all)
app.get('/api/checkins', authenticateToken, async (req, res) => {
  try {
    const { limit = 7 } = req.query;
    
    const checkIns = await CheckIn.find({ userId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ checkIns: checkIns.reverse() });
  } catch (error) {
    console.error('Fetch check-ins error:', error);
    res.status(500).json({ error: 'Error fetching check-ins' });
  }
});

// Get Check-In Stats
app.get('/api/checkins/stats', authenticateToken, async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ userId: req.user.userId });

    const stats = {
      total: checkIns.length,
      healthyDays: checkIns.filter(c => c.score <= 30).length,
      moderateDays: checkIns.filter(c => c.score > 30 && c.score <= 60).length,
      highRiskDays: checkIns.filter(c => c.score > 60).length,
      averageScore: checkIns.length > 0 
        ? Math.round(checkIns.reduce((sum, c) => sum + c.score, 0) / checkIns.length)
        : 0,
      averageFocus: checkIns.length > 0
        ? Math.round(checkIns.reduce((sum, c) => sum + c.focus, 0) / checkIns.length)
        : 0,
      averageStress: checkIns.length > 0
        ? Math.round(checkIns.reduce((sum, c) => sum + c.stress, 0) / checkIns.length)
        : 0,
      averageSleep: checkIns.length > 0
        ? Math.round(checkIns.reduce((sum, c) => sum + c.sleep, 0) / checkIns.length)
        : 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Error calculating stats' });
  }
});

// ========== BOOKING ROUTES ==========

// Create Booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookingData = {
      userId: req.user.userId,
      ...req.body
    };

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Error creating booking' });
  }
});

// Get User Bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      userId: req.user.userId,
      status: { $ne: 'cancelled' }
    }).sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Cancel Booking
app.patch('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Error cancelling booking' });
  }
});

// ========== REPORT ROUTES ==========

// Submit Student Report
app.post('/api/reports', authenticateToken, async (req, res) => {
  try {
    const reportData = {
      userId: req.user.userId,
      ...req.body
    };

    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: 'Error submitting report' });
  }
});

// Get User Reports
app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
});

// Get All Reports (Mentor View)
app.get('/api/reports/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reports = await Report.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    console.error('Fetch all reports error:', error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
});

// ========== SETTINGS ROUTES ==========

// Get User Settings
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.userId });

    if (!settings) {
      settings = new Settings({ userId: req.user.userId });
      await settings.save();
    }

    res.json({ settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ error: 'Error fetching settings' });
  }
});

// Update User Settings
app.patch('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { darkMode, soundEnabled } = req.body;

    let settings = await Settings.findOne({ userId: req.user.userId });

    if (!settings) {
      settings = new Settings({ userId: req.user.userId });
    }

    if (darkMode !== undefined) settings.darkMode = darkMode;
    if (soundEnabled !== undefined) settings.soundEnabled = soundEnabled;
    settings.updatedAt = Date.now();

    await settings.save();

    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Error updating settings' });
  }
});

// ========== ANALYTICS ROUTES ==========

// Get Dashboard Analytics (Mentor)
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalBookings = await Booking.countDocuments();
    const totalReports = await Report.countDocuments();
    const avgRating = await Report.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const recentReports = await Report.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(5);

    const analytics = {
      totalStudents,
      totalBookings,
      totalReports,
      averageRating: avgRating.length > 0 ? avgRating[0].avgRating.toFixed(1) : 0,
      recentReports
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// ========== STRESS DETECTION ROUTES ==========

// Import stress detection routes
const { router: stressRouter, initializeStressModel } = require('./src/stress-routes');

// Initialize stress model
const StressAnalysis = initializeStressModel(mongoose);

// Use stress routes
app.use('/api/stress', stressRouter);

// ========== SERVER ==========

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SkillPulse API running on port ${PORT}`);
});