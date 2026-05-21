const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactInfo: { type: String, required: true, unique: true }, // Phone or Email
  password: { type: String, required: true },
  location: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  isRegistered: { type: Boolean, default: true } // false for auto-registered via file parsing
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
