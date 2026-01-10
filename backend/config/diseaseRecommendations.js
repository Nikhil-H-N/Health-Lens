// Medical standard-based recommendations for different diseases
const diseaseRecommendations = {
  diabetes: {
    keywords: ['diabetes', 'sugar', 'diabetic', 'glucose'],
    tasks: [
      {
        id: 'steps',
        label: 'Daily walking (10,000 steps)',
        target: 10000,
        unit: 'steps',
        description: 'WHO recommends 10,000 steps/day for diabetes management'
      },
      {
        id: 'sugar_check',
        label: 'Check blood sugar (fasting & post-meal)',
        target: 2,
        unit: 'times',
        completed: false
      },
      {
        id: 'medication',
        label: 'Take diabetes medication',
        completed: false
      },
      {
        id: 'carb_limit',
        label: 'Limit carbohydrates to 45-60g per meal',
        target: 180,
        unit: 'grams/day',
        completed: false
      },
      {
        id: 'water',
        label: 'Drink water (2.5L)',
        target: 2500,
        unit: 'ml',
        completed: false
      }
    ]
  },

  hypertension: {
    keywords: ['hypertension', 'high blood pressure', 'bp', 'pressure'],
    tasks: [
      {
        id: 'bp_check',
        label: 'Check blood pressure (morning & evening)',
        target: 2,
        unit: 'times',
        completed: false
      },
      {
        id: 'sodium_limit',
        label: 'Limit sodium intake (<1500mg)',
        target: 1500,
        unit: 'mg',
        completed: false
      },
      {
        id: 'bp_med',
        label: 'Take BP medication',
        completed: false
      },
      {
        id: 'exercise',
        label: 'Moderate aerobic exercise (30 min)',
        target: 30,
        unit: 'minutes',
        completed: false
      }
    ]
  },

  heart_disease: {
    keywords: ['heart', 'cardiac', 'coronary', 'cvd', 'cardiovascular'],
    tasks: [
      {
        id: 'cardio',
        label: 'Light cardio exercise (30 min)',
        target: 30,
        unit: 'minutes',
        completed: false
      },
      {
        id: 'heart_med',
        label: 'Take heart medication',
        completed: false
      },
      {
        id: 'cholesterol_diet',
        label: 'Low cholesterol diet (<200mg)',
        target: 200,
        unit: 'mg',
        completed: false
      }
    ]
  },

  obesity: {
    keywords: ['obesity', 'overweight', 'weight loss', 'bmi'],
    tasks: [
      {
        id: 'calorie_deficit',
        label: 'Maintain calorie deficit (500 cal)',
        target: 500,
        unit: 'cal deficit',
        completed: false
      },
      {
        id: 'exercise',
        label: 'Physical activity (60 min)',
        target: 60,
        unit: 'minutes',
        completed: false
      },
      {
        id: 'water',
        label: 'Drink water (3L)',
        target: 3000,
        unit: 'ml',
        completed: false
      }
    ]
  },
  // 🔴 ACUTE DISEASE RECOMMENDATIONS
viral_fever: {
    keywords: ["viral fever", "fever"],
    tasks: [
      {
        id: "rest",
        label: "Take complete bed rest",
        completed: false
      },
      {
        id: "fluids",
        label: "Drink warm fluids frequently",
        completed: false
      },
      {
        id: "temperature",
        label: "Monitor body temperature",
        completed: false
      },
      {
        id: "medication",
        label: "Take fever medication if prescribed",
        completed: false
      }
    ]
  },

  common_cold: {
    keywords: ["common cold", "cold", "cough"],
    tasks: [
      {
        id: "rest",
        label: "Take adequate rest",
        completed: false
      },
      {
        id: "steam",
        label: "Steam inhalation",
        completed: false
      },
      {
        id: "fluids",
        label: "Drink warm fluids",
        completed: false
      }
    ]
  },

  food_poisoning: {
    keywords: ["food poisoning", "vomiting", "diarrhea"],
    tasks: [
      {
        id: "hydration",
        label: "Stay hydrated (ORS / fluids)",
        completed: false
      },
      {
        id: "light_food",
        label: "Eat light and bland food",
        completed: false
      },
      {
        id: "rest",
        label: "Take rest",
        completed: false
      }
    ]
  }

};

module.exports = diseaseRecommendations;
