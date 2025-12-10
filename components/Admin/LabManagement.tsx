import React, { useState, useEffect } from 'react';
import { Monitor, Plus, Trash2, Eye } from 'lucide-react';

export default function LabManagement() {
  const [labs, setLabs] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [view, setView] = useState('labs'); // 'labs' or 'rooms'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const labsData = JSON.parse(localStorage.getItem('labs') || '[]');
    const roomsData = JSON.parse(localStorage.getItem('rooms') || '[]');
    setLabs(labsData);
    setRooms(roomsData);
  };

  const addLab = () => {
    const name = prompt('Lab name:');
    const capacity = prompt('Capacity (number of PCs):');
    
    if (name && capacity) {
      const newLab = {
        id: Date.now().toString(),
        name,
        capacity: parseInt(capacity),
        pcs: Array.from({ length: parseInt(capacity) }, (_, i) => ({
          number: i + 1,
          status: 'available',
          currentUser: null
        }))
      };

      const updated = [...labs, newLab];
      localStorage.setItem('labs', JSON.stringify(updated));
      loadData();
    }
  };

  const addRoom = () => {
    const name = prompt('Room name:');
    const capacity = prompt('Capacity:');
    
    if (name && capacity) {
      const newRoom = {
        id: Date.now().toString(),
        name,
        capacity: parseInt(capacity)
      };

      const updated = [...rooms, newRoom];
      localStorage.setItem('rooms', JSON.stringify(updated));
      loadData();
    }
  };

  const viewLabPCs = (lab: any) => {
    const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Update PC status with active sessions
    const updatedLab = { ...lab };
    updatedLab.pcs = lab.pcs.map((pc: any) => {
      let currentSession = null;

      Object.entries(attendance).forEach(([studentUsn, sessions]: any) => {
        sessions.forEach((session: any) => {
          if (session.active && session.lab === lab.name && session.pc == pc.number) {
            currentSession = {
              student: studentUsn,
              studentName: users[studentUsn]?.name || studentUsn,
              subject: session.subject,
              startTime: session.start_iso
            };
          }
        });
      });

      return {
        ...pc,
        status: currentSession ? 'in-use' : 'available',
        currentSession
      };
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
      .slice(-10)
      .reverse()
      .map((h: any, i: number) => 
        `${i + 1}. ${h.student_name} (${h.student})\n   ${new Date(h.start).toLocaleString()}\n   Subject: ${h.subject}`
      )
      .join('\n\n');

    alert(`Recent Usage History:\n\n${historyText}`);
  };

  if (selectedLab) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl mb-2">{selectedLab.name}</h2>
            <p className="text-gray-600">PC Status View</p>
          </div>
          <button
            onClick={() => setSelectedLab(null)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {selectedLab.pcs.map((pc: any) => (
            <div
              key={pc.number}
              onClick={() => showPCHistory(selectedLab.name, pc.number)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                pc.status === 'in-use'
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-green-50 border-2 border-green-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <Monitor
                  size={32}
                  className={pc.status === 'in-use' ? 'text-blue-600' : 'text-green-600'}
                />
                <p className="mt-2">PC {pc.number}</p>
                {pc.currentSession ? (
                  <>
                    <p className="text-xs mt-2 text-center text-blue-900">
                      {pc.currentSession.studentName}
                    </p>
                    <p className="text-xs text-blue-700">{pc.currentSession.subject}</p>
                  </>
                ) : (
                  <p className="text-xs mt-2 text-green-700">Empty</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl mb-2">Lab Management</h2>
      <p className="text-gray-600 mb-8">Manage labs and rooms</p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView('labs')}
          className={`px-6 py-3 rounded-lg ${
            view === 'labs' ? 'bg-[#b40000] text-white' : 'bg-gray-100'
          }`}
        >
          Labs
        </button>
        <button
          onClick={() => setView('rooms')}
          className={`px-6 py-3 rounded-lg ${
            view === 'rooms' ? 'bg-[#b40000] text-white' : 'bg-gray-100'
          }`}
        >
          Rooms
        </button>
      </div>

      {view === 'labs' ? (
        <>
          <button
            onClick={addLab}
            className="mb-6 px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
          >
            <Plus size={20} />
            Add Lab
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            {labs.map((lab) => (
              <div key={lab.id} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <Monitor className="text-[#b40000]" />
                  {lab.name}
                </h3>
                <p className="text-gray-600 mb-4">Capacity: {lab.capacity} PCs</p>
                <button
                  onClick={() => viewLabPCs(lab)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  View PCs
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={addRoom}
            className="mb-6 px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
          >
            <Plus size={20} />
            Add Room
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl mb-4">{room.name}</h3>
                <p className="text-gray-600">Capacity: {room.capacity}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
