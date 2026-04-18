const express = require("express");
const router = express.Router();
const mentorMenteeController = require("../controllers/mentorMenteeController");

// Fetch mentors
router.get("/mentors", mentorMenteeController.getMentors);

// Fetch mentees
router.get("/mentees", mentorMenteeController.getMentees);

// Assign mentor
router.post("/assign", mentorMenteeController.assignMentor);

router.get("/check-current-assignment/:mentorObjectId", mentorMenteeController.checkMentorAssignmentInCurrentPhase);

// Get mentor assignment details
router.get("/assignment-details/:mentorObjectId", mentorMenteeController.getMentorAssignmentDetails);
module.exports = router;
