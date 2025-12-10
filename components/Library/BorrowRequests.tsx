import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export default function BorrowRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('borrow_requests') || '[]');
    setRequests(allRequests.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()));
  };

  const handleApprove = (requestId: string) => {
    const days = prompt('Days until due (default 7):', '7');
    if (!days) return;

    const daysNum = parseInt(days);
    const allRequests = JSON.parse(localStorage.getItem('borrow_requests') || '[]');
    const request = allRequests.find((r: any) => r.id === requestId);

    if (request) {
      const books = JSON.parse(localStorage.getItem('library_books') || '[]');
      const book = books.find((b: any) => b.barcode === request.book_barcode);

      if (book) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysNum);

        book.status = 'Borrowed';
        book.borrowed_by = request.student;
        book.borrowed_at = new Date().toISOString();
        book.due_date = dueDate.toISOString();
        
        localStorage.setItem('library_books', JSON.stringify(books));

        request.status = 'Approved';
        request.approved_at = new Date().toISOString();
        request.due_date = dueDate.toISOString();
        localStorage.setItem('borrow_requests', JSON.stringify(allRequests));

        // Add to records
        const records = JSON.parse(localStorage.getItem('borrow_records') || '[]');
        records.push({
          id: `REC${Date.now()}`,
          book_barcode: book.barcode,
          book_title: book.title,
          student: request.student,
          student_name: request.student_name,
          borrowed_at: new Date().toISOString(),
          due_date: dueDate.toISOString(),
          returned_at: null
        });
        localStorage.setItem('borrow_records', JSON.stringify(records));

        alert('Request approved!');
        loadRequests();
      }
    }
  };

  const handleDecline = (requestId: string) => {
    const feedback = prompt('Reason for declining (optional):');
    
    const allRequests = JSON.parse(localStorage.getItem('borrow_requests') || '[]');
    const request = allRequests.find((r: any) => r.id === requestId);

    if (request) {
      request.status = 'Declined';
      request.admin_feedback = feedback || '';
      request.approved_at = new Date().toISOString();
      localStorage.setItem('borrow_requests', JSON.stringify(allRequests));

      alert('Request declined');
      loadRequests();
    }
  };

  const markReturned = () => {
    const barcode = prompt('Scan or enter book barcode:');
    if (!barcode) return;

    const books = JSON.parse(localStorage.getItem('library_books') || '[]');
    const book = books.find((b: any) => b.barcode === barcode);

    if (!book) {
      alert('Book not found');
      return;
    }

    if (book.status !== 'Borrowed') {
      alert('Book is not borrowed');
      return;
    }

    book.status = 'Available';
    const student = book.borrowed_by;
    book.borrowed_by = null;
    book.borrowed_at = null;
    book.due_date = null;
    localStorage.setItem('library_books', JSON.stringify(books));

    // Update record
    const records = JSON.parse(localStorage.getItem('borrow_records') || '[]');
    const record = records.reverse().find(
      (r: any) => r.book_barcode === barcode && r.student === student && !r.returned_at
    );
    if (record) {
      record.returned_at = new Date().toISOString();
      localStorage.setItem('borrow_records', JSON.stringify(records));
    }

    alert(`Book ${barcode} marked as returned`);
    loadRequests();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-2">Borrow Requests</h2>
          <p className="text-gray-600">Review and process borrow requests</p>
        </div>
        <button
          onClick={markReturned}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Mark Returned (Scan)
        </button>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No borrow requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl mb-2">{request.book_title}</h3>
                  <p className="text-gray-600 mb-1">
                    Student: {request.student_name} ({request.student})
                  </p>
                  <p className="text-gray-600 mb-1">Barcode: {request.book_barcode}</p>
                  <p className="text-sm text-gray-500">
                    Requested: {new Date(request.requested_at).toLocaleString()}
                  </p>
                  {request.due_date && (
                    <p className="text-sm text-gray-600 mt-2">
                      Due: {new Date(request.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm ${
                    request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                  {request.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle size={18} />
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
