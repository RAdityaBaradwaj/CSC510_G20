# Contributing to RouteDash

Thanks for considering a contribution! This document explains how we collaborate, develop, and review changes. Please read it before submitting pull requests.

---

## Ground rules

- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Discuss substantial changes in a GitHub Issue before opening a PR.
- Keep pull requests scoped: 1 feature/fix per PR; link issues in the description.
- Write or update tests for every change—especially for bug fixes and edge cases.
- Keep the commit history clean (use `git rebase` before merging when needed).

---

## Development workflow

1. **Create an issue**
   - Use the feature or bug template.
   - Capture context, acceptance criteria, and test expectations.

2. **Branch naming**
   - `feature/<short-summary>` for features (`feature/menu-status-badge`)
   - `fix/<short-summary>` for fixes (`fix/login-cookie-expiry`)
   - `docs/<short-summary>` for documentation updates

3. **Set up**
   ```bash
   git checkout main
   git pull
   git checkout -b feature/my-task
   ```
   Then follow the [installation guide](INSTALL.md) to provision dependencies.

4. **Coding standards**
   - API (TypeScript/Node): follow ESLint + Prettier rules (`npm run lint` will tell you what to fix).
   - Mobile (React Native): follow `@react-native-community/eslint-config`.
   - Use meaningful variable names, avoid magic numbers, and document complex logic.

5. **Testing**
   - `npm run test` executes the Vitest suites (API).
   - `npm run test:coverage` enforces coverage thresholds (API).
   - If you add React Native components, include Jest/Vitest tests in `proj2/routedash/__tests__/`.
   - Snapshot tests must be deterministic (seed your fixtures).

6. **Run quality gates locally**
   ```bash
   npm run --prefix proj2/server lint
   npm run --prefix proj2/server test:coverage
   npm run --prefix proj2/server typecheck
   npm run --prefix proj2/routedash lint
   ```

7. **Open a pull request**
   - Target `main`.
   - Fill out the PR template (automatically loaded).
   - Attach screenshots or screen recordings for UI changes.
   - Request a review from one backend and one frontend owner when applicable.

8. **Review & merge**
   - Reviews focus on correctness, readability, maintainability, and tests.
   - Address feedback via follow-up commits (do not force-push over reviewer comments).
   - Merge using “Squash & Merge” once checks pass and approvals are granted.
   - Delete the feature branch unless it is still in use elsewhere.

---

## Commit message conventions

- Use the imperative mood (`Add`, `Fix`, `Refactor`).
- Prefix with a component tag when helpful:
  - `api: add menu item audit log`
  - `mobile: fix route planner copy`
  - `docs: update sustainability table`
- Keep summaries ≤ 72 characters.
- Provide extra detail in the body when the diff is non-trivial.

---

## Issue triage labels

| Label | Meaning |
|-------|---------|
| `priority:high` | Needs attention before the next release |
| `type:bug` | Regression or incorrect behaviour |
| `type:feature` | New functionality |
| `type:docs` | Documentation-only updates |
| `needs-discussion` | Requires synchronous discussion before implementation |
| `good first issue` | Suitable for new contributors |

---

## Security disclosures

Please do **not** open public issues for security vulnerabilities. Instead, follow the steps in [SECURITY.md](SECURITY.md).

---

Thanks again for contributing to RouteDash! 🙌
