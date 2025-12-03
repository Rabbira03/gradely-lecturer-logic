import React, { useState, useEffect } from 'react';
import { useLecturerData, useMarks } from '@/hooks/useLecturer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const MarksEntry = () => {
    const { offerings, students, fetchOfferings, fetchStudents } = useLecturerData();
    const { submitMarks, fetchMarks, loading: submitting, error: submitError } = useMarks();

    const [selectedOffering, setSelectedOffering] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [score, setScore] = useState<number | string>(0);
    const [assessmentId, setAssessmentId] = useState('');
    const [existingMarks, setExistingMarks] = useState<any[]>([]);

    useEffect(() => {
        fetchOfferings();
    }, [fetchOfferings]);

    const handleOfferingChange = async (offId: string) => {
        setSelectedOffering(offId);
        fetchStudents(offId);
        setAssessmentId(''); // Reset assessment when course changes

        // Fetch existing marks for this offering
        const result = await fetchMarks(offId);
        if (result.success) {
            setExistingMarks(result.data);
        }
    };

    // Update score when student or assessment changes
    useEffect(() => {
        if (selectedStudent && assessmentId && existingMarks.length > 0) {
            const mark = existingMarks.find((m: any) =>
                m.studentId === selectedStudent && m.assessmentId === assessmentId
            );
            if (mark) {
                setScore(mark.score);
            } else {
                setScore(0);
            }
        }
    }, [selectedStudent, assessmentId, existingMarks]);

    // Find the selected offering object to get its assessments
    const currentOffering = offerings.find(o => o.id === selectedOffering);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOffering || !selectedStudent || !assessmentId) return;

        // Validate score
        const selectedAssessment = currentOffering?.assessments?.find((a: any) => a._id === assessmentId);
        if (selectedAssessment && Number(score) > selectedAssessment.maxScore) {
            alert(`Score exceeds maximum of ${selectedAssessment.maxScore}`);
            return;
        }

        const result = await submitMarks([{
            offeringId: selectedOffering,
            studentId: selectedStudent,
            assessmentId: assessmentId,
            score: Number(score)
        }]);

        if (result.success) {
            alert('Marks submitted successfully!');
            // Refresh marks
            const refreshResult = await fetchMarks(selectedOffering);
            if (refreshResult.success) {
                setExistingMarks(refreshResult.data);
            }
        } else {
            alert('Failed: ' + result.error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Enter Marks</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label>Course</Label>
                        <Select onValueChange={handleOfferingChange} value={selectedOffering}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                            <SelectContent>
                                {offerings.map(o => (
                                    <SelectItem key={o.id} value={o.id}>
                                        {o.courseCode} - {o.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Student</Label>
                        <Select
                            onValueChange={setSelectedStudent}
                            value={selectedStudent}
                            disabled={!selectedOffering}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.fullName || s.name} ({s.regNo})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Assessment</Label>
                        <Select
                            onValueChange={setAssessmentId}
                            value={assessmentId}
                            disabled={!selectedOffering}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Assessment" />
                            </SelectTrigger>
                            <SelectContent>
                                {currentOffering?.assessments?.map((a: any) => (
                                    <SelectItem key={a._id} value={a._id}>
                                        {a.name} (Max: {a.maxScore})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Score</Label>
                        <Input
                            type="number"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            min="0"
                            max={currentOffering?.assessments?.find((a: any) => a._id === assessmentId)?.maxScore}
                            required
                        />
                        {assessmentId && (() => {
                            const selectedAssessment = currentOffering?.assessments?.find((a: any) => a._id === assessmentId);
                            if (selectedAssessment && Number(score) > selectedAssessment.maxScore) {
                                return <p className="text-xs text-red-500">Max score is {selectedAssessment.maxScore}</p>;
                            }
                            return null;
                        })()}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={submitting || !selectedStudent || !assessmentId}
                    >
                        {submitting ? 'Submitting...' : 'Submit Grade'}
                    </Button>

                    {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
                </form>
            </CardContent>
        </Card>
    );
};

export default MarksEntry;
