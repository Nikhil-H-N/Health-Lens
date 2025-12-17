const mongoose = require("mongoose");

const ClinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactNumber: {
      type: String,
      match: /^[0-9\-+()\s]{7,15}$/,
      required: true,
    },
    type: { type: String, default: "Clinic" },

    // GeoJSON format for location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Optional enhancements
    services: [String], // e.g., ["Dental", "Pediatrics"]
    rating: { type: Number, min: 0, max: 5 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Enable geospatial queries
ClinicSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Clinic", ClinicSchema);
