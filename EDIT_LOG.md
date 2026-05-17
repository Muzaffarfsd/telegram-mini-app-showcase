# EDIT_LOG

> Append-only journal. EVERY edit the AI makes goes here.
> Latest at TOP. Each entry = one logical change (may be N file-edits).
> AI reads the last 20-30 entries at the start of every session.

---

## 2026-05-17 23:55 · Tier 0 security hardening — 7 fixes

**What:** Closed 7 of 8 planned security/correctness gaps from the audit. New file `src/security/index.ts` centralises validators + scrubbers; existing tools wired to use them.
**Why:** Audit identified 6 CRITICAL + 2 HIGH safety/correctness issues in our MCP server. Roadmap v2 Tier 0.
**Files:**
- `outputs/src/security/index.ts` (NEW) — `scrubSecrets`, `safeResolveWithin`, `assertSafeSpawn`, `assertSafeRef`, `timingSafeHmacEqual`, `SecurityError`
- `outputs/src/index.ts` — file:// resource hardened (S2), apply_edit_and_push path-resolved through `safeResolveWithin` (S2), git_init_branch validates refs (S4), Zod schemas: `.max(N)` on every string input + array bound (S7)
- `outputs/src/browser/devServer.ts` — `assertSafeSpawn(cmd, args, {shell})` allow-list + metachar check (S3)
- `outputs/src/agents/subagents.ts` — `assertSafeRef(base_branch)` + constructed branch name re-validated (S4)
- `outputs/src/git/gitOps.ts` — `pushToGithub` wraps error so `GITHUB_TOKEN` in git stderr is scrubbed (S5)
- `outputs/src/deploy/deploy.ts` — `run()` wraps exec so tokens in CLI stderr/stdout are scrubbed (S5)
- `outputs/src/webhooks/receiver.ts` — Vercel webhook HMAC compared via `timingSafeHmacEqual` (S6)
- `outputs/src/browser/browserTest.ts` — full body wrapped `try { … } finally { ctx.close() }` so Chromium context never leaks (S8)
- `outputs/dist/**` regenerated from `tsc` clean (0 errors).

**Skipped:** S1 (SDK bump to 1.30). Reason: Round-2 research agent hallucinated v1.30 existence + CVE-2026-0621. npm shows latest published 1.29.0; no 1.30 yet. Will revisit when 1.30 actually ships.

**Checkpoint:** post-commit SHA (recorded by git commit below).
**Verification:** `tsc --noEmit -p tsconfig.json` → 0 errors. `tsc -p tsconfig.json` → dist regenerated. Runtime verification deferred until next Claude Desktop restart (current MCP server is in-memory cached).

---

## 2026-05-17 22:48 · baseline established

**What:** Initial baseline for AI-assisted work. Dev environment patched for Windows + Vite HMR fix.
**Why:** User wants iPhone-widget live preview locally on Windows; original code was Replit/Linux-only.
**Files:**
- `package.json` — dev script wrapped: `npx -y cross-env NODE_ENV=development tsx --env-file=.env server/index.ts`
- `server/index.ts` — `reusePort: true` guarded behind `process.platform === 'linux'`; helmet `frameguard: false` in development (so the Electron iPhone widget can iframe localhost:5000)
- `vite.config.ts` — HMR `clientPort: 443` made Railway-only; locally → `{ clientPort: 5000, port: 5000, host: 'localhost' }`. Native FS watching enabled (`usePolling: false`).
- `.gitignore` — added `__*.bat / __*.log / __*.done` (mcp scratch files)
- `.env` — created with placeholder `DATABASE_URL` (user filled in Railway value locally)
- `start_dev.bat`, `restart_dev.bat` — Windows helpers
- `CODEBASE_INDEX.md` — full repo map (this file lives in repo)
**Checkpoint:** `cp-1779048279195` (sha `bcbce5b`)
**Verification:** Dev server boots on :5000, iPhone widget loads page, console clean.

---

<!-- Future entries appended ABOVE this line by the AI agent. Template:

## YYYY-MM-DD HH:MM · short description

**What:** one-line summary
**Why:** user request / bug fix / refactor
**Files:** [path1, path2]
**Checkpoint:** cp-<id> (sha <short-sha>)
**Verification:** run_browser_test result (load OK, 0 console errors, 0 page errors, screenshot saved at <path>)

-->
