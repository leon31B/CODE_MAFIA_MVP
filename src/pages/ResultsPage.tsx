import React from 'react';
import { GameSession } from '../types/game';
import { Trophy, Skull, RotateCcw, Home, Award } from 'lucide-react';

interface ResultsPageProps {
  session: GameSession;
  onPlayAgain: () => void;
  onNavigateHome: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  session,
  onPlayAgain,
  onNavigateHome
}) => {
  const isDevWin = session.winner === 'DEVELOPERS';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Victory Banner */}
      <div className={`relative overflow-hidden rounded-2xl p-8 border shadow-2xl text-center space-y-4 ${
        isDevWin
          ? 'bg-gradient-to-br from-blue-950 via-dark-900 to-cyan-950/60 border-blue-500/40'
          : 'bg-gradient-to-br from-red-950 via-dark-900 to-amber-950/60 border-red-500/40'
      }`}>
        <div className="inline-flex p-4 rounded-2xl bg-dark-900 border border-slate-700/80 shadow-xl">
          {isDevWin ? (
            <Trophy className="w-16 h-16 text-yellow-400 text-glow-gold" />
          ) : (
            <Skull className="w-16 h-16 text-red-500 text-glow-red animate-pulse" />
          )}
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
          MATCH FINALE RESULTS
        </span>

        <h1 className={`text-4xl font-extrabold tracking-tight font-mono ${
          isDevWin ? 'text-blue-400 text-glow-blue' : 'text-red-500 text-glow-red'
        }`}>
          {isDevWin ? 'DEVELOPERS VICTORY!' : 'MAFIA SABOTAGE VICTORY!'}
        </h1>

        <p className="text-sm font-mono text-slate-300 max-w-xl mx-auto">
          {session.winReason || (isDevWin ? 'All unit tests passed successfully!' : 'Developers were unable to pass the test suite.')}
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={onPlayAgain}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-bold font-mono text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again (Same Lobby)</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold font-mono text-sm border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Full Player Roster & Role Matrix */}
      <div className="bg-dark-800/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" /> Full Player Role Matrix & Metrics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="pb-3 px-2">Player</th>
                <th className="pb-3 px-2">Role</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Bugs Fixed</th>
                <th className="pb-3 px-2">Tests Run</th>
                <th className="pb-3 px-2">Suspicion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {session.players.map(p => {
                const isMafia = p.role === 'MAFIA';
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-2 font-bold flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${p.avatarColor} text-white text-[10px] flex items-center justify-center`}>
                        {p.displayName.charAt(0)}
                      </div>
                      <span>{p.displayName}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isMafia ? 'bg-red-950 text-red-400 border border-red-800/60' : 'bg-blue-950 text-blue-400 border border-blue-800/60'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {p.isAlive ? (
                        <span className="text-emerald-400 font-semibold">Survived</span>
                      ) : (
                        <span className="text-slate-500">Eliminated</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-cyan-400">{p.stats.bugsFixed}</td>
                    <td className="py-3 px-2 text-slate-300">{p.stats.testsRun}</td>
                    <td className="py-3 px-2 text-amber-400">{p.stats.suspicionScore}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
