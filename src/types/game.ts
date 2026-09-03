export type Role = 'DEVELOPER' | 'MAFIA' | 'SPECTATOR';

export type Phase = 
  | 'DASHBOARD'
  | 'CONFIG_WIZARD'
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'WORK_ROUND'
  | 'DISCUSSION'
  | 'VOTING'
  | 'ELIMINATION'
  | 'RESULTS'
  | 'HISTORY'
  | 'ADMIN_PACKS';

export type TransparencyLevel = 'FULL' | 'DIFF_ONLY' | 'ANONYMIZED';
export type TieRule = 'NO_ELIMINATION' | 'RUNOFF';

export interface Player {
  id: string;
  displayName: string;
  role?: Role;
  isAlive: boolean;
  isHost: boolean;
  isBot: boolean;
  isReady: boolean;
  avatarColor: string;
  stats: {
    bugsFixed: number;
    testsRun: number;
    votesCast: number;
    suspicionScore: number; // 0 to 100
  };
}

export interface GameConfig {
  packId: string;
  playerCount: number; // 5 - 12
  mafiaCount: number;  // 1 - 4
  workRoundSeconds: number; // e.g. 180 (3m)
  discussionSeconds: number; // e.g. 90 (1.5m)
  votingSeconds: number; // e.g. 45
  transparencyLevel: TransparencyLevel;
  tieRule: TieRule;
  passRateThreshold: number; // e.g. 100%
  maxRounds: number; // e.g. 3 or 4 rounds
}

export interface ContentFile {
  path: string;
  name: string;
  language: 'javascript' | 'typescript' | 'python';
  initialContent: string;
  currentContent: string;
  readOnly?: boolean;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  isHidden: boolean;
  status?: 'PASS' | 'FAIL' | 'ERROR' | 'PENDING';
  durationMs?: number;
  errorMessage?: string;
}

export interface ContentPack {
  id: string;
  name: string;
  description: string;
  language: 'javascript' | 'python';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  minPlayers: number;
  maxPlayers: number;
  estDurationMinutes: number;
  files: ContentFile[];
  testSuite: TestCase[];
  referenceSolution: Record<string, string>; // path -> correct code
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  playerId: string;
  playerName: string;
  type: 'EDIT' | 'TEST_RUN' | 'VOTE' | 'REVERT' | 'SYSTEM';
  filePath?: string;
  details: string;
  diffSummary?: string;
}

export interface TestRunResult {
  id: string;
  timestamp: string;
  triggeredByPlayerId: string;
  triggeredByPlayerName: string;
  passedCount: number;
  failedCount: number;
  totalCount: number;
  tests: TestCase[];
  durationMs: number;
  errorExcerpt?: string;
}

export interface VoteRecord {
  voterId: string;
  voterName: string;
  targetId: string | null; // null = abstain
  roundNumber: number;
}

export interface EliminationRecord {
  roundNumber: number;
  eliminatedPlayerId: string | null;
  eliminatedPlayerName: string | null;
  eliminatedPlayerRole: Role | null;
  voteTally: Record<string, number>; // playerId -> count
  wasTie: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  text: string;
  isSystem?: boolean;
  isMafiaOnly?: boolean;
}

export interface GameSession {
  id: string;
  joinCode: string;
  config: GameConfig;
  phase: Phase;
  currentRound: number;
  players: Player[];
  activeFilePath: string;
  files: ContentFile[];
  contentPack: ContentPack;
  activityFeed: ActivityEvent[];
  testRuns: TestRunResult[];
  votes: Record<string, string | null>; // voterId -> targetId
  eliminationHistory: EliminationRecord[];
  chatMessages: ChatMessage[];
  phaseEndsAt: number; // Unix timestamp ms
  winner: 'DEVELOPERS' | 'MAFIA' | null;
  winReason?: string;
}

export interface GameHistoryItem {
  id: string;
  date: string;
  packName: string;
  language: string;
  playerCount: number;
  mafiaCount: number;
  winner: 'DEVELOPERS' | 'MAFIA';
  durationMinutes: number;
  roundsCount: number;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  planTier: 'FREE' | 'TEAM' | 'ENTERPRISE';
  seatLimit: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  stripeCustomerId?: string;
  planTier: 'FREE' | 'TEAM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
  currentPeriodEnd: string;
}

export interface SandboxMetric {
  isolationMode: 'gVisor' | 'Firecracker' | 'Isolated-VM';
  memoryUsageMb: number;
  cpuCores: number;
  networkEgressBlocked: boolean;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

