const express = require("express");
const router = express.Router();
const ChatHistory = require("../models/ChatHistory");
const auth = require("../middleware/authMiddleware");

// Save chat messages (messages: [{sender, text, timestamp}])
router.post("/save", auth, async (req, res) => {
  try {
    const { messages } = req.body;
    let chat = await ChatHistory.findOne({ userId: req.user.id });
    if (!chat) {
      chat = new ChatHistory({ userId: req.user.id, messages });
    } else {
      chat.messages.push(...messages);
    }
    await chat.save();
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get chat history
router.get("/", auth, async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({ userId: req.user.id });
    res.json(chat || { messages: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
