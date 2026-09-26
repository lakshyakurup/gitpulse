import { ApiMeta } from "@/types";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  staleAt: number;
  meta: ApiMeta;
}

interface CacheStats {
  hits: number;
  misses: number;
  staleHits: number;
  writes: number;
}

const stats: CacheStats = {
  hits: 0,
  misses: 0,
  staleHits: 0,
  writes: 0,
};

const memoryStore = new Map<string, CacheEntry<unknown>>();

const STORAGE_KEY_PREFIX = "gitpulse-cache:";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readEntry<T>(key: string): CacheEntry<T> | null {
  if (canUseStorage()) {
    try {
      const item = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
      if (!item) return null;
      return JSON.parse(item) as CacheEntry<T>;
    } catch {
      return null;
    }
  }

  return (memoryStore.get(key) as CacheEntry<T> | undefined) ?? null;
}

function writeEntry<T>(key: string, entry: CacheEntry<T>) {
  if (canUseStorage()) {
    window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(entry));
    return;
  }

  memoryStore.set(key, entry as CacheEntry<unknown>);
}

export function getCachedValue<T>(key: string, allowStale = false): { value: T | null; meta?: ApiMeta } {
  const entry = readEntry<T>(key);
  if (!entry) {
    stats.misses += 1;
    return { value: null };
  }

  const now = Date.now();
  if (entry.expiresAt > now) {
    stats.hits += 1;
    return { value: entry.value, meta: { ...entry.meta, cached: true, stale: false } };
  }

  if (allowStale && entry.staleAt > now) {
    stats.staleHits += 1;
    return { value: entry.value, meta: { ...entry.meta, cached: true, stale: true, note: "Using stale cache." } };
  }

  stats.misses += 1;
  return { value: null };
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number, staleTtlMs = ttlMs * 2, meta: ApiMeta) {
  writeEntry<T>(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    staleAt: Date.now() + staleTtlMs,
    meta,
  });
  stats.writes += 1;
}

export function getCacheTelemetry() {
  const requests = stats.hits + stats.misses + stats.staleHits;
  const cacheHits = stats.hits + stats.staleHits;
  const cacheHitRate = requests > 0 ? Math.round((cacheHits / requests) * 100) : 0;

  return {
    ...stats,
    cacheHitRate,
  };
}
