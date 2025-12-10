import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Monitor, User, Clock } from 'lucide-react';

export default function MySessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [pcHistory, setPCHistory] = useState<any>({});

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
    const pcHistoryData = JSON.parse(localStorage.getItem('pc_history') || '{}');
    
    const mySessions = attendance[user?.usn] || [];
    setSessions(mySessions.sort((a, b) => new Date(b.start_iso).getTime() - new Date(a.start_iso).getTime()));
    setPCHistory(pcHistoryData);
  };

  const showPCHistory = (lab: string, pc: string) => {
    const key = `${lab}_PC${pc}`;
    const history = pcHistory[key] || [];
    
    if (history.length === 0) {
      alert(`No usage history for ${lab} PC${pc}`);
      return;
    }

    const historyText = history
      .map((h: any, i: number) => `${i + 1}. ${h.student_name} (${h.student})\n   ${new Date(h.start).toLocaleString()} - ${new Date(h.end).toLocaleString()}\n   Subject: ${h.subject}`)
      .join('\n\n');

    alert(`Usage History for ${lab} PC${pc}:\n\n${historyText}`);
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">My Sessions</h2>
      <p className="text-gray-600 mb-8">View your lab usage history</p>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No sessions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl mb-2 flex items-center gap-2">
                    <Monitor size={20} className="text-[#b40000]" />
                    {session.subject}
                  </h3>
                  <p className="text-gray-600 mb-1 flex items-center gap-2">
                    <User size={16} />
                    Teacher: {session.teacher}
                  </p>
                  <p className="text-gray-600 mb-1">
                    {session.lab} - PC {session.pc}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(session.start_iso).toLocaleString()} - {new Date(session.ended_iso || session.end_iso).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm ${session.active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {session.active ? 'Active' : 'Ended'}
                  </span>
                </div>
              </div>

              {session.lab && session.pc && (
                <button
                  onClick={() => showPCHistory(session.lab, session.pc)}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  View PC History
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
