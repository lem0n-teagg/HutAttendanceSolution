import { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { ChevronDown, FileText, Download } from 'lucide-react';
import { supabase, Program, Participant, AttendanceRecord } from '../../lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import logoImage from 'figma:asset/cae61de7ca39293178c81999f6b640ef288b576e.png';

type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

// Adelaide Hills townships
const ADELAIDE_HILLS_TOWNSHIPS = [
  'Aldgate', 'Ashton', 'Basket Range', 'Birdwood', 'Bridgewater', 'Brukunga',
  'Carey Gully', 'Charleston', 'Cherryville', 'Crafers', 'Cudlee Creek',
  'Echunga', 'Forreston', 'Gumeracha', 'Hahndorf', 'Heathfield', 'Ironbank',
  'Kersbrook', 'Lenswood', 'Littlehampton', 'Lobethal', 'Macclesfield',
  'Meadows', 'Mount Barker', 'Mount Torrens', 'Mylor', 'Nairne', 'Norton Summit',
  'Oakbank', 'Paracombe', 'Piccadilly', 'Stirling', 'Strathalbyn', 'Summertown',
  'Uraidla', 'Verdun', 'Wistow', 'Woodside'
];

const PROGRAM_CATEGORIES = [
  'Healthy Living',
  'Interest & Social',
  'Low Income Support',
  'Young People',
  'Sustainability'
];

const AGE_GROUPS = ['under 18', '18-24', '25-44', '45-64', '65+'];
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Other'];
const ATSI_OPTIONS = ['Yes', 'No'];
const CALD_OPTIONS = ['Yes', 'No'];
const COUNCILS = ['Adelaide Hills Council', 'Other Council'];

export default function Reports() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedProgramCategory, setSelectedProgramCategory] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedATSI, setSelectedATSI] = useState<string>('all');
  const [selectedCALD, setSelectedCALD] = useState<string>('all');
  const [selectedCouncil, setSelectedCouncil] = useState<string>('all');
  const [selectedTownship, setSelectedTownship] = useState<string>('all');
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Available options based on actual database data
  const [availableCategories, setAvailableCategories] = useState<Set<string>>(new Set());
  const [availablePrograms, setAvailablePrograms] = useState<Set<string>>(new Set());
  const [availableAgeGroups, setAvailableAgeGroups] = useState<Set<string>>(new Set());
  const [availableGenders, setAvailableGenders] = useState<Set<string>>(new Set());
  const [availableATSI, setAvailableATSI] = useState<Set<string>>(new Set());
  const [availableCALD, setAvailableCALD] = useState<Set<string>>(new Set());
  const [availableCouncils, setAvailableCouncils] = useState<Set<string>>(new Set());
  const [availableTownships, setAvailableTownships] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    setEndDate(end);
    calculateStartDate(end, timePeriod);
    fetchData();
  }, []);

  useEffect(() => {
    if (endDate) {
      calculateStartDate(endDate, timePeriod);
    }
  }, [timePeriod, endDate]);

  const calculateStartDate = (end: string, period: TimePeriod) => {
    if (period === 'custom') return;
    
    const endDateObj = new Date(end);
    let startDateObj = new Date(endDateObj);
    
    switch (period) {
      case 'weekly':
        startDateObj.setDate(endDateObj.getDate() - 7);
        break;
      case 'monthly':
        startDateObj.setMonth(endDateObj.getMonth() - 1);
        break;
      case 'quarterly':
        startDateObj.setMonth(endDateObj.getMonth() - 3);
        break;
      case 'annually':
        startDateObj.setFullYear(endDateObj.getFullYear() - 1);
        break;
    }
    
    setStartDate(startDateObj.toISOString().split('T')[0]);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch programs
      const { data: programsData } = await supabase
        .from('programs')
        .select('*');
      setPrograms(programsData || []);
      
      // Extract available programs (assume all programs exist for now)
      const programNames = new Set((programsData || []).map(p => p.name));
      setAvailablePrograms(programNames);
      
      // Fetch participants
      const { data: participantsData } = await supabase
        .from('participants')
        .select('*');
      setParticipants(participantsData || []);
      
      // Extract available values from participants
      if (participantsData) {
        const genders = new Set(participantsData.map(p => p.gender).filter(Boolean));
        setAvailableGenders(genders);
        
        const councils = new Set(participantsData.map(p => p.council_region).filter(Boolean));
        setAvailableCouncils(councils);
        
        const townships = new Set(participantsData.map(p => p.township).filter(Boolean));
        setAvailableTownships(townships);
        
        // Calculate age groups
        const ageGroups = new Set<string>();
        participantsData.forEach(p => {
          if (p.date_of_birth) {
            const age = calculateAge(p.date_of_birth);
            const ageGroup = getAgeGroup(age);
            if (ageGroup) ageGroups.add(ageGroup);
          }
        });
        setAvailableAgeGroups(ageGroups);
      }
      
      // Fetch attendance records
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('*');
      setAttendanceRecords(attendanceData || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAgeGroup = (age: number): string => {
    if (age < 18) return 'under 18';
    if (age >= 18 && age <= 24) return '18-24';
    if (age >= 25 && age <= 44) return '25-44';
    if (age >= 45 && age <= 64) return '45-64';
    return '65+';
  };

  // Filter participants based on selected criteria
  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      // Age group filter
      if (selectedAgeGroup !== 'all' && participant.date_of_birth) {
        const age = calculateAge(participant.date_of_birth);
        const ageGroup = getAgeGroup(age);
        if (ageGroup !== selectedAgeGroup) return false;
      }
      
      // Gender filter
      if (selectedGender !== 'all' && participant.gender !== selectedGender) return false;
      
      // ATSI filter
      if (selectedATSI !== 'all') {
        const atsiStatus = participant.identify_aboriginal_tsi === 'Yes' || 
                          participant.identify_aboriginal_tsi === 'Aboriginal' || 
                          participant.identify_aboriginal_tsi === 'Torres Strait Islander' ||
                          participant.identify_aboriginal_tsi === 'Both' ? 'Yes' : 'No';
        if (atsiStatus !== selectedATSI) return false;
      }
      
      // CALD filter (determined by speaking other language or country of birth)
      if (selectedCALD !== 'all') {
        const isCALD = participant.speak_other_language === 'Yes' || 
                      (participant.country_of_birth && 
                       participant.country_of_birth !== 'Australia' && 
                       participant.country_of_birth !== '');
        const caldStatus = isCALD ? 'Yes' : 'No';
        if (caldStatus !== selectedCALD) return false;
      }
      
      // Council filter
      if (selectedCouncil !== 'all' && participant.council_region !== selectedCouncil) return false;
      
      // Township filter
      if (selectedTownship !== 'all' && participant.township !== selectedTownship) return false;
      
      return true;
    });
  }, [participants, selectedAgeGroup, selectedGender, selectedATSI, selectedCALD, selectedCouncil, selectedTownship]);

  // Filter attendance records based on filters
  const filteredAttendance = useMemo(() => {
    const participantIds = new Set(filteredParticipants.map(p => p.id));
    
    return attendanceRecords.filter(record => {
      // Date range filter
      if (startDate && record.date < startDate) return false;
      if (endDate && record.date > endDate) return false;
      
      // Participant filter
      if (!participantIds.has(record.participant_id)) return false;
      
      // Program filter
      if (selectedProgram !== 'all' && record.program_id !== selectedProgram) return false;
      
      return true;
    });
  }, [attendanceRecords, filteredParticipants, startDate, endDate, selectedProgram]);

  // Calculate report metrics
  const reportMetrics = useMemo(() => {
    const uniqueParticipants = new Set(filteredAttendance.map(r => r.participant_id)).size;
    const totalAttendances = filteredAttendance.filter(r => r.status === 'present').length;
    const totalRecords = filteredAttendance.length;
    const attendanceRate = totalRecords > 0 ? ((totalAttendances / totalRecords) * 100).toFixed(1) : '0.0';
    
    return { uniqueParticipants, totalAttendances, totalRecords, attendanceRate };
  }, [filteredAttendance]);

  // Age distribution data
  const ageDistributionData = useMemo(() => {
    const ageCounts: Record<string, number> = {};
    AGE_GROUPS.forEach(group => ageCounts[group] = 0);
    
    filteredParticipants.forEach(p => {
      if (p.date_of_birth) {
        const age = calculateAge(p.date_of_birth);
        const ageGroup = getAgeGroup(age);
        ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + 1;
      }
    });
    
    return Object.entries(ageCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [filteredParticipants]);

  // Gender distribution data
  const genderDistributionData = useMemo(() => {
    const genderCounts: Record<string, number> = {};
    
    filteredParticipants.forEach(p => {
      if (p.gender) {
        genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
      }
    });
    
    return Object.entries(genderCounts)
      .map(([name, value]) => ({ name, value }));
  }, [filteredParticipants]);

  // Program table data
  const programTableData = useMemo(() => {
    const programStats: Record<string, {
      name: string;
      category: string;
      uniqueParticipants: Set<string>;
      attendances: number;
      totalRecords: number;
    }> = {};
    
    filteredAttendance.forEach(record => {
      const program = programs.find(p => p.id === record.program_id);
      if (!program) return;
      
      if (!programStats[program.id!]) {
        programStats[program.id!] = {
          name: program.name,
          category: 'General', // Default category since not in schema
          uniqueParticipants: new Set(),
          attendances: 0,
          totalRecords: 0
        };
      }
      
      programStats[program.id!].uniqueParticipants.add(record.participant_id);
      programStats[program.id!].totalRecords++;
      if (record.status === 'present') {
        programStats[program.id!].attendances++;
      }
    });
    
    return Object.values(programStats).map(stat => ({
      name: stat.name,
      category: stat.category,
      uniqueParticipants: stat.uniqueParticipants.size,
      attendances: stat.attendances,
      attendanceRate: stat.totalRecords > 0 
        ? ((stat.attendances / stat.totalRecords) * 100).toFixed(1) + '%'
        : '0.0%'
    }));
  }, [filteredAttendance, programs]);

  const handlePreviewReport = () => {
    setShowReport(true);
  };

  const handleExportPDF = () => {
    window.print();
    setExportMenuOpen(false);
  };

  const handleExportCSV = () => {
    // Generate CSV from program table data
    const headers = ['Program', 'Category', 'Unique Participants', 'Attendances', 'Attendance Rate'];
    const rows = programTableData.map(row => [
      row.name,
      row.category,
      row.uniqueParticipants.toString(),
      row.attendances.toString(),
      row.attendanceRate
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${startDate}-to-${endDate}.csv`;
    a.click();
    setExportMenuOpen(false);
  };

  const getReportSubtitle = () => {
    const periodText = timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1);
    const categoryText = selectedProgramCategory === 'all' ? 'All program categories' : selectedProgramCategory;
    const programText = selectedProgram === 'all' ? 'All programs' : programs.find(p => p.id === selectedProgram)?.name || 'All programs';
    
    return `${periodText} Report – ${categoryText} – ${programText}`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">View Reports</h1>
        </div>

        {/* Report Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-4 border-purple-200 print:hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Filters</h2>
          
          {/* Time Period Controls */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {(['weekly', 'monthly', 'quarterly', 'annually', 'custom'] as TimePeriod[]).map(period => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    timePeriod === period
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {period === 'custom' ? 'Custom Range' : period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Form */}
          <div className="space-y-6">
            {/* Line 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="start-date" className="block text-base font-bold text-gray-700 mb-2">
                  Start date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={timePeriod !== 'custom'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-base font-bold text-gray-700 mb-2">
                  End date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label htmlFor="program-category" className="block text-base font-bold text-gray-700 mb-2">
                  Program category
                </label>
                <select
                  id="program-category"
                  value={selectedProgramCategory}
                  onChange={(e) => setSelectedProgramCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All program categories</option>
                  {PROGRAM_CATEGORIES.map(category => {
                    const isAvailable = availableCategories.has(category);
                    return (
                      <option 
                        key={category} 
                        value={category}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-gray-400' : ''}
                      >
                        {category}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label htmlFor="program" className="block text-base font-bold text-gray-700 mb-2">
                  Program
                </label>
                <select
                  id="program"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All programs</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line 2 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="age-group" className="block text-base font-bold text-gray-700 mb-2">
                  Age group
                </label>
                <select
                  id="age-group"
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All age groups</option>
                  {AGE_GROUPS.map(group => {
                    const isAvailable = availableAgeGroups.has(group);
                    return (
                      <option 
                        key={group} 
                        value={group}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-gray-400' : ''}
                      >
                        {group}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-base font-bold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All genders</option>
                  {GENDERS.map(gender => {
                    const isAvailable = availableGenders.has(gender);
                    return (
                      <option 
                        key={gender} 
                        value={gender}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-gray-400' : ''}
                      >
                        {gender}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label htmlFor="atsi-status" className="block text-base font-bold text-gray-700 mb-2">
                  ATSI status
                </label>
                <select
                  id="atsi-status"
                  value={selectedATSI}
                  onChange={(e) => setSelectedATSI(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All ATSI statuses</option>
                  {ATSI_OPTIONS.map(option => {
                    const isAvailable = availableATSI.has(option);
                    return (
                      <option 
                        key={option} 
                        value={option}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-gray-400' : ''}
                      >
                        {option}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label htmlFor="cald-background" className="block text-base font-bold text-gray-700 mb-2">
                  CALD background
                </label>
                <select
                  id="cald-background"
                  value={selectedCALD}
                  onChange={(e) => setSelectedCALD(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All CALD backgrounds</option>
                  {CALD_OPTIONS.map(option => {
                    const isAvailable = availableCALD.has(option);
                    return (
                      <option 
                        key={option} 
                        value={option}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-gray-400' : ''}
                      >
                        {option}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Line 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="council" className="block text-base font-bold text-gray-700 mb-2">
                  Council
                </label>
                <select
                  id="council"
                  value={selectedCouncil}
                  onChange={(e) => setSelectedCouncil(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All councils</option>
                  {COUNCILS.map(council => {
                    const isAvailable = availableCouncils.has(council);
                    return (
                      <option 
                        key={council} 
                        value={council}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-gray-400' : ''}
                      >
                        {council}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label htmlFor="township" className="block text-base font-bold text-gray-700 mb-2">
                  Township
                </label>
                <select
                  id="township"
                  value={selectedTownship}
                  onChange={(e) => setSelectedTownship(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All townships</option>
                  {ADELAIDE_HILLS_TOWNSHIPS.map(township => {
                    const isAvailable = availableTownships.has(township);
                    return (
                      <option 
                        key={township} 
                        value={township}
                        disabled={!isAvailable}
                        className={!isAvailable ? 'text-gray-400' : ''}
                      >
                        {township}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePreviewReport}
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FileText size={20} />
              Preview Report
            </button>
            
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="px-8 py-4 bg-teal-500 text-white rounded-lg font-bold text-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <Download size={20} />
                Export Report
                <ChevronDown size={20} />
              </button>
              
              {exportMenuOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10 min-w-[200px]">
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-6 py-3 text-left hover:bg-gray-50 font-semibold border-b border-gray-200"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-6 py-3 text-left hover:bg-gray-50 font-semibold"
                  >
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Preview */}
        {showReport && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-4 border-gray-200 print:border-0 print:shadow-none">
            {/* Report Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <div className="flex items-start gap-4">
                <img src={logoImage} alt="The Hut Logo" className="h-16 object-contain" />
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">The Hut Community Centre</h2>
                  <p className="text-lg text-gray-600">{getReportSubtitle()}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p><strong>From:</strong> {startDate}</p>
                <p><strong>To:</strong> {endDate}</p>
                <p><strong>Generated:</strong> {new Date().toLocaleDateString('en-AU', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="text-sm font-bold text-blue-800 mb-2">Unique Participants</div>
                <div className="text-4xl font-bold text-blue-900">{reportMetrics.uniqueParticipants}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="text-sm font-bold text-green-800 mb-2">Total Attendances</div>
                <div className="text-4xl font-bold text-green-900">{reportMetrics.totalAttendances}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-sm font-bold text-purple-800 mb-2">Total Records</div>
                <div className="text-4xl font-bold text-purple-900">{reportMetrics.totalRecords}</div>
              </div>
              <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-200">
                <div className="text-sm font-bold text-teal-800 mb-2">Attendance Rate</div>
                <div className="text-4xl font-bold text-teal-900">{reportMetrics.attendanceRate}%</div>
              </div>
            </div>

            {/* Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Age Distribution */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Age Distribution</h3>
                {ageDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ageDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ageDistributionData.map((entry, index) => (
                          <Cell key={`age-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>

              {/* Gender Distribution */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gender Distribution</h3>
                {genderDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genderDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderDistributionData.map((entry, index) => (
                          <Cell key={`gender-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Program Table */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Program Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Program</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Category</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">Unique Participants</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">Attendances</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programTableData.length > 0 ? (
                      programTableData.map((row, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="py-3 px-4">{row.name}</td>
                          <td className="py-3 px-4">{row.category}</td>
                          <td className="py-3 px-4 text-center">{row.uniqueParticipants}</td>
                          <td className="py-3 px-4 text-center">{row.attendances}</td>
                          <td className="py-3 px-4 text-center">{row.attendanceRate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No program data available for the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}