import React, { useState, useEffect } from 'react';
import { GameSession, Player, GameConfig, Phase } from './types/game';
import {
  createInitialSession,
  assignRoles,
  startWorkRound,
  startDiscussion,
  startVoting,
  processElimination,
  evaluateWinConditions
} from './services/gameEngine';
import { executeTestSuite } from './services/sandbox/testRunner';
import { generateBotPlayers } from './services/botSim';
import { initSocketConnection, emitMultiplayerEvent, disconnectSocket } from './services/multiplayerSocket';

import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { GameConfigWizard } from './pages/GameConfigWizard';
import { LobbyPage } from './pages/LobbyPage';
import { RoleRevealModal } from './pages/RoleRevealModal';
import { WorkRoundPage } from './pages/WorkRoundPage';
import { DiscussionPage } from './pages/DiscussionPage';
import { VotingPage } from './pages/VotingPage';
import { EliminationModal } from './pages/EliminationModal';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPacksPage } from './pages/AdminPacksPage';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentPhase, setCurrentPhase] = useState<Phase>('DASHBOARD');
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Initialize socket listener for real-time multiplayer
  useEffect(() => {
    if (!session || !currentUser) return;

    initSocketConnection(session.id, currentUser, (event, data) => {
      if (event === 'CODE_UPDATED') {
        setSession(prev => {
          if (!prev) return null;
          const updatedFiles = prev.files.map(f =>
            f.path === data.filePath ? { ...f, currentContent: data.newContent } : f
          );
          return { ...prev, files: updatedFiles };
        });
      }

      if (event === 'TEST_RUN_COMPLETED') {
        setSession(prev => {
          if (!prev) return null;
          const newRuns = [...prev.testRuns, data.testRunResult];
          const updatedSession = { ...prev, testRuns: newRuns };
          return evaluateWinConditions(updatedSession);
        });
      }

      if (event === 'CHAT_RECEIVED') {
        setSession(prev => {
          if (!prev) return null;
          return { ...prev, chatMessages: [...prev.chatMessages, data.message] };
        });
      }

      if (event === 'VOTE_REGISTERED') {
        setSession(prev => {
          if (!prev) return null;
          return { ...prev, votes: { ...prev.votes, [data.voterId]: data.targetId } };
        });
      }
    });

    return () => disconnectSocket();
  }, [session?.id, currentUser?.id]);

  // Handler: Create Game
  const handleCreateGame = (config: GameConfig, hostName: string) => {
    const newSession = createInitialSession(config, hostName);
    setSession(newSession);
    setCurrentUser(newSession.players[0]); // Host player
    setCurrentPhase('LOBBY');
  };

  // Handler: Ready Up
  const handleToggleReady = () => {
    if (!session || !currentUser) return;
    const updatedPlayers = session.players.map(p =>
      p.id === currentUser.id ? { ...p, isReady: !p.isReady } : p
    );
    const updatedUser = { ...currentUser, isReady: !currentUser.isReady };
    setSession({ ...session, players: updatedPlayers });
    setCurrentUser(updatedUser);
  };

  // Handler: Add Bot Player
  const handleAddBotPlayer = () => {
    if (!session) return;
    const count = session.players.length;
    const newBot = generateBotPlayers(1, count + 1)[0];
    const updatedPlayers = [...session.players, newBot];
    setSession({ ...session, players: updatedPlayers });
  };

  // Handler: Start Game
  const handleStartGame = () => {
    if (!session) return;
    const sessionWithRoles = assignRoles(session);
    setSession(sessionWithRoles);
    // Find updated current user with role
    const updatedMe = sessionWithRoles.players.find(p => p.id === currentUser?.id) || currentUser;
    setCurrentUser(updatedMe);
    setCurrentPhase('ROLE_REVEAL');
  };

  // Handler: Acknowledge Role -> Start Round 1
  const handleAcknowledgeRole = () => {
    if (!session) return;
    const workSession = startWorkRound(session);
    setSession(workSession);
    setCurrentPhase('WORK_ROUND');
  };

  // Handler: Code Edit in Monaco
  const handleCodeChange = (filePath: string, newContent: string) => {
    if (!session || !currentUser) return;
    const updatedFiles = session.files.map(f =>
      f.path === filePath ? { ...f, currentContent: newContent } : f
    );

    const editEvent = {
      id: `edit-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      playerId: currentUser.id,
      playerName: currentUser.displayName,
      type: 'EDIT' as const,
      filePath,
      details: `Edited ${filePath.split('/').pop()}`
    };

    setSession({
      ...session,
      files: updatedFiles,
      activityFeed: [...session.activityFeed, editEvent]
    });

    emitMultiplayerEvent('CODE_EDIT', {
      roomId: session.id,
      filePath,
      newContent,
      playerId: currentUser.id,
      playerName: currentUser.displayName
    });
  };

  // Handler: Run Unit Test Suite
  const handleRunTests = async () => {
    if (!session || !currentUser || isTestRunning) return;
    setIsTestRunning(true);

    const testRunResult = await executeTestSuite(
      session.contentPack,
      session.files,
      { id: currentUser.id, name: currentUser.displayName }
    );

    setIsTestRunning(false);

    const runEvent = {
      id: `run-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      playerId: currentUser.id,
      playerName: currentUser.displayName,
      type: 'TEST_RUN' as const,
      details: `Executed test suite: ${testRunResult.passedCount}/${testRunResult.totalCount} passed`
    };

    const updatedSession: GameSession = {
      ...session,
      testRuns: [...session.testRuns, testRunResult],
      activityFeed: [...session.activityFeed, runEvent]
    };

    // Check win condition
    const evaluatedSession = evaluateWinConditions(updatedSession);
    setSession(evaluatedSession);

    if (evaluatedSession.phase === 'RESULTS') {
      setCurrentPhase('RESULTS');
    }

    emitMultiplayerEvent('TRIGGER_TEST_RUN', {
      roomId: session.id,
      testRunResult
    });
  };

  // Handler: Send Chat
  const handleSendMessage = (text: string, isMafiaOnly?: boolean) => {
    if (!session || !currentUser) return;
    const msg = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      isMafiaOnly
    };

    setSession({
      ...session,
      chatMessages: [...session.chatMessages, msg]
    });

    emitMultiplayerEvent('SEND_CHAT', { roomId: session.id, message: msg });
  };

  // Handler: Advance to Discussion
  const handleAdvanceToDiscussion = () => {
    if (!session) return;
    const discSession = startDiscussion(session);
    setSession(discSession);
    setCurrentPhase('DISCUSSION');
  };

  // Handler: Advance to Voting
  const handleAdvanceToVoting = () => {
    if (!session) return;
    const votingSession = startVoting(session);
    setSession(votingSession);
    setCurrentPhase('VOTING');
  };

  // Handler: Cast Vote
  const handleCastVote = (targetPlayerId: string | null) => {
    if (!session || !currentUser) return;
    const updatedVotes = { ...session.votes, [currentUser.id]: targetPlayerId };

    const voteEvent = {
      id: `vote-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      playerId: currentUser.id,
      playerName: currentUser.displayName,
      type: 'VOTE' as const,
      details: `Cast elimination vote`
    };

    setSession({
      ...session,
      votes: updatedVotes,
      activityFeed: [...session.activityFeed, voteEvent]
    });

    emitMultiplayerEvent('CAST_VOTE', {
      roomId: session.id,
      voterId: currentUser.id,
      targetId: targetPlayerId
    });
  };

  // Handler: Tally Vote -> Process Elimination
  const handleProcessElimination = () => {
    if (!session) return;
    const elimSession = processElimination(session);
    setSession(elimSession);
    setCurrentPhase(elimSession.phase);
  };

  // Handler: Continue after Elimination
  const handleContinueAfterElimination = () => {
    if (!session) return;
    if (session.phase === 'RESULTS') {
      setCurrentPhase('RESULTS');
    } else {
      // Start next Work Round
      const nextRoundSession: GameSession = {
        ...session,
        currentRound: session.currentRound + 1
      };
      const workSession = startWorkRound(nextRoundSession);
      setSession(workSession);
      setCurrentPhase('WORK_ROUND');
    }
  };

  // Handler: Play Again
  const handlePlayAgain = () => {
    if (!session || !currentUser) return;
    // Re-initialize with same config
    handleCreateGame(session.config, currentUser.displayName);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        session={session}
        currentUser={currentUser}
        onLeaveGame={() => { setSession(null); setCurrentPhase('DASHBOARD'); }}
        onNavigateHome={() => setCurrentPhase('DASHBOARD')}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
      />

      <main className="flex-1">
        {currentPhase === 'DASHBOARD' && (
          <DashboardPage
            onNewGame={() => setCurrentPhase('CONFIG_WIZARD')}
            onViewHistory={() => setCurrentPhase('HISTORY')}
            onViewAdminPacks={() => setCurrentPhase('ADMIN_PACKS')}
          />
        )}

        {currentPhase === 'CONFIG_WIZARD' && (
          <GameConfigWizard
            onCancel={() => setCurrentPhase('DASHBOARD')}
            onCreateGame={handleCreateGame}
          />
        )}

        {currentPhase === 'LOBBY' && session && currentUser && (
          <LobbyPage
            session={session}
            currentUser={currentUser}
            onToggleReady={handleToggleReady}
            onAddBotPlayer={handleAddBotPlayer}
            onStartGame={handleStartGame}
          />
        )}

        {currentPhase === 'ROLE_REVEAL' && session && currentUser && (
          <RoleRevealModal
            currentUser={currentUser}
            allPlayers={session.players}
            onAcknowledge={handleAcknowledgeRole}
          />
        )}

        {currentPhase === 'WORK_ROUND' && session && currentUser && (
          <WorkRoundPage
            session={session}
            currentUser={currentUser}
            onCodeChange={handleCodeChange}
            onRunTests={handleRunTests}
            isTestRunning={isTestRunning}
            onSendMessage={handleSendMessage}
            onAdvanceToDiscussion={handleAdvanceToDiscussion}
          />
        )}

        {currentPhase === 'DISCUSSION' && session && currentUser && (
          <DiscussionPage
            session={session}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onAdvanceToVoting={handleAdvanceToVoting}
          />
        )}

        {currentPhase === 'VOTING' && session && currentUser && (
          <VotingPage
            session={session}
            currentUser={currentUser}
            onCastVote={handleCastVote}
            onTimerExpired={handleProcessElimination}
          />
        )}

        {currentPhase === 'ELIMINATION' && session && (
          <EliminationModal
            session={session}
            onContinue={handleContinueAfterElimination}
          />
        )}

        {currentPhase === 'RESULTS' && session && (
          <ResultsPage
            session={session}
            onPlayAgain={handlePlayAgain}
            onNavigateHome={() => { setSession(null); setCurrentPhase('DASHBOARD'); }}
          />
        )}

        {currentPhase === 'HISTORY' && (
          <HistoryPage onBack={() => setCurrentPhase('DASHBOARD')} />
        )}

        {currentPhase === 'ADMIN_PACKS' && (
          <AdminPacksPage onBack={() => setCurrentPhase('DASHBOARD')} />
        )}
      </main>
    </div>
  );
};
