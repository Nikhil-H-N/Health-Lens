const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const FitnessGoal = require("../models/FitnessGoal");
const FitnessActivity = require("../models/FitnessActivity");
const FoodLog = require("../models/FoodLog");
const MeditationLog = require("../models/MeditationLog");

//SAVEFITNESS GOAL
router.post("/goal", authMiddleware, async (req, res) => {
  try {
    console.log("👉 CREATE GOAL BODY:", req.body);
    console.log("👉 USER:", req.user.id);
    await FitnessGoal.updateMany(
      { userId: req.user.id, status: "active" },
      { status: "completed" }
    );

    const goal = new FitnessGoal({
      userId: req.user.id,
      goal: req.body.goal,
      targetMinutes: req.body.targetMinutes,
      endDate: new Date(req.body.endDate),
      status: "active",
    });

    await goal.save();

    console.log("✅ SAVED GOAL:", goal);
    console.log("TYPE OF endDate:", typeof goal.endDate, goal.endDate);

    res.json(goal);
  } catch (err) {
    console.error("❌ GOAL CREATE ERROR:", err);
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
  console.log("REQ USER:", req.user);
  console.log("REQ BODY:", req.body);
  try {
    const { activity, duration, date } = req.body;
    if (!activity || !duration) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1️⃣ Save activity WITH DATE + CORRECT FIELD
    const newActivity = new FitnessActivity({
      userId: req.user.id,           // ✅ FIXED
      activity,
      duration,
      date: date ? new Date(date) : new Date(), // ✅ FIXED
    });

    await newActivity.save();

    // 🔥 UPDATE ACTIVE GOAL
    const goal = await FitnessGoal.findOne({
      userId: req.user.id,
      status: "active",
    });

    if (goal) {
      goal.completedMinutes += Number(duration);

      if (goal.completedMinutes >= goal.targetMinutes) {
        goal.status = "completed";
        goal.completedAt = new Date(); // ✅ ADD THIS
      }

      await goal.save();
    }
    res.json({
      activity: newActivity,
      goal
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging activity" });
  }
});
// 📅 GET FITNESS ACTIVITY HISTORY (FOR CALENDAR)
router.get("/activity/history", authMiddleware, async (req, res) => {
  try {
    const activities = await FitnessActivity.find({
      userId: req.user.id
    }).sort({ date: 1 }); // oldest → newest

    res.json(activities);
  } catch (err) {
    console.error("Activity history error:", err);
    res.status(500).json({ message: "Failed to fetch activity history" });
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
    const goal = await FitnessGoal.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!goal) {
      return res.json({
        progress: 0,
        completedMinutes: 0,
        targetMinutes: 0,
        status: "none",
      });
    }

    const completedMinutes = goal.completedMinutes || 0;

    const progress = Math.min(
      100,
      Math.round((completedMinutes / goal.targetMinutes) * 100)
    );

    res.json({
      goal: goal.goal,
      completedMinutes,
      targetMinutes: goal.targetMinutes,
      progress,
      status: goal.status,
    });

  } catch (err) {
    console.error("❌ PROGRESS ERROR:", err);
    res.status(500).json({ message: "Error calculating progress" });
  }
});


// 📅 GET MONTHLY WORKOUT CALENDAR
router.get("/calendar", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Current month range
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const activities = await FitnessActivity.find({
      userId,
      date: { $gte: start, $lt: end }
    });

    // Group by date (YYYY-MM-DD)
    const calendarData = {};

    activities.forEach(a => {
      const day = a.date.toISOString().split("T")[0];
      if (!calendarData[day]) {
        calendarData[day] = {
          totalMinutes: 0,
          workouts: 0
        };
      }
      calendarData[day].totalMinutes += a.duration;
      calendarData[day].workouts += 1;
    });

    res.json(calendarData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch calendar data" });
  }
});

// 📊 WEEKLY FITNESS STATS
router.get("/weekly-stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    /* ───────── THIS WEEK ───────── */
    // Monday of current week
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfThisWeek.setHours(0, 0, 0, 0);

    /* ───────── LAST WEEK ───────── */
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setMilliseconds(-1);


    // ✅ Goals completed THIS WEEK
    const completedThisWeek = await FitnessGoal.find({
      userId: req.user.id,
      status: "completed",
      completedAt: { $gte: startOfThisWeek }
    }).select("goal completedAt");

    // ✅ Goals completed LAST WEEK (only most recent week)
    const completedLastWeek = await FitnessGoal.find({
      userId: req.user.id,
      status: "completed",
      completedAt: {
        $gte: startOfLastWeek,
        $lte: endOfLastWeek
      }
    }).select("goal completedAt");

    res.json({
      workoutsThisWeek: completedThisWeek.length,
      goalsCompletedThisWeek: completedThisWeek,
      goalsCompletedLastWeek: completedLastWeek
    });

  } catch (err) {
    console.error("❌ Weekly stats error:", err);
    res.status(500).json({ message: "Error fetching weekly stats" });
  }
});

module.exports = router;
