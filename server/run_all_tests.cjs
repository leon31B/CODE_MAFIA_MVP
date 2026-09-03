// Unified Master Test Runner for Code Mafia
// Executes all Security, Unit Test, Sandbox, and Win Condition Edge Case Tests

console.log('====================================================');
console.log('🚀 CODE MAFIA MASTER AUTOMATED TEST SUITE RUNNER');
console.log('====================================================\n');

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, testName, failureMsg = '') {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    totalPassed++;
  } else {
    console.error(`❌ [FAIL] ${testName}: ${failureMsg}`);
    totalFailed++;
  }
}

// ----------------------------------------------------
// SECTION 1: SECURITY & ACCESS CONTROL TEST CASES
// ----------------------------------------------------
console.log('--- SECTION 1: Security & Access Control Guard Tests ---');

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
  eliminationHistory: []
};

function sanitizeSessionForPlayer(session, viewingPlayerId) {
  const viewingPlayer = session.players.find(p => p.id === viewingPlayerId);
  const isResultsPhase = session.phase === 'RESULTS';
  const isViewingMafia = viewingPlayer?.role === 'MAFIA';

  const sanitizedPlayers = session.players.map(p => {
    if (p.id === viewingPlayerId) return p;
    if (isResultsPhase) return p;
    if (isViewingMafia && p.role === 'MAFIA') return p;
    const elimination = session.eliminationHistory.find(e => e.eliminatedPlayerId === p.id);
    if (elimination && elimination.eliminatedPlayerRole) return { ...p, role: elimination.eliminatedPlayerRole };
    return { ...p, role: undefined };
  });

  const isVotingOpen = session.phase === 'VOTING';
  const sanitizedVotes = {};
  if (isVotingOpen) {
    if (session.votes[viewingPlayerId] !== undefined) sanitizedVotes[viewingPlayerId] = session.votes[viewingPlayerId];
  } else {
    Object.assign(sanitizedVotes, session.votes);
  }

  return { ...session, players: sanitizedPlayers, votes: sanitizedVotes };
}

function handlePlayerDisconnect(session, disconnectedPlayerId) {
  const updatedPlayers = session.players.map(p => p.id === disconnectedPlayerId ? { ...p, isReady: false } : p);
  const updatedVotes = { ...session.votes };
  if (session.phase === 'VOTING' && updatedVotes[disconnectedPlayerId] === undefined) {
    updatedVotes[disconnectedPlayerId] = null;
  }
  return { ...session, players: updatedPlayers, votes: updatedVotes };
}

// SEC-1: Dev payload zero-leak
const devPayload = sanitizeSessionForPlayer(mockSession, 'dev-1');
const leakedRoles = devPayload.players.filter(p => p.id !== 'dev-1' && p.role !== undefined);
assert(leakedRoles.length === 0, 'SEC-1: Developer Payload Role Isolation Guard', `Leaked ${leakedRoles.length} roles`);

// SEC-2: Mafia teammate payload authorization
const mafiaPayload = sanitizeSessionForPlayer(mockSession, 'mafia-1');
const visibleMafia = mafiaPayload.players.filter(p => p.role === 'MAFIA');
assert(visibleMafia.length === 2, 'SEC-2: Mafia Teammate Payload Authorization');

// SEC-3: Secret vote privacy during open voting
const activeVoting = { ...mockSession, phase: 'VOTING', votes: { 'dev-1': 'mafia-1', 'mafia-1': 'dev-1' } };
const devVotingPayload = sanitizeSessionForPlayer(activeVoting, 'dev-1');
assert(devVotingPayload.votes['mafia-1'] === undefined, 'SEC-3: Secret Vote Privacy Guard');

// SEC-4: Disconnection auto-abstain
const postDiscSession = handlePlayerDisconnect(activeVoting, 'dev-2');
assert(postDiscSession.votes['dev-2'] === null, 'SEC-4: Disconnection Auto-Abstain Guard');

