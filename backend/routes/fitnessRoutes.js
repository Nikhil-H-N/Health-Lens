const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const FoodLog = require("../models/FoodLog");
const FitnessGoal = require("../models/FitnessGoal");
const FitnessActivity = require("../models/FitnessActivity");
const CalorieTarget = require("../models/CaloriesTarget");

const MeditationLog = require("../models/MeditationLog");
// 🎯 SAVE CALORIE TARGET
router.post("/nutrition/target", authMiddleware, async (req, res) => {
  try {
    const { targetCalories } = req.body;

    const target = await CalorieTarget.findOneAndUpdate(
      { userId: req.user.id },
      { targetCalories },
      { upsert: true, new: true }
    );

    res.json(target);
  } catch (err) {
    res.status(500).json({ message: "Failed to save calorie target" });
  }
});
// 🎯 GET CALORIE TARGET
router.get("/nutrition/target", authMiddleware, async (req, res) => {
  try {
    const target = await CalorieTarget.findOne({ userId: req.user.id });
    res.json(target || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch calorie target" });
  }
});

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
      date: new Date(
        new Date().toLocaleDateString("en-CA") // YYYY-MM-DD
      )
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
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const log = await FoodLog.findOneAndUpdate(
      {
        userId: req.user.id,
        date: { $gte: start }
      },
      {
        category: "Mixed",
        items: req.body.items,
        date: new Date(new Date().toLocaleDateString("en-CA"))
      },
      { upsert: true, new: true }
    );

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: "Error saving food log" });
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
// ❌ DELETE TODAY'S FOOD LOG (for edit)
router.delete("/nutrition/logs/today", authMiddleware, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    await FoodLog.deleteMany({
      userId: req.user.id,
      date: { $gte: start }
    });

    res.json({ message: "Today's food log cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete food logs" });
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
// 🧘 GET TODAY'S MEDITATIONS
router.get("/meditation/today", authMiddleware, async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const logs = await MeditationLog.find({
    userId: req.user.id,
    date: { $gte: start }
  });

  res.json(logs);
});

// 🧘 GET YESTERDAY'S MEDITATIONS
router.get("/meditation/yesterday", authMiddleware, async (req, res) => {
  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const logs = await MeditationLog.find({
    userId: req.user.id,
    date: { $gte: start, $lte: end }
  });

  res.json(logs);
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

    // Month range
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    /* ───── WORKOUTS ───── */
    const activities = await FitnessActivity.find({
      userId,
      date: { $gte: start, $lt: end }
    });

    /* ───── FOOD LOGS ───── */
    const foodLogs = await FoodLog.find({
      userId,
      date: { $gte: start, $lt: end }
    });
    /* ───── MEDITATIONS ───── */
    const meditations = await MeditationLog.find({
      userId,
      date: { $gte: start, $lt: end }
    });

    /* ───── AGGREGATE BY DAY ───── */
    const calendarData = {};

    // workouts
    activities.forEach(a => {
      const day = a.date.toISOString().split("T")[0];
      if (!calendarData[day]) {
        calendarData[day] = {
          workoutMinutes: 0,
          calories: 0,
          meditationMinutes: 0
        };
      }
      calendarData[day].workoutMinutes += a.duration;
    });

    // calories
    foodLogs.forEach(log => {
      const day = log.date.toISOString().split("T")[0];
      if (!calendarData[day]) {
        calendarData[day] = {
          workoutMinutes: 0,
          calories: 0,
          meditationMinutes: 0
        };
      }
      log.items.forEach(item => {
        calendarData[day].calories += Number(item.calories || 0);
      });
    });
    // meditation minutes
    meditations.forEach(m => {
      const day = m.date.toISOString().split("T")[0];
      if (!calendarData[day]) {
        calendarData[day] = {
          workoutMinutes: 0,
          calories: 0,
          meditationMinutes: 0
        };
      }
      calendarData[day].meditationMinutes += Number(m.duration || 0);
    });

    res.json(calendarData);

  } catch (err) {
    console.error("Calendar error", err);
    res.status(500).json({ error: "Failed to fetch calendar data" });
  }
});


// 📊 WEEKLY FITNESS STATS
router.get("/weekly-stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    /* ───────── THIS WEEK (Sunday → Saturday) ───────── */
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday
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
    }).select("goal completedAt targetMinutes");

    // ✅ Goals completed LAST WEEK (only most recent week)
    const completedLastWeek = await FitnessGoal.find({
      userId: req.user.id,
      status: "completed",
      completedAt: {
        $gte: startOfLastWeek,
        $lte: endOfLastWeek
      }
    }).select("goal completedAt targetMinutes");

    res.json({
      thisWeekCount: completedThisWeek.length,
      lastWeekCount: completedLastWeek.length,
      goalsCompletedThisWeek: completedThisWeek,
      goalsCompletedLastWeek: completedLastWeek
    });

  } catch (err) {
    console.error("❌ Weekly stats error:", err);
    res.status(500).json({ message: "Error fetching weekly stats" });
  }
});
// 🍎 GET YESTERDAY'S FOOD LOGS
router.get("/nutrition/logs/yesterday", authMiddleware, async (req, res) => {
  try {
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const logs = await FoodLog.find({
      userId: req.user.id,
      date: {
        $gte: startOfYesterday,
        $lte: endOfYesterday
      }
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching yesterday food logs" });
  }
});

// 🍎 GET MONTHLY NUTRITION LOGS (for calendar)
router.get("/nutrition/logs/month", authMiddleware, async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const logs = await FoodLog.find({
      userId: req.user.id,
      date: { $gte: start, $lt: end }
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly food logs" });
  }
});
router.get("/meditation/month", authMiddleware, async (req, res) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const logs = await MeditationLog.find({
    userId: req.user.id,
    date: { $gte: start, $lt: end }
  });

  res.json(logs);
});


module.exports = router;