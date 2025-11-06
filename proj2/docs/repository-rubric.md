# Repository Health Rubric (Project 2)

This table documents how RouteDash satisfies the CSC510 Project 2 repository criteria. Scores: `0 = none`, `1 = a little`, `2 = somewhat`, `3 = a lot`.

| Notes | Evidence | Score |
|-------|----------|-------|
| Workload is spread across the team | GitHub Insights → Contributors (multiple active committers each week) | 3 |
| Number of commits | GitHub Insights graph (steady commit cadence) | 3 |
| Commits by different people | Insights shows ≥4 distinct contributors | 3 |
| Issue reports: volume | https://github.com/RAdityaBaradwaj/CSC510_G20/issues (open/closed) | 3 |
| Issues are being closed | Linked PRs referencing issues; closing comments summarised | 3 |
| Docs: generated & well-formatted | README.md, INSTALL.md, proj2/docs/api.md | 3 |
| Docs: “what” (API docs per class/function) | proj2/docs/api.md (endpoint details) | 3 |
| Docs: “how” tutorials | README.md (Quick start), INSTALL.md (step-by-step) | 3 |
| Docs: “why” narrative | README.md (Architecture & Team Practices) | 3 |
| Short video, animated, hosted in repo | README.md demo embed (proj2/docs/demo.mp4) | 3 |
| Use of version control tools | Branching in CONTRIBUTING.md; PR history | 3 |
| Test cases exist | proj2/server/tests/**/* (Vitest suite) | 3 |
| Test cases ≥30% of codebase | Coverage report (Codecov) peaked at 78% statements | 2 |
| Tests executed routinely | GitHub Actions backend-ci.yml (cron + PR) | 3 |
| Issues discussed before closure | Issue templates require discussion summary | 3 |
| Chat channel exists | README.md (Discord QR mention) | 3 |
| Tests covering failure cases | New Vitest suites include off-nominal scenarios | 3 |
| Team uses same tooling | ESLint configs, Prettier config, shared tsconfig committed | 3 |
| Tooling configs updated collaboratively | Git history shows updates by multiple authors | 2 |
| Everyone can access tools | Config committed; setup documented in INSTALL.md | 3 |
| Members work across codebase | Insights → “Files changed” per contributor | 3 |
| Short release cycles | Weekly tags in roadmap + CHANGELOG.md | 2 |
| `.gitignore` maintained | Root .gitignore excludes build artifacts | 3 |
| INSTALL.md present | INSTALL.md | 3 |
| LICENSE.md present | LICENSE.md (MIT) | 3 |
| CODE_OF_CONDUCT.md present | CODE_OF_CONDUCT.md | 3 |
| CONTRIBUTING.md present | CONTRIBUTING.md | 3 |
| README contains video | README.md (Demo section) | 3 |
| README contains DOI badge | README.md badges row | 3 |
| README contains style checker badge | README.md (Lint badge) | 3 |
| README contains formatter badge | README.md (Prettier badge) | 3 |
| README contains syntax checker badge | README.md (Type Check badge) | 3 |
| README contains coverage badge | README.md (Codecov badge) | 3 |
| README contains other automation badge | README.md (Backend/Frontend CI badges) | 3 |
| Dependency documentation | proj2/docs/dependencies.md | 3 |
| Poster with QR code | proj2/docs/poster.md (QR + summary) | 2 |
| Governance & contribution policies | CONTRIBUTING.md (Governance, Review workflow) | 3 |
| Continuous deployment evidence | Deployment guide (prebuilt artefacts + scripts) | 3 |
| Roadmap defined | proj2/docs/governance.md (Roadmap) | 3 |

## Dependencies

See [proj2/docs/dependencies.md](dependencies.md) for the living SBOM (licences, purpose, mandatory/optional flags). The catalog is reviewed at the start of every sprint.

## Case studies

- **NC State commuter** – Customer tests the mobile app while commuting from Centennial Campus to downtown, demonstrating timed pickups based on drive ETA. (Video clip 00:45–01:30)
- **Merchants in motion** – Restaurant owner edits menu sections and sees instant change logs, highlighting audit trail utility.

## Roadmap

| Horizon | Milestones |
|---------|------------|
| 3 months | Real-time WebSocket updates, automated menu suggestion engine, accessibility audit |
| 6 months | Multi-tenant onboarding flow, infrastructure-as-code for staging, blue/green deploys |
| 12 months | Marketplace launch with payments integration, analytics dashboard, plugin API for partners |

## Score summary

Total score = **84**
