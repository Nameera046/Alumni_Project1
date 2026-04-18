const User = require("../models/User");
const MentorRegistration = require("../models/MentorRegistration");

exports.getMentorDetailsByEmail = async (req, res) => {
  try {
    const email = String(req.query.email).trim().toLowerCase();
    const user = await User.findOne({ "basic.email_id": { $regex: new RegExp(`^${email}$`, "i") } });

    if (!user) return res.status(404).json({ success: false, message: "No user found with this email" });

    const fullName = user.basic?.name || "";
    const branchRaw = user.education_details?.[0]?.stream || "";
    const branch = branchRaw.includes(";") ? branchRaw.split(";")[0].trim() : branchRaw;
    const batch = user.education_details?.[0]?.end_year || "";
    const contactNumber = user.contact_details?.mobile || "Not provided";

    const work = user.work_details?.[0] || {};
    const designation = work.position || "Not provided";
    const currentCompany = work.name || "Not provided";

    return res.status(200).json({
      success: true,
      user: { fullName, branch, batch, emailId: user.basic?.email_id || "", mobile: contactNumber, designation, currentCompany },
    });
  } catch (err) {
    console.error("AUTO FETCH ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createMentorRegistration = async (req, res) => {
  try {
    const email = String(req.body.email).trim().toLowerCase();
    const phaseId = req.body.phaseId;

    if (!phaseId) {
      return res.status(400).json({
        success: false,
        message: "phaseId is required"
      });
    }

    const user = await User.findOne({
      "basic.email_id": { $regex: new RegExp(`^${email}$`, "i") }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ensure areas_of_interest is an array
    let interests = req.body.areaOfInterest;
    if (!Array.isArray(interests)) {
      interests = [interests];
    }

    const newMentor = new MentorRegistration({
      mentor_id: user._id,
      areas_of_interest: interests,
      description: req.body.supportDescription || "",
      phaseId: phaseId,
      status: "pending"
    });

    await newMentor.save();

    return res.status(201).json({
      success: true,
      message: "Mentor registration submitted successfully",
      mentor: {
        id: newMentor._id,
        status: newMentor.status
      }
    });

  } catch (err) {
    console.error("MENTOR REGISTRATION ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ Update mentor status (called when mentor is assigned)
exports.updateMentorStatus = async (req, res) => {
  try {
    const { mentor_user_id, phaseId, status } = req.body;

    if (!mentor_user_id) {
      return res.status(400).json({
        success: false,
        message: "mentor_user_id is required"
      });
    }

    if (!phaseId) {
      return res.status(400).json({
        success: false,
        message: "phaseId is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    const updateData = {
      status: status
    };

    if (status === 'assigned') {
      updateData.assignedDate = new Date();
    }

    const updatedMentor = await MentorRegistration.findOneAndUpdate(
      { 
        mentor_id: mentor_user_id,
        phaseId: Number(phaseId)
      },
      updateData,
      { new: true }
    );

    if (!updatedMentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found for this phase"
      });
    }

    console.log(`✅ Mentor ${mentor_user_id} status updated to: ${status}`);

    return res.status(200).json({
      success: true,
      message: `Mentor status updated to ${status}`,
      mentor: {
        id: updatedMentor._id,
        status: updatedMentor.status,
        assignedDate: updatedMentor.assignedDate
      }
    });

  } catch (err) {
    console.error("UPDATE MENTOR STATUS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ Get mentor status by email
exports.getMentorStatus = async (req, res) => {
  try {
    const { email, phaseId } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    if (!phaseId) {
      return res.status(400).json({
        success: false,
        message: "phaseId is required"
      });
    }

    // Find user by email
    const user = await User.findOne({
      "basic.email_id": { $regex: new RegExp(`^${email}$`, "i") }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find mentor registration
    const mentor = await MentorRegistration.findOne({
      mentor_id: user._id,
      phaseId: Number(phaseId)
    });

    if (!mentor) {
      return res.status(200).json({
        success: true,
        isRegistered: false,
        status: null,
        message: "Mentor not registered for this phase"
      });
    }

    return res.status(200).json({
      success: true,
      isRegistered: true,
      status: mentor.status,
      message: `Mentor status is ${mentor.status}`,
      mentor: {
        id: mentor._id,
        registeredAt: mentor.createdAt,
        areas_of_interest: mentor.areas_of_interest,
        description: mentor.description,
        assignedDate: mentor.assignedDate
      }
    });

  } catch (err) {
    console.error("GET MENTOR STATUS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ Get all mentors with status for a phase
exports.getAllMentorsWithStatus = async (req, res) => {
  try {
    const { phaseId } = req.query;

    if (!phaseId) {
      return res.status(400).json({
        success: false,
        message: "phaseId is required"
      });
    }

    const mentors = await MentorRegistration.find({ 
      phaseId: Number(phaseId) 
    });

    const mentorsWithStatus = await Promise.all(
      mentors.map(async (mentor) => {
        const user = await User.findById(mentor.mentor_id);
        
        return {
          mentor_id: mentor.mentor_id,
          name: user?.basic?.name || "Unknown Mentor",
          email: user?.basic?.email_id || "No email",
          areas_of_interest: mentor.areas_of_interest,
          description: mentor.description,
          status: mentor.status,
          registeredAt: mentor.createdAt,
          assignedDate: mentor.assignedDate
        };
      })
    );

    const pendingMentors = mentorsWithStatus.filter(m => m.status === "pending");
    const assignedMentors = mentorsWithStatus.filter(m => m.status === "assigned");

    return res.status(200).json({
      success: true,
      phaseId: Number(phaseId),
      totalMentors: mentorsWithStatus.length,
      pendingCount: pendingMentors.length,
      assignedCount: assignedMentors.length,
      pendingMentors: pendingMentors,
      assignedMentors: assignedMentors
    });

  } catch (err) {
    console.error("GET ALL MENTORS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ Delete mentor registration (if needed)
exports.deleteMentorRegistration = async (req, res) => {
  try {
    const { mentor_id, phaseId } = req.body;

    if (!mentor_id) {
      return res.status(400).json({
        success: false,
        message: "mentor_id is required"
      });
    }

    if (!phaseId) {
      return res.status(400).json({
        success: false,
        message: "phaseId is required"
      });
    }

    const deletedMentor = await MentorRegistration.findOneAndDelete({
      mentor_id: mentor_id,
      phaseId: Number(phaseId)
    });

    if (!deletedMentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor registration not found"
      });
    }

    console.log(`✅ Mentor ${mentor_id} registration deleted for phase ${phaseId}`);

    return res.status(200).json({
      success: true,
      message: "Mentor registration deleted successfully"
    });

  } catch (err) {
    console.error("DELETE MENTOR REGISTRATION ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};