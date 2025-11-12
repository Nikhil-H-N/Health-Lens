const express = require("express");
const router = express.Router();
const Vaccination = require("../models/Vaccination");
const auth = require("../middleware/authMiddleware");

router.post("/add", auth, async (req, res) => {
  try {
    const { name, date, renewalDate } = req.body;
    const newVaccination = new Vaccination({
      user_id: req.user.id,
      name,
      date,
      renewalDate,
    });
    await newVaccination.save();
    res.status(201).json(newVaccination);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const vaccines = await Vaccination.find({ user_id: req.user.id });
    res.json(vaccines);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
