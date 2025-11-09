const mongoose = require("mongoose");

const ClinicSchema = new mongoose.Schema({
  name: String,
  address: String,
  latitude: Number,
  longitude: Number,
  contactNumber: String,
  type: { type: String, default: "Clinic" },
});

module.exports = mongoose.model("Clinic", ClinicSchema);
