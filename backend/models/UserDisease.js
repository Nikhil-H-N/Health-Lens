const mongoose = require("mongoose");

const userDiseaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  diseaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Disease",
    required: true
  },

  diagnosedDate: {
    type: Date,
    required: true
  },

  diseaseType: {
    type: String,
    enum: ["Acute", "Chronic"],
    required: true
  },

  aiReason: {
    type: [String]   // why AI marked it acute/chronic
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("UserDisease", userDiseaseSchema);
