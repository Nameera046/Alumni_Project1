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

// Placement imports - matching your App.js exactly
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

// Mentorship imports - adjust paths based on your structure
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

// Name-to-ID mapping for readable URLs (kebab-case → numeric ID)
export const SCREEN_NAMES = {
  // Webinar screens
  'webinar-dashboard': 1,
  'student-request-form': 2,
  'webinar-speaker-assignment': 3,
  'webinar-events': 4,
  'webinar-completed-details': 6,
  'webinar-student-feedback': 8,
  'topic-approval': 9,
  'webinar-circular': 10,
  'webinar-certificate': 11,
  'webinar-adminpage': 12,

  // Placement screens
  'placement-dashboard': 24,
  'placement-admin-dashboard': 30,
  'assigned-companies': 31,
  'placement-feedback-form': 32,
  'requester-feedback-form': 33,
  'alumni-feedback-display': 34,
  'alumni-job-requests-display': 35,
  'company-registration': 36,
  'companies': 37,
  'interview-results': 38,
  'interview-results-view': 39,
  'placement-data-request': 40,
  
  // Mentorship screens
  'mentorship-dashboard': 13,
  'dashboard': 14,
  'menteeregistration': 15,
  'mentorregistration': 16,
  'menteementor-assign': 17,
  'mentor-scheduling': 18,
  'meeting-updatation': 19,
  'program-feedback': 20,
  'scheduled-dashboard': 21,
  'admin-dashboard': 22,
  'co-ordinator': 23,
};

export const getScreenIdByName = (screenName) => {
  if (!screenName) return null;
  const normalized = screenName.toLowerCase().trim().replace(/[_ ]/g, '-');
  return SCREEN_NAMES[normalized] || null;
};

export const getScreenPath = (screenNameOrId) => {
  if (screenNameOrId === null || screenNameOrId === undefined || screenNameOrId === '') {
    return null;
  }

  if (typeof screenNameOrId === 'number') {
    return `/${screenNameOrId}`;
  }

  const trimmedValue = String(screenNameOrId).trim();
  if (!trimmedValue) return null;

  if (/^\d+$/.test(trimmedValue)) {
    return `/${trimmedValue}`;
  }

  const screenId = getScreenIdByName(trimmedValue);
  return screenId ? `/${screenId}` : trimmedValue;
};

// RoleId to screen name mapping for admin navigation
export const ROLE_SCREEN_MAP = {
  2: 'student-request-form', // Student Coordinator
  3: 'webinar-dashboard', // Webinar Coordinator
  9: 'placement-dashboard', // Placement Coordinator
  14: 'dashboard', // Mentorship Coordinator (general dashboard)
};

export const getScreenNameByRoleId = (roleId) => {
  return ROLE_SCREEN_MAP[roleId] || null;
};

export const SCREEN_COMPONENTS = {
  // Webinar screens
  1: WebinarDashboard,    // Webinar Dashboard
  2: StudentRequestForm,  // Student Request Form  
  3: WebinarSpeakerAssignmentForm, // Speaker Assignment Form
  4: WebinarEvents,       // Webinar Events
  6: WebinarCompletedDetailsForm, // Webinar Completed Details Upload
  8: WebinarStudentFeedbackForm, // Student Feedback Form
  9: TopicApprovalForm,   // Topic Approval Form
  10: WebinarCircular,    // Webinar Circular
  11: WebinarCertificate, // Webinar Certificate
  12: Adminpage,          // Admin Page (Webinar)
  
  // Placement screens - using exact component names from App.js
  24: PlacementDashboard,           // Placement Dashboard
  30: PlacementAdminDashboard,      // Placement Admin Dashboard
  31: AssignedCompanies,            // Assigned Companies
  32: PlacementFeedbackForm,        // Placement Feedback Form
  33: RequesterFeedbackForm,        // Requester Feedback Form
  34: AlumniFeedbackDisplay,        // Alumni Feedback Display
  35: AlumniJobRequestsDisplay,     // Alumni Job Requests Display
  36: CompanyRegistrationForm,      // Company Registration
  37: Companies,                    // Companies List
  38: InterviewResults,             // Interview Results
  39: InterviewResultsView,         // Interview Results View
  40: PlacementDataRequestForm,     // Placement Data Request
  
  // Mentorship screens
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

// Webinar screen IDs constant
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

// Placement screen IDs constant - matching your App.js component names
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

// Mentorship screen IDs constant
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

// Combined screen IDs for convenience
export const SCREEN_IDS = {
  ...WEBINAR_SCREEN_IDS,
  ...PLACEMENT_SCREEN_IDS,
  ...MENTORSHIP_SCREEN_IDS,
};
