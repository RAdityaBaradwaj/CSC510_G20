# Software Sustainability Self-Assessment

This self-assessment follows the CSC510 Project 2 rubric. Evidence points to artefacts within this repository or public project resources.

| Category | Question | Yes | No | Evidence |
|----------|----------|-----|----|----------|
| **Q1 – Software Overview** | Clear, high-level overview provided? | ✅ | ❌ | README.md (Overview) |
|  | Target users described? | ✅ | ❌ | README.md (Overview) |
|  | Case studies or usage examples published? | ✅ | ❌ | proj2/docs/repository-rubric.md (Case studies) |
| **Q2 – Identity** | Project name unique? | ✅ | ❌ | README.md |
|  | Free from trademark violations? | ✅ | ❌ | CONTRIBUTING.md (Naming guidelines) |
| **Q3 – Availability** | Deployable without build step? | ❌ | ✅ | Requires Docker/Expo build (deployment.md) |
|  | Available for free? | ✅ | ❌ | LICENSE.md |
|  | Source code publicly available? | ✅ | ❌ | README.md |
|  | Hosted on established repository? | ✅ | ❌ | GitHub listing |
| **Q4 – Documentation** | Documentation easy to find? | ✅ | ❌ | README.md |
|  | Quick start guide included? | ✅ | ❌ | README.md (Quick Start) |
|  | Detailed deployment/usage instructions? | ✅ | ❌ | INSTALL.md |
|  | Comprehensive API guide? | ✅ | ❌ | proj2/docs/api.md |
|  | Troubleshooting guidance? | ✅ | ❌ | INSTALL.md (Troubleshooting) |
|  | API docs for integrations? | ✅ | ❌ | proj2/docs/api.md |
|  | Docs under version control? | ✅ | ❌ | Repo structure |
|  | Release history published? | ❌ | ✅ | Planned (repository-rubric.md) |
| **Q5 – Support** | Support channels described? | ✅ | ❌ | README.md (Team Practices) |
|  | Support expectations documented? | ✅ | ❌ | README.md (Team Practices) |
|  | Dedicated support email/forum? | ✅ | ❌ | README.md (Contact) |
|  | Support inbox reaches >1 person? | ✅ | ❌ | README.md (Contact) |
|  | Ticketing system for issues? | ✅ | ❌ | README.md (Issue triage) |
|  | Ticketing system public? | ✅ | ❌ | README.md (Issue triage) |
| **Q6 – Maintainability** | Modular architecture? | ✅ | ❌ | README.md (Architecture) |
|  | Coding standards documented? | ✅ | ❌ | CONTRIBUTING.md (Coding standards) |
| **Q7 – Open Standards** | Uses open data formats? | ✅ | ❌ | proj2/docs/api.md (JSON payloads) |
|  | Uses open protocols? | ✅ | ❌ | proj2/docs/api.md (HTTPS/REST) |
| **Q8 – Portability** | Cross-platform compatible? | ✅ | ❌ | INSTALL.md (Expo guidance) |
| **Q9 – Accessibility** | Software adheres to accessibility standards? | ❌ | ✅ | Accessibility audit pending |
|  | Documentation accessible? | ✅ | ❌ | Markdown formatting guidelines |
| **Q10 – Source Code Management** | Source in version control? | ✅ | ❌ | README.md |
|  | Releases snapshot repository? | ✅ | ❌ | CONTRIBUTING.md (Release process) |
|  | Releases tagged? | ❌ | ✅ | Tagging policy in progress |
|  | Stable branch maintained? | ✅ | ❌ | README.md (Branching) |
|  | Repository backed up? | ✅ | ❌ | GitHub redundancy |
| **Q11 – Building & Installing** | Build instructions provided? | ✅ | ❌ | INSTALL.md |
|  | Automated build tooling available? | ✅ | ❌ | proj2/docs/deployment.md |
|  | Deployment instructions provided? | ✅ | ❌ | proj2/docs/deployment.md |
|  | Third-party dependencies listed? | ✅ | ❌ | proj2/docs/repository-rubric.md (Dependencies) |
|  | Dependency versions documented? | ✅ | ❌ | package.json files |
|  | Dependency licences/URLs documented? | ❌ | ✅ | SBOM not yet published |
|  | Dependency managers used? | ✅ | ❌ | npm package management |
|  | Post-build tests available? | ✅ | ❌ | README.md (Testing & Coverage) |
| **Q12 – Testing** | Automated test suite exists? | ✅ | ❌ | README.md (Testing & Coverage) |
|  | Periodic test runs configured? | ✅ | ❌ | backend-ci.yml (scheduled) |
|  | Continuous integration enabled? | ✅ | ❌ | GitHub Actions |
|  | Test results public? | ✅ | ❌ | GitHub Actions badges |
|  | Manual test procedures documented? | ✅ | ❌ | README.md (Testing instructions) |
| **Q13 – Community Engagement** | Regularly updated outreach channels? | ❌ | ✅ | Social channels planned |
|  | User/project statistics published? | ❌ | ✅ | Not yet documented |
|  | Success stories shared? | ✅ | ❌ | proj2/docs/repository-rubric.md (Case studies) |
|  | Partners/collaborators listed? | ❌ | ✅ | Pending |
|  | Publications listed? | ❌ | ✅ | None yet |
|  | Third-party references listed? | ❌ | ✅ | None yet |
|  | Subscription to updates available? | ✅ | ❌ | GitHub watch/star |
|  | Governance model documented? | ✅ | ❌ | CONTRIBUTING.md (Governance) |
| **Q14 – Contributions** | External contributions accepted? | ✅ | ❌ | CONTRIBUTING.md |
|  | Contribution policy defined? | ✅ | ❌ | CONTRIBUTING.md |
|  | Contribution policy public? | ✅ | ❌ | CONTRIBUTING.md |
|  | Contributors retain IP? | ✅ | ❌ | LICENSE.md |
| **Q15 – Licensing** | Copyright owners stated? | ✅ | ❌ | LICENSE.md |
|  | Copyright header in each file? | ❌ | ✅ | Not yet automated |
|  | Licence clearly stated? | ✅ | ❌ | README.md / LICENSE.md |
|  | Open source licence used? | ✅ | ❌ | MIT Licence |
|  | OSI-approved licence? | ✅ | ❌ | MIT Licence |
|  | Licence header in each file? | ❌ | ✅ | Pending automation |
|  | Recommended citation provided? | ❌ | ✅ | Pending DOI |
| **Q16 – Future Plans** | Roadmap published? | ✅ | ❌ | proj2/docs/repository-rubric.md (Roadmap) |
|  | Funding information shared? | ❌ | ✅ | Student project (unfunded) |
|  | Deprecation policy documented? | ❌ | ✅ | Policy to be drafted |

---

**Legend:** ✅ = satisfied, ❌ = not currently satisfied.
