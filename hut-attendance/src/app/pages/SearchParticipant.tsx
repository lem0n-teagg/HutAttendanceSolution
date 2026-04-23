import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/Layout';
import { Search, Eye, AlertCircle } from 'lucide-react';
import { supabase, Participant, isSupabaseConfigured } from '../../lib/supabase';

export default function SearchParticipant() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured');
      return;
    }
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
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return participants;
    const term = searchTerm.toLowerCase();
    return participants.filter(
      (p) =>
        p.first_name.toLowerCase().includes(term) ||
        p.last_name.toLowerCase().includes(term) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.phone && p.phone.includes(term))
    );
  }, [searchTerm, participants]);

  const view = (id?: string) => id && navigate(`/participant/${id}`);

  return (
    <Layout title="Participants" subtitle="Search by name, email, or phone">
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="relative mb-4">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type a name, email, or phone…"
          className="w-full rounded-lg border border-zinc-800 bg-[#111113] py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-[#111113]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/40">
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Name</th>
              <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 md:table-cell">Email</th>
              <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 lg:table-cell">Phone</th>
              <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 xl:table-cell">DOB</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">Loading participants…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                  {searchTerm ? 'No participants match your search.' : 'No participants registered yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-sm text-zinc-100">
                    {p.first_name} {p.last_name}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-zinc-400 md:table-cell">{p.email || '—'}</td>
                  <td className="hidden px-4 py-3 text-sm text-zinc-400 lg:table-cell">{p.phone || '—'}</td>
                  <td className="hidden px-4 py-3 text-sm text-zinc-400 xl:table-cell">
                    {p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => view(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
