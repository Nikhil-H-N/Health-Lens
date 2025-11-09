// db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Modern connection syntax — no deprecated options needed
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB Atlas connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;
