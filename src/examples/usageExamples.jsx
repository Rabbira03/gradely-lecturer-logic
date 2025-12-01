/**
 * Usage Examples for Group 4 (Frontend Developers)
 * Shows how to integrate the Lecturer Module Logic Layer
 * @module usageExamples
 */

import React, { useState, useEffect } from 'react';
import { useAuth, useLecturerData, useMarks } from '../hooks/useLecturer.js';

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
        }
    };

    if (isAuthenticated) {
        return <div className="p-4 text-green-600 font-bold">Login Successful!</div>;
    }

    return (
        <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto p-4 border rounded">
            <h3 className="text-lg font-bold">Lecturer Login</h3>
            <div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full p-2 border rounded"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
    );
};

/**
 * Example 2: Student List Component (with Offering Selection)
 * Shows how to fetch offerings and then students
 */
export const StudentListExample = () => {
    const {
        offerings,
        students,
        selectedOfferingId,
        loading,
        error,
        fetchOfferings,
        fetchStudents
    } = useLecturerData();

    useEffect(() => {
        fetchOfferings();
    }, [fetchOfferings]);

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold mb-2">1. Select a Course Offering</h3>
                {offerings.length === 0 && !loading && <p>No offerings found.</p>}

                <select
                    className="w-full p-2 border rounded"
                    onChange={(e) => fetchStudents(e.target.value)}
                    value={selectedOfferingId || ''}
                >
                    <option value="">-- Select Course --</option>
                    {offerings.map((offering) => (
                        <option key={offering.id} value={offering.id}>
                            {offering.courseCode || offering.id} - {offering.term} {offering.year}
                        </option>
                    ))}
                </select>
            </div>

            {selectedOfferingId && (
                <div>
                    <h3 className="font-bold mb-2">2. Enrolled Students ({students.length})</h3>
                    {loading && <p>Loading students...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    <ul className="divide-y border rounded">
                        {students.map((student) => (
                            <li key={student.id} className="p-3 hover:bg-gray-50">
                                <span className="font-medium">{student.fullName || student.name}</span>
                                <span className="text-gray-500 text-sm ml-2">({student.regNo || student.id})</span>
                            </li>
                        ))}
                        {students.length === 0 && !loading && (
                            <li className="p-3 text-gray-500">No students enrolled.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

/**
 * Example 3: Marks Entry Form
 * Shows how to enter marks for a student
 */
export const MarksEntryExample = () => {
    const { offerings, students, fetchOfferings, fetchStudents } = useLecturerData();
    const { submitMarks, loading: submitting, error: submitError } = useMarks();

    const [selectedOffering, setSelectedOffering] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [score, setScore] = useState(0);
    const [assessmentId, setAssessmentId] = useState('assignment1'); // Mock assessment ID

    useEffect(() => {
        fetchOfferings();
    }, [fetchOfferings]);

    const handleOfferingChange = (e) => {
        const offId = e.target.value;
        setSelectedOffering(offId);
        fetchStudents(offId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOffering || !selectedStudent) return;

        const result = await submitMarks([{
            offeringId: selectedOffering,
            studentId: selectedStudent,
            assessmentId: assessmentId,
            score: parseFloat(score)
        }]);

        if (result.success) {
            alert('Marks submitted successfully!');
            setScore(0);
        } else {
            alert('Failed: ' + result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <h3 className="font-bold text-lg">Enter Marks</h3>

            <div>
                <label className="block text-sm font-medium">Course</label>
                <select
                    className="w-full p-2 border rounded"
                    value={selectedOffering}
                    onChange={handleOfferingChange}
                    required
                >
                    <option value="">Select Course</option>
                    {offerings.map(o => (
                        <option key={o.id} value={o.id}>{o.courseCode || o.id}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">Student</label>
                <select
                    className="w-full p-2 border rounded"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                    disabled={!selectedOffering}
                >
                    <option value="">Select Student</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.fullName || s.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">Score</label>
                <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={submitting || !selectedStudent}
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {submitting ? 'Submitting...' : 'Submit Grade'}
            </button>

            {submitError && <p className="text-red-500">{submitError}</p>}
        </form>
    );
};

/**
 * Example 6: Complete Dashboard Integration
 * Shows how all pieces work together
 */
export const CompleteDashboardExample = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('students');

    if (!isAuthenticated) {
        return <LoginExample />;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold">Lecturer Dashboard</h1>
                    <p className="text-gray-600">Welcome, {user?.fullName || user?.email}!</p>
                </div>
                <button
                    onClick={logout}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
                >
                    Logout
                </button>
            </header>

            <nav className="flex space-x-4">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2 rounded ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                    Students
                </button>
                <button
                    onClick={() => setActiveTab('marks')}
                    className={`px-4 py-2 rounded ${activeTab === 'marks' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                    Enter Marks
                </button>
            </nav>

            <main className="bg-white p-6 rounded shadow-sm border">
                {activeTab === 'students' && <StudentListExample />}
                {activeTab === 'marks' && <MarksEntryExample />}
            </main>
        </div>
    );
};

export default {
    LoginExample,
    StudentListExample,
    MarksEntryExample,
    CompleteDashboardExample,
};
