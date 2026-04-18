const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/mentorController");

// ✅ Correct: pass function reference, not call it
router.get("/fetch-user", mentorController.getMentorDetailsByEmail);
router.post("/register", mentorController.createMentorRegistration);

// Additional routes for fetching mentors and mentees
router.put('/mentor/update-status', mentorController.updateMentorStatus);
router.get('/mentor/status', mentorController.getMentorStatus);
router.get('/mentor/all-with-status', mentorController.getAllMentorsWithStatus);
router.delete('/mentor/delete', mentorController.deleteMentorRegistration);

module.exports = router;
