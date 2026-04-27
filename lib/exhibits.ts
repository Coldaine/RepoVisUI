import { 
  Focus, 
  AlertTriangle, 
  GitBranch, 
  GitCommit, 
  History, 
  Layers, 
  LayoutGrid, 
  BookOpen, 
  Radar, 
  Network, 
  ScrollText 
} from 'lucide-react';

export type ExhibitStatus = 'macro' | 'deep';

export interface ExhibitArtifact {
  id: string;
  type: 'focus' | 'drift' | 'relationships' | 'timeline' | 'churn' | 'snapshot' | 'digest' | 'convention' | 'next' | 'dependency' | 'release' | 'proportion' | 'bar-chart' | 'policy-badge' | 'timeline-log' | 'network-stable';
  title: string;
  summary: string;
  narrative: string;
  agent: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'healthy';
  data: any;
}

export const MOCK_EXHIBITS: ExhibitArtifact[] = [
  {
    id: 'pattern-2',
    type: 'proportion',
    title: 'Self-Improving KB',
    summary: 'Document filtering efficiency.',
    narrative: 'The static filter drops a significant portion of documents before they reach the LLM, optimizing cost.',
    agent: 'KBAnalyzer',
    timestamp: '2026-04-20T10:00:00Z',
    severity: 'healthy',
    data: {
      totalIngested: 1000,
      droppedByFilter: 650,
      sentToLLM: 350
    }
  },
  {
    id: 'pattern-5',
    type: 'bar-chart',
    title: 'GitHub Agent Factory',
    summary: 'Merge rates across workflows.',
    narrative: 'Examining the success rates of various automated PR workflows.',
    agent: 'WorkflowTracker',
    timestamp: '2026-04-20T11:00:00Z',
    severity: 'warning',
    data: {
      workflows: [
        { name: 'Doc Updater', mergeRate: 1.0 },
        { name: 'Tech Writer', mergeRate: 0.85 },
        { name: 'Glossary', mergeRate: 0.72 },
        { name: 'Blog Audit', mergeRate: 0.90 },
        { name: 'Plan Cmd', mergeRate: 0.67 }
      ]
    }
  },
  {
    id: 'pattern-9',
    type: 'policy-badge',
    title: 'Hardened Devcontainer',
    summary: 'Binary security policy state.',
    narrative: 'The Devcontainer is running under a strict whitelist-only network policy.',
    agent: 'SecurityGuard',
    timestamp: '2026-04-20T12:00:00Z',
    severity: 'critical',
    data: {
      posture: 'Whitelist Only',
      isSecure: true
    }
  },
  {
    id: 'pattern-3',
    type: 'timeline-log',
    title: 'Three-Body Agent',
    summary: 'Agent execution cadence.',
    narrative: 'Shows the true intervals between the hourly, fixer, and board sync agents.',
    agent: 'Scheduler',
    timestamp: '2026-04-20T13:00:00Z',
    severity: 'warning',
    data: {
      events: [
        { title: 'Hourly', intervalHours: 1 },
        { title: 'Fixer', intervalHours: 4 },
        { title: 'Merger', intervalHours: 12 },
        { title: 'Board Sync', intervalHours: 24 },
        { title: 'Weekly', intervalHours: 168 }
      ]
    }
  },
  {
    id: 'pattern-7',
    type: 'network-stable',
    title: 'Agent Network',
    summary: 'Stable communication topology.',
    narrative: 'The communication graph between agents is fixed and semantically meaningful.',
    agent: 'TopologyMapper',
    timestamp: '2026-04-20T14:00:00Z',
    severity: 'healthy',
    data: {
      nodes: [
        { id: 'Cron', type: 'trigger', x: 10, y: 50 },
        { id: 'Bus', type: 'queue', x: 50, y: 50 },
        { id: 'Agent', type: 'worker', x: 90, y: 50 }
      ],
      links: [
        { source: 'Cron', target: 'Bus' },
        { source: 'Bus', target: 'Agent' }
      ]
    }
  },
  {
    id: 'focus-1',
    type: 'focus',
    title: 'src/db/pool.rs Optimization',
    summary: 'Active for 4.2h. Key entities: feat/mem-leak.',
    narrative: 'The agent detected a persistent focus on connection pooling logic. You have been iterating on the `acquire_timeout` parameter, likely addressing the memory leak reported in Issue #42.',
    agent: 'FocusTracker',
    timestamp: '2026-04-04T10:00:00Z',
    severity: 'healthy',
    data: {
      center: {
        name: 'src/db/pool.rs',
        commitFrequency: 12
      },
      satellites: [
        { name: 'src/db/connection.rs', coEditScore: 0.95, logEntries: ['Refactored connection lifecycle', 'Added timeout handling'] },
        { name: 'src/main.rs', coEditScore: 0.85, logEntries: ['Updated pool initialization'] },
        { name: 'Cargo.toml', coEditScore: 0.75, logEntries: ['Bumped sqlx version', 'Added tokio-postgres'] },
        { name: 'src/config.rs', coEditScore: 0.70, logEntries: ['Added pool size env vars'] },
        { name: 'tests/db_tests.rs', coEditScore: 0.65, logEntries: ['Added connection leak test'] },
        { name: 'src/error.rs', coEditScore: 0.60, logEntries: ['Added PoolExhausted error variant'] },
        { name: 'src/models/user.rs', coEditScore: 0.55, logEntries: ['Updated query to use new pool'] },
        { name: 'src/models/session.rs', coEditScore: 0.50, logEntries: ['Fixed session cleanup query'] },
        { name: 'docker-compose.yml', coEditScore: 0.45, logEntries: ['Increased max_connections for postgres'] },
        { name: 'README.md', coEditScore: 0.40, logEntries: ['Documented new pool config'] },
        { name: 'src/api/routes.rs', coEditScore: 0.35, logEntries: ['Passed pool to route handlers'] },
        { name: 'src/api/handlers/auth.rs', coEditScore: 0.30, logEntries: ['Used pool for user lookup'] },
        { name: 'src/utils/metrics.rs', coEditScore: 0.25, logEntries: ['Added pool active connection gauge'] },
        { name: 'src/utils/logger.rs', coEditScore: 0.20, logEntries: ['Added trace logs for pool acquisition'] },
        { name: 'migrations/20260401_init.sql', coEditScore: 0.15, logEntries: ['Initial schema'] },
        { name: 'src/db/mod.rs', coEditScore: 0.10, logEntries: ['Exported pool module'] },
        { name: 'tests/api_tests.rs', coEditScore: 0.08, logEntries: ['Updated test setup for new pool'] },
        { name: 'Makefile', coEditScore: 0.05, logEntries: ['Added db-reset command'] },
        { name: '.env.example', coEditScore: 0.03, logEntries: ['Added DB_POOL_SIZE'] },
        { name: 'src/telemetry.rs', coEditScore: 0.01, logEntries: ['Added tracing span for db queries'] }
      ]
    }
  },
  {
    id: 'drift-1',
    type: 'drift',
    title: 'High Contradiction in pool.rs',
    summary: 'Docs vs. Code mismatch detected.',
    narrative: 'The README claims the pool size is fixed at 10, but `pool.rs` now uses a dynamic scaling strategy. This drift could lead to configuration errors in production.',
    agent: 'DriftDetector',
    timestamp: '2026-04-04T09:45:00Z',
    severity: 'critical',
    data: {
      severity: 'high',
      docSnippet: 'The database connection pool is statically allocated with 10 slots.',
      codeSnippet: 'let pool = Pool::builder().max_size(config.dynamic_limit()).build();'
    }
  },
  {
    id: 'relationships-1',
    type: 'relationships',
    title: 'PR #47 fixes Issue #12',
    summary: 'Curated force-directed graph of 12 nodes.',
    narrative: 'A critical link has been established between the new OAuth2 implementation and the session management bug. PR #47 resolves the race condition identified in Issue #12.',
    agent: 'RelationshipMapper',
    timestamp: '2026-04-04T09:30:00Z',
    severity: 'warning',
    data: {
      nodes: [
        { id: 'PR #47', type: 'pr', significance: 12 },
        { id: 'Issue #12', type: 'issue', significance: 8 },
        { id: 'auth.rs', type: 'file', significance: 5 },
        { id: 'session.rs', type: 'file', significance: 3 },
        { id: 'UserAuth', type: 'struct', significance: 2 }
      ],
      links: [
        { source: 'PR #47', target: 'Issue #12', label: 'fixes', strength: 5, time: 10 },
        { source: 'PR #47', target: 'auth.rs', label: 'modifies', strength: 3, time: 30 },
        { source: 'auth.rs', target: 'session.rs', label: 'imports', strength: 2, time: 60 }
      ]
    }
  },
  {
    id: 'timeline-1',
    type: 'timeline',
    title: 'OAuth2 PKCE Implementation',
    summary: '3D spine with 5 event cards.',
    narrative: 'The security hardening sprint is reaching its peak. The transition from basic auth to PKCE-enabled OAuth2 is 80% complete, with only the refresh token rotation pending.',
    agent: 'ActivityAnalyzer',
    timestamp: '2026-04-04T08:00:00Z',
    severity: 'healthy',
    data: {
      events: [
        { id: 'e1', title: 'Initial PKCE Draft', type: 'commit', impact: 'high' },
        { id: 'e2', title: 'Security Audit Pass', type: 'tag', impact: 'medium' },
        { id: 'e3', title: 'Merge PR #45', type: 'merge', impact: 'high' }
      ]
    }
  },
  {
    id: 'churn-1',
    type: 'churn',
    title: 'src/auth/ Hotspot',
    summary: 'High churn in authentication modules.',
    narrative: 'The `auth` directory has seen 15 commits in the last 24 hours. 60% of these are refactors, indicating a stabilization phase after the initial feature push.',
    agent: 'ChurnAnalyzer',
    timestamp: '2026-04-04T07:30:00Z',
    severity: 'warning',
    data: {
      name: 'src/auth',
      children: [
        { name: 'provider.rs', size: 450, temp: 0.9, commits: 12, author: 'alice@example.com', type: 'instability churn' },
        { name: 'token.rs', size: 320, temp: 0.7, commits: 8, author: 'bob@example.com', type: 'focused refactor' },
        { name: 'mod.rs', size: 150, temp: 0.4, commits: 3, author: 'alice@example.com', type: 'healthy iteration' },
        { name: 'oauth.rs', size: 600, temp: 0.85, commits: 10, author: 'charlie@example.com', type: 'feature push' },
        { name: 'session.rs', size: 280, temp: 0.2, commits: 1, author: 'bob@example.com', type: 'maintenance' },
        { name: 'crypto.rs', size: 190, temp: 0.1, commits: 0, author: 'alice@example.com', type: 'stable' }
      ]
    }
  },
  {
    id: 'snapshot-1',
    type: 'snapshot',
    title: 'Core Architecture Blueprint',
    summary: 'Spatial "Blueprint" of major modules.',
    narrative: 'The system architecture is currently centered around the `core` and `api` modules. The `storage` module is showing signs of decoupling, which aligns with the recent refactor plan.',
    agent: 'ArchMapper',
    timestamp: '2026-04-04T07:00:00Z',
    severity: 'healthy',
    data: {
      modules: [
        { name: 'Core', churn: 'high', files: 12 },
        { name: 'API', churn: 'medium', files: 8 },
        { name: 'Storage', churn: 'low', files: 5 },
        { name: 'Auth', churn: 'high', files: 10 }
      ]
    }
  },
  {
    id: 'digest-1',
    type: 'digest',
    title: 'OAuth2 Hardening',
    summary: 'Bento Box grid of synthesized features.',
    narrative: 'The OAuth2 hardening sprint is consolidating. Key achievements include PKCE integration and secure token storage. The remaining work is focused on refresh token rotation.',
    agent: 'FeatureSynthesizer',
    timestamp: '2026-04-04T06:30:00Z',
    severity: 'healthy',
    data: {
      features: [
        { title: 'PKCE Flow', weight: 0.8, status: 'done' },
        { title: 'Secure Storage', weight: 0.6, status: 'done' },
        { title: 'Token Rotation', weight: 0.4, status: 'in-progress' }
      ]
    }
  },
  {
    id: 'convention-1',
    type: 'convention',
    title: 'Error Handling Pattern',
    summary: 'Stylized "Notebook" cards showing patterns.',
    narrative: 'A new error handling convention using the `thiserror` crate is being adopted. 80% of the codebase has been migrated, with the `db` module still using the old manual implementation.',
    agent: 'ConventionSpotter',
    timestamp: '2026-04-04T06:00:00Z',
    severity: 'warning',
    data: {
      pattern: 'thiserror usage',
      before: 'enum MyError { ... } impl Display for MyError { ... }',
      after: '#[derive(Error, Debug)] pub enum MyError { #[error("...")] ... }'
    }
  },
  {
    id: 'next-1',
    type: 'next',
    title: 'Upcoming: Migration to Async',
    summary: 'Radar screen inferring in-flight work.',
    narrative: 'The agent predicts a major shift towards async database drivers based on your recent searches and draft PRs. This will likely be the focus of the next session.',
    agent: 'Forecaster',
    timestamp: '2026-04-04T05:30:00Z',
    severity: 'healthy',
    data: {
      blips: [
        { title: 'tokio-postgres', distance: 0.2 },
        { title: 'async-trait', distance: 0.4 },
        { title: 'sqlx migration', distance: 0.7 }
      ]
    }
  },
  {
    id: 'dependency-1',
    type: 'dependency',
    title: 'Shift to Rust 2024 Edition',
    summary: 'Tech tree for architectural shifts.',
    narrative: 'The project has successfully transitioned to the Rust 2024 edition. This shift has enabled cleaner async syntax and improved borrow checker diagnostics.',
    agent: 'DependencyAnalyzer',
    timestamp: '2026-04-04T05:00:00Z',
    severity: 'healthy',
    data: {
      nodes: [
        { name: 'Rust 2021', status: 'legacy' },
        { name: 'Rust 2024', status: 'current' },
        { name: 'Async Improvements', status: 'enabled' }
      ]
    }
  },
  {
    id: 'release-1',
    type: 'release',
    title: 'v1.2.0: The Security Update',
    summary: 'Magazine-style human-readable changelog.',
    narrative: 'v1.2.0 is a major milestone focusing on security and stability. The introduction of OAuth2 PKCE and the migration to the latest Rust edition are the highlights.',
    agent: 'Narrator',
    timestamp: '2026-04-04T04:30:00Z',
    severity: 'healthy',
    data: {
      highlights: [
        { title: 'OAuth2 PKCE', description: 'Full implementation of PKCE for secure authentication.' },
        { title: 'Rust 2024', description: 'Migrated the entire codebase to the latest Rust edition.' },
        { title: 'Bug Fixes', description: 'Resolved 15 minor issues and 2 critical race conditions.' }
      ]
    }
  },
  {
    id: 'drift-2',
    type: 'drift',
    title: 'Secret Leak in CI Pipeline',
    summary: 'Environmental variable exposure detected.',
    narrative: 'A recent commit to `.github/workflows/deploy.yml` hardcoded a fallback AWS token. This violates the zero-trust secrets policy and triggers an immediate critical alert.',
    agent: 'DriftDetector',
    timestamp: '2026-04-04T12:00:00Z',
    severity: 'critical',
    data: {
      severity: 'high',
      docSnippet: 'Secrets must be injected via GitHub Actions environment variables.',
      codeSnippet: 'AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE"'
    }
  },
  {
    id: 'focus-2',
    type: 'focus',
    title: 'UI Button Refactor',
    summary: 'Deep dive into frontend component library.',
    narrative: 'Your recent session focused primarily on standardizing the padding and hover states of the primary CTA buttons across 4 different macro-layouts. A highly localized, aesthetic sprint.',
    agent: 'FocusTracker',
    timestamp: '2026-04-04T13:30:00Z',
    severity: 'healthy',
    data: {
      center: { name: 'components/ui/button.tsx', commitFrequency: 5 },
      satellites: [
        { name: 'app/globals.css', coEditScore: 0.8, logEntries: ['Updated border radius variables'] },
        { name: 'tailwind.config.ts', coEditScore: 0.6, logEntries: ['Added custom premium easing'] }
      ]
    }
  },
  {
    id: 'churn-2',
    type: 'churn',
    title: 'Payment Gateway Instability',
    summary: 'High rewrite frequency in billing logic.',
    narrative: 'The `services/billing/stripe.ts` module has been rewritten 4 times this week by 3 different authors. This high temperature indicates conflicting business requirements or a flaky test suite.',
    agent: 'ChurnAnalyzer',
    timestamp: '2026-04-04T14:15:00Z',
    severity: 'critical',
    data: {
      name: 'services/billing',
      children: [
        { name: 'stripe.ts', size: 850, temp: 0.98, commits: 22, author: 'dave@example.com', type: 'instability churn' },
        { name: 'webhooks.ts', size: 300, temp: 0.85, commits: 15, author: 'eve@example.com', type: 'instability churn' }
      ]
    }
  },
  {
    id: 'dependency-2',
    type: 'dependency',
    title: 'Deprecated lodash usage',
    summary: 'Legacy utility library accumulation.',
    narrative: 'We are slowly accumulating `lodash` imports in the new Next.js 15 app router components despite a team mandate to use native ES6 features. The bundle size is taking a minor hit.',
    agent: 'DependencyAnalyzer',
    timestamp: '2026-04-04T15:00:00Z',
    severity: 'warning',
    data: {
      nodes: [
        { name: 'lodash/debounce', status: 'legacy' },
        { name: 'Native setTimeout', status: 'target' }
      ]
    }
  },
  {
    id: 'timeline-2',
    type: 'timeline',
    title: 'Memory Leak Investigation',
    summary: 'Chronology of performance debugging.',
    narrative: 'Tracing the origin of the V8 out-of-memory errors back to the unclosed WebSocket connections introduced in PR #112. The resolution spanned 3 days.',
    agent: 'ActivityAnalyzer',
    timestamp: '2026-04-04T16:20:00Z',
    severity: 'warning',
    data: {
      events: [
        { id: 't1', title: 'OOM Alert Triggered', type: 'alert', impact: 'high' },
        { id: 't2', title: 'Heap Snapshot Analyzed', type: 'debug', impact: 'medium' },
        { id: 't3', title: 'WebSocket Cleanup Patch', type: 'commit', impact: 'low' }
      ]
    }
  },
  {
    id: 'next-2',
    type: 'next',
    title: 'Impending Next.js Cache Issue',
    summary: 'Forecasting static generation errors.',
    narrative: 'Given the sudden influx of dynamic `cookies()` calls in `layout.tsx`, the forecaster predicts the upcoming Vercel deployment will fail due to full-route cache de-optimization.',
    agent: 'Forecaster',
    timestamp: '2026-04-04T17:10:00Z',
    severity: 'warning',
    data: {
      blips: [
        { title: 'layout.tsx de-opt', distance: 0.1 },
        { title: 'slow TTFB', distance: 0.3 }
      ]
    }
  },
  {
    id: 'convention-2',
    type: 'convention',
    title: 'Prop Drilling Anti-Pattern',
    summary: 'Structural code smell detected.',
    narrative: 'Detected deep prop drilling (5+ levels) of `userSession` across the `DashboardLayout` tree. Consider adopting React Context or Zustand for state management to avoid component bloat.',
    agent: 'ConventionSpotter',
    timestamp: '2026-04-04T18:05:00Z',
    severity: 'warning',
    data: {
      pattern: 'Prop Drilling',
      before: '<Child session={session} />',
      after: 'const { session } = useAuthStore()'
    }
  },
  {
    id: 'digest-2',
    type: 'digest',
    title: 'Sprint 42 Retrospective',
    summary: 'Synthesized sprint health dashboard.',
    narrative: 'Sprint 42 closed with 85% of story points completed. The primary bottleneck was the third-party API integration, while frontend tasks finished ahead of schedule.',
    agent: 'FeatureSynthesizer',
    timestamp: '2026-04-04T19:00:00Z',
    severity: 'healthy',
    data: {
      features: [
        { title: 'API Integration', weight: 0.9, status: 'in-progress' },
        { title: 'Settings UI', weight: 0.3, status: 'done' },
        { title: 'Export PDF', weight: 0.5, status: 'done' }
      ]
    }
  },
  {
    id: 'relationships-2',
    type: 'relationships',
    title: 'Zustand State Coupling',
    summary: 'Force-directed graph of state dependencies.',
    narrative: 'The `useWorkspaceStore` has become a God-Object. It is currently imported by 47 different components, creating a tightly coupled architecture that makes unit testing difficult.',
    agent: 'RelationshipMapper',
    timestamp: '2026-04-04T20:30:00Z',
    severity: 'critical',
    data: {
      nodes: [
        { id: 'useWorkspaceStore', type: 'store', significance: 20 },
        { id: 'Sidebar', type: 'component', significance: 5 },
        { id: 'Editor', type: 'component', significance: 15 },
        { id: 'Settings', type: 'component', significance: 5 }
      ],
      links: [
        { source: 'useWorkspaceStore', target: 'Editor', label: 'binds', strength: 8, time: 2 },
        { source: 'useWorkspaceStore', target: 'Sidebar', label: 'reads', strength: 2, time: 5 },
        { source: 'useWorkspaceStore', target: 'Settings', label: 'writes', strength: 4, time: 10 }
      ]
    }
  },
  {
    id: 'release-2',
    type: 'release',
    title: 'Hotfix: Redis Deadlock',
    summary: 'Micro-release incident report.',
    narrative: 'A split-brain scenario in the Redis cluster caused a site-wide deadlock. This hotfix implements a circuit breaker pattern and increases the timeout threshold.',
    agent: 'Narrator',
    timestamp: '2026-04-04T21:45:00Z',
    severity: 'critical',
    data: {
      highlights: [
        { title: 'Circuit Breaker', description: 'Added exponential backoff to cache queries.' },
        { title: 'Database TTL', description: 'Forced aggressive TTLs to prevent memory overload.' }
      ]
    }
  }
];

export const EXHIBIT_ICONS = {
  focus: Focus,
  drift: AlertTriangle,
  relationships: Network,
  timeline: History,
  churn: Layers,
  snapshot: LayoutGrid,
  digest: BookOpen,
  convention: ScrollText,
  next: Radar,
  dependency: GitBranch,
  release: GitCommit,
  proportion: Radar,
  'bar-chart': LayoutGrid,
  'policy-badge': AlertTriangle,
  'timeline-log': History,
  'network-stable': Network
};
