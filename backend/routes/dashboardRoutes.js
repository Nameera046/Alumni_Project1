// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Dashboard Statistics
router.get("/stats", dashboardController.getDashboardStats);

// Get all mentors (for dashboard display)
router.get("/mentors", dashboardController.getAllMentors);

// Get all mentees (for dashboard display)
router.get("/mentees", dashboardController.getAllMentees);

// Get all assignments (for dashboard display)
router.get("/assignments", dashboardController.getAllAssignments);

// Get all meetings (for dashboard display)
router.get("/meetings", dashboardController.getAllMeetings);

// Get all feedbacks (for dashboard display)
router.get("/feedbacks", dashboardController.getAllFeedbacks);
// New Dashboard Routes
router.get("/summary", dashboardController.getDashboardSummary);           // Main dashboard cards
router.get("/phase-stats", dashboardController.getPhaseStatistics);        // Phase-wise statistics
router.get("/mentor-interests", dashboardController.getMentorInterestsCarousel); // Mentor interests
router.get("/upcoming-meetings", dashboardController.getUpcomingMeetings); // Upcoming meetings

router.get("/recent-activity", dashboardController.getRecentActivity);

// Debug user data
router.get("/debug-user", dashboardController.debugUserData);

// ==================== DELETE ROUTES (Coordinator Only) ====================

// Delete a single mentee by ID
router.delete("/mentee/:menteeId", dashboardController.deleteMentee);

// Delete a single mentor by ID
router.delete("/mentor/:mentorId", dashboardController.deleteMentor);

// Delete an assignment by ID
router.delete("/assignment/:assignmentId", dashboardController.deleteAssignment);

// Bulk delete mentees by phase
router.delete("/mentees/phase/:phaseId", dashboardController.deleteMenteesByPhase);

// Bulk delete mentors by phase
router.delete("/mentors/phase/:phaseId", dashboardController.deleteMentorsByPhase);

module.exports = router;