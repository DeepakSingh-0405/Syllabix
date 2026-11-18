import crypto from 'crypto';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

export class CacheService {
  private inMemoryStore: Map<string, CacheEntry> = new Map();

  /**
   * Generates deterministic hash key for queries
   */
  hashKey(prefix: string, payload: any): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hash = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
    return `${prefix}:${hash}`;
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.inMemoryStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return entry.value as T;
  }

  /**
   * Set cached value with TTL (in seconds)
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    this.inMemoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Check sliding window rate limit
   * Returns { allowed: boolean, remaining: number, resetSeconds: number }
   */
  async checkRateLimit(
    userId: string,
    limit: number = 25,
    windowSeconds: number = 600
  ): Promise<{ allowed: boolean; remaining: number; resetSeconds: number }> {
    const key = `ratelimit:ai:${userId}`;
    const now = Date.now();
    const entry = this.inMemoryStore.get(key);

    if (!entry || now > entry.expiresAt) {
      this.inMemoryStore.set(key, {
        value: 1,
        expiresAt: now + windowSeconds * 1000,
      });
      return { allowed: true, remaining: limit - 1, resetSeconds: windowSeconds };
    }

    const currentCount = Number(entry.value) || 0;
    const remainingTime = Math.ceil((entry.expiresAt - now) / 1000);

    if (currentCount >= limit) {
      return { allowed: false, remaining: 0, resetSeconds: remainingTime };
    }

    entry.value = currentCount + 1;
    return { allowed: true, remaining: limit - (currentCount + 1), resetSeconds: remainingTime };
  }

  /**
   * Distributed lock (SETNX equivalent)
   */
  async acquireLock(resourceId: string, ttlSeconds: number = 300): Promise<boolean> {
    const key = `lock:doc_proc:${resourceId}`;
    const now = Date.now();
    const existing = this.inMemoryStore.get(key);

    if (existing && now <= existing.expiresAt) {
      return false; // lock already held
    }

    this.inMemoryStore.set(key, {
      value: true,
      expiresAt: now + ttlSeconds * 1000,
    });
    return true;
  }

  async releaseLock(resourceId: string): Promise<void> {
    this.inMemoryStore.delete(`lock:doc_proc:${resourceId}`);
  }
}

export const cacheService = new CacheService();
