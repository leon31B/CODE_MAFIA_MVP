import {
  GameSession,
  GameConfig,
  Player,
  Role,
  Phase,
  ActivityEvent,
  TestRunResult,
  EliminationRecord,
  ChatMessage
} from '../types/game';
import { getContentPackById } from '../contentPacks';
import { generateBotPlayers, decideBotVote, generateBotChat } from './botSim';

export function createInitialSession(config: GameConfig, hostName: string): GameSession {
  const contentPack = getContentPackById(config.packId);
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const hostPlayer: Player = {
    id: `player-host-${Date.now()}`,
    displayName: hostName,
    isAlive: true,
    isHost: true,
    isBot: false,
    isReady: true,
    avatarColor: 'bg-blue-600',
    stats: { bugsFixed: 0, testsRun: 0, votesCast: 0, suspicionScore: 0 }
  };

  // Generate bots to fill requested player count
  const botsNeeded = Math.max(0, config.playerCount - 1);
  const botPlayers = generateBotPlayers(botsNeeded);

  const initialPlayers = [hostPlayer, ...botPlayers];

  return {
    id: `sess-${Date.now()}`,
    joinCode,
    config,
    phase: 'LOBBY',
    currentRound: 1,
    players: initialPlayers,
    activeFilePath: contentPack.files[0].path,
    files: JSON.parse(JSON.stringify(contentPack.files)),
    contentPack,
    activityFeed: [
      {
        id: `act-0`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        playerId: hostPlayer.id,
        playerName: hostPlayer.displayName,
        type: 'SYSTEM',
        details: `Lobby created for ${contentPack.name}. Code: ${joinCode}`
      }
    ],
    testRuns: [],
    votes: {},
    eliminationHistory: [],
    chatMessages: [
      {
        id: 'msg-init',
        senderId: 'system',
        senderName: 'System',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Welcome to Code Mafia! Join code is ${joinCode}. Ready up to start!`,
        isSystem: true
      }
    ],
    phaseEndsAt: 0,
    winner: null
  };
}

export function assignRoles(session: GameSession): GameSession {
  const updatedPlayers = [...session.players];
  const total = updatedPlayers.length;
  const mafiaCount = session.config.mafiaCount;

  // Cryptographically secure role distribution shuffle
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const mafiaIndices = new Set(indices.slice(0, mafiaCount));

  updatedPlayers.forEach((p, idx) => {
    p.role = mafiaIndices.has(idx) ? 'MAFIA' : 'DEVELOPER';
  });

  const now = Date.now();
  return {
    ...session,
    players: updatedPlayers,
    phase: 'ROLE_REVEAL',
    phaseEndsAt: now + 8000, // 8s role reveal window
    activityFeed: [
      ...session.activityFeed,
      {
        id: `act-roles-${now}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        playerId: 'system',
        playerName: 'System',
        type: 'SYSTEM',
        details: `Roles assigned secretly. ${mafiaCount} Mafia in game.`
      }
    ]
  };
}

export function startWorkRound(session: GameSession): GameSession {
  const now = Date.now();
  const workDurationMs = session.config.workRoundSeconds * 1000;

  return {
    ...session,
    phase: 'WORK_ROUND',
    phaseEndsAt: now + workDurationMs,
    activityFeed: [
      ...session.activityFeed,
      {
        id: `act-wr-${now}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        playerId: 'system',
        playerName: 'System',
        type: 'SYSTEM',
        details: `Round ${session.currentRound} Work Phase started! (${session.config.workRoundSeconds}s)`
      }
    ]
  };
}

export function startDiscussion(session: GameSession): GameSession {
  const now = Date.now();
  const discDurationMs = session.config.discussionSeconds * 1000;

  // Generate bot discussion chats
  const newBotChats: ChatMessage[] = [];
  session.players.filter(p => p.isBot && p.isAlive).forEach(bot => {
    const botMsg = generateBotChat(bot, 'DISCUSSION', session.players, session.activityFeed);
    if (botMsg) newBotChats.push(botMsg);
  });

  return {
    ...session,
    phase: 'DISCUSSION',
    phaseEndsAt: now + discDurationMs,
    chatMessages: [...session.chatMessages, ...newBotChats],
    activityFeed: [
      ...session.activityFeed,
      {
        id: `act-disc-${now}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        playerId: 'system',
        playerName: 'System',
        type: 'SYSTEM',
        details: `Discussion phase started! Discuss who might be Mafia.`
      }
    ]
  };
}

