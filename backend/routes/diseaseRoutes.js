const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Disease = require("../models/Disease");
const UserDisease = require("../models/UserDisease");

/* =====================================================
   📄 LIST DISEASES BY TYPE (Acute / Chronic)
   GET /api/diseases/list/:type
   ===================================================== */
router.get("/list/:type", auth, async (req, res) => {
  try {
    const { type } = req.params; // Acute or Chronic

    const diseases = await Disease.find({
      category: type
    });

    res.json(diseases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch diseases" });
  }
});

/* =====================================================
   ➕ TRACK DISEASE FOR USER
   POST /api/diseases/track
   ===================================================== */
router.post("/track", auth, async (req, res) => {
  try {
    const { diseaseId, diagnosedDate, diseaseType } = req.body;

    if (!diseaseId || !diagnosedDate || !diseaseType) {
      return res.status(400).json({
        error: "Disease, disease type, and date are required"
      });
    }

    const disease = await Disease.findById(diseaseId);
    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }

    const userDisease = new UserDisease({
      userId: req.user.id,
      diseaseId,
      diagnosedDate,
      diseaseType,
      aiReason: [`User selected ${diseaseType} disease`]
    });

    await userDisease.save();

    res.json({
      message: "Disease tracked successfully",
      disease: disease.name,
      type: diseaseType
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to track disease" });
  }
});

/* =====================================================
   📄 GET USER TRACKED DISEASES
   GET /api/diseases
   ===================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const diseases = await UserDisease.find({
      userId: req.user.id
    }).populate("diseaseId");

    res.json(diseases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user diseases" });
  }
});
// ❌ RESOLVE (REMOVE) USER DISEASE
router.delete("/:id", auth, async (req, res) => {
  try {
    const disease = await UserDisease.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!disease) {
      return res.status(404).json({ error: "Disease not found" });
    }

    res.json({ message: "Disease resolved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resolve disease" });
  }
});



module.exports = router;
