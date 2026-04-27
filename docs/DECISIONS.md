---
title: Decisions Log
description: Append-only log of significant design and architecture choices.
---

# Decisions

This document is an append-only log of significant design and architecture choices. It exists so we remember *why* a choice was made without having to re-derive it.

### Visual Identity & Layout
- **WHAT:** Full-screen responsive grid with vibrant neon accents on a dark background.
- **WHY:** The user explicitly rejected the "drab, right-side bar" aesthetic. A full-screen grid allows for immersive data visualization. Neon accents against dark backgrounds (using proper layered box-shadows for bloom) create a high-tech, "cybernetic" feel that aligns with the goal of visualizing invisible repository forces.
- **ALTERNATIVES:** A standard light-mode dashboard with muted colors was rejected because it fails to convey the dynamic, "live" nature of the data.

### Interaction Model
- **WHAT:** Progressive disclosure via "Macro" and "Deep" states. Macro states use animated CSS `MiniVis` components. Clicking expands to a full-screen "Deep" state (like the D3 Gravity Well).
- **WHY:** Avoids overwhelming the user with complex D3 graphs all at once. The `MiniVis` provides immediate, ambient information at a glance, while the deep state allows for focused exploration. Removing explicit "expand" buttons makes the interface feel more like a tactile surface.
- **ALTERNATIVES:** Having all D3 graphs render simultaneously on the main grid would cause massive performance issues and visual clutter.

### Visualization Technology
- **WHAT:** D3.js for complex physics/relationships (Gravity Well), Framer Motion for layout transitions, and pure CSS for ambient macro animations.
- **WHY:** D3 provides the necessary physics engine for orbital mechanics. Framer Motion handles the complex shared-layout transitions between the grid and the full-screen modal smoothly. CSS animations are highly performant for the ambient `MiniVis` loops.
- **ALTERNATIVES:** Using only CSS for everything would make the orbital mechanics impossible. Using Canvas/WebGL for everything is overkill and reduces accessibility/DOM interactivity (like tooltips).

### Relationships Graph Encoding
- **WHAT:** Using Quadratic Bezier curves to encode time (older = more curved) and animated flowing dots to encode dependency direction.
- **WHY:** To adhere to the "Motion Encodes Data" principle. Static lines and arrowheads require the user to read a legend and manually trace paths. Curvature and flow allow the user to intuitively "feel" the age and direction of the architecture at a glance.
- **ALTERNATIVES:** Straight lines with static SVG arrowheads. Rejected because it is a conventional, static UI pattern that fails to convey the "living" nature of the codebase.

### Premium Aesthetic Overhaul
- **WHAT:** Implementing shared-element transitions (`layoutId`), glassmorphism, multi-layered shadows, and organic easing curves (`[0.175, 0.885, 0.32, 1.275]`).
- **WHY:** The initial dashboard felt "robotic" due to standard easing and lack of spatial continuity. Shared-element transitions provide a clear mental model of where information is expanding from. Organic easing curves mimic natural momentum, creating a "premium" feel. Glassmorphism and layered shadows add depth without cluttering the visual field.
- **ALTERNATIVES:** Standard modal transitions (fade/slide) were rejected as they feel disconnected from the source element.
