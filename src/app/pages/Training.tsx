import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck, UserPlus, Users, Search, BarChart3,
  Calendar, GraduationCap, Shield, BookOpen, X, ChevronRight, ChevronLeft, ChevronDown
} from 'lucide-react';
import logoImage from 'figma:asset/cae61de7ca39293178c81999f6b640ef288b576e.png';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: typeof ClipboardCheck;
  color: string;
  bgColor: string;
  route: string;
  steps: TrainingStep[];
  roles: string[];
}

interface TrainingStep {
  stepNumber: number;
  title: string;
  description: string;
  highlightSelector: string;
}

export default function Training() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const trainingModules: TrainingModule[] = [
    {
      id: 'attendance',
      title: 'Mark Attendance',
      description: 'Learn how to mark participant attendance for programs',
      icon: ClipboardCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      route: '/attendance',
      roles: ['Program Coordinator', 'Manager/Administrator'],
      steps: [
        {
          stepNumber: 1,
          title: 'Select a program',
          description: 'Start by choosing which program you want to mark attendance for. Use the dropdown menu to see all available programs.',
          highlightSelector: 'program-select'
        },
        {
          stepNumber: 2,
          title: 'Choose the date',
          description: 'Select the date for which you want to mark attendance. The system defaults to today\'s date.',
          highlightSelector: 'date-picker'
        },
        {
          stepNumber: 3,
          title: 'Mark participants',
          description: 'Check the boxes next to participant names to mark them as present. Unchecked boxes indicate absence.',
          highlightSelector: 'participant-list'
        },
        {
          stepNumber: 4,
          title: 'Save attendance',
          description: 'Click the "Save Attendance" button to record your selections. The data will be immediately saved to the system.',
          highlightSelector: 'save-button'
        }
      ]
    },
    {
      id: 'add-participant',
      title: 'Add New Participant',
      description: 'Register new community members in the system',
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      route: '/add-participant-multistep',
      roles: ['Program Coordinator', 'Data Entry', 'Manager/Administrator'],
      steps: [
        {
          stepNumber: 1,
          title: 'Input Basic Participant Information',
          description: 'Enter basic information of new participants, these information can be reused across multiple programs.',
          highlightSelector: 'general-info'
        },
        {
          stepNumber: 2,
          title: 'Tick Participant Consent',
          description: 'Remember asking participants to double-check their information and fully understand their rights and responsibilities before tick the consent boxes.',
          highlightSelector: 'consent-area'
        },
        {
          stepNumber: 3,
          title: 'Select Programs',
          description: 'After entering basic information, participants express their interests in The Hut\'s programs.',
          highlightSelector: 'program-selection'
        },
        {
          stepNumber: 4,
          title: 'Program Details',
          description: 'After selecting programs that participants are interested in, they will need to enter further required information for the specific program. When every fields are filled, the process ends with submission.',
          highlightSelector: 'program-details'
        }
      ]
    },
    {
      id: 'add-to-program',
      title: 'Add to Program',
      description: 'Enroll existing participants in programs',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      route: '/search',
      roles: ['Program Coordinator', 'Data Entry', 'Manager/Administrator'],
      steps: [
        {
          stepNumber: 1,
          title: 'Search for participant',
          description: 'Use the search bar to find the participant by name, email, or phone number.',
          highlightSelector: 'search-bar'
        },
        {
          stepNumber: 2,
          title: 'View participant details',
          description: 'Click on the participant from the search results to view their full profile.',
          highlightSelector: 'participant-card'
        },
        {
          stepNumber: 3,
          title: 'Select programs',
          description: 'In the participant\'s profile, check the boxes next to the programs you want to enroll them in.',
          highlightSelector: 'program-enrollment'
        },
        {
          stepNumber: 4,
          title: 'Save enrollment',
          description: 'Click "Save" to confirm the participant\'s enrollment in the selected programs.',
          highlightSelector: 'save-enrollment'
        }
      ]
    },
    {
      id: 'find-participant',
      title: 'Find Participant',
      description: 'Search and view participant information',
      icon: Search,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      route: '/search',
      roles: ['Program Coordinator', 'Data Entry', 'Manager/Administrator'],
      steps: [
        {
          stepNumber: 1,
          title: 'Use search filters',
          description: 'Enter search terms in the search bar. You can search by name, email, phone, or any other detail.',
          highlightSelector: 'search-filters'
        },
        {
          stepNumber: 2,
          title: 'Browse results',
          description: 'Scroll through the list of matching participants. Each card shows key information like name and contact details.',
          highlightSelector: 'results-list'
        },
        {
          stepNumber: 3,
          title: 'View full details',
          description: 'Click on a participant card to view their complete profile including programs, attendance history, and notes.',
          highlightSelector: 'detail-view'
        },
        {
          stepNumber: 4,
          title: 'Export or edit',
          description: 'Use the action buttons to edit participant details or export their information.',
          highlightSelector: 'action-buttons'
        }
      ]
    },
    {
      id: 'reports',
      title: 'View Reports',
      description: 'Generate and analyze attendance reports',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      route: '/reports',
      roles: ['Manager/Administrator'],
      steps: [
        {
          stepNumber: 1,
          title: 'Choose a reporting period',
          description: 'Start by choosing a reporting period. Use Weekly, Monthly, Quarterly, Annually, or Custom Range, then confirm the Start date and End date that define the report scope.',
          highlightSelector: 'time-period'
        },
        {
          stepNumber: 2,
          title: 'Choose the program filters',
          description: 'Use Program category and Program to narrow the report to the relevant activities before reviewing the results.',
          highlightSelector: 'program-filters'
        },
        {
          stepNumber: 3,
          title: 'Choose participant filters',
          description: 'Use Age group, Gender, ATSI status, CALD background, Council, and Township to focus the report on the participant group you need.',
          highlightSelector: 'participant-filters'
        },
        {
          stepNumber: 4,
          title: 'Preview the report',
          description: 'Use Preview Report to generate the report on the page, then review the summary cards, charts, and report table shown below.',
          highlightSelector: 'preview-section'
        },
        {
          stepNumber: 5,
          title: 'Export the report',
          description: 'When the preview looks correct, use Export Report and choose either CSV or PDF depending on the format you need.',
          highlightSelector: 'export-section'
        }
      ]
    },
    {
      id: 'programs',
      title: 'Manage Programs',
      description: 'Create and manage community programs',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      route: '/programs',
      roles: ['Manager/Administrator'],
      steps: [
        {
          stepNumber: 1,
          title: 'View all programs',
          description: 'See the complete list of programs with their schedules, capacity, and enrollment numbers.',
          highlightSelector: 'programs-list'
        },
        {
          stepNumber: 2,
          title: 'Create new program',
          description: 'Click "Create New Program" to add a new program. Fill in name, description, schedule, and capacity.',
          highlightSelector: 'create-button'
        },
        {
          stepNumber: 3,
          title: 'Edit program details',
          description: 'Click the edit icon on any program to update its details, schedule, or assigned staff.',
          highlightSelector: 'edit-program'
        },
        {
          stepNumber: 4,
          title: 'Manage staff assignments',
          description: 'Assign staff members to programs so they can mark attendance for those specific programs.',
          highlightSelector: 'staff-assignments'
        }
      ]
    },
    {
      id: 'approvals',
      title: 'User Approvals',
      description: 'Approve new staff member registrations',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      route: '/approvals',
      roles: ['Manager/Administrator'],
      steps: [
        {
          stepNumber: 1,
          title: 'View pending users',
          description: 'See a list of staff members who have registered but are awaiting admin approval.',
          highlightSelector: 'pending-users'
        },
        {
          stepNumber: 2,
          title: 'Review user details',
          description: 'Check each pending user\'s email, name, and requested role to verify their identity.',
          highlightSelector: 'user-details'
        },
        {
          stepNumber: 3,
          title: 'Approve or reject',
          description: 'Click "Approve" to grant access or "Reject" to deny the registration request.',
          highlightSelector: 'approval-buttons'
        },
        {
          stepNumber: 4,
          title: 'Manage existing users',
          description: 'View approved users and update their roles or access levels as needed.',
          highlightSelector: 'user-management'
        }
      ]
    },
    {
      id: 'basics',
      title: 'Staff Portal Basics',
      description: 'Learn the fundamentals of using the staff portal',
      icon: BookOpen,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      route: '/dashboard',
      roles: ['Program Coordinator', 'Data Entry', 'Manager/Administrator'],
      steps: [
        {
          stepNumber: 1,
          title: 'Click the logo to return home',
          description: 'When a staff member is logged in, clicking the The Hut logo returns to the Dashboard. When no one is logged in, the same logo returns to the The Hut Community Staff Portal home page.',
          highlightSelector: 'logo'
        },
        {
          stepNumber: 2,
          title: 'Use Logout to end the session',
          description: 'Click Logout to sign out of the staff portal and return to the The Hut Community Staff Portal home page.',
          highlightSelector: 'logout-button'
        },
        {
          stepNumber: 3,
          title: 'Use the left sidebar to move around',
          description: 'Use the left sidebar to move between the main staff functions. The highlighted item shows that you are currently on the training page.',
          highlightSelector: 'sidebar'
        },
        {
          stepNumber: 4,
          title: 'Each dashboard card opens a staff function',
          description: 'The eight cards on the Dashboard take staff to Mark Attendance, Add New Participant, Add to Program, Find Participant, View Reports, Manage Programs, Staff Training, User Approvals pages.',
          highlightSelector: 'dashboard-cards'
        }
      ]
    }
  ];

  const startWalkthrough = (module: TrainingModule) => {
    setActiveModule(module);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (activeModule && currentStep < activeModule.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishWalkthrough = () => {
    setActiveModule(null);
    setCurrentStep(0);
  };

  const openPage = (route: string) => {
    navigate(route);
  };

  // Filter modules based on user role
  const filteredModules = trainingModules.filter(module =>
    user && module.roles.includes(user.role)
  );

  return (
    <>
      <Layout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Staff Training</h1>
          </div>

          {/* Intro Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-4 border-purple-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the training hub</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Choose one training module below to open a guided walkthrough. Each module shows a mock version
              of the related page and explains the main actions staff should take there.
            </p>
          </div>

          {/* Training Modules */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Training Modules</h2>
            <p className="text-base text-gray-600 mb-6">Select a module card to start the guided tour.</p>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border-4 border-gray-200 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className={`${module.bgColor} p-4 rounded-xl mb-4 inline-block`}>
                    <Icon size={40} className={module.color} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-base text-gray-600 mb-6">{module.description}</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => startWalkthrough(module)}
                      className="w-full px-4 py-3 bg-teal-500 text-white rounded-lg font-bold text-base hover:bg-teal-600 transition-colors"
                    >
                      Open walkthrough
                    </button>
                    <button
                      onClick={() => openPage(module.route)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-base hover:bg-gray-50 transition-colors"
                    >
                      Open page
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>

      {/* Walkthrough Overlay */}
      {activeModule && (
        <div className="fixed inset-0 z-50">
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>

          {/* Mock Page Content */}
          <div className="absolute inset-0 overflow-auto">
            {activeModule.id === 'basics' ? (
              <MockDashboardPage currentStep={currentStep} />
            ) : activeModule.id === 'add-participant' ? (
              <MockAddParticipantPage currentStep={currentStep} />
            ) : activeModule.id === 'reports' ? (
              <MockReportsPage currentStep={currentStep} />
            ) : (
              <MockGenericPage module={activeModule} currentStep={currentStep} />
            )}
          </div>

          {/* Instruction Box - Position dynamically based on module and step */}
          <div className={`absolute bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 z-[60] ${
            activeModule.id === 'add-participant'
              ? currentStep === 0
                ? 'top-[20%] right-[5%]'
                : currentStep === 1
                  ? 'bottom-[15%] right-[5%]'
                  : currentStep === 2
                    ? 'top-[35%] right-[5%]'
                    : 'top-[40%] right-[5%]'
              : activeModule.id === 'reports'
                ? currentStep === 0
                  ? 'top-[20%] left-[5%]'
                  : currentStep === 1
                    ? 'top-[35%] left-[5%]'
                    : currentStep === 2
                      ? 'top-[45%] left-[5%]'
                      : currentStep === 3
                        ? 'bottom-[10%] left-[5%]'
                        : 'top-[30%] left-[5%]'
                : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="bg-teal-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                Step {currentStep + 1} of {activeModule.steps.length}
              </div>
              <button
                onClick={finishWalkthrough}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {activeModule.steps[currentStep].title}
            </h3>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {activeModule.steps[currentStep].description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-base transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              {currentStep < activeModule.steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg font-bold text-base hover:bg-teal-600 transition-colors"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={finishWalkthrough}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-bold text-base hover:bg-green-600 transition-colors"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Mock Dashboard Page for Staff Portal Basics
function MockDashboardPage({ currentStep }: { currentStep: number }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <div 
          className={`flex items-center gap-3 ${currentStep === 0 ? 'relative z-[55] bg-white p-4 rounded-lg ring-4 ring-teal-500' : 'opacity-30'}`}
        >
          <img src={logoImage} alt="The Hut Logo" className="h-12" />
          <span className="text-xl font-bold text-gray-900">The Hut Community Centre</span>
        </div>
        <button 
          className={`px-6 py-2 bg-red-500 text-white rounded-lg font-bold ${currentStep === 1 ? 'relative z-[55] ring-4 ring-teal-500' : 'opacity-30'}`}
        >
          Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`w-64 bg-white shadow-lg p-6 min-h-screen ${currentStep === 2 ? 'relative z-[55] ring-4 ring-teal-500' : 'opacity-30'}`}
        >
          <nav className="space-y-2">
            <div className="px-4 py-3 bg-gray-100 rounded-lg font-bold">Dashboard</div>
            <div className="px-4 py-3 text-gray-600">Mark Attendance</div>
            <div className="px-4 py-3 text-gray-600">Add Participant</div>
            <div className="px-4 py-3 text-gray-600">Find Participant</div>
            <div className="px-4 py-3 text-gray-600">View Reports</div>
            <div className="px-4 py-3 text-gray-600">Manage Programs</div>
            <div className="px-4 py-3 bg-teal-50 text-teal-700 rounded-lg font-bold">Staff Training</div>
            <div className="px-4 py-3 text-gray-600">User Approvals</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main 
          className={`flex-1 p-8 ${currentStep === 3 ? 'relative z-[55]' : 'opacity-30'}`}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${currentStep === 3 ? 'ring-4 ring-teal-500 rounded-2xl p-6' : ''}`}>
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="bg-blue-100 p-3 rounded-lg inline-block mb-3">
                <ClipboardCheck size={32} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Mark Attendance</h3>
              <p className="text-sm text-gray-600">Record participant attendance</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <div className="bg-green-100 p-3 rounded-lg inline-block mb-3">
                <UserPlus size={32} className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Add Participant</h3>
              <p className="text-sm text-gray-600">Register new members</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
              <div className="bg-purple-100 p-3 rounded-lg inline-block mb-3">
                <Users size={32} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Add to Program</h3>
              <p className="text-sm text-gray-600">Enroll in programs</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-teal-200">
              <div className="bg-teal-100 p-3 rounded-lg inline-block mb-3">
                <Search size={32} className="text-teal-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Find Participant</h3>
              <p className="text-sm text-gray-600">Search records</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
              <div className="bg-orange-100 p-3 rounded-lg inline-block mb-3">
                <BarChart3 size={32} className="text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">View Reports</h3>
              <p className="text-sm text-gray-600">Generate analytics</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-indigo-200">
              <div className="bg-indigo-100 p-3 rounded-lg inline-block mb-3">
                <Calendar size={32} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Manage Programs</h3>
              <p className="text-sm text-gray-600">Create and edit programs</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-pink-200">
              <div className="bg-pink-100 p-3 rounded-lg inline-block mb-3">
                <GraduationCap size={32} className="text-pink-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Staff Training</h3>
              <p className="text-sm text-gray-600">Access training</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
              <div className="bg-red-100 p-3 rounded-lg inline-block mb-3">
                <Shield size={32} className="text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">User Approvals</h3>
              <p className="text-sm text-gray-600">Approve staff</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Mock Add Participant Page
function MockAddParticipantPage({ currentStep }: { currentStep: number }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between opacity-30">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="The Hut Logo" className="h-12 object-contain" />
          <span className="text-xl font-bold text-gray-900">The Hut Community Centre</span>
        </div>
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">
          Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-6 min-h-screen opacity-30">
          <nav className="space-y-2">
            <div className="px-4 py-3 text-gray-600">Dashboard</div>
            <div className="px-4 py-3 text-gray-600">Mark Attendance</div>
            <div className="px-4 py-3 bg-green-50 text-green-700 rounded-lg font-bold">Add Participant</div>
            <div className="px-4 py-3 text-gray-600">Find Participant</div>
            <div className="px-4 py-3 text-gray-600">View Reports</div>
            <div className="px-4 py-3 text-gray-600">Manage Programs</div>
            <div className="px-4 py-3 text-gray-600">Staff Training</div>
            <div className="px-4 py-3 text-gray-600">User Approvals</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className={`mb-8 ${currentStep > 0 ? 'opacity-30' : ''}`}>
            <h1 className="text-4xl font-bold text-gray-900">Add New Participant</h1>
          </div>

          {/* Progress Steps */}
          <div className={`flex items-center gap-4 mb-8 ${currentStep > 0 ? 'opacity-30' : ''}`}>
            <div className={`flex items-center gap-3 ${currentStep === 2 ? 'relative z-[55]' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold">1</div>
              <span className="font-bold text-gray-900">General Info</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300"></div>
            <div className={`flex items-center gap-3 ${currentStep === 2 ? 'relative z-[55] ring-4 ring-teal-500 rounded-lg p-2' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">2</div>
              <span className="font-bold text-gray-600">Select Programs</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300"></div>
            <div className={`flex items-center gap-3 ${currentStep === 3 ? 'relative z-[55] ring-4 ring-teal-500 rounded-lg p-2' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">3</div>
              <span className="font-bold text-gray-600">Program Details</span>
            </div>
          </div>

          {/* Step 1: General Info Form */}
          <div className={`bg-white rounded-2xl p-8 shadow-xl border-4 border-green-200 mb-6 ${currentStep === 0 ? 'relative z-[55] ring-4 ring-teal-500' : currentStep > 0 ? 'opacity-30' : ''}`}>
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h4 className="text-xl font-bold text-blue-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-white border-2 border-gray-300 rounded-lg"></div>
                  <div className="h-12 bg-white border-2 border-gray-300 rounded-lg"></div>
                  <div className="h-12 bg-white border-2 border-gray-300 rounded-lg"></div>
                  <div className="h-12 bg-white border-2 border-gray-300 rounded-lg"></div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <h4 className="text-xl font-bold text-green-900 mb-4">Home Address</h4>
                <div className="space-y-4">
                  <div className="h-12 bg-white border-2 border-gray-300 rounded-lg"></div>
                  <div className="h-12 bg-white border-2 border-gray-300 rounded-lg"></div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
                <h4 className="text-xl font-bold text-red-900 mb-4">Emergency Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-white border-2 border-gray-300 rounded-lg"></div>
                  <div className="h-12 bg-white border-2 border-gray-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Consent Area */}
          <div className={`bg-white rounded-2xl p-8 shadow-xl border-4 border-pink-200 mb-6 ${currentStep === 1 ? 'relative z-[55] ring-4 ring-teal-500' : currentStep !== 1 ? 'opacity-30' : ''}`}>
            <h4 className="text-xl font-bold text-pink-900 mb-4">Photo Consent</h4>
            <p className="text-gray-700 mb-4">I give permission for The Hut to use photographs or video recordings of me for:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                <span className="text-lg font-semibold text-gray-700">Website</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                <span className="text-lg font-semibold text-gray-700">Social Media</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                <span className="text-lg font-semibold text-gray-700">Annual Report</span>
              </div>
            </div>
          </div>

          {/* Step 2: Program Selection */}
          {currentStep >= 2 && (
            <div className={`bg-white rounded-2xl p-8 shadow-xl border-4 border-purple-200 mb-6 ${currentStep === 2 ? 'relative z-[55] ring-4 ring-teal-500' : 'opacity-30'}`}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Programs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                  <span className="font-semibold">Chi Kung</span>
                </div>
                <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                  <span className="font-semibold">Outdoor Playgroup</span>
                </div>
                <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                  <span className="font-semibold">Walking Group</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Program Details and Submit */}
          {currentStep >= 3 && (
            <div className={`space-y-6 ${currentStep === 3 ? 'relative z-[55]' : 'opacity-30'}`}>
              <div className={`bg-white rounded-2xl p-8 shadow-xl border-4 border-indigo-200 ${currentStep === 3 ? 'ring-4 ring-teal-500' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Program-Specific Information</h3>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
                  <div className="h-24 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
                </div>
              </div>

              <div className={`flex justify-end ${currentStep === 3 ? 'ring-4 ring-teal-500 rounded-lg p-2' : ''}`}>
                <button className="px-8 py-4 bg-green-500 text-white rounded-lg font-bold text-lg">
                  Submit Registration
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons (shown for steps 1-2) */}
          {currentStep < 2 && (
            <div className={`flex justify-between mt-8 ${currentStep > 1 ? 'opacity-30' : ''}`}>
              <button className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg">
                Previous
              </button>
              <button className="px-8 py-4 bg-teal-500 text-white rounded-lg font-bold text-lg">
                Next Step
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Mock Reports Page
function MockReportsPage({ currentStep }: { currentStep: number }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between opacity-30">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="The Hut Logo" className="h-12 object-contain" />
          <span className="text-xl font-bold text-gray-900">The Hut Community Centre</span>
        </div>
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">
          Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-6 min-h-screen opacity-30">
          <nav className="space-y-2">
            <div className="px-4 py-3 text-gray-600">Dashboard</div>
            <div className="px-4 py-3 text-gray-600">Mark Attendance</div>
            <div className="px-4 py-3 text-gray-600">Add Participant</div>
            <div className="px-4 py-3 text-gray-600">Find Participant</div>
            <div className="px-4 py-3 bg-orange-50 text-orange-700 rounded-lg font-bold">View Reports</div>
            <div className="px-4 py-3 text-gray-600">Manage Programs</div>
            <div className="px-4 py-3 text-gray-600">Staff Training</div>
            <div className="px-4 py-3 text-gray-600">User Approvals</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className={`mb-8 ${currentStep > 0 ? 'opacity-30' : ''}`}>
            <h1 className="text-4xl font-bold text-gray-900">View Reports</h1>
          </div>

          {/* Report Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-4 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Filters</h2>

            {/* Time Period */}
            <div className={`mb-6 ${currentStep === 0 ? 'relative z-[55] ring-4 ring-teal-500 rounded-lg p-4' : currentStep > 0 ? 'opacity-30' : ''}`}>
              <div className="flex flex-wrap gap-3 mb-4">
                <button className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold">Weekly</button>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold">Monthly</button>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold">Quarterly</button>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold">Annually</button>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold">Custom Range</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Start date</label>
                  <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">End date</label>
                  <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Program Filters */}
            <div className={`mb-6 grid grid-cols-2 gap-6 ${currentStep === 1 ? 'relative z-[55] ring-4 ring-teal-500 rounded-lg p-4' : currentStep !== 1 ? 'opacity-30' : ''}`}>
              <div>
                <label className="block font-bold text-gray-700 mb-2">Program category</label>
                <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2">Program</label>
                <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
              </div>
            </div>

            {/* Participant Filters */}
            <div className={`grid grid-cols-2 gap-6 ${currentStep === 2 ? 'relative z-[55] ring-4 ring-teal-500 rounded-lg p-4' : currentStep !== 2 ? 'opacity-30' : ''}`}>
              <div>
                <label className="block font-bold text-gray-700 mb-2">Age group</label>
                <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2">Gender</label>
                <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2">ATSI status</label>
                <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2">CALD background</label>
                <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2">Council</label>
                <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2">Township</label>
                <div className="h-12 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-4 mt-8 ${currentStep > 2 ? 'opacity-30' : ''}`}>
              <button className={`px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold ${currentStep === 3 ? 'relative z-[55] ring-4 ring-teal-500' : ''}`}>
                Preview Report
              </button>
              <div className={`relative ${currentStep === 4 ? 'z-[55]' : ''}`}>
                <button className={`px-8 py-4 bg-teal-500 text-white rounded-lg font-bold flex items-center gap-2 ${currentStep === 4 ? 'ring-4 ring-teal-500 rounded-lg' : ''}`}>
                  Export Report
                  <ChevronDown size={20} />
                </button>
                {currentStep === 4 && (
                  <div className="absolute top-full mt-2 left-0 bg-white border-2 border-gray-200 rounded-lg shadow-xl min-w-[200px]">
                    <button className="w-full px-6 py-3 text-left hover:bg-gray-50 font-semibold border-b border-gray-200">
                      Export as PDF
                    </button>
                    <button className="w-full px-6 py-3 text-left hover:bg-gray-50 font-semibold">
                      Export as CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section (shows from step 3 onwards) */}
          {currentStep >= 3 && (
            <div className={`bg-white rounded-2xl p-8 shadow-xl border-4 border-gray-200 ${currentStep === 3 ? 'relative z-[55] ring-4 ring-teal-500' : currentStep > 3 ? 'opacity-30' : ''}`}>
              <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">The Hut Community Centre</h2>
                    <p className="text-lg text-gray-600">Monthly Report</p>
                  </div>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="text-sm font-bold text-blue-800 mb-2">Unique Participants</div>
                  <div className="text-3xl font-bold text-blue-900">45</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="text-sm font-bold text-green-800 mb-2">Total Attendances</div>
                  <div className="text-3xl font-bold text-green-900">132</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="text-sm font-bold text-purple-800 mb-2">Total Records</div>
                  <div className="text-3xl font-bold text-purple-900">150</div>
                </div>
                <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-200">
                  <div className="text-sm font-bold text-teal-800 mb-2">Attendance Rate</div>
                  <div className="text-3xl font-bold text-teal-900">88%</div>
                </div>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Age Distribution</h3>
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Gender Distribution</h3>
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              </div>

              {/* Table Placeholder */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Program Details</h3>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Mock Generic Page for Other Modules
function MockGenericPage({ module, currentStep }: { module: TrainingModule; currentStep: number }) {
  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-gray-50 opacity-30">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="The Hut Logo" className="h-12 object-contain" />
          <span className="text-xl font-bold text-gray-900">The Hut Community Centre</span>
        </div>
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">
          Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-6 min-h-screen">
          <nav className="space-y-2">
            <div className="px-4 py-3 text-gray-600">Dashboard</div>
            <div className="px-4 py-3 text-gray-600">Mark Attendance</div>
            <div className="px-4 py-3 text-gray-600">Add Participant</div>
            <div className="px-4 py-3 text-gray-600">Find Participant</div>
            <div className="px-4 py-3 text-gray-600">View Reports</div>
            <div className="px-4 py-3 text-gray-600">Manage Programs</div>
            <div className="px-4 py-3 text-gray-600">Staff Training</div>
            <div className="px-4 py-3 text-gray-600">User Approvals</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className={`${module.bgColor} p-4 rounded-xl`}>
              <Icon size={48} className={module.color} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">{module.title}</h1>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-100 rounded-lg"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
                <div className="h-12 bg-teal-500 rounded-lg w-32"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
