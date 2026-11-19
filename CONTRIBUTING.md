# Contributing to Syllabix

Thank you for contributing to Syllabix! To maintain high engineering quality, consistency, and a clean Git history, please adhere to these guidelines.

---

## 1. Development Principles

1. **Never Rebuild from Scratch:** Syllabix has an established architecture, design system, and data model. Build upon the existing structure.
2. **Sequential Task Execution:** Implement, test, verify, and commit one atomic feature or fix at a time.
3. **Purity of Design Tokens:** Always use established CSS variables and Tailwind classes from `client/src/tokens.css`. Never introduce arbitrary raw colors or unapproved typography scales.
4. **Zero Untested Code:** Every bug fix or feature must include a corresponding test or update to existing test suites before merging.

---

## 2. Git Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>
```

### Allowed Types:
- `feat`: Net-new user-facing functionality or API capabilities.
- `fix`: Bug fixes, parser repairs, or security remediations.
- `docs`: Documentation updates, architecture specifications, or guidelines.
- `refactor`: Code reorganization with zero behavior changes.
- `perf`: Measurable performance optimizations.
- `security`: Security patches, permission enforcement, or sanitization.
- `test`: Addition or modification of automated tests.
- `chore`: Build tooling, dependency management, or workspace configurations.

### Commit Rules:
- **One task = one dedicated commit.** Do not bundle unrelated tasks into one commit.
- Never force push (`git push -f`).
- Never commit credentials, `.env` files, or binary artifacts.

---

## 3. Pull Request Guidelines

1. Ensure both `npm run build:server` and `npm run build:client` pass with 0 errors.
2. Ensure `npm test` passes all verification checks.
3. Keep pull requests focused on a single responsibility.
4. Fill out the provided Pull Request template in full.
