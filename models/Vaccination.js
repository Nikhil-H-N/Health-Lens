const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vaccinationSchema = new Schema({
  user:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vaccineName:     { type: String, required: true },
  dateAdministered:{ type: Date, required: true },
  nextDueDate:     { type: Date },
  site:            { type: String }, // e.g., 'Left Arm'
  notes:           { type: String }
});

const Vaccination = mongoose.model('Vaccination', vaccinationSchema);
module.exports = Vaccination;