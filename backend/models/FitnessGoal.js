const mongoose = require('mongoose');

const FitnessGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  targetMinutes: {
    type: Number,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },

  // ✅ ADD THIS
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FitnessGoal', FitnessGoalSchema);
