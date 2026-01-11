const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // 🔹 Moved to profile (optional)
  age: {
    type: Number,
    min: 0
  },
  height: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  bmi: {
    type: Number
  },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  role: { type: String, default: 'user' },

  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
