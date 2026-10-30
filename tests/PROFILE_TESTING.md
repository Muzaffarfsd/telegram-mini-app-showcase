# Profile testing

`npm run test:profile:security` starts a local HTTP server with a deliberately unreachable test database and fake Telegram bot token. It checks signed CSRF tokens, authentication, access to project lists and rejection of spoofed IDs and malformed referral codes; it does not connect to real data.

For mobile browser scenarios, install the Playwright Chromium browser (`npx playwright install chromium`), start a local development server on port 5000, and run `npm run test:profile:e2e`. Set `PROFILE_TEST_URL` to use another **local or isolated test** URL. The test intercepts project, referral and Telegram responses and uses synthetic test data; do not use it against a live application. `PROFILE_SCREENSHOT` optionally names a local screenshot file.

The browser suite exercises phone widths, navigation, touch targets, profile font and background, project loading/details/retry, referral validation and submission, AI panel opening, reduced motion, an accessibility scan, and fallback icons when artwork fails to load. Automated Chromium emulation does not replace testing on iOS Safari, Android WebView, Telegram, VoiceOver or TalkBack. It does not prove database durability or payment correctness.

`npm run test:profile:integration` exercises referral requests against an isolated local server and an in-memory `pg-mem` database. Set `PROFILE_TEST_SITE` to the local development URL to also run the mobile journey through that server, including a test project and referral submission. This test substitutes an advisory-lock function and emulates parts of PostgreSQL, so it does not validate real PostgreSQL locking, transactions or multi-process behavior.
