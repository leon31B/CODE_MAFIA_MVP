import React from 'react';
import { Play, History, Settings, ShieldCheck, Zap, Layers, Trophy } from 'lucide-react';

interface DashboardPageProps {
  onNewGame: () => void;
  onViewHistory: () => void;
  onViewAdminPacks: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNewGame,
  onViewHistory,
  onViewAdminPacks
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-800 via-dark-900 to-red-950/40 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5" /> MULTIPLAYER DEBUGGING SOCIAL DEDUCTION
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Spot the Saboteurs. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400">
              Fix the Code. Win the Match.
            </span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Collaborative coding meets Werewolf / Among Us. Developers attempt to debug a flawed codebase and pass unit tests, while hidden Mafia covertly plant regressions and sabotage test suites.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onNewGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Create New Match</span>
            </button>

            <button
              onClick={onViewHistory}
              className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>Game History & Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-dark-800/80 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-950 border border-blue-800/50 text-blue-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase block">Active Team Sessions</span>
            <span className="text-2xl font-extrabold text-slate-100 font-mono">1,420</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-dark-800/80 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800/50 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase block">Avg Test Pass Rate</span>
            <span className="text-2xl font-extrabold text-slate-100 font-mono">92.4%</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-dark-800/80 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-purple-950 border border-purple-800/50 text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase block">Curated Content Packs</span>
            <span className="text-2xl font-extrabold text-slate-100 font-mono">3 Live</span>
          </div>
        </div>
      </div>

      {/* Content Packs Preview & Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200 font-mono">Featured Flawed Project Packs</h2>
          <button
            onClick={onViewAdminPacks}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" /> Manage Content Packs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-dark-800/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-800/50 font-mono text-[10px]">
                JavaScript
              </span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">Easy</span>
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Task Master API</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Debug async queue ordering, priority filter type coercions, and task status mutations.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-dark-800/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50 font-mono text-[10px]">
                Python
              </span>
              <span className="text-xs text-amber-400 font-mono font-semibold">Medium</span>
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Inventory & Discount Manager</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fix float tax rounding errors, negative inventory allocations, and discount boundary tiers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-dark-800/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-800/50 font-mono text-[10px]">
                JavaScript
              </span>
              <span className="text-xs text-red-400 font-mono font-semibold">Hard</span>
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Auth & Rate Limiter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Debug token expiration timestamp units and sliding-window rate limit counters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
