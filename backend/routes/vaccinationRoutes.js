const express = require("express");
const router = express.Router();
const Vaccination = require("../models/Vaccination");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/add",
  auth,
  upload.single("report"),   // ✅ optional file
  async (req, res) => {
    try {
      const { name, date, renewalDate } = req.body;

      const vaccination = new Vaccination({
        user: req.user.id,
        vaccineName: name,
        dateAdministered: date,
        nextDueDate: renewalDate || null,
        notes: req.body.notes || "",  
        reportFile: req.file ? req.file.path : null
      });

      await vaccination.save();
      res.status(201).json(vaccination);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const vaccines = await Vaccination.find({ user: req.user.id });
    res.json(vaccines);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router.delete("/:id", auth, async (req, res) => {
  try {
    const vaccination = await Vaccination.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!vaccination) {
      return res.status(404).json({ error: "Vaccination not found" });
    }

    // delete report file if exists
    if (vaccination.reportFile) {
      const fs = require("fs");
      if (fs.existsSync(vaccination.reportFile)) {
        fs.unlinkSync(vaccination.reportFile);
      }
    }

    await vaccination.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});
// ✅ MARK VACCINATION AS RENEWED
router.patch("/:id/renew", auth, async (req, res) => {
  try {
    const vaccination = await Vaccination.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        renewalCompleted: true
      },
      { new: true }
    );

    if (!vaccination) {
      return res.status(404).json({ message: "Vaccination not found" });
    }

    res.json(vaccination);
  } catch (err) {
    console.error("Renew vaccination error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
