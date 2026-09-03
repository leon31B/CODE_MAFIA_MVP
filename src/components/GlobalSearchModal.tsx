import React, { useState } from 'react';
import { Search, History, Code, Users, Calendar, Filter, X } from 'lucide-react';
import { ContentPack } from '../types/game';
import { allContentPacks } from '../contentPacks';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame?: (gameId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectGame }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  if (!isOpen) return null;

  const mockGames = [
    { id: 'sess-101', packName: 'Task Master API', code: 'X9K2P1', language: 'javascript', winner: 'DEVELOPERS', date: '2026-09-03', players: 6 },
    { id: 'sess-102', packName: 'Inventory & Discount Manager', code: 'PY8821', language: 'python', winner: 'MAFIA', date: '2026-09-02', players: 8 },
    { id: 'sess-103', packName: 'Auth & Rate Limiter', code: 'SEC441', language: 'javascript', winner: 'DEVELOPERS', date: '2026-09-01', players: 6 }
  ];

  const filteredPacks = allContentPacks.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = selectedLanguage === 'all' || p.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesDiff = selectedDifficulty === 'all' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesLang && matchesDiff;
  });

  const filteredGames = mockGames.filter(g => {
    const matchesSearch = g.packName.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = selectedLanguage === 'all' || g.language.toLowerCase() === selectedLanguage.toLowerCase();
    return matchesSearch && matchesLang;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/80 backdrop-blur-sm font-sans animate-fadeIn">
      <div className="bg-[#151822] border border-[#2C3242] rounded-[10px] w-full max-w-2xl p-6 space-y-5 shadow-2xl relative font-mono text-xs text-[#F3F5FA]">
        <div className="flex items-center justify-between border-b border-[#2C3242] pb-3">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-[#FFC341]" />
            <h2 className="text-sm font-bold text-[#F3F5FA] uppercase tracking-wider">Global Search & Archive Explorer</h2>
          </div>
          <button onClick={onClose} className="text-[#AAB2C8] hover:text-[#F3F5FA]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center bg-[#0B0D12] border border-[#2C3242] rounded-[10px] px-3 py-2">
          <Search className="w-4 h-4 text-[#AAB2C8] mr-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by pack name, room code, language, or player..."
            className="bg-transparent text-[#F3F5FA] focus:outline-none w-full font-mono text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#AAB2C8]">
          <span className="flex items-center gap-1 font-bold text-[#F3F5FA]">
            <Filter className="w-3 h-3 text-[#FFC341]" /> Filters:
          </span>
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="bg-[#1E2230] border border-[#2C3242] rounded-[2px] px-2 py-1 text-[#F3F5FA] focus:outline-none"
          >
            <option value="all">Language: All</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="bg-[#1E2230] border border-[#2C3242] rounded-[2px] px-2 py-1 text-[#F3F5FA] focus:outline-none"
          >
            <option value="all">Difficulty: All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Search Results */}
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          <div>
            <span className="text-[10px] text-[#AAB2C8] uppercase font-bold block mb-2">Content Packs ({filteredPacks.length})</span>
            <div className="space-y-2">
              {filteredPacks.map(p => (
                <div key={p.id} className="p-3 rounded-[10px] bg-[#1E2230] border border-[#2C3242] flex items-center justify-between hover:border-[#FFC341]/50 transition-colors">
                  <div>
                    <span className="font-bold text-sm text-[#F3F5FA]">{p.name}</span>
                    <p className="text-[11px] text-[#AAB2C8] mt-0.5">{p.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#123829] text-[#2EE6A6] text-[10px] font-bold border border-[#2EE6A6]/40">
                    {p.language.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#AAB2C8] uppercase font-bold block mb-2">Game History Sessions ({filteredGames.length})</span>
            <div className="space-y-2">
              {filteredGames.map(g => (
                <div key={g.id} className="p-3 rounded-[10px] bg-[#1E2230] border border-[#2C3242] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <History className="w-4 h-4 text-[#A78BFA]" />
                    <div>
                      <span className="font-bold text-xs text-[#F3F5FA]">{g.packName}</span>
                      <span className="text-[10px] text-[#AAB2C8] block">CODE: {g.code} • {g.date} • {g.players} Players</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    g.winner === 'DEVELOPERS' ? 'bg-[#123829] text-[#2EE6A6] border-[#2EE6A6]/40' : 'bg-[#421823] text-[#FF5468] border-[#FF5468]/40'
                  }`}>
                    {g.winner}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
