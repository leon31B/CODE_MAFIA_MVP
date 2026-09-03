import React, { useState } from 'react';
import { GameSession, Player } from '../types/game';
import { Copy, Check, Play, UserPlus, Bot, Users } from 'lucide-react';

interface LobbyPageProps {
  session: GameSession;
  currentUser: Player;
  onToggleReady: () => void;
  onAddBotPlayer: () => void;
  onStartGame: () => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  session,
  currentUser,
  onToggleReady,
  onAddBotPlayer,
  onStartGame
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = currentUser.isHost;
  const readyCount = session.players.filter(p => p.isReady).length;
  const totalCount = session.players.length;
  const canStart = isHost && totalCount >= 5 && readyCount >= Math.ceil(totalCount * 0.75);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs text-red-500 font-mono font-bold uppercase tracking-widest block">
            GAME LOBBY • {session.contentPack.name}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono">
            Waiting Room ({totalCount} / {session.config.playerCount} Players)
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Mafia Ratio: {session.config.mafiaCount} Mafia / {totalCount - session.config.mafiaCount} Developers
          </p>
        </div>

        {/* Join Code Box */}
        <div className="bg-dark-950 border border-slate-700/80 rounded-xl p-3.5 flex items-center space-x-3 shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 font-mono block">INVITE CODE</span>
            <span className="text-xl font-extrabold font-mono text-cyan-400 tracking-wider">
              {session.joinCode}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Copy Invite Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Roster & Controls Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Roster List (2 Cols) */}
        <div className="md:col-span-2 bg-dark-800/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" /> Player Roster
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {readyCount} / {totalCount} Ready
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {session.players.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl ${p.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <span className="font-bold text-sm text-slate-100 font-mono flex items-center gap-1.5">
                      {p.displayName}
                      {p.isHost && <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 text-[10px]">HOST</span>}
                      {p.isBot && <Bot className="w-3.5 h-3.5 text-cyan-400" title="AI Bot Player" />}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      {p.isBot ? 'AI Simulator' : 'Connected Player'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {p.isReady ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs">
                      Not Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls Sidebar */}
        <div className="bg-dark-800/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">Match Actions</h3>

            {/* Toggle Ready Button */}
            <button
              onClick={onToggleReady}
              className={`w-full py-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 border transition-all ${
                currentUser.isReady
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-950'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{currentUser.isReady ? 'Unready' : 'Click to Ready Up'}</span>
            </button>

            {/* Host Fill Bots Button */}
            {isHost && totalCount < session.config.playerCount && (
              <button
                onClick={onAddBotPlayer}
                className="w-full py-2.5 rounded-xl bg-dark-900 hover:bg-slate-800 text-cyan-400 border border-cyan-800/50 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add AI Bot Player</span>
              </button>
            )}
          </div>

          {/* Host Start Game Button */}
          {isHost && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={onStartGame}
                disabled={!canStart}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                  canStart
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-950 hover:scale-105 active:scale-95'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Match ({readyCount}/{totalCount} Ready)</span>
              </button>

              {!canStart && (
                <span className="text-[10px] text-slate-500 font-mono text-center block">
                  Requires min 5 players & 75% ready status to start
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
