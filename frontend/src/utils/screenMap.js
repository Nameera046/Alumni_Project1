import WebinarDashboard from '../components/WebinarDashboard';
import StudentRequestForm from '../components/webinar/StudentRequestForm';
import WebinarSpeakerAssignmentForm from '../components/webinar/WebinarSpeakerAssignmentForm';
import WebinarEvents from '../components/webinar/WebinarEvents';
import WebinarCompletedDetailsForm from '../components/webinar/WebinarCompletedDetailsForm';
import WebinarStudentFeedbackForm from '../components/webinar/WebinarStudentFeedbackForm';
import TopicApprovalForm from '../components/webinar/TopicApprovalForm';
import WebinarCircular from '../components/webinar/WebinarCircular';
import WebinarCertificate from '../components/webinar/WebinarCertificate';
import Adminpage from '../components/webinar/Adminpage';

import PlacementAdminDashboard from '../components/placement/AdminDashboard';
import AssignedCompanies from '../components/placement/AssignedCompanies';
import CompanyRegistrationForm from '../components/placement/CompanyRegistrationForm';
import Companies from '../components/placement/companies';
import InterviewResults from '../components/placement/InterviewResults';
import InterviewResultsView from '../components/placement/InterviewResultsView';
import PlacementDataRequestForm from '../components/placement/PlacementDataRequestForm';
import PlacementFeedbackForm from '../components/placement/PlacementFeedbackForm';
import RequesterFeedbackForm from '../components/placement/RequesterFeedbackForm';
import AlumniFeedbackDisplay from '../components/placement/AlumniFeedbackDisplay';
import AlumniJobRequestsDisplay from '../components/placement/AlumniJobRequestsDisplay';
import PlacementDashboard from '../components/placement/PlacementDashboard';

import MenteeRegistration from '../components/mentorship/MenteeRegistration';
import MentorRegistration from '../components/mentorship/MentorRegistration';
import MenteeMentorAssignment from '../components/mentorship/Mentee-Mentor';
import MentorshipSchedulingForm from '../components/mentorship/Mentor_scheduling';
import MeetingStatusUpdateForm from '../components/mentorship/Meeting_Status';
import ProgramFeedbackForm from '../components/mentorship/Feedback';
import Dashboard from '../components/mentorship/Dashboard';
import ScheduledDashboard from '../components/mentorship/ScheduledDashboard';
import LoginPage1 from '../components/mentorship/LoginPage';
import MentorshipAdminDashboard from '../components/mentorship/AdminDashboard';
import MentorshipDashboard from '../components/mentorship/MentorshipDashboard';
import {
  SCREEN_NAMES,
  getScreenIdByName,
  getScreenPath,
  ROLE_SCREEN_MAP,
  getScreenNameByRoleId,
} from './screenPaths';

export {
  SCREEN_NAMES,
  getScreenIdByName,
  getScreenPath,
  ROLE_SCREEN_MAP,
  getScreenNameByRoleId,
};

export const SCREEN_COMPONENTS = {
  1: WebinarDashboard,
  2: StudentRequestForm,
  3: WebinarSpeakerAssignmentForm,
  4: WebinarEvents,
  6: WebinarCompletedDetailsForm,
  8: WebinarStudentFeedbackForm,
  9: TopicApprovalForm,
  10: WebinarCircular,
  11: WebinarCertificate,
  12: Adminpage,
  24: PlacementDashboard,
  30: PlacementAdminDashboard,
  31: AssignedCompanies,
  32: PlacementFeedbackForm,
  33: RequesterFeedbackForm,
  34: AlumniFeedbackDisplay,
  35: AlumniJobRequestsDisplay,
  36: CompanyRegistrationForm,
  37: Companies,
  38: InterviewResults,
  39: InterviewResultsView,
  40: PlacementDataRequestForm,
  13: MentorshipDashboard,
  14: Dashboard,
  15: MenteeRegistration,
  16: MentorRegistration,
  17: MenteeMentorAssignment,
  18: MentorshipSchedulingForm,
  19: MeetingStatusUpdateForm,
  20: ProgramFeedbackForm,
  21: ScheduledDashboard,
  22: MentorshipAdminDashboard,
  23: MentorshipDashboard,
};

export const getScreenComponent = (screenId) => {
  return SCREEN_COMPONENTS[screenId];
};

export const WEBINAR_SCREEN_IDS = {
  DASHBOARD: 1,
  STUDENT_REQUEST: 2,
  SPEAKER_ASSIGNMENT: 3,
  EVENTS: 4,
  COMPLETED_DETAILS: 6,
  STUDENT_FEEDBACK: 8,
  TOPIC_APPROVAL: 9,
  CIRCULAR: 10,
  CERTIFICATE: 11,
  ADMIN: 12,
};

export const PLACEMENT_SCREEN_IDS = {
  DASHBOARD: 24,
  ADMIN_DASHBOARD: 30,
  ASSIGNED_COMPANIES: 31,
  PLACEMENT_FEEDBACK_FORM: 32,
  REQUESTER_FEEDBACK_FORM: 33,
  ALUMNI_FEEDBACK_DISPLAY: 34,
  ALUMNI_JOB_REQUESTS_DISPLAY: 35,
  COMPANY_REGISTRATION: 36,
  COMPANIES: 37,
  INTERVIEW_RESULTS: 38,
  INTERVIEW_RESULTS_VIEW: 39,
  PLACEMENT_DATA_REQUEST: 40,
};

export const MENTORSHIP_SCREEN_IDS = {
  MENTORSHIP_DASHBOARD: 13,
  DASHBOARD: 14,
  MENTEE_REGISTRATION: 15,
  MENTOR_REGISTRATION: 16,
  MENTEE_MENTOR_ASSIGN: 17,
  MENTOR_SCHEDULING: 18,
  MEETING_UPDATION: 19,
  PROGRAM_FEEDBACK: 20,
  SCHEDULED_DASHBOARD: 21,
  ADMIN_DASHBOARD: 22,
  COORDINATOR: 23,
};

export const SCREEN_IDS = {
  ...WEBINAR_SCREEN_IDS,
  ...PLACEMENT_SCREEN_IDS,
  ...MENTORSHIP_SCREEN_IDS,
};
