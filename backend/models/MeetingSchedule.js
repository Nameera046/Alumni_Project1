// models/MeetingSchedule.js - WITHOUT pre-save middleware
const mongoose = require("mongoose");
const mentorshipDB = require("../config/mentorshipDB");

const MeetingScheduleSchema = new mongoose.Schema({
  mentor_user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  mentee_user_ids: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }],
  meeting_dates: [{
    date: { 
      type: Date, 
      required: true 
    },
    meeting_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      default: () => new mongoose.Types.ObjectId() 
    },
    meeting_time: { 
      type: String, 
      required: true 
    },
    duration_minutes: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled"
    },
    meeting_link: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    }
  }],
  platform: { 
    type: String, 
    required: true,
    enum: ["zoom", "google-meet", "teams", "whatsapp", "other"]
  },
  meeting_link: { 
    type: String,
    default: ""
  },
  agenda: { 
    type: String,
    default: ""
  },
  preferred_day: { 
    type: String, 
    enum: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] 
  },
  number_of_meetings: { 
    type: Number,
    default: 1
  },
  phaseId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "scheduled",
    enum: ["scheduled", "completed", "cancelled", "rescheduled", "partial"]
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// ✅ NO pre-save middleware - completely removed

module.exports = mentorshipDB.model("MeetingSchedule", MeetingScheduleSchema);