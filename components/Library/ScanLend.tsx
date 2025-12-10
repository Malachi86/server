import React, { useState } from 'react';
import { Scan, User, Book, Calendar, CheckCircle, RotateCcw } from 'lucide-react';

export default function ScanLend() {
  const [bookBarcode, setBookBarcode] = useState('');
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [userUSN, setUserUSN] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [daysUntilDue, setDaysUntilDue] = useState('7');
  const [step, setStep] = useState<'scan' | 'user' | 'confirm'>('scan');
  const [mode, setMode] = useState<'lend' | 'return'>('lend');

  const scanBook = () => {
    if (!bookBarcode.trim()) {
      alert('Please enter a book barcode');
      return;
    }

    const books = JSON.parse(localStorage.getItem('library_books') || '[]');
    const book = books.find((b: any) => b.barcode === bookBarcode);

    if (!book) {
      alert('Book not found!');
      return;
    }

    if (mode === 'lend' && book.status === 'Borrowed') {
      alert('This book is currently borrowed!');
      return;
    }

    if (mode === 'return' && book.status !== 'Borrowed') {
      alert('This book is not borrowed!');
      return;
    }

    setBookInfo(book);
    
    if (mode === 'return') {
      // Auto-fill user info for return
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const borrowerInfo = users[book.borrowed_by];
      if (borrowerInfo) {
        setUserInfo({ usn: book.borrowed_by, ...borrowerInfo });
        setStep('confirm');
      } else {
        setStep('user');
      }
    } else {
      setStep('user');
    }
  };

  const handleReturn = () => {
    if (!bookInfo) return;

    // Update book status
    const books = JSON.parse(localStorage.getItem('library_books') || '[]');
    const book = books.find((b: any) => b.barcode === bookInfo.barcode);
    
    if (book) {
      book.status = 'Available';
      book.borrowed_by = null;
      book.borrowed_at = null;
      book.due_date = null;
      localStorage.setItem('library_books', JSON.stringify(books));
    }

    // Update borrow record
    const records = JSON.parse(localStorage.getItem('borrow_records') || '[]');
    const record = records.reverse().find(
      (r: any) => r.book_barcode === bookInfo.barcode && !r.returned_at
    );
    if (record) {
      record.returned_at = new Date().toISOString();
      localStorage.setItem('borrow_records', JSON.stringify(records));
    }

    alert('Book returned successfully!');
    reset();
  };

  const findUser = () => {
    if (!userUSN.trim()) {
      alert('Please enter a USN/EMP ID');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[userUSN];

    if (!user) {
      alert('User not found!');
      return;
    }

    setUserInfo({ usn: userUSN, ...user });
    setStep('confirm');
  };

  const confirmLending = () => {
    if (!bookInfo || !userInfo) return;

    const daysNum = parseInt(daysUntilDue);
    if (isNaN(daysNum) || daysNum < 1) {
      alert('Please enter a valid number of days');
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysNum);

    // Update book status
    const books = JSON.parse(localStorage.getItem('library_books') || '[]');
    const book = books.find((b: any) => b.barcode === bookInfo.barcode);
    
    if (book) {
      book.status = 'Borrowed';
      book.borrowed_by = userInfo.usn;
      book.borrowed_at = new Date().toISOString();
      book.due_date = dueDate.toISOString();
      localStorage.setItem('library_books', JSON.stringify(books));
    }

    // Add to borrow records
    const records = JSON.parse(localStorage.getItem('borrow_records') || '[]');
    records.push({
      id: `REC${Date.now()}`,
      book_barcode: bookInfo.barcode,
      book_title: bookInfo.title,
      student: userInfo.usn,
      student_name: userInfo.name,
      borrowed_at: new Date().toISOString(),
      due_date: dueDate.toISOString(),
      returned_at: null
    });
    localStorage.setItem('borrow_records', JSON.stringify(records));

    alert(`Book lent successfully!\nDue date: ${dueDate.toLocaleDateString()}`);

    // Reset form
    setBookBarcode('');
    setBookInfo(null);
    setUserUSN('');
    setUserInfo(null);
    setDaysUntilDue('7');
    setStep('scan');
  };

  const reset = () => {
    setBookBarcode('');
    setBookInfo(null);
    setUserUSN('');
    setUserInfo(null);
    setDaysUntilDue('7');
    setStep('scan');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-2">Scan & Lend Books</h2>
          <p className="text-gray-600">Scan book barcode and enter student USN to lend or return books</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('lend'); reset(); }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              mode === 'lend' 
                ? 'bg-[#b40000] text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Scan size={20} />
            Lend Book
          </button>
          <button
            onClick={() => { setMode('return'); reset(); }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              mode === 'return' 
                ? 'bg-[#b40000] text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <RotateCcw size={20} />
            Return Book
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
        {/* Step 1: Scan Book */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'scan' ? 'bg-[#b40000] text-white' : 
              bookInfo ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <h3 className="text-xl">Scan Book</h3>
          </div>

          <div className="ml-11 space-y-4">
            {!bookInfo ? (
              <>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Book Barcode</label>
                  <input
                    type="text"
                    value={bookBarcode}
                    onChange={(e) => setBookBarcode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && scanBook()}
                    placeholder="Scan or enter barcode..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    disabled={step !== 'scan'}
                  />
                </div>
                <button
                  onClick={scanBook}
                  className="px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
                  disabled={step !== 'scan'}
                >
                  <Scan size={20} />
                  Scan Book
                </button>
              </>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-green-900">Book Found</span>
                </div>
                <p className="text-green-800"><strong>{bookInfo.title}</strong></p>
                <p className="text-green-700 text-sm">Author: {bookInfo.author}</p>
                <p className="text-green-700 text-sm">Barcode: {bookInfo.barcode}</p>
                {bookInfo.status === 'Borrowed' && (
                  <p className="text-green-700 text-sm">Borrowed by: {bookInfo.borrowed_by}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Find User (skip for return if already known) */}
        {mode === 'lend' && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'user' ? 'bg-[#b40000] text-white' : 
                userInfo ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <h3 className="text-xl">Find Student/Teacher</h3>
            </div>

            <div className="ml-11 space-y-4">
              {!userInfo ? (
                <>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">USN / EMP ID</label>
                    <input
                      type="text"
                      value={userUSN}
                      onChange={(e) => setUserUSN(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && findUser()}
                      placeholder="Enter USN or Employee ID..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      disabled={step !== 'user'}
                    />
                  </div>
                  <button
                    onClick={findUser}
                    className="px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
                    disabled={step !== 'user'}
                  >
                    <User size={20} />
                    Find User
                  </button>
                </>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="text-green-900">User Found</span>
                  </div>
                  <p className="text-green-800"><strong>{userInfo.name}</strong></p>
                  <p className="text-green-700 text-sm">ID: {userInfo.usn}</p>
                  <p className="text-green-700 text-sm capitalize">Role: {userInfo.role.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#b40000] text-white">
                {mode === 'lend' ? '3' : '2'}
              </div>
              <h3 className="text-xl">{mode === 'lend' ? 'Confirm & Set Due Date' : 'Confirm Return'}</h3>
            </div>

            <div className="ml-11 space-y-4">
              {mode === 'lend' ? (
                <>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Days Until Due</label>
                    <input
                      type="number"
                      value={daysUntilDue}
                      onChange={(e) => setDaysUntilDue(e.target.value)}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Due Date: {new Date(Date.now() + parseInt(daysUntilDue || '7') * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={confirmLending}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Confirm & Lend
                    </button>
                    <button
                      onClick={reset}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <p className="text-blue-900"><strong>Book:</strong> {bookInfo?.title}</p>
                    <p className="text-blue-900"><strong>Borrowed by:</strong> {userInfo?.name} ({userInfo?.usn})</p>
                    {bookInfo?.borrowed_at && (
                      <p className="text-blue-900">
                        <strong>Borrowed on:</strong> {new Date(bookInfo.borrowed_at).toLocaleDateString()}
                      </p>
                    )}
                    {bookInfo?.due_date && (
                      <p className="text-blue-900">
                        <strong>Due date:</strong> {new Date(bookInfo.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReturn}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Confirm Return
                    </button>
                    <button
                      onClick={reset}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {(bookInfo || userInfo) && step !== 'confirm' && (
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}