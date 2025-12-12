import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Monitor, User, Clock, Calendar } from 'lucide-react';

export default function LabView() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<any[]>([]);
  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  useEffect(() => {
    loadLabs();
    loadActiveSessions();
  }, []);

  const loadLabs = () => {
    const labsData = JSON.parse(localStorage.getItem('labs') || '[]');
    setLabs(labsData);
  };

  const loadActiveSessions = () => {
    const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    const active: any[] = [];
    
    Object.keys(attendance).forEach((studentUsn) => {
      const sessions = attendance[studentUsn] || [];
      sessions.forEach((session: any) => {
        if (session.active && session.teacher === user?.usn_emp) {
          active.push({
            ...session,
            student: studentUsn,
            studentName: users[studentUsn]?.name || studentUsn
          });
        }
      });
    });

    setActiveSessions(active);
  };

  const viewLabDetails = (lab: any) => {
    setSelectedLab(lab);
    
    // Update lab with current sessions
    const updatedLab = { ...lab };
    updatedLab.pcs = lab.pcs.map((pc: any) => {
      const session = activeSessions.find(
        (s) => s.lab === lab.name && s.pc == pc.number
      );
      
      if (session) {
        return {
          ...pc,
          status: 'in-use',
          currentUser: session.studentName,
          currentSubject: session.subject,
          startTime: session.start_iso
        };
      }
      
      return { ...pc, status: 'available', currentUser: null };
    });

    setSelectedLab(updatedLab);
  };

  const showPCHistory = (labName: string, pcNumber: number) => {
    const pcHistory = JSON.parse(localStorage.getItem('pc_history') || '{}');
    const key = `${labName}_PC${pcNumber}`;
    const history = pcHistory[key] || [];

    if (history.length === 0) {
      alert(`No usage history for ${labName} PC${pcNumber}`);
      return;
    }

    const historyText = history
      .slice(-10) // Last 10 entries
      .reverse()
      .map((h: any, i: number) => 
        `${i + 1}. ${h.student_name} (${h.student})\n   ${new Date(h.start).toLocaleString()}\n   Subject: ${h.subject} | Teacher: ${h.teacher}`
      )
      .join('\n\n');

    alert(`Recent Usage History for ${labName} PC${pcNumber}:\n\n${historyText}`);
  };

  if (selectedLab) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl mb-2">{selectedLab.name}</h2>
            <p className="text-gray-600">PC Status and Usage</p>
          </div>
          <button
            onClick={() => setSelectedLab(null)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            ← Back to Labs
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {selectedLab.pcs.map((pc: any) => (
            <div
              key={pc.number}
              onClick={() => showPCHistory(selectedLab.name, pc.number)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                pc.status === 'in-use'
                  ? 'bg-blue-100 border-2 border-blue-500 hover:shadow-lg'
                  : 'bg-green-50 border-2 border-green-300 hover:bg-green-100'
              }`}
            >
              <div className="flex flex-col items-center">
                <Monitor
                  size={32}
                  className={pc.status === 'in-use' ? 'text-blue-600' : 'text-green-600'}
                />
                <p className="mt-2">PC {pc.number}</p>
                {pc.currentUser ? (
                  <>
                    <p className="text-xs mt-2 text-center text-blue-900">{pc.currentUser}</p>
                    <p className="text-xs text-blue-700">{pc.currentSubject}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(pc.startTime).toLocaleTimeString()}
                    </p>
                  </>
                ) : (
                  <p className="text-xs mt-2 text-green-700">Available</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl mb-4">Current Sessions in {selectedLab.name}</h3>
          {activeSessions.filter(s => s.lab === selectedLab.name).length === 0 ? (
            <p className="text-gray-500">No active sessions in this lab</p>
          ) : (
            <div className="space-y-3">
              {activeSessions
                .filter(s => s.lab === selectedLab.name)
                .map((session, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="flex items-center gap-2">
                        <Monitor size={16} />
                        PC {session.pc}: {session.studentName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Subject: {session.subject}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(session.start_iso).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl mb-2">Lab View</h2>
      <p className="text-gray-600 mb-8">Monitor your students' lab usage in real-time</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {labs.map((lab) => {
          const labSessions = activeSessions.filter(s => s.lab === lab.name);
          const inUseCount = labSessions.length;

          return (
            <div
              key={lab.id}
              onClick={() => viewLabDetails(lab)}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl flex items-center gap-2">
                  <Monitor className="text-[#b40000]" />
                  {lab.name}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span>{lab.capacity} PCs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Use:</span>
                  <span className="text-blue-600">{inUseCount} PCs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available:</span>
                  <span className="text-green-600">{lab.capacity - inUseCount} PCs</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(inUseCount / lab.capacity) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {Math.round((inUseCount / lab.capacity) * 100)}% occupied
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {activeSessions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl mb-6 flex items-center gap-2">
            <User className="text-[#b40000]" />
            Your Active Sessions (All Labs)
          </h3>
          <div className="space-y-4">
            {activeSessions.map((session, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1">
                      <span className="">{session.studentName}</span> ({session.student})
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.lab} - PC {session.pc}
                    </p>
                    <p className="text-sm text-gray-600">Subject: {session.subject}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p className="flex items-center gap-1">
                      <Clock size={14} />
                      Started: {new Date(session.start_iso).toLocaleTimeString()}
                    </p>
                    <p className="flex items-center gap-1 mt-1">
                      <Calendar size={14} />
                      {new Date(session.start_iso).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
