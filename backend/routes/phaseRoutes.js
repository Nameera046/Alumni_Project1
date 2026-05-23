// routes/phaseRoutes.js
const express = require("express");
const router = express.Router();
const phaseController = require("../controllers/phaseController");

// ============= SPECIFIC ROUTES (NO PARAMETERS) =============
// These must come BEFORE parameter routes to avoid conflicts

// GET mentee count by phaseId (query parameter)
// Example: /api/phase/mentee-count?phaseId=5
router.get("/mentee-count", phaseController.getMenteeCount);

// GET mentor count by phaseId (query parameter)
// Example: /api/phase/mentor-count?phaseId=5
router.get("/mentor-count", phaseController.getMentorCount);

// ============= GENERAL ROUTES =============

// GET all phases
// Example: /api/phase
router.get("/", phaseController.getPhases);

// ============= PARAMETER ROUTES (WITH :phaseId) =============
// These must come LAST

// GET single phase by ID
// Example: /api/phase/1
router.get("/:phaseId", phaseController.getPhaseById);

// POST create new phase
// Example: /api/phase
router.post("/", phaseController.createPhase);

// PUT update phase
// Example: /api/phase/1
router.put("/:phaseId", phaseController.updatePhase);

// DELETE phase
// Example: /api/phase/1
router.delete("/:phaseId", phaseController.deletePhase);

module.exports = router;