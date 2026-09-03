// Security & Access Assertion Test Suite for Code Mafia
// Verifies Security Document Specifications §1, §2.2, §3, and §4

import {
  createInitialSession,
  assignRoles,
  startWorkRound,
  startVoting,
  sanitizeSessionForPlayer,
  handlePlayerDisconnect,
  evaluateWinConditions
} from '../src/services/gameEngine.ts';
import { jsAuthServicePack } from '../src/contentPacks/jsAuthService.ts';

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

// SETUP: Create a 6-player session (2 Mafia, 4 Devs)
const config = {
  packId: 'js-auth-service-v1',
  playerCount: 6,
  mafiaCount: 2,
  workRoundSec: 180,
  discSec: 90,
  votingSec: 45,
  maxRounds: 3
};

let session = createInitialSession(config, 'Host_SecUser');
session.contentPack = jsAuthServicePack;

// Add 5 bot players
for (let i = 1; i < 6; i++) {
  session.players.push({
    id: `p-${i}`,
    displayName: `Player_${i}`,
    isAlive: true,
    isHost: false,
    isBot: true,
    isReady: true,
    avatarColor: 'bg-blue-600',
    stats: { bugsFixed: 0, testsRun: 0, votesCast: 0, suspicionScore: 0 }
  });
}

// Assign Roles
session = assignRoles(session);
session = startWorkRound(session);

const devs = session.players.filter(p => p.role === 'DEVELOPER');
const mafias = session.players.filter(p => p.role === 'MAFIA');

const firstDev = devs[0];
const firstMafia = mafias[0];

// TEST 1: Developer Payload Zero-Leak Secrecy
const devSanitized = sanitizeSessionForPlayer(session, firstDev.id);
const exposedOpponentRoles = devSanitized.players.filter(p => p.id !== firstDev.id && p.role !== undefined);

assert(
  exposedOpponentRoles.length === 0,
  'TEST 1: Developer Payload Role Isolation Guard',
  `Found ${exposedOpponentRoles.length} leaked opponent roles in Developer payload!`
);

// TEST 2: Mafia Payload Teammate Visibility
const mafiaSanitized = sanitizeSessionForPlayer(session, firstMafia.id);
const visibleMafias = mafiaSanitized.players.filter(p => p.role === 'MAFIA');

assert(
  visibleMafias.length === mafias.length,
  'TEST 2: Mafia Payload Teammate Authorization',
  `Mafia payload contained ${visibleMafias.length} Mafia identities, expected ${mafias.length}`
);

// TEST 3: Active Voting Secret Votes Masking
session = startVoting(session);
session.votes[firstDev.id] = firstMafia.id; // Dev votes for Mafia
session.votes[firstMafia.id] = firstDev.id; // Mafia votes for Dev

const devVotingSanitized = sanitizeSessionForPlayer(session, firstDev.id);
const devCanSeeMafiaVote = devVotingSanitized.votes[firstMafia.id] !== undefined;

assert(
  !devCanSeeMafiaVote,
  'TEST 3: Secret Vote Privacy Guard During Active Round',
  'Developer payload contained opponent vote before round closure!'
);

// TEST 4: Auto-Abstain Disconnection Guard
const activePlayerToDrop = devs[1].id;
const postDisconnectSession = handlePlayerDisconnect(session, activePlayerToDrop);
const autoAbstainVote = postDisconnectSession.votes[activePlayerToDrop];

assert(
  autoAbstainVote === null,
  'TEST 4: Disconnection Auto-Abstain Guard',
  `Disconnected player vote was ${autoAbstainVote}, expected null (auto-abstain)`
);

// TEST 5: Full Role Reveal at Game Finale (RESULTS Phase)
let endSession = { ...session, phase: 'RESULTS', winner: 'DEVELOPERS' };
const finaleSanitized = sanitizeSessionForPlayer(endSession, firstDev.id);
const unrevealedAtFinale = finaleSanitized.players.filter(p => p.role === undefined);

assert(
  unrevealedAtFinale.length === 0,
  'TEST 5: Full Role Reveal at Game Finale (RESULTS Phase)',
  `${unrevealedAtFinale.length} roles remained hidden at match finale!`
);

console.log('\n====================================================');
console.log(`RESULTS: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================\n');

if (failCount > 0) {
  process.exit(1);
}
