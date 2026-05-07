'use client';

import React, { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { sendContactMessage } from '@/lib/contact/actions';

const ContactForm = () => {
  const t = useTranslations('marketing.home.social.form');
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; key: string } | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const formEl = e.currentTarget;
    startTransition(async () => {
      const res = await sendContactMessage(fd);
      if (res.ok) {
        setStatus({ kind: 'ok', key: 'success' });
        formEl.reset();
      } else {
        setStatus({ kind: 'error', key: `errors.${res.errorKey}` });
      }
    });
  };

  return (
    <div className="contact-card">
      <div className="contact-card__inner">
        <form onSubmit={onSubmit} className="contact-card__form" noValidate>
          <div className="contact-card__row">
            <div className="contact-card__field">
              <label htmlFor="contact-name">{t('name')}</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder={t('namePlaceholder')}
                required
                maxLength={120}
                disabled={isPending}
              />
            </div>
            <div className="contact-card__field">
              <label htmlFor="contact-email">{t('email')}</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                required
                maxLength={254}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="contact-card__field">
            <label htmlFor="contact-subject">{t('subject')}</label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              placeholder={t('subjectPlaceholder')}
              maxLength={200}
              disabled={isPending}
            />
          </div>
          <div className="contact-card__field">
            <label htmlFor="contact-message">{t('message')}</label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              placeholder={t('messagePlaceholder')}
              required
              minLength={10}
              maxLength={5000}
              disabled={isPending}
            />
          </div>

          <div className="contact-card__footer">
            <button type="submit" className="contact-card__submit" disabled={isPending}>
              <span>{isPending ? t('sending') : t('submit')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="65" height="5" viewBox="0 0 65 5">
                <path d="M968,5630h65l-4,5H972Z" transform="translate(-968 -5630)" />
              </svg>
            </button>
            {status && (
              <p className={`contact-card__status contact-card__status--${status.kind}`}>
                {t(status.key)}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
