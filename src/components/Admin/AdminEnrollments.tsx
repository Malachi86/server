import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminEnrollments() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load all necessary data from localStorage
    const allUsers = JSON.parse(localStorage.getItem('users') || '{}');
    const teachersData = JSON.parse(localStorage.getItem('teachers') || '{}');
    const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');

    // Get the current admin's subjects from the teachersData object
    const adminTeacherData = teachersData[user.usn];
    const adminSubjectNames = adminTeacherData ? adminTeacherData.subjects.map((s: any) => s.name) : [];

    // Filter enrollments to only include those for the admin's subjects
    const filteredEnrollments = storedEnrollments.filter((enrollment: any) =>
      adminSubjectNames.includes(enrollment.subject) && enrollment.teacher === user.usn
    );

    // Enrich the filtered enrollments with student details
    const enrichedEnrollments = filteredEnrollments.map((enrollment: any) => {
      const studentUser = allUsers[enrollment.student];
      return {
        ...enrollment,
        studentName: studentUser ? studentUser.name : (enrollment.student_name || 'Unknown'),
        usn: enrollment.student, // Directly use the USN from the enrollment object
      };
    });

    setEnrollments(enrichedEnrollments);
  }, [user]);

  const handleApproval = (id: string, newStatus: string) => {
    if (!user) return;

    const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const updatedEnrollments = storedEnrollments.map((e: any) => {
      if (e.id === id) {
        return { ...e, status: newStatus };
      }
      return e;
    });

    localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));

    // Simply update the state locally, no need to re-read and re-filter everything
    setEnrollments(prevEnrollments =>
      prevEnrollments.map(e => (e.id === id ? { ...e, status: newStatus } : e))
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Subject Enrollments</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                    <p className="text-gray-900 whitespace-no-wrap">{enrollment.studentName}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{enrollment.usn}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{enrollment.subject}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        enrollment.status.toLowerCase() === 'approved'
                          ? 'text-green-900'
                          : enrollment.status.toLowerCase() === 'rejected'
                          ? 'text-red-900'
                          : 'text-yellow-900'
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-0 ${
                          enrollment.status.toLowerCase() === 'approved'
                            ? 'bg-green-200'
                            : enrollment.status.toLowerCase() === 'rejected'
                            ? 'bg-red-200'
                            : 'bg-yellow-200'
                        } opacity-50 rounded-full`}
                      ></span>
                      <span className="relative capitalize">{enrollment.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    {enrollment.status.toLowerCase() === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproval(enrollment.id, 'approved')}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(enrollment.id, 'rejected')}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                        >
                          Reject
                        </button>
                      </>
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
  );
}