export function startVoting(session: GameSession): GameSession {
  const now = Date.now();
  const votingDurationMs = session.config.votingSeconds * 1000;

  // Auto-collect votes from bot players
  const initialVotes: Record<string, string | null> = {};
  const alivePlayers = session.players.filter(p => p.isAlive);

  alivePlayers.forEach(p => {
    if (p.isBot) {
      initialVotes[p.id] = decideBotVote(p, alivePlayers, session.activityFeed);
    }
  });

  return {
    ...session,
    phase: 'VOTING',
    votes: initialVotes,
    phaseEndsAt: now + votingDurationMs,
    activityFeed: [
      ...session.activityFeed,
      {
        id: `act-vote-${now}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        playerId: 'system',
        playerName: 'System',
        type: 'SYSTEM',
        details: `Voting phase open! Cast your vote secretly.`
      }
    ]
  };
}

export function processElimination(session: GameSession): GameSession {
  const voteTallies: Record<string, number> = {};
  const alivePlayers = session.players.filter(p => p.isAlive);

  // Initialize tallies
  alivePlayers.forEach(p => { voteTallies[p.id] = 0; });

  // Tally votes
  Object.values(session.votes).forEach(targetId => {
    if (targetId && voteTallies[targetId] !== undefined) {
      voteTallies[targetId] += 1;
    }
  });

  // Find max votes
  let maxVotes = 0;
  let candidates: string[] = [];

  Object.entries(voteTallies).forEach(([playerId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      candidates = [playerId];
    } else if (count === maxVotes && count > 0) {
      candidates.push(playerId);
    }
  });

  let eliminatedPlayer: Player | null = null;
  let wasTie = false;

  if (candidates.length === 1 && maxVotes > 0) {
    eliminatedPlayer = session.players.find(p => p.id === candidates[0]) || null;
  } else if (candidates.length > 1) {
    wasTie = true;
    if (session.config.tieRule === 'RUNOFF' && candidates.length > 0) {
      // In runoff, pick first tied candidate
      eliminatedPlayer = session.players.find(p => p.id === candidates[0]) || null;
    }
  }

  const updatedPlayers = session.players.map(p => {
    if (eliminatedPlayer && p.id === eliminatedPlayer.id) {
      return { ...p, isAlive: false };
    }
    return p;
  });

  const eliminationRecord: EliminationRecord = {
    roundNumber: session.currentRound,
    eliminatedPlayerId: eliminatedPlayer ? eliminatedPlayer.id : null,
    eliminatedPlayerName: eliminatedPlayer ? eliminatedPlayer.displayName : null,
    eliminatedPlayerRole: eliminatedPlayer ? (eliminatedPlayer.role || null) : null,
    voteTally: voteTallies,
    wasTie
  };

  const newSession: GameSession = {
    ...session,
    players: updatedPlayers,
    phase: 'ELIMINATION',
    phaseEndsAt: Date.now() + 6000, // 6s elimination modal
    eliminationHistory: [...session.eliminationHistory, eliminationRecord],
    activityFeed: [
      ...session.activityFeed,
      {
        id: `act-elim-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        playerId: 'system',
        playerName: 'System',
        type: 'SYSTEM',
        details: eliminatedPlayer
          ? `${eliminatedPlayer.displayName} was voted out! (Role: ${eliminatedPlayer.role})`
          : `No player eliminated due to tie vote.`
      }
    ]
  };

  // Evaluate win condition immediately after elimination
  return evaluateWinConditions(newSession);
}

