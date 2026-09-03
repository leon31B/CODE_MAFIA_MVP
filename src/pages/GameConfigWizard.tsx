import React, { useState } from 'react';
import { GameConfig, TransparencyLevel, TieRule } from '../types/game';
import { allContentPacks } from '../contentPacks';
import { ArrowLeft, Check, Shield, Skull, Clock, Eye, Sliders } from 'lucide-react';

interface GameConfigWizardProps {
  onCancel: () => void;
  onCreateGame: (config: GameConfig, hostName: string) => void;
}

export const GameConfigWizard: React.FC<GameConfigWizardProps> = ({ onCancel, onCreateGame }) => {
  const [hostName, setHostName] = useState('Host_Developer');
  const [selectedPackId, setSelectedPackId] = useState(allContentPacks[0].id);
  const [playerCount, setPlayerCount] = useState(6);
  const [mafiaCount, setMafiaCount] = useState(2);
  const [workRoundSeconds, setWorkRoundSeconds] = useState(180);
  const [discussionSeconds, setDiscussionSeconds] = useState(90);
  const [votingSeconds, setVotingSeconds] = useState(45);
  const [transparencyLevel, setTransparencyLevel] = useState<TransparencyLevel>('FULL');
  const [tieRule, setTieRule] = useState<TieRule>('NO_ELIMINATION');

  const maxAllowedMafia = Math.floor(playerCount * 0.4);

  const handlePlayerCountChange = (newCount: number) => {
    setPlayerCount(newCount);
    const suggestedMafia = Math.max(1, Math.floor(newCount / 3));
    setMafiaCount(Math.min(suggestedMafia, Math.floor(newCount * 0.4)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: GameConfig = {
      packId: selectedPackId,
      playerCount,
      mafiaCount,
      workRoundSeconds,
      discussionSeconds,
      votingSeconds,
      transparencyLevel,
      tieRule,
      passRateThreshold: 100,
      maxRounds: 3
    };
    onCreateGame(config, hostName || 'Host_Developer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onCancel}
        className="mb-6 inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-dark-800/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-red-500" />
            Configure Code Mafia Session
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Customize flawed project selection, player roster limits, timers, and social deduction rules.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Host Display Name */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
              Host Display Name
            </label>
            <input
              type="text"
              required
              value={hostName}
              onChange={e => setHostName(e.target.value)}
              className="w-full sm:w-80 bg-dark-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-red-500"
            />
          </div>

          {/* 1. Select Content Pack */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
              1. Select Flawed Project Pack
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {allContentPacks.map(pack => {
                const isSelected = pack.id === selectedPackId;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPackId(pack.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-950/30 border-red-500/80 shadow-lg shadow-red-950/50 ring-1 ring-red-500'
                        : 'bg-dark-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {pack.language.toUpperCase()}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">{pack.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{pack.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Roster & Mafia Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-dark-900/60 p-5 rounded-xl border border-slate-800">
            {/* Player Count */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-300 uppercase">Total Player Count:</span>
                <span className="text-cyan-400 font-bold text-sm">{playerCount} Players</span>
              </div>
              <input
                type="range"
                min={5}
                max={12}
                value={playerCount}
                onChange={e => handlePlayerCountChange(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block font-mono">Min 5, Max 12 players per match</span>
            </div>

            {/* Mafia Count */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-300 uppercase flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5 text-red-400" /> Mafia Count:
                </span>
                <span className="text-red-400 font-bold text-sm">{mafiaCount} Mafia ({playerCount - mafiaCount} Devs)</span>
              </div>
              <input
                type="range"
                min={1}
                max={maxAllowedMafia}
                value={mafiaCount}
                onChange={e => setMafiaCount(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block font-mono">Cap: max 40% of total players</span>
            </div>
          </div>

          {/* 3. Timers Config */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> 3. Phase Timers (Seconds)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Work Round (s)</label>
                <select
                  value={workRoundSeconds}
                  onChange={e => setWorkRoundSeconds(Number(e.target.value))}
                  className="w-full bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                >
                  <option value={120}>120s (2m)</option>
                  <option value={180}>180s (3m)</option>
                  <option value={240}>240s (4m)</option>
                  <option value={300}>300s (5m)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Discussion (s)</label>
                <select
                  value={discussionSeconds}
                  onChange={e => setDiscussionSeconds(Number(e.target.value))}
                  className="w-full bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                >
                  <option value={60}>60s (1m)</option>
                  <option value={90}>90s (1.5m)</option>
                  <option value={120}>120s (2m)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Voting Window (s)</label>
                <select
                  value={votingSeconds}
                  onChange={e => setVotingSeconds(Number(e.target.value))}
                  className="w-full bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                >
                  <option value={30}>30s</option>
                  <option value={45}>45s</option>
                  <option value={60}>60s</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Social Deduction & Feed Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" /> Transparency Level
              </label>
              <select
                value={transparencyLevel}
                onChange={e => setTransparencyLevel(e.target.value as TransparencyLevel)}
                className="w-full bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100"
              >
                <option value="FULL">FULL — Live editor diffs & edit events</option>
                <option value="DIFF_ONLY">DIFF_ONLY — Diff summaries without live line highlight</option>
                <option value="ANONYMIZED">ANONYMIZED — Metadata events without player names</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Tie-Break Rule
              </label>
              <select
                value={tieRule}
                onChange={e => setTieRule(e.target.value as TieRule)}
                className="w-full bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100"
              >
                <option value="NO_ELIMINATION">NO_ELIMINATION — Tied votes result in no player eliminated</option>
                <option value="RUNOFF">RUNOFF — Plurality candidate eliminated immediately</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-950/60 hover:scale-105 active:scale-95 transition-all"
            >
              Initialize Match & Generate Join Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
