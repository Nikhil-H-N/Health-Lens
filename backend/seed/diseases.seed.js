const path = require("path");
const mongoose = require("mongoose");

// 🔑 Explicit absolute path to .env
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const Disease = require("../models/Disease");

// DEBUG (temporary)
console.log("MONGODB_URI =", process.env.MONGODB_URI);


const diseases = [
  // 🔴 CHRONIC
  {
    name: "Diabetes",
    description: "A chronic condition that affects blood sugar regulation",
    symptoms: ["Frequent urination", "Increased thirst", "Fatigue"],
    riskFactors: ["Obesity", "Family history"],
    contagious: false,
    category: "Chronic"
  },
  {
    name: "Hypertension",
    description: "High blood pressure over a long period",
    symptoms: ["Headache", "Dizziness"],
    riskFactors: ["Stress", "High salt intake"],
    contagious: false,
    category: "Chronic"
  },
  {
    name: "Heart Disease",
    description: "Disorders of the heart and blood vessels",
    symptoms: ["Chest pain", "Shortness of breath"],
    riskFactors: ["Smoking", "High cholesterol"],
    contagious: false,
    category: "Chronic"
  },
  {
    name: "Obesity",
    description: "Excess body fat that increases health risk",
    symptoms: ["Weight gain", "Breathlessness"],
    riskFactors: ["Sedentary lifestyle"],
    contagious: false,
    category: "Chronic"
  },

  // 🟡 ACUTE
  {
    name: "Viral Fever",
    description: "Short-term viral infection causing fever",
    symptoms: ["Fever", "Body pain", "Fatigue"],
    riskFactors: ["Weak immunity"],
    contagious: true,
    category: "Acute"
  },
  {
    name: "Common Cold",
    description: "Viral respiratory infection",
    symptoms: ["Sneezing", "Runny nose"],
    riskFactors: ["Cold weather"],
    contagious: true,
    category: "Acute"
  },
  {
    name: "Food Poisoning",
    description: "Illness caused by contaminated food",
    symptoms: ["Vomiting", "Diarrhea"],
    riskFactors: ["Unhygienic food"],
    contagious: false,
    category: "Acute"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Disease.deleteMany();
    await Disease.insertMany(diseases);
    console.log("✅ Diseases seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
