// controllers/meetingController.js
const mongoose = require("mongoose"); 
const MeetingSchedule = require("../models/MeetingSchedule");
const MentorMenteeAssignment = require("../models/MentorMenteeAssignment");
const MeetingStatus = require("../models/MeetingStatus");
const User = require("../models/User");

// ----------------------------------------------
// GET mentor details + assigned mentees
// ----------------------------------------------
exports.getMentorDetails = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Mentor email required" });

    const mentor = await User.findOne({
      "basic.email_id": { $regex: new RegExp(`^${email.trim().toLowerCase()}$`, "i") }
    });

    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    const assignment = await MentorMenteeAssignment.findOne({ mentor_user_id: mentor._id });

    let assignedMentees = [];
    let commencement_date = null;
    let end_date = null;

    if (assignment) {
      commencement_date = assignment.commencement_date;
      end_date = assignment.end_date;

      assignedMentees = await User.find({
        _id: { $in: assignment.mentee_user_ids }
      }).select("basic.name basic.email_id");

      assignedMentees = assignedMentees.map(m => ({
        _id: m._id,
        name: m.basic?.name || "",
        email: m.basic?.email_id || ""
      }));
    }

    res.json({
      mentor: {
        _id: mentor._id,
        name: mentor.basic?.name || "",
        email: mentor.basic?.email_id || ""
      },
      commencement_date,
      end_date,
      assignedMentees
    });

  } catch (err) {
    console.error("GET MENTOR DETAILS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------
// SCHEDULE meeting for MULTIPLE mentees
// ----------------------------------------------
exports.scheduleMeeting = async (req, res) => {
  try {
    const {
      mentor_user_id,
      mentee_user_ids,
      meeting_dates,
      meeting_time,
      duration_minutes,
      platform,
      meeting_link,
      agenda,
      preferred_day,
      number_of_meetings,
      phaseId
    } = req.body;

    if (!phaseId) {
      return res.status(400).json({ message: "phaseId is required" });
    }

    const phaseIdNum = Number(phaseId);
    if (isNaN(phaseIdNum) || phaseIdNum <= 0) {
      return res.status(400).json({ message: "Invalid phaseId" });
    }

    if (
      !mentor_user_id ||
      !Array.isArray(mentee_user_ids) || mentee_user_ids.length === 0 ||
      !Array.isArray(meeting_dates) || meeting_dates.length === 0 ||
      !meeting_time ||
      !duration_minutes ||
      !platform
    ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const validDates = meeting_dates.every(date => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    });
    
    if (!validDates) {
      return res.status(400).json({ message: "Invalid date format in meeting_dates" });
    }

    // ✅ Map each date to an object with unique meeting_id, meeting_time, and duration_minutes
    const meetingDatesWithDetails = meeting_dates.map(d => ({
      date: new Date(d),
      meeting_id: new mongoose.Types.ObjectId(),
      meeting_time: meeting_time,
      duration_minutes: duration_minutes,
      status: "scheduled",
      meeting_link: meeting_link || "",
      notes: ""
    }));

    const newMeeting = new MeetingSchedule({
      mentor_user_id,
      mentee_user_ids,
      meeting_dates: meetingDatesWithDetails,
      platform,
      meeting_link: meeting_link || null,
      agenda: agenda || null,
      preferred_day: preferred_day || null,
      number_of_meetings: number_of_meetings || meeting_dates.length,
      phaseId: phaseIdNum,
      status: "scheduled",
      createdAt: new Date()
    });

    await newMeeting.save();

    res.status(201).json({
      message: "Meeting scheduled successfully",
      meeting_dates: newMeeting.meeting_dates.map(d => ({
        meeting_id: d.meeting_id,
        date: d.date,
        meeting_time: d.meeting_time,
        duration_minutes: d.duration_minutes
      })),
      phaseId: newMeeting.phaseId
    });

  } catch (err) {
    console.error("SCHEDULE MEETING ERROR:", err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Duplicate meeting detected" 
      });
    }
    
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ----------------------------------------------
// GET meeting by ID for editing
// ----------------------------------------------
exports.getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    if (!meetingId) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    const meeting = await MeetingSchedule.findOne({
      "meeting_dates.meeting_id": new mongoose.Types.ObjectId(meetingId)
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const dateEntry = meeting.meeting_dates.find(d => 
      d.meeting_id && d.meeting_id.toString() === meetingId
    );

    if (!dateEntry) {
      return res.status(404).json({ message: "Meeting date not found" });
    }

    const mentor = await User.findById(meeting.mentor_user_id);
    const mentees = await User.find({ _id: { $in: meeting.mentee_user_ids } });

    res.json({
      meeting: {
        _id: meeting._id,
        mentor: mentor ? {
          _id: mentor._id,
          name: mentor.basic?.name || "",
          email: mentor.basic?.email_id || ""
        } : null,
        mentees: mentees.map(m => ({
          _id: m._id,
          name: m.basic?.name || "",
          email: m.basic?.email_id || ""
        })),
        date: dateEntry.date,
        meeting_id: dateEntry.meeting_id,
        time: dateEntry.meeting_time,
        duration_minutes: dateEntry.duration_minutes,
        platform: meeting.platform,
        meeting_link: dateEntry.meeting_link || meeting.meeting_link || "",
        agenda: meeting.agenda || "",
        preferred_day: meeting.preferred_day || "",
        number_of_meetings: meeting.number_of_meetings,
        phaseId: meeting.phaseId,
        status: meeting.status,
        all_dates: meeting.meeting_dates.map(d => ({
          date: d.date,
          meeting_id: d.meeting_id,
          meeting_time: d.meeting_time,
          duration_minutes: d.duration_minutes,
          status: d.status
        }))
      }
    });

  } catch (err) {
    console.error("GET MEETING BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------
// UPDATE meeting details (Mentor-only)
// ----------------------------------------------
exports.updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const {
      meeting_date,
      meeting_time,
      duration_minutes,
      platform,
      meeting_link,
      agenda,
      mentee_user_ids,
      preferred_day,
      number_of_meetings,
      update_all_dates,
      notes,
      status
    } = req.body;

    if (!meetingId) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    const meeting = await MeetingSchedule.findOne({
      "meeting_dates.meeting_id": new mongoose.Types.ObjectId(meetingId)
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const updateData = {};
    const dateIndex = meeting.meeting_dates.findIndex(d => 
      d.meeting_id && d.meeting_id.toString() === meetingId
    );

    // Update common meeting details (applies to all dates)
    if (platform !== undefined) updateData.platform = platform;
    if (agenda !== undefined) updateData.agenda = agenda;
    if (preferred_day !== undefined) updateData.preferred_day = preferred_day;
    if (number_of_meetings !== undefined) updateData.number_of_meetings = number_of_meetings;
    if (mentee_user_ids !== undefined && Array.isArray(mentee_user_ids)) {
      updateData.mentee_user_ids = mentee_user_ids;
    }

    // Handle date-specific updates
    if (dateIndex !== -1) {
      const updatedDates = [...meeting.meeting_dates];
      
      if (meeting_date !== undefined) {
        if (update_all_dates === true) {
          const newDate = new Date(meeting_date);
          const dateDifference = newDate.getTime() - meeting.meeting_dates[0].date.getTime();
          updatedDates.forEach((_, idx) => {
            updatedDates[idx].date = new Date(meeting.meeting_dates[idx].date.getTime() + dateDifference);
          });
        } else {
          updatedDates[dateIndex].date = new Date(meeting_date);
        }
      }
      
      if (meeting_time !== undefined) {
        if (update_all_dates === true) {
          updatedDates.forEach(d => { d.meeting_time = meeting_time; });
        } else {
          updatedDates[dateIndex].meeting_time = meeting_time;
        }
      }
      
      if (duration_minutes !== undefined) {
        if (update_all_dates === true) {
          updatedDates.forEach(d => { d.duration_minutes = duration_minutes; });
        } else {
          updatedDates[dateIndex].duration_minutes = duration_minutes;
        }
      }
      
      if (meeting_link !== undefined) {
        if (update_all_dates === true) {
          updatedDates.forEach(d => { d.meeting_link = meeting_link; });
        } else {
          updatedDates[dateIndex].meeting_link = meeting_link;
        }
      }
      
      if (notes !== undefined) {
        if (update_all_dates === true) {
          updatedDates.forEach(d => { d.notes = notes; });
        } else {
          updatedDates[dateIndex].notes = notes;
        }
      }
      
      if (status !== undefined) {
        if (update_all_dates === true) {
          updatedDates.forEach(d => { d.status = status; });
        } else {
          updatedDates[dateIndex].status = status;
        }
      }
      
      updateData.meeting_dates = updatedDates;
    }

    // Update overall meeting status based on individual statuses
    if (updateData.meeting_dates) {
      const allStatuses = updateData.meeting_dates.map(d => d.status);
      let overallStatus = "scheduled";
      if (allStatuses.every(s => s === "completed")) {
        overallStatus = "completed";
      } else if (allStatuses.some(s => s === "cancelled")) {
        overallStatus = "cancelled";
      } else if (allStatuses.some(s => s === "completed") && allStatuses.some(s => s === "scheduled")) {
        overallStatus = "partial";
      }
      updateData.status = overallStatus;
    }

    updateData.updatedAt = new Date();

    const updatedMeeting = await MeetingSchedule.findByIdAndUpdate(
      meeting._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedMeeting) {
      return res.status(404).json({ message: "Meeting update failed" });
    }

    const updatedDateEntry = updatedMeeting.meeting_dates.find(d => 
      d.meeting_id && d.meeting_id.toString() === meetingId
    );

    const mentor = await User.findById(updatedMeeting.mentor_user_id);
    const mentees = await User.find({ _id: { $in: updatedMeeting.mentee_user_ids } });

    res.json({
      message: "Meeting updated successfully",
      meeting: {
        _id: updatedMeeting._id,
        mentor: mentor ? {
          _id: mentor._id,
          name: mentor.basic?.name || "",
          email: mentor.basic?.email_id || ""
        } : null,
        mentees: mentees.map(m => ({
          _id: m._id,
          name: m.basic?.name || "",
          email: m.basic?.email_id || ""
        })),
        date: updatedDateEntry?.date,
        meeting_id: updatedDateEntry?.meeting_id,
        time: updatedDateEntry?.meeting_time,
        duration_minutes: updatedDateEntry?.duration_minutes,
        platform: updatedMeeting.platform,
        meeting_link: updatedDateEntry?.meeting_link || updatedMeeting.meeting_link,
        agenda: updatedMeeting.agenda,
        preferred_day: updatedMeeting.preferred_day,
        number_of_meetings: updatedMeeting.number_of_meetings,
        status: updatedMeeting.status,
        all_dates: updatedMeeting.meeting_dates.map(d => ({
          date: d.date,
          meeting_id: d.meeting_id,
          meeting_time: d.meeting_time,
          duration_minutes: d.duration_minutes,
          status: d.status
        }))
      }
    });

  } catch (err) {
    console.error("UPDATE MEETING ERROR:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ----------------------------------------------
// DELETE meeting
// ----------------------------------------------
exports.deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    if (!meetingId) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    const meeting = await MeetingSchedule.findOne({
      "meeting_dates.meeting_id": new mongoose.Types.ObjectId(meetingId)
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.meeting_dates.length === 1) {
      await MeetingSchedule.findByIdAndDelete(meeting._id);
    } else {
      await MeetingSchedule.findByIdAndUpdate(
        meeting._id,
        {
          $pull: {
            meeting_dates: { meeting_id: new mongoose.Types.ObjectId(meetingId) }
          },
          $inc: { number_of_meetings: -1 }
        }
      );
    }

    await MeetingStatus.deleteMany({ meeting_id: meetingId });

    res.json({ message: "Meeting deleted successfully" });

  } catch (err) {
    console.error("DELETE MEETING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------
// GET all scheduled meetings
// ----------------------------------------------
exports.getScheduledMeetings = async (req, res) => {
  try {
    const meetings = await MeetingSchedule.find();
    
    const formattedMeetings = await Promise.all(meetings.map(async (meeting) => {
      const mentor = await User.findById(meeting.mentor_user_id);
      const mentees = await User.find({ _id: { $in: meeting.mentee_user_ids } });
      
      return {
        _id: meeting._id,
        mentor: {
          _id: mentor?._id,
          name: mentor?.basic?.name || "Unknown Mentor",
          email: mentor?.basic?.email_id || ""
        },
        mentees: mentees.map(m => ({
          _id: m._id,
          name: m.basic?.name || "",
          email: m.basic?.email_id || ""
        })),
        meeting_dates: meeting.meeting_dates,
        platform: meeting.platform,
        meeting_link: meeting.meeting_link,
        agenda: meeting.agenda,
        preferred_day: meeting.preferred_day,
        number_of_meetings: meeting.number_of_meetings,
        phaseId: meeting.phaseId,
        status: meeting.status,
        createdAt: meeting.createdAt
      };
    }));
    
    res.json({ meetings: formattedMeetings });
  } catch (err) {
    console.error("GET SCHEDULED MEETINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------
// FILTER meetings BY user email
// ----------------------------------------------
// ----------------------------------------------
// FILTER meetings BY user email (FIXED FOR MENTEES)
// ----------------------------------------------
exports.getScheduledByUser = async (req, res) => {
  try {
    const email = req.params.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required", meetings: [] });

    const user = await User.findOne({ "basic.email_id": email });
    if (!user) return res.json({ message: "User not found", meetings: [] });

    let meetingsList = [];

    const mentorAssignments = await MentorMenteeAssignment.find({ mentor_user_id: user._id });
    if (mentorAssignments.length > 0) {
      // ... MENTOR LOGIC (unchanged) ...
      const assignedMentees = [];

      for (const assignment of mentorAssignments) {
        for (const menteeId of assignment.mentee_user_ids) {
          const mentee = await User.findById(menteeId);
          if (mentee) {
            assignedMentees.push({
              _id: mentee._id,
              name: mentee.basic?.name || "Unknown",
              email: mentee.basic?.email_id || ""
            });
          }
        }
      }

      const meetingSchedule = await MeetingSchedule.find({ mentor_user_id: user._id });

      meetingsList = meetingSchedule.map((meeting) => ({
        _id: meeting._id,
        mentor: {
          _id: user._id,
          name: user.basic?.name || "Unknown Mentor",
          email: user.basic?.email_id || ""
        },
        mentees: meeting.mentee_user_ids.map((id) => {
          const m = assignedMentees.find((x) => x._id.toString() === id.toString());
          return m || { _id: id, name: "Unknown", email: "" };
        }),
        meeting_dates: meeting.meeting_dates,
        platform: meeting.platform,
        meeting_link: meeting.meeting_link,
        agenda: meeting.agenda,
        preferred_day: meeting.preferred_day,
        number_of_meetings: meeting.number_of_meetings,
        phaseId: meeting.phaseId
      }));

      return res.json({
        role: "mentor",
        mentor: {
          _id: user._id,
          name: user.basic?.name || "Unknown Mentor",
          email: user.basic?.email_id || ""
        },
        mentees: assignedMentees,
        meetings: meetingsList
      });
    }

    // ✅ FIXED: MENTEE LOGIC - Fetch full mentee objects
    const menteeMeetings = await MeetingSchedule.find({ mentee_user_ids: user._id });

    if (menteeMeetings.length === 0) {
      return res.json({ role: "mentee", mentor: null, mentees: [], meetings: [] });
    }

    let mentorInfo = null;
    const meetingsForMentee = [];

    for (const meeting of menteeMeetings) {
      const mentor = await User.findById(meeting.mentor_user_id);
      if (!mentor) continue;

      if (!mentorInfo) {
        mentorInfo = {
          _id: mentor._id,
          name: mentor.basic?.name || "Unknown Mentor",
          email: mentor.basic?.email_id || ""
        };
      }

      // ✅ FIX: Fetch full mentee objects for each mentee ID
      const fullMentees = await User.find({ 
        _id: { $in: meeting.mentee_user_ids } 
      });

      const menteeObjects = fullMentees.map(mentee => ({
        _id: mentee._id,
        name: mentee.basic?.name || "Unknown Mentee",
        email: mentee.basic?.email_id || ""
      }));

      meetingsForMentee.push({
        _id: meeting._id,
        mentor: mentorInfo,
        mentees: menteeObjects, // ✅ Now returns full objects, not just IDs
        meeting_dates: meeting.meeting_dates,
        platform: meeting.platform,
        meeting_link: meeting.meeting_link,
        agenda: meeting.agenda,
        preferred_day: meeting.preferred_day,
        number_of_meetings: meeting.number_of_meetings,
        phaseId: meeting.phaseId
      });
    }

    // ✅ Get all unique mentees across all meetings (as full objects)
    const allMenteeIds = new Set();
    meetingsForMentee.forEach(meeting => {
      meeting.mentees.forEach(mentee => {
        allMenteeIds.add(mentee._id.toString());
      });
    });

    const allMentees = await User.find({
      _id: { $in: Array.from(allMenteeIds) }
    });

    const uniqueMentees = allMentees.map(mentee => ({
      _id: mentee._id,
      name: mentee.basic?.name || "Unknown Mentee",
      email: mentee.basic?.email_id || ""
    }));

    return res.json({
      role: "mentee",
      mentor: mentorInfo,
      mentees: uniqueMentees, // ✅ Now returns full objects
      meetings: meetingsForMentee
    });

  } catch (error) {
    console.error("SCHEDULED BY USER ERROR:", error);
    res.status(500).json({ message: "Server error", meetings: [] });
  }
};

// ----------------------------------------------
// GET all meetings for a mentor
// ----------------------------------------------
exports.getAllMeetingsForMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    if (!mentorId) {
      return res.status(400).json({ message: "Mentor ID is required" });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const meetings = await MeetingSchedule.find({ mentor_user_id: mentorId });

    const flattenedMeetings = meetings.flatMap(meeting => 
      meeting.meeting_dates.map(dateEntry => ({
        _id: meeting._id,
        mentor: {
          _id: mentor._id,
          name: mentor.basic?.name || "",
          email: mentor.basic?.email_id || ""
        },
        mentees: meeting.mentee_user_ids,
        date: dateEntry.date,
        meeting_id: dateEntry.meeting_id,
        time: dateEntry.meeting_time,
        duration_minutes: dateEntry.duration_minutes,
        platform: meeting.platform,
        meeting_link: dateEntry.meeting_link || meeting.meeting_link,
        agenda: meeting.agenda,
        preferred_day: meeting.preferred_day,
        number_of_meetings: meeting.number_of_meetings,
        phaseId: meeting.phaseId,
        status: dateEntry.status
      }))
    );

    flattenedMeetings.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      mentor: {
        _id: mentor._id,
        name: mentor.basic?.name || "",
        email: mentor.basic?.email_id || ""
      },
      meetings: flattenedMeetings
    });

  } catch (err) {
    console.error("GET ALL MEETINGS FOR MENTOR ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------
// GET mentor by email
// ----------------------------------------------
exports.getMentorByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const mentor = await User.findOne({
      "basic.email_id": { $regex: new RegExp(`^${email.trim().toLowerCase()}$`, "i") }
    });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const isMentor = await MentorMenteeAssignment.exists({ mentor_user_id: mentor._id });
    
    if (!isMentor) {
      return res.status(400).json({ message: "User is not a mentor" });
    }

    res.json({
      mentor: {
        _id: mentor._id,
        name: mentor.basic?.name || "",
        email: mentor.basic?.email_id || ""
      }
    });

  } catch (err) {
    console.error("GET MENTOR BY EMAIL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------
// GET mentor by mentee email
// ----------------------------------------------
exports.getMentorByMenteeEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Mentee email is required" });
    }

    const mentee = await User.findOne({
      "basic.email_id": { $regex: new RegExp(`^${email.trim().toLowerCase()}$`, "i") }
    });

    if (!mentee) {
      return res.status(404).json({ message: "Mentee not found" });
    }

    const assignment = await MentorMenteeAssignment.findOne({
      mentee_user_ids: mentee._id
    });

    if (!assignment) {
      return res.status(404).json({ message: "No mentor assigned" });
    }

    const mentor = await User.findById(assignment.mentor_user_id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const allAssignments = await MentorMenteeAssignment.find({
      mentor_user_id: mentor._id
    });

    const allMenteeIds = [];
    allAssignments.forEach(assign => {
      allMenteeIds.push(...assign.mentee_user_ids);
    });

    const assignedMentees = await User.find({
      _id: { $in: allMenteeIds }
    });

    res.json({
      mentor: {
        _id: mentor._id,
        name: mentor.basic?.name || "",
        email: mentor.basic?.email_id || ""
      },
      assignedMentees: assignedMentees.map(m => ({
        _id: m._id,
        name: m.basic?.name || "",
        email: m.basic?.email_id || ""
      })),
      commencement_date: assignment.commencement_date || "",
      end_date: assignment.end_date || ""
    });

  } catch (err) {
    console.error("GET MENTOR BY MENTEE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------
// GET meetings by phase
// ----------------------------------------------
exports.getMeetingsByPhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    
    if (!phaseId) {
      return res.status(400).json({ message: "Phase ID is required" });
    }

    const meetings = await MeetingSchedule.find({ phaseId: Number(phaseId) });
    
    const formattedMeetings = await Promise.all(meetings.map(async (meeting) => {
      const mentor = await User.findById(meeting.mentor_user_id);
      const mentees = await User.find({ _id: { $in: meeting.mentee_user_ids } });
      
      return {
        _id: meeting._id,
        mentor: {
          _id: mentor?._id,
          name: mentor?.basic?.name || "Unknown Mentor",
          email: mentor?.basic?.email_id || ""
        },
        mentees: mentees.map(m => ({
          _id: m._id,
          name: m.basic?.name || "",
          email: m.basic?.email_id || ""
        })),
        meeting_dates: meeting.meeting_dates,
        platform: meeting.platform,
        meeting_link: meeting.meeting_link,
        agenda: meeting.agenda,
        preferred_day: meeting.preferred_day,
        number_of_meetings: meeting.number_of_meetings,
        phaseId: meeting.phaseId,
        status: meeting.status,
        createdAt: meeting.createdAt
      };
    }));
    
    res.json({ meetings: formattedMeetings });
    
  } catch (err) {
    console.error("GET MEETINGS BY PHASE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Debug log to confirm all functions are loaded
