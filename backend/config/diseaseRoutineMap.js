// backend/config/diseaseRoutineMap.js

const diseaseRoutineMap = {
  Diabetes: {
    type: "Chronic",
    tasks: [
      { id: "sugar_check", label: "Check blood sugar levels" },
      { id: "diabetic_diet", label: "Follow diabetic-friendly diet" },
      { id: "walk", label: "30 minutes brisk walk" },
      { id: "medication", label: "Take diabetes medication on time" },
      { id: "water", label: "Drink enough water (2–3L)" }
    ]
  },

  "High Blood Pressure": {
    type: "Chronic",
    tasks: [
      { id: "bp_check", label: "Monitor blood pressure" },
      { id: "low_salt", label: "Follow low-salt diet" },
      { id: "yoga", label: "Practice light yoga / breathing" },
      { id: "medication", label: "Take BP medication" }
    ]
  },

  Asthma: {
    type: "Chronic",
    tasks: [
      { id: "inhaler", label: "Carry and use inhaler if needed" },
      { id: "breathing", label: "Practice breathing exercises" },
      { id: "avoid_triggers", label: "Avoid dust, smoke, cold air" }
    ]
  },

  Fever: {
    type: "Acute",
    tasks: [
      { id: "rest", label: "Take proper rest" },
      { id: "fluids", label: "Drink warm fluids frequently" },
      { id: "temperature", label: "Monitor body temperature" },
      { id: "medication", label: "Take fever medication if prescribed" }
    ]
  }
};

module.exports = diseaseRoutineMap;
