const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true }, // store hashed password
  age:       { type: Number },
  gender:    { type: String, enum: ['Male', 'Female', 'Other'] },
  role:      { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;