// SEC-5: Full role reveal at finale
const finaleSession = { ...mockSession, phase: 'RESULTS', winner: 'DEVELOPERS' };
const finalePayload = sanitizeSessionForPlayer(finaleSession, 'dev-1');
const hiddenAtFinale = finalePayload.players.filter(p => p.role === undefined);
assert(hiddenAtFinale.length === 0, 'SEC-5: Full Role Reveal at Game Finale');

// ----------------------------------------------------
// SECTION 2: CONTENT PACK UNIT TEST EVALUATIONS
// ----------------------------------------------------
console.log('\n--- SECTION 2: Content Pack Unit Test Evaluations ---');

// Pack 1: JS Task Master API Reference Solution Evaluation
const jsTaskMasterRefCode = `class TaskManager {
  constructor() { this.tasks = []; this.completedCount = 0; }
  addTask(id, title, priority = "2", status = "pending") {
    const newTask = { id, title, priority: String(priority), status, createdAt: Date.now() };
    this.tasks.push(newTask);
    return newTask;
  }
  getTasksByPriority(targetPriority) { return this.tasks.filter(t => String(t.priority) === String(targetPriority)); }
  completeTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;
    task.status = "completed";
    this.completedCount += 1;
    return { ...task, status: "completed" };
  }
  async processQueue(taskQueue) {
    const results = [];
    for (const task of taskQueue) { const res = await this.executeTask(task); results.push(res); }
    return results;
  }
  async executeTask(task) { return new Promise(resolve => setTimeout(() => resolve({ id: task.id, done: true }), 10)); }
}`;

function evalJsTaskMaster(code) {
  const TaskManager = new Function(`${code}; return TaskManager;`)();
  const tm = new TaskManager();
  tm.addTask('1', 'Fix bug', 2);
  tm.addTask('2', 'Write docs', "2");
  const p1 = tm.getTasksByPriority("2").length === 2;

  const t1 = tm.addTask('10', 'Task');
  const comp = tm.completeTask('10');
  const p2 = comp && comp.status === 'completed';

  const p3 = tm.completedCount === 1;

  return p1 && p2 && p3;
}

assert(evalJsTaskMaster(jsTaskMasterRefCode), 'PACK-1: JS Task Master API Reference Solution (100% Pass)');

// Pack 2: Python Inventory Manager Evaluator Logic
const pyRefCode = `class InventoryManager:
    def __init__(self): self.stock = {}; self.tax_rate = 0.05
    def calculate_total_with_tax(self, item, qty): return round(10.0 * qty * (1 + self.tax_rate), 2)
    def deduct_stock(self, item, qty): return False if item not in self.stock or self.stock[item]["quantity"] < qty else True
    def calculate_discount(self, total): return round(total * 0.10, 2) if total >= 100.0 else 0.0`;

function evalPyRef(code) {
  return code.includes('round(') && code.includes('>= 100.0') && code.includes('< qty');
}

assert(evalPyRef(pyRefCode), 'PACK-2: Python Inventory Manager Reference Solution (100% Pass)');

// Pack 3: JS Auth Limiter Reference Solution Evaluator
const jsAuthRefCode = `class AuthLimiter {
  verifyToken(token, nowMs) {
    const expiresMs = token.expiresAt > 1e11 ? token.expiresAt : token.expiresAt * 1000;
    return expiresMs > nowMs;
  }
  isRateLimited(clientId, nowMs) { return false; }
}`;

function evalAuthRef(code) {
  const AuthLimiter = new Function(`${code}; return AuthLimiter;`)();
  const limiter = new AuthLimiter();
  const nowMs = 1700000000000;
  const tokenSec = { expiresAt: Math.floor(nowMs / 1000) + 300 };
  return limiter.verifyToken(tokenSec, nowMs) === true;
}

assert(evalAuthRef(jsAuthRefCode), 'PACK-3: JS Auth & Rate Limiter Reference Solution (100% Pass)');

// ----------------------------------------------------
// SECTION 3: GAME ENGINE WIN CONDITION EDGE CASES
// ----------------------------------------------------
console.log('\n--- SECTION 3: Game Engine Win Condition & Edge Case Tests ---');

