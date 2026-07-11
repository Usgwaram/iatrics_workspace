# Transactional Email Setup

## Architecture

Iatrics transactional email is provider-agnostic. Controllers call workflow helpers in `src/services/email/email.workflow.js`, which call the central `EmailService`. The service validates recipients, validates required template data, renders HTML and text, selects the configured provider, writes an `email_logs` record when an idempotency key is available, and returns a normalized result.

Email failures are logged with sensitive values redacted and should not roll back a successful booking, payment, provider approval, or withdrawal.

## Providers

Set one provider:

```env
EMAIL_PROVIDER=resend
EMAIL_PROVIDER=smtp
EMAIL_PROVIDER=console
```

Use `console` locally and in tests. It logs sanitized metadata only, not rendered bodies, reset links, verification tokens, clinical notes, prescriptions, or payment secrets.

Use Resend for production transactional email. Use Google Workspace SMTP only for low-volume staging or beta testing.

## Required Environment Variables

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM_NAME=Iatrics
EMAIL_FROM_ADDRESS=notifications@iatrics.ng
EMAIL_REPLY_TO=support@iatrics.ng
APP_NAME=Iatrics
APP_WEB_URL=https://iatrics.ng
APP_API_URL=https://api.iatrics.ng
USER_APP_URL=
PROVIDER_APP_URL=
SUPPORT_EMAIL=support@iatrics.ng
INFO_EMAIL=info@iatrics.ng
MEDIA_EMAIL=media@iatrics.ng
MARKETING_EMAIL=marketing@iatrics.ng
EMAIL_LOGO_URL=
EMAIL_RETRY_ATTEMPTS=2
EMAIL_RETRY_BASE_DELAY_MS=250
CRON_SECRET=
```

Do not commit API keys, SMTP credentials, or cron secrets.

## Resend Setup

1. Create a Resend account.
2. Add a verified sending domain or subdomain.
3. Prefer a dedicated transactional subdomain such as `mail.iatrics.ng` or `notify.iatrics.ng`.
4. Add the SPF/DKIM records Resend provides.
5. Do not alter the primary Google Workspace MX records.
6. Send a low-volume production test after DNS verification.

`iatrics.ng` already has working SPF, DKIM, and DMARC for Google Workspace. Any third-party transactional provider must also be authorized correctly before production use.

Example DNS records are provider-specific. Treat Resend's dashboard values as authoritative.

## Google Workspace SMTP Fallback

For staging or beta:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notifications@iatrics.ng
SMTP_PASS=<app-password-or-approved-smtp-credential>
```

Recommended sender identities:

- `Iatrics Accounts <accounts@iatrics.ng>`
- `Iatrics Appointments <appointments@iatrics.ng>`
- `Iatrics Payments <payments@iatrics.ng>`
- `Iatrics Providers <providers@iatrics.ng>`
- `Iatrics Support <support@iatrics.ng>`
- `Iatrics Notifications <notifications@iatrics.ng>`

If these are Google Workspace aliases instead of full accounts, configure them as send-as aliases for the SMTP account. Do not use `admin@iatrics.ng` as the default public sender.

## Local Development

Use:

```env
EMAIL_PROVIDER=console
```

Preview templates:

```bash
npm run email:preview
```

The previews are written to `work/email-previews/`.

## Staging Setup

1. Set `EMAIL_PROVIDER=console` until template and workflow tests pass.
2. Switch to `EMAIL_PROVIDER=smtp` or `resend` only after credentials are configured.
3. Set `APP_WEB_URL`, `APP_API_URL`, `USER_APP_URL`, and `PROVIDER_APP_URL`.
4. Run the email log migration.
5. Configure a secured cron trigger using `CRON_SECRET`.

## Production Setup

1. Verify the transactional sending domain in Resend.
2. Set `EMAIL_PROVIDER=resend`.
3. Set `RESEND_API_KEY` in the deployment environment only.
4. Set sender, reply-to, support, and app URL variables.
5. Run migrations before deploying controller hooks.
6. Configure the consultation reminder job.
7. Monitor bounces, complaints, provider logs, and suppression lists.

## Consultation Reminders

The job is implemented in `src/jobs/email/consultationReminder.job.js`. It currently supports 24-hour and 1-hour reminders, skips cancelled or completed consultations, uses UTC internally, and relies on `email_logs.idempotencyKey` to avoid duplicates.

Secured endpoint:

```http
POST /api/jobs/email/consultation-reminders
X-Cron-Secret: <CRON_SECRET>
```

Use Render Cron Jobs, GitHub Actions, or another production scheduler to call the endpoint. Do not expose it without `CRON_SECRET`.

## Retries and Failed Messages

`EMAIL_RETRY_ATTEMPTS` and `EMAIL_RETRY_BASE_DELAY_MS` control bounded retries. Failures are stored in `email_logs` with status, attempt count, provider, and sanitized error code. Full rendered bodies are not stored.

## Adding a Template

1. Add a file under `src/emails/templates`.
2. Define `required`, `sender`, optional `healthDisclaimer`, and `render(data)`.
3. Register the template in `src/emails/emailRenderer.js`.
4. Add sample data to `scripts/previewEmails.js`.
5. Add tests for required variables, escaping, HTML, and text.

## Privacy and Security

