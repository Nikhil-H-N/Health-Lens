const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const auth = require("../middleware/authMiddleware");

// ✅ POST /api/reports/upload - Upload a new report
router.post("/upload", auth, async (req, res) => {
  try {
    const { type, date, values, suggestions } = req.body;

    if (!type || !date || !values) {
      return res.status(400).json({ error: "Type, date, and values are required" });
    }

    const newReport = new Report({
      user_id: req.user.id, // comes from verified token
      type,
      date,
      values,
      suggestions,
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
    const reports = await Report.find({ user_id: req.user.id }).sort({ date: -1 });
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
      user_id: req.user.id,
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

