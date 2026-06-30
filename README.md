---
title: RepoVis
description: A dynamic, highly visual dashboard for understanding codebases.
version: 0.1.0
---

# RepoVis

RepoVis is an interactive, "living-system" dashboard for exploring codebases. It is
built around an **exhibit** model: each visualization (file gravity, architectural drift,
churn radar, dependency network, etc.) is a self-contained exhibit that can be opened
in-place, expanded full-screen, and audited via a server-side analysis route.

Status: prototype / UI-led. Several exhibits are wired against mock data while the
analysis backend (`app/api/analyze`) is filled in.

## Tech Stack

- **Next.js 15** (App Router) — `app/page.tsx`, `app/hero/`, `app/startup/`, `app/svg-showcase/`
- **React 19** with TypeScript 5.9
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Motion** (`motion/react`, the rebranded Framer Motion) for layout transitions,
  spring animations, and shared-element morphs
- **D3** (`d3@7`) for force-directed, gravity, and drift visualizations
- **Lucide** icons

There is no separate state library; exhibit and UI state are local-component state and
React refs. Routes are server-rendered Next.js routes; the only API route currently is
`POST /api/analyze`.

## Getting Started

```bash
npm install
npm run dev      # next dev on http://localhost:3000
```

Other scripts (from `package.json`):

```bash
npm run build    # next build
npm run start    # next start
npm run lint     # eslint .
npm run test     # vitest run
npm run clean    # next clean
```

## Project Layout

```
app/
├── page.tsx              # Main dashboard — exhibit grid, expand/collapse, audio toggle
├── hero/                 # Hero / landing route (actions.ts + page.tsx)
├── startup/              # Startup splash route
├── svg-showcase/         # SVG capability demo route
├── api/
│   └── analyze/route.ts  # GET endpoint that runs lib/analysis
├── layout.tsx
└── globals.css

lib/
├── analysis/
│   ├── drift.ts          # Architectural-drift analysis
│   └── gravity.ts        # File-gravity analysis
├── exhibits.ts           # MOCK_EXHIBITS, ExhibitArtifact type, EXHIBIT_ICONS
├── audio.ts              # Sound effects helper (sounds.*)
├── logger.ts
└── utils.ts              # cn() and friends

hooks/
└── use-mobile.ts

tests/
├── Dashboard.test.tsx    # Top-level dashboard smoke test
├── drift.test.ts         # Unit tests for lib/analysis/drift
├── gravity.test.ts       # Unit tests for lib/analysis/gravity
├── utils.test.ts
└── setup.ts              # Vitest + Testing Library setup

docs/                     # Project narrative and design log (see below)
```

## Design Philosophy

RepoVis follows a "Living System" philosophy:

1. **Progressive Disclosure** — exhibits start as compact tiles that expand into a
   full-screen deep-dive without unmounting (Motion `LayoutGroup` + shared layout IDs).
2. **Motion Encodes Data** — animation speed, curvature, and spring tension carry
   meaning (e.g., faster = higher churn, tighter spring = stronger coupling).
3. **Intentional Detail** — every color, easing curve, and sub-card transition is a
   deliberate signal about the underlying repo state.

See `docs/PROGRESSIVE_DISCLOSURE.md` and `docs/visualization-audit.md` for the
concrete patterns this enforces.

## Documentation

- [Vision](./docs/VISION.md) — north-star goals and audience
- [Roadmap](./docs/ROADMAP.md) — path from UI prototype to data-backed app
- [Architecture](./docs/ARCHITECTURE.md) — current implementation patterns
- [Decisions](./docs/DECISIONS.md) — append-only decision log
- [Progressive Disclosure](./docs/PROGRESSIVE_DISCLOSURE.md) — expand/collapse contract
- [Visualization Audit](./docs/visualization-audit.md) — exhibit-by-exhibit review
- [Journal](./docs/journal.md) — chronological development log
- [History](./docs/HISTORY.md) — meta-log of project evolution
- [AI Audio Prompts](./docs/AI_AUDIO_PROMPTS.md) — prompts behind the audio cues

## Testing

```bash
npm run test
```

Vitest + Testing Library (`jsdom` environment, configured in `vitest.config.ts`).
Coverage targets the analysis primitives (`lib/analysis/*`) and the dashboard
render path.
