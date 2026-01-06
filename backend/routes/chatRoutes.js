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


module.exports = router;
