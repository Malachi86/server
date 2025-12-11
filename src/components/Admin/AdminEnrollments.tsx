import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

export default function AdminEnrollments() {
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
      // Fetch all enrollments for the current admin/teacher
      const response = await fetch(`${API_BASE_URL}/enrollments?teacher_usn=${user.usn}`);
      if (!response.ok) {
        throw new Error('Failed to fetch enrollment data');
      }
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error("Error loading enrollments:", error);
      alert('Could not load enrollment data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (enrollmentId: string, action: 'approve' | 'decline') => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, actor: user.usn }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Action failed');
      }

      alert(`Enrollment has been ${action === 'approve' ? 'approved' : 'declined'}.`);
      loadEnrollments(); // Refresh the list from the server

    } catch (error) {
      console.error(`Error ${action}ing enrollment:`, error);
      alert(`Failed to ${action} the enrollment. It might have been processed already.`);
    }
  };
  
  if (isLoading) {
      return <div>Loading enrollments...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Subject Enrollments</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  USN
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{enrollment.student_name}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{enrollment.student_usn}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{enrollment.subject_name}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span
                        className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                          enrollment.status.toLowerCase() === 'approved'
                            ? 'text-green-900'
                            : enrollment.status.toLowerCase() === 'declined'
                            ? 'text-red-900'
                            : 'text-yellow-900'
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute inset-0 ${
                            enrollment.status.toLowerCase() === 'approved'
                              ? 'bg-green-200'
                              : enrollment.status.toLowerCase() === 'declined'
                              ? 'bg-red-200'
                              : 'bg-yellow-200'
                          } opacity-50 rounded-full`}
                        ></span>
                        <span className="relative capitalize">{enrollment.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                      {enrollment.status.toLowerCase() === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(enrollment.id, 'approve')}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-full text-xs flex items-center"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(enrollment.id, 'decline')}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-full text-xs flex items-center"
                            title="Decline"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
