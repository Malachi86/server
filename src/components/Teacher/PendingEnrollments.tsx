import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

export default function PendingEnrollments() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEnrollments();
    }
  }, [user]);

  const loadEnrollments = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments?teacher_usn=${user.usn}&status=Pending`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error("Error loading enrollments:", error);
      alert('Could not load pending enrollments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (enrollmentId: string, action: 'approve' | 'decline') => {
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/action`, {
        method: 'POST', // Using POST to have a body
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, actor: user?.usn }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Action failed');
      }

      alert(`Enrollment has been ${action === 'approve' ? 'approved' : 'declined'}.`);
      loadEnrollments(); // Refresh the list

    } catch (error) {
      console.error(`Error ${action}ing enrollment:`, error);
      alert(`Failed to ${action} the enrollment. It might have been processed already.`);
    }
  };
  
  if (isLoading) {
      return <div>Loading pending requests...</div>
  }

  return (
    <div>
      <h2 className="text-3xl mb-2">Pending Enrollments</h2>
      <p className="text-gray-600 mb-8">Review student enrollment requests assigned to you.</p>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No pending enrollments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{enrollment.subject_name}</h3>
                  <p className="text-gray-700">
                    Student: <strong>{enrollment.student_name}</strong> ({enrollment.student_usn})
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Requested on: {new Date(enrollment.requested_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(enrollment.id, 'approve')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(enrollment.id, 'decline')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <XCircle size={18} />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
