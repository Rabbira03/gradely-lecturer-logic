import React, { useState } from 'react';
import { useAuth } from '@/hooks/useLecturer';
import { useNavigate } from 'react-router-dom';
import StudentList from '@/components/lecturer/StudentList';
import MarksEntry from '@/components/lecturer/MarksEntry';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('students');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            G
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Gradely Lecturer</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Lecturer'}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-600">Manage your courses, students, and grades.</p>
                </div>

                <Tabs defaultValue="students" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="marks">Enter Marks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="students" className="space-y-4">
                        <StudentList />
                    </TabsContent>

                    <TabsContent value="marks" className="space-y-4">
                        <MarksEntry />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Dashboard;
