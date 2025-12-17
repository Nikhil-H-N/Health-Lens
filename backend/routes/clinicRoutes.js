const express = require("express");
const router = express.Router();
const Clinic = require("../models/Clinic");

// Add a new clinic
router.post("/add", async (req, res) => {
  try {
    const { name, address, contactNumber, type, latitude, longitude, services, rating } = req.body;

    const clinic = new Clinic({
      name,
      address,
      contactNumber,
      type,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON expects [lng, lat]
      },
      services,
      rating,
    });

    await clinic.save();
    res.status(201).json(clinic);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

