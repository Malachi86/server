import React, { useState, useEffect } from 'react';
import { Clock, BookOpen } from 'lucide-react';

export default function BorrowRecords() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = JSON.parse(localStorage.getItem('borrow_records') || '[]');
    setRecords(allRecords.sort((a, b) => new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()));
  };

  return (
    <div>
      <h2 className="text-3xl mb-2">Borrow Records</h2>
      <p className="text-gray-600 mb-8">Complete history of book borrowing</p>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left">Book</th>
              <th className="px-4 py-4 text-left">Barcode</th>
              <th className="px-4 py-4 text-left">Student</th>
              <th className="px-4 py-4 text-left">Borrowed</th>
              <th className="px-4 py-4 text-left">Due Date</th>
              <th className="px-4 py-4 text-left">Returned</th>
              <th className="px-4 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => {
              const isOverdue = !record.returned_at && new Date() > new Date(record.due_date);
              const isActive = !record.returned_at;

              return (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-4">{record.book_title}</td>
                  <td className="px-4 py-4">{record.book_barcode}</td>
                  <td className="px-4 py-4">
                    {record.student_name}<br />
                    <span className="text-sm text-gray-500">({record.student})</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(record.borrowed_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(record.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {record.returned_at ? new Date(record.returned_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isOverdue ? 'bg-red-100 text-red-800' :
                      isActive ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {isOverdue ? 'Overdue' : isActive ? 'Active' : 'Returned'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
