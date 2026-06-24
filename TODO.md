# TODO

- [ ] Backend: Add `status` field to `backend/models/Webinar.js` with default "Not Completed".
- [ ] Backend: Create `backend/models/CompletedWebinarDocuments.js` for attendanceSheet + eventImages storage.
- [ ] Backend: Update completion submission in `backend/server.js`:
  - [ ] Set `Webinar.status` to "Completed" when form is submitted.
  - [ ] Upsert uploaded files into `CompletedWebinarDocuments` by `webinarId`.
  - [ ] Ensure documents are not stored in `Webinar` collection.
- [ ] Backend: Add admin download ZIP route `GET /api/admin/webinars/:webinarId/completed-documents/download` (or similar) that:
  - [ ] Loads docs from `CompletedWebinarDocuments`.
  - [ ] Creates ZIP containing attendance sheet + all event images.
- [ ] Frontend: Update `WebinarCompletedDetailsForm.jsx` to actually submit `attendanceSheet` (base64) instead of only `attendanceData`.
- [ ] Frontend: Update `Adminpage.jsx` to add a new tab/view "Webinar Details Active Page":
  - [ ] Render table columns: Phase ID, Department, Webinar Topic, Webinar Date, Registered Count, Attended Count, Documents.
  - [ ] In Documents column render clickable "Download" link that triggers ZIP download for that webinar.
- [ ] Frontend/Backend: Add API endpoint to fetch table rows for the active page (phaseId, department, topic, date, counts, docs existence / webinarId).
- [ ] Test end-to-end: submit completion form, then verify admin table shows download link and downloaded ZIP contains required files.

