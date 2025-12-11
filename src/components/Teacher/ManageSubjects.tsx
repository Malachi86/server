import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Book, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ISchedule {
  day: string;
  start: string;
  end: string;
}

interface ISubject {
  id: string; // Server-generated UUID
  name: string;
  schedules: ISchedule[];
  teacher_usn: string;
}

export default function ManageSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  const loadSubjects = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/subjects?teacher_usn=${user.usn}`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError('Could not load subjects.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = async () => {
    if (!newSubjectName.trim() || !user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSubjectName.trim(), 
          schedules: [],
          teacher_usn: user.usn 
        }),
      });
      if (!response.ok) throw new Error('Failed to create subject');
      setNewSubjectName('');
      loadSubjects(); // Refresh list
    } catch (err) {
      setError('Failed to add subject.');
      console.error(err);
    }
  };

  const deleteSubject = async (subjectId: string) => {
    if (!window.confirm(`Delete this subject? This action is permanent.`) || !user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}?actor=${user.usn}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete subject');
      loadSubjects(); // Refresh list
      if (selectedSubject?.id === subjectId) {
        setSelectedSubject(null);
      }
    } catch (err) {
      setError('Failed to delete subject.');
      console.error(err);
    }
  };

  const updateSubjectSchedules = async (subject: ISubject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/${subject.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subject),
      });
      if (!response.ok) throw new Error('Could not update schedule');
      loadSubjects(); // Refresh to get the latest version
    } catch (err) {
        setError('Error updating schedule.');
        console.error(err);
    }
  };

  const addSchedule = (day: string, start: string, end: string) => {
    if (!selectedSubject || !start || !end) return;

    const updatedSubject = {
      ...selectedSubject,
      schedules: [...selectedSubject.schedules, { day, start, end }]
    };
    
    setSelectedSubject(updatedSubject);
    updateSubjectSchedules(updatedSubject);
  };

  const deleteSchedule = (scheduleIndex: number) => {
    if (!selectedSubject) return;

    const updatedSchedules = [...selectedSubject.schedules];
    updatedSchedules.splice(scheduleIndex, 1);
    
    const updatedSubject = {
      ...selectedSubject,
      schedules: updatedSchedules
    };
    
    setSelectedSubject(updatedSubject);
    updateSubjectSchedules(updatedSubject);
  };
  
  if (isLoading) {
    return <div>Loading subjects...</div>
  }

  return (
    <div>
      <h2 className="text-3xl mb-2">Manage Subjects</h2>
      <p className="text-gray-600 mb-8">Add your subjects and set their weekly schedules.</p>
      
      {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
          </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl mb-4 flex items-center gap-2"><Book className="text-[#b40000]" />Subjects</h3>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="New subject name..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#b40000] outline-none"
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            />
            <button
              onClick={addSubject}
              className="px-4 py-2 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`p-4 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                  selectedSubject?.id === subject.id
                    ? 'bg-red-50 border-2 border-[#b40000]'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSubject(subject)}
              >
                <span>{subject.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {selectedSubject ? (
            <>
              <h3 className="text-xl mb-4 flex items-center gap-2"><Calendar className="text-[#b40000]" />Schedules for {selectedSubject.name}</h3>
              <ScheduleForm onAdd={addSchedule} />
              <div className="mt-6 space-y-2">
                {selectedSubject.schedules.map((schedule, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm">
                      <strong className="mr-2">{schedule.day}</strong> {schedule.start} - {schedule.end}
                    </span>
                    <button
                      onClick={() => deleteSchedule(idx)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center">
                <Calendar size={48} className="mb-4"/>
                <p>Select a subject to manage its schedules.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleForm({ onAdd }: { onAdd: (day: string, start: string, end: string) => void }) {
  const [day, setDay] = useState('Mon');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) { alert("Please set both start and end times."); return; }
    onAdd(day, start, end);
    setStart('');
    setEnd('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <label className="block text-sm mb-2 text-gray-600">Day of the Week</label>
        <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2 text-gray-600">Start Time</label>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm mb-2 text-gray-600">End Time</label>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
      </div>
      <button type="submit" className="w-full py-2 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] transition-colors">
        Add Schedule
      </button>
    </form>
  );
}
