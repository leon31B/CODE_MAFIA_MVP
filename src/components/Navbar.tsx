import React from 'react';
import { GameSession, Player } from '../types/game';
import { Shield, Skull, Code2, Users, LogOut, Moon, Sun, LogIn } from 'lucide-react';

interface NavbarProps {
  session: GameSession | null;
  currentUser: Player | null;
  onLeaveGame: () => void;
  onNavigateHome: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAuth?: () => void;
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
    <header className="h-14 bg-[#151822] border-b border-[#2C3242] px-4 flex items-center justify-between z-30 sticky top-0 font-sans">
      {/* Brand & Logo */}
      <div 
        onClick={onNavigateHome}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#FF5468] via-[#1E2230] to-[#2EE6A6] p-[1px] shadow-md group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#0B0D12] rounded-[9px] flex items-center justify-center">
            <Code2 className="w-4 h-4 text-[#FF5468] group-hover:text-[#FFC341] transition-colors" />
          </div>
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-[#F3F5FA] flex items-center gap-1 font-mono">
            CODE <span className="text-[#FF5468]">MAFIA</span>
          </span>
          <span className="text-[10px] text-[#AAB2C8] tracking-wider block -mt-1 font-mono uppercase">
            Debug & Deduce v1.0
          </span>
        </div>
      </div>

      {/* Session Controls & Role Info (In-Game) */}
      {session && (
        <div className="flex items-center space-x-3 font-mono">
          {/* Join Code Badge */}
          <div className="bg-[#0B0D12] border border-[#2C3242] rounded-[10px] px-3 py-1 flex items-center gap-2 text-xs">
            <span className="text-[#AAB2C8]">ROOM:</span>
            <span className="font-bold text-[#FFC341] tracking-widest">
              {session.joinCode}
            </span>
          </div>

          {/* Player Role Badge */}
          {currentUser && currentUser.role && session.phase !== 'LOBBY' && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              currentUser.role === 'MAFIA'
                ? 'bg-[#421823] border-[#FF5468]/60 text-[#FF5468]'
                : 'bg-[#123829] border-[#2EE6A6]/60 text-[#2EE6A6]'
            }`}>
              {currentUser.role === 'MAFIA' ? (
                <>
                  <Skull className="w-3.5 h-3.5 text-[#FF5468] animate-pulse" />
                  <span>ROLE: MAFIA</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-[#2EE6A6]" />
                  <span>ROLE: DEVELOPER</span>
                </>
              )}
            </div>
          )}

          {/* Players Count Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#F3F5FA] bg-[#1E2230] border border-[#2C3242] px-2.5 py-1 rounded-full">
            <Users className="w-3.5 h-3.5 text-[#AAB2C8]" />
            <span>{session.players.filter(p => p.isAlive).length} / {session.players.length} Alive</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {onOpenAuth && !session && (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FFC341] hover:text-[#F3F5FA] bg-[#4A3812] hover:bg-[#FFC341]/20 border border-[#FFC341]/50 rounded-[10px] transition-colors font-mono"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In / Guest Pass</span>
          </button>
        )}

        <button
          onClick={onToggleTheme}
          title="Toggle Theme"
          className="p-2 text-[#AAB2C8] hover:text-[#F3F5FA] hover:bg-[#1E2230] rounded-[10px] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FFC341]" /> : <Moon className="w-4 h-4" />}
        </button>

        {session && (
          <button
            onClick={onLeaveGame}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FF5468] hover:text-[#F3F5FA] hover:bg-[#421823] border border-[#FF5468]/40 rounded-[10px] transition-colors font-mono"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave Game</span>
          </button>
        )}
      </div>
    </header>
  );
};
