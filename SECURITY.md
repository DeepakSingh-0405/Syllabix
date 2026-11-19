# Security Policy & Guidelines

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

We take the security of student academic data, private course documents, and authentication tokens seriously.

If you discover a security vulnerability in Syllabix:
1. **Do not create a public GitHub issue.**
2. Send an email to the security team or open a private security advisory on GitHub.
3. Include detailed steps to reproduce, the affected endpoints/components, and proof-of-concept payloads.
4. The maintainers will respond within 48 hours and coordinate a patch release.

---

## Security Architecture Principles

1. **Authentication:** All user authentication is verified via Supabase JWT or authorized development sessions.
2. **Private Document Storage:** Academic documents are stored in private Supabase buckets. Direct access is prohibited; downloads require short-lived cryptographic signed URLs.
3. **Demo Token Security:** Demo sessions are restricted strictly to `NODE_ENV=development`. Any attempt to present demo tokens in production environments returns `401 Unauthorized`.
4. **Input Sanitization & Injection Defense:** All user inputs used in search or database lookups must escape special regex characters to prevent Regular Expression Denial of Service (ReDoS).
5. **Information Leakage Prevention:** Production API error responses must never expose stack traces (`err.stack`), internal server file paths, or third-party service tokens to clients.
