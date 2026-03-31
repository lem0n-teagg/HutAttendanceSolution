import { Layout } from '../components/Layout';
import { BookOpen, Video, FileText, HelpCircle, CheckCircle, PlayCircle } from 'lucide-react';
import { useState } from 'react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: typeof BookOpen;
  completed: boolean;
  category: 'basic' | 'intermediate' | 'advanced';
}

export default function Training() {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const trainingModules: TrainingModule[] = [
    {
      id: '1',
      title: 'Getting Started with The Hut Portal',
      description: 'Learn the basics of navigating the portal and understanding the main dashboard.',
      duration: '10 minutes',
      icon: BookOpen,
      completed: false,
      category: 'basic'
    },
    {
      id: '2',
      title: 'Adding New Participants',
      description: 'Step-by-step guide on how to register new participants in the system.',
      duration: '15 minutes',
      icon: Video,
      completed: false,
      category: 'basic'
    },
    {
      id: '3',
      title: 'Marking Attendance',
      description: 'Learn how to quickly mark attendance for programs and activities.',
      duration: '12 minutes',
      icon: PlayCircle,
      completed: false,
      category: 'basic'
    },
    {
      id: '4',
      title: 'Searching and Managing Participants',
      description: 'Master the search features and learn how to update participant information.',
      duration: '20 minutes',
      icon: FileText,
      completed: false,
      category: 'intermediate'
    },
    {
      id: '5',
      title: 'Enrolling Participants in Programs',
      description: 'Learn how to add existing participants to different programs.',
      duration: '15 minutes',
      icon: Video,
      completed: false,
      category: 'intermediate'
    },
    {
      id: '6',
      title: 'Generating and Understanding Reports',
      description: 'Learn how to create reports, analyze data, and export information.',
      duration: '25 minutes',
      icon: BookOpen,
      completed: false,
      category: 'advanced'
    },
    {
      id: '7',
      title: 'Troubleshooting Common Issues',
      description: 'Solutions to frequently encountered problems and how to get help.',
      duration: '15 minutes',
      icon: HelpCircle,
      completed: false,
      category: 'advanced'
    }
  ];

  const markAsCompleted = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
    }
  };

  const getModulesByCategory = (category: 'basic' | 'intermediate' | 'advanced') => {
    return trainingModules.filter(module => module.category === category);
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Layout title="Staff Training">
      <div className="space-y-8">
        {/* Introduction Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 md:p-10 text-white shadow-xl">
          <div className="flex items-start gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <BookOpen size={48} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Staff Training</h3>
              <p className="text-xl md:text-2xl text-white/90 mb-4">
                Learn how to use The Hut Participation Portal effectively
              </p>
              <p className="text-lg text-white/80">
                Complete these training modules at your own pace. Each module includes step-by-step instructions 
                with large, clear visuals designed for easy learning.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-200">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Your Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedModules.length / trainingModules.length) * 100}%` }}
              ></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {completedModules.length}/{trainingModules.length}
            </div>
          </div>
          <p className="text-lg text-gray-600 mt-3">
            {completedModules.length === trainingModules.length 
              ? '🎉 Congratulations! You\'ve completed all training modules!' 
              : `${trainingModules.length - completedModules.length} modules remaining`}
          </p>
        </div>

        {/* Basic Training Modules */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 px-4 py-2 rounded-xl border-2 border-green-300">
              <span className="text-xl font-bold text-green-800">BASIC</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Essential Skills</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getModulesByCategory('basic').map((module) => {
              const Icon = module.icon;
              const isCompleted = completedModules.includes(module.id);
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                  onClick={() => setSelectedModule(module)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-green-100 p-4 rounded-xl">
                      <Icon size={32} className="text-green-600" />
                    </div>
                    {isCompleted && (
                      <div className="bg-green-500 text-white p-2 rounded-full">
                        <CheckCircle size={24} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h4>
                  <p className="text-base text-gray-600 mb-4">{module.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">⏱️ {module.duration}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsCompleted(module.id);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Start'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intermediate Training Modules */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 px-4 py-2 rounded-xl border-2 border-blue-300">
              <span className="text-xl font-bold text-blue-800">INTERMEDIATE</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Building Expertise</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getModulesByCategory('intermediate').map((module) => {
              const Icon = module.icon;
              const isCompleted = completedModules.includes(module.id);
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                  onClick={() => setSelectedModule(module)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-100 p-4 rounded-xl">
                      <Icon size={32} className="text-blue-600" />
                    </div>
                    {isCompleted && (
                      <div className="bg-green-500 text-white p-2 rounded-full">
                        <CheckCircle size={24} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h4>
                  <p className="text-base text-gray-600 mb-4">{module.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">⏱️ {module.duration}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsCompleted(module.id);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Start'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Training Modules */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 px-4 py-2 rounded-xl border-2 border-purple-300">
              <span className="text-xl font-bold text-purple-800">ADVANCED</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Advanced Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getModulesByCategory('advanced').map((module) => {
              const Icon = module.icon;
              const isCompleted = completedModules.includes(module.id);
              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                  onClick={() => setSelectedModule(module)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-purple-100 p-4 rounded-xl">
                      <Icon size={32} className="text-purple-600" />
                    </div>
                    {isCompleted && (
                      <div className="bg-green-500 text-white p-2 rounded-full">
                        <CheckCircle size={24} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h4>
                  <p className="text-base text-gray-600 mb-4">{module.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">⏱️ {module.duration}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsCompleted(module.id);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Start'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Help Section */}
        <div className="bg-orange-50 rounded-2xl p-8 border-2 border-orange-200">
          <div className="flex items-start gap-6">
            <div className="bg-orange-500 text-white p-4 rounded-xl">
              <HelpCircle size={40} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-lg text-gray-700 mb-4">
                If you have questions or need assistance, don't hesitate to reach out to your supervisor 
                or the IT support team.
              </p>
              <div className="space-y-2 text-base text-gray-600">
                <p>📧 Email: support@thehut.org</p>
                <p>📞 Phone: (555) 123-4567</p>
                <p>🕐 Support Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedModule(null)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-3xl font-bold text-gray-900">{selectedModule.title}</h3>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-gray-500 hover:text-gray-700 text-4xl"
              >
                ×
              </button>
            </div>
            <p className="text-xl text-gray-700 mb-6">{selectedModule.description}</p>
            <div className="bg-gray-100 p-6 rounded-xl mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn:</h4>
              <ul className="space-y-2 text-lg text-gray-700">
                <li>✓ Step-by-step instructions with screenshots</li>
                <li>✓ Common mistakes to avoid</li>
                <li>✓ Tips for working more efficiently</li>
                <li>✓ Practice exercises to test your knowledge</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  markAsCompleted(selectedModule.id);
                  setSelectedModule(null);
                }}
                className="flex-1 bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-green-700 transition-colors"
              >
                Start Training
              </button>
              <button
                onClick={() => setSelectedModule(null)}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