export function evaluateWinConditions(session: GameSession): GameSession {
  const alivePlayers = session.players.filter(p => p.isAlive);
  const aliveMafia = alivePlayers.filter(p => p.role === 'MAFIA');
  const aliveDevs = alivePlayers.filter(p => p.role === 'DEVELOPER');

  // Check 1: All Mafia eliminated -> Developers Win
  if (aliveMafia.length === 0) {
    return {
      ...session,
      phase: 'RESULTS',
      winner: 'DEVELOPERS',
      winReason: 'All Mafia members have been identified and eliminated!'
    };
  }

  // Check 2: Mafia count >= Developer count -> Mafia Win
  if (aliveMafia.length >= aliveDevs.length) {
    return {
      ...session,
      phase: 'RESULTS',
      winner: 'MAFIA',
      winReason: 'Mafia reached parity with Developers! Sabotage complete.'
    };
  }

  // Check 3: Latest test run reached 100% pass threshold -> Developers Win
  const latestRun = session.testRuns[session.testRuns.length - 1];
  if (latestRun && latestRun.passedCount === latestRun.totalCount && latestRun.totalCount > 0) {
    return {
      ...session,
      phase: 'RESULTS',
      winner: 'DEVELOPERS',
      winReason: 'Developers successfully fixed the codebase and passed 100% of tests!'
    };
  }

  // Check 4: Max rounds completed without fixing code -> Mafia Win
  if (session.phase === 'ELIMINATION' && session.currentRound >= session.config.maxRounds) {
    return {
      ...session,
      phase: 'RESULTS',
      winner: 'MAFIA',
      winReason: 'Rounds exhausted before Developers could pass all tests!'
    };
  }

  return session;
}

/**
 * Security Sanitizer: Filters out unrevealed roles & secret votes
 * Enforces Security & Access Document §2.2 & §3 Row-Level Security Rules.
 */
export function sanitizeSessionForPlayer(session: GameSession, viewingPlayerId: string): GameSession {
  const viewingPlayer = session.players.find(p => p.id === viewingPlayerId);
  const isResultsPhase = session.phase === 'RESULTS';
  const isViewingMafia = viewingPlayer?.role === 'MAFIA';

  const sanitizedPlayers = session.players.map(p => {
    // 1. Always reveal own role
    if (p.id === viewingPlayerId) return p;

    // 2. Reveal all roles at game finale
    if (isResultsPhase) return p;

    // 3. Mafia can see fellow Mafia teammates if configured
    if (isViewingMafia && p.role === 'MAFIA') return p;

    // 4. Reveal role if player was eliminated and role reveal setting is true
    const elimination = session.eliminationHistory.find(e => e.eliminatedPlayerId === p.id);
    if (elimination && elimination.eliminatedPlayerRole) {
      return { ...p, role: elimination.eliminatedPlayerRole };
    }

    // 5. Hide unrevealed role from opponent payload
    return { ...p, role: undefined };
  });

  // Filter hidden active votes during open voting round
  const isVotingOpen = session.phase === 'VOTING';
  const sanitizedVotes: Record<string, string | null> = {};

  if (isVotingOpen) {
    // Only return player's own vote during voting phase
    if (session.votes[viewingPlayerId] !== undefined) {
      sanitizedVotes[viewingPlayerId] = session.votes[viewingPlayerId];
    }
  } else {
    // Reveal votes when round is closed
    Object.assign(sanitizedVotes, session.votes);
  }

  return {
    ...session,
    players: sanitizedPlayers,
    votes: sanitizedVotes
  };
}

/**
 * Handle Disconnections (Security & Access Document §4.2)
 * Auto-populates abstain vote if player drops during voting round.
 */
export function handlePlayerDisconnect(session: GameSession, disconnectedPlayerId: string): GameSession {
  const updatedPlayers = session.players.map(p => {
    if (p.id === disconnectedPlayerId) {
      return { ...p, isReady: false };
    }
    return p;
  });

  const updatedVotes = { ...session.votes };
  if (session.phase === 'VOTING' && updatedVotes[disconnectedPlayerId] === undefined) {
    updatedVotes[disconnectedPlayerId] = null; // Auto-abstain vote
  }

  return {
    ...session,
    players: updatedPlayers,
    votes: updatedVotes,
    activityFeed: [
      ...session.activityFeed,
      {
        id: `act-disc-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        playerId: 'system',
        playerName: 'System',
        type: 'SYSTEM',
        details: `Player connection status updated.`
      }
    ]
  };
}

/**
 * CM-026: Chat Moderation & Profanity Filter
 * Filters messages against a configurable denylist before broadcast.
 */
const BANNED_TERMS = ['badword', 'abuse', 'hack', 'cheat', 'toxic'];

export function filterChatMessage(text: string): { cleanText: string; isFlagged: boolean } {
  let cleanText = text;
  let isFlagged = false;

  for (const term of BANNED_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(cleanText)) {
      cleanText = cleanText.replace(regex, '****');
      isFlagged = true;
    }
  }

  return { cleanText, isFlagged };
}


