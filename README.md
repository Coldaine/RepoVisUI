---
title: RepoVis
description: A dynamic, highly visual dashboard for understanding codebases.
version: 0.1.0
---

# RepoVis

RepoVis is a dynamic, highly visual dashboard for understanding codebases. It surfaces hidden patterns—like file gravity, architectural drift, and developer churn—using bespoke, interactive data visualizations.

## Documentation Index

- [**Vision**](./docs/VISION.md): The "North Star" for the project. Goals, audience, and what success looks like.
- [**Roadmap**](./docs/ROADMAP.md): Strategic path from UI prototype to functional, data-driven application.
- [**Decisions**](./docs/DECISIONS.md): An append-only log of significant design and architecture choices (What, Why, Alternatives).
- [**Architecture**](./docs/ARCHITECTURE.md): Technical implementation details and current design patterns.
- [**Journal**](./docs/journal.md): Chronological log of development turns and accomplishments.
- [**History**](./docs/HISTORY.md): Meta-log of project evolution based on feedback and critiques.

## Quick Start

The application is built with:
- **Next.js 15+** (App Router)
- **Tailwind CSS v4**
- **Framer Motion** (for layout transitions and micro-animations)
- **D3.js** (for complex physics-based visualizations)

## Design Philosophy

RepoVis follows the **Living System** design philosophy:
1. **Progressive Disclosure**: Macro-state summaries that expand into deep-dive explorations.
2. **Motion Encodes Data**: Every animation carries information (e.g., speed = frequency, curvature = time).
3. **Intentional Design**: Every color, shape, and transition is a deliberate choice to reflect the underlying repository meta-state.
