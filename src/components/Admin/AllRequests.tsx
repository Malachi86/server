import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Filter } from 'lucide-react';

// Define an interface for the request object for type safety
interface IRequest {
  id: string;
  student_name: string;
  student: string;
  teacher_name: string;
  teacher: string;
  subject: string;
  type: 'lab' | 'room';
  lab?: string;
  pc?: string;
  room?: string;
  start_iso: string;
  end_iso: string;
  status: 'Pending' | 'Approved' | 'Declined';
  reason?: string; // Add reason for personal use
  requested_at: string;
}

export default function AllRequests() {
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [filter, setFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests: IRequest[] = JSON.parse(localStorage.getItem('requests') || '[]');
    setRequests(allRequests.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()));
  };

  const handleStatusUpdate = (requestIds: string[], newStatus: 'Approved' | 'Declined') => {
    const updatedRequests = requests.map(req =>
      requestIds.includes(req.id) ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('requests', JSON.stringify(updatedRequests));

    const audit = JSON.parse(localStorage.getItem('audit_log') || '[]');
    const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newAuditEntries = requestIds.map(id => ({
      ts: new Date().toISOString(),
      action: `Request ${newStatus}`,
      actor: adminUser?.usn || 'admin',
      details: { request_id: id, new_status: newStatus }
    }));
    localStorage.setItem('audit_log', JSON.stringify([...audit, ...newAuditEntries]));

    setSelectedRequest(null); // Close modal if open
    setSelectedRequests([]); // Clear selection
  };
  
  const handleSelectRequest = (id: string) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(r => r.id));
    }
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

      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
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

        {selectedRequests.length > 0 && (
          <div className="flex gap-4">
            <button
              onClick={() => handleStatusUpdate(selectedRequests, 'Approved')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18}/> Approve Selected
            </button>
            <button
              onClick={() => handleStatusUpdate(selectedRequests, 'Declined')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <XCircle size={18}/> Decline Selected
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left w-12">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-[#b40000] border-gray-300 rounded focus:ring-[#b40000]"
                  onChange={handleSelectAll}
                  checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                />
              </th>
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
            {filteredRequests.map((request) => (
              <tr
                key={request.id}
                className={`border-t hover:bg-gray-50 ${selectedRequests.includes(request.id) ? 'bg-red-50' : ''}`}
              >
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-[#b40000] border-gray-300 rounded focus:ring-[#b40000]"
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                  />
                </td>
                <td className="px-4 py-4 text-sm cursor-pointer" onClick={() => setSelectedRequest(request)}>{request.id}</td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => setSelectedRequest(request)}>{request.student_name}</td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => setSelectedRequest(request)}>{request.teacher_name}</td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => setSelectedRequest(request)}>{request.subject}</td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                  {request.type === 'lab' ? `${request.lab} PC${request.pc}` : request.room}
                </td>
                <td className="px-4 py-4 text-sm cursor-pointer" onClick={() => setSelectedRequest(request)}>
                  {new Date(request.start_iso).toLocaleTimeString()}
                </td>
                <td className="px-4 py-4 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
            <h3 className="text-2xl mb-4 font-bold">Request Details</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>ID:</strong> {selectedRequest.id}</p>
              <p><strong>Student:</strong> {selectedRequest.student_name} ({selectedRequest.student})</p>
              <p><strong>Teacher:</strong> {selectedRequest.teacher_name}</p>
              <p><strong>Subject:</strong> {selectedRequest.subject}</p>
              <p><strong>Location:</strong> {selectedRequest.type === 'lab' ? `${selectedRequest.lab} PC${selectedRequest.pc}` : selectedRequest.room}</p>
              <p><strong>Time:</strong> {new Date(selectedRequest.start_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedRequest.end_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span></p>
              
              {selectedRequest.subject === 'Personal Use' && selectedRequest.reason && (
                <div className="pt-2">
                  <p className="font-bold">Reason for Personal Use:</p>
                  <p className="text-gray-800 bg-gray-100 p-3 rounded-md mt-1">{selectedRequest.reason}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate([selectedRequest.id], 'Declined')}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <XCircle size={18}/>
                    Decline
                  </button>
                  <button
                    onClick={() => handleStatusUpdate([selectedRequest.id], 'Approved')}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18}/>
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
