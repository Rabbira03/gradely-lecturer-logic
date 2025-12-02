import { useEffect, useState } from 'react';
import { useLecturerData, useMarks } from '@/hooks/useLecturer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StudentList = () => {
    const {
        offerings,
        students,
        selectedOfferingId,
        loading,
        error,
        fetchOfferings,
        fetchStudents
    } = useLecturerData();

    const { submitMarks, loading: submitting } = useMarks();
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
    const [marks, setMarks] = useState<{ [key: string]: string }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchOfferings();
    }, [fetchOfferings]);

    // Reset state when offering changes
    const handleOfferingChange = (offeringId: string) => {
        fetchStudents(offeringId);
        setSelectedAssessmentId(null);
        setMarks({});
        setSuccessMessage(null);
    };

    const handleMarkChange = (studentId: string, value: string) => {
        setMarks(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSubmitMarks = async () => {
        if (!selectedOfferingId || !selectedAssessmentId) return;

        const marksData = Object.entries(marks)
            .filter(([_, score]) => score !== '') // Only submit entered marks
            .map(([studentId, score]) => ({
                assessmentId: selectedAssessmentId,
                studentId,
                score: Number(score),
                offeringId: selectedOfferingId
            }));

        if (marksData.length === 0) {
            alert('Please enter at least one mark.');
            return;
        }

        const result = await submitMarks(marksData);
        if (result.success) {
            setSuccessMessage('Marks submitted successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
            setMarks({}); // Optional: clear marks after submit
        } else {
            alert('Failed to submit marks: ' + result.error);
        }
    };

    const selectedOffering = offerings.find((o: any) => o.id === selectedOfferingId);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. Select a Course Offering</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {offerings.length === 0 && !loading && !error && <p>No offerings found.</p>}

                    <Select onValueChange={handleOfferingChange} value={selectedOfferingId || ''}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="-- Select Course --" />
                        </SelectTrigger>
                        <SelectContent>
                            {offerings.map((offering: any) => (
                                <SelectItem key={offering.id} value={offering.id}>
                                    {offering.courseCode} - {offering.title} ({offering.term} {offering.year})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedOfferingId && (
                <Card>
                    <CardHeader>
                        <CardTitle>2. Enrolled Students ({students.length}) <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">v3 Debug</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        {console.log('--- v3 DEBUG ---')}
                        {console.log('Selected Offering ID:', selectedOfferingId)}
                        {console.log('Students Array:', students)}

                        {/* Assessment Selector */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                            <Label className="mb-2 block font-medium">Select Assessment to Grade</Label>
                            <Select onValueChange={setSelectedAssessmentId} value={selectedAssessmentId || ''}>
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="-- Choose Assessment --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedOffering?.assessments?.map((assessment: any) => (
                                        <SelectItem key={assessment._id} value={assessment._id}>
                                            {assessment.name} (Max: {assessment.maxScore})
                                        </SelectItem>
                                    ))}
                                    {(!selectedOffering?.assessments || selectedOffering.assessments.length === 0) && (
                                        <SelectItem value="none" disabled>No assessments defined</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {loading && <p>Loading students...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {successMessage && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{successMessage}</div>}

                        <div className="border rounded-md divide-y">
                            {students.map((student: any) => (
                                <div key={student.id} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-medium block">{student.fullName || student.name}</span>
                                        <span className="text-gray-500 text-sm">{student.email}</span>
                                        <span className="text-xs text-gray-400 block mt-1">ID: {student.regNo || student.id}</span>
                                    </div>

                                    {selectedAssessmentId && (
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm text-gray-600">Score:</Label>
                                            <Input
                                                type="number"
                                                className="w-24 text-right"
                                                placeholder="0"
                                                min="0"
                                                value={marks[student.id] || ''}
                                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {students.length === 0 && !loading && (
                                <div className="p-4 text-center text-gray-500">No students enrolled in this course.</div>
                            )}
                        </div>

                        {selectedAssessmentId && students.length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <Button onClick={handleSubmitMarks} disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Marks'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default StudentList;
