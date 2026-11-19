import mongoose from 'mongoose';
import { env } from './env';

let isReconnecting = false;
let reconnectTimer: NodeJS.Timeout | null = null;
let listenersInitialized = false;

export type ConnectionState = 'connected' | 'connecting' | 'disconnecting' | 'disconnected';

export const getConnectionState = (): ConnectionState => {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};

export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

/**
 * Initializes connection lifecycle listeners to handle disconnects,
 * errors, and automatic reconnections without crashing the process.
 */
export const setupMongoLifecycleListeners = (): void => {
  if (listenersInitialized) return;
  listenersInitialized = true;

  mongoose.connection.on('connected', () => {
    isReconnecting = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    console.log('[Database] MongoDB connection established.');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected. Academic services switching to graceful fallback mode.');
    scheduleReconnect();
  });

  mongoose.connection.on('reconnected', () => {
    isReconnecting = false;
    console.log('[Database] MongoDB connection successfully re-established.');
  });

  mongoose.connection.on('error', (err: any) => {
    console.error('[Database] MongoDB connection error:', err?.message || err);
    scheduleReconnect();
  });
};

const scheduleReconnect = (): void => {
  if (isReconnecting || mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }
  isReconnecting = true;

  reconnectTimer = setTimeout(async () => {
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.MONGO_URI, {
          serverSelectionTimeoutMS: 2500,
        });
      }
      isReconnecting = false;
    } catch (err: any) {
      console.warn('[Database] MongoDB reconnect attempt failed, will retry on next cycle:', err?.message || err);
      isReconnecting = false;
      if (mongoose.connection.readyState === 0) {
        scheduleReconnect();
      }
    }
  }, 5000);
};

export const connectDB = async (): Promise<void> => {
  setupMongoLifecycleListeners();

  const mongoUri = env.MONGO_URI;
  const sanitizedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB connected successfully to ${sanitizedUri}`);
  } catch (error: any) {
    console.warn('[Database] MongoDB connection notice: operating in graceful fallback mode if database is offline.');
    scheduleReconnect();
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  isReconnecting = false;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => null);
  }
};
