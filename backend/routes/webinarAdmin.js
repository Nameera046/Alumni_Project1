const express = require('express');
const router = express.Router();

// Update webinar main schedule fields (topic/domain/webinarDate/time/venue/meetingLink/alumniCity)
// and optionally speaker fields.
router.put('/webinars/:webinarId/main', async (req, res) => {
  try {
    const { webinarId } = req.params;
    if (!webinarId) return res.status(400).json({ error: 'webinarId is required' });

    const {
      topic,
      domain,
      webinarDate,
      deadline, // optional
      time,
      venue,
      meetingLink,
      alumniCity,
      speaker
    } = req.body || {};

    const Webinar = req.app.locals.Webinar;
    const Speaker = req.app.locals.Speaker;

    if (!Webinar) return res.status(500).json({ error: 'Webinar model not configured' });
    if (!Speaker) return res.status(500).json({ error: 'Speaker model not configured' });

    const webinarDoc = await Webinar.findById(webinarId);
    if (!webinarDoc) return res.status(404).json({ error: 'Webinar not found' });

    const update = {};
    if (topic !== undefined) update.topic = topic;
    if (domain !== undefined) update.domain = domain;
    if (webinarDate !== undefined) update.webinarDate = webinarDate ? new Date(webinarDate) : webinarDate;
    if (deadline !== undefined) update.deadline = deadline ? new Date(deadline) : deadline;
    if (time !== undefined) update.time = time;
    if (venue !== undefined) update.venue = venue;
    if (meetingLink !== undefined) update.meetingLink = meetingLink;
    if (alumniCity !== undefined) update.alumniCity = alumniCity;

    // Speaker update (optional)
    if (speaker && webinarDoc.speaker) {
      const speakerUpdate = {};
      if (speaker.name !== undefined) speakerUpdate.name = speaker.name;
      if (speaker.email !== undefined) speakerUpdate.email = speaker.email;
      if (speaker.designation !== undefined) speakerUpdate.designation = speaker.designation;
      if (speaker.companyName !== undefined) speakerUpdate.companyName = speaker.companyName;
      if (speaker.department !== undefined) speakerUpdate.department = speaker.department;
      if (speaker.batch !== undefined) speakerUpdate.batch = speaker.batch;

      await Speaker.findByIdAndUpdate(webinarDoc.speaker, speakerUpdate, { new: true });
    }

    const updated = await Webinar.findByIdAndUpdate(webinarId, update, { new: true }).populate('speaker');
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT /webinars/:webinarId/main error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

