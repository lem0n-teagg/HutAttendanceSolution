import { Layout } from '../components/Layout';
import { BookOpen, Video, FileText, HelpCircle, CheckCircle2, PlayCircle, X, Mail, Phone, Clock } from 'lucide-react';
import { useState, type ComponentType } from 'react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  category: 'basic' | 'intermediate' | 'advanced';
}

const categoryTone = {
  basic: { label: 'Basic', bg: 'bg-emerald-500/10', text: 'text-emerald-300', ring: 'ring-emerald-500/20' },
  intermediate: { label: 'Intermediate', bg: 'bg-blue-500/10', text: 'text-blue-300', ring: 'ring-blue-500/20' },
  advanced: { label: 'Advanced', bg: 'bg-purple-500/10', text: 'text-purple-300', ring: 'ring-purple-500/20' },
} as const;

const modules: TrainingModule[] = [
  { id: '1', title: 'Getting started with the portal', description: 'Navigate the portal and understand the main dashboard.', duration: '10 min', icon: BookOpen, category: 'basic' },
  { id: '2', title: 'Adding new participants', description: 'Register new participants in the system step by step.', duration: '15 min', icon: Video, category: 'basic' },
  { id: '3', title: 'Marking attendance', description: 'Quickly mark attendance for programs and activities.', duration: '12 min', icon: PlayCircle, category: 'basic' },
  { id: '4', title: 'Searching and managing participants', description: 'Master search features and update participant info.', duration: '20 min', icon: FileText, category: 'intermediate' },
  { id: '5', title: 'Enrolling participants in programs', description: 'Add existing participants to different programs.', duration: '15 min', icon: Video, category: 'intermediate' },
  { id: '6', title: 'Generating and understanding reports', description: 'Create reports, analyze data, and export.', duration: '25 min', icon: BookOpen, category: 'advanced' },
  { id: '7', title: 'Troubleshooting common issues', description: 'Solutions to frequent problems and how to get help.', duration: '15 min', icon: HelpCircle, category: 'advanced' },
];

export default function Training() {
  const [selected, setSelected] = useState<TrainingModule | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  const markDone = (id: string) => {
    if (!completed.includes(id)) setCompleted([...completed, id]);
  };

  const pct = (completed.length / modules.length) * 100;

  const categories = ['basic', 'intermediate', 'advanced'] as const;

  return (
    <Layout title="Staff Training" subtitle="Tutorials and best practices">
      {/* Progress */}
      <div className="rounded-xl border border-zinc-800/80 bg-[#111113] p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">Your progress</h3>
          <span className="text-sm text-zinc-400">{completed.length} / {modules.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {completed.length === modules.length
            ? 'All modules complete — nice work!'
            : `${modules.length - completed.length} module${modules.length - completed.length === 1 ? '' : 's'} remaining`}
        </p>
      </div>

      {categories.map((cat) => {
        const list = modules.filter((m) => m.category === cat);
        if (!list.length) return null;
        const tone = categoryTone[cat];
        return (
          <section key={cat} className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
                {tone.label}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => {
                const Icon = m.icon;
                const isDone = completed.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="group cursor-pointer rounded-xl border border-zinc-800/80 bg-[#111113] p-4 transition-colors hover:border-zinc-700 hover:bg-[#141416]"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${tone.bg} ${tone.ring}`}>
                        <Icon size={17} className={tone.text} />
                      </div>
                      {isDone && <CheckCircle2 size={17} className="text-emerald-400" />}
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-100">{m.title}</h4>
                    <p className="mt-1 text-xs text-zinc-500">{m.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 text-zinc-500">
                        <Clock size={11} /> {m.duration}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markDone(m.id);
                        }}
                        className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                          isDone
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-zinc-900 text-zinc-300 group-hover:bg-zinc-800'
                        }`}
                      >
                        {isDone ? 'Completed' : 'Start'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Help */}
      <section className="mt-6 rounded-xl border border-zinc-800/80 bg-[#111113] p-5">
        <div className="mb-2 flex items-center gap-2">
          <HelpCircle size={15} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Need help?</h3>
        </div>
        <p className="text-xs text-zinc-500">
          Reach out to your supervisor or the IT support team if you get stuck.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5"><Mail size={12} /> support@thehut.org</span>
          <span className="inline-flex items-center gap-1.5"><Phone size={12} /> (555) 123-4567</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={12} /> Mon–Fri 9:00–17:00</span>
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#111113] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-base font-semibold text-zinc-100">{selected.title}</h3>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-zinc-400">{selected.description}</p>
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">What you'll learn</h4>
              <ul className="space-y-1.5 text-sm text-zinc-300">
                <li className="flex gap-2"><span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" /> Step-by-step instructions with screenshots</li>
                <li className="flex gap-2"><span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" /> Common mistakes to avoid</li>
                <li className="flex gap-2"><span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" /> Tips for working efficiently</li>
                <li className="flex gap-2"><span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" /> Practice exercises</li>
              </ul>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-700 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  markDone(selected.id);
                  setSelected(null);
                }}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-indigo-500"
              >
                Start training
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
