// Security & Access Compliance Test Suite (CommonJS)

console.log('====================================================');
console.log('🛡️ CODE MAFIA SECURITY & ACCESS COMPLIANCE TEST SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, failureMsg) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${testName}: ${failureMsg}`);
    failCount++;
  }
}

// 1. Mock Game Session with 6 players (2 Mafia, 4 Devs)
const mockSession = {
  id: 'sess-sec-101',
  joinCode: 'SEC999',
  phase: 'WORK_ROUND',
  currentRound: 1,
  config: { packId: 'js-auth-service-v1', playerCount: 6, mafiaCount: 2, workRoundSec: 180, discSec: 90, votingSec: 45, maxRounds: 3 },
  players: [
    { id: 'dev-1', displayName: 'Dev_Alpha', role: 'DEVELOPER', isAlive: true },
    { id: 'dev-2', displayName: 'Dev_Beta', role: 'DEVELOPER', isAlive: true },
    { id: 'dev-3', displayName: 'Dev_Gamma', role: 'DEVELOPER', isAlive: true },
    { id: 'dev-4', displayName: 'Dev_Delta', role: 'DEVELOPER', isAlive: true },
    { id: 'mafia-1', displayName: 'Mafia_Shadow', role: 'MAFIA', isAlive: true },
    { id: 'mafia-2', displayName: 'Mafia_Ghost', role: 'MAFIA', isAlive: true }
  ],
  votes: {},
  eliminationHistory: [],
  activityFeed: []
};

// Security Sanitizer Implementation (from gameEngine.ts)
function sanitizeSessionForPlayer(session, viewingPlayerId) {
  const viewingPlayer = session.players.find(p => p.id === viewingPlayerId);
  const isResultsPhase = session.phase === 'RESULTS';
  const isViewingMafia = viewingPlayer?.role === 'MAFIA';

  const sanitizedPlayers = session.players.map(p => {
    if (p.id === viewingPlayerId) return p;
    if (isResultsPhase) return p;
    if (isViewingMafia && p.role === 'MAFIA') return p;

    const elimination = session.eliminationHistory.find(e => e.eliminatedPlayerId === p.id);
    if (elimination && elimination.eliminatedPlayerRole) {
      return { ...p, role: elimination.eliminatedPlayerRole };
    }

    return { ...p, role: undefined };
  });

  const isVotingOpen = session.phase === 'VOTING';
  const sanitizedVotes = {};

  if (isVotingOpen) {
    if (session.votes[viewingPlayerId] !== undefined) {
      sanitizedVotes[viewingPlayerId] = session.votes[viewingPlayerId];
    }
  } else {
    Object.assign(sanitizedVotes, session.votes);
  }

  return {
    ...session,
    players: sanitizedPlayers,
    votes: sanitizedVotes
  };
}

// Disconnect Resilience Handler (from gameEngine.ts)
function handlePlayerDisconnect(session, disconnectedPlayerId) {
  const updatedPlayers = session.players.map(p => {
    if (p.id === disconnectedPlayerId) return { ...p, isReady: false };
    return p;
  });

  const updatedVotes = { ...session.votes };
  if (session.phase === 'VOTING' && updatedVotes[disconnectedPlayerId] === undefined) {
    updatedVotes[disconnectedPlayerId] = null; // Auto-abstain vote
  }

  return {
    ...session,
    players: updatedPlayers,
    votes: updatedVotes
  };
}

// TEST 1: Developer Payload Zero-Leak Secrecy
const devSanitized = sanitizeSessionForPlayer(mockSession, 'dev-1');
const exposedOpponentRoles = devSanitized.players.filter(p => p.id !== 'dev-1' && p.role !== undefined);

assert(
  exposedOpponentRoles.length === 0,
  'TEST 1: Developer Payload Role Isolation Guard',
  `Found ${exposedOpponentRoles.length} leaked opponent roles in Developer payload!`
);

// TEST 2: Mafia Payload Teammate Authorization
const mafiaSanitized = sanitizeSessionForPlayer(mockSession, 'mafia-1');
const visibleMafias = mafiaSanitized.players.filter(p => p.role === 'MAFIA');

assert(
  visibleMafias.length === 2,
  'TEST 2: Mafia Payload Teammate Authorization',
  `Mafia payload contained ${visibleMafias.length} Mafia identities, expected 2`
);

// TEST 3: Secret Vote Privacy Guard During Active Round
const votingSession = { ...mockSession, phase: 'VOTING', votes: { 'dev-1': 'mafia-1', 'mafia-1': 'dev-1' } };
const devVotingSanitized = sanitizeSessionForPlayer(votingSession, 'dev-1');
const devCanSeeMafiaVote = devVotingSanitized.votes['mafia-1'] !== undefined;

assert(
  !devCanSeeMafiaVote,
  'TEST 3: Secret Vote Privacy Guard During Active Round',
  'Developer payload contained opponent vote before round closure!'
);

// TEST 4: Auto-Abstain Disconnection Guard
const postDisconnectSession = handlePlayerDisconnect(votingSession, 'dev-2');
const autoAbstainVote = postDisconnectSession.votes['dev-2'];

assert(
  autoAbstainVote === null,
  'TEST 4: Disconnection Auto-Abstain Guard',
  `Disconnected player vote was ${autoAbstainVote}, expected null (auto-abstain)`
);

// TEST 5: Full Role Reveal at Game Finale (RESULTS Phase)
const endSession = { ...mockSession, phase: 'RESULTS', winner: 'DEVELOPERS' };
const finaleSanitized = sanitizeSessionForPlayer(endSession, 'dev-1');
const unrevealedAtFinale = finaleSanitized.players.filter(p => p.role === undefined);

assert(
  unrevealedAtFinale.length === 0,
  'TEST 5: Full Role Reveal at Game Finale (RESULTS Phase)',
  `${unrevealedAtFinale.length} roles remained hidden at match finale!`
);

console.log('\n====================================================');
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================\n');

if (failCount > 0) {
  process.exit(1);
}
