import React from 'react';
import { Player } from '../types/game';
import { Shield, Skull, CheckCircle } from 'lucide-react';

interface RoleRevealModalProps {
  currentUser: Player;
  allPlayers: Player[];
  onAcknowledge: () => void;
}

export const RoleRevealModal: React.FC<RoleRevealModalProps> = ({
  currentUser,
  allPlayers,
  onAcknowledge
}) => {
  const isMafia = currentUser.role === 'MAFIA';
  const mafiaTeammates = allPlayers.filter(p => p.role === 'MAFIA');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300 ${
        isMafia ? 'glass-panel-mafia' : 'glass-panel-dev'
      }`}>
        {/* Role Icon & Title */}
        <div className="space-y-3">
          <div className="inline-flex p-4 rounded-2xl bg-dark-900 border border-slate-700/80 shadow-xl">
            {isMafia ? (
              <Skull className="w-16 h-16 text-red-500 animate-pulse text-glow-red" />
            ) : (
              <Shield className="w-16 h-16 text-blue-400 text-glow-blue" />
            )}
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
            SECRET ROLE ASSIGNMENT
          </span>

          <h2 className={`text-3xl font-extrabold tracking-tight font-mono ${
            isMafia ? 'text-red-500 text-glow-red' : 'text-blue-400 text-glow-blue'
          }`}>
            YOU ARE {isMafia ? 'MAFIA' : 'A DEVELOPER'}
          </h2>
        </div>

        {/* Role Description */}
        <p className="text-sm text-slate-300 leading-relaxed font-mono">
          {isMafia ? (
            'Your objective is to covertly introduce bugs, alter priority logic, and prevent tests from passing — while deflecting suspicion during discussion and voting rounds!'
          ) : (
            'Your objective is to collaborate with teammates, debug the flawed codebase, pass 100% of unit tests, and vote out the hidden Mafia saboteurs!'
          )}
        </p>

        {/* Mafia Teammate Reveal (Secret for Mafia only) */}
        {isMafia && (
          <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-xl space-y-2 text-left">
            <span className="text-xs font-mono font-bold text-red-400 uppercase block">
              FELLOW MAFIA TEAMMATES ({mafiaTeammates.length}):
            </span>
            <div className="space-y-1">
              {mafiaTeammates.map(m => (
                <div key={m.id} className="text-xs font-mono text-slate-200 flex items-center gap-2">
                  <Skull className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-semibold">{m.displayName}</span>
                  {m.id === currentUser.id && <span className="text-slate-400 text-[10px]">(You)</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onAcknowledge}
          className={`w-full py-3.5 rounded-xl font-bold font-mono text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 ${
            isMafia
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white shadow-red-950'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 text-white shadow-blue-950'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>I Understand My Role — Begin Round 1</span>
        </button>
      </div>
    </div>
  );
};
