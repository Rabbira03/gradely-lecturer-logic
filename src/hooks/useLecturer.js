/**
 * Custom React Hooks for Lecturer Operations
 * Provides reusable hooks for lecturer functionality
 * @module useLecturer
 */

import { useState, useEffect, useCallback } from 'react';
import lecturerApi from '../services/lecturerApi.js';

/**
 * Hook for lecturer authentication
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = lecturerApi.getAuthToken();
    const storedUser = localStorage.getItem('lecturer_user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await lecturerApi.loginLecturer({ email, password });
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      }
      setError('Login failed');
      return false;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    lecturerApi.logoutLecturer();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await lecturerApi.registerLecturer(data);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { isAuthenticated, user, loading, error, login, logout, register };
};

/**
 * Hook for managing offerings and students
 * @returns {Object} State and methods
 */
export const useLecturerData = () => {
  const [offerings, setOfferings] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOfferings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await lecturerApi.fetchLecturerOfferings();
      setOfferings(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (offeringId) => {
    if (!offeringId) return;
    setLoading(true);
    setSelectedOfferingId(offeringId);
    try {
      const data = await lecturerApi.fetchStudentsByOffering(offeringId);
      setStudents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    offerings,
    students,
    selectedOfferingId,
    loading,
    error,
    fetchOfferings,
    fetchStudents,
  };
};

/**
 * Hook for managing marks
 * @returns {Object} Marks state and methods
 */
export const useMarks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitMarks = useCallback(async (marksData) => {
    setLoading(true);
    setError(null);
    try {
      // marksData should be array of { assessmentId, studentId, score, offeringId }
      const response = await lecturerApi.submitMarksBatch(marksData);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportCsv = useCallback(async (offeringId) => {
    try {
      const csv = await lecturerApi.exportMarksCsv(offeringId);
      // Trigger download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marks_offering_${offeringId}.csv`;
      a.click();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const fetchMarks = useCallback(async (offeringId) => {
    try {
      const data = await lecturerApi.fetchMarksByOffering(offeringId);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  return { loading, error, submitMarks, fetchMarks, exportCsv };
};

/**
 * Hook for managing issues
 */
export const useIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await lecturerApi.fetchIssues();
      setIssues(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveIssue = useCallback(async (issueId) => {
    try {
      const result = await lecturerApi.resolveIssue(issueId);
      if (result.success) {
        // Update local state
        setIssues(prev => prev.map(issue =>
          issue._id === issueId ? { ...issue, status: 'resolved' } : issue
        ));
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  return { issues, loading, error, fetchIssues, resolveIssue };
};

export default {
  useAuth,
  useLecturerData,
  useMarks,
  useIssues,
};
