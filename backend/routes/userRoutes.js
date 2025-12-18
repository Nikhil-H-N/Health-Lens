const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

// Storage for mood photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/avatars";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + "-" + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Only JPG/PNG images allowed"));
  }
});

// Upload mood photo for a specific mood key
router.post("/mood-photo/:moodKey", auth, upload.single("image"), async (req, res) => {
  try {
    const { moodKey } = req.params;
    const allowedKeys = ["very_low", "medium", "high", "very_high"];
    if (!allowedKeys.includes(moodKey)) {
      return res.status(400).json({ error: "Invalid mood key" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.moodPhotos = user.moodPhotos || {};
    user.moodPhotos[moodKey] = imageUrl;
    await user.save();

    res.json({ success: true, moodPhotos: user.moodPhotos });
  } catch (err) {
    console.error("Mood photo upload error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
