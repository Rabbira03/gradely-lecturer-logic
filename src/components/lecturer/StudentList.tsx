import React, { useEffect } from 'react';
import { useLecturerData } from '@/hooks/useLecturer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

    useEffect(() => {
        fetchOfferings();
    }, [fetchOfferings]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. Select a Course Offering</CardTitle>
                </CardHeader>
                <CardContent>
                    {offerings.length === 0 && !loading && <p>No offerings found.</p>}

                    <Select onValueChange={fetchStudents} value={selectedOfferingId || ''}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="-- Select Course --" />
                        </SelectTrigger>
                        <SelectContent>
                            {offerings.map((offering) => (
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
                        <CardTitle>2. Enrolled Students ({students.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && <p>Loading students...</p>}
                        {error && <p className="text-red-500">{error}</p>}

                        <div className="border rounded-md divide-y">
                            {students.map((student) => (
                                <div key={student.id} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-medium block">{student.fullName || student.name}</span>
                                        <span className="text-gray-500 text-sm">{student.email}</span>
                                    </div>
                                    <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                                        {student.regNo || student.id}
                                    </span>
                                </div>
                            ))}
                            {students.length === 0 && !loading && (
                                <div className="p-4 text-center text-gray-500">No students enrolled in this course.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default StudentList;
