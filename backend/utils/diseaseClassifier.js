const CHRONIC_DISEASES = [
  "diabetes",
  "hypertension",
  "asthma",
  "arthritis",
  "thyroid",
  "heart disease",
  "chronic kidney disease",
  "copd",
  "epilepsy",
  "pcos"
];

function classifyDisease({ diseaseName, diagnosedDate }) {
  const reasons = [];
  let type = "Acute";

  const today = new Date();
  const diffDays =
    (today - new Date(diagnosedDate)) / (1000 * 60 * 60 * 24);

  // Rule 1: Known chronic disease
  if (CHRONIC_DISEASES.includes(diseaseName.toLowerCase())) {
    type = "Chronic";
    reasons.push("Known long-term (chronic) disease");
  }

  // Rule 2: Duration >= 90 days
  if (diffDays >= 90) {
    type = "Chronic";
    reasons.push("Disease duration exceeds 3 months");
  }

  // Default acute reason
  if (type === "Acute") {
    reasons.push("Short-term illness");
  }

  return { type, reasons };
}

module.exports = classifyDisease;
