# Governance & Roadmap

## Project structure

- **Main branch:** `main` stays releasable; GitHub Actions block merges unless lint, tests, and type checks pass.
- **Release cadence:** Weekly tags (`v0.x`) cut Friday 17:00 ET. Changelog entries accompany every tag.
- **Branching model:** Features branch from `main` using `feature/*`, fixes under `fix/*`. All merges happen via pull requests with at least one reviewer.

## Roles

| Role | Owner | Responsibilities |
|------|-------|------------------|
| Product & Backend Lead | Sanjana Chandrashekar | Roadmap, API design, database schema, release approvals |
| Frontend Lead | R Aditya Baradwaj | Expo app UX, navigation, accessibility sign-off |
| QA & Tooling | Prajakta Kulkarni | Automated tests, CI/CD upkeep, coverage reporting |
| DevOps | Abhishek Choudhary | Deployments, cloud infra, security updates |
| Merchant Experience | Harshini Kotha | Restaurant workflow research, usability studies |

## Decision-making

1. Proposals land as GitHub Issues labelled `proposal`.  
2. Discussion occurs asynchronously within the issue (linking to Discord threads when needed).  
3. Approval requires 👍 from at least two distinct roles; the Product Lead has final tie-break authority.  
4. Accepted proposals move into the sprint board and are tracked as user stories.

## Deprecation policy

- Announce deprecations in `CHANGELOG.md` with at least one sprint (2 weeks) notice.
- Mark deprecated endpoints with the `Sunset` response header and include migration guidance in the API docs.
- Remove deprecated functionality only after adoption metrics confirm <5% usage or an alternative is available.

## Funding & sustainability

RouteDash is currently a student-led project (CSC510, Fall 2025) with no external funding. Hosting costs are covered by free-tier services (Supabase/Postgres, Vercel, Expo). Should recurring costs exceed allowances, the team will:

1. Evaluate open-source sponsorship (GitHub Sponsors) and university grants.
2. Publish financial updates once per semester in the README and Governance doc.

## Roadmap highlights

| Horizon | Milestones |
|---------|------------|
| 3 months | Socket-based live order updates, automated Expo builds, accessibility audit completion |
| 6 months | Merchant analytics dashboard, infrastructure-as-code (Terraform), paid meal partnerships pilot |
| 12 months | Nationwide release with partner restaurants, premium subscription tier, open plugin SDK |

For escalations or governance questions, open an issue tagged `governance` or email `team@routedash.dev`.
