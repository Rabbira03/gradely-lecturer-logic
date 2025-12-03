import React, { useEffect, useState } from 'react';
import { useLecturerData, useMarks } from '@/hooks/useLecturer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAuthToken } from '@/services/lecturerApi';

const CourseResults = () => {
    const { offerings, students, fetchOfferings, fetchStudents } = useLecturerData();
    const { fetchMarks } = useMarks();

    const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);
    const [marks, setMarks] = useState<any[]>([]);
    const [gradeScales, setGradeScales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOfferings();
        fetchGradeScales();
    }, [fetchOfferings]);

    const fetchGradeScales = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lecturer/gradescales`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setGradeScales(data);
        } catch (error) {
            console.error('Failed to fetch grade scales', error);
        }
    };

    const handleOfferingChange = async (offeringId: string) => {
        setSelectedOfferingId(offeringId);
        setLoading(true);
        await fetchStudents(offeringId);
        const result = await fetchMarks(offeringId);
        if (result.success) {
            setMarks(result.data);
        }
        setLoading(false);
    };

    const calculateTotal = (studentId: string) => {
        const selectedOffering = offerings.find(o => o.id === selectedOfferingId);
        if (!selectedOffering?.assessments) return 0;

        const validAssessmentIds = selectedOffering.assessments.map((a: any) => a._id);

        const studentMarks = marks.filter(m =>
            m.studentId === studentId &&
            validAssessmentIds.includes(m.assessmentId)
        );

        return studentMarks.reduce((sum, m) => sum + m.score, 0);
    };

    const DEFAULT_GRADE_SCALES = [
        { grade: 'A', minScore: 90, maxScore: 100 },
        { grade: 'A-', minScore: 87, maxScore: 89 },
        { grade: 'B+', minScore: 84, maxScore: 86 },
        { grade: 'B', minScore: 80, maxScore: 83 },
        { grade: 'B-', minScore: 77, maxScore: 79 },
        { grade: 'C+', minScore: 74, maxScore: 76 },
        { grade: 'C', minScore: 70, maxScore: 73 },
        { grade: 'C-', minScore: 67, maxScore: 69 },
        { grade: 'D+', minScore: 64, maxScore: 66 },
        { grade: 'D', minScore: 62, maxScore: 63 },
        { grade: 'D-', minScore: 60, maxScore: 61 },
        { grade: 'F', minScore: 0, maxScore: 59 }
    ];

    const getGrade = (totalScore: number) => {
        // Handle cases where score might slightly exceed 100 due to bonus or errors, treat as A
        if (totalScore > 100) return 'A';

        const scalesToUse = gradeScales.length > 0 ? gradeScales : DEFAULT_GRADE_SCALES;
        const scale = scalesToUse.find(s => totalScore >= s.minScore && totalScore <= s.maxScore);
        return scale ? scale.grade : 'F';
    };

    const selectedOffering = offerings.find(o => o.id === selectedOfferingId);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="print:hidden">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Course for Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={handleOfferingChange} value={selectedOfferingId || ''}>
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
                    </CardContent>
                </Card>
            </div>

            {selectedOfferingId && (
                <Card className="print:shadow-none print:border-none">
                    <CardHeader className="flex flex-row justify-between items-center print:px-0">
                        <div>
                            <CardTitle>Course Results: {selectedOffering?.courseCode}</CardTitle>
                            <p className="text-sm text-gray-500">{selectedOffering?.title}</p>
                        </div>
                        <Button onClick={handlePrint} className="print:hidden">Print Results</Button>
                    </CardHeader>
                    <CardContent className="print:px-0">
                        {loading ? <p>Loading...</p> : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Reg No</TableHead>
                                            {selectedOffering?.assessments?.map((a: any) => (
                                                <TableHead key={a._id}>{a.name} ({a.maxScore})</TableHead>
                                            ))}
                                            <TableHead className="font-bold">Total (100)</TableHead>
                                            <TableHead className="font-bold">Grade</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => {
                                            const total = calculateTotal(student.id);
                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell>{student.fullName || student.name}</TableCell>
                                                    <TableCell>{student.regNo}</TableCell>
                                                    {selectedOffering?.assessments?.map((a: any) => {
                                                        const mark = marks.find(m => m.studentId === student.id && m.assessmentId === a._id);
                                                        return (
                                                            <TableCell key={a._id}>
                                                                {mark ? mark.score : '-'}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell className="font-bold">{total}</TableCell>
                                                    <TableCell className="font-bold">{getGrade(total)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {students.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center">No students enrolled.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    #root > div > main > div > div:last-child,
                    #root > div > main > div > div:last-child * {
                        visibility: visible;
                    }
                    #root > div > main > div > div:last-child {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default CourseResults;
