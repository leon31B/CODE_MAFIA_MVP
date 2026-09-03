import React from 'react';
import { GameSession, Player } from '../types/game';
import { Shield, Skull, Code2, Users, LogOut, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  session: GameSession | null;
  currentUser: Player | null;
  onLeaveGame: () => void;
  onNavigateHome: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  currentUser,
  onLeaveGame,
  onNavigateHome,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="h-16 bg-dark-800/90 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Logo */}
      <div 
        onClick={onNavigateHome}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-dark-800 to-blue-600 p-[1px] shadow-lg shadow-red-950/30 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-dark-900 rounded-[11px] flex items-center justify-center">
            <Code2 className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors" />
          </div>
        </div>
        <div>
          <span className="font-bold text-lg tracking-wider text-slate-100 flex items-center gap-1.5">
            CODE <span className="text-red-500">MAFIA</span>
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block -mt-1 font-mono">
            Debug & Deduce v1.0
          </span>
        </div>
      </div>

      {/* Session Controls & Role Info (In-Game) */}
      {session && (
        <div className="flex items-center space-x-4">
          {/* Join Code Badge */}
          <div className="bg-dark-900 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">ROOM:</span>
            <span className="text-sm font-bold font-mono text-cyan-400 tracking-wider">
              {session.joinCode}
            </span>
          </div>

          {/* Player Role Badge */}
          {currentUser && currentUser.role && session.phase !== 'LOBBY' && (
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono flex items-center gap-2 ${
              currentUser.role === 'MAFIA'
                ? 'bg-red-950/60 border-red-500/50 text-red-400 shadow-sm shadow-red-900/40'
                : 'bg-blue-950/60 border-blue-500/50 text-blue-400 shadow-sm shadow-blue-900/40'
            }`}>
              {currentUser.role === 'MAFIA' ? (
                <>
                  <Skull className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>ROLE: MAFIA</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>ROLE: DEVELOPER</span>
                </>
              )}
            </div>
          )}

          {/* Players Count Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/60 border border-slate-700 px-2.5 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{session.players.filter(p => p.isAlive).length} / {session.players.length} Alive</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleTheme}
          title="Toggle Theme"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {session && (
          <button
            onClick={onLeaveGame}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave Game</span>
          </button>
        )}
      </div>
    </header>
  );
};
