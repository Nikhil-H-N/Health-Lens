const express = require('express');
const connectDB = require('./db');
require('dotenv').config();

const app = express();

// Connect to MongoDB Atlas
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Health Lens API Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
