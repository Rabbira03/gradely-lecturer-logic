/**
 * Lecturer API Service
 * Handles all backend communication for lecturer operations
 * @module lecturerApi
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} fullName - User full name
 * @property {string} staffNo - Lecturer staff number
 */

/**
 * @typedef {Object} MarkEntry
 * @property {string} assessmentId - ID of the assessment (e.g. assignment ID)
 * @property {string} studentId - ID of the student
 * @property {number} score - Score obtained
 * @property {string} offeringId - ID of the course offering
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
 * @param {Object} user - User data
 */
const setAuthSession = (token, user) => {
  localStorage.setItem('lecturer_auth_token', token);
  localStorage.setItem('lecturer_user', JSON.stringify(user));
};

/**
 * Remove authentication token from localStorage
 */
const clearAuthSession = () => {
  localStorage.removeItem('lecturer_auth_token');
  localStorage.removeItem('lecturer_user');
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
 * @param {RegisterData} data - Registration data
 * @returns {Promise<Object>} Registration response
 */
export const registerLecturer = async (data) => {
  return authenticatedFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      role: 'lecturer', // Enforce lecturer role
    }),
  });
};

/**
 * Login lecturer
 * @param {LoginCredentials} credentials - Login credentials
 * @returns {Promise<Object>} Authentication response
 */
export const loginLecturer = async ({ email, password }) => {
  const response = await authenticatedFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.success && response.data?.token) {
    setAuthSession(response.data.token, response.data.user);
  }

  return response;
};

/**
 * Logout lecturer
 */
export const logoutLecturer = () => {
  clearAuthSession();
  // No backend logout endpoint specified in docs, so we just clear local session
  return Promise.resolve({ success: true });
};

/**
 * Get offerings (courses) taught by the lecturer
 * @returns {Promise<Object[]>} List of offerings
 */
export const fetchLecturerOfferings = async () => {
  return authenticatedFetch('/lecturer/offerings');
};

/**
 * Get students enrolled in a specific offering
 * @param {string} offeringId - ID of the offering
 * @returns {Promise<Object[]>} List of students
 */
export const fetchStudentsByOffering = async (offeringId) => {
  return authenticatedFetch(`/lecturer/offerings/${offeringId}/students`);
};

/**
 * Submit marks (batch)
 * @param {MarkEntry[]} marks - Array of mark entries
 * @returns {Promise<Object>} Response
 */
export const submitMarksBatch = async (marks) => {
  return authenticatedFetch('/lecturer/marks/batch', {
    method: 'POST',
    body: JSON.stringify(marks),
  });
};

/**
 * Export marks to CSV
 * @param {string} offeringId - ID of the offering
 * @returns {Promise<string>} CSV content (or blob url)
 */
export const exportMarksCsv = async (offeringId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/lecturer/offerings/${offeringId}/marks/export?format=csv`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.text();
};

export default {
  getAuthToken,
  setAuthSession,
  clearAuthSession,
  registerLecturer,
  loginLecturer,
  logoutLecturer,
  fetchLecturerOfferings,
  fetchStudentsByOffering,
  submitMarksBatch,
  exportMarksCsv,
};
