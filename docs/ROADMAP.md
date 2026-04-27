---
title: Path to Production Roadmap
description: Strategic plan for taking RepoVis from a UI prototype to a functional, data-driven application.
---

# Path to Production: RepoVis Roadmap

Currently, RepoVis is a heavily polished, interactive prototype driven by synthetic data (`MOCK_EXHIBITS`). To move this into a fully functional product, we must transition from building the *presentation layer* to building the *data ingestion and analysis engine*.

Here is the thought process and proposed roadmap for the rest of this workflow.

## Phase 1: Data Ingestion & Integration (The "Nerve Center")

Before we can visualize architectural drift or file gravity, we need raw data. 

**Decision Needed: Target Audience & Deployment**
There are two primary paths for data ingestion, depending on how RepoVis will be used:

1.  **The SaaS Path (GitHub App Integration):**
    *   **How:** We build a backend service that authenticates via a GitHub App installation.
    *   **Data Flow:** Webhooks capture PRs, pushes, and issues in real-time. The GitHub REST/GraphQL APIs are used for historical analysis (fetching commit histories, traversing trees).
    *   **Pros:** Zero-setup for users; highly scalable.
    *   **Cons:** Rate limits can be harsh when trying to do deep analysis on massive monorepos.

2.  **The CLI Tool Path (Local / CI/CD Integration):**
    *   **How:** We build a Node.js or Rust CLI tool that physically clones the repository (or runs inside GitHub Actions/GitLab CI) and uses `git log` and AST parsing locally.
    *   **Data Flow:** The CLI generates a `repovis.json` artifact containing the extracted exhibits. The dashboard simply loads this JSON.
    *   **Pros:** Can parse ASTs and raw git history infinitely faster and deeper than the GitHub API. No secrets to manage on a SaaS. Perfect for enterprise internal tools.

*Recommendation:* Start with **The CLI Tool Path** (or a local Node server running on the user's machine) to act as the backend. It bypasses OAuth headaches for now and allows for deeper, unrestricted analysis.

## Phase 2: The Analysis Engine (Generating the Artifacts)

RepoVis doesn't just show lists; it shows *concepts* (Gravity, Drift, Churn). We need an engine to translate raw git data into the `ExhibitArtifact` format:

*   **File Gravity (Focus Exhibit):**
    *   **Algorithm:** Association Rule Learning. Parse `git log --name-only`. For every commit where file X is changed, what other files are frequently in the same commit? Calculate a `coEditScore`.
*   **Architectural Drift (Drift Exhibit):**
    *   **Algorithm:** Analyze dependencies using an AST parser (like `swc` or `babel` for JS/TS) and compare it against a defined baseline layer architecture. Alternatively, track the rate of change in cross-module imports over time.
*   **Narrative Generation:**
    *   **Algorithm:** Feed the raw metrics (e.g., "src/db/pool.rs has 12 commits with high co-edits in src/connection.rs") into the **Gemini API**. Use Gemini to generate the human-readable `narrative` field ("The agent detected a persistent focus on connection pooling logic...").

## Phase 3: Backend & Database Architecture

If we choose the SaaS route (or even a persistent local dashboard), we need robust state management:

*   **Database:** A NoSQL database like **Firebase Firestore** is ideal here. We can store the processed `ExhibitArtifact` objects in collections.
*   **Real-time Updates:** RepoVis feels "alive." We can hook the Next.js frontend into Firestore `onSnapshot` listeners. As the GitHub App processes new webhooks and the Analysis Engine generates a new "Drift Warning", the UI updates instantly with an animated entrance.

## Phase 4: Authentication & Security

*   If SaaS: Implement `NextAuth` or Firebase Authentication linking to GitHub OAuth.
*   Ensure the dashboard enforces strict access controls (users can only see dashboards for repositories they have read access to).

## Next Immediate Steps for the Developer (You)

To proceed, we should tackle the easiest vertical slice:

1.  **Select the Architecture:** Choose between the Local CLI approach or the SaaS/GitHub App approach.
2.  **Scaffold the Backend:** Create an `/api/analyze` route or a separate worker project.
3.  **Implement One Metric:** Replace the mock "Focus" (File Gravity) exhibit with a real script that parses the actual git history of *this very repository* to generate the graph.
