import Redis from "ioredis";
import { config } from "./config";

let isRedisConnected = false;

const redisClient = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  retryStrategy: () => 5000,
  maxRetriesPerRequest: 1,
});

redisClient.on("error", (err) => {
  if (isRedisConnected) {
    console.error("[Redis error]:", err.message || err);
  }
  isRedisConnected = false;
});

redisClient.on("connect", () => {
  console.log("[Redis] Connected successfully.");
  isRedisConnected = true;
  redisClient.config("SET", "stop-writes-on-bgsave-error", "no").catch(() => {});
});

// In-Memory Fallback Store
const memoryStore = new Map<string, { value: any; expiresAt?: number }>();
const memorySets = new Map<string, Set<string>>();

const cleanExpiredMemoryKeys = () => {
  const now = Date.now();
  for (const [key, item] of memoryStore.entries()) {
    if (item.expiresAt && item.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
};

setInterval(cleanExpiredMemoryKeys, 10000);

export const safeRedis = {
  get: async (key: string): Promise<string | null> => {
    if (isRedisConnected) {
      try {
        return await redisClient.get(key);
      } catch {
        isRedisConnected = false;
      }
    }
    cleanExpiredMemoryKeys();
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt <= Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return item.value;
  },

  setex: async (key: string, seconds: number, value: string): Promise<string> => {
    if (isRedisConnected) {
      try {
        return await redisClient.setex(key, seconds, value);
      } catch {
        isRedisConnected = false;
      }
    }
    memoryStore.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
    return "OK";
  },

  del: async (key: string): Promise<number> => {
    if (isRedisConnected) {
      try {
        return await redisClient.del(key);
      } catch {
        isRedisConnected = false;
      }
    }
    const had = memoryStore.has(key);
    memoryStore.delete(key);
    return had ? 1 : 0;
  },

  exists: async (key: string): Promise<number> => {
    if (isRedisConnected) {
      try {
        return await redisClient.exists(key);
      } catch {
        isRedisConnected = false;
      }
    }
    cleanExpiredMemoryKeys();
    return memoryStore.has(key) ? 1 : 0;
  },

  smembers: async (key: string): Promise<string[]> => {
    if (isRedisConnected) {
      try {
        return await redisClient.smembers(key);
      } catch {
        isRedisConnected = false;
      }
    }
    const set = memorySets.get(key);
    return set ? Array.from(set) : [];
  },

  sadd: async (key: string, member: string): Promise<number> => {
    if (isRedisConnected) {
      try {
        return await redisClient.sadd(key, member);
      } catch {
        isRedisConnected = false;
      }
    }
    if (!memorySets.has(key)) {
      memorySets.set(key, new Set());
    }
    memorySets.get(key)!.add(member);
    return 1;
  },

  srem: async (key: string, member: string): Promise<number> => {
    if (isRedisConnected) {
      try {
        return await redisClient.srem(key, member);
      } catch {
        isRedisConnected = false;
      }
    }
    const set = memorySets.get(key);
    if (set) {
      set.delete(member);
    }
    return 1;
  },
};

export default safeRedis;

