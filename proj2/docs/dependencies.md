# Dependency Catalog

This catalog documents the major third-party packages used by RouteDash, including version, licence, purpose, and whether they are required for core functionality. The list is generated from the `package.json` files for the backend (`proj2/server`) and the mobile client (`proj2/routedash`) and is reviewed every sprint.

| Package | Version | Licence | Layer | Required? | Purpose / Notes |
|---------|---------|---------|-------|-----------|-----------------|
| `express` | ^4.19.2 | MIT | Backend | ✅ | HTTP server powering the REST API. |
| `prisma` | ^5.16.2 | Apache-2.0 | Backend (dev) | ✅ | ORM tooling and migrations. |
| `@prisma/client` | ^5.16.2 | Apache-2.0 | Backend | ✅ | Generated Prisma client used at runtime. |
| `zod` | ^3.23.8 | MIT | Backend | ✅ | Request/response schema validation. |
| `bcryptjs` | ^2.4.3 | MIT | Backend | ✅ | Password hashing compatible with serverless environments. |
| `jsonwebtoken` | ^9.0.2 | MIT | Backend | ✅ | JWT signing and verification for sessions. |
| `vitest` | ^1.6.0 | MIT | Backend (dev) | ✅ | Unit/integration tests for server code. |
| `supertest` | ^6.3.4 | MIT | Backend (dev) | ⚪️ | Planned integration tests hitting live routes. |
| `expo` | ^51.0.18 | MIT | Mobile | ✅ | Expo runtime for the React Native app. |
| `react-native` | 0.74.3 | MIT | Mobile | ✅ | Core React Native framework. |
| `@react-navigation/native` | ^6.1.17 | MIT | Mobile | ✅ | Navigation container used across the app. |
| `@react-navigation/bottom-tabs` | ^6.6.2 | MIT | Mobile | ✅ | Tab navigation for customer/merchant views. |
| `@react-native-async-storage/async-storage` | 1.21.0 | MIT | Mobile | ✅ | Local persistence for session tokens. |
| `@testing-library/react-native` | ^12.5.2 | MIT | Mobile (dev) | ⚪️ | Planned component tests for screens. |
| `eslint` | ^8.57.1 | MIT | Tooling | ✅ | Static analysis for both backend and mobile codebases. |
| `prettier` | ^3.3.2 | MIT | Tooling | ✅ | Code formatting enforced via CI. |

⚪️ = optional/coming soon dependencies that are documented for transparency. See `package.json` files for the complete list (including transient dependencies) and consult `CHANGELOG.md` for updates.

## Review cadence

- Run `npm audit` monthly and file issues for critical/high vulnerabilities.
- Keep dev dependencies within two minor versions of latest.
- Document licence compatibility before introducing new packages; the project uses MIT and Apache-2.0 compatible licences only.

For questions about licence compliance or SBOM exports, contact the DevOps owner listed in `CONTRIBUTING.md`.
