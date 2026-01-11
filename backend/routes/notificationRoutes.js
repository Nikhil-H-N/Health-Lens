const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

/* ==================================================
   🔔 CREATE NOTIFICATION (internal / system use)
   ================================================== */
router.post("/create", auth, async (req, res) => {
  try {
    const { message, type } = req.body;

    const notification = new Notification({
      userId: req.user.id,
      message,
      type: type || "info"
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error("Notification create error:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

/* ==================================================
   📥 GET ALL USER NOTIFICATIONS (LATEST FIRST)
   ================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id
    }).sort({ date: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/* ==================================================
   ✅ MARK NOTIFICATION AS READ
   ================================================== */
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

module.exports = router;
