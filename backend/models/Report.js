const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    fileUrl: {
      type: String
    },
    values: { type: Object, required: true },

    suggestions: [String],
    abnormalParameters: [String],   // ✅ ADD
    overallStatus: String           // ✅ ADD
  },
  { timestamps: true }
);


module.exports = mongoose.model("Report", ReportSchema);
