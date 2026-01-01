const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String, // Breakfast, Lunch, Dinner, Snacks, Drinks
    required: true
  },
  items: [
    {
      type: String
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FoodLog', FoodLogSchema);
