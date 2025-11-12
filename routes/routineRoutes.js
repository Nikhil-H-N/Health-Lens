const express = require("express");
const router = express.Router();
const DailyRoutine = require("../models/DailyRoutine");
const HealthTip = require("../models/HealthTip");
const auth = require("../middleware/authMiddleware");

// Get user routines + general tips
router.get("/suggestions", auth, async (req, res) => {
  try {
    const routines = await DailyRoutine.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    const tips = await HealthTip.find().limit(50);
    res.json({ routines, tips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
