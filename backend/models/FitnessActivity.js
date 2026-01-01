const mongoose = require('mongoose');

const FitnessActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  caloriesBurned: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FitnessActivity', FitnessActivitySchema);
