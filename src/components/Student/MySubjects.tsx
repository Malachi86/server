import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Book, User, Calendar, Clock, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

interface ISchedule {
  day: string;
  start: string;
  end: string;
}

interface ISubject {
  id: string;
  subject_name: string;
  teacher_name: string;
  schedules: ISchedule[];
}

export default function MySubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadApprovedSubjects();
    }
  }, [user]);

  const loadApprovedSubjects = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments?student_usn=${user.usn}&status=Approved`);
      if (!response.ok) {
        throw new Error('Failed to fetch approved subjects');
      }
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError('Could not load your subjects. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
      return <div>Loading your approved subjects...</div>
  }
  
  if (error) {
      return (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
          </div>
      );
  }

  return (
    <div>
      <h2 className="text-3xl mb-2">My Subjects</h2>
      <p className="text-gray-600 mb-8">All your approved subject enrollments are listed here.</p>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Book size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">You are not enrolled in any subjects yet.</p>
          <p className="text-gray-400 text-sm mt-2">Go to "Enroll Subject" to request enrollment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl mb-2 text-[#b40000] flex items-center gap-3">
                    <Book size={22} />
                    {subject.subject_name}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-3">
                    <User size={18} />
                    {subject.teacher_name}
                  </p>
                </div>
              </div>

              {subject.schedules && subject.schedules.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2 font-semibold text-gray-700">
                    <Calendar size={16} />
                    Schedules
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {subject.schedules.map((schedule, i) => (
                      <div key={i} className="bg-gray-100 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                        <Clock size={14} className="text-gray-600"/>
                        <span className="font-mono">{schedule.day} {schedule.start}-{schedule.end}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