- Do not include sensitive clinical details in subject lines or preview text.
- Do not attach prescriptions or laboratory files by default.
- Use "View in Iatrics" links that require authentication.
- Do not log passwords, tokens, JWTs, Paystack authorization codes, full bank account numbers, card details, full prescriptions, clinical notes, or medical files.
- Payment values must come from trusted backend records or verified Paystack webhook data.
- Marketing email requires consent and unsubscribe handling and must not be mixed with transactional messages.
- Begin with low-volume legitimate traffic.
- Keep DMARC in monitoring mode until all legitimate senders are aligned, then move toward quarantine and reject.

## Safe Test Email

Use `EMAIL_PROVIDER=console` for automated tests. To test a real provider, send only to an internal Iatrics address and avoid one-line test content in production.

## Authentication Email Workflows

Registration creates the account, issues a cryptographically secure email-verification token, stores only a SHA-256 hash, and sends the existing account-verification template. The raw token is never stored and is not returned by the API. Email delivery failures are logged safely and do not delete or roll back the account.

Provider accounts authenticate through the owning `users` row in this backend. Provider verification therefore uses the user's email-verification fields and provider-specific web fallback URLs when `role` is `PROVIDER`.

### Verification Endpoints

```http
POST /api/auth/verify-email
Content-Type: application/json

{ "token": "<verification-token>" }
```

```http
GET /api/auth/verify-email?token=<verification-token>
```

Successful verification:

```json
{
  "success": true,
  "message": "Email verified",
  "data": {
    "emailVerified": true,
    "emailVerifiedAt": "2026-07-11T00:00:00.000Z"
  },
  "error": null
}
```

Invalid, expired, or reused tokens return a safe validation error. On success the token hash, expiry, and sent timestamp are cleared and the welcome email is sent.

### Resend Verification

```http
POST /api/auth/resend-verification
Content-Type: application/json

{ "email": "person@example.com" }
```

The response is enumeration-safe:

```json
{
  "success": true,
  "message": "If the account exists and needs verification, a verification email will be sent.",
  "data": null,
  "error": null
}
```

Resend invalidates the previous active verification token and stores only the new token hash. Cooldown is controlled by `EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS`.

### Password Reset Request

```http
POST /api/auth/password-reset/request
Content-Type: application/json

{ "email": "person@example.com" }
```

The response is identical whether or not the account exists:

```json
{
  "success": true,
  "message": "If the account exists, password reset instructions will be sent.",
  "data": null,
  "error": null
}
```

When the account exists, Iatrics generates a secure token, stores only its SHA-256 hash, expires it after `PASSWORD_RESET_EXPIRES_MINUTES`, and sends the password-reset template. Cooldown is controlled by `PASSWORD_RESET_COOLDOWN_SECONDS`.

### Password Reset Completion

```http
POST /api/auth/password-reset/confirm
Content-Type: application/json

{
  "token": "<reset-token>",
  "password": "NewPassword123!"
}
```

The password must be at least 8 characters and include uppercase, lowercase, and numeric characters. On success, the password is hashed with bcrypt and reset-token fields are cleared so the token cannot be reused.

### Verification Enforcement

`REQUIRE_EMAIL_VERIFICATION=false` preserves current beta app compatibility: registration succeeds and unverified users can still log in, with `isVerified` and `emailVerifiedAt` returned safely. Set `REQUIRE_EMAIL_VERIFICATION=true` before public production launch to block login until verification.

Existing accounts are not silently marked verified by this migration. For production rollout, choose one controlled path before enabling enforcement:

- run a reviewed backfill for trusted existing users, or
- run a verification campaign and keep `REQUIRE_EMAIL_VERIFICATION=false` until completion.

### Auth Environment Variables

```env
REQUIRE_EMAIL_VERIFICATION=false
EMAIL_VERIFICATION_EXPIRES_MINUTES=1440
EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS=300
PASSWORD_RESET_EXPIRES_MINUTES=30
PASSWORD_RESET_COOLDOWN_SECONDS=300
USER_WEB_VERIFICATION_URL=https://iatrics.ng/verify-email
USER_WEB_PASSWORD_RESET_URL=https://iatrics.ng/reset-password
PROVIDER_WEB_VERIFICATION_URL=https://iatrics.ng/provider/verify-email
PROVIDER_WEB_PASSWORD_RESET_URL=https://iatrics.ng/provider/reset-password
AUTH_RATE_LIMIT_MAX=10
```

The web URLs are secure fallback routes. If Flutter deep links are preferred, the apps still need matching deep-link handlers for verification and password reset.

### Staging Auth Test Procedure

```bash
npm run db:migrate:staging
npm run email:preview
npm run test:email
npm test
```

Automated tests use `EMAIL_PROVIDER=console` and do not send real email. For a real staging provider test, manually call a dedicated script or endpoint with a nominated internal recipient after confirming DNS and provider credentials.

## SPF, DKIM, and DMARC Checks

Inspect Google Workspace and Resend dashboards, then verify records with DNS tools before switching production traffic. Do not overwrite existing Google Workspace MX records.

## Withdrawal Models

`Withdrawal` and `WithdrawalRequest` currently overlap. They remain intentionally separate in this email and authentication rollout. Future consolidation requires a controlled data migration, endpoint audit, payout workflow audit, and rollback plan.
