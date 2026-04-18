const mentorshipDB = require("../config/mentorshipDB");
const mongoose = require("mongoose");

const MentorRegistrationSchema = new mongoose.Schema({
  mentor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  areas_of_interest: {
    type: [String],
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  phaseId: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'assigned'],
    default: 'pending'
  },

  assignedDate: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ NO pre-save middleware - DELETE THIS SECTION if it exists
// If you see anything like this, DELETE it:
// MentorRegistrationSchema.pre('save', function(next) { ... });

module.exports = mentorshipDB.models.MentorRegistration || 
  mentorshipDB.model("MentorRegistration", MentorRegistrationSchema);