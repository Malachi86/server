import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Search } from 'lucide-react';

export default function Library() {
  const { user } = useAuth();
  const [barcode, setBarcode] = useState('');
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = () => {
    const requests = JSON.parse(localStorage.getItem('borrow_requests') || '[]');
    const mine = requests.filter((r: any) => r.student === user?.usn);
    setMyRequests(mine.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()));
  };

  const handleLookup = () => {
    if (!barcode.trim()) {
      alert('Please enter a barcode');
      return;
    }

    const books = JSON.parse(localStorage.getItem('library_books') || '[]');
    const book = books.find((b: any) => b.barcode === barcode.trim());

    if (!book) {
      alert('Book not found in library');
      setBookInfo(null);
      return;
    }

    setBookInfo(book);

    if (book.status === 'Available') {
      if (window.confirm(`Request to borrow "${book.title}"?`)) {
        const requests = JSON.parse(localStorage.getItem('borrow_requests') || '[]');
        
        const newRequest = {
          id: `BORR${Date.now()}`,
          student: user?.usn,
          student_name: user?.name,
          book_barcode: book.barcode,
          book_title: book.title,
          requested_at: new Date().toISOString(),
          status: 'Pending',
          admin_feedback: null,
          approved_at: null,
          due_date: null
        };

        requests.push(newRequest);
        localStorage.setItem('borrow_requests', JSON.stringify(requests));

        const audit = JSON.parse(localStorage.getItem('audit_log') || '[]');
        audit.push({
          ts: new Date().toISOString(),
          action: 'Library Borrow Requested',
          actor: user?.usn,
          details: { book_barcode: book.barcode, request_id: newRequest.id }
        });
        localStorage.setItem('audit_log', JSON.stringify(audit));

        alert('Borrow request submitted (Pending)');
        setBarcode('');
        setBookInfo(null);
        loadMyRequests();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl mb-2">Library</h2>
      <p className="text-gray-600 mb-8">Borrow books from the library</p>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h3 className="text-xl mb-4">Scan or Enter Book Barcode</h3>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter barcode..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
            autoFocus
          />
          <button
            onClick={handleLookup}
            className="px-6 py-3 bg-[#b40000] hover:bg-[#8b0000] text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Search size={20} />
            Lookup
          </button>
        </div>

        {bookInfo && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="mb-2">Book Information</h4>
            <p className="mb-1"><span className="text-gray-600">Title:</span> {bookInfo.title}</p>
            <p className="mb-1"><span className="text-gray-600">Author:</span> {bookInfo.author || 'N/A'}</p>
            <p className="mb-1">
              <span className="text-gray-600">Status:</span>{' '}
              <span className={`px-3 py-1 rounded-full text-sm ${bookInfo.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {bookInfo.status}
              </span>
            </p>
            {bookInfo.borrowed_by && (
              <p className="text-sm text-gray-500 mt-2">
                Currently borrowed by {bookInfo.borrowed_by}
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4">
          (If scanner acts like a keyboard, it will auto-submit with Enter)
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl mb-6 flex items-center gap-2">
          <BookOpen size={24} className="text-[#b40000]" />
          Your Recent Library Requests
        </h3>

        {myRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No requests yet</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((request) => {
              const statusColors: any = {
                Pending: 'bg-yellow-100 text-yellow-800',
                Approved: 'bg-green-100 text-green-800',
                Declined: 'bg-red-100 text-red-800'
              };

              return (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="mb-1">{request.book_title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.requested_at).toLocaleString()}
                    </p>
                    {request.due_date && (
                      <p className="text-sm text-gray-600 mt-1">
                        Due: {new Date(request.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[request.status]}`}>
                    {request.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
