const mongoose = require('mongoose');
const mentorshipDB = require("../config/mentorshipDB");

const feedbackSettingsSchema = new mongoose.Schema({
  phaseId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  enableFeedback: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true  // Automatically manages createdAt and updatedAt
});

module.exports = mentorshipDB.model('FeedbackSettings', feedbackSettingsSchema);