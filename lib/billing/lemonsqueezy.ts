import 'server-only'

// =====================================================================
// Lemon Squeezy billing config + helpers
// =====================================================================
// Phase 4 of the strategy-tier rollout. The UI surfaces (settings panel,
// pricing CTAs) call into this module; until the env vars below are
// populated and the variant IDs match a real LS store, the helpers
// return null and the API routes fall back to a "coming soon" redirect.
//
// Required env vars (Vercel — Production + Preview):
//   LEMONSQUEEZY_API_KEY            — bearer token from LS dashboard
//   LEMONSQUEEZY_STORE_ID           — numeric store id
//   LEMONSQUEEZY_WEBHOOK_SECRET     — HMAC secret for /api/billing/webhook
//   LEMONSQUEEZY_VARIANT_PRO_MONTHLY
//   LEMONSQUEEZY_VARIANT_PRO_YEARLY
//   LEMONSQUEEZY_VARIANT_ELITE_MONTHLY
//   LEMONSQUEEZY_VARIANT_ELITE_YEARLY
// =====================================================================

export type LemonSqueezyPlan =
  | 'pro_monthly'
  | 'pro_yearly'
  | 'elite_monthly'
  | 'elite_yearly'

export const LEMONSQUEEZY_PLANS: LemonSqueezyPlan[] = [
  'pro_monthly',
  'pro_yearly',
  'elite_monthly',
  'elite_yearly',
]

export function isLemonSqueezyPlan(value: unknown): value is LemonSqueezyPlan {
  return typeof value === 'string' && (LEMONSQUEEZY_PLANS as string[]).includes(value)
}

// Maps each plan to the variant id env var. Variant ids come from the LS
// dashboard (Products → Variants); paste them into the env vars above.
function getVariantId(plan: LemonSqueezyPlan): string | null {
  const value =
    plan === 'pro_monthly'
      ? process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY
      : plan === 'pro_yearly'
        ? process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY
        : plan === 'elite_monthly'
          ? process.env.LEMONSQUEEZY_VARIANT_ELITE_MONTHLY
          : process.env.LEMONSQUEEZY_VARIANT_ELITE_YEARLY
  return value && value.trim() !== '' ? value.trim() : null
}

export function isLemonSqueezyConfigured(): boolean {
  return !!process.env.LEMONSQUEEZY_API_KEY && !!process.env.LEMONSQUEEZY_STORE_ID
}

/**
 * Creates a Lemon Squeezy checkout URL for the given plan, tied back to a
 * specific user via custom_data so the webhook can flip profiles.tier.
 *
 * Returns null when LS isn't configured yet — caller should redirect to
 * /pricing?status=coming-soon in that case.
 */
export async function createCheckoutUrl(args: {
  plan: LemonSqueezyPlan
  userId: string
  email: string
}): Promise<string | null> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const variantId = getVariantId(args.plan)
  if (!apiKey || !storeId || !variantId) return null

  // Phase 4 final wiring: POST to LS /v1/checkouts with the variant + custom
  // user_id. Until then, returning null falls through to the coming-soon
  // page. Skeleton kept so the wire-up is mechanical.
  //
  // const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
  //   method: 'POST',
  //   headers: {
  //     Accept: 'application/vnd.api+json',
  //     'Content-Type': 'application/vnd.api+json',
  //     Authorization: `Bearer ${apiKey}`,
  //   },
  //   body: JSON.stringify({
  //     data: {
  //       type: 'checkouts',
  //       attributes: {
  //         checkout_data: {
  //           email: args.email,
  //           custom: { user_id: args.userId },
  //         },
  //       },
  //       relationships: {
  //         store: { data: { type: 'stores', id: storeId } },
  //         variant: { data: { type: 'variants', id: variantId } },
  //       },
  //     },
  //   }),
  // })
  // const json = await res.json()
  // return json?.data?.attributes?.url ?? null
  return null
}

// Maps a Lemon Squeezy variant id back to our internal SubscriptionTier so
// the webhook can decide what to write to profiles.tier. Returns null for
// unknown variants (different store, deleted variant) so the webhook can
// log + skip rather than corrupt the user's tier.
export function getTierForVariant(variantId: string): 'pro' | 'elite' | null {
  const trimmed = variantId.trim()
  if (
    trimmed === process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY ||
    trimmed === process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY
  ) {
    return 'pro'
  }
  if (
    trimmed === process.env.LEMONSQUEEZY_VARIANT_ELITE_MONTHLY ||
    trimmed === process.env.LEMONSQUEEZY_VARIANT_ELITE_YEARLY
  ) {
    return 'elite'
  }
  return null
}

/**
 * Verifies a Lemon Squeezy webhook signature. LS signs every webhook with
 * HMAC-SHA256 against the webhook secret in the X-Signature header.
 *
 * Returns true if the signature matches, false otherwise. Caller should
 * 401 on false.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret || !signature) return false

  // Use the Web Crypto API (works on Vercel Functions / Node 20+).
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody))
  const expected = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // Constant-time-ish comparison.
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}
