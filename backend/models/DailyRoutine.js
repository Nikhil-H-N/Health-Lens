const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyRoutineSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },

  // use string date for easy comparison (YYYY-MM-DD)
  date: { type: String, required: true },

  // 🔹 Disease routine tasks (NEW)
  tasks: [
    {
      id: String,
      completed: Boolean,
      value: Number
    }
  ],

  // 🔹 Existing health tracking (KEEP)
  water_intake: Number,
  sleep_hours: Number,

  meals: [
    {
      name: String,
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number
    }
  ],

  exercises: [
    {
      name: String,
      duration: Number,
      calories_burned: Number
    }
  ]
});


module.exports = mongoose.model('DailyRoutine', dailyRoutineSchema);
