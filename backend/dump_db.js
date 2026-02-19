require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('Connected to MongoDB');

    const userSchema = new mongoose.Schema({}, { strict: false });
    const checkInSchema = new mongoose.Schema({}, { strict: false });
    const bookingSchema = new mongoose.Schema({}, { strict: false });
    const reportSchema = new mongoose.Schema({}, { strict: false });
    const settingsSchema = new mongoose.Schema({}, { strict: false });

    const User = mongoose.model('User', userSchema);
    const CheckIn = mongoose.model('CheckIn', checkInSchema);
    const Booking = mongoose.model('Booking', bookingSchema);
    const Report = mongoose.model('Report', reportSchema);
    const Settings = mongoose.model('Settings', settingsSchema);

    const users = await User.find().lean();
    const checkins = await CheckIn.find().lean();
    const bookings = await Booking.find().lean();
    const reports = await Report.find().lean();
    const settings = await Settings.find().lean();

    console.log('\n=== USERS ===');
    console.log(JSON.stringify(users, null, 2));

    console.log('\n=== CHECKINS ===');
    console.log(JSON.stringify(checkins, null, 2));

    console.log('\n=== BOOKINGS ===');
    console.log(JSON.stringify(bookings, null, 2));

    console.log('\n=== REPORTS ===');
    console.log(JSON.stringify(reports, null, 2));

    console.log('\n=== SETTINGS ===');
    console.log(JSON.stringify(settings, null, 2));

    await mongoose.disconnect();
    console.log('\nDisconnected');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
