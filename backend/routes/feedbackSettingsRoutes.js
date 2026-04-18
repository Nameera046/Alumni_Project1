const express = require('express');
const router = express.Router();
const feedbackSettingsController = require('../controllers/feedbackSettingsController');

// Get all feedback settings
router.get('/', feedbackSettingsController.getAllFeedbackSettings);

// Get feedback settings for specific phase
router.get('/:phaseId', feedbackSettingsController.getFeedbackSettings);

// Update feedback settings for specific phase
router.put('/:phaseId', feedbackSettingsController.updateFeedbackSettings);

module.exports = router;