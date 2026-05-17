# IMPROVEMENT_ROADMAP — World-Class MCP Coding Agent

> Synthesis of 5 parallel research streams (17 May 2026):
> 1. SOTA coding agents (Replit A4 / Cursor / v0 / Lovable / Devin / Claude Code / Jules / Cline / Windsurf / Trae)
> 2. MCP protocol & ecosystem evolution (SDK 1.0 → 1.30, spec 2025-11-25)
> 3. Code audit of our `replit-clone-mcp` (53 specific issues)
> 4. Browser-automation SOTA (Browser-Use / Stagehand / Playwright MCP / Computer Use)
> 5. Multi-agent self-reflection (LangGraph / Devin / TDFlow / MAR / SWE-bench leaders)

## TL;DR — where we stand vs world-class

We have **the skeleton right**: stdio MCP server, 22 tools, git-worktree sub-agents, Playwright self-test, multi-platform deploy, persistent memory files. This already beats 80% of public MCP servers.

We are **missing the 6 features that separate Replit Agent 4 / Cursor Composer 2 / Jules from "yet another wrapper"**:
1. Rubric self-grading
2. CI-failure auto-fix daemon
3. a11y-tree-first browser (vs raw screenshots)
4. Tasks primitive for long-running tools (MCP 2025-11-25)
5. Auto-merge worktree conflict resolver
6. Critic/reviewer sub-agent gate before commits

We have **6 CRITICAL security/correctness bugs** that must be fixed before this server is exposed beyond a single trusted machine.

---

## TIER 0 — IMMEDIATE (security + correctness, ≤1 day)

These are non-negotiable before next deploy.

| # | Issue | Where | Fix |
|---|---|---|---|
| S1 | **CVE-2026-0621** (ReDoS in UriTemplate, MCP SDK v1.29.0) | outputs/package.json | Bump `@modelcontextprotocol/sdk` to `^1.30.0` |
| S2 | **Path traversal** in `file://{+filepath}` resource | src/index.ts:944-960 | `path.normalize` BEFORE join; reject if normalized contains `..`; resolve symlinks via `fs.realpath` and reassert prefix |
| S3 | **Command injection** in spawnDevServer args | src/browser/devServer.ts:76-91 | Validate `cmd` against allow-list (`npm`/`pnpm`/`yarn`/`bun`/`node`/`cmd.exe`); validate args don't contain shell metacharacters when `shell: true` |
| S4 | **Git branch name injection** | src/agents/subagents.ts:81, variants.ts:92 | Validate against regex `^[a-zA-Z0-9._/-]+$`, max length 200 |
| S5 | **Token leakage in error messages** | src/git/gitOps.ts:66, src/deploy/deploy.ts:97 | Scrub `GITHUB_TOKEN` / `VERCEL_TOKEN` / `*_API_TOKEN` from stderr before returning |
| S6 | **Webhook HMAC timing attack** | src/webhooks/receiver.ts:92-93 | Replace `!==` with `crypto.timingSafeEqual()` on equal-length buffers |
| S7 | **Input length limits** | src/index.ts:310, 425, 497 | `.max(N)` on every `z.string()` in tool inputs (commit_message: 2000, branch: 200, body: 50000) |
| S8 | **Browser context not closed on exception** | src/browser/browserTest.ts:62-112 | Wrap entire body in `try { … } finally { await ctx.close().catch(() => {}); }` |

**Effort: ~6 hours. Reward: server is safe to expose.**

---

## TIER 1 — FOUNDATION (1-2 weeks)

Brings us to "production-grade" — feature parity with most-deployed MCP servers (Slack/GitHub/Notion).

### MCP protocol updates (per spec 2025-11-25)

| # | Add | Why |
|---|---|---|
| F1 | **Tool annotations** (`destructiveHint`, `readOnlyHint`, `idempotentHint`, `openWorldHint`, `icon`) on every tool | Lets the LLM/client warn user before destructive ops. We already emit some — fill the gaps. |
| F2 | **Migrate long-running tools to Tasks primitive** (`attach_repository`, `live_preview`, `run_browser_test`, `apply_edit_and_push`, `spawn_sub_agent_task`, `deploy_to_environment`, `generate_ui_variants`) | Doesn't block JSON-RPC; can poll/cancel. P95 target <500 ms for fast tools, everything else async. |
| F3 | **Progress notifications** every ≥1s for ops >2s | User feedback in widget; cancellable. |
| F4 | **Honor `notifications/cancelled`** within 250 ms — release child process, browser context, git lock | Currently we have NO cancellation handling. |
| F5 | **Declare `tools.listChanged: true`** and emit notification when `attach_repository` rebinds capability surface | Clients auto-refresh tool catalogues. |
| F6 | **Structured error returns** — `isError: true` + JSON body with `code/recoverable/hint` rather than throwing McpError for tool failures | Lets the model self-correct without protocol-level retry. |
| F7 | **Streamable HTTP transport** as alternative to stdio | Enables remote deploy (Cloud Run, Railway). HTTP+SSE is deprecated 30 Jun 2026. |

### Correctness fixes from code audit

| # | Issue | Where | Fix |
|---|---|---|---|
| C1 | Silent error swallowing in clone | src/index.ts:195-202 | Bubble clone failures with actionable hint (auth/network/disk) |
| C2 | Orphaned child processes on timeout | src/browser/devServer.ts:71-122 | On `waitForPort` reject, also `treeKill(child.pid)` |
| C3 | Race on `livePreviews`/`canvases`/`devServers` maps | src/index.ts:99 | Use `async-mutex` for state mutations |
| C4 | Worktree leak on server crash | src/agents/subagents.ts:79-110 | Persist `subAgents` to JSON on each mutation; on boot, validate worktrees still exist and `reapSubAgent` ghosts |
| C5 | In-memory checkpoint list | src/agents/checkpoints.ts:15 | Read git tags matching `cp-*` on boot to restore checkpoint list |
| C6 | Repo walk has no cycle detection | src/codebase/ingest.ts:30-65 | Track visited `inode` (or `realpath`) set |
| C7 | No retry/backoff on Octokit calls | src/git/gitOps.ts:198-234 | Use `@octokit/plugin-retry` and `@octokit/plugin-throttling` |
| C8 | `repo_overview` returns ALL files in one shot | src/index.ts:855 | Stream via Tasks or paginate (`?after=lastPath&limit=200`) |

### Observability

| # | Add | Why |
|---|---|---|
| O1 | Structured audit log per tool call (request, principal, latency, outcome) → file + OTLP | Required for any multi-user setup |
| O2 | Pino → JSON log to stderr; in dev pretty-print | Searchable, parseable |
| O3 | Per-tool metrics counter (success/fail/latency P50/P95) → Prometheus on /metrics | Detect perf regressions |

**Effort: ~50-80 hours. Reward: production-deployable.**

---

## TIER 2 — DIFFERENTIATION (3-6 weeks)

Brings us to **Replit Agent 4 / Cursor Composer 2 level**. Each item is high leverage.

### D1. Plan-then-Step state machine (Devin pattern)

A new tool `propose_plan(task: string)` returns a markdown plan with N steps. Each step has its own `step_id`, expected files, success criteria. Then `execute_step(step_id)` runs one step + verifies. User approves/edits plan before any write. State persisted in `.agent-state/plan-<task-id>.json`.

**Expected lift:** +8-12 pts on SWE-bench-class tasks. Mirrors Devin 2.2's "interactive planning" + "dynamic re-planning."

### D2. TDFlow — test-first generation

For UI tasks: agent first writes a Playwright assertion ("after click X, element Y has text 'foo'"), then code, runs the assertion, iterates. For backend: vitest/jest unit test, then implementation.

**Expected lift:** +15-25 pts on SWE-Bench Lite per TDFlow paper (88.8% vs ~61% baseline).

Implementation: new tool `write_test_from_spec(spec)` + `run_tests(filter?)`. Hook into Tier 1's Tasks primitive.

### D3. Static-analysis fast loop (<3s)

Background daemon: on every file write, run `tsc --noEmit --incremental`, ESLint, type-coverage on changed files only. Feed structured errors back to the agent BEFORE the LLM-review pass.

**Catches 60-70% of trivial bugs without an LLM call.** Latency budget 3s — beyond that, agents start ignoring.

New tool: `quick_check(files: string[])` → `{ errors: [{file, line, severity, code, message, fix}] }`.

### D4. Critic sub-agent gate (binary APPROVE / REVISE, max 3 loops)

Before any `apply_edit_and_push`, spawn a reviewer Haiku sub-call with prompt:

> Here is the diff. Here is the test report. Reply with EXACTLY one line: `APPROVE` or `REVISE: <one specific issue>`.

Loop up to 3 times. **Pairwise rubric > absolute score** (avoids LLM-judge agreeableness bias documented in OpenReview 2026).

**Expected lift:** +6-10 pts (MAR paper shows +6.2 on HumanEval pass@1, 76.4 → 82.6).

New tool: `review_diff(diff: string, rubric: string)` → `{ verdict, issue?, suggested_fix? }`.

### D5. a11y-tree-first browser tool

Replace the screenshot-by-default `run_browser_test` with `browser_snapshot` that returns the **accessibility tree** (role/name/description + interactive states). Screenshot is opt-in.

