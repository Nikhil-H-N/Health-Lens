const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const healthTipSchema = new Schema({
  title:         { type: String, required: true },
  content:       { type: String },
  tags:          [String],
  datePublished: { type: Date, default: Date.now }
});

const HealthTip = mongoose.model('HealthTip', healthTipSchema);
module.exports = HealthTip;