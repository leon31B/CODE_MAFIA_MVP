import React, { useState } from 'react';
import { GameSession, Player } from '../types/game';
import { FileTree } from '../components/FileTree';
import { CodeEditor } from '../components/CodeEditor';
import { TestRunnerPanel } from '../components/TestRunnerPanel';
import { ActivityFeed } from '../components/ActivityFeed';
import { ChatPanel } from '../components/ChatPanel';
import { PhaseTimer } from '../components/PhaseTimer';
import { ArrowRight } from 'lucide-react';

interface WorkRoundPageProps {
  session: GameSession;
  currentUser: Player;
  onCodeChange: (filePath: string, newContent: string) => void;
  onRunTests: () => void;
  isTestRunning: boolean;
  onSendMessage: (text: string, isMafiaOnly?: boolean) => void;
  onAdvanceToDiscussion: () => void;
}

export const WorkRoundPage: React.FC<WorkRoundPageProps> = ({
  session,
  currentUser,
  onCodeChange,
  onRunTests,
  isTestRunning,
  onSendMessage,
  onAdvanceToDiscussion
}) => {
  const [activeFilePath, setActiveFilePath] = useState(session.activeFilePath);
  const [mobileTab, setMobileTab] = useState<'editor' | 'tests' | 'feed' | 'chat'>('editor');

  const activeFile = session.files.find(f => f.path === activeFilePath) || session.files[0];
  const latestRun = session.testRuns[session.testRuns.length - 1] || null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-dark-950 overflow-hidden">
      {/* Work Round Status Header */}
      <div className="h-12 bg-dark-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
            ROUND {session.currentRound} • WORK PHASE
          </span>

          <PhaseTimer
            endsAt={session.phaseEndsAt}
            onTimerExpired={onAdvanceToDiscussion}
            label="WORK TIMER"
          />
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden bg-dark-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => setMobileTab('editor')}
            className={`px-2 py-0.5 rounded ${mobileTab === 'editor' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Editor
          </button>
          <button
            onClick={() => setMobileTab('tests')}
            className={`px-2 py-0.5 rounded ${mobileTab === 'tests' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Tests
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-2 py-0.5 rounded ${mobileTab === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Chat
          </button>
        </div>

        {/* Host Advance Button */}
        {currentUser.isHost && (
          <button
            onClick={onAdvanceToDiscussion}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/60 text-xs font-mono font-semibold transition-colors"
          >
            <span>Proceed to Discussion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Workspace Split Screen */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* File Tree (Desktop) */}
        <div className="hidden lg:block shrink-0">
          <FileTree
            files={session.files}
            activeFilePath={activeFilePath}
            onSelectFile={setActiveFilePath}
          />
        </div>

        {/* Code Editor */}
        <div className={`flex-1 flex flex-col ${mobileTab === 'editor' ? 'flex' : 'hidden md:flex'}`}>
          <CodeEditor
            file={activeFile}
            onChange={(newContent) => onCodeChange(activeFile.path, newContent)}
            activePlayers={session.players.filter(p => p.isAlive)}
            readOnly={!currentUser.isAlive}
          />

          {/* Activity Feed Bar at Bottom of Editor */}
          <ActivityFeed events={session.activityFeed} />
        </div>

        {/* Test Runner Panel */}
        <div className={`${mobileTab === 'tests' ? 'flex w-full' : 'hidden md:flex'} shrink-0`}>
          <TestRunnerPanel
            onRunTests={onRunTests}
            isRunning={isTestRunning}
            latestRun={latestRun}
            testSuite={session.contentPack.testSuite}
            canRun={currentUser.isAlive}
          />
        </div>

        {/* Chat Panel */}
        <div className={`${mobileTab === 'chat' ? 'flex w-full' : 'hidden xl:flex'} shrink-0`}>
          <ChatPanel
            messages={session.chatMessages}
            currentUser={currentUser}
            onSendMessage={onSendMessage}
          />
        </div>
      </div>
    </div>
  );
};
