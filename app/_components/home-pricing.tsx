"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { SubscriptionTier } from "@/lib/profile/types";
import shape from "@t/assets/img/icons/shape.svg";
import SvgIconCom from "@t/app/components/common/svg-icon-anim";

type Cycle = "monthly" | "yearly";

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
};

type TierKey = SubscriptionTier;

const TIERS: { key: TierKey; monthly: number; yearly: number; popular?: boolean }[] = [
  { key: "free", monthly: 0, yearly: 0 },
  { key: "pro", monthly: 19, yearly: 15, popular: true },
  { key: "elite", monthly: 49, yearly: 39 },
];

// Builds the right CTA href for each tile based on auth state + current
// tier. Logged-out users go to /register?plan=X (signup, then upgrade after
// auth). Logged-in free users go straight to /api/billing/checkout, which
// either redirects to Lemon Squeezy or to /pricing?status=coming-soon
// when LS isn't configured yet. Same-tier shows a disabled "Current plan"
// state. Lower tiers show a portal link so the user can downgrade.
function buildCta(args: {
  card: TierKey;
  cycle: Cycle;
  isAuthed: boolean;
  currentTier: SubscriptionTier | null;
}): { href: string; disabled?: boolean; key: "default" | "current" | "manage" | "upgrade" } {
  const { card, cycle, isAuthed, currentTier } = args;

  // Logged out — original behavior. Pick a plan, then sign up.
  if (!isAuthed) {
    if (card === "free") return { href: "/register", key: "default" };
    return { href: `/register?plan=${card}`, key: "default" };
  }

  // Logged in but no profile loaded yet (shouldn't normally happen).
  if (!currentTier) return { href: "/dashboard", key: "default" };

  // Same tier as current → show "Current plan", disabled.
  if (card === currentTier) {
    return { href: "/dashboard", disabled: true, key: "current" };
  }

  // Going UP. Hit the checkout API which routes to LS or coming-soon.
  if (TIER_RANK[card] > TIER_RANK[currentTier]) {
    if (card === "free") return { href: "/dashboard", key: "default" };
    const plan = `${card}_${cycle}`;
    return { href: `/api/billing/checkout?plan=${plan}`, key: "upgrade" };
  }

  // Going DOWN — direct the user to the LS customer portal to cancel /
  // downgrade. Falls back to coming-soon if not yet wired.
  return { href: "/api/billing/portal", key: "manage" };
}

export default function HomePricing({
  isAuthed,
  currentTier,
}: {
  isAuthed: boolean;
  currentTier?: SubscriptionTier | null;
}) {
  const t = useTranslations("marketing.pricing");
  const tCta = useTranslations("marketing.pricing.ctaState");
  const [cycle, setCycle] = useState<Cycle>("yearly");

  return (
    <section id="pricing" className="denaro-pricing section-pt-130 section-pb-140">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-10">
            <div className="section__title text-center mb-50 title-shape-none">
              <h3 className="title">{t("hero.title")}</h3>
              <p className="denaro-pricing__sub">{t("hero.subtitle")}</p>
            </div>

            <div className="denaro-pricing__toggle-wrap">
              <div className="denaro-pricing__toggle" role="tablist" aria-label="Billing cycle">
                <button
                  type="button"
                  role="tab"
                  aria-selected={cycle === "monthly"}
                  className={`denaro-pricing__toggle-btn${cycle === "monthly" ? " is-active" : ""}`}
                  onClick={() => setCycle("monthly")}
                >
                  {t("billing.monthly")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={cycle === "yearly"}
                  className={`denaro-pricing__toggle-btn${cycle === "yearly" ? " is-active" : ""}`}
                  onClick={() => setCycle("yearly")}
                >
                  {t("billing.yearly")}
                  <span className="denaro-pricing__save">{t("billing.save")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center gy-4">
          {TIERS.map((tier) => {
            const popular = !!tier.popular;
            const price = cycle === "monthly" ? tier.monthly : tier.yearly;
            const features = t.raw(`tiers.${tier.key}.features`) as string[];
            const cta = buildCta({
              card: tier.key,
              cycle,
              isAuthed,
              currentTier: currentTier ?? null,
            });
            const ctaLabel =
              cta.key === "current"
                ? tCta("current")
                : cta.key === "manage"
                  ? tCta("manage")
                  : cta.key === "upgrade"
                    ? tCta("upgrade")
                    : t(`tiers.${tier.key}.cta`);

            return (
              <div className="col-xl-4 col-lg-6 col-md-8" key={tier.key}>
                <div className={`denaro-pricing__card${popular ? " is-popular" : ""}${cta.key === "current" ? " is-current" : ""}`}>
                  {popular && (
                    <span className="denaro-pricing__badge">{t("tiers.popular")}</span>
                  )}

                  <p className="denaro-pricing__eyebrow">{`// ${tier.key.toUpperCase()}`}</p>
                  <h4 className="denaro-pricing__name">{t(`tiers.${tier.key}.name`)}</h4>
                  <p className="denaro-pricing__tagline">{t(`tiers.${tier.key}.tagline`)}</p>

                  <div className="denaro-pricing__price">
                    {price === 0 ? (
                      <>
                        <span className="denaro-pricing__amount">$0</span>
                        <span className="denaro-pricing__per">{t("billing.free")}</span>
                      </>
                    ) : (
                      <>
                        <span className="denaro-pricing__amount">${price}</span>
                        <span className="denaro-pricing__per">
                          {t("billing.perMonth")}
                          <small>
                            {cycle === "yearly"
                              ? t("billing.perMonthBilledYearly")
                              : t("billing.monthly")}
                          </small>
                        </span>
                      </>
                    )}
                  </div>

                  <ul className="denaro-pricing__features">
                    {features.map((f, i) => (
                      <li key={i}>
                        <span className="denaro-pricing__check" aria-hidden>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <polyline
                              points="20 6 9 17 4 12"
                              stroke="currentColor"
                              strokeWidth="2.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {cta.disabled ? (
                    <span
                      aria-disabled="true"
                      className="tg-btn-3 tg-svg denaro-pricing__cta denaro-pricing__cta--current"
                    >
                      <SvgIconCom icon={shape} id={`pricing-svg-${tier.key}`} />
                      <span>{ctaLabel}</span>
                    </span>
                  ) : (
                    <Link href={cta.href} className="tg-btn-3 tg-svg denaro-pricing__cta">
                      <SvgIconCom icon={shape} id={`pricing-svg-${tier.key}`} />
                      <span>{ctaLabel}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
