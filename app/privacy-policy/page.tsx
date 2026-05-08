import Link from 'next/link'
import Wrapper from '@t/layout/wrapper'
import Header from '@t/layout/header/header'
import FooterTwo from '@t/layout/footer/footer-2'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Denaro collects, uses, and protects your data.',
}

const LAST_UPDATED = '2026-05-08'

const SECTIONS = [
  {
    heading: '1. Who we are',
    body: (
      <>
        Denaro (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates an AI trading
        analyst available at this site and its associated dashboard. This Privacy Policy
        explains what data we collect, why we collect it, and what choices you have.
      </>
    ),
  },
  {
    heading: '2. Information we collect',
    body: (
      <>
        <span className="block">We collect a minimal set of information to run the service:</span>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-white/75">
          <li>
            <span className="text-white">Account data</span> — email address, display
            name, and password hash (never the plaintext password).
          </li>
          <li>
            <span className="text-white">Subscription data</span> — current plan, billing
            status, and provider customer ID supplied by our payment processor.
          </li>
          <li>
            <span className="text-white">Usage data</span> — which strategy lenses you
            use, which pairs you analyze, and product analytics needed to operate and
            improve Denaro.
          </li>
          <li>
            <span className="text-white">Technical data</span> — IP address, browser,
            device, and session metadata captured by our hosting and security providers.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: '3. How we use your data',
    body: (
      <>
        We use your data to provide the analyst experience, authenticate sessions,
        process subscriptions, send essential service emails (account, billing,
        security), and improve product quality. We do not sell your personal data.
      </>
    ),
  },
  {
    heading: '4. Legal bases',
    body: (
      <>
        Where required (e.g. EU/UK/Swiss residents), we rely on the following bases:
        contract performance (running the service you signed up for), legitimate
        interest (security, fraud prevention, product improvement), legal obligation
        (tax, compliance), and consent (where explicitly requested, such as optional
        marketing communications).
      </>
    ),
  },
  {
    heading: '5. Sharing & sub-processors',
    body: (
      <>
        We share data only with vendors that help us deliver the service. Categories
        include: hosting and database (cloud infrastructure), authentication, payment
        processing (subscription billing through a Merchant of Record provider),
        transactional email, and product analytics. Each is bound by data-processing
        terms and is not allowed to use your data for their own purposes.
      </>
    ),
  },
  {
    heading: '6. Data retention',
    body: (
      <>
        We keep account data for as long as your account is active and for a reasonable
        period afterwards (typically up to 24 months) to handle disputes, fulfil
        legal/tax obligations, and prevent abuse. You can request deletion at any time
        — see Section 8.
      </>
    ),
  },
  {
    heading: '7. Security',
    body: (
      <>
        We use industry-standard safeguards: encryption in transit (TLS), encryption at
        rest for sensitive fields, hashed passwords, role-based access on the database,
        and audit logging on administrative actions. No system is perfectly secure; if
        we ever experience a qualifying breach, we will notify affected users in line
        with applicable law.
      </>
    ),
  },
  {
    heading: '8. Your rights',
    body: (
      <>
        Depending on where you live, you may have rights to access, correct, export,
        delete, or restrict processing of your personal data, and to lodge a complaint
        with a supervisory authority. To exercise any of these rights, email{' '}
        <a
          href="mailto:privacy@denaro.app"
          className="text-amber-200 underline-offset-4 hover:underline"
        >
          privacy@denaro.app
        </a>
        .
      </>
    ),
  },
  {
    heading: '9. Cookies & local storage',
    body: (
      <>
        We use first-party cookies and local storage for essential functionality
        (session, locale preference, light/dark UI state) and for limited analytics.
        You can clear or block cookies via your browser; doing so may break parts of
        the experience that rely on them.
      </>
    ),
  },
  {
    heading: '10. International transfers',
    body: (
      <>
        Your data may be processed in countries outside your home jurisdiction,
        including the United States and the European Economic Area. Where required, we
        rely on standard contractual clauses or equivalent safeguards.
      </>
    ),
  },
  {
    heading: '11. Children',
    body: (
      <>
        Denaro is not directed at children under 16. We do not knowingly collect data
        from children. If you believe a child has provided us data, contact us and we
        will delete it.
      </>
    ),
  },
  {
    heading: '12. Changes to this policy',
    body: (
      <>
        We may update this policy from time to time. Material changes will be reflected
        in the &quot;Last updated&quot; date above and, where appropriate, by direct
        notice (email or in-product).
      </>
    ),
  },
  {
    heading: '13. Contact',
    body: (
      <>
        Questions about this policy or your data? Email{' '}
        <a
          href="mailto:privacy@denaro.app"
          className="text-amber-200 underline-offset-4 hover:underline"
        >
          privacy@denaro.app
        </a>
        .
      </>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <Wrapper>
      <Header style_2={true} />

      <main className="main--area">
        <section className="pt-32 pb-10 sm:pt-40 sm:pb-14 lg:pt-44">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <p className="font-display text-[0.62rem] tracking-[0.32em] text-amber-300/85">
                // LEGAL
              </p>
              <h1 className="mt-4 font-display text-[1.9rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.4rem]">
                Privacy Policy
              </h1>
              <p className="mt-3 text-[0.85rem] text-white/55">
                Last updated: {LAST_UPDATED}
              </p>
              <p className="mt-6 text-[0.95rem] leading-relaxed text-white/75">
                This is a placeholder template tailored for Denaro. Review with counsel
                before relying on it for compliance. Replace the contact email and
                vendor list with the values that apply to your operation.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-28">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-7">
              {SECTIONS.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-md border border-amber-300/15 bg-white/[0.02] p-6 sm:p-7"
                >
                  <h2 className="font-display text-[0.95rem] font-bold uppercase tracking-[0.08em] text-white sm:text-[1.05rem]">
                    {section.heading}
                  </h2>
                  <div className="mt-3 text-[0.9rem] leading-relaxed text-white/75 sm:text-[0.95rem]">
                    {section.body}
                  </div>
                </div>
              ))}

              <div className="pt-2 text-center">
                <Link
                  href="/"
                  className="inline-block rounded-md border border-amber-300/40 px-6 py-3 font-display text-[0.74rem] font-bold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-300 hover:text-amber-100"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterTwo />
    </Wrapper>
  )
}
