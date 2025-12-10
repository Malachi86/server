import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Send, AlertCircle } from 'lucide-react';

export default function MakeRequest() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [availablePCs, setAvailablePCs] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    type: 'lab',
    labOrRoom: '',
    pc: '',
    room: '',
    startTime: '',
    endTime: '',
    reason: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeachers();
    loadLabs();
    loadRooms();
  }, []);

  useEffect(() => {
    if (formData.teacher) {
      loadSubjects(formData.teacher);
    }
  }, [formData.teacher]);

  useEffect(() => {
    if (formData.type === 'lab' && formData.labOrRoom) {
      loadAvailablePCs(formData.labOrRoom);
    }
  }, [formData.labOrRoom, formData.type]);

  const loadTeachers = () => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    const myApproved = enrollments.filter(
      (e: any) => e.student === user?.usn && e.status === 'Approved'
    );

    const uniqueTeachers: any[] = [];
    const seen = new Set();

    myApproved.forEach((e: any) => {
      if (!seen.has(e.teacher)) {
        seen.add(e.teacher);
        uniqueTeachers.push({
          usn: e.teacher,
          name: users[e.teacher]?.name || e.teacher
        });
      }
    });

    setTeachers(uniqueTeachers);
  };

  const loadSubjects = (teacherUsn: string) => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    const mySubjects = enrollments
      .filter((e: any) => e.student === user?.usn && e.teacher === teacherUsn && e.status === 'Approved')
      .map((e: any) => e.subject);

    setSubjects(mySubjects);
  };

  const loadLabs = () => {
    const labsData = JSON.parse(localStorage.getItem('labs') || '[]');
    setLabs(labsData);
  };

  const loadRooms = () => {
    const roomsData = JSON.parse(localStorage.getItem('rooms') || '[]');
    setRooms(roomsData);
  };

  const loadAvailablePCs = (labId: string) => {
    const labsData = JSON.parse(localStorage.getItem('labs') || '[]');
    const lab = labsData.find((l: any) => l.id === labId);
    
    if (lab) {
      const available = lab.pcs
        .filter((pc: any) => pc.status === 'available')
        .map((pc: any) => pc.number);
      setAvailablePCs(available);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.teacher || !formData.subject) {
      setError('Please select teacher and subject');
      return;
    }

    if (formData.type === 'lab' && !formData.pc) {
      setError('Please select a PC');
      return;
    }

    if (formData.type === 'room' && !formData.room) {
      setError('Please select a room');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError('Please enter start and end time');
      return;
    }

    if (formData.teacher === 'admin' && formData.subject === 'Personal Use' && !formData.reason) {
      setError('Reason is required for Personal Use');
      return;
    }

    // Create request
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    const newRequest = {
      id: `REQ${Date.now()}`,
      student: user?.usn,
      student_name: user?.name,
      teacher: formData.teacher,
      teacher_name: users[formData.teacher]?.name,
      subject: formData.subject,
      type: formData.type,
      lab: formData.type === 'lab' ? labs.find(l => l.id === formData.labOrRoom)?.name : null,
      room: formData.type === 'room' ? formData.room : null,
      pc: formData.type === 'lab' ? formData.pc : null,
      start_iso: new Date(`${new Date().toDateString()} ${formData.startTime}`).toISOString(),
      end_iso: new Date(`${new Date().toDateString()} ${formData.endTime}`).toISOString(),
      status: 'Pending',
      reason: formData.reason,
      requested_at: new Date().toISOString()
    };

    requests.push(newRequest);
    localStorage.setItem('requests', JSON.stringify(requests));

    // Add audit log
    const audit = JSON.parse(localStorage.getItem('audit_log') || '[]');
    audit.push({
      ts: new Date().toISOString(),
      action: 'Request Created',
      actor: user?.usn,
      details: { request_id: newRequest.id, teacher: formData.teacher, subject: formData.subject }
    });
    localStorage.setItem('audit_log', JSON.stringify(audit));

    alert('Request submitted successfully!');
    
    // Reset form
    setFormData({
      teacher: '',
      subject: '',
      type: 'lab',
      labOrRoom: '',
      pc: '',
      room: '',
      startTime: '',
      endTime: '',
      reason: ''
    });
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl mb-2">Make Lab Request</h2>
      <p className="text-gray-600 mb-8">Request access to lab or room</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Teacher</label>
            <select
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value, subject: '' })}
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
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
              required
              disabled={!formData.teacher}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2 text-gray-700">Request Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="lab"
                checked={formData.type === 'lab'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, labOrRoom: '', pc: '', room: '' })}
                className="w-4 h-4 text-[#b40000]"
              />
              <span>Lab (with PC)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="room"
                checked={formData.type === 'room'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, labOrRoom: '', pc: '', room: '' })}
                className="w-4 h-4 text-[#b40000]"
              />
              <span>Room</span>
            </label>
          </div>
        </div>

        {formData.type === 'lab' ? (
          <>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Lab</label>
              <select
                value={formData.labOrRoom}
                onChange={(e) => setFormData({ ...formData, labOrRoom: e.target.value, pc: '' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                required
              >
                <option value="">Select Lab</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name} (Capacity: {lab.capacity})
                  </option>
                ))}
              </select>
            </div>

            {formData.labOrRoom && (
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Available PCs ({availablePCs.length} available)
                </label>
                <select
                  value={formData.pc}
                  onChange={(e) => setFormData({ ...formData, pc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select PC</option>
                  {availablePCs.map((pc) => (
                    <option key={pc} value={pc}>
                      PC {pc}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        ) : (
          <div>
            <label className="block text-sm mb-2 text-gray-700">Room</label>
            <select
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
              required
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name} (Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">End Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        {formData.teacher === 'admin' && formData.subject === 'Personal Use' && (
          <div>
            <label className="block text-sm mb-2 text-gray-700">Reason (Required for Personal Use)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b40000] focus:border-transparent outline-none"
              rows={4}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#b40000] hover:bg-[#8b0000] text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Send size={20} />
          Submit Request
        </button>
      </form>
    </div>
  );
}
