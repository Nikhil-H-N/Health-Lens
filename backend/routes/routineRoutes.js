const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserDisease = require("../models/UserDisease");
const diseaseRecommendations = require("../config/diseaseRecommendations");
const DailyRoutineLog = require("../models/DailyRoutineLog");
const authMiddleware = require("../middleware/authMiddleware");

// Get user's daily routine (tasks based on diseases/goals)
router.get("/daily", authMiddleware, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const log = await DailyRoutineLog.findOne({
    userId: req.user.id,
    date: today
  });

  // 👇 THIS ensures fresh day
  const completedTaskIds = log ? log.completedTaskIds : [];
  try {
    const userDiseases = await UserDisease
      .find({ userId: req.user.id })
      .populate("diseaseId");

    let tasks = [];

    // 🧠 Disease routines
    userDiseases.forEach(ud => {
      const diseaseName = ud.diseaseId?.name?.toLowerCase();
      if (!diseaseName) return;

      Object.values(diseaseRecommendations).forEach(rec => {
        const matched = rec.keywords.some(k =>
          diseaseName.includes(k)
        );

        if (matched) {
          rec.tasks.forEach(task => {
            tasks.push({
              id: `${diseaseName}_${task.id}`,
              label: task.label,
              target: task.target || null,
              unit: task.unit || null,
              description: task.description || "",
            });
          });
        }
      });
    });

    // 🧹 remove duplicates
    tasks = tasks.filter(
      (t, i, arr) => i === arr.findIndex(x => x.id === t.id)
    );

    // 🌱 GENERAL routine (NO diseases)
    if (userDiseases.length === 0) {
      tasks = []; // 👈 important: frontend handles general UI
    }

    res.json({
      tasks,
      completedTaskIds: log?.completedTaskIds || [],
      hasDiseases: userDiseases.length > 0,
      date: today
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    let log = await DailyRoutineLog.findOne({ userId, date: today });

    if (!log) {
      log = new DailyRoutineLog({
        userId,
        date: today,
        completedTaskIds: []
      });
    }

    if (log.completedTaskIds.includes(taskId)) {
      // uncheck
      log.completedTaskIds = log.completedTaskIds.filter(
        id => id !== taskId
      );
    } else {
      // check
      log.completedTaskIds.push(taskId);
    }

    await log.save();
    res.json({ completedTaskIds: log.completedTaskIds });
  } catch (err) {
    res.status(500).json({ error: "Failed to update routine" });
  }
});


module.exports = router;
