import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Layout } from '../components/Layout';
import { Search, UserCheck, Eye, X, Plus } from 'lucide-react';
import { supabase, Participant, Program, isSupabaseConfigured } from '../../lib/supabase';

export default function SearchParticipant() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state for new program
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    days: [] as string[],
    startTime: '',
    endTime: '',
    capacity: 20
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  useEffect(() => {
    fetchParticipants();
    fetchPrograms();
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return participants;
    
    const term = searchTerm.toLowerCase();
    return participants.filter(p => 
      p.first_name.toLowerCase().includes(term) ||
      p.last_name.toLowerCase().includes(term) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term))
    );
  }, [searchTerm, participants]);

  const handleAddToProgram = async () => {
    if (selectedParticipant && selectedProgram) {
      try {
        const { error } = await supabase
          .from('program_enrollments')
          .insert([
            {
              participant_id: selectedParticipant,
              program_id: selectedProgram
            }
          ]);

        if (error) throw error;

        console.log('Participant added to program successfully');
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/dashboard');
        }, 2000);
      } catch (err: any) {
        console.error('Error adding participant to program:', err);
        alert('Failed to add participant to program: ' + err.message);
      }
    }
  };

  const handleSaveProgram = async () => {
    if (!newProgram.name || !newProgram.startTime || !newProgram.endTime || newProgram.days.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('programs')
        .insert([
          {
            name: newProgram.name,
            description: newProgram.description,
            days: newProgram.days,
            start_time: newProgram.startTime,
            end_time: newProgram.endTime,
            capacity: newProgram.capacity
          }
        ])
        .select();

      if (error) throw error;

      console.log('Program added successfully:', data);
      setShowAddProgramModal(false);
      setNewProgram({
        name: '',
        description: '',
        days: [],
        startTime: '',
        endTime: '',
        capacity: 20
      });
      fetchPrograms(); // Refresh programs list
    } catch (err: any) {
      console.error('Error adding program:', err);
      alert('Failed to add program: ' + err.message);
    }
  };

  const toggleDay = (day: string) => {
    setNewProgram({
      ...newProgram,
      days: newProgram.days.includes(day)
        ? newProgram.days.filter(d => d !== day)
        : [...newProgram.days, day]
    });
  };

  const getParticipantPrograms = (participantId: string) => {
    // In future, fetch enrollments from program_enrollments table
    return 'N/A';
  };

  const isAddToProgramMode = action === 'add-to-program';

  return (
    <Layout title={isAddToProgramMode ? 'Add Participant to Program' : 'Find Participant'}>
      <div className="max-w-6xl mx-auto">
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-full mb-6">
                <UserCheck size={48} className="text-white" strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Success!
              </h3>
              <p className="text-xl text-gray-600 font-semibold">Participant added to program</p>
            </div>
          </div>
        )}

        {/* Add Program Modal */}
        {showAddProgramModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-10 max-w-2xl w-full text-center shadow-2xl">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Add New Program
              </h3>
              <form className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-lg font-bold text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                    className="w-full px-6 py-5 text-xl border-4 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white font-semibold"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-lg font-bold text-gray-700">Description</label>
                  <textarea
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                    className="w-full px-6 py-5 text-xl border-4 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white font-semibold"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-lg font-bold text-gray-700">Days</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <label key={day} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={newProgram.days.includes(day)}
                          onChange={() => toggleDay(day)}
                          className="w-5 h-5 text-purple-600 focus:ring-4 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="ml-2 text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-lg font-bold text-gray-700">Start Time</label>
                  <select
                    value={newProgram.startTime}
                    onChange={(e) => setNewProgram({ ...newProgram, startTime: e.target.value })}
                    className="w-full px-5 py-5 text-xl border-4 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white font-semibold"
                  >
                    <option value="">Select a time...</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-lg font-bold text-gray-700">End Time</label>
                  <select
                    value={newProgram.endTime}
                    onChange={(e) => setNewProgram({ ...newProgram, endTime: e.target.value })}
                    className="w-full px-5 py-5 text-xl border-4 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white font-semibold"
                  >
                    <option value="">Select a time...</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-lg font-bold text-gray-700">Capacity</label>
                  <input
                    type="number"
                    value={newProgram.capacity}
                    onChange={(e) => setNewProgram({ ...newProgram, capacity: parseInt(e.target.value) })}
                    className="w-full px-6 py-5 text-xl border-4 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddProgramModal(false)}
                  className="px-8 py-5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProgram}
                  className="px-8 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Add Program
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-4 border-orange-200">
          <div className="flex items-center gap-4 mb-6 bg-orange-50 p-5 rounded-xl">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Search size={32} className="text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Search for a Participant</h3>
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a name, email, or phone number..."
            className="w-full px-6 py-5 text-xl border-4 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500 focus:border-orange-500 outline-none font-semibold"
          />
        </div>

        {/* Add to Program Section */}
        {isAddToProgramMode && selectedParticipant && (
          <div className="bg-purple-50 border-4 border-purple-300 rounded-2xl p-8 mb-8 shadow-lg">
            <h4 className="text-2xl font-bold text-gray-900 mb-5">Select Program</h4>
            <div className="flex flex-col sm:flex-row gap-5">
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="flex-1 px-5 py-5 text-xl border-4 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white font-semibold"
              >
                <option value="">Choose a program...</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleAddToProgram}
                disabled={!selectedProgram}
                className="px-8 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
              >
                Add to Program
              </button>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  {isAddToProgramMode && <th className="px-6 py-5 text-left text-lg font-bold">Select</th>}
                  <th className="px-6 py-5 text-left text-lg font-bold">Name</th>
                  <th className="px-6 py-5 text-left text-lg font-bold">Email</th>
                  <th className="px-6 py-5 text-left text-lg font-bold">Phone</th>
                  <th className="px-6 py-5 text-left text-lg font-bold">Programs</th>
                  <th className="px-6 py-5 text-left text-lg font-bold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={isAddToProgramMode ? 6 : 5} className="px-6 py-16 text-center text-gray-500">
                      <p className="text-xl font-semibold">No participants found</p>
                      <p className="text-lg mt-2">Try a different search term</p>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant) => (
                    <tr 
                      key={participant.id}
                      className={`hover:bg-orange-50 transition-colors ${selectedParticipant === participant.id ? 'bg-purple-50 border-l-8 border-purple-600' : ''}`}
                    >
                      {isAddToProgramMode && (
                        <td className="px-6 py-5">
                          <input
                            type="radio"
                            name="participant"
                            checked={selectedParticipant === participant.id}
                            onChange={() => setSelectedParticipant(participant.id)}
                            className="w-7 h-7 text-purple-600 focus:ring-4 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-6 py-5">
                        <div className="text-lg font-bold text-gray-900">
                          {participant.first_name} {participant.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-base text-gray-700">
                        {participant.email}
                      </td>
                      <td className="px-6 py-5 text-base text-gray-700 font-semibold">
                        {participant.phone}
                      </td>
                      <td className="px-6 py-5 text-base text-gray-700">
                        {getParticipantPrograms(participant.id)}
                      </td>
                      <td className="px-6 py-5 text-base text-gray-700">
                        {participant.created_at ? new Date(participant.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-5 border-4 border-gray-400 text-gray-700 rounded-xl text-xl font-bold hover:bg-gray-100 transition-colors shadow-md"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </Layout>
  );
}