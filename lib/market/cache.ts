/**
 * In-memory TTL cache for serverless route handlers.
 *
 * Each Vercel function instance has its own memory — this isn't a global
 * cache — but it deduplicates concurrent / rapid-succession requests against
 * the same warm instance, which is enough to keep us inside the TwelveData
 * free-tier rate limit (8 req/min) when the dashboard polls aggressively.
 */

type Entry<T> = { value: T; expiresAt: number }

const store = new Map<string, Entry<unknown>>()

/** Return cached value or run loader and cache the result. */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now()
  const hit = store.get(key) as Entry<T> | undefined
  if (hit && hit.expiresAt > now) return hit.value
  const value = await loader()
  store.set(key, { value, expiresAt: now + ttlMs })
  return value
}
