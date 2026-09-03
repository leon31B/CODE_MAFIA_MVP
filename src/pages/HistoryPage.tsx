import React, { useState } from 'react';
import { GameHistoryItem } from '../types/game';
import { History, Download, ArrowLeft, Search, Trophy, ShieldAlert } from 'lucide-react';

interface HistoryPageProps {
  onBack: () => void;
}

const mockHistory: GameHistoryItem[] = [
  {
    id: 'hist-1',
    date: '2026-09-03 15:30',
    packName: 'Task Master API (JavaScript)',
    language: 'JavaScript',
    playerCount: 6,
    mafiaCount: 2,
    winner: 'DEVELOPERS',
    durationMinutes: 14,
    roundsCount: 2
  },
  {
    id: 'hist-2',
    date: '2026-09-02 18:45',
    packName: 'Inventory & Discount Manager (Python)',
    language: 'Python',
    playerCount: 8,
    mafiaCount: 3,
    winner: 'MAFIA',
    durationMinutes: 22,
    roundsCount: 3
  },
  {
    id: 'hist-3',
    date: '2026-09-01 11:15',
    packName: 'Auth & Rate Limiter (JavaScript)',
    language: 'JavaScript',
    playerCount: 7,
    mafiaCount: 2,
    winner: 'DEVELOPERS',
    durationMinutes: 18,
    roundsCount: 2
  }
];

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockHistory.filter(h =>
    h.packName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID,Date,ContentPack,Language,Players,Mafia,Winner,DurationMin,Rounds'];
    const rows = mockHistory.map(h =>
      `${h.id},${h.date},"${h.packName}",${h.language},${h.playerCount},${h.mafiaCount},${h.winner},${h.durationMinutes},${h.roundsCount}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `code_mafia_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" /> Game History & Workspace Analytics
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Archive of completed Code Mafia sessions and debugging metrics.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center bg-dark-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono">
        <Search className="w-4 h-4 text-slate-500 mr-2" />
        <input
          type="text"
          placeholder="Filter game history..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-transparent text-slate-100 focus:outline-none w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="bg-dark-900 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Content Pack</th>
              <th className="py-3 px-4">Players</th>
              <th className="py-3 px-4">Winner</th>
              <th className="py-3 px-4">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 text-slate-400">{item.date}</td>
                <td className="py-3 px-4 font-bold">{item.packName}</td>
                <td className="py-3 px-4">{item.playerCount} ({item.mafiaCount} Mafia)</td>
                <td className="py-3 px-4">
                  {item.winner === 'DEVELOPERS' ? (
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-bold flex items-center gap-1 w-fit">
                      <Trophy className="w-3 h-3 text-yellow-400" /> DEVS
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60 font-bold flex items-center gap-1 w-fit">
                      <ShieldAlert className="w-3 h-3 text-red-500" /> MAFIA
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-400">{item.durationMinutes}m ({item.roundsCount} rounds)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
