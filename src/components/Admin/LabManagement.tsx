import React, { useState, useEffect } from 'react';
import { Monitor, Plus } from 'lucide-react';

const API_BASE_URL = 'https://server-sqj1.onrender.com';

export default function LabManagement() {
  const [labs, setLabs] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [view, setView] = useState('labs'); // 'labs' or 'rooms'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [labsRes, roomsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/labs`),
        fetch(`${API_BASE_URL}/rooms`)
      ]);
      if (!labsRes.ok || !roomsRes.ok) {
        throw new Error('Failed to fetch data');
      }
      const labsData = await labsRes.json();
      const roomsData = await roomsRes.json();
      setLabs(labsData);
      setRooms(roomsData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert('Could not load lab and room data.');
    } finally {
      setIsLoading(false);
    }
  };

  const addLab = async () => {
    const name = prompt('Enter new lab name:');
    const capacity = prompt('Enter lab capacity (number of PCs):');
    if (name && capacity && !isNaN(parseInt(capacity))) {
      try {
        const response = await fetch(`${API_BASE_URL}/labs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, capacity: parseInt(capacity) }),
        });
        if (!response.ok) throw new Error('Failed to add lab');
        loadData(); // Refresh data
      } catch (error) {
        console.error("Error adding lab:", error);
        alert('Failed to add new lab.');
      }
    }
  };

  const addRoom = async () => {
    const name = prompt('Enter new room name:');
    const capacity = prompt('Enter room capacity:');
    if (name && capacity && !isNaN(parseInt(capacity))) {
      try {
        const response = await fetch(`${API_BASE_URL}/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, capacity: parseInt(capacity) }),
        });
        if (!response.ok) throw new Error('Failed to add room');
        loadData(); // Refresh data
      } catch (error) {
        console.error("Error adding room:", error);
        alert('Failed to add new room.');
      }
    }
  };

  if (isLoading) {
    return <div>Loading facilities...</div>
  }

  return (
    <div>
      <h2 className="text-3xl mb-2">Lab & Room Management</h2>
      <p className="text-gray-600 mb-8">Manage facilities available in the system.</p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView('labs')}
          className={`px-6 py-3 rounded-lg ${
            view === 'labs' ? 'bg-[#b40000] text-white' : 'bg-gray-100'
          }`}
        >
          Labs
        </button>
        <button
          onClick={() => setView('rooms')}
          className={`px-6 py-3 rounded-lg ${
            view === 'rooms' ? 'bg-[#b40000] text-white' : 'bg-gray-100'
          }`}
        >
          Rooms
        </button>
      </div>

      {view === 'labs' ? (
        <>
          <button
            onClick={addLab}
            className="mb-6 px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
          >
            <Plus size={20} />
            Add Lab
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            {labs.map((lab) => (
              <div key={lab.id} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <Monitor className="text-[#b40000]" />
                  {lab.name}
                </h3>
                <p className="text-gray-600 mb-4">Capacity: {lab.capacity} PCs</p>
                {/* PC View button temporarily disabled */}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={addRoom}
            className="mb-6 px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
          >
            <Plus size={20} />
            Add Room
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl mb-4">{room.name}</h3>
                <p className="text-gray-600">Capacity: {room.capacity}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
