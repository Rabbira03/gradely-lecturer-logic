/**
 * Validation Utilities
 * Provides validation functions for lecturer, student, and marks data
 * @module validation
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (10-15 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Validate password strength
 * Must be at least 8 characters with uppercase, lowercase, and number
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is valid
 */
export const isValidPassword = (password) => {
  if (password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUppercase && hasLowercase && hasNumber;
};

/**
 * Validate lecturer registration data
 * @param {Object} lecturerData - Lecturer data to validate
 * @param {string} lecturerData.name - Lecturer's name
 * @param {string} lecturerData.email - Lecturer's email
 * @param {string} lecturerData.phone - Lecturer's phone
 * @param {string} lecturerData.password - Lecturer's password
 * @returns {ValidationResult} Validation result
 */
export const validateLecturerData = (lecturerData) => {
  const errors = [];

  if (!lecturerData.name || lecturerData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!lecturerData.email || !isValidEmail(lecturerData.email)) {
    errors.push('Valid email address is required');
  }

  if (!lecturerData.phone || !isValidPhone(lecturerData.phone)) {
    errors.push('Valid phone number (10-15 digits) is required');
  }

  if (!lecturerData.password || !isValidPassword(lecturerData.password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  if (lecturerData.courseId && lecturerData.courseId.trim().length === 0) {
    errors.push('Course ID cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate marks for a specific assessment type
 * @param {string} assessmentType - Type of assessment
 * @param {number} marks - Marks value
 * @returns {ValidationResult} Validation result
 */
export const validateAssessmentMarks = (assessmentType, marks) => {
  const errors = [];
  const maxMarks = {
    assignment: 10,
    quiz: 15,
    project: 25,
    midsem: 20,
    finalExam: 30,
  };

  if (typeof marks !== 'number' || isNaN(marks)) {
    errors.push('Marks must be a valid number');
    return { isValid: false, errors };
  }

  if (marks < 0) {
    errors.push('Marks cannot be negative');
  }

  const max = maxMarks[assessmentType];
  if (!max) {
    errors.push(`Invalid assessment type: ${assessmentType}`);
  } else if (marks > max) {
    errors.push(`Marks cannot exceed ${max} for ${assessmentType}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate all marks for a student
 * @param {Object} marksData - Complete marks data
 * @param {number} marksData.assignment - Assignment marks
 * @param {number} marksData.quiz - Quiz marks
 * @param {number} marksData.project - Project marks
 * @param {number} marksData.midsem - Midsem marks
 * @param {number} marksData.finalExam - Final exam marks
 * @returns {ValidationResult} Validation result
 */
export const validateStudentMarks = (marksData) => {
  const errors = [];

  const assessments = [
    { type: 'assignment', value: marksData.assignment },
    { type: 'quiz', value: marksData.quiz },
    { type: 'project', value: marksData.project },
    { type: 'midsem', value: marksData.midsem },
    { type: 'finalExam', value: marksData.finalExam },
  ];

  assessments.forEach(({ type, value }) => {
    const result = validateAssessmentMarks(type, value);
    if (!result.isValid) {
      errors.push(...result.errors);
    }
  });

  if (!marksData.studentId || marksData.studentId.trim().length === 0) {
    errors.push('Student ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate bulk marks entry data
 * @param {string[]} studentIds - Array of student IDs
 * @param {string} assessmentType - Assessment type
 * @param {number} marks - Marks value
 * @returns {ValidationResult} Validation result
 */
export const validateBulkMarksEntry = (studentIds, assessmentType, marks) => {
  const errors = [];

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    errors.push('At least one student ID is required');
  }

  if (studentIds.some(id => !id || id.trim().length === 0)) {
    errors.push('All student IDs must be valid');
  }

  const marksValidation = validateAssessmentMarks(assessmentType, marks);
  if (!marksValidation.isValid) {
    errors.push(...marksValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate login credentials
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {ValidationResult} Validation result
 */
export const validateLoginCredentials = (email, password) => {
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email address is required');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize string input (remove dangerous characters)
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

export default {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  validateLecturerData,
  validateAssessmentMarks,
  validateStudentMarks,
  validateBulkMarksEntry,
  validateLoginCredentials,
  sanitizeInput,
};
