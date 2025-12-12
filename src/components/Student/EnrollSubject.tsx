import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function EnrollSubject() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      loadSubjects(selectedTeacher);
    }
  }, [selectedTeacher]);

  const loadTeachers = () => {
    const teachersData = JSON.parse(localStorage.getItem('teachers') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    const teacherList = Object.keys(teachersData).map((usn) => ({
      usn,
      name: users[usn]?.name || usn,
      subjects: teachersData[usn].subjects || []
    })).filter(t => t.subjects.length > 0);

    setTeachers(teacherList);
  };

  const loadSubjects = (teacherUsn: string) => {
    const teachersData = JSON.parse(localStorage.getItem('teachers') || '{}');
    const teacherData = teachersData[teacherUsn];
    
    if (teacherData) {
      const subjectNames = teacherData.subjects.map((s: any) => s.name);
      setSubjects(subjectNames);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTeacher || !selectedSubject) {
      setError('Please select both teacher and subject');
      return;
    }

    // Check if already enrolled
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const existing = enrollments.find(
      (e: any) => e.student === user?.usn && e.teacher === selectedTeacher && e.subject === selectedSubject
    );

    if (existing) {
      setError(`You already have ${existing.status} enrollment for this subject`);
      return;
    }

    // Create enrollment request
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const newEnrollment = {
      id: `ENR${Date.now()}`,
      student: user?.usn,
      student_name: user?.name,
      teacher: selectedTeacher,
      teacher_name: users[selectedTeacher]?.name,
      subject: selectedSubject,
      status: 'pending',
      notified: false,
      requested_at: new Date().toISOString()
    };

    enrollments.push(newEnrollment);
    localStorage.setItem('enrollments', JSON.stringify(enrollments));

    // Add audit log
    const audit = JSON.parse(localStorage.getItem('audit_log') || '[]');
    audit.push({
      ts: new Date().toISOString(),
      action: 'Enrollment Requested',
      actor: user?.usn,
      details: { enrollment_id: newEnrollment.id, teacher: selectedTeacher, subject: selectedSubject }
    });
    localStorage.setItem('audit_log', JSON.stringify(audit));

    alert('Enrollment request submitted! Wait for teacher approval.');
    setSelectedTeacher('');
    setSelectedSubject('');
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl mb-2">Enroll in Subject</h2>
      <p className="text-gray-600 mb-8">Request enrollment in a teacher's subject</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm mb-2 text-gray-700">Teacher</label>
          <select
            value={selectedTeacher}
            onChange={(e) => {
              setSelectedTeacher(e.target.value);
              setSelectedSubject('');
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.usn} value={t.usn}>
                {t.name} ({t.usn})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2 text-gray-700">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
            required
            disabled={!selectedTeacher}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-[#b40000] hover:bg-[#8b0000] text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus size={20} />
          Submit Enrollment Request
        </button>
      </form>
    </div>
  );
}
