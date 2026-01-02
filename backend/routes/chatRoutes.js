const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const askHealthAI = require("../utils/openai");

router.post("/", auth, async (req, res) => {
  try {
    console.log("🔥 Chat route hit");
    console.log("Message:", req.body.message);

    const reply = await askHealthAI(req.body.message);

    res.json({ response: reply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;
