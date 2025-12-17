const express = require("express");
const connectDB = require("./db");
require("dotenv").config();
const cors = require("cors");

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Import Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/fitness", require("./routes/fitnessRoutes"));
app.use("/api/vaccination", require("./routes/vaccinationRoutes"));
app.use("/api/disease", require("./routes/diseaseRoutes"));
app.use("/api/routine", require("./routes/routineRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/clinics", require("./routes/clinicRoutes"));
app.use("/api/ocr", require("./routes/ocrRoutes"));  // ← ADD THIS LINE


// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("Health Lens API Running");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));