import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isSupabaseConfigured, isGeminiConfigured } from './config/env';
import { connectDB } from './config/database';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Hardened HTTP security headers (modern-web-guidance)
app.use(
  helmet({
    frameguard: { action: 'deny' }, // Clickjacking prevention
    noSniff: true, // MIME-sniffing prevention
    dnsPrefetchControl: { allow: false },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Cross-Origin Resource Sharing
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API routes
app.use('/api/v1', apiRouter);

// Root greeting
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Syllabix Backend API (MERN + Supabase + Google Gemini)',
    documentation: '/api/v1/health',
  });
});

// Central error handler
app.use(errorHandler);

// Start HTTP listener and connect to MongoDB
const server = app.listen(env.PORT, '0.0.0.0', () => {
  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : env.PORT;
  console.log(`[Syllabix Server] Server running on http://127.0.0.1:${actualPort}`);
  console.log(
    `[Syllabix Server] Supabase integration: ${
      isSupabaseConfigured ? env.SUPABASE_URL : 'Offline/mock mode'
    }`
  );
  console.log(
    `[Syllabix Server] Gemini AI Engine: ${
      isGeminiConfigured ? 'Live API (x-goog-api-key)' : 'Deterministic context synthesis mode'
    }`
  );
  connectDB();
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[Syllabix Server Error] Port ${env.PORT} is already in use by another process.\n` +
      `Tip: You can specify a different port using the PORT environment variable (e.g. PORT=5002 npm run dev), ` +
      `or terminate the process currently listening on port ${env.PORT}.`
    );
    process.exit(1);
  } else {
    console.error('[Syllabix Server Error] Unexpected server error:', err);
    process.exit(1);
  }
});

export default app;
