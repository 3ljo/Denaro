"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import shape from '@t/assets/img/icons/shape.svg';
import SvgIconCom from '../common/svg-icon-anim';

// Denaro: replaces the template's tournament-results section with the
// landing page's primary CTA copy moved down out of the hero. Keeps the
// section's layout shell (.match__result-area) so spacing + section
// dividers above/below stay consistent with the rest of the page.
const MatchResultArea = () => {
  const t = useTranslations('marketing.home.heroCta');
  return (
    <section className="match__result-area denaro-cta-section">
      <div
        className="match__result-bg denaro-cta-bg"
        style={{ height: '100%', bottom: 0, top: 'auto' }}
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-11">
            <div className="text-center denaro-hero-copy">
              <span className="denaro-eyebrow">
                <span className="denaro-eyebrow__line" aria-hidden />
                <span className="denaro-eyebrow__text">{t('eyebrow')}</span>
                <span className="denaro-eyebrow__line" aria-hidden />
              </span>

              <h2 className="denaro-title">
                <span className="denaro-title__d">{t('title').charAt(0)}</span>{t('title').slice(1)}
              </h2>

              <p className="denaro-subtitle">{t('subtitle')}</p>

              <div className="denaro-cta-row">
                <Link href="/register" className="tg-btn-3 tg-svg mx-auto">
                  <SvgIconCom icon={shape} id="svg-1" />
                  <span>{t('ctaPrimary')}</span>
                </Link>
                <Link href="/pricing" className="denaro-ghost-btn">
                  {t('ctaSecondary')}
                </Link>
              </div>

              <p className="denaro-trust">{t('trust')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MatchResultArea;
