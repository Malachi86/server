import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Book, Plus, Trash2, Calendar } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Define interfaces for type safety
interface ISchedule {
  day: string;
  start: string;
  end: string;
}

interface ISubject {
  name: string;
  schedules: ISchedule[];
}

interface ITeachers {
  [key: string]: {
    subjects: ISubject[];
  };
}

export default function ManageSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  const loadSubjects = () => {
    if (!user) return;
    const teachers: ITeachers = JSON.parse(localStorage.getItem('teachers') || '{}');
    const teacherData = teachers[user.usn] || { subjects: [] };
    setSubjects(teacherData.subjects);
  };

  const addSubject = () => {
    if (!newSubjectName.trim() || !user) return;

    const teachers: ITeachers = JSON.parse(localStorage.getItem('teachers') || '{}');
    const teacherData = teachers[user.usn] || { subjects: [] };
    
    teacherData.subjects.push({
      name: newSubjectName.trim(),
      schedules: []
    });

    teachers[user.usn] = teacherData;
    localStorage.setItem('teachers', JSON.stringify(teachers));

    setNewSubjectName('');
    loadSubjects();
  };

  const deleteSubject = (subjectName: string) => {
    if (!window.confirm(`Delete subject "${subjectName}"?`) || !user) return;

    const teachers: ITeachers = JSON.parse(localStorage.getItem('teachers') || '{}');
    const teacherData = teachers[user.usn];
    
    if (teacherData) {
      teacherData.subjects = teacherData.subjects.filter((s) => s.name !== subjectName);
      teachers[user.usn] = teacherData;
      localStorage.setItem('teachers', JSON.stringify(teachers));

      loadSubjects();
      if (selectedSubject?.name === subjectName) {
        setSelectedSubject(null);
      }
    }
  };

  const addSchedule = (subjectName: string, day: string, start: string, end: string) => {
    if (!start || !end || !user) return;

    const teachers: ITeachers = JSON.parse(localStorage.getItem('teachers') || '{}');
    const teacherData = teachers[user.usn];
    
    if (teacherData) {
      const subject = teacherData.subjects.find((s) => s.name === subjectName);
      if (subject) {
        subject.schedules.push({ day, start, end });
        teachers[user.usn] = teacherData;
        localStorage.setItem('teachers', JSON.stringify(teachers));
        loadSubjects();
        // Create a new object to ensure re-render
        setSelectedSubject({ ...subject });
      }
    }
  };

  const deleteSchedule = (subjectName: string, scheduleIndex: number) => {
    if (!user) return;
    const teachers: ITeachers = JSON.parse(localStorage.getItem('teachers') || '{}');
    const teacherData = teachers[user.usn];
    
    if (teacherData) {
      const subject = teacherData.subjects.find((s) => s.name === subjectName);
      if (subject) {
        subject.schedules.splice(scheduleIndex, 1);
        teachers[user.usn] = teacherData;
        localStorage.setItem('teachers', JSON.stringify(teachers));
        loadSubjects();
        // Create a new object to ensure re-render
        setSelectedSubject({ ...subject });
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">Manage Subjects</h2>
      <p className="text-gray-600 mb-8">Add subjects and set their schedules</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Subjects List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl mb-4 flex items-center gap-2">
            <Book className="text-[#b40000]" />
            Subjects
          </h3>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="New subject name..."
              className="flex-1 px-4 py-2 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            />
            <button
              onClick={addSubject}
              className="px-4 py-2 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000]"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {subjects.map((subject, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg cursor-pointer flex items-center justify-between ${
                  selectedSubject?.name === subject.name
                    ? 'bg-red-50 border-2 border-[#b40000]'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSubject(subject)}
              >
                <span>{subject.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(subject.name);
                  }}
                  className="p-2 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Schedules */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {selectedSubject ? (
            <>
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <Calendar className="text-[#b40000]" />
                Schedules for {selectedSubject.name}
              </h3>

              <ScheduleForm
                onAdd={(day, start, end) => addSchedule(selectedSubject.name, day, start, end)}
              />

              <div className="mt-6 space-y-2">
                {selectedSubject.schedules.map((schedule, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>
                      {schedule.day} {schedule.start}-{schedule.end}
                    </span>
                    <button
                      onClick={() => deleteSchedule(selectedSubject.name, idx)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a subject to manage schedules
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
    onAdd(day, start, end);
    setStart('');
    setEnd('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-2">Day</label>
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {DAYS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2">Start</label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-2">End</label>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000]"
      >
        Add Schedule
      </button>
    </form>
  );
}
