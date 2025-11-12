const express = require("express");
const router = express.Router();
const Disease = require("../models/Disease");
const UserDisease = require("../models/UserDisease");
const auth = require("../middleware/authMiddleware");

// Add user disease
router.post("/add", auth, async (req, res) => {
  try {
    const { diseaseId, type, diagnosedDate } = req.body;
    const ud = new UserDisease({ user_id: req.user.id, diseaseId, type, diagnosedDate });
    await ud.save();
    res.status(201).json(ud);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user diseases (with populated disease info)
router.get("/", auth, async (req, res) => {
  try {
    const list = await UserDisease.find({ user_id: req.user.id }).populate("diseaseId");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get master diseases (public list)
router.get("/master", async (req, res) => {
  try {
    const diseases = await Disease.find().sort({ name: 1 });
    res.json(diseases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
