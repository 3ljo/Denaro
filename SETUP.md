# Setup Guide

Follow these steps in order. Skip nothing.

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

Go to <https://supabase.com>, create a new project, wait for it to provision.

## 3. Run the database schema

In the Supabase dashboard:

1. Open **SQL Editor**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

This creates the `profiles` table, RLS policies, and the auto-create trigger.

## 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — from **Project Settings → API → Project URL**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from **Project Settings → API → Project API keys → anon public**

## 5. Configure Supabase Auth (THIS IS CRITICAL)

### 5a. Site URL & Redirect URLs

**Authentication → URL Configuration**

- **Site URL:** `http://localhost:3000` (in dev) — change to your production domain when you deploy
- **Redirect URLs:** add these patterns one per line:
  - `http://localhost:3000/**`
  - `https://yourdomain.com/**` (when you deploy)

If a URL isn't on this list, the verification link in emails will fail.

### 5b. Email templates — IMPORTANT

**Authentication → Email Templates**

The default templates use a hash-based redirect (`#access_token=...`) that
puts tokens in the URL fragment — old, less secure pattern. Switch every
template to use `{{ .ConfirmationURL }}` with `token_hash` so tokens stay
out of URLs and logs.

Update **at least these two templates**:

#### "Confirm signup" template

Replace the link with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">
  Confirm your email
</a>
```

#### "Reset password" template

Replace the link with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
  Reset your password
</a>
```

### 5c. Password policy

**Authentication → Policies → Password Requirements**

- Minimum length: **12**
- Require: lowercase, uppercase, digits (or whatever your threat model needs)
- Enable **Leaked password protection** (checks against Have I Been Pwned)

### 5d. Rate limits

**Authentication → Rate Limits**

Supabase has built-in IP-based rate limits. The defaults are conservative
but worth reviewing:

- Sign-ups: 30/hour per IP
- Password resets: 30/hour per IP
- Email sends: limited per project (upgrade to custom SMTP for production)

### 5e. Custom SMTP (production only)

**Authentication → SMTP Settings**

Supabase's built-in mail relay is rate-limited and may land in spam. For
production, configure a real provider: Resend, SendGrid, AWS SES, Postmark.

### 5f. Session settings

**Authentication → Sessions**

- **JWT expiry:** 3600 (1 hour) is a sensible default — middleware refreshes automatically
- **Refresh token rotation:** ENABLED
- **Refresh token reuse interval:** 10 seconds (default is fine)

These two together mean: if an attacker steals a refresh token, the moment
the legitimate user refreshes theirs, the attacker's becomes invalid AND
Supabase detects the reuse and revokes the entire session family.

## 6. Run the app

```bash
npm run dev
```

Visit <http://localhost:3000>. You'll be redirected to `/login`.

## 7. Test the full flow

1. Click "Create one" → register with a real email
2. Check your inbox — click the verification link
3. You should land on `/dashboard` automatically (logged in)
4. Sign out
5. Try to log in — works
6. Try `/forgot-password` → check email → click link → set new password
7. Sign in with the new password

## 8. Production deployment checklist

- [ ] Site URL updated to production domain in Supabase
- [ ] Redirect URLs include production domain
- [ ] Custom SMTP configured
- [ ] Email templates updated (sender name, branding)
- [ ] HSTS header enabled (already in `next.config.js`)
- [ ] CSP reviewed for any third-party scripts you add
- [ ] Consider adding **Cloudflare Turnstile** or **hCaptcha** to register/forgot-password forms to block bots
- [ ] Consider enabling **MFA** in Supabase for high-value accounts
