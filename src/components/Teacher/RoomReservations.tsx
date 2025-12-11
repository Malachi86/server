import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Plus, Trash2, Book } from 'lucide-react';

// Define interfaces for type safety
interface IReservation {
  id: string;
  teacher: string;
  teacher_name: string;
  subject: string;
  location_type: 'room' | 'lab';
  location_id: string;
  location_name: string;
  date: string;
  day: string;
  time: string;
  created_at: string;
}

interface ILocation {
  id: string;
  name: string;
}

interface ISchedule {
  day: string;
  start: string;
  end: string;
}

interface ISubject {
  name: string;
  schedules: ISchedule[];
}

interface ITeachers {
  [key: string]: {
    subjects: ISubject[];
  };
}

export default function RoomReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [rooms, setRooms] = useState<ILocation[]>([]);
  const [labs, setLabs] = useState<ILocation[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;

    // Load reservations
    const allReservations: IReservation[] = JSON.parse(localStorage.getItem('reservations') || '[]');
    const myReservations = allReservations.filter((r) => r.teacher === user.usn);
    setReservations(myReservations);

    // Load rooms and labs
    const storedRooms: ILocation[] = JSON.parse(localStorage.getItem('rooms') || '[]');
    const storedLabs: ILocation[] = JSON.parse(localStorage.getItem('labs') || '[]');
    setRooms(storedRooms);
    setLabs(storedLabs);

    // Load teacher subjects
    const teachers: ITeachers = JSON.parse(localStorage.getItem('teachers') || '{}');
    const teacherData = teachers[user.usn];
    if (teacherData && teacherData.subjects) {
      setSubjects(teacherData.subjects);
    }
  };

  const addReservation = () => {
    if (!user) return;
    if (subjects.length === 0) {
      alert('You need to add subjects first! Go to Manage Subjects.');
      return;
    }

    // Get subject
    const subjectName = prompt('Enter subject name:\n' + subjects.map(s => s.name).join(', '));
    if (!subjectName) return;

    const subject = subjects.find(s => s.name === subjectName);
    if (!subject) {
      alert('Subject not found!');
      return;
    }

    // Get location type
    const locationType = prompt('Location type: room or lab?')?.toLowerCase();
    if (!locationType || (locationType !== 'room' && locationType !== 'lab')) {
      alert('Please enter "room" or "lab"');
      return;
    }

    // Get location
    const locations = locationType === 'room' ? rooms : labs;
    if (locations.length === 0) {
      alert(`No ${locationType}s available! Contact admin to add ${locationType}s.`);
      return;
    }

    const locationList = locations.map(l => l.name).join(', ');
    const locationName = prompt(`Select ${locationType}:\n${locationList}`);
    if (!locationName) return;

    const location = locations.find(l => l.name === locationName);
    if (!location) {
      alert(`${locationType} not found!`);
      return;
    }

    // Get date
    const dateStr = prompt('Enter date (YYYY-MM-DD):');
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      alert('Invalid date format!');
      return;
    }

    // Get day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];

    // Check if subject has schedule for this day
    const schedule = subject.schedules?.find((s) => s.day === dayName.substring(0, 3));
    
    let timeInfo = '';
    if (schedule) {
      timeInfo = `${schedule.start} - ${schedule.end}`;
    } else {
      const timeInput = prompt('No schedule found for this day. Enter time (e.g., "10:00 - 12:00"):');
      if (!timeInput) return;
      timeInfo = timeInput;
    }

    const newReservation: IReservation = {
      id: `res_${Date.now()}`,
      teacher: user.usn,
      teacher_name: user.name,
      subject: subjectName,
      location_type: locationType as 'room' | 'lab',
      location_id: location.id,
      location_name: location.name,
      date: dateStr,
      day: dayName,
      time: timeInfo,
      created_at: new Date().toISOString()
    };

    const allReservations: IReservation[] = JSON.parse(localStorage.getItem('reservations') || '[]');
    allReservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(allReservations));

    alert(`Reserved ${location.name} for ${subjectName} on ${dateStr}`);
    loadData();
  };

  const deleteReservation = (id: string) => {
    if (!confirm('Delete this reservation?')) return;

    const allReservations: IReservation[] = JSON.parse(localStorage.getItem('reservations') || '[]');
    const updated = allReservations.filter((r) => r.id !== id);
    localStorage.setItem('reservations', JSON.stringify(updated));

    alert('Reservation deleted!');
    loadData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-2">Room & Lab Reservations</h2>
          <p className="text-gray-600">Reserve rooms/labs for your subjects</p>
        </div>
        <button
          onClick={addReservation}
          className="px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
        >
          <Plus size={20} />
          Add Reservation
        </button>
      </div>

      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-4">No reservations yet</p>
            <p className="text-gray-400">Click "Add Reservation" to reserve a room or lab</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservations
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Book size={24} className="text-[#b40000]" />
                        <h3 className="text-xl">{reservation.subject}</h3>
                      </div>
                      
                      <div className="space-y-2 ml-9">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin size={18} />
                          <span className="capitalize">{reservation.location_type}: {reservation.location_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar size={18} />
                          <span>{new Date(reservation.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        
                        <p className="text-gray-600">Time: {reservation.time}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteReservation(reservation.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