- **~4× fewer tokens** than screenshots in LLM context
- Deterministic (no flaky pixels)
- Mirrors Microsoft's Playwright MCP design (`browser_snapshot` tool)

Then `compare_snapshots(before, after)` returns structural diff: "button added at /header/nav[3]", "text 'Buy' changed to 'Покупка' at /main/h1".

### D6. CI-failure auto-fix daemon (Jules pattern)

Express webhook receiver (we already have it) gets `check_run.completed` with `conclusion: failure`. Pull logs via Octokit, extract error → spawn sub-agent with prompt "this CI run failed, here's the log, fix it" → push fix commit to same branch.

This is **the single feature that most separates Jules from everyone else** per our SOTA survey. We have all the primitives; need ~150 lines of glue.

### D7. Auto-merge worktree conflict resolver (Replit Agent 4 pattern)

When `merge_sub_agent_task` returns conflicts:
1. Pull the three sides (base/ours/theirs) of each conflicted file (already exposed)
2. Hand to Haiku sub-agent with prompt: "produce a unified version preserving both intents"
3. Write resolved file, stage, commit
4. Replit Agent 4 claims **~90% auto-resolution** rate — we should hit similar with Sonnet 4.6

### D8. Decisions memory (Mem0 or Letta-compatible)

`.agent-state/decisions.jsonl` — append-only log:

```jsonl
{"id":"d1","ts":...,"path":"client/src/App.tsx","decision":"used Wouter routing not React Router","because":"smaller bundle, project preference","sha":"abc123"}
```

Tools: `record_decision`, `recall_decisions(path | keyword)`. AI consults BEFORE making cross-cutting changes ("did we already decide this?").

**Expected lift:** +3-5 pts on long-horizon multi-session tasks per Mem0's 2026 state-of-memory report.

### D9. Skills loader (Claude Code pattern)

Discovers `.skills/<skill-name>/SKILL.md` files in the repo. Each skill = a folder of instructions + helper scripts the agent loads on demand.

E.g. `.skills/add-telegram-mini-app/SKILL.md` — exact prompt + code template for adding a new demo to this specific repo.

Tools: `list_skills` (resource: `skill://`), `invoke_skill(name, args)`. Mirrors Anthropic's Skills design.

**Effort: ~150-250 hours over 3-6 weeks. Reward: parity with Replit A4 / Cursor / Jules.**

---

## TIER 3 — UNIQUE STRENGTHS (8-12 weeks)

Past parity, into novel territory. Pick 2-3 based on what users actually need.

### U1. Figma MCP bridge

Proxy to Figma Dev Mode MCP (official). Convert: design → component code with exact tokens (colors, font sizes, spacing). Closes the design-to-code gap in one tool: `import_figma_node(url) → tsx`.

### U2. Mobile-native preview (Expo / Capacitor bridge)

For React Native / Telegram WebApp testing, integrate Expo MCP server: `expo_screenshot_simulator`, `expo_run_e2e`. macOS-only locally; on Windows/Linux use Browserbase remote browsers in mobile viewport mode.

### U3. Spec-driven memory (Tessl pattern)

Repository-level `SPEC.md` is the source of truth — not chat. Agent writes spec → derives tasks → derives code. Spec is updated in PRs and grounds all future reasoning. New tools: `read_spec`, `propose_spec_update(diff)`.

### U4. Multi-frame responsive preview

iPhone widget + iPad widget + desktop widget side-by-side. Replit Agent 4's Design Canvas does this. We have the iPhone widget; spinning up Desktop + Tablet variants is a CSS-only change to the Electron host.

### U5. Variant generator + thumbnail board

`generate_ui_variants` already exists but lacks **rendered thumbnails**. Add: for each variant boot dev-server → `browser_snapshot` → `page.screenshot` → embed thumbnail in `canvas://{id}` resource as base64. Client UI shows a 2×3 grid of variant thumbnails.

### U6. Eval harness in CI

GitHub Action runs **MCPJam Inspector + lastmile-ai/mcp-eval** on every PR to our MCP server. Defines fixture tasks ("add a new demo named X, ensure it renders") with pass/fail. Regression prevention.

### U7. Smithery / mcp.so listing

Publish to both registries with proper `server.json`, icon, screenshots, structured tool annotations. Effort: ~1 day, big visibility win.

### U8. OAuth 2.1 + PKCE for remote mode

Required when hosting Streamable HTTP server multi-tenant. Reference: WorkOS 2026 best-practices guide. Use `oauth4webapi` + `@modelcontextprotocol/sdk/server/auth/...`.

### U9. Rootless OCI container per tool execution

