const express = require("express");
const router = express.Router();
const Clinic = require("../models/Clinic");
const auth = require("../middleware/authMiddleware");

// Return all clinics (or filtered by query)
router.get("/nearby", auth, async (req, res) => {
  try {
    // basic: return all clinics; frontend filters by distance or you can extend with geo queries
    const clinics = await Clinic.find().limit(200);
    res.json(clinics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add clinic (admin)
router.post("/add", async (req, res) => {
  try {
    const { name, address, latitude, longitude, contactNumber, type } = req.body;
    const c = new Clinic({ name, address, latitude, longitude, contactNumber, type });
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
