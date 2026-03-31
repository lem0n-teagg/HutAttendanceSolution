import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/Layout';
import { BarChart3, Users, Calendar, TrendingUp, Printer, Filter } from 'lucide-react';
import { supabase, Program, Participant, AttendanceRecord } from '../../lib/supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type TimeScale = 'weekly' | 'monthly' | 'annually';

interface ProgramEnrollment {
  name: string;
  count: number;
  programId?: string;
}

// SA Council Regions
const SA_COUNCIL_REGIONS = [
  'Adelaide City Council',
  'Adelaide Hills Council',
  'Alexandrina Council',
  'Barossa Council',
  'Barunga West Council',
  'Berri Barmera Council',
  'Campbelltown City Council',
  'Cedar Valley Council',
  'Charles Sturt City Council',
  'Clare and Gilbert Valleys Council',
  'Cleve District Council',
  'Coober Pedy District Council',
  'Coorong District Council',
  'Copper Coast Council',
  'Elliston District Council',
  'Flinders Ranges Council',
  'Franklin Harbour Council',
  'Gawler Town Council',
  'Goyder Regional Council',
  'Grant District Council',
  'Holdfast Bay City Council',
  'Kangaroo Island Council',
  'Karoonda East Murray Council',
  'Kimba District Council',
  'Kingston District Council',
  'Light Regional Council',
  'Lower Eyre Peninsula Council',
  'Loxton Waikerie Council',
  'Mallala District Council',
  'Marion City Council',
  'Mid Murray Council',
  'Mitcham City Council',
  'Mount Barker District Council',
  'Mount Gambier City Council',
  'Mount Remarkable District Council',
  'Murray Bridge Rural City Council',
  'Naracoorte Lucindale Council',
  'Northern Areas Council',
  'Norwood Payneham and St Peters City Council',
  'Onkaparinga City Council',
  'Orroroo Carrieton District Council',
  'Peterborough District Council',
  'Playford City Council',
  'Port Adelaide Enfield City Council',
  'Port Augusta City Council',
  'Port Lincoln City Council',
  'Port Pirie City and Districts Council',
  'Prospect City Council',
  'Renmark Paringa Council',
  'Robe District Council',
  'Roxby Downs Municipality',
  'Salisbury City Council',
  'Southern Mallee District Council',
  'Streaky Bay District Council',
  'Tatiara District Council',
  'Tea Tree Gully City Council',
  'The Coorong District Council',
  'Tumby Bay District Council',
  'Unley City Council',
  'Victor Harbor City Council',
  'Wakefield Regional Council',
  'Walkerville Town Council',
  'Wattle Range Council',
  'West Torrens City Council',
  'Whyalla City Council',
  'Wudinna District Council',
  'Yankalilla District Council',
  'Yorke Peninsula Council'
];

// Age range options
const AGE_RANGES = [
  { label: 'All Ages', value: 'all' },
  { label: '0-12 (Children)', value: '0-12' },
  { label: '13-17 (Teens)', value: '13-17' },
  { label: '18-24 (Young Adults)', value: '18-24' },
  { label: '25-54 (Adults)', value: '25-54' },
  { label: '55+ (Seniors)', value: '55+' }
];

