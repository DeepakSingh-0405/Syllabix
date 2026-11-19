# Syllabix Deployment & Production Operations Guide

## 1. Production Architecture Overview
- **Frontend Hosting:** Vercel / Netlify / Firebase App Hosting (Static SPA bundle served via CDN).
- **Backend API Hosting:** Render / Railway / Google Cloud Run (Containerized Node.js runtime).
- **Database:** MongoDB Atlas (M10+ cluster with automated backups and replica sets).
- **Storage & Auth:** Supabase Cloud (Managed Auth, Storage, and Realtime).

---

## 2. Environment Variables Matrix

### Backend (`server/.env`)
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | No | `5001` | Express listen port |
| `NODE_ENV` | Yes | `development` | Runtime environment (`production`/`development`) |
| `CLIENT_URL` | Yes | `http://localhost:5173` | Allowed CORS origin |
| `MONGO_URI` | Yes | - | MongoDB connection URI |
| `SUPABASE_URL` | Yes | - | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | - | Privileged Supabase API key |
| `SUPABASE_ANON_KEY` | Yes | - | Public Supabase API key |
| `GEMINI_API_KEY` | Yes | - | Google Gemini AI key |
| `ALLOW_DEMO_TOKENS` | No | `false` | Must be `false` in production |

### Frontend (`client/.env`)
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `/api/v1` | URL for backend REST API |
| `VITE_SUPABASE_URL` | Yes | - | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY`| Yes | - | Public Supabase anon key |

---

## 3. Production Build & Startup
```bash
# Build backend TypeScript
cd server && npm run build

# Build client production bundle
cd ../client && npm run build

# Start production server
cd ../server && npm start
```

## 4. Health & Liveness Checks
The orchestrator or load balancer should poll:
```http
GET /api/v1/health
```
A healthy deployment returns HTTP 200 with `status: "ok"` and `mongoConnected: true`.
