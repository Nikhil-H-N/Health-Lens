const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  date:        { type: Date, default: Date.now },
  // Example of embedded health metrics
  metrics: {
    bloodPressure: {
      systolic:  Number,
      diastolic: Number
    },
    heartRate: Number,
    notes:     String
  },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;