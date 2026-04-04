const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Debug: confirm env is loaded (safe — no credentials leaked)
  if (!uri) {
    console.error('MONGO_URI is not defined. Check your .env file.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

