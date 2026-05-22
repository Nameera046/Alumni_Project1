// routes/phaseRoutes.js
const express = require("express");
const router = express.Router();
const phaseController = require("../controllers/phaseController");

// GET all phases
router.get("/", phaseController.getPhases);

// Get single phase by ID
router.get("/:phaseId", phaseController.getPhaseById);
// ✅ GET mentee count by phaseId
router.get("/mentee-count", phaseController.getMenteeCount);

// ✅ GET mentor count by phaseId
router.get("/mentor-count", phaseController.getMentorCount);


// POST create new phase
router.post("/", phaseController.createPhase);

// Update phase (EDIT)
router.put("/:phaseId", phaseController.updatePhase);

// Delete phase
router.delete("/:phaseId", phaseController.deletePhase);



module.exports = router;
