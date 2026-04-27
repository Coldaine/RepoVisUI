# Vision: RepoVis Dashboard Architecture & Aesthetics

## Core Philosophy
The problem with most dashboards is epistemic, not aesthetic. They treat visualizations as decoration rather than information. 
In RepoVis, **a visualization earns its existence by being legible at a glance**. 
Every component must answer: *What does this motion or graphic tell the user that the static state does not?*

## Guidelines for Mini-Visualizations (The 2-Second Rule)
Every "macro" visualization (MiniVis) must bind to the actual data payload. 
You should be able to look at two cards of the same type and read their differences in under two seconds.
- **Do not** use raw randomness or ID-hashing just to make things look different. 
- **Do** encode at least two real variables from the artifact data (e.g., length = magnitude, opacity = volume, placement = topological accuracy).
- Every visualizer component must have a top-level code comment stating exactly what the viewer is supposed to conclude from it (e.g., *"Tells you which files are changing most (bar height = commits) and how recent they are (opacity = temp)."*)

## Progressive Disclosure & Spatial Reuse
- **Macro View (Front Face):** Clean, structured, and information-dense. No decorative overlays, no generic glowing noise, no watermarks, no heavy vignettes. The macro face is a data artifact, not an art installation.
- **Deep View (Backface / Expanded):** This is where immersive, explorational visual design belongs. Heavy particle effects, 3D topologies, and deep analytics go here because the user has opted-in to spend time examining them.

## Anti-Patterns to Avoid
- **"Screensavers":** Avoid animations that just bounce, loop, or glow for the sake of being pretty. Motion must encode data.
- **Pseudo-Data:** Generating procedural noise seeded by an ID to *fake* data variation. 
- **Atmospheric Noise on Macro Tiles:** Applying `mix-blend-overlay`, heavy vignettes, or huge watermark texts on the top-level cards. These clutter the visual hierarchy and obscure the data.
