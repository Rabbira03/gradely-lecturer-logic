/**
 * Lecturer API Service
 * Handles all backend communication for lecturer operations
 * @module lecturerApi
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';

/**
 * @typedef {Object} LecturerData
 * @property {string} name - Lecturer's full name
 * @property {string} email - Lecturer's email address
 * @property {string} phone - Lecturer's phone number
 * @property {string} password - Lecturer's password
 * @property {string} courseId - ID of the course the lecturer teaches
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether authentication was successful
 * @property {string} token - Authentication token
 * @property {Object} lecturer - Lecturer data
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} StudentMarks
 * @property {string} studentId - Student's ID
 * @property {number} assignment - Assignment marks (/10)
 * @property {number} quiz - Quiz marks (/15)
 * @property {number} project - Project marks (/25)
 * @property {number} midsem - Midsem marks (/20)
 * @property {number} finalExam - Final exam marks (/30)
 */

/**
 * Get authentication token from localStorage
 * @returns {string|null} Authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem('lecturer_auth_token');
};

/**
 * Set authentication token in localStorage
 * @param {string} token - Authentication token
 */
const setAuthToken = (token) => {
  localStorage.setItem('lecturer_auth_token', token);
};

/**
 * Remove authentication token from localStorage
 */
const removeAuthToken = () => {
  localStorage.removeItem('lecturer_auth_token');
};

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 * @throws {Error} If request fails
 */
const authenticatedFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};

/**
 * Register a new lecturer
 * @param {LecturerData} lecturerData - Lecturer registration data
 * @returns {Promise<Object>} Registration response
 */
export const registerLecturer = async (lecturerData) => {
  return authenticatedFetch('/lecturers/register', {
    method: 'POST',
    body: JSON.stringify(lecturerData),
  });
};

/**
 * Register multiple lecturers in bulk
 * @param {LecturerData[]} lecturersData - Array of lecturer data
 * @returns {Promise<Object>} Bulk registration response
 */
export const registerBulkLecturers = async (lecturersData) => {
  return authenticatedFetch('/lecturers/register/bulk', {
    method: 'POST',
    body: JSON.stringify({ lecturers: lecturersData }),
  });
};

/**
 * Login lecturer
 * @param {string} email - Lecturer's email
 * @param {string} password - Lecturer's password
 * @returns {Promise<AuthResponse>} Authentication response
 */
export const loginLecturer = async (email, password) => {
  const response = await authenticatedFetch('/lecturers/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.success && response.token) {
    setAuthToken(response.token);
  }

  return response;
};

/**
 * Logout lecturer
 * @returns {Promise<void>}
 */
export const logoutLecturer = async () => {
  try {
    await authenticatedFetch('/lecturers/logout', {
      method: 'POST',
    });
  } finally {
    removeAuthToken();
  }
};

/**
 * Validate authentication token
 * @returns {Promise<boolean>} Whether token is valid
 */
export const validateToken = async () => {
  try {
    const response = await authenticatedFetch('/lecturers/validate-token');
    return response.valid === true;
  } catch (error) {
    removeAuthToken();
    return false;
  }
};

/**
 * Refresh authentication token
 * @returns {Promise<string>} New authentication token
 */
export const refreshToken = async () => {
  const response = await authenticatedFetch('/lecturers/refresh-token', {
    method: 'POST',
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response.token;
};

/**
 * Fetch all students registered under lecturer's unit
 * @param {string} lecturerId - Lecturer's ID
 * @returns {Promise<Object[]>} Array of students
 */
export const fetchStudentsByLecturer = async (lecturerId) => {
  return authenticatedFetch(`/lecturers/${lecturerId}/students`);
};

/**
 * Fetch specific student details
 * @param {string} studentId - Student's ID
 * @returns {Promise<Object>} Student details
 */
export const fetchStudentDetails = async (studentId) => {
  return authenticatedFetch(`/students/${studentId}`);
};

/**
 * Fetch student marks
 * @param {string} studentId - Student's ID
 * @returns {Promise<Object>} Student marks data
 */
export const fetchStudentMarks = async (studentId) => {
  return authenticatedFetch(`/students/${studentId}/marks`);
};

/**
 * Enter marks for a student
 * @param {StudentMarks} marksData - Marks data
 * @returns {Promise<Object>} Response with saved marks
 */
export const enterStudentMarks = async (marksData) => {
  return authenticatedFetch('/marks/enter', {
    method: 'POST',
    body: JSON.stringify(marksData),
  });
};

/**
 * Update existing marks for a student
 * @param {string} marksId - Marks record ID
 * @param {StudentMarks} marksData - Updated marks data
 * @returns {Promise<Object>} Response with updated marks
 */
export const updateStudentMarks = async (marksId, marksData) => {
  return authenticatedFetch(`/marks/${marksId}`, {
    method: 'PUT',
    body: JSON.stringify(marksData),
  });
};

/**
 * Bulk entry - apply same assessment mark to multiple students
 * @param {string[]} studentIds - Array of student IDs
 * @param {string} assessmentType - Type of assessment (assignment, quiz, project, midsem, finalExam)
 * @param {number} marks - Marks to apply
 * @returns {Promise<Object>} Bulk update response
 */
export const bulkEnterMarks = async (studentIds, assessmentType, marks) => {
  return authenticatedFetch('/marks/bulk-enter', {
    method: 'POST',
    body: JSON.stringify({
      studentIds,
      assessmentType,
      marks,
    }),
  });
};

/**
 * Fetch all students with their marks for a lecturer
 * @param {string} lecturerId - Lecturer's ID
 * @returns {Promise<Object[]>} Array of students with marks
 */
export const fetchStudentsWithMarks = async (lecturerId) => {
  return authenticatedFetch(`/lecturers/${lecturerId}/students-with-marks`);
};

/**
 * Calculate class statistics for a lecturer
 * @param {string} lecturerId - Lecturer's ID
 * @returns {Promise<Object>} Statistics (average, highest, lowest, passRate)
 */
export const fetchClassStatistics = async (lecturerId) => {
  return authenticatedFetch(`/lecturers/${lecturerId}/statistics`);
};

export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  registerLecturer,
  registerBulkLecturers,
  loginLecturer,
  logoutLecturer,
  validateToken,
  refreshToken,
  fetchStudentsByLecturer,
  fetchStudentDetails,
  fetchStudentMarks,
  enterStudentMarks,
  updateStudentMarks,
  bulkEnterMarks,
  fetchStudentsWithMarks,
  fetchClassStatistics,
};