`spawn_dev_server`, `npm install`, `git operations` run inside seccomp-restricted containers. Even if a tool is compromised, blast radius = container. Per Red Hat 2026 MCP runtime-security guidance.

### U10. CodeSandbox Nodebox fallback

When user's machine can't run dev-server (no Node, on iPad, etc.), boot the dev server inside Sandpack Nodebox (works in Safari/iOS) and proxy via the MCP server. Sub-second cold-start.

---

## What we deprioritize

- **Computer-Use / pixel-vision agent loop on every diff** — cost too high. Use only when a11y-tree + pixel-diff disagree (the "tiebreaker" pattern from Stagehand).
- **Full multi-persona Reflexion (5+ critic agents)** — marginal lift over single critic, 5× the spend.
- **DCR for OAuth** — superseded by Client ID Metadata Documents per spec 2025-11-25.
- **HTTP+SSE transport** — deprecated 30 Jun 2026.
- **Custom AST parser via tree-sitter native** — already burned us on Windows builds; regex-based extractor is good enough for the symbol-lookup use case.

---

## What success looks like

- **Tier 0 done** → no CVEs, no obvious security holes, server safe to expose remotely
- **Tier 1 done** → can list on Smithery / mcp.so as production-grade; matches GitHub MCP / Notion MCP in maturity
- **Tier 2 done** → matches **Replit Agent 4 / Cursor Composer 2 / Jules** in features; SWE-bench Verified estimate jumps from baseline ~40% to ~75-85% with proper test harness
- **Tier 3 (selective) done** → unique strengths nobody else has (Figma bridge + iPhone widget + multi-frame canvas + spec-driven memory)

---

## Concrete next-week sprint (proposed)

Day 1 (security): S1, S2, S3, S4, S5, S6, S7, S8 — close TIER 0.
Day 2-3: F1, F6, C2, C5, C7 — protocol annotations + checkpoint persistence + Octokit retry.
Day 4-5: D3 (static-analysis fast loop) — biggest single-day ROI.
Day 6-7: D4 (critic gate) — wired into existing apply_edit_and_push.
Week 2: D5 (a11y-tree browser) + D6 (CI auto-fix daemon).
Week 3+: D1 (plan-then-step) + D2 (TDFlow) — the big-impact items.

## Source bibliography

See git log for full source citations from each research stream (commit `<this-commit-sha>` body). Primary references:

- [@modelcontextprotocol/sdk releases](https://github.com/modelcontextprotocol/typescript-sdk/releases)
- [MCP 2025-11-25 spec](https://modelcontextprotocol.io/specification/2025-11-25/)
- [Replit Agent 3 → Agent 4 changes](https://blog.replit.com/whats-changed-agent3-to-agent4)
- [Cursor Composer 2 blog](https://cursor.com/blog/composer)
- [Cognition Devin 2.2](https://cognition.ai/blog/introducing-devin-2-2)
- [Google Jules launch](https://blog.google/innovation-and-ai/models-and-research/google-labs/jules/)
- [Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [TDFlow ACL 2026](https://aclanthology.org/2026.eacl-long.70/)
- [MAR Multi-Agent Reflexion (arxiv 2512.20845)](https://arxiv.org/html/2512.20845v1)
- [SWE-Bench Pro leaderboard May 2026](https://www.morphllm.com/swe-bench-pro)
- [LiveCodeBench](https://livecodebench.github.io/leaderboard.html)
- [Mem0 State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026)
- [Playwright MCP server (Microsoft)](https://github.com/microsoft/playwright-mcp)
- [Stagehand AI Web Agent SDK](https://www.browserbase.com/blog/ai-web-agent-sdk)
- [WorkOS — MCP 2025-11-25 spec update](https://workos.com/blog/mcp-2025-11-25-spec-update)
- [MCP Gateway landscape Q1 2026](https://www.heyitworks.tech/blog/mcp-aggregation-gateway-proxy-tools-q1-2026)
- [TM Dev Lab MCP performance benchmark](https://www.tmdevlab.com/mcp-server-performance-benchmark.html)
- [DigitalApplied 100-server reliability study](https://www.digitalapplied.com/blog/mcp-server-reliability-100-server-stress-test-study)
- [AppSecSanta MCP security audit 2026](https://appsecsanta.com/research/mcp-server-security-audit-2026)
- [Computer Use Agents 2026 matrix](https://www.digitalapplied.com/blog/computer-use-agents-2026-claude-openai-gemini-matrix)
- [Anthropic Skills + Agent View](https://www.testingcatalog.com/anthropic-adds-agent-view-for-claude-code-for-parralel-work/)
- [Windsurf Cascade](https://docs.windsurf.com/windsurf/cascade/cascade)
