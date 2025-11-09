const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fitnessGoalSchema = new Schema({
  user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description:   { type: String },  // e.g., 'Run 5km daily'
  targetValue:   { type: Number },  // e.g., 5
  unit:          { type: String },  // e.g., 'km'
  startDate:     { type: Date, default: Date.now },
  endDate:       { type: Date },
  achieved:      { type: Boolean, default: false },
  achievedValue: { type: Number }
});

const FitnessGoal = mongoose.model('FitnessGoal', fitnessGoalSchema);
module.exports = FitnessGoal;