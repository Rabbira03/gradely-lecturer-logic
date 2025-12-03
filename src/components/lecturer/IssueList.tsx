import { useEffect } from 'react';
import { useIssues } from '@/hooks/useLecturer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const IssueList = () => {
    const { issues, loading, error, fetchIssues, resolveIssue } = useIssues();

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const handleResolve = async (id: string) => {
        await resolveIssue(id);
    };

    if (loading) return <p>Loading issues...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Issues & Requests</CardTitle>
            </CardHeader>
            <CardContent>
                {issues.length === 0 ? (
                    <p className="text-gray-500">No issues found.</p>
                ) : (
                    <div className="space-y-4">
                        {issues.map((issue: any) => (
                            <div key={issue._id} className="border rounded-lg p-4 flex justify-between items-start bg-white shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-lg">{issue.subject}</h3>
                                        <Badge variant={issue.status === 'resolved' ? 'secondary' : 'destructive'}>
                                            {issue.status}
                                        </Badge>
                                        <Badge variant="outline">{issue.issueType}</Badge>
                                    </div>
                                    <p className="text-gray-600 mb-2">{issue.description}</p>
                                    <div className="text-sm text-gray-500">
                                        <p>Student: <span className="font-medium">{issue.student?.firstName} {issue.student?.lastName}</span> ({issue.student?.schoolID})</p>
                                        <p>Date: {new Date(issue.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {issue.status !== 'resolved' && (
                                    <Button
                                        onClick={() => handleResolve(issue._id)}
                                        variant="outline"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark Resolved
                                    </Button>
                                )}
                                {issue.status === 'resolved' && (
                                    <div className="text-green-600 flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-1" />
                                        Resolved
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default IssueList;