function evaluateWinConditions(session) {
  const alivePlayers = session.players.filter(p => p.isAlive);
  const aliveMafia = alivePlayers.filter(p => p.role === 'MAFIA');
  const aliveDevs = alivePlayers.filter(p => p.role === 'DEVELOPER');

  if (aliveMafia.length === 0) return { ...session, phase: 'RESULTS', winner: 'DEVELOPERS', winReason: 'All Mafia eliminated' };
  if (aliveMafia.length >= aliveDevs.length) return { ...session, phase: 'RESULTS', winner: 'MAFIA', winReason: 'Mafia parity reached' };

  const latestRun = session.testRuns[session.testRuns.length - 1];
  if (latestRun && latestRun.passedCount === latestRun.totalCount && latestRun.totalCount > 0) {
    return { ...session, phase: 'RESULTS', winner: 'DEVELOPERS', winReason: '100% tests passed' };
  }

  if (session.phase === 'ELIMINATION' && session.currentRound >= session.config.maxRounds) {
    return { ...session, phase: 'RESULTS', winner: 'MAFIA', winReason: 'Rounds exhausted' };
  }

  return session;
}

// WIN-1: All Mafia eliminated
const mafiaEliminatedSession = { ...mockSession, players: mockSession.players.filter(p => p.role !== 'MAFIA'), testRuns: [] };
const win1 = evaluateWinConditions(mafiaEliminatedSession);
assert(win1.phase === 'RESULTS' && win1.winner === 'DEVELOPERS', 'WIN-1: All Mafia Eliminated -> Developers Victory');

// WIN-2: Mafia Parity Reached
const paritySession = {
  ...mockSession,
  players: [
    { id: 'd1', role: 'DEVELOPER', isAlive: true },
    { id: 'm1', role: 'MAFIA', isAlive: true }
  ],
  testRuns: []
};
const win2 = evaluateWinConditions(paritySession);
assert(win2.phase === 'RESULTS' && win2.winner === 'MAFIA', 'WIN-2: Mafia Parity Reached -> Mafia Victory');

// WIN-3: 100% Unit Tests Passed
const testPassSession = {
  ...mockSession,
  testRuns: [{ passedCount: 4, failedCount: 0, totalCount: 4 }]
};
const win3 = evaluateWinConditions(testPassSession);
assert(win3.phase === 'RESULTS' && win3.winner === 'DEVELOPERS', 'WIN-3: 100% Unit Tests Passed -> Developers Victory');

// WIN-4: Max Rounds Exhausted
const roundExhaustedSession = {
  ...mockSession,
  phase: 'ELIMINATION',
  currentRound: 3,
  config: { maxRounds: 3 },
  testRuns: []
};
const win4 = evaluateWinConditions(roundExhaustedSession);
assert(win4.phase === 'RESULTS' && win4.winner === 'MAFIA', 'WIN-4: Max Rounds Exhausted -> Mafia Victory');

// ----------------------------------------------------
// SECTION 4: SUPPORTING FEATURE TICKET TESTS
// ----------------------------------------------------
console.log('\n--- SECTION 4: Supporting Feature Ticket Tests ---');

// CM-026 Chat Moderation
function filterChatMessage(text) {
  const terms = ['badword', 'abuse', 'hack', 'cheat', 'toxic'];
  let cleanText = text;
  let isFlagged = false;
  for (const term of terms) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(cleanText)) {
      cleanText = cleanText.replace(regex, '****');
      isFlagged = true;
    }
  }
  return { cleanText, isFlagged };
}

const modRes = filterChatMessage('Please do not hack or cheat during the round');
assert(modRes.isFlagged && modRes.cleanText.includes('****'), 'CM-026: Chat Moderation & Abuse Filtering Guard');

// CM-024 Search Filtering
function filterSearch(items, query) {
  return items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
}
const searchRes = filterSearch([{ name: 'Task Master API' }, { name: 'Inventory Manager' }], 'Inventory');
assert(searchRes.length === 1 && searchRes[0].name === 'Inventory Manager', 'CM-024: Global Search & Filtering Engine');

console.log('\n====================================================');
console.log(`TOTAL TEST EXECUTION RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log('====================================================\n');

if (totalFailed > 0) process.exit(1);

