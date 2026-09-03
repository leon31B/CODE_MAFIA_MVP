import React, { useState } from 'react';
import { GameSession, Player } from '../types/game';
import { PhaseTimer } from '../components/PhaseTimer';
import { Vote, Check, UserX, AlertCircle } from 'lucide-react';

interface VotingPageProps {
  session: GameSession;
  currentUser: Player;
  onCastVote: (targetPlayerId: string | null) => void;
  onTimerExpired: () => void;
}

export const VotingPage: React.FC<VotingPageProps> = ({
  session,
  currentUser,
  onCastVote,
  onTimerExpired
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
    session.votes[currentUser.id] !== undefined ? session.votes[currentUser.id] : null
  );

  const alivePlayers = session.players.filter(p => p.isAlive);
  const isAlive = currentUser.isAlive;

  const handleVoteSelect = (targetId: string | null) => {
    if (!isAlive) return;
    setSelectedTargetId(targetId);
    onCastVote(targetId);
  };



  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-dark-800 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              ROUND {session.currentRound} • SECRET ELIMINATION VOTE
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono">
            Cast Your Elimination Vote
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Votes are hidden until tallying reveal. The player receiving the plurality of votes will be eliminated.
          </p>
        </div>

        <PhaseTimer
          endsAt={session.phaseEndsAt}
          onTimerExpired={onTimerExpired}
          label="VOTING CLOSES"
        />
      </div>

      {/* Dead Player Spectator Banner */}
      {!isAlive && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 font-mono text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>You have been eliminated! You are observing the voting phase in spectator mode.</span>
        </div>
      )}

      {/* Target Player Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {alivePlayers.map(p => {
          const isSelf = p.id === currentUser.id;
          const isSelected = selectedTargetId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => !isSelf && handleVoteSelect(p.id)}
              className={`p-5 rounded-2xl border transition-all ${
                isSelf
                  ? 'bg-dark-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-purple-950/50 border-purple-500 shadow-xl shadow-purple-950/50 ring-2 ring-purple-500 cursor-pointer scale-105'
                  : 'bg-dark-800 border-slate-800 hover:border-slate-700 cursor-pointer hover:scale-102'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${p.avatarColor} text-white font-bold flex items-center justify-center text-base shadow-md font-mono`}>
                  {p.displayName.charAt(0).toUpperCase()}
                </div>

                {isSelected && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> VOTED
                  </span>
                )}
              </div>

              <h3 className="font-bold font-mono text-slate-100 text-sm flex items-center gap-1.5">
                {p.displayName}
                {isSelf && <span className="text-[10px] text-slate-500 font-normal">(You)</span>}
              </h3>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Suspicion Score:</span>
                <span className="font-bold text-amber-400">{p.stats.suspicionScore}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Abstain Option */}
      {isAlive && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => handleVoteSelect(null)}
            className={`px-6 py-2.5 rounded-xl border font-mono text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedTargetId === null
                ? 'bg-slate-700 text-white border-slate-500 shadow-lg'
                : 'bg-dark-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Abstain / Skip Vote</span>
          </button>
        </div>
      )}
    </div>
  );
};
