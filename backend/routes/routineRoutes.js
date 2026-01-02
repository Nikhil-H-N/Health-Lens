const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const UserDisease = require("../models/UserDisease");
const diseaseRecommendations = require("../config/diseaseRecommendations");

// Get user's daily routine (tasks based on diseases/goals)
router.get("/daily", auth, async (req, res) => {
  try {
    const userDiseases = await UserDisease
      .find({ userId: req.user.id })
      .populate("diseaseId");


    let tasks = [];

    // Match diseases with medical recommendations
    // 🧠 AI-based disease routine
    userDiseases.forEach(d => {
      const name = d.diseaseId.name.toLowerCase();

      if (d.diseaseType === "Acute") {
        tasks.push(
          { id: `rest_${name}`, label: `Take proper rest for ${d.diseaseId.name}`, completed: false },
          { id: `med_${name}`, label: `Take medication for ${d.diseaseId.name}`, completed: false },
          { id: `water_${name}`, label: `Drink warm fluids`, completed: false }
        );
      }

      if (d.diseaseType === "Chronic") {
        tasks.push(
          { id: `monitor_${name}`, label: `Monitor ${d.diseaseId.name} symptoms`, completed: false },
          { id: `exercise_${name}`, label: `Light exercise / walk`, completed: false },
          { id: `diet_${name}`, label: `Follow recommended diet`, completed: false }
        );
      }
    });


    // Remove duplicates
    tasks = tasks.filter((task, index, self) =>
      index === self.findIndex(t => t.id === task.id)
    );

    // If no disease-specific tasks, add general wellness tasks
    if (tasks.length === 0) {
      tasks = [
        { id: 'water', label: 'Drink 2L water', target: 2000, unit: 'ml', completed: false },
        { id: 'exercise', label: 'Exercise 30 min', target: 30, unit: 'minutes', completed: false },
        { id: 'sleep', label: 'Sleep 7-8 hours', target: 8, unit: 'hours', completed: false },
        { id: 'fruits', label: 'Eat 2 servings of fruits', target: 2, unit: 'servings', completed: false }
      ];
    }

    // Load today's progress
    const today = new Date().toISOString().split('T')[0];
    const todayRoutine = user.dailyRoutines?.find(r => r.date === today);

    if (todayRoutine) {
      tasks.forEach(task => {
        const savedTask = todayRoutine.tasks.find(t => t.id === task.id);
        if (savedTask) {
          task.completed = savedTask.completed;
          task.value = savedTask.value;
        }
      });
    }

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;


    res.json({
      tasks,
      progress,
      date: new Date().toISOString().split("T")[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update task completion
router.post("/update", auth, async (req, res) => {
  try {
    const { taskId, completed, value } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const user = await User.findById(req.user.id);

    // Initialize dailyRoutines if not exists
    if (!user.dailyRoutines) user.dailyRoutines = [];

    // Find or create today's routine
    let todayRoutine = user.dailyRoutines.find(r => r.date === today);
    if (!todayRoutine) {
      todayRoutine = { date: today, tasks: [] };
      user.dailyRoutines.push(todayRoutine);
    }

    // Update or add task
    const taskIndex = todayRoutine.tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      todayRoutine.tasks[taskIndex] = { id: taskId, completed, value };
    } else {
      todayRoutine.tasks.push({ id: taskId, completed, value });
    }

    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
