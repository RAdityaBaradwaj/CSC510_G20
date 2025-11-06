# Security Policy

We take the security of RouteDash seriously. If you believe you have found a security vulnerability, please follow the steps below so we can address it quickly and responsibly.

---

## Supported versions

We currently provide security updates for the `main` branch. Older tags receive fixes on a case-by-case basis.

---

## Reporting a vulnerability

1. Email `security@routedash.dev` with the subject line `SECURITY`.
2. Include:
   - A description of the vulnerability.
   - Steps to reproduce or proof-of-concept code.
   - The potential impact.
   - Any suggested remediation.
3. Do **not** open a public GitHub issue or pull request for security findings.

We will acknowledge receipt within **72 hours** and provide an estimate of next steps. Once the issue is resolved, we will coordinate public disclosure with you.

---

## Best practices for reporters

- If the vulnerability involves third-party dependencies, note the affected packages and versions.
- Avoid accessing or modifying data beyond what is necessary to demonstrate the issue.
- Do not share the vulnerability before it is resolved.

---

## Security updates

- Security fixes are merged into `main` and released under a dedicated tag (e.g., `v0.4.1-security`).
- Release notes document the vulnerability, remediation, and CVE (when applicable).
- We recommend that all users update to the latest release promptly.

---

Thank you for helping keep RouteDash secure!
