import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, CheckCircle, XCircle } from 'lucide-react';

export default function PendingEnrollments() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = () => {
    const all = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const pending = all.filter(
      (e: any) => e.teacher === user?.usn && e.status === 'Pending'
    );
    setEnrollments(pending);
  };

  const handleAction = (enrollmentId: string, approve: boolean) => {
    const all = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const enrollment = all.find((e: any) => e.id === enrollmentId);
    
    if (enrollment) {
      enrollment.status = approve ? 'Approved' : 'Declined';
      if (approve) enrollment.notified = false;
      
      localStorage.setItem('enrollments', JSON.stringify(all));

      const audit = JSON.parse(localStorage.getItem('audit_log') || '[]');
      audit.push({
        ts: new Date().toISOString(),
        action: `Enrollment ${approve ? 'Approved' : 'Declined'}`,
        actor: user?.usn,
        details: { enrollment_id: enrollmentId, student: enrollment.student }
      });
      localStorage.setItem('audit_log', JSON.stringify(audit));

      alert(`Enrollment ${approve ? 'approved' : 'declined'}`);
      loadEnrollments();
    }
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">Pending Enrollments</h2>
      <p className="text-gray-600 mb-8">Review student enrollment requests</p>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No pending enrollments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl mb-2">{enrollment.subject}</h3>
                  <p className="text-gray-600">
                    {enrollment.student_name} ({enrollment.student})
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Requested: {new Date(enrollment.requested_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(enrollment.id, true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(enrollment.id, false)}
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
