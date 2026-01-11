const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const auth = require("../middleware/authMiddleware");

// ✅ POST /api/reports/upload - Upload a new report
router.post("/upload", auth, async (req, res) => {
  try {
    const {
      type,
      date,
      values,
      suggestions,
      abnormalParameters,
      overallStatus
    } = req.body;

    if (!type || !date) {
      return res.status(400).json({ error: "Type and date are required" });
    }

    if ((type === "Blood" || type === "Urine") && !values) {
      return res.status(400).json({ error: "Values are required for lab reports" });
    }

    if (type === "Vaccination" && !req.body.fileUrl) {
      return res.status(400).json({ error: "Vaccination file is required" });
    }

    const newReport = new Report({
      userId: req.user.id,
      type,
      date,
      values: type === "Vaccination" ? {} : values,
      suggestions: type === "Vaccination" ? [] : suggestions,
      abnormalParameters: type === "Vaccination" ? [] : abnormalParameters,
      overallStatus,
      fileUrl: type === "Vaccination" ? req.body.fileUrl : null
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    console.error("Report upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /api/reports - Get all reports for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /api/reports/:id - Delete a specific report
router.delete("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found or unauthorized" });
    }

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

