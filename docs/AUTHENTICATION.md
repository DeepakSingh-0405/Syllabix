# Syllabix Authentication & Authorization Architecture

## 1. Dual Authentication Strategy
Syllabix supports a dual-mode authentication architecture:
1. **Production Mode (Supabase Auth):** Uses cryptographic JSON Web Tokens (JWT) signed by Supabase Auth with Google OAuth or Email/Password credentials.
2. **Development Demo Mode:** Enables instant developer evaluation via preconfigured demo tokens when `ALLOW_DEMO_TOKENS=true` in `NODE_ENV=development`.

---

## 2. JWT Verification Flow
When an HTTP request includes an `Authorization: Bearer <token>` header:
1. Middleware inspects the token prefix.
2. If the token is a demo token (`demo-token-...`):
   - In `development`: Permitted only if `ALLOW_DEMO_TOKENS=true`. Extracts demo profile.
   - In `production`: **Rejected with HTTP 401 Unauthorized**.
3. If the token is a standard JWT:
   - Verified against `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
   - Extracts `sub` (User ID), email, and claims.
   - Populates `req.user = { id, email, role }`.

---

## 3. Role-Based Access Control (RBAC)
- **Guest / Unauthenticated:** Can view public subject directories, syllabus outlines, and published discussions.
- **Student (Authenticated):** Can ask AI questions, upload resources, create discussions, review flashcards, and join study rooms.
- **Resource Owner:** Can update, edit metadata, or delete their uploaded files.
- **Discussion Owner:** Can mark an answer as accepted.
- **Admin / Faculty:** Can verify uploaded course syllabi, moderate reported resources, and inspect institutional analytics.
