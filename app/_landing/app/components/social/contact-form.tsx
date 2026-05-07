'use client';

import React, { useMemo, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { sendContactMessage } from '@/lib/contact/actions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
const MIN_MESSAGE = 10;

type FieldKey = 'name' | 'email' | 'subject' | 'message';
type Errors = Partial<Record<FieldKey, string>>;

const ContactForm = () => {
  const t = useTranslations('marketing.home.social.form');

  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formRef = useRef<HTMLFormElement>(null);

  const validate = (v: typeof values): Errors => {
    const e: Errors = {};
    const name = v.name.trim();
    if (!name) e.name = t('errors.invalidName');
    else if (name.length < 2) e.name = t('errors.invalidName');

    const email = v.email.trim();
    if (!email) e.email = t('errors.invalidEmail');
    else if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL) e.email = t('errors.invalidEmail');

    if (v.subject.length > MAX_SUBJECT) e.subject = t('errors.subjectTooLong');

    const msg = v.message.trim();
    if (!msg) e.message = t('errors.invalidMessage');
    else if (msg.length < MIN_MESSAGE) e.message = t('errors.invalidMessage');
    else if (msg.length > MAX_MESSAGE) e.message = t('errors.invalidMessage');

    return e;
  };

  const errors = useMemo(() => validate(values), [values]);
  const showError = (field: FieldKey) =>
    (touched[field] || submitAttempted) && errors[field];

  const messageCount = values.message.length;
  const messageOver = messageCount > MAX_MESSAGE;

  const onChange =
    (field: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      if (serverError) setServerError(null);
    };

  const onBlur = (field: FieldKey) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setServerError(null);

    const fieldErrors = validate(values);
    if (Object.keys(fieldErrors).length > 0) {
      // Focus the first invalid field for accessibility.
      const order: FieldKey[] = ['name', 'email', 'subject', 'message'];
      const first = order.find((k) => fieldErrors[k]);
      if (first && formRef.current) {
        const el = formRef.current.querySelector<HTMLElement>(`[name="${first}"]`);
        el?.focus();
      }
      return;
    }

    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await sendContactMessage(fd);
      if (res.ok) {
        setSubmitted(true);
        setValues({ name: '', email: '', subject: '', message: '' });
        setTouched({ name: false, email: false, subject: false, message: false });
        setSubmitAttempted(false);
      } else {
        setServerError(t(`errors.${res.errorKey}`));
      }
    });
  };

  if (submitted) {
    return (
      <div className="contact-card contact-card--success" role="status" aria-live="polite">
        <svg
          className="contact-card__check"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <h4 className="contact-card__success-title">{t('successTitle')}</h4>
        <p className="contact-card__success-body">{t('successBody')}</p>
        <button
          type="button"
          className="contact-card__submit"
          onClick={() => setSubmitted(false)}
        >
          <span>{t('sendAnother')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="65" height="5" viewBox="0 0 65 5">
            <path d="M968,5630h65l-4,5H972Z" transform="translate(-968 -5630)" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="contact-card">
      <form ref={formRef} onSubmit={onSubmit} className="contact-card__form" noValidate>
        {/* Honeypot — bots fill it, humans don't see it. */}
        <div className="contact-card__honeypot" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="contact-card__row">
          <div className="contact-card__field">
            <label htmlFor="contact-name">
              {t('name')} <span className="contact-card__required" aria-hidden>*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              placeholder={t('namePlaceholder')}
              value={values.name}
              onChange={onChange('name')}
              onBlur={onBlur('name')}
              required
              maxLength={MAX_NAME}
              autoComplete="name"
              disabled={isPending}
              aria-invalid={showError('name') ? true : undefined}
              aria-describedby={showError('name') ? 'contact-name-error' : undefined}
            />
            {showError('name') && (
              <p id="contact-name-error" className="contact-card__error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="contact-card__field">
            <label htmlFor="contact-email">
              {t('email')} <span className="contact-card__required" aria-hidden>*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={values.email}
              onChange={onChange('email')}
              onBlur={onBlur('email')}
              required
              maxLength={MAX_EMAIL}
              autoComplete="email"
              inputMode="email"
              disabled={isPending}
              aria-invalid={showError('email') ? true : undefined}
              aria-describedby={showError('email') ? 'contact-email-error' : undefined}
            />
            {showError('email') && (
              <p id="contact-email-error" className="contact-card__error">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="contact-card__field">
          <label htmlFor="contact-subject">{t('subject')}</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder={t('subjectPlaceholder')}
            value={values.subject}
            onChange={onChange('subject')}
            onBlur={onBlur('subject')}
            maxLength={MAX_SUBJECT}
            disabled={isPending}
            aria-invalid={showError('subject') ? true : undefined}
            aria-describedby={showError('subject') ? 'contact-subject-error' : undefined}
          />
          {showError('subject') && (
            <p id="contact-subject-error" className="contact-card__error">
              {errors.subject}
            </p>
          )}
        </div>

        <div className="contact-card__field">
          <div className="contact-card__field-head">
            <label htmlFor="contact-message">
              {t('message')} <span className="contact-card__required" aria-hidden>*</span>
            </label>
            <span
              className={`contact-card__counter${messageOver ? ' contact-card__counter--over' : ''}`}
              aria-live="polite"
            >
              {messageCount} / {MAX_MESSAGE}
            </span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            placeholder={t('messagePlaceholder')}
            value={values.message}
            onChange={onChange('message')}
            onBlur={onBlur('message')}
            required
            minLength={MIN_MESSAGE}
            maxLength={MAX_MESSAGE}
            disabled={isPending}
            aria-invalid={showError('message') ? true : undefined}
            aria-describedby={showError('message') ? 'contact-message-error' : undefined}
          />
          {showError('message') && (
            <p id="contact-message-error" className="contact-card__error">
              {errors.message}
            </p>
          )}
        </div>

        <div className="contact-card__footer">
          <button type="submit" className="contact-card__submit" disabled={isPending}>
            <span>{isPending ? t('sending') : t('submit')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="65" height="5" viewBox="0 0 65 5">
              <path d="M968,5630h65l-4,5H972Z" transform="translate(-968 -5630)" />
            </svg>
          </button>
          <p className="contact-card__privacy">{t('privacy')}</p>
        </div>

        {serverError && (
          <p className="contact-card__status contact-card__status--error" role="alert">
            {serverError}
          </p>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
