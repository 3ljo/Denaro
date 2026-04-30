/**
 * In-memory TTL cache with in-flight deduplication.
 *
 * Two layers:
 *   1. Result cache — stores resolved values until expiresAt.
 *   2. In-flight map — when N concurrent requests miss the cache for the
 *      same key, only ONE loader runs; the others await the same promise.
 *
 * Each Vercel function instance has its own memory, so this isn't a global
 * cache — but it's enough to keep our dashboard within TwelveData's free
 * rate limit (8 req/min) and to stop the FX Factory feed from being hit
 * 3× in parallel when the news cards mount together.
 */

type Entry<T> = { value: T; expiresAt: number }

const store = new Map<string, Entry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

/** Return cached value, await an already-running loader, or run a new one. */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now()
  const hit = store.get(key) as Entry<T> | undefined
  if (hit && hit.expiresAt > now) return hit.value

  const existing = inflight.get(key) as Promise<T> | undefined
  if (existing) return existing

  const promise = loader()
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs })
      return value
    })
    .finally(() => {
      inflight.delete(key)
    })

  inflight.set(key, promise)
  return promise
}
