const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VaccinationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vaccineName: {
    type: String,
    required: true
  },
  dateAdministered: {
    type: Date,
    required: true
  },
  nextDueDate: {
    type: Date,
    default: null
  },
  renewalCompleted: {
    type: Boolean,
    default: false
  },
  notes: { type: String },
  reportFile: {
    type: String,
    default: null
  }
});

const Vaccination = mongoose.model('Vaccination', VaccinationSchema);
module.exports = Vaccination;