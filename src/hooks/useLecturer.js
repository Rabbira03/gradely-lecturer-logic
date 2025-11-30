/**
 * Custom React Hooks for Lecturer Operations
 * Provides reusable hooks for lecturer functionality
 * @module useLecturer
 */

import { useState, useEffect, useCallback } from 'react';
import * as lecturerApi from '../services/lecturerApi.js';
import { validateLecturerData, validateStudentMarks, validateBulkMarksEntry } from '../utils/validation.js';
import { calculateGradingResult, calculateClassStatistics } from '../utils/grading.js';

/**
 * Hook for lecturer authentication
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = lecturerApi.getAuthToken();
      if (token) {
        try {
          const isValid = await lecturerApi.validateToken();
          setIsAuthenticated(isValid);
          if (!isValid) {
            lecturerApi.removeAuthToken();
          }
        } catch (err) {
          setIsAuthenticated(false);
          lecturerApi.removeAuthToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Login lecturer
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {Promise<boolean>} Success status
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await lecturerApi.loginLecturer(email, password);
      
      if (response.success) {
        setIsAuthenticated(true);
        setLecturer(response.lecturer);
        return true;
      } else {
        setError(response.error || 'Login failed');
        return false;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout lecturer
   */
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await lecturerApi.logoutLecturer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setLecturer(null);
      setLoading(false);
    }
  }, []);

  /**
   * Register new lecturer
   * @param {Object} lecturerData - Lecturer data
   * @returns {Promise<Object>} Registration result
   */
  const register = useCallback(async (lecturerData) => {
    setLoading(true);
    setError(null);

    const validation = validateLecturerData(lecturerData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      setLoading(false);
      return { success: false, errors: validation.errors };
    }

    try {
      const response = await lecturerApi.registerLecturer(lecturerData);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    lecturer,
    loading,
    error,
    login,
    logout,
    register,
  };
};

/**
 * Hook for managing students
 * @param {string} lecturerId - Lecturer's ID
 * @returns {Object} Students state and methods
 */
export const useStudents = (lecturerId) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch students for lecturer
   */
  const fetchStudents = useCallback(async () => {
    if (!lecturerId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await lecturerApi.fetchStudentsByLecturer(lecturerId);
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [lecturerId]);

  /**
   * Fetch single student details
   * @param {string} studentId - Student's ID
   * @returns {Promise<Object|null>} Student data
   */
  const fetchStudent = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await lecturerApi.fetchStudentDetails(studentId);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch student');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch students when lecturerId changes
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    fetchStudents,
    fetchStudent,
  };
};

/**
 * Hook for managing student marks
 * @returns {Object} Marks state and methods
 */
export const useMarks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Enter marks for a student
   * @param {Object} marksData - Marks data
   * @returns {Promise<Object>} Result with calculated grade
   */
  const enterMarks = useCallback(async (marksData) => {
    setLoading(true);
    setError(null);

    const validation = validateStudentMarks(marksData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      setLoading(false);
      return { success: false, errors: validation.errors };
    }

    try {
      const response = await lecturerApi.enterStudentMarks(marksData);
      const gradingResult = calculateGradingResult(marksData);
      
      return {
        success: true,
        data: response,
        ...gradingResult,
      };
    } catch (err) {
      setError(err.message || 'Failed to enter marks');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing marks
   * @param {string} marksId - Marks record ID
   * @param {Object} marksData - Updated marks data
   * @returns {Promise<Object>} Result with calculated grade
   */
  const updateMarks = useCallback(async (marksId, marksData) => {
    setLoading(true);
    setError(null);

    const validation = validateStudentMarks(marksData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      setLoading(false);
      return { success: false, errors: validation.errors };
    }

    try {
      const response = await lecturerApi.updateStudentMarks(marksId, marksData);
      const gradingResult = calculateGradingResult(marksData);
      
      return {
        success: true,
        data: response,
        ...gradingResult,
      };
    } catch (err) {
      setError(err.message || 'Failed to update marks');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Bulk enter marks for multiple students
   * @param {string[]} studentIds - Array of student IDs
   * @param {string} assessmentType - Assessment type
   * @param {number} marks - Marks value
   * @returns {Promise<Object>} Result
   */
  const bulkEnter = useCallback(async (studentIds, assessmentType, marks) => {
    setLoading(true);
    setError(null);

    const validation = validateBulkMarksEntry(studentIds, assessmentType, marks);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      setLoading(false);
      return { success: false, errors: validation.errors };
    }

    try {
      const response = await lecturerApi.bulkEnterMarks(studentIds, assessmentType, marks);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message || 'Failed to bulk enter marks');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch marks for a student
   * @param {string} studentId - Student's ID
   * @returns {Promise<Object|null>} Marks data with grading
   */
  const fetchMarks = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await lecturerApi.fetchStudentMarks(studentId);
      const gradingResult = calculateGradingResult(data);
      
      return {
        ...data,
        ...gradingResult,
      };
    } catch (err) {
      setError(err.message || 'Failed to fetch marks');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    enterMarks,
    updateMarks,
    bulkEnter,
    fetchMarks,
  };
};

/**
 * Hook for class statistics and reporting
 * @param {string} lecturerId - Lecturer's ID
 * @returns {Object} Statistics state and methods
 */
export const useClassStatistics = (lecturerId) => {
  const [statistics, setStatistics] = useState(null);
  const [studentsWithMarks, setStudentsWithMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch students with marks and calculate statistics
   */
  const fetchStatistics = useCallback(async () => {
    if (!lecturerId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await lecturerApi.fetchStudentsWithMarks(lecturerId);
      setStudentsWithMarks(data);
      
      const stats = calculateClassStatistics(data.map(s => s.marks));
      setStatistics(stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [lecturerId]);

  // Auto-fetch statistics when lecturerId changes
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    studentsWithMarks,
    loading,
    error,
    fetchStatistics,
  };
};

export default {
  useAuth,
  useStudents,
  useMarks,
  useClassStatistics,
};
