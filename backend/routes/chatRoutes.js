const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const askHealthAI = require("../utils/openai");

const ChatHistory = require("../models/ChatHistory");

router.post("/", auth, async (req, res) => {
  const { message } = req.body;

  const reply = await askHealthAI(message);

  await ChatHistory.findOneAndUpdate(
    { userId: req.user.id },
    {
      $push: {
        messages: [
          { sender: "user", text: message },
          { sender: "bot", text: reply }
        ]
      }
    },
    { upsert: true }
  );

  res.json({ response: reply });
});
router.get("/history", auth, async (req, res) => {
  try {
    const chat = await ChatHistory.findOne(
      { userId: req.user.id },
      { messages: { $slice: -50 } } // ✅ ONLY last 50 from DB
    );

    res.json({
      messages: chat?.messages || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});


module.exports = router;
