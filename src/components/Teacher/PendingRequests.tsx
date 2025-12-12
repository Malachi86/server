import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export default function PendingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const pending = allRequests.filter(
      (r: any) => r.teacher === user?.usn && r.status === 'Pending'
    );
    setRequests(pending);
  };

  const handleApprove = (requestId: string) => {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const request = allRequests.find((r: any) => r.id === requestId);
    
    if (!request) return;

    request.status = 'Approved';
    localStorage.setItem('requests', JSON.stringify(allRequests));

    // Create attendance entry
    const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
    const studentAttendance = attendance[request.student] || [];
    
    const session = {
      teacher: request.teacher,
      subject: request.subject,
      lab: request.lab || request.room,
      pc: request.pc,
      start_iso: request.start_iso,
      end_iso: request.end_iso,
      active: true,
      created_from_request: requestId,
      ended_iso: null
    };
    
    studentAttendance.push(session);
    attendance[request.student] = studentAttendance;
    localStorage.setItem('attendance', JSON.stringify(attendance));

    // Add to PC history if lab
    if (request.lab && request.pc) {
      const pcHistory = JSON.parse(localStorage.getItem('pc_history') || '{}');
      const key = `${request.lab}_PC${request.pc}`;
      const history = pcHistory[key] || [];
      history.push({
        student: request.student,
        student_name: request.student_name,
        subject: request.subject,
        teacher: request.teacher,
        start: request.start_iso,
        end: request.end_iso
      });
      pcHistory[key] = history;
      localStorage.setItem('pc_history', JSON.stringify(pcHistory));
    }

    // Add audit log
    const audit = JSON.parse(localStorage.getItem('audit_log') || '[]');
    audit.push({
      ts: new Date().toISOString(),
      action: 'Request Approved',
      actor: user?.usn,
      details: { request_id: requestId, student: request.student }
    });
    localStorage.setItem('audit_log', JSON.stringify(audit));

    alert('Request approved and session started!');
    loadRequests();
  };

  const handleDecline = (requestId: string) => {
    if (!window.confirm('Decline this request?')) return;

    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const request = allRequests.find((r: any) => r.id === requestId);
    
    if (request) {
      request.status = 'Declined';
      localStorage.setItem('requests', JSON.stringify(allRequests));

      const audit = JSON.parse(localStorage.getItem('audit_log') || '[]');
      audit.push({
        ts: new Date().toISOString(),
        action: 'Request Declined',
        actor: user?.usn,
        details: { request_id: requestId, student: request.student }
      });
      localStorage.setItem('audit_log', JSON.stringify(audit));

      alert('Request declined');
      loadRequests();
    }
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">Pending Requests</h2>
      <p className="text-gray-600 mb-8">Review and approve lab/room requests from students</p>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl mb-2">{request.subject}</h3>
                  <p className="text-gray-600 mb-1">
                    Student: {request.student_name} ({request.student})
                  </p>
                  <p className="text-gray-600 mb-1">
                    {request.type === 'lab' ? `${request.lab} - PC ${request.pc}` : request.room}
                  </p>
                  <p className="text-sm text-gray-500">
                    Time: {new Date(request.start_iso).toLocaleTimeString()} - {new Date(request.end_iso).toLocaleTimeString()}
                  </p>
                  {request.reason && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="">Reason:</span> {request.reason}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
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
