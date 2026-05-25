# RepoVis — Agentic GitHub Exhibition System

A Next.js UI prototype for visualizing repository intelligence. Surfaces hidden codebase patterns — file gravity, architectural drift, churn hotspots, relationships — through 16 interactive D3.js exhibit types. Currently runs on **mock data only**; no GitHub API integration yet.

## Quick Start

```bash
npm install
npm run dev    # localhost:3000
```

```bash
npm run test   # Vitest unit tests
npm run build  # Production build
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Motion (`motion/react`) — Framer Motion successor |
| Visualizations | D3.js v7 (force simulations, treemaps, orbital physics) |
| Charts | Recharts |
| AI (planned) | `@google/genai` |
| Tests | Vitest + Testing Library |

## Routes

| Route | Description |
|---|---|
| `/` | Main exhibit dashboard — 16 visualization types, macro→deep-dive progressive disclosure |
| `/hero` | MooseGoose compute showcase — personal hardware itemization (395 TFLOPS) |
| `/startup` | Synthetic audio boot sequence (Web Audio API, no external assets) |
| `/svg-showcase` | SVG component gallery |

## Exhibit Types

The main dashboard renders `ExhibitArtifact` cards from `lib/exhibits.ts`. Each card shows a macro summary and expands to a full-screen deep-dive visualization.

| Type | Visualization | Description |
|---|---|---|
| `focus` | D3 orbital force graph | Files orbiting a central "archstone" node, sized by co-edit coupling score |
| `drift` | Side-by-side diff | Doc baseline vs. code implementation — sync gap detection |
| `relationships` | D3 force-directed graph | PRs, issues, and files with animated flow dots and temporal curvature |
| `timeline` | Vertical spine | Chronological event cards with progressive disclosure sub-panel |
| `churn` | D3 treemap | Thermal heatmap (inferno scale) of file churn temperature |
| `snapshot` | D3 block diagram | Architecture blueprint with module health indicators |
| `digest` | Bento grid | Sprint/feature synthesis dashboard |
| `convention` | Notebook cards | Code pattern before/after comparison |
| `next` | Radar screen | Forecasted upcoming work based on recent activity |
| `dependency` | Tech tree | Dependency shift visualization |
| `release` | Magazine layout | Human-readable changelog |
| `proportion` | Ratio display | Document filtering efficiency (e.g. KB drop rates) |
| `bar-chart` | Bar chart | Workflow merge rate comparison |
| `policy-badge` | Status badge | Binary security posture indicator |
| `timeline-log` | Interval display | Agent execution cadence |
| `network-stable` | Network graph | Fixed agent communication topology |

## Data State

All exhibits use `MOCK_EXHIBITS` from `lib/exhibits.ts`. No live GitHub API calls are made. The `lib/analysis/` modules (`drift.ts`, `gravity.ts`) contain the analytical logic that will eventually consume real repository data.

## Design Philosophy

RepoVis follows the **Living System** philosophy:

1. **Progressive Disclosure** — Macro summaries expand into deep-dive explorations
2. **Motion Encodes Data** — Animation speed = commit frequency; arc curvature = time since interaction; orbital radius = coupling strength
3. **Intentional Design** — Color, shape, and transition are deliberate data encodings, not decoration

## Documentation

- [Vision](./docs/VISION.md) — Goals, audience, success criteria
- [Roadmap](./docs/ROADMAP.md) — Path from UI prototype to data-driven application
- [Architecture](./docs/ARCHITECTURE.md) — Implementation details and design patterns
- [Decisions](./docs/decisions.md) — Append-only ADR log
- [Journal](./docs/journal.md) — Development log
