import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Define an interface for the request object for type safety
interface IRequest {
  id: string;
  student: string;
  subject: string;
  teacher_name: string;
  type: 'lab' | 'room';
  lab?: string;
  pc?: string;
  room?: string;
  start_iso: string;
  end_iso: string;
  status: 'Pending' | 'Approved' | 'Declined';
  requested_at: string;
  reason?: string;
}

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<IRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    if (!user) return;
    const allRequests: IRequest[] = JSON.parse(localStorage.getItem('requests') || '[]');
    const myRequests = allRequests.filter((r) => r.student === user.usn);
    setRequests(myRequests.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'Declined':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Declined: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.Pending;
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">My Requests</h2>
      <p className="text-gray-600 mb-8">View all your lab and room requests</p>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => {
                alert(
                  `Request ID: ${request.id}\nSubject: ${request.subject}\nTeacher: ${request.teacher_name}\n${request.type === 'lab' ? `Lab: ${request.lab}\nPC: ${request.pc}` : `Room: ${request.room}`}\nTime: ${new Date(request.start_iso).toLocaleTimeString()} - ${new Date(request.end_iso).toLocaleTimeString()}\nStatus: ${request.status}\nRequested: ${new Date(request.requested_at).toLocaleString()}${request.reason ? `\nReason: ${request.reason}` : ''}`
                );
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(request.status)}
                    <h3 className="text-xl">{request.subject}</h3>
                  </div>
                  <p className="text-gray-600 mb-1">Teacher: {request.teacher_name}</p>
                  <p className="text-gray-600 mb-1">
                    {request.type === 'lab' ? `${request.lab} - PC ${request.pc}` : request.room}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.start_iso).toLocaleTimeString()} - {new Date(request.end_iso).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {request.reason && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="">Reason:</span> {request.reason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
