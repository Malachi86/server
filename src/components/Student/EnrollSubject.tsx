import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

export default function EnrollSubject() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, subjectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/subjects`)
      ]);
      if (!usersRes.ok || !subjectsRes.ok) throw new Error('Failed to load data');
      
      const allUsers = await usersRes.json();
      const allSubjects = await subjectsRes.json();

      const teacherList = allUsers.filter((u: any) => u.role === 'teacher');
      setTeachers(teacherList);
      setSubjects(allSubjects);
      
    } catch (err) {
      setError('Could not load teachers or subjects.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !selectedSubjectId) {
      setError('Please select a subject to enroll.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_usn: user.usn,
          subject_id: selectedSubjectId,
        }),
      });

      if (response.status === 409) {
        setError('You already have a pending or approved enrollment for this subject.');
        return;
      }
      if (!response.ok) {
        throw new Error('Enrollment failed');
      }
      
      alert('Enrollment request submitted successfully! Please wait for teacher approval.');
      setSelectedTeacher('');
      setSelectedSubjectId('');

    } catch (err) {
      setError('An error occurred while submitting your enrollment.');
      console.error(err);
    }
  };
  
  const teacherSubjects = selectedTeacher ? subjects.filter(s => s.teacher_usn === selectedTeacher) : [];

  if (isLoading) {
      return <div>Loading available subjects...</div>
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl mb-2">Enroll in a Subject</h2>
      <p className="text-gray-600 mb-8">Request enrollment in a teacher\'s subject. Your request will be sent for approval.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm mb-2 text-gray-700">Filter by Teacher</label>
          <select
            value={selectedTeacher}
            onChange={(e) => {
              setSelectedTeacher(e.target.value);
              setSelectedSubjectId(''); // Reset subject selection
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
          >
            <option value="">All Teachers</option>
            {teachers.map((t) => (
              <option key={t.usn} value={t.usn}>
                {t.name} ({t.usn})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2 text-gray-700">Select Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
            required
            disabled={isLoading || (selectedTeacher !== '' && teacherSubjects.length === 0)}
          >
            <option value="">Select a Subject</option>
            {(selectedTeacher ? teacherSubjects : subjects).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-[#b40000] hover:bg-[#8b0000] text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
          disabled={isLoading || !selectedSubjectId}
        >
          <UserPlus size={20} />
          Submit Enrollment Request
        </button>
      </form>
    </div>
  );
}