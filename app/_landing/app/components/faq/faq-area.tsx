'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import TextAnimation from '../common/text-animation';

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const;

const FaqArea = () => {
  const t = useTranslations('marketing.home.faq');

  // JSON-LD FAQPage schema for Google rich results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map((k) => ({
      '@type': 'Question',
      name: t(`items.${k}.q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`items.${k}.a`),
      },
    })),
  };

  return (
    <section id="faq" className="faq__area">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-7 col-lg-9 col-md-10">
            <div className="section__title text-center mb-50">
              <TextAnimation title={t('eyebrow')} />
              <h3 className="title">{t('title')}</h3>
              <p className="faq__lead">{t('lead')}</p>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-10">
            <div className="faq__list">
              {FAQ_KEYS.map((k) => (
                <details key={k} className="faq__item">
                  <summary className="faq__question">
                    <span className="faq__q-text">{t(`items.${k}.q`)}</span>
                    <span className="faq__icon" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </summary>
                  <div className="faq__answer">
                    <p>{t(`items.${k}.a`)}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqArea;
