const mongoose = require("mongoose");

const CalorieTargetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  targetCalories: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("CalorieTarget", CalorieTargetSchema);
