const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const FitnessGoal = require("../models/FitnessGoal");
const FitnessActivity = require("../models/FitnessActivity");
const FoodLog = require("../models/FoodLog");
const MeditationLog = require("../models/MeditationLog");


// 🏃 SAVE FITNESS GOAL
router.post("/goal", authMiddleware, async (req, res) => {
  try {
    const { goal, targetMinutes, endDate} = req.body;

    await FitnessGoal.deleteMany({ userId: req.user.id });

    // 🔥 RESET ACTIVITIES WHEN NEW GOAL IS SET
    await FitnessActivity.deleteMany({ userId: req.user.id });


    const newGoal = new FitnessGoal({
      userId: req.user.id || req.user._id || req.user.userId,
      goal,
      targetMinutes,
      endDate,
      status: "active"
    });

    await newGoal.save();
    res.json(newGoal);
  } catch (err) {
    res.status(500).json({ message: "Error saving goal" });
  }
});


// 🏃 GET FITNESS GOAL
router.get("/goal", authMiddleware, async (req, res) => {
  try {
    const goal = await FitnessGoal.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Error fetching goal" });
  }
});


// 🏋️ LOG FITNESS ACTIVITY
router.post("/activity", authMiddleware, async (req, res) => {
  try {
    const { activity, duration, caloriesBurned } = req.body;

    const newActivity = new FitnessActivity({
      userId: req.user.id,
      activity,
      duration,
      caloriesBurned,
    });

    await newActivity.save();

    // 🔍 Get active goal
    const goal = await FitnessGoal.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (goal && goal.status !== "completed") {
      const start = new Date();
      start.setDate(start.getDate() - 7);

      const activities = await FitnessActivity.find({
        userId: req.user.id,
        date: { $gte: start }
      });

      const totalMinutes = activities.reduce(
        (sum, a) => sum + a.duration,
        0
      );

      // 🎯 Mark goal completed
      if (totalMinutes >= goal.targetMinutes) {
        goal.status = "completed";
        await goal.save();
      }
    }

    res.json(newActivity);

  } catch (err) {
    res.status(500).json({ message: "Error logging activity" });
  }
});


// 🏋️ GET WEEKLY FITNESS ACTIVITY
router.get("/activities/week", authMiddleware, async (req, res) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const activities = await FitnessActivity.find({
      userId: req.user.id,
      date: { $gte: start },
    });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Error fetching activities" });
  }
});


// 🍎 LOG FOOD
router.post("/nutrition/log", authMiddleware, async (req, res) => {
  try {
    const { category, items } = req.body;

    const foodLog = new FoodLog({
      userId: req.user.id,
      category,
      items,
    });

    await foodLog.save();
    res.json(foodLog);
  } catch (err) {
    res.status(500).json({ message: "Error logging food" });
  }
});


// 🍎 GET TODAY'S FOOD LOGS
router.get("/nutrition/logs/today", authMiddleware, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const logs = await FoodLog.find({
      userId: req.user.id,
      date: { $gte: start },
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching food logs" });
  }
});


// 🧘 LOG MEDITATION
router.post("/meditation/log", authMiddleware, async (req, res) => {
  try {
    const { type, duration } = req.body;

    const meditation = new MeditationLog({
      userId: req.user.id,
      type,
      duration,
    });

    await meditation.save();
    res.json(meditation);
  } catch (err) {
    res.status(500).json({ message: "Error logging meditation" });
  }
});


// 🧘 GET MEDITATION STREAK
router.get("/meditation/streak", authMiddleware, async (req, res) => {
  try {
    const logs = await MeditationLog.find({ userId: req.user.id })
      .sort({ date: -1 });

    let streak = 0;
    let lastDate = null;

    for (let log of logs) {
      const logDate = log.date.toDateString();

      if (!lastDate) {
        streak++;
        lastDate = logDate;
      } else {
        const diff =
          (new Date(lastDate) - new Date(logDate)) /
          (1000 * 60 * 60 * 24);

        if (diff === 1) {
          streak++;
          lastDate = logDate;
        } else {
          break;
        }
      }
    }

    res.json({ streak });
  } catch (err) {
    res.status(500).json({ message: "Error calculating streak" });
  }
});

// 📊 GET FITNESS PROGRESS (WEEKLY)
router.get("/progress", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Get latest goal
    const goal = await FitnessGoal.findOne({ userId }).sort({ createdAt: -1 });
    if (!goal) {
      return res.json({ progress: 0, totalMinutes: 0 });
    }

    // 2️⃣ Get last 7 days activities
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const activities = await FitnessActivity.find({
      userId,
      date: { $gte: start },
    });

    // 3️⃣ Sum duration
    const totalMinutes = activities.reduce(
      (sum, a) => sum + a.duration,
      0
    );

    // 4️⃣ Calculate progress
    const progress = Math.min(
      100,
      Math.round((totalMinutes / goal.targetMinutes) * 100)
    );

    res.json({
      goal: goal.goal,
      targetMinutes: goal.targetMinutes,
      totalMinutes,
      progress,
    });
  } catch (err) {
    res.status(500).json({ message: "Error calculating progress" });
  }
});


module.exports = router;
