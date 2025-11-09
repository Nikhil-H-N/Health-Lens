// models/UserClinic.js
const mongoose = require("mongoose");

// Define schema for mapping users <-> clinics
const UserClinicSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false, // true if user marked clinic as favorite
    },
    lastVisited: {
      type: Date, // record when user last visited the clinic
    },
    notes: {
      type: String, // optional remarks by the user
      trim: true,
    },
  },
  {
    timestamps: true, // auto adds createdAt & updatedAt
  }
);

// 🔍 Helpful indexes for performance
UserClinicSchema.index({ userId: 1 });
UserClinicSchema.index({ clinicId: 1 });
UserClinicSchema.index({ favorite: 1 });

// Export the model
module.exports = mongoose.model("UserClinic", UserClinicSchema);
