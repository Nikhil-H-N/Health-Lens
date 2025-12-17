const express = require("express");
const router = express.Router();
const FitnessGoal = require("../models/FitnessGoal");
const auth = require("../middleware/authMiddleware");

// Set or update fitness goal
router.post("/goal", auth, async (req, res) => {
  try {
    const payload = { ...req.body, user_id: req.user.id };
    const goal = await FitnessGoal.findOneAndUpdate(
      { user_id: req.user.id },
      payload,
      { upsert: true, new: true }
    );
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get fitness goal
router.get("/goal", auth, async (req, res) => {
  try {
    const goal = await FitnessGoal.findOne({ user_id: req.user.id });
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
