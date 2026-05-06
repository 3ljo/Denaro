"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import shape from "@t/assets/img/icons/shape.svg";
import SvgIconCom from "@t/app/components/common/svg-icon-anim";

type Cycle = "monthly" | "yearly";

const TIERS = [
  { key: "free" as const, monthly: 0, yearly: 0, cta: "/register" },
  { key: "pro" as const, monthly: 19, yearly: 15, popular: true, cta: "/register?plan=pro" },
  { key: "elite" as const, monthly: 49, yearly: 39, cta: "/register?plan=elite" },
];

export default function HomePricing({ isAuthed }: { isAuthed: boolean }) {
  const t = useTranslations("marketing.pricing");
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
            const ctaHref = isAuthed ? "/dashboard" : tier.cta;

            return (
              <div className="col-xl-4 col-lg-6 col-md-8" key={tier.key}>
                <div className={`denaro-pricing__card${popular ? " is-popular" : ""}`}>
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

                  <Link href={ctaHref} className="tg-btn-3 tg-svg denaro-pricing__cta">
                    <SvgIconCom icon={shape} id={`pricing-svg-${tier.key}`} />
                    <span>{t(`tiers.${tier.key}.cta`)}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
