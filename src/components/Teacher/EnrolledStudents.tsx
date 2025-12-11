import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Book, User, List } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

interface IEnrollment {
  id: string;
  student_usn: string;
  student_name: string;
  subject_name: string;
}

export default function EnrolledStudents() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (user) {
      loadEnrolledStudents();
    }
  }, [user]);

  const loadEnrolledStudents = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments?teacher_usn=${user.usn}&status=Approved`);
      if (!response.ok) {
        throw new Error('Failed to fetch enrolled students');
      }
      const data = await response.json();
      setEnrollments(data);
    } catch (err) {
      setError('Could not load enrolled students.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Group enrollments by subject
  const enrollmentsBySubject: { [key: string]: IEnrollment[] } = enrollments.reduce((acc, current) => {
    acc[current.subject_name] = acc[current.subject_name] || [];
    acc[current.subject_name].push(current);
    return acc;
  }, {} as { [key: string]: IEnrollment[] });

  if (isLoading) {
    return <div>Loading enrolled students...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-3xl mb-2">Enrolled Students</h2>
      <p className="text-gray-600 mb-8">A list of all students approved for your subjects.</p>
      
      {Object.keys(enrollmentsBySubject).length === 0 ? (
        <p>No students are enrolled in any of your subjects yet.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(enrollmentsBySubject).map(([subjectName, subjectEnrollments]) => (
            <div key={subjectName} className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-2xl mb-4 flex items-center gap-3 text-[#b40000]">
                  <Book size={22} />
                  {subjectName}
              </h3>
              <ul className="space-y-3">
                {subjectEnrollments.map((enrollment) => (
                  <li key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-gray-600" />
                      <div>
                        <p className="font-medium">{enrollment.student_name}</p>
                        <p className="text-sm text-gray-500">{enrollment.student_usn}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
