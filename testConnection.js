const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    process.exit();
  }
}

testConnection();
