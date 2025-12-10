import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Book } from 'lucide-react';

export default function EnrolledStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const approved = enrollments.filter(
      (e: any) => e.teacher === user?.usn && e.status === 'Approved'
    );

    const uniqueSubjects = Array.from(new Set(approved.map((e: any) => e.subject)));
    setSubjects(['All', ...uniqueSubjects]);
    setStudents(approved);
  };

  const filteredStudents = selectedSubject === 'All'
    ? students
    : students.filter(s => s.subject === selectedSubject);

  return (
    <div>
      <h2 className="text-3xl mb-2">Enrolled Students</h2>
      <p className="text-gray-600 mb-8">View all approved student enrollments</p>

      <div className="mb-6">
        <label className="block text-sm mb-2 text-gray-700">Filter by Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          {subjects.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No enrolled students yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">USN</th>
                <th className="px-6 py-4 text-left">Subject</th>
                <th className="px-6 py-4 text-left">Enrolled Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{student.student_name}</td>
                  <td className="px-6 py-4">{student.student}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                      <Book size={16} className="text-[#b40000]" />
                      {student.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(student.requested_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
