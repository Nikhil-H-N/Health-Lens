const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // e.g. blood, urine, xray
    date: { type: Date, required: true },
    values: { type: Object, required: true }, // key-value report data (RBC, WBC, etc.)
    suggestions: [String], // optional health suggestions
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
