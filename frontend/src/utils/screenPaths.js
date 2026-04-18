export const SCREEN_NAMES = {
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

export const ROLE_SCREEN_MAP = {
  2: 'student-request-form',
  3: 'webinar-dashboard',
  9: 'placement-dashboard',
  14: 'dashboard',
};

export const getScreenNameByRoleId = (roleId) => {
  return ROLE_SCREEN_MAP[roleId] || null;
};
