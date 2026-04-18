// controllers/programFeedbackController.js

const User = require("../models/User");
const ProgramFeedback = require("../models/ProgramFeedback");
const MentorRegistration = require("../models/MentorRegistration");
const MenteeRequest = require("../models/MenteeRequest");

// GET user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const email = String(req.query.email).trim().toLowerCase();

    const user = await User.findOne({
      "basic.email_id": { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user_id: user._id,
      name: user.basic?.name || "",
      branch: user.basic?.branch || "",
      batch: user.basic?.batch || "",
      mobile: user.basic?.mobile || "",
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET user role by email
exports.getUserRole = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // First find the user in User collection
    const user = await User.findOne({
      "basic.email_id": { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }
    
    // Check in mentors collection (MentorRegistration)
    const mentor = await MentorRegistration.findOne({ mentor_id: user._id });
    if (mentor) {
      return res.json({ 
        success: true, 
        role: "Mentor",
        userId: user._id,
        registrationId: mentor._id,
        phaseId: mentor.phaseId
      });
    }
    
    // Check in mentees collection (MenteeRequest)
    const mentee = await MenteeRequest.findOne({ mentee_user_id: user._id });
    if (mentee) {
      return res.json({ 
        success: true, 
        role: "Mentee",
        userId: user._id,
        requestId: mentee._id,
        phaseId: mentee.phaseId
      });
    }
    
    // User exists but not registered as mentor or mentee
    return res.json({ 
      success: true, 
      role: "Alumni",
      userId: user._id,
      message: "User is registered but not as mentor or mentee"
    });
    
  } catch (error) {
    console.error("Error fetching user role:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error while detecting user role" 
    });
  }
};

// POST feedback
exports.createFeedback = async (req, res) => {
  try {
    const {
      email,
      role,
      phaseId,
      programOrganization,
      matchingProcess,
      supportProvided,
      overallSatisfaction,
      generalFeedback,
      suggestions,
      participateAgain,
    } = req.body;

    const emailLower = String(email).trim().toLowerCase();

    const user = await User.findOne({
      "basic.email_id": { $regex: new RegExp(`^${emailLower}$`, "i") },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const feedback = new ProgramFeedback({
      user_id: user._id,
      role,
      phaseId,
      programOrganization,
      matchingProcess,
      supportProvided,
      overallSatisfaction,
      generalFeedback,
      suggestions,
      participateAgain,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback saved successfully!",
    });
  } catch (err) {
    console.error("FEEDBACK SAVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET feedback (with optional email filter)
exports.getFeedback = async (req, res) => {
  try {
    const { email } = req.query;

    let filter = {};
    if (email) {
      const user = await User.findOne({
        "basic.email_id": { $regex: new RegExp(`^${email.trim().toLowerCase()}$`, "i") },
      });
      if (!user) return res.status(404).json({ message: "User not found" });

      filter.user_id = user._id;
    }

    const feedbacks = await ProgramFeedback.find(filter).populate("user_id", "basic.name basic.email_id");
    res.json(feedbacks);
  } catch (err) {
    console.error("GET FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};