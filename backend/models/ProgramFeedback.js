const mentorshipDB = require("../config/mentorshipDB");
const mongoose = require("mongoose");

const ProgramFeedbackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phaseId: {
      type: Number,
      required: true,
      index: true,
    },
    role: { 
      type: String, 
      required: true 
    },
    programOrganization: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5 
    },
    matchingProcess: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5 
    },
    supportProvided: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5 
    },
    overallSatisfaction: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5 
    },
    generalFeedback: { 
      type: String,
      default: "",
      trim: true 
    },
    suggestions: { 
      type: String,
      default: "",
      trim: true 
    },
    participateAgain: { 
      type: String, 
      required: true,
      enum: ["Yes", "Maybe", "No"]
    },
  },
  { timestamps: true }
);

// Create compound index for better query performance
ProgramFeedbackSchema.index({ phaseId: 1, createdAt: -1 });
ProgramFeedbackSchema.index({ user_id: 1, phaseId: 1 });

module.exports = mentorshipDB.model("ProgramFeedback", ProgramFeedbackSchema);