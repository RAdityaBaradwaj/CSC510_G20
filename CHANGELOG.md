# Changelog

All notable changes to this project will be documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Expo EAS build artefacts published under Releases (Android `.apk`, iOS `.ipa` test build).
- Accessibility audit (WCAG 2.1 AA) scheduled with findings to be documented in `proj2/docs/accessibility.md`.

## [0.5.0] - 2025-11-06
### Added
- 100+ backend unit tests (Vitest) covering auth, menu management, order lifecycle, and infrastructure helpers.
- GitHub Actions workflows for linting, formatting, typed builds, backend test suite, and Codecov coverage uploads.
- Full documentation suite: installation, deployment, API reference, sustainability self-assessment, repository rubric, and team poster assets.
- Project governance documents (`CODE_OF_CONDUCT`, `CONTRIBUTING`, `SECURITY`) and license (MIT).

### Changed
- README revamped with badges, demo embed, quick-start table, and testing instructions.
- Prisma service layer hardened with stricter error handling and audit logging coverage.

### Fixed
- Type-check errors in restaurant menu section updates and missing type definitions for `bcryptjs`.

[Unreleased]: https://github.com/RAdityaBaradwaj/CSC510_G20/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/RAdityaBaradwaj/CSC510_G20/releases
