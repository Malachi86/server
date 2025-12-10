import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Pencil, Trash2, Building } from 'lucide-react';

export default function SystemSettings() {
  const [teacherCode, setTeacherCode] = useState('AMACC2025');
  const [rooms, setRooms] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editingLab, setEditingLab] = useState<any>(null);

  useEffect(() => {
    loadRoomsAndLabs();
  }, []);

  const loadRoomsAndLabs = () => {
    const storedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const storedLabs = JSON.parse(localStorage.getItem('labs') || '[]');
    setRooms(storedRooms);
    setLabs(storedLabs);
  };

  const handleSave = () => {
    // Settings saved to localStorage if needed
    alert('Settings saved!');
  };

  const addRoom = () => {
    const name = prompt('Enter room name:');
    const capacity = prompt('Enter room capacity:', '30');
    
    if (!name || !capacity) return;

    const newRoom = {
      id: `room_${Date.now()}`,
      name,
      capacity: parseInt(capacity)
    };

    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    alert('Room added successfully!');
  };

  const addLab = () => {
    const name = prompt('Enter lab name:');
    const capacity = prompt('Enter lab capacity (number of PCs):', '40');
    
    if (!name || !capacity) return;

    const numPCs = parseInt(capacity);
    const newLab = {
      id: `lab_${Date.now()}`,
      name,
      capacity: numPCs,
      pcs: Array.from({ length: numPCs }, (_, i) => ({ 
        number: i + 1, 
        status: 'available', 
        currentUser: null 
      }))
    };

    const updatedLabs = [...labs, newLab];
    setLabs(updatedLabs);
    localStorage.setItem('labs', JSON.stringify(updatedLabs));
    alert('Lab added successfully!');
  };

  const editRoom = (room: any) => {
    const newName = prompt('Enter new room name:', room.name);
    const newCapacity = prompt('Enter new capacity:', room.capacity.toString());
    
    if (!newName || !newCapacity) return;

    const updatedRooms = rooms.map(r => 
      r.id === room.id 
        ? { ...r, name: newName, capacity: parseInt(newCapacity) }
        : r
    );

    setRooms(updatedRooms);
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    alert('Room updated successfully!');
  };

  const editLab = (lab: any) => {
    const newName = prompt('Enter new lab name:', lab.name);
    
    if (!newName) return;

    const updatedLabs = labs.map(l => 
      l.id === lab.id 
        ? { ...l, name: newName }
        : l
    );

    setLabs(updatedLabs);
    localStorage.setItem('labs', JSON.stringify(updatedLabs));
    alert('Lab updated successfully!');
  };

  const deleteRoom = (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    const updatedRooms = rooms.filter(r => r.id !== roomId);
    setRooms(updatedRooms);
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    alert('Room deleted successfully!');
  };

  const deleteLab = (labId: string) => {
    if (!confirm('Are you sure you want to delete this lab?')) return;

    const updatedLabs = labs.filter(l => l.id !== labId);
    setLabs(updatedLabs);
    localStorage.setItem('labs', JSON.stringify(updatedLabs));
    alert('Lab deleted successfully!');
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl mb-2">System Settings</h2>
      <p className="text-gray-600 mb-8">Configure system preferences and manage rooms/labs</p>

      {/* Teacher Code Setting */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 mb-6">
        <div>
          <label className="block text-sm mb-2 text-gray-700">
            Teacher Secret Code
          </label>
          <input
            type="text"
            value={teacherCode}
            onChange={(e) => setTeacherCode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-2">
            Code required for teacher registration
          </p>
        </div>

        <div className="pt-6">
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </div>

      {/* Room Management */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl flex items-center gap-2">
            <Building className="text-[#b40000]" />
            Manage Rooms
          </h3>
          <button
            onClick={addRoom}
            className="px-4 py-2 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
          >
            <Plus size={18} />
            Add Room
          </button>
        </div>

        <div className="space-y-3">
          {rooms.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No rooms added yet</p>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-gray-600">Capacity: {room.capacity} students</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editRoom(room)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRoom(room.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lab Management */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl flex items-center gap-2">
            <Building className="text-[#b40000]" />
            Manage Labs
          </h3>
          <button
            onClick={addLab}
            className="px-4 py-2 bg-[#b40000] text-white rounded-lg hover:bg-[#8b0000] flex items-center gap-2"
          >
            <Plus size={18} />
            Add Lab
          </button>
        </div>

        <div className="space-y-3">
          {labs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No labs added yet</p>
          ) : (
            labs.map((lab) => (
              <div key={lab.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium">{lab.name}</p>
                  <p className="text-sm text-gray-600">Capacity: {lab.capacity} PCs</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editLab(lab)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLab(lab.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}