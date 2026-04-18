const express = require("express");
const router = express.Router();
const programFeedbackController = require("../controllers/programFeedbackController");


router.get("/get-user-by-email", programFeedbackController.getUserByEmail);

router.get("/get-user-role", programFeedbackController.getUserRole);

router.post("/submit-feedback", programFeedbackController.createFeedback);
router.get("/get-feedback", programFeedbackController.getFeedback);
module.exports = router;
