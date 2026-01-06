const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['info', 'warning', 'alert'], default: 'info' },
  date:    { type: Date, default: Date.now },
  read:    { type: Boolean, default: false }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;