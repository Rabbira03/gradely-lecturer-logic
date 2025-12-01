/**
 * Usage Examples for Group 4 (Frontend Developers)
 * Shows how to integrate the Lecturer Module Logic Layer
 * @module usageExamples
 */

import React, { useState, useEffect } from 'react';
import { useAuth, useStudents, useMarks, useClassStatistics } from '../hooks/useLecturer.js';
import { downloadCSV, generateAndPrintReport } from '../utils/printing.js';

/**
 * Example 1: Login Component
 * Shows how to use authentication logic
 */
export const LoginExample = () => {
    const { login, loading, error, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await login(email, password);

        if (success) {
            console.log('Login successful!');
            // Redirect to dashboard or show success message
        }
    };

    if (isAuthenticated) {
        return <div>Already logged in!</div>;
    }

    return (
        <form onSubmit={handleLogin}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
};

/**
 * Example 2: Student List Component
 * Shows how to fetch and display students
 */
export const StudentListExample = ({ lecturerId }) => {
    const { students, loading, error, fetchStudents } = useStudents(lecturerId);

    if (loading) {
        return <div>Loading students...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div>
            <h2>My Students ({students.length})</h2>
            <button onClick={fetchStudents}>Refresh</button>
            <ul>
                {students.map((student) => (
                    <li key={student.id}>
                        {student.name} - {student.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

/**
 * Example 3: Marks Entry Form
 * Shows how to enter marks for a student
 */
export const MarksEntryExample = ({ studentId }) => {
    const { enterMarks, loading, error } = useMarks();
    const [marks, setMarks] = useState({
        studentId: studentId,
        assignment: 0,
        quiz: 0,
        project: 0,
        midsem: 0,
        finalExam: 0,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await enterMarks(marks);

        if (result.success) {
            console.log('Marks entered successfully!');
            console.log('Total:', result.total);
            console.log('Grade:', result.grade);
            console.log('Passed:', result.passed);
            // Show success message with grade
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Enter Marks</h3>

            <label>
                Assignment (/10):
                <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={marks.assignment}
                    onChange={(e) => setMarks({ ...marks, assignment: parseFloat(e.target.value) })}
                />
            </label>

            <label>
                Quiz (/15):
                <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={marks.quiz}
                    onChange={(e) => setMarks({ ...marks, quiz: parseFloat(e.target.value) })}
                />
            </label>

            <label>
                Project (/25):
                <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={marks.project}
                    onChange={(e) => setMarks({ ...marks, project: parseFloat(e.target.value) })}
                />
            </label>

            <label>
                Midsem (/20):
                <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={marks.midsem}
                    onChange={(e) => setMarks({ ...marks, midsem: parseFloat(e.target.value) })}
                />
            </label>

            <label>
                Final Exam (/30):
                <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={marks.finalExam}
                    onChange={(e) => setMarks({ ...marks, finalExam: parseFloat(e.target.value) })}
                />
            </label>

            <button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Marks'}
            </button>

            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
};

/**
 * Example 4: Bulk Marks Entry
 * Shows how to enter same marks for multiple students
 */
export const BulkMarksEntryExample = ({ selectedStudentIds }) => {
    const { bulkEnter, loading, error } = useMarks();
    const [assessmentType, setAssessmentType] = useState('assignment');
    const [marks, setMarks] = useState(0);

    const handleBulkEntry = async (e) => {
        e.preventDefault();
        const result = await bulkEnter(selectedStudentIds, assessmentType, marks);

        if (result.success) {
            console.log('Bulk marks entered successfully!');
            // Show success message
        }
    };

    return (
        <form onSubmit={handleBulkEntry}>
            <h3>Bulk Marks Entry ({selectedStudentIds.length} students)</h3>

            <label>
                Assessment Type:
                <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}>
                    <option value="assignment">Assignment (/10)</option>
                    <option value="quiz">Quiz (/15)</option>
                    <option value="project">Project (/25)</option>
                    <option value="midsem">Midsem (/20)</option>
                    <option value="finalExam">Final Exam (/30)</option>
                </select>
            </label>

            <label>
                Marks:
                <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={marks}
                    onChange={(e) => setMarks(parseFloat(e.target.value))}
                />
            </label>

            <button type="submit" disabled={loading || selectedStudentIds.length === 0}>
                {loading ? 'Applying...' : 'Apply to All Selected'}
            </button>

            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
};

/**
 * Example 5: Class Statistics Dashboard
 * Shows how to display statistics and export data
 */
export const StatisticsDashboardExample = ({ lecturerId }) => {
    const { statistics, studentsWithMarks, loading, error } = useClassStatistics(lecturerId);

    const handleExportCSV = () => {
        downloadCSV(studentsWithMarks, 'class_marks.csv');
    };

    const handlePrintReport = () => {
        generateAndPrintReport(studentsWithMarks, {
            title: 'Class Marks Report',
            lecturerName: 'Dr. John Doe',
            courseName: 'Software Engineering',
            statistics: statistics,
        });
    };

    if (loading) {
        return <div>Loading statistics...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!statistics) {
        return <div>No data available</div>;
    }

    return (
        <div>
            <h2>Class Statistics</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                    <h4>Average Score</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{statistics.average}%</p>
                </div>

                <div>
                    <h4>Highest Score</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{statistics.highest}%</p>
                </div>

                <div>
                    <h4>Lowest Score</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{statistics.lowest}%</p>
                </div>

                <div>
                    <h4>Pass Rate</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{statistics.passRate}%</p>
                </div>

                <div>
                    <h4>Passed Students</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{statistics.passedStudents}</p>
                </div>

                <div>
                    <h4>Failed Students</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{statistics.failedStudents}</p>
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <button onClick={handleExportCSV}>Export to CSV</button>
                <button onClick={handlePrintReport} style={{ marginLeft: '10px' }}>
                    Print Report
                </button>
            </div>
        </div>
    );
};

/**
 * Example 6: Complete Dashboard Integration
 * Shows how to display statistics and export data
 */
export const CompleteDashboardExample = () => {
    const { isAuthenticated, lecturer, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('students');

    if (!isAuthenticated) {
        return <LoginExample />;
    }

    return (
        <div>
            <header>
                <h1>Lecturer Dashboard</h1>
                <p>Welcome, {lecturer?.name}!</p>
                <button onClick={logout}>Logout</button>
            </header>

            <nav>
                <button onClick={() => setActiveTab('students')}>Students</button>
                <button onClick={() => setActiveTab('marks')}>Enter Marks</button>
                <button onClick={() => setActiveTab('statistics')}>Statistics</button>
            </nav>

            <main>
                {activeTab === 'students' && (
                    <StudentListExample lecturerId={lecturer?.id} />
                )}

                {activeTab === 'marks' && (
                    <div>
                        <MarksEntryExample studentId="student-123" />
                        <BulkMarksEntryExample selectedStudentIds={['student-1', 'student-2']} />
                    </div>
                )}

                {activeTab === 'statistics' && (
                    <StatisticsDashboardExample lecturerId={lecturer?.id} />
                )}
            </main>
        </div>
    );
};

/**
 * INSTRUCTIONS FOR GROUP 4 (Frontend Developers)
 * 
 * 1. AUTHENTICATION:
 *    - Use useAuth() hook for login/logout/registration
 *    - Check isAuthenticated to show/hide protected content
 *    - See LoginExample for implementation
 * 
 * 2. STUDENTS:
 *    - Use useStudents(lecturerId) to fetch students
 *    - Students auto-load when component mounts
 *    - Call fetchStudents() to refresh manually
 *    - See StudentListExample for implementation
 * 
 * 3. MARKS ENTRY:
 *    - Use useMarks() for all marks operations
 *    - Call enterMarks() with complete marks object
 *    - Call updateMarks() with marksId and updated data
 *    - Call bulkEnter() for same marks to multiple students
 *    - Results include calculated total, grade, and pass status
 *    - See MarksEntryExample and BulkMarksEntryExample
 * 
 * 4. STATISTICS & REPORTING:
 *    - Use useClassStatistics(lecturerId) for stats
 *    - Statistics auto-load when component mounts
 *    - Use downloadCSV() from printing.js to export
 *    - Use generateAndPrintReport() to print HTML reports
 *    - See StatisticsDashboardExample for implementation
 * 
 * 5. ERROR HANDLING:
 *    - All hooks return loading and error states
 *    - Display error messages to users
 *    - Show loading indicators during operations
 * 
 * 6. API CONFIGURATION:
 *    - Set REACT_APP_API_BASE_URL in .env file
 *    - Group 5 will provide the actual API endpoints
 *    - All API calls are handled automatically by hooks
 * 
 * 7. VALIDATION:
 *    - Validation happens automatically in hooks
 *    - Validation errors returned in error state
 *    - You can also use validation.js directly for form validation
 */

export default {
    LoginExample,
    StudentListExample,
    MarksEntryExample,
    BulkMarksEntryExample,
    StatisticsDashboardExample,
    CompleteDashboardExample,
};
