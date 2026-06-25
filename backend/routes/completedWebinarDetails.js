const express = require('express');
const router = express.Router();

const findMemberByEmail = async (Member, email) => {
  const normalizedEmail = (email || '').trim();
  if (!Member || !normalizedEmail) return null;

  const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return Member.findOne({
    'basic.email_id': { $regex: new RegExp(`^${escapedEmail}$`, 'i') },
  }).lean();
};

const getMemberMobile = (member) => (
  member?.contact_details?.mobile ||
  member?.contact_details?.phone ||
  member?.mobile ||
  member?.phone ||
  member?.contact ||
  ''
);

const getMemberName = (member) => {
  if (!member) return '';
  const candidates = [
    member.basic?.name,
    member.basic?.full_name,
    member.basic?.fullName,
    member.name,
    member.full_name,
    member.fullName,
    member.personal?.name,
    member.personal_details?.name,
    member.profile?.name,
  ];

  for (const candidate of candidates) {
    const value = (candidate || '').toString().trim();
    if (value) return value;
  }

  const firstName = member.basic?.first_name || member.basic?.firstName || member.first_name || member.firstName || '';
  const lastName = member.basic?.last_name || member.basic?.lastName || member.last_name || member.lastName || '';
  return `${firstName} ${lastName}`.trim();
};

// Create or update completed webinar details
// NOTE: For now this route only accepts JSON (attendanceSheet/eventImages as base64 strings).
router.put('/webinars/:webinarId/complete-details', async (req, res) => {
  try {
    const {
      attendanceSheet,
      eventImages,
      attendanceCount,
      prizeWinnerEmail,
      prizeWinnerName,
      prizeWinnerMobile,
    } = req.body;

    // Support both keys just in case the frontend sends the older naming.
    const normalizedAttendanceSheet = req.body.attendanceSheet ?? req.body.attendanceSheetBase64;
    const normalizedPrizeWinnerEmail = prizeWinnerEmail ?? req.body.prizeWinnerEmail;
    let normalizedPrizeWinnerName = prizeWinnerName ?? req.body.name ?? '';
    let normalizedPrizeWinnerMobile = prizeWinnerMobile ?? req.body.prizeWinnerMobile;


    const CompletedWebinarDetails = req.app.locals.CompletedWebinarDetails;
    const Member = req.app.locals.Member;

    if (!req.params.webinarId) {
      return res.status(400).json({ error: 'webinarId is required' });
    }

    const member = await findMemberByEmail(Member, normalizedPrizeWinnerEmail);
    if (member) {
      normalizedPrizeWinnerName = getMemberName(member) || normalizedPrizeWinnerName || '';
      normalizedPrizeWinnerMobile = getMemberMobile(member) || normalizedPrizeWinnerMobile || '';
    }

    const update = {
      attendanceSheet: normalizedAttendanceSheet ?? '',
      eventImages: Array.isArray(eventImages) ? eventImages : [],
      attendanceCount: attendanceCount ?? 0,
      prizeWinnerEmail: normalizedPrizeWinnerEmail ?? '',
      prizeWinnerName: normalizedPrizeWinnerName ?? '',
      prizeWinnerMobile: normalizedPrizeWinnerMobile ?? '',
    };

    const doc = await CompletedWebinarDetails.findOneAndUpdate(
      { webinarId: req.params.webinarId },
      update,
      { new: true, upsert: true }
    );

    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('complete-details error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get completed details by webinarId
router.get('/webinars/:webinarId/complete-details', async (req, res) => {
  try {
    const CompletedWebinarDetails = req.app.locals.CompletedWebinarDetails;

    const doc = await CompletedWebinarDetails.findOne({ webinarId: req.params.webinarId });
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('get complete-details error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all completed webinar details for prize winners display
// Returns docs even if only some webinars are completed.
router.get('/prize-winners', async (req, res) => {
  try {
    const CompletedWebinarDetails = req.app.locals.CompletedWebinarDetails;
    const Member = req.app.locals.Member;

    const docs = await CompletedWebinarDetails.find({
      prizeWinnerEmail: { $ne: '' },
    }).lean();

    // Attach webinar info for phase/topic/date/domain from Webinar collection.
    // Include webinars that have prizeWinnerEmail even if complete-details was not created yet.
    const Webinar = req.app.locals.Webinar;
    const webinarIds = docs.map(d => d.webinarId).filter(Boolean);

    const webinars = await Webinar.find({
      $or: [
        { _id: { $in: webinarIds } },
        { prizeWinnerEmail: { $exists: true, $ne: '' } },
      ],
    })
      .select('phaseId domain topic webinarDate prizeWinnerEmail prizeWinnerName prizeWinnerMobile')
      .lean();

    const webinarById = Object.fromEntries(webinars.map(w => [String(w._id), w]));
    const detailByWebinarId = Object.fromEntries(docs.map(d => [String(d.webinarId), d]));
    const sourceRows = webinars.map(webinar => ({
      webinar,
      details: detailByWebinarId[String(webinar._id)] || {},
    }));

    const members = await Promise.all(sourceRows.map(({ webinar, details }) => (
      findMemberByEmail(Member, details.prizeWinnerEmail || webinar.prizeWinnerEmail)
    )));

    const response = sourceRows.map(({ webinar, details }, index) => {
      const w = webinarById[String(webinar._id)] || webinar || {};
      const member = members[index];
      const prizeWinnerEmail = details.prizeWinnerEmail || w.prizeWinnerEmail || '';
      return {
        webinarId: w._id,
        phaseId: w.phaseId ?? null,
        domain: w.domain ?? null,
        webinarDate: w.webinarDate ?? null,
        topic: w.topic ?? null,
        prizeWinnerName: getMemberName(member) || details.prizeWinnerName || w.prizeWinnerName || '',
        prizeWinnerEmail,
        prizeWinnerMobile: getMemberMobile(member) || details.prizeWinnerMobile || w.prizeWinnerMobile || '',
      };
    }).filter(row => row.prizeWinnerEmail);

    res.json({ success: true, data: response });
  } catch (err) {
    console.error('prize-winners error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


