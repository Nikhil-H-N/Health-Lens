const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: { type: String, required: true },   // Blood / Urine
    date: { type: Date, required: true },

    values: { type: Object, required: true }, // extracted values

    suggestions: [String],                     // warnings
  },
  { timestamps: true }
);



module.exports = mongoose.model("Report", ReportSchema);
