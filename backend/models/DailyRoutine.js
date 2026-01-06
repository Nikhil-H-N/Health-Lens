const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyRoutineSchema = new Schema({
userId: { type: Schema.Types.ObjectId, ref: 'User' },
date: Date,
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
