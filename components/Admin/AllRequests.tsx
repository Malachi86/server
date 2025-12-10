import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Filter } from 'lucide-react';

export default function AllRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    setRequests(allRequests.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()));
  };

  const filteredRequests = filter === 'All'
    ? requests
    : requests.filter(r => r.status === filter);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Declined: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.Pending;
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">All Requests</h2>
      <p className="text-gray-600 mb-8">View all lab and room requests</p>

      <div className="mb-6 flex gap-4">
        <div className="flex items-center gap-2">
          <Filter size={20} />
          <span>Status:</span>
        </div>
        {['All', 'Pending', 'Approved', 'Declined'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === status
                ? 'bg-[#b40000] text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left">ID</th>
              <th className="px-4 py-4 text-left">Student</th>
              <th className="px-4 py-4 text-left">Teacher</th>
              <th className="px-4 py-4 text-left">Subject</th>
              <th className="px-4 py-4 text-left">Location</th>
              <th className="px-4 py-4 text-left">Time</th>
              <th className="px-4 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  alert(
                    `Request ID: ${request.id}\nStudent: ${request.student_name} (${request.student})\nTeacher: ${request.teacher_name} (${request.teacher})\nSubject: ${request.subject}\n${request.type === 'lab' ? `Lab: ${request.lab}\nPC: ${request.pc}` : `Room: ${request.room}`}\nTime: ${new Date(request.start_iso).toLocaleString()} - ${new Date(request.end_iso).toLocaleString()}\nStatus: ${request.status}\nRequested: ${new Date(request.requested_at).toLocaleString()}`
                  );
                }}
              >
                <td className="px-4 py-4 text-sm">{request.id}</td>
                <td className="px-4 py-4">{request.student_name}</td>
                <td className="px-4 py-4">{request.teacher_name}</td>
                <td className="px-4 py-4">{request.subject}</td>
                <td className="px-4 py-4">
                  {request.type === 'lab' ? `${request.lab} PC${request.pc}` : request.room}
                </td>
                <td className="px-4 py-4 text-sm">
                  {new Date(request.start_iso).toLocaleTimeString()}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
