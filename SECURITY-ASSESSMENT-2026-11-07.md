# WEB4TG — security implementation, 2026-11-07

This records implemented controls and actual verification, not an assertion that every possible attack is prevented. Production/account controls must be verified separately as described in `SECURITY.md`.

## Confirmed application weaknesses addressed

| Area | Change |
| --- | --- |
| Telegram identity | Strict HMAC, expiry, duplicate/size/date checks, rejected historic credential fingerprint and invalid production placeholders. |
| Bot control | Webhook secret verification, safe same-service provisioning, admin-only configuration and notifications. |
| Projects and personal records | Signed identity and ownership checks; client-provided paid status is not trusted. |
| Payments and rewards | Stripe status/owner verified by server; client-triggered reward webhook disabled, manual awards restricted, coin debit conditional and atomic. |
| Uploads | Authenticated namespace, size/MIME/file-signature validation; generation-bound copy to a separate published path, not overwritable by the earlier PUT URL. |
| Browser credential/data handling | Same-origin API boundary, redirects rejected, CSRF on changes, no durable private API cache or automatic write replay. |
| Public exposure | Full source snapshots removed; credentials/source maps/dotfiles/backups denied; logs, tracing and monitoring redact credentials. |
| Common request boundary | Exact origins, production CSP, bounded inputs/rate/timeouts; newly added APIs are private by default. |
| Supply chain | Supported Node 24, patched dependencies, deterministic install without third-party lifecycle scripts, pinned CI actions, regression/audit/type/secret checks and Dependabot configuration. |

## Verification performed

- Full dependency audit: **58 advisories before, 0 after**. Production dependency audit: **50 before, 0 after**. This means zero *known registry advisories at the time of review*, not a guarantee of zero defects.
- **37 unit/regression tests passed**, plus the isolated backend integration. Covers forged identity, owner/admin boundaries, webhook settings, payments/rewards, media versions, malformed inputs, cache/queue leakage, trusted proxy addressing and dependency SDK compatibility.
- Production browser checks: **26 routes passed** — five core pages, eleven active demo routes (ten canonical demos plus an alias), and ten safe unavailable fallbacks for retired registry entries. No JavaScript page errors or CSP violations were observed. Headers, closed API probes and private static-path denials passed. State-changing requests were intercepted by this browser smoke; backend changes were tested separately against an in-memory database.
- Actual Chromium service-worker regression passed: previous private caches/queues were removed; different identities did not share API cache data; offline reads/writes did not return stale private data or replay later.
- Vite production build passed. `npm run check:security` passed for all server/shared files. The broader project check still has 45 unrelated client-side diagnostics; this release does not claim that full UI TypeScript debt is cleared.
- Clean isolated dependency installation succeeded, including native esbuild/Sharp checks; patched Zod/Drizzle/form resolver/Storage/Archiver compatibility and real-schema Drizzle generation were tested without touching a live database. The final small tsx update was checked with its lock, audit and runtime tests.
- The historical credential found in documentation was rejected by Telegram during a read-only check. No bot messages, payments or database changes were sent by that check. Values were never printed. Historic Git copies still exist; credential revocation is the provider-side defence.

## Boundaries and remaining operational verification

- No live attack/load test, independent penetration test or physical Telegram-device test was performed. Cloud Storage publication was tested with SDK-shaped mocks, not a live bucket. The in-memory database test is not a real PostgreSQL concurrency/load certification.
- The CSP/browser tests used a local production server with isolated fake database and synthetic identity, not production customer data. Actual Railway rollout and headers must be checked after publication.
- `ADMIN_TELEGRAM_IDS` remains an operator choice. If empty, administrative actions are denied for everyone; ordinary public studio/demo viewing is unaffected.
- A valid deployed bot's provisioning status must be checked. No current bot credential was present locally. Unknown/custom callback configurations are deliberately not taken over.
- Railway documents default network DDoS filtering. Per-service WAF incident settings, account MFA/permissions, database/storage IAM, quotas and backup restore tests remain provider/account settings. They were not silently marked completed. Under Attack Mode must not be enabled blindly because it blocks non-browser Telegram webhook traffic. Local browser access was disabled in Work, so these account settings could not be inspected here.
- Legacy Stripe order creation is admin-only until a proper server-priced order/fulfilment workflow exists. The current studio order flow continues through Telegram; demo checkouts remain demonstrations.
- Future trusted demos inherit the common browser/API perimeter. Every real data operation still needs tenant/owner enforcement and regression tests. Arbitrary untrusted JavaScript requires a separate origin; a shared React route cannot provide that isolation.

Reference baseline: [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [Telegram Mini Apps validation](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app), [Telegram webhook authentication](https://core.telegram.org/bots/api#setwebhook), [OWASP CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [Express security](https://expressjs.com/en/advanced/best-practice-security/).
