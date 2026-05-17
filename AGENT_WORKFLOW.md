# AGENT_WORKFLOW

> Workflow the AI assistant follows on EVERY task.
> Lives in repo so behavior is predictable and reviewable.

## Loading context (start of session / new task)

1. **Re-attach repo** via MCP `attach_repository` (sets cwd, refreshes Git binding).
2. **Read** `CODEBASE_INDEX.md` — know where every feature lives.
3. **Read last ~30 entries** of `EDIT_LOG.md` — know what's been changed recently and why.
4. **Run** `git log --oneline -20` to confirm checkpoint history matches the log.
5. **Run** `run_browser_test http://localhost:5000` once to confirm the app boots clean.

## Per-task loop

For every user request that touches code:

1. **Understand** — re-read relevant files via `Read` / `Grep`. Don't guess; look.
2. **Plan** — name the files I'll touch, in order. Tell the user.
3. **Checkpoint BEFORE** — `checkpoint_create label="before: <task>"` so we can always roll back.
4. **Edit** — `Edit` (preferred) or `Write` for new files. Small, targeted diffs.
5. **Wait ~500 ms** for Vite HMR to push the update to the iPhone widget.
6. **Self-verify visually** — `run_browser_test url="http://localhost:5000" screenshot=true`. Inspect:
   - `ok: true` (HTTP 200, page rendered)
   - `pageErrors == []` (no JS exceptions)
   - `consoleErrors` filtered out warnings — must be `[]` for blocking errors
   - `requestFailures == []` (no 4xx/5xx for app assets)
   - Optionally diff the screenshot against the previous one (`diff_screenshots`) to confirm intended change actually happened on screen.
7. **If broken** — go back to step 1 with the error info. Do NOT mark the task done until the verification is clean.
8. **Commit** — `git_commit_changes message="feat/fix/chore(scope): description"` (conventional commits).
9. **Append** to `EDIT_LOG.md` — date, summary, files, checkpoint id+sha, verification result.
10. **Report to user** — what changed + screenshot path + EDIT_LOG entry timestamp.

## Push to GitHub

- Default: stay LOCAL until user explicitly says "пушим" / "push" / "ship".
- On push: `git_push_to_github` → optionally `git_create_pull_request` if they want a PR.

## Rollbacks

| User says | Action |
|---|---|
| "откати последнее" / "undo" | `git reset --hard HEAD~1` |
| "откати к [время / описание]" | look up in EDIT_LOG → `git reset --hard <sha>` |
| "откати к BASELINE" | `git reset --hard cp-1779048279195` |
| "забудь всё" / "верни как было до тебя" | `git reset --hard origin/main` |

After any rollback: append an entry to `EDIT_LOG.md` documenting which checkpoint we reverted to and why.

## Rules

- Never push to `main` without explicit user approval ("пушим").
- Never delete `CODEBASE_INDEX.md`, `EDIT_LOG.md`, `AGENT_WORKFLOW.md`. They are the AI's memory.
- Never edit `package.json` / `vite.config.ts` / `server/index.ts` without flagging it (these are dev-environment-critical).
- For changes to a demo, also note which other demo may import shared components — check `Grep` first.
- Long files (>50 KB) — `Read` with `offset/limit`, never the whole thing at once.
