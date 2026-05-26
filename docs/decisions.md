# Architecture & Design Decisions

## 1. The Exhibit Card Layout
- **WHAT**: Moving from a uniform `xl:w-1/4` grid to a 12-column Bento Box Layout (`grid-cols-12 auto-rows-max`) using index-based layout mapping.
- **WHY**: The previous strict uniformity caused horizontal/vertical monotony. Every insight was forced into the same 300px box. The Bento pattern allows variable scale (some charts are tall, some metrics are wide) which emphasizes the most important data.
- **ALTERNATIVES**: We considered Masonry, but native CSS masonry is experimental. Auto-row grid guarantees alignment while still preserving variable surface areas.

## 2. Animation Engine inside Visualizers
- **WHAT**: Hardcoding `framer-motion` `<motion.svg>` and loops (`pathLength`, rotating circles) natively inside `MiniVis`.
- **WHY**: Previously, the entire widget was wrapped in hover/tap animations, but the interior visualization itself was static SVG. This gave the impression that motion was "paused" or broken. Wrapping specific elements in motion loops provides intrinsic kinetic feedback. The global `<MotionConfig>` still respects the pause toggle to freeze these loops when necessary.
- **ALTERNATIVES**: We considered using D3 entirely or `react-spring`, but `framer-motion`'s declarative SVG attributes (`animate={{ rotate: 360 }}`) provide the fastest way to get performant, looping visuals for 'vibe coding'.

## 3. The Backend Architecture "Data Lock-In"
- **WHAT**: Before proceeding to a "Live Data" connection, we must strictly lock the `ExhibitArtifact` interface.
- **WHY**: We cannot connect live repo data without a strict pipeline contract. The AST parsers and Git CLI tools will need to transform real repo metrics into the specific JSON expected by these components. Currently, it's just raw mocked JSON.
- **ALTERNATIVES**: We could just hook up a generic GraphQL endpoint, but that misses the "agentic analysis" aspect of the dashboard.

## 4. Boundary: Recharts vs D3 vs Framer Motion
- **WHAT**: A hybrid visualization model. We use `recharts` for Cartesian quantitative charts (Bar, Area, Timeline plotting). We use `d3` solely for complex layout mathematics. We hand-roll SVG with `framer-motion` for kinetic, non-data "HUD" elements (radars, focus rings).
- **WHY**: Libraries like `recharts` provide unbeatable robustness for rendering standard axes and dealing with data-bound Cartesian logic. Attempting to hand-code SVG paths for line charts or standard pie charts is re-inventing the wheel and fragile. But conversely, forcing an enterprise chart library to render a cyberpunk orbiting radar sweep is painful. Drawing the boundary prevents us from fighting the tools.
- **ALTERNATIVES**: We originally hand-coded all SVGs, which proved technically brilliant for the aesthetic but fundamentally unscalable for standard graphs like activity over time or simple pie distribution.

## 5. Physical Code Topology & Concentric Governance Shells (Inspirations)
- **DESIGN VISION**: Model a codebase not as a flat text file system, but as a physical layered metropolis.
  - **The Isometric Core Blocks**: By rendering modules as 3D blocks with heights tied to churn frequency and width encoding code volume, architecture takes on structural weight. Stacking tool integrations (like unit test thresholds or security static-analysis coverage) directly onto these blocks represents "quality reinforcement" layers visually.
  - **Concentric Security Shells**: Visualizing repository quality control layers as concentric bands or "orbit lanes".
    - *Outer Orbit (Soft Advisors / Feedback Loop)*: Highly lightweight, non-blocking check waves (represented by moving sine/saw waves or trailing sparks like in the `convention` visualizer). This encodes formatting linters or fast AST checks that advise the developer in real-time.
    - *Inner Orbit (Hard Gates & Blocking Enforcement)*: High-contrast, dense circular radar or grid meshes (represented by the `next` radar visualizer). This represents locking CI/CD barriers (like dependency vulnerability blocks or build breakers) that prohibit further progression until fixed.
  - **Interactive Topology Controls**: Rather than treating these visualizations as static dashboards, future iterations could let a workspace architect "slider-graft" dynamic rules directly on these curves: dragging a linter wave to widen the "compliance band" or tightening a gate radius to increase automated review strictness.