export default function Reports() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [timeScale, setTimeScale] = useState<TimeScale>('monthly');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allProgramEnrollments, setAllProgramEnrollments] = useState<ProgramEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProgramEnrollments, setCurrentProgramEnrollments] = useState<ProgramEnrollment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  // Filter states
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | null): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if age is in range
  const isInAgeRange = (age: number, range: string): boolean => {
    if (range === 'all') return true;
    if (range === '0-12') return age >= 0 && age <= 12;
    if (range === '13-17') return age >= 13 && age <= 17;
    if (range === '18-24') return age >= 18 && age <= 24;
    if (range === '25-54') return age >= 25 && age <= 54;
    if (range === '55+') return age >= 55;
    return true;
  };

  // Filter participants based on selected filters
  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      // Age filter
      const age = calculateAge(participant.date_of_birth);
      if (!isInAgeRange(age, selectedAgeRange)) return false;

      // Region filter
      if (selectedRegion !== 'all' && participant.council_region !== selectedRegion) return false;

      return true;
    });
  }, [participants, selectedAgeRange, selectedRegion]);

  // Get participant IDs for program filtering
  const filteredParticipantIds = useMemo(() => {
    return new Set(filteredParticipants.map(p => p.id));
  }, [filteredParticipants]);

  // Update program enrollments when filters change
  useEffect(() => {
    const updateProgramEnrollments = async () => {
      if (selectedProgramFilter === 'all') {
        // Filter enrollments based on filtered participants
        const filteredEnrollments = await Promise.all(
          allProgramEnrollments.map(async (enrollment) => {
            if (!enrollment.programId) return enrollment;
            
            // Get participants for this program
            const { data } = await supabase
              .from('program_enrollments')
              .select('participant_id')
              .eq('program_id', enrollment.programId);
            
            const programParticipantIds = data?.map(e => e.participant_id) || [];
            
            // Count how many are in our filtered set
            const filteredCount = programParticipantIds.filter(id => 
              filteredParticipantIds.has(id)
            ).length;
            
            return { ...enrollment, count: filteredCount };
          })
        );
        setCurrentProgramEnrollments(filteredEnrollments);
      } else {
        // Single program selected
        const program = allProgramEnrollments.find(p => p.programId === selectedProgramFilter);
        if (!program) {
          setCurrentProgramEnrollments([]);
          return;
        }
        
        const { data } = await supabase
          .from('program_enrollments')
          .select('participant_id')
          .eq('program_id', selectedProgramFilter);
        
        const programParticipantIds = data?.map(e => e.participant_id) || [];
        const filteredCount = programParticipantIds.filter(id => 
          filteredParticipantIds.has(id)
        ).length;
        
        setCurrentProgramEnrollments([{ ...program, count: filteredCount }]);
      }
    };

    if (allProgramEnrollments.length > 0) {
      updateProgramEnrollments();
    }
  }, [allProgramEnrollments, selectedProgramFilter, filteredParticipantIds]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .order('name', { ascending: true });

      if (programsError) throw programsError;
      setPrograms(programsData || []);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*');

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      // Fetch enrollment counts for each program
      if (programsData && programsData.length > 0) {
        const enrollmentPromises = programsData.map(async (program) => {
          const { count, error } = await supabase
            .from('program_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id);

          if (error) console.error('Error fetching enrollment count:', error);
          return { name: program.name, count: count || 0, programId: program.id };
        });

        const enrollments = await Promise.all(enrollmentPromises);
        setAllProgramEnrollments(enrollments);
      }

      // Fetch attendance records with error handling
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*');

      if (attendanceError) {
        // Log the error but don't fail - attendance records might not exist yet
        console.error('Error fetching attendance records:', attendanceError);
        setAttendanceRecords([]);
      } else {
        setAttendanceRecords(attendanceData || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalParticipants = filteredParticipants.length;
  const totalPrograms = programs.length;

  // Get real attendance data based on time scale and filters
  const getAttendanceData = useMemo(() => {
    // Filter attendance records based on selected filters
    const filteredRecords = attendanceRecords.filter(record => {
      // Filter by program
      if (selectedProgramFilter !== 'all' && record.program_id !== selectedProgramFilter) {
        return false;
      }

      // Filter by participant (age and region)
      if (!filteredParticipantIds.has(record.participant_id)) {
        return false;
      }

      return true;
    });

    const today = new Date();
    const programCapacities = programs.reduce((acc, prog) => {
      acc[prog.id!] = prog.capacity || 30; // Default capacity of 30 if not specified
      return acc;
    }, {} as Record<string, number>);

    if (timeScale === 'weekly') {
      // Last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekData = Array(7).fill(null).map((_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - index));
        const dayName = days[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRecords = filteredRecords.filter(r => r.date === dateStr && r.status === 'present');
        const attendance = dayRecords.length;
        
        // Calculate capacity based on programs that had sessions that day
        const programIds = new Set(dayRecords.map(r => r.program_id));
        const capacity = Array.from(programIds).reduce((sum, pid) => sum + (programCapacities[pid] || 30), 0) || 60;
        
        return { period: dayName, attendance, capacity, id: `week-${index}` };
      });
      return weekData;
    } else if (timeScale === 'monthly') {
      // Last 4 weeks
      const weekData = Array(4).fill(null).map((_, weekIndex) => {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (3 - weekIndex) * 7 - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekRecords = filteredRecords.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= weekStart && recordDate <= weekEnd && r.status === 'present';
        });
        
        const attendance = weekRecords.length;
        const programIds = new Set(weekRecords.map(r => r.program_id));
        const avgDailyCapacity = Array.from(programIds).reduce((sum, pid) => sum + (programCapacities[pid] || 30), 0) || 60;
        const capacity = avgDailyCapacity * 5; // Assume 5 days per week
        
        return { period: `Week ${weekIndex + 1}`, attendance, capacity, id: `month-${weekIndex}` };
      });
      return weekData;
    } else {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthData = Array(12).fill(null).map((_, monthIndex) => {
        const month = (today.getMonth() - 11 + monthIndex + 12) % 12;
        const year = today.getFullYear() - (today.getMonth() - 11 + monthIndex < 0 ? 1 : 0);
        
        const monthRecords = filteredRecords.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate.getMonth() === month && recordDate.getFullYear() === year && r.status === 'present';
        });
        
        const attendance = monthRecords.length;
        const programIds = new Set(monthRecords.map(r => r.program_id));
        const avgDailyCapacity = Array.from(programIds).reduce((sum, pid) => sum + (programCapacities[pid] || 30), 0) || 60;
        const capacity = avgDailyCapacity * 20; // Assume ~20 days per month
        
        return { period: months[month], attendance, capacity, id: `year-${monthIndex}` };
      });
      return monthData;
    }
  }, [attendanceRecords, timeScale, selectedProgramFilter, filteredParticipantIds, programs]);

  // Program participation data for pie chart
  const programPieData = useMemo(() => {
    return currentProgramEnrollments.map((p, index) => ({
      name: p.name,
      value: p.count,
      id: p.programId || `program-${index}` // Add unique id
    }));
  }, [currentProgramEnrollments]);

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#14B8A6', '#EC4899'];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <Layout title="Reports & Analytics">
      <div className="max-w-6xl mx-auto">
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-4 border-purple-200 print:hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Filter size={32} className="text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Filter Reports</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Program Filter */}
            <div>
              <label htmlFor="program-filter" className="block text-lg font-bold text-gray-700 mb-3">
                Program
              </label>
              <select
                id="program-filter"
                value={selectedProgramFilter}
                onChange={(e) => setSelectedProgramFilter(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none font-semibold"
              >
                <option value="all">All Programs</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Range Filter */}
            <div>
              <label htmlFor="age-filter" className="block text-lg font-bold text-gray-700 mb-3">
                Age Range
              </label>
              <select
                id="age-filter"
                value={selectedAgeRange}
                onChange={(e) => setSelectedAgeRange(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none font-semibold"
              >
                {AGE_RANGES.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Council Region Filter */}
            <div>
              <label htmlFor="region-filter" className="block text-lg font-bold text-gray-700 mb-3">
                Council Region
              </label>
              <select
                id="region-filter"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none font-semibold"
              >
                <option value="all">All Regions</option>
                {SA_COUNCIL_REGIONS.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedProgramFilter !== 'all' || selectedAgeRange !== 'all' || selectedRegion !== 'all') && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-bold text-gray-900">Active Filters:</span>
                {selectedProgramFilter !== 'all' && (
                  <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-base font-semibold">
                    Program: {programs.find(p => p.id === selectedProgramFilter)?.name}
                  </span>
                )}
                {selectedAgeRange !== 'all' && (
                  <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-base font-semibold">
                    Age: {AGE_RANGES.find(r => r.value === selectedAgeRange)?.label}
                  </span>
                )}
                {selectedRegion !== 'all' && (
                  <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-base font-semibold">
                    Region: {selectedRegion}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedProgramFilter('all');
                    setSelectedAgeRange('all');
                    setSelectedRegion('all');
                  }}
                  className="ml-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-base font-semibold transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Time Scale & Print Button */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-4 border-teal-200 print:hidden">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Time Scale Selection */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Time Scale</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTimeScale('weekly')}
                  className={`px-6 py-3 rounded-xl text-lg font-bold transition-all transform hover:scale-105 ${
                    timeScale === 'weekly'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeScale('monthly')}
                  className={`px-6 py-3 rounded-xl text-lg font-bold transition-all transform hover:scale-105 ${
                    timeScale === 'monthly'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeScale('annually')}
                  className={`px-6 py-3 rounded-xl text-lg font-bold transition-all transform hover:scale-105 ${
                    timeScale === 'annually'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Annually
                </button>
              </div>
            </div>

            {/* Print Button */}
            <div>
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Printer size={24} />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-4 border-teal-200 print:border-2">
          <div className="flex items-center gap-4 mb-6 bg-teal-50 p-5 rounded-xl print:bg-white">
            <div className="p-3 bg-teal-600 rounded-lg print:hidden">
              <BarChart3 size={32} className="text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Select Report Type</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
            <button
              onClick={() => setSelectedReport('overview')}
              className={`p-6 rounded-xl border-4 transition-all transform hover:scale-105 ${
                selectedReport === 'overview'
                  ? 'border-teal-600 bg-teal-50 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <div className="text-xl font-bold text-gray-900 mb-2">Overview</div>
              <div className="text-base text-gray-600 font-semibold">General statistics</div>
            </button>

            <button
              onClick={() => setSelectedReport('programs')}
              className={`p-6 rounded-xl border-4 transition-all transform hover:scale-105 ${
                selectedReport === 'programs'
                  ? 'border-teal-600 bg-teal-50 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <div className="text-xl font-bold text-gray-900 mb-2">Programs</div>
              <div className="text-base text-gray-600 font-semibold">Program enrollment</div>
            </button>

            <button
              onClick={() => setSelectedReport('attendance')}
              className={`p-6 rounded-xl border-4 transition-all transform hover:scale-105 ${
                selectedReport === 'attendance'
                  ? 'border-teal-600 bg-teal-50 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <div className="text-xl font-bold text-gray-900 mb-2">Attendance</div>
              <div className="text-base text-gray-600 font-semibold">Attendance trends</div>
            </button>
          </div>
        </div>

        {/* Overview Report */}
        {selectedReport === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform print:transform-none">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-white/20 rounded-xl">
                    <Users size={40} className="text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold mb-1">Total Participants</div>
                    <div className="text-5xl font-bold">{totalParticipants}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform print:transform-none">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-white/20 rounded-xl">
                    <Calendar size={40} className="text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold mb-1">Active Programs</div>
                    <div className="text-5xl font-bold">{totalPrograms}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform print:transform-none">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-white/20 rounded-xl">
                    <TrendingUp size={40} className="text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold mb-1">Avg. Enrollment</div>
                    <div className="text-5xl font-bold">
                      {totalPrograms > 0 ? Math.round((allProgramEnrollments.reduce((sum, p) => sum + p.count, 0) / totalPrograms) * 10) / 10 : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Trend Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gray-200 print:border-2">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 bg-blue-50 p-4 rounded-xl print:bg-white">
                Attendance Trend ({timeScale.charAt(0).toUpperCase() + timeScale.slice(1)})
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                  <YAxis tick={{ fontSize: 14, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #3B82F6',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '16px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={4} name="Attendance" />
                  <Line type="monotone" dataKey="capacity" stroke="#10B981" strokeWidth={4} name="Capacity" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gray-200 print:border-2">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 bg-gray-50 p-4 rounded-xl print:bg-white">Recent Registrations</h4>
              <div className="space-y-4">
                {participants.length > 0 ? (
                  participants
                    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                    .slice(0, 5)
                    .map(participant => (
                      <div key={participant.id} className="flex items-center justify-between p-5 bg-blue-50 rounded-xl border-2 border-blue-200 hover:bg-blue-100 transition-colors print:bg-white">
                        <div>
                          <div className="text-xl font-bold text-gray-900">
                            {participant.first_name} {participant.last_name}
                          </div>
                          <div className="text-base text-gray-600 mt-1">{participant.email}</div>
                        </div>
                        <div className="text-base font-bold text-gray-700 bg-white px-4 py-2 rounded-lg">
                          {participant.created_at ? new Date(participant.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-xl font-semibold">No participants registered yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Programs Report */}
        {selectedReport === 'programs' && (
          <div className="space-y-8">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gray-200 print:border-2">
              <h4 className="text-2xl font-bold text-gray-900 mb-8 bg-teal-50 p-5 rounded-xl print:bg-white">
                Program Enrollment Chart
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={currentProgramEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} angle={-15} textAnchor="end" height={100} />
                  <YAxis tick={{ fontSize: 14, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #14B8A6',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '16px', fontWeight: 'bold' }} />
                  <Bar dataKey="count" fill="#14B8A6" name="Participants" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gray-200 print:border-2">
              <h4 className="text-2xl font-bold text-gray-900 mb-8 bg-teal-50 p-5 rounded-xl print:bg-white">
                Program Distribution
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={programPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {programPieData.map((entry, index) => (
                      <Cell key={entry.id || `cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #8B5CF6',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed List */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gray-200 print:border-2">
              <h4 className="text-2xl font-bold text-gray-900 mb-8 bg-teal-50 p-5 rounded-xl print:bg-white">Detailed Enrollment</h4>
              <div className="space-y-6">
                {currentProgramEnrollments.map((program) => (
                  <div key={program.programId || program.name} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 print:bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-gray-900">{program.name}</span>
                      <span className="text-lg font-bold text-white bg-teal-600 px-5 py-2 rounded-full">
                        {program.count} participant{program.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-teal-600 h-6 rounded-full transition-all shadow-inner"
                        style={{ width: `${totalParticipants > 0 ? (program.count / totalParticipants) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attendance Report */}
        {selectedReport === 'attendance' && (
          <div className="space-y-8">
            {/* Attendance Bar Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gray-200 print:border-2">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 bg-teal-50 p-5 rounded-xl print:bg-white">
                Attendance vs Capacity ({timeScale.charAt(0).toUpperCase() + timeScale.slice(1)})
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                  <YAxis tick={{ fontSize: 14, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #3B82F6',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '16px', fontWeight: 'bold' }} />
                  <Bar dataKey="attendance" fill="#3B82F6" name="Attendance" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="capacity" fill="#10B981" name="Capacity" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Attendance Rate Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gray-200 print:border-2">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 bg-blue-50 p-5 rounded-xl print:bg-white">
                Attendance Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-6 rounded-xl shadow-lg">
                  <div className="text-lg font-semibold mb-2">Average Attendance</div>
                  <div className="text-4xl font-bold">
                    {getAttendanceData.length > 0 ? Math.round(getAttendanceData.reduce((sum, d) => sum + d.attendance, 0) / getAttendanceData.length) : 0}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-500 text-white p-6 rounded-xl shadow-lg">
                  <div className="text-lg font-semibold mb-2">Attendance Rate</div>
                  <div className="text-4xl font-bold">
                    {getAttendanceData.reduce((sum, d) => sum + d.capacity, 0) > 0 
                      ? Math.round((getAttendanceData.reduce((sum, d) => sum + d.attendance, 0) / 
                         getAttendanceData.reduce((sum, d) => sum + d.capacity, 0)) * 100)
                      : 0}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-500 text-white p-6 rounded-xl shadow-lg">
                  <div className="text-lg font-semibold mb-2">Total Sessions</div>
                  <div className="text-4xl font-bold">{getAttendanceData.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 print:hidden">
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