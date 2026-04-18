const FeedbackSettings = require('../models/FeedbackSettings');

// Get feedback settings for a phase
exports.getFeedbackSettings = async (req, res) => {
  try {
    const { phaseId } = req.params;
    
    let settings = await FeedbackSettings.findOne({ phaseId: Number(phaseId) });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await FeedbackSettings.create({
        phaseId: Number(phaseId),
        enableFeedback: false
      });
    }
    
    res.json({
      success: true,
      phaseId: settings.phaseId,
      enableFeedback: settings.enableFeedback,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    });
  } catch (err) {
    console.error("GET FEEDBACK SETTINGS ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// Update feedback settings (for coordinators)
exports.updateFeedbackSettings = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const { enableFeedback } = req.body;
    
    if (typeof enableFeedback !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: "enableFeedback must be a boolean" 
      });
    }
    
    const settings = await FeedbackSettings.findOneAndUpdate(
      { phaseId: Number(phaseId) },
      { 
        enableFeedback: enableFeedback,
        updatedAt: new Date()
      },
      { 
        new: true,
        upsert: true // Create if doesn't exist
      }
    );
    
    res.json({
      success: true,
      message: `Feedback ${enableFeedback ? 'enabled' : 'disabled'} successfully`,
      settings: {
        phaseId: settings.phaseId,
        enableFeedback: settings.enableFeedback,
        updatedAt: settings.updatedAt
      }
    });
  } catch (err) {
    console.error("UPDATE FEEDBACK SETTINGS ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// Get all feedback settings
exports.getAllFeedbackSettings = async (req, res) => {
  try {
    const settings = await FeedbackSettings.find().sort({ phaseId: 1 });
    res.json({
      success: true,
      settings: settings,
      count: settings.length
    });
  } catch (err) {
    console.error("GET ALL FEEDBACK SETTINGS ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// Delete feedback settings (optional - for cleanup)
exports.deleteFeedbackSettings = async (req, res) => {
  try {
    const { phaseId } = req.params;
    
    const result = await FeedbackSettings.findOneAndDelete({ phaseId: Number(phaseId) });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Feedback settings not found"
      });
    }
    
    res.json({
      success: true,
      message: "Feedback settings deleted successfully"
    });
  } catch (err) {
    console.error("DELETE FEEDBACK SETTINGS ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};