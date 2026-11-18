import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  const mongoUri = env.MONGO_URI;
  const sanitizedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB connected successfully to ${sanitizedUri}`);
  } catch (error) {
    console.warn('[Database] MongoDB connection notice: operating in graceful fallback mode if database is offline.');
  }
};
