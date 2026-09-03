import React, { useState } from 'react';
import { Shield, UserCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (user: { displayName: string; email?: string; isGuest: boolean; provider: 'google' | 'github' | 'guest' | 'password' }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthenticate }) => {
  const [authMode, setAuthMode] = useState<'options' | 'guest'>('options');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuth = (provider: 'google' | 'github') => {
    const dummyName = provider === 'google' ? 'DevUser (Google)' : 'Coder_Pro (GitHub)';
    onAuthenticate({
      displayName: dummyName,
      email: `${provider}_user@example.com`,
      isGuest: false,
      provider
    });
    onClose();
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Please enter a display name for your guest pass.');
      return;
    }
    onAuthenticate({
      displayName: guestName.trim(),
      isGuest: true,
      provider: 'guest'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-800 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-slate-100 font-mono">Authentication & Access</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-mono"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {authMode === 'options' && (
          <div className="space-y-3 font-mono text-xs">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold flex items-center justify-center gap-3 border border-slate-600 transition-all shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              onClick={() => handleOAuth('github')}
              className="w-full py-3 px-4 rounded-xl bg-dark-900 hover:bg-slate-900 text-slate-100 font-bold flex items-center justify-center gap-3 border border-slate-700 transition-all shadow-md"
            >
              <svg className="w-4 h-4 fill-current text-slate-200" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Sign in with GitHub</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase">Or Continue As</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <button
              onClick={() => setAuthMode('guest')}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-semibold flex items-center justify-center gap-2 border border-cyan-800/60 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Guest Pass (Single Session)</span>
            </button>
          </div>
        )}

        {authMode === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Guest Display Name</label>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="e.g. Alex_Guest"
                className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Guest passes expire automatically after match completion.
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('options')}
                className="px-3 py-2 text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg"
              >
                Join with Guest Pass
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
