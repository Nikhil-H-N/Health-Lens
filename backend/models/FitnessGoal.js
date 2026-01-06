const mongoose = require("mongoose");

const FitnessGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    completedMinutes: {
      type: Number,
      default: 0
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= new Date().setHours(0, 0, 0, 0);
        },
        message: "Target date cannot be in the past"
      }
    },
    completedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
    }
  },
  {
    timestamps: true   // ✅ THIS IS THE KEY FIX
  }
);

module.exports = mongoose.model("FitnessGoal", FitnessGoalSchema);
