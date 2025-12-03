/**
 * Grading Utilities
 * Handles grade calculation, total marks computation, and statistics
 * @module grading
 */

/**
 * @typedef {Object} MarksBreakdown
 * @property {number} assignment - Assignment marks (/10)
 * @property {number} quiz - Quiz marks (/15)
 * @property {number} project - Project marks (/25)
 * @property {number} midsem - Midsem marks (/20)
 * @property {number} finalExam - Final exam marks (/30)
 */

/**
 * @typedef {Object} GradedResult
 * @property {number} total - Total marks (/100)
 * @property {string} grade - Letter grade
 * @property {boolean} passed - Whether student passed
 */

/**
 * Maximum marks for each assessment type
 */
export const MAX_MARKS = {
  assignment: 10,
  quiz: 15,
  project: 25,
  midsem: 20,
  finalExam: 30,
  total: 100,
};

/**
 * Grading scale boundaries
 */
export const GRADE_SCALE = [
  { grade: 'A', min: 90, max: 100 },
  { grade: 'A-', min: 87, max: 89 },
  { grade: 'B+', min: 84, max: 86 },
  { grade: 'B', min: 80, max: 83 },
  { grade: 'B-', min: 77, max: 79 },
  { grade: 'C+', min: 74, max: 76 },
  { grade: 'C', min: 70, max: 73 },
  { grade: 'C-', min: 67, max: 69 },
  { grade: 'D+', min: 64, max: 66 },
  { grade: 'D', min: 62, max: 63 },
  { grade: 'D-', min: 60, max: 61 },
  { grade: 'F', min: 0, max: 59 },
];

/**
 * Passing grade threshold
 */
export const PASSING_GRADE = 60;

/**
 * Calculate total marks from individual assessments
 * @param {MarksBreakdown} marks - Individual assessment marks
 * @returns {number} Total marks (0-100)
 */
export const calculateTotal = (marks) => {
  const total =
    (marks.assignment || 0) +
    (marks.quiz || 0) +
    (marks.project || 0) +
    (marks.midsem || 0) +
    (marks.finalExam || 0);

  return Math.min(total, MAX_MARKS.total);
};

/**
 * Calculate grade based on total marks
 * @param {number} total - Total marks (0-100)
 * @returns {string} Letter grade (A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F)
 */
export const calculateGrade = (total) => {
  const gradeEntry = GRADE_SCALE.find(
    entry => total >= entry.min && total <= entry.max
  );
  return gradeEntry ? gradeEntry.grade : 'F';
};

/**
 * Check if student passed
 * @param {number} total - Total marks
 * @returns {boolean} True if student passed
 */
export const hasPassed = (total) => {
  return total >= PASSING_GRADE;
};

/**
 * Calculate complete grading result
 * @param {MarksBreakdown} marks - Individual assessment marks
 * @returns {GradedResult} Complete grading result
 */
export const calculateGradingResult = (marks) => {
  const total = calculateTotal(marks);
  const grade = calculateGrade(total);
  const passed = hasPassed(total);

  return {
    total,
    grade,
    passed,
  };
};

/**
 * Calculate average marks from array of students
 * @param {Object[]} studentsMarks - Array of student marks objects
 * @returns {number} Average total marks
 */
export const calculateAverage = (studentsMarks) => {
  if (!studentsMarks || studentsMarks.length === 0) return 0;

  const totals = studentsMarks.map(student => calculateTotal(student));
  const sum = totals.reduce((acc, total) => acc + total, 0);

  return parseFloat((sum / studentsMarks.length).toFixed(2));
};

/**
 * Find highest marks from array of students
 * @param {Object[]} studentsMarks - Array of student marks objects
 * @returns {number} Highest total marks
 */
export const findHighest = (studentsMarks) => {
  if (!studentsMarks || studentsMarks.length === 0) return 0;

  const totals = studentsMarks.map(student => calculateTotal(student));
  return Math.max(...totals);
};

/**
 * Find lowest marks from array of students
 * @param {Object[]} studentsMarks - Array of student marks objects
 * @returns {number} Lowest total marks
 */
export const findLowest = (studentsMarks) => {
  if (!studentsMarks || studentsMarks.length === 0) return 0;

  const totals = studentsMarks.map(student => calculateTotal(student));
  return Math.min(...totals);
};

/**
 * Calculate pass rate
 * @param {Object[]} studentsMarks - Array of student marks objects
 * @returns {number} Pass rate as percentage (0-100)
 */
export const calculatePassRate = (studentsMarks) => {
  if (!studentsMarks || studentsMarks.length === 0) return 0;

  const passedCount = studentsMarks.filter(student => {
    const total = calculateTotal(student);
    return hasPassed(total);
  }).length;

  return parseFloat(((passedCount / studentsMarks.length) * 100).toFixed(2));
};

/**
 * Calculate comprehensive class statistics
 * @param {Object[]} studentsMarks - Array of student marks objects
 * @returns {Object} Statistics object
 */
export const calculateClassStatistics = (studentsMarks) => {
  return {
    average: calculateAverage(studentsMarks),
    highest: findHighest(studentsMarks),
    lowest: findLowest(studentsMarks),
    passRate: calculatePassRate(studentsMarks),
    totalStudents: studentsMarks.length,
    passedStudents: studentsMarks.filter(student => hasPassed(calculateTotal(student))).length,
    failedStudents: studentsMarks.filter(student => !hasPassed(calculateTotal(student))).length,
  };
};

/**
 * Get grade distribution
 * @param {Object[]} studentsMarks - Array of student marks objects
 * @returns {Object} Grade distribution (count per grade)
 */
export const getGradeDistribution = (studentsMarks) => {
  const distribution = {};

  GRADE_SCALE.forEach(entry => {
    distribution[entry.grade] = 0;
  });

  studentsMarks.forEach(student => {
    const total = calculateTotal(student);
    const grade = calculateGrade(total);
    distribution[grade]++;
  });

  return distribution;
};

/**
 * Calculate percentage for an assessment
 * @param {number} marks - Marks obtained
 * @param {string} assessmentType - Type of assessment
 * @returns {number} Percentage (0-100)
 */
export const calculateAssessmentPercentage = (marks, assessmentType) => {
  const maxMarks = MAX_MARKS[assessmentType];
  if (!maxMarks) return 0;

  return parseFloat(((marks / maxMarks) * 100).toFixed(2));
};

export default {
  MAX_MARKS,
  GRADE_SCALE,
  PASSING_GRADE,
  calculateTotal,
  calculateGrade,
  hasPassed,
  calculateGradingResult,
  calculateAverage,
  findHighest,
  findLowest,
  calculatePassRate,
  calculateClassStatistics,
  getGradeDistribution,
  calculateAssessmentPercentage,
};
