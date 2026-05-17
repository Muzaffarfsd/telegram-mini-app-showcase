# CLAUDE.md — Auto-loaded primer

> **Claude reads this file automatically when working in this folder.**
> It's the bridge between the chat (volatile) and the MCP server (persistent).

## CRITICAL — read this every session

You are connected to a custom MCP server (`replit-clone-mcp`) with **70+ tools, 20+ resources, and persistent memory**. The server holds your context across all sessions and chats. Use it.

### ALWAYS call FIRST in a fresh session

```
session_bootstrap
```

Returns: capability digest · last EDIT_LOG entry · active Kanban tasks · pinned memory · confidence trend · 10 hard reminders. Auto-seeds baseline memory on first call.

### Persistent memory lives at `.agent-memory/<kind>.jsonl`

Kinds: `fact`, `decision`, `gotcha`, `preference`, `note`. Pinned items always surface in bootstrap. Auto-recorded by the server when destructive tools succeed — you do NOT need to remember to log.

Manual recording: `memory_record({kind, text, tags, pinned, context})`. Recall: `memory_recall({query, kinds})`.

## Hard rules (pinned in memory, repeated here for safety)

1. **Default effort mode is `unlimited`.** Spawn as many sub-agents as the work needs. Never throttle artificially. User mandate: *"у нас все без ограничений"*.
2. **Single model.** Claude Opus 4.7 with 1M context. No Sonnet critic, no Haiku verifier. Self-review only via `review_diff` (8-axis rubric, no MCP sampling).
3. **Windows mount truncates the Write tool.** Around 5500 bytes mid-file. WORKAROUND: write modules via bash heredoc to `/sessions/.../mnt/outputs/`.
4. **Bowlby One has no Cyrillic.** Applying it to Russian text → uppercase blow-up. Use MANROPE for Cyrillic display.
5. **Vite HMR clientPort:443 is Railway-only.** Locally: `clientPort:5000 + port:5000 + host:'localhost'`, native FS watch (`usePolling:false`).
6. **Playwright needs `chromium-headless-shell-1223`** not `chromium-1223`. Install with `PLAYWRIGHT_BROWSERS_PATH=0`.
7. **NEVER embed user-leaked secrets in scripts.** Always tell the user to revoke + rotate.

## Primary edit path

`hot_edit` — applies edits + runs tsc + waits HMR + screenshots + console diff + pixel-diff in ONE call. Use this instead of raw `apply_edit_and_push` when iterating UI.

`quick_check` — ALWAYS run before commits (refuses to push if tsc/eslint fails).

`multi_viewport_snapshot` — before claiming UI is fixed, snapshot all 6 device shapes.

## Killer features beyond Replit Agent 4

- `click_trace_element` — click DOM selector → fingerprint → grep repo → file:line → git blame
- `snapshot_build_manifest` — sha256 hash of fs+deps+config+git (full system state)
- `doom_loop_record / assess_doom_loop` — 10-min sliding window; auto-pin to memory on doom
- `metrics_prometheus` — production Prometheus exposition with per-tool p50/p95/p99
- `plan_mode_set` — read-only safety gate, all writes refuse when ON
- `classify_action` — NONE/LOW/HIGH/CATASTROPHIC + requiresApproval; call before any HIGH+ action

## Project facts

- Repo: `Muzaffarfsd/telegram-mini-app-showcase`. React 19 + Vite + Express.
- Dev URL: `http://localhost:5000`. Prod: `https://w4tg.up.railway.app/`.
- iPhone 17 Pro Max live-preview widget (Electron app) for visual self-review.
- Edit journal at `EDIT_LOG.md` (latest at top). Read top 5 sections.

## Resources you can read directly

- `capabilities://digest` — full categorized capability catalog (markdown)
- `capabilities://index` — same as JSON
- `memory://pinned` — always-on context
- `memory://recent` — fresh memory by kind
- `effort://current` — current effort mode + config
- `agent://confidence` — rolling confidence trend
- `observability://prometheus` — live metrics in Prometheus format
- `task://drafts | active | ready | done` — Kanban columns
- `checkpoint://list` — git-tag-backed restore points
- `ci://failures` — auto-fix queue from GitHub webhooks

## Auto-record (no user action needed)

The server auto-records to memory on:
- Successful commits (`git_commit_changes`)
- `hot_edit` outcomes (pass → decision; fail → gotcha)
- Deploys (`deploy_to_environment`)
- Checkpoints (`checkpoint_create`)
- Doom-loop detections (pinned automatically)
- Sub-agent results (`reap_sub_agent_task`)

You can also `memory_record(...)` manually at any time.

---

**TL;DR:** The MCP server IS your memory. Trust it. Bootstrap on first turn. Record gotchas as you find them. Pin user preferences. Never re-discover what's already in `.agent-memory/`.
