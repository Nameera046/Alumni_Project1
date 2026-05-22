// controllers/phaseController.js
const Phase = require("../models/Phase");
const Mentee = require("../models/MenteeRequest");   // Assuming your mentee model
const Mentor = require("../models/MentorRegistration");   // Assuming your mentor model
const MentorMenteeAssignment = require("../models/MentorMenteeAssignment");
const MeetingSchedule = require("../models/MeetingSchedule");
const MeetingStatus = require("../models/MeetingStatus");
const ProgramFeedback = require("../models/ProgramFeedback");

// Get all phases
exports.getPhases = async (req, res) => {
  try {
    const phases = await Phase.find().sort({ phaseId: 1 });
    res.json({ success: true, phases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get mentor count by phaseId
exports.getMentorCount = async (req, res) => {
  try {
    const phaseId = Number(req.query.phaseId);
    const count = await Mentor.countDocuments({ phaseId });
    res.json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get mentee count by phaseId
exports.getMenteeCount = async (req, res) => {
  try {
    const phaseId = Number(req.query.phaseId);
    const count = await Mentee.countDocuments({ phaseId });
    res.json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new phase
exports.createPhase = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check overlapping dates
    const overlapping = await Phase.findOne({
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ success: false, message: "Phase dates overlap with existing phase" });
    }

    // Generate next phaseId
    const lastPhase = await Phase.findOne().sort({ phaseId: -1 });
    const nextPhaseId = lastPhase ? lastPhase.phaseId + 1 : 1;

    const phase = new Phase({
      phaseId: nextPhaseId,
      name,
      startDate,
      endDate
    });

    await phase.save();
    res.status(201).json({ success: true, phase });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ UPDATE PHASE (EDIT)
exports.updatePhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Find the phase to update
    const phase = await Phase.findOne({ phaseId: parseInt(phaseId) });
    
    if (!phase) {
      return res.status(404).json({ success: false, message: "Phase not found" });
    }

    // Check for overlapping dates with OTHER phases (excluding current phase)
    const overlapping = await Phase.findOne({
      phaseId: { $ne: parseInt(phaseId) },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ 
        success: false, 
        message: "Phase dates overlap with existing phase" 
      });
    }

    // Update phase
    phase.name = name;
    phase.startDate = startDate;
    phase.endDate = endDate;
    phase.updatedAt = Date.now();

    await phase.save();

    res.json({ 
      success: true, 
      phase,
      message: "Phase updated successfully" 
    });

  } catch (err) {
    console.error("Error updating phase:", err);
    res.status(500).json({ success: false, message: "Server error updating phase" });
  }
};

// ✅ DELETE PHASE
exports.deletePhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const phaseIdNum = parseInt(phaseId);

    // Find the phase
    const phase = await Phase.findOne({ phaseId: phaseIdNum });
    
    if (!phase) {
      return res.status(404).json({ success: false, message: "Phase not found" });
    }

    console.log(`🗑️ Deleting phase ${phaseIdNum}: ${phase.name}`);

    // Delete all mentees in this phase
    const menteesDeleted = await Mentee.deleteMany({ phaseId: phaseIdNum });

    // Find all mentors in this phase to get their IDs
    const mentors = await Mentor.find({ phaseId: phaseIdNum });
    const mentorIds = mentors.map(m => m.mentor_id);
    
    // Delete all mentors in this phase
    const mentorsDeleted = await Mentor.deleteMany({ phaseId: phaseIdNum });

    // Delete assignments where mentor is in this phase
    const assignmentsDeleted = await MentorMenteeAssignment.deleteMany({
      mentor_user_id: { $in: mentorIds }
    });

    // Find all meetings in this phase
    const meetings = await MeetingSchedule.find({ phaseId: phaseIdNum });
    const meetingIds = meetings.map(m => m._id);
    
    // Delete meeting statuses for these meetings
    const meetingStatusDeleted = await MeetingStatus.deleteMany({
      meeting_id: { $in: meetingIds }
    });
    
    // Delete the meetings themselves
    const meetingsDeleted = await MeetingSchedule.deleteMany({ phaseId: phaseIdNum });

    // Delete feedback for this phase
    const feedbackDeleted = await ProgramFeedback.deleteMany({ phaseId: phaseIdNum });

    // Finally, delete the phase itself
    await Phase.findOneAndDelete({ phaseId: phaseIdNum });

    res.json({ 
      success: true, 
      message: `Phase "${phase.name}" and all related data deleted successfully`,
      deletedCounts: {
        mentees: menteesDeleted.deletedCount,
        mentors: mentorsDeleted.deletedCount,
        assignments: assignmentsDeleted.deletedCount,
        meetings: meetingsDeleted.deletedCount,
        meetingStatuses: meetingStatusDeleted.deletedCount,
        feedback: feedbackDeleted.deletedCount
      }
    });

  } catch (err) {
    console.error("Error deleting phase:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error deleting phase",
      error: err.message 
    });
  }
};

// ✅ GET SINGLE PHASE BY ID (Optional - for edit form)
exports.getPhaseById = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const phase = await Phase.findOne({ phaseId: parseInt(phaseId) });
    
    if (!phase) {
      return res.status(404).json({ success: false, message: "Phase not found" });
    }
    
    res.json({ success: true, phase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};