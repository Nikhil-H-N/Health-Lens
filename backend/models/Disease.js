const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const diseaseSchema = new Schema({
  name:        { type: String, required: true },
  description: { type: String },
  symptoms:    [String],
  riskFactors: [String],
  contagious:  { type: Boolean, default: false },
  category:    { type: String }  // e.g. 'Viral', 'Chronic', etc.
});

const Disease = mongoose.model('Disease', diseaseSchema);
module.exports = Disease;