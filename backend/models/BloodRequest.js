const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  bloodGroupRequired: { type: String, required: true },
  unitsRequired: { type: Number, required: true },
  hospitalName: { type: String, required: true },
  hospitalAddress: { type: String, required: true },
  pointOfContact: { type: String, required: true }, // Contact info of receiver
  priority: { type: String, enum: ['Emergency', 'High', 'Standard'], default: 'Standard' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Completed'], default: 'Pending' },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchingId: { type: String }, // Generated when accepted
  rawText: { type: String }, // Text extracted from document
  aiExtractedData: { type: mongoose.Schema.Types.Mixed }, // Raw JSON from AI
  extractedAt: { type: Date },
  uploadFileName: { type: String },
  uploadFileType: { type: String },
  locationCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
