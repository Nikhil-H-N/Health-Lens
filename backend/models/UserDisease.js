const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Links a user to a disease (many-to-many relationship)
const userDiseaseSchema = new Schema({
  user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  disease:       { type: Schema.Types.ObjectId, ref: 'Disease', required: true },
  diagnosedDate: { type: Date, default: Date.now },
  severity:      { type: String, enum: ['Mild', 'Moderate', 'Severe'] },
  notes:         String
});

const UserDisease = mongoose.model('UserDisease', userDiseaseSchema);
module.exports = UserDisease;
