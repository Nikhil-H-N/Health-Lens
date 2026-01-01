const mongoose = require('mongoose');

const MeditationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String, // Breathing, Mindfulness, Sleep, etc.
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MeditationLog', MeditationLogSchema);
