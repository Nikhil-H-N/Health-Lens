const mongoose = require("mongoose");

const DailyRoutineLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  date: {
    type: String, // YYYY-MM-DD
    required: true
  },

  completedTaskIds: {
    type: [String],
    default: []
  }
});

// 🔴 THIS LINE FIXES DAILY RESET
DailyRoutineLogSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("DailyRoutineLog", DailyRoutineLogSchema);
