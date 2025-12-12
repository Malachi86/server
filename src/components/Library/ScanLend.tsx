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
    reset();
  };

  const reset = () => {
    setBookBarcode('');
    setBookInfo(null);
    setUserUSN('');
    setUserInfo(null);
    setDaysUntilDue('7');
    setStep('scan');
  };

  const renderCard = (cardMode: 'lend' | 'return') => {
    const isLend = cardMode === 'lend';
    const isActive = mode === cardMode;

    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${isActive ? 'ring-2 ring-ama-primary' : 'opacity-80'}`}>
        <button 
          onClick={() => { setMode(cardMode); reset(); }}
          className="w-full mb-4"
        >
          <h3 className="text-2xl font-bold text-ama-primary text-center flex items-center justify-center">
            {isLend ? <Scan className="mr-2" /> : <RotateCcw className="mr-2" />}
            {isLend ? 'Lend Book' : 'Return Book'}
          </h3>
        </button>

        {isActive && (
          <div className="space-y-4">
            {/* Scan Book */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Book Barcode</label>
              <input
                type="text"
                value={bookBarcode}
                onChange={(e) => setBookBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && scanBook()}
                placeholder="Scan or enter barcode..."
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {bookInfo && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <p><strong>{bookInfo.title}</strong></p>
                <p>by {bookInfo.author}</p>
              </div>
            )}

            {isLend && step !== 'scan' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Student USN</label>
                <input
                  type="text"
                  value={userUSN}
                  onChange={(e) => setUserUSN(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && findUser()}
                  placeholder="Enter student USN..."
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                  disabled={!bookInfo}
                />
              </div>
            )}

            {userInfo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p><strong>{userInfo.name}</strong></p>
                <p>{userInfo.usn} | {userInfo.role}</p>
              </div>
            )}

            {isLend && step === 'confirm' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Days Until Due</label>
                <input
                  type="number"
                  value={daysUntilDue}
                  onChange={(e) => setDaysUntilDue(e.target.value)}
                  min="1"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={isLend ? (step === 'scan' ? scanBook : (step === 'user' ? findUser : confirmLending)) : (step === 'scan' ? scanBook : handleReturn)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ama-primary hover:bg-opacity-90"
                disabled={!bookBarcode && step === 'scan'}
              >
                {isLend ? (step === 'scan' ? 'Scan Book' : (step === 'user' ? 'Find User' : 'Confirm')) : (step === 'scan' ? 'Scan Book' : 'Confirm Return')}
              </button>
              <button
                onClick={reset}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-ama-primary mb-2">Scan & Lend</h2>
      <p className="text-gray-600 mb-8">Manage book lending and returns.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderCard('lend')}
        {renderCard('return')}
      </div>
    </div>
  );
}
