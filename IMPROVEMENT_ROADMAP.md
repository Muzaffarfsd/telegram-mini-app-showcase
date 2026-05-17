# ПЛАН УЛУЧШЕНИЙ v2 — MCP-агент мирового уровня

> Синтез **двух раундов** параллельного исследования (17 мая 2026):
>
> **Раунд 1:** SOTA AI-агентов, MCP-протокол, аудит нашего кода, browser-автоматизация, self-reflection
> **Раунд 2:** Reasoning-модели + SWE-Bench победители + arxiv, sandbox-инфра + экономика, memory SDK + Skills/Outcomes, разбор Copilot Workspace/Codex CLI/Cursor BG/Replit A4/Lovable, хостинг + маркетплейсы + локальные модели

---

## 🎯 КУДА МЫ ИДЁМ — ОБЩАЯ КАРТИНА

| Состояние | Где | Что значит |
|---|---|---|
| **Сегодня** | 22 tools, git-worktrees, Playwright self-test, multi-platform deploy, файлы памяти | Уже сильнее 80% публичных MCP-серверов |
| **После Tier 0** | + 8 фиксов безопасности (~6 ч) | Сервер безопасен для exposed deploy |
| **После Tier 1** | + MCP-протокол 2025-11-25, Tasks primitive, наблюдаемость (~50-80 ч) | На уровне зрелости GitHub MCP / Notion MCP |
| **После Tier 2** | + Critic pass + RTV + Code-graph + Memory + Skills + CI auto-fix (~150-250 ч) | Паритет с **Replit Agent 4 / Cursor Composer 2 / Jules**. SWE-Bench Verified estimate ~91-96%, SWE-Bench Pro ~70-78% |
| **После Tier 3** | + Figma bridge, multi-frame canvas, OAuth, eval CI, локальные модели (~8-12 недель) | **Уникальные сильные стороны, которых ни у кого нет** |

---

## 📊 РАСКЛАД ПО МОДЕЛЯМ (МАЙ 2026)

Концепция «один frontier-model для всего» устарела. Оптимальный стек — **разные модели на разные роли**:

| Роль | Модель | Конфиг | Цена $/M вход / выход | SWE-V | Почему |
|---|---|---|---|---|---|
| **Planner** | Gemini 3.1 Pro | `thinkingConfig.thinkingBudget = high`, держать input <200K | $2 / $12 | 80.6% | 1M контекст, дешёвый thinker для планов на весь репо |
| **Coder (главный)** | Claude Opus 4.7 | `thinking:{type:"adaptive", display:"summarized"}` | $5 / $25 | 87.6% | MCP-native, сохраняет thinking между tool calls |
| **Bulk worker / черновик** | MiniMax M2.5 | OpenAI-compatible | **$0.15 / $1.15** | 80.2% | 20× дешевле вывода чем Opus, agent-tuned |
| **Critic / reviewer** | Claude Sonnet 4.6 | `thinking:{type:"adaptive"}` | $3 / $15 | 79.6% | Даёт +3-6 пунктов на critic-pass с малыми затратами |
| **Final verifier (тяжёлые задачи)** | Claude Mythos Preview / Opus 4.7 xhigh | На patches, что упали на critic | $25 / $125 | **93.9%** | Топ-1 SWE-Bench Verified May 2026 |
| **Search subagent** | DeepSeek-V4-Pro-Max | `reasoning_effort: high` | $1.74 / $3.48 | 80.6% | Дёшево для retrieval reranking |

**Источники:** [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing), [Claude Mythos launch](https://llm-stats.com/blog/research/claude-mythos-preview-launch), [MiniMax M2.5](https://www.minimax.io/news/minimax-m25), [Gemini 3.1 Pro](https://www.verdent.ai/guides/gemini-3-1-pro-pricing), [DeepSeek V4 Pro Max](https://llm-stats.com/models/deepseek-v4-pro-max)

**Стоимость типичного PR (React+Express, ~10 файлов, 600 LOC):**
- На чистом Sonnet 4.6: ~$0.90
- На Opus 4.7: ~$1.50
- На связке Sonnet+Opus с critic-pass: ~$1.20 + 15-20% за critic = ~**$1.45 (но +4 пункта точности**)

---

## 🏆 ТОП-5 SWE-BENCH VERIFIED (МАЙ 2026) — ЧТО ПЕРЕНИМАЕМ

| # | Submission | Score | Архитектура | Что копируем |
|---|---|---|---|---|
| 1 | **Claude Mythos** (Anthropic) | **93.9%** Verified / 77.8% Pro | Single frontier + harness pattern | Сам **harness паттерн** (model + read-write-exec tools + persistent thinking) |
| 2 | **GPT-5.5 xHigh** (OpenAI) | 88.7% | Single agent + self-optimizing harness | Идея **log-driven harness tuning** |
| 3 | **Claude Opus 4.7 (Adaptive)** | 87.6% | Baseline + adaptive thinking + 1M ctx | Прямо наш baseline target |
| 4 | **GPT-5.3 Codex** | 85.0% | Codex-specific harness | Terminal-first scaffold |
| 5 | **Auggie (Augment Code)** | ~85% / 51.8% Pro | **Planner + Coder + Critic + Context Engine** | **Полная схема для копирования** — это и есть blueprint MCP-сервера |

**Ключевые техники победителей** (источник: [Morph SWE-Bench Pro](https://www.morphllm.com/swe-bench-pro), [Auggie blog](https://www.augmentcode.com/blog/auggie-tops-swe-bench-pro)):

| Техника | Прирост | Стоимость | Реализация в нашем MCP |
|---|---|---|---|
| **Critic pass** (модель проверяет patch перед submit) | **+3-6 пунктов** Verified | +15-20% токенов | ~4 часа: второй model call с рубрикой |
| **Recursive Tournament Voting (4 rollouts)** | **+6.7 пунктов** Opus 4.5 | 4× стоимость | ~8 часов: fan-out 4 параллельных rollouts → Sonnet 4.6 judge |
| **Context Engine** (BM25 + embeddings + symbol-graph) | **+6 пунктов** vs bare scaffold | модерат токены | ~16 часов: tree-sitter index + MCP tools `search_code`/`find_refs`/`find_defs` |
| **WarpGrep v2** (RL search subagent) | +2.1-2.2 пункта | Требует RL infra | **Скип** (не строим RL) |

**Свежие arxiv (апрель-май 2026):**

| Paper | Прирост | Внедряемо без GPU |
|---|---|---|
| [Scaling Test-Time Compute 2604.16529](https://arxiv.org/abs/2604.16529) | SWE-V 70.9 → **77.6%** | ✅ |
| [AgentForge 2604.13120](https://arxiv.org/html/2604.13120v1) (5 ролей + Docker между правками) | Меньше регрессий | ✅ |
| [ABCoder 2604.18413](https://arxiv.org/html/2604.18413v2) — **готовый MCP-сервер для code-graph retrieval** | Improved navigation | ✅ drop-in MCP |
| [Dev Memory MCP 2605.01567](https://arxiv.org/html/2605.01567) | Помогает RL агентам | ✅ pure MCP |
| [Reflection-Driven Control 2512.21354](https://arxiv.org/abs/2512.21354) | Higher trust patches | ✅ |
| [Reinforced Agent 2604.27233](https://arxiv.org/abs/2604.27233) (reviewer перед tool call) | Substantial accuracy lift | ✅ |

---

## 🧠 MEMORY-СИСТЕМА: ZEP CLOUD

Из 6 систем (Mem0, Letta, Zep, Cognee, Cloudflare AI Agents Memory, Anthropic native) — **Zep лучший для нашего use-case** «design decisions, keyed by file/symbol/repo».

| Почему Zep | |
|---|---|
| **Temporal graph** | Решения супершедятся ("использовали Jest" → "перешли на Vitest в PR #234") — Zep нативно поддерживает valid-from / valid-to edges |
| **Managed** | Не нужно поднимать Postgres/Neo4j |
| **Free tier 1k credits/мес** | Ингест ~350 байт/credit — для маленькой команды бесплатно |
| **Conflict resolution** | Graphiti автоматически инвалидирует старые edges при противоречии |

**Конкретная интеграция (~30 строк TS):**

```ts
// src/memory/zep.ts
import { ZepClient } from "@getzep/zep-cloud";
const zep = new ZepClient({ apiKey: process.env.ZEP_API_KEY! });
const groupFor = (owner: string, name: string) => `repo:${owner}/${name}`;

export async function recallContext(repo: {owner: string, name: string}, query: string) {
  await zep.group.getOrCreate({ groupId: groupFor(repo.owner, repo.name) }).catch(() => {});
  const { edges } = await zep.graph.search({
    groupId: groupFor(repo.owner, repo.name),
    query, scope: "edges", limit: 8,
  });
  return edges.map(e => `- ${e.fact} (действует ${e.validAt ?? "сейчас"})`).join("\n");
}

export async function recordDecision(repo: {owner: string, name: string}, data: {
  symbol: string; decision: string; rationale: string; pr?: number;
}) {
  await zep.graph.add({
    groupId: groupFor(repo.owner, repo.name),
    type: "json",
    data: JSON.stringify({ kind: "design_decision", ...data }),
  });
}
```

**Где вызывать в нашем MCP:**
- В начале каждой `edit_file` / `apply_edit_and_push` / `live_preview` → `recallContext()` префиксом к system prompt
- На успешном создании PR в Octokit-флоу → `recordDecision()` с "почему" из PR body

**Ожидаемый прирост:** «агент уже знает контекст следующего дня» с ~0% (cold) до **~70%**. Затраты: 1 файл, ~30 строк, полдня работы.

**Источник:** [Zep Cloud pricing](https://www.getzep.com/pricing/), [Zep Memory docs](https://help.getzep.com/v2/memory)

---

## 🛠 SKILLS / OUTCOMES / SPEC-DRIVEN

### Anthropic Skills (открытый стандарт с декабря 2025)

Структура — папка `skill-name/` с `SKILL.md` (YAML frontmatter `name` + `description`) + опциональные `references/` и `scripts/`. **Marketplace:** [Skills.sh](https://skillsmp.com/) (Vercel, янв 2026, 19 агентов), [Anthropic Skills repo](https://github.com/anthropics/skills).

В нашем MCP — добавить tools `list_skills` (resource `skill://`) и `invoke_skill(name, args)`. Зеркалит Claude Code. **Затраты:** ~3-5 дней.

### Anthropic Outcomes (май 2026 — на конференции Code with Claude)

Разработчик пишет **рубрику** успеха → grader в отдельном контексте оценивает каждую попытку → агент возвращается пока не пройдёт. **Прирост: +10 пунктов** на сложнейших бенчмарках, Wisedocs срезал review-time на 50%.

В нашем MCP — это и есть **Critic pass из топ-1 техник** выше. Реализация одна.

**Источник:** [Anthropic Releasebot May 2026](https://releasebot.io/updates/anthropic), [Every: Inside Anthropic 2026 Dev Conf](https://every.to/chain-of-thought/inside-anthropic-s-2026-developer-conference)

### Spec-driven (GitHub Spec Kit, OpenAI Symphony)

**Spec Kit** — 90K+ stars OSS toolkit с slash-commands `/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`. Работает с Claude Code, Copilot, Gemini CLI.

В нашем MCP — добавить `propose_plan(task)` → markdown с N шагами, каждый со своим `step_id`, затем `execute_step(step_id)` с верификацией. Это **Devin pattern + Spec Kit pattern**, прирост **+8-12 пунктов** на задачах SWE-bench-класса.

**Источник:** [GitHub Spec Kit](https://github.com/github/spec-kit), [OpenAI Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/)

---

## 🏗 SANDBOX / ХОСТИНГ

### Текущая ситуация (stdio MCP на машине пользователя)

**Не нужен remote sandbox** для нашего use-case. Источник: [MCP design principle](https://dev.to/jefe_cool/mcp-transports-explained-stdio-vs-streamable-http-and-when-to-use-each-3lco), [Microsoft on stdio vs HTTP](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/one-mcp-server-two-transports-stdio-and-http/4443915).

Пользователь редактирует свой репо на своей машине — облачной изоляции не требует. Latency stdio = microseconds, $0 инфраструктуры.

### Когда нужен remote (триггеры)

Hosting реализуем только когда сработает один из:

1. **Не Claude Desktop клиент** (ChatGPT, Cursor remote, мобильный Claude) — нужен Streamable HTTP
2. **Per-user identity / billing / rate-limits** — нужен OAuth + persistence
3. **Shared state между пользователями / устройствами** — нужно DO SQLite / Postgres
4. **Heavy compute** (Browserbase, GPU inference, fleet scraping) — не имеет смысла гонять Chrome на ноутбуке
5. **One-click install** для non-tech users — hosted URL + Smithery >> "склонируй репо, отредактируй JSON"

### Когда — то Cloudflare McpAgent

Stack (источник: [Cloudflare Agents Week 2026](https://lushbinary.com/blog/cloudflare-agents-week-2026-everything-released/)):

```
Claude/ChatGPT/Cursor
   ↓ Streamable HTTP + OAuth 2.1
Cloudflare Worker (entry, OAuthProvider, rate limit)
   ↓ Durable Object per userId
McpAgent (SQLite + WebSocket hibernation + Alarms)
   ↓
Workers AI (sampling) + Browser Run (CDP) + Workflows (long-running) + R2 (blobs)
```

**Цена:** Workers Paid $5/мес + DO usage. Для 1000 tool calls/час — ~$0.05.

### Hybrid: sandboxed `npm install` через E2B

Локально редактируем файлы и git-операции; **тяжёлые/непроверенные** команды (`npm install` от агент-fetched пакетов) пайпим в E2B snapshot с прогретым node_modules:

- **Cold start E2B: 78ms** ([E2B billing](https://e2b.dev/docs/billing))
- **Цена: ~$0.01 за test cycle** ($0.05/vCPU-hr)
- **Реализация:** ~600 LOC, 3-5 дней
- **Затраты:** $10-40/мес на heavy user

---

## 🏪 MARKETPLACES — ГДЕ ЛИСТИТЬСЯ

| # | Маркетплейс | Servers | Что требует | Хостит? | Приоритет |
|---|---|---|---|---|---|
| 1 | **Official MCP Registry** (Anthropic) | ~2,000 | server.json + DNS namespace verification | Нет (ссылка на npm) | **СНАЧАЛА** — feeds все downstream |
| 2 | **PulseMCP** | **15,240+** | URL + metadata | Нет | **Затем** — самая большая аудитория |
| 3 | **Smithery** | 5-7k | server.json + CLI install | **Да** (hosted remote) | Когда есть remote endpoint |
| 4 | **Glama** | ~6k | Авто-скрейпит GitHub | Нет | Подхватит сам |
| 5 | **mcp.so** | 5k+ | GitHub repo + форма | Нет | Опционально |
| 6 | **MCPize** | smaller | Hosted deploy | Да | **Единственный с rev-share 85%** автору — если коммерциализируем |

**Конкретный путь:**
1. День 1: написать `server.json` + DNS verification → submit в Official Registry → Glama/PulseMCP подхватят авто.
2. Когда появится remote endpoint → Smithery.
3. Если решим продавать tool-calls → MCPize.

**Источники:** [PulseMCP Server Directory](https://www.pulsemcp.com/servers), [Smithery vs Composio](https://hasmcp.com/alternatives/smithery-vs-composio), [Official MCP Registry server.json req](https://glama.ai/blog/2026-01-24-official-mcp-registry-serverjson-requirements)

---

## 💻 КОНКУРЕНТНЫЕ ТЕХНИКИ (TEARDOWN)

### Copilot Workspace (GitHub)

- **Workflow:** Issue → редактируемая Spec → Plan → Diff. Человек и агент **редактируют один и тот же объект plan**.
- **Runtime:** GitHub Actions runner.
- **MCP:** Предустановлены GitHub MCP + Playwright MCP (scoped to localhost).
- **Что копируем:** `plan_create(issue_id, repo)` → `{spec, file_actions[]}` + `plan_edit(plan_id, patch)` + `plan_execute(plan_id, branch)`.

**Источник:** [Copilot cloud agent docs](https://docs.github.com/copilot/concepts/agents/coding-agent/about-coding-agent)

### Cursor Composer 2 + Background Agents

- **Composer 2 модель:** обучена на Kimi K2.5 (1.04T / 32B MoE), continued-pretrain + RL внутри реальных сессий Cursor. ~200 tok/s, agent turn <30 сек.
- **BG architecture:** Изолированный Ubuntu cloud VM с **браузером внутри VM** (с 24 фев 2026) — агент может **использовать софт, который сам строит**. До **8-20 параллельных агентов**.
- **Live coordination:** Агенты следят за file modifications в working tree пользователя, паузятся когда пересекаются.
- **Что копируем:** `agent_spawn(repo, prompt, branch)` + `agent_watch_workspace(agent_id, paths[])` (стрим pause/resume событий) + `agent_use_app(agent_id, url)`.

**Источник:** [Composer 2 Technical Report](https://cursor.com/resources/Composer2.pdf), [Cursor BG Agents](https://docs.cursor.com/en/background-agent)

### Replit Agent 4

- **Multi-agent:** Manager + Editors + **Verifier (falls back to human, doesn't auto-decide)**. Orchestrated on **LangGraph**.
- **Plan-while-building** (с апреля 2026) — не plan-then-build.
- **Bottomless Storage:** виртуальные block-devices на GCS, lazy cache → **near-instant filesystem forks**. Это и есть техника за «10 параллельных задач».
- **Что копируем:** `verifier_checkpoint(task_id, question) → human_reply` (явный «спроси человека» tool); `snapshot_fork(workspace_id)` + `snapshot_restore(snapshot_id)`; `variant_generate(prompt, n)` + `variant_render_grid(variant_ids[])`.

**Источник:** [Inside Replit's Snapshot Engine](https://blog.replit.com/inside-replits-snapshot-engine), [Replit Canvas](https://docs.replit.com/replitai/canvas)

### Lovable (Plan Mode + Prompt Queue + Voice + Virtual Browser Testing)

- **Plan Mode:** структурированный план до кода, юзер правит.
- **Prompt Queue:** **до 50 промптов** в очередь, sequential execution, переупорядочивание.
- **Virtual Browser Testing:** AI кликает по приложению, ловит visual/interaction bugs — **автоматический QA loop**.
- **Что копируем:** `prompt_queue_enqueue(items[], ordering)` + `prompt_queue_reorder`; `browser_test_run(url, scenarios[]) → {visual_bugs[], interaction_bugs[]}`.

**Источник:** [Lovable for Designers 2026](https://muz.li/blog/lovable-for-designers-the-complete-guide-to-building-apps-with-ai-2026/)

### Codex CLI (OpenAI)

- **Sandbox modes:** `sandbox = read-only | workspace-write | network-full`.
- **MCP add inline:** `codex mcp add <name> <command>` во время сессии.
- **Что копируем:** `sandbox_set(mode)` per-session; `mcp_register(name, command, env)` чтобы агент мог **сам подключить MCP**; `session_fork(session_id)` — форк транскрипта.

**Источник:** [Codex CLI reference](https://developers.openai.com/codex/cli/reference)

---

## 🎯 КОНКРЕТНЫЙ СПРИНТ (СЛЕДУЮЩИЕ 2 НЕДЕЛИ)

Объединение Tier 0-2 в один прагматичный план:

### День 1 — БЕЗОПАСНОСТЬ (6 часов)

8 фиксов из аудита кода (S1-S8):
- S1: SDK 1.29 → 1.30 (CVE-2026-0621)
- S2: path normalize в `file://` resource
- S3: cmd allow-list в spawnDevServer
- S4: regex для git branch names
- S5: scrub токенов в error messages
- S6: `timingSafeEqual` в webhook HMAC
- S7: `.max(N)` на всех Zod string inputs
- S8: try/finally вокруг browser context

### День 2-3 — MCP-ПРОТОКОЛ + ПЕРСИСТЕНТНОСТЬ

- F1: tool annotations (`destructiveHint`, `readOnlyHint`) на каждом инструменте
- F6: структурированные errors (`isError: true` + JSON body)
- C2: `treeKill` orphan children
- C5: чекпоинты восстанавливаются из git tags при старте
- C7: `@octokit/plugin-retry` + `@octokit/plugin-throttling`

### День 4 — CRITIC PASS (главный single ROI ~+4 пункта)

```ts
// src/critic/index.ts
export async function reviewDiff(diff: string, context: {
  problem: string;
  passing_tests?: string;
}): Promise<{ verdict: 'APPROVE' | 'REVISE'; issue?: string; fix_hint?: string }> {
  const prompt = `<diff>${diff}</diff>
<problem>${context.problem}</problem>
<tests_passing>${context.passing_tests ?? '(none yet)'}</tests_passing>
Reply EXACTLY one line: \`APPROVE\` or \`REVISE: <one specific issue>\`.`;
  // call Sonnet 4.6 with thinking enabled
  const reply = await callSonnet(prompt);
  return parseVerdict(reply);
}
```

Встроить в `apply_edit_and_push` → перед `git push` гонять reviewDiff максимум 3 итерации.

### День 5 — STATIC ANALYSIS LOOP

Новый tool `quick_check(files: string[])`:
```ts
// Run tsc + eslint on changed files only, return structured errors
const errors = await Promise.all([
  runTsc(files),    // tsc --noEmit --incremental
  runEslint(files), // eslint --format json
]);
return { errors: errors.flat() }; // {file, line, code, severity, message, fix?}
```

Ловит 60-70% тривиальных багов **без LLM-вызова**, бюджет латентности <3 сек.

### День 6-7 — ZEP MEMORY

Подключить `@getzep/zep-cloud`, добавить tools `recall_context` + `record_decision`, обернуть `apply_edit_and_push`. Прирост «агент помнит контекст вчера» с 0% до ~70%.

### Неделя 2

- **D5: a11y-tree браузер** — заменить screenshot-by-default в `run_browser_test` на `browser_snapshot` с accessibility-tree (4× меньше токенов в LLM context)
- **D6: CI auto-fix daemon** — webhook receiver на `check_run.completed.failure` → sub-agent → fix PR
- **ABCoder MCP integration** — добавить tools `search_code` / `find_refs` / `find_defs` через tree-sitter symbol-graph (+6 пунктов prior на Pro)

### Неделя 3+

- **D1: Plan-then-Step** state machine (Devin pattern, GitHub Spec Kit clone) — `propose_plan` + `execute_step`
- **D2: TDFlow** test-first generation
- **RTV: 4-way rollout + tournament voting** — +6.7 пунктов
- **Skills loader** — `.skills/` discovery

---

## 🚀 ЧТО МЫ **НЕ** ДЕЛАЕМ (явно)

| Депрятим | Почему |
|---|---|
| Computer-Use / pixel-vision на каждый diff | Дорого, a11y-tree + diff достаточно (Stagehand pattern) |
| Полный multi-persona Reflexion (5+ critic) | Маржинально над single critic, 5× spend |
| WarpGrep v2 (RL-trained search) | Требует RL infra; код-граф +6 пунктов даёт похожий результат без RL |
| DCR для OAuth | Заменён на Client ID Metadata Documents в спеке 2025-11-25 |
| HTTP+SSE транспорт | Deprecated 30 июня 2026 |
| tree-sitter native build | Уже погорели на Windows; regex/AST-from-script достаточно |
| Свой sandbox runtime | Локально не нужен; для hybrid — E2B managed (78ms cold start, $0.05/vCPU-hr) |

---

## 📈 ОЖИДАЕМАЯ ИТОГОВАЯ ПРОИЗВОДИТЕЛЬНОСТЬ

| Слой | Baseline Opus 4.7 | + Critic pass | + 4-way RTV | + Code-graph | + Skills + Plan-Step |
|---|---|---|---|---|---|
| **SWE-Bench Verified** | 87.6% | ~91.6% | ~96% (saturated) | ~96% | ~96% |
| **SWE-Bench Pro** | ~46% | ~50% | ~62% | ~70% | ~78% |

Мифос Preview даёт 93.9% Verified / 77.8% Pro — мы можем подойти на расстояние шага без 5× стоимости.

---

## 📚 БИБЛИОГРАФИЯ (обоих раундов)

### Модели и бенчмарки
- [Anthropic pricing & models](https://platform.claude.com/docs/en/about-claude/pricing) · [Claude Mythos](https://llm-stats.com/blog/research/claude-mythos-preview-launch) · [Anthropic extended thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)
- [GPT-5.3 Codex](https://openai.com/index/introducing-gpt-5-3-codex/) · [GPT-5.5](https://openai.com/index/introducing-gpt-5-5/)
- [MiniMax M2.5](https://www.minimax.io/news/minimax-m25) · [Gemini 3.1 Pro](https://www.verdent.ai/guides/gemini-3-1-pro-pricing) · [DeepSeek V4 Pro Max](https://llm-stats.com/models/deepseek-v4-pro-max)
- [SWE-Bench leaderboard May 2026](https://www.marc0.dev/en/leaderboard) · [SWE-Bench Pro](https://www.morphllm.com/swe-bench-pro) · [Auggie blog](https://www.augmentcode.com/blog/auggie-tops-swe-bench-pro)

### Свежий arxiv
- [Scaling Test-Time Compute 2604.16529](https://arxiv.org/abs/2604.16529)
- [AgentForge 2604.13120](https://arxiv.org/html/2604.13120v1)
- [ABCoder MCP 2604.18413](https://arxiv.org/html/2604.18413v2)
- [Dev Memory MCP 2605.01567](https://arxiv.org/html/2605.01567)
- [ARISE 2605.03117](https://arxiv.org/html/2605.03117)
- [Reinforced Agent 2604.27233](https://arxiv.org/abs/2604.27233)
- [Reflection-Driven Control 2512.21354](https://arxiv.org/abs/2512.21354)
- [TDFlow ACL 2026](https://aclanthology.org/2026.eacl-long.70/)
- [MAR Multi-Agent Reflexion 2512.20845](https://arxiv.org/html/2512.20845v1)

### Memory / Skills / Spec
- [Zep Cloud pricing](https://www.getzep.com/pricing/) · [Zep Memory docs](https://help.getzep.com/v2/memory)
- [Mem0 pricing](https://mem0.ai/pricing) · [Letta TS SDK](https://docs.letta.com/api/typescript) · [Cognee GitHub](https://github.com/topoteretes/cognee)
- [Claude Memory Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Claude Skills docs](https://code.claude.com/docs/en/skills) · [Skills.sh marketplace](https://skillsmp.com/) · [anthropics/skills](https://github.com/anthropics/skills)
- [Anthropic Outcomes — Code with Claude 2026](https://every.to/chain-of-thought/inside-anthropic-s-2026-developer-conference)
- [GitHub Spec Kit](https://github.com/github/spec-kit) · [OpenAI Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/)

### Sandbox / Hosting / Marketplaces
- [E2B docs](https://e2b.dev/docs/billing) · [Daytona pricing](https://www.daytona.io/pricing) · [Modal Sandboxes](https://modal.com/products/sandboxes) · [Cloudflare Containers](https://developers.cloudflare.com/containers/pricing/)
- [Cloudflare Agents Week 2026](https://lushbinary.com/blog/cloudflare-agents-week-2026-everything-released/) · [Build Remote MCP](https://developers.cloudflare.com/agents/guides/remote-mcp-server/) · [Browser Run for AI](https://blog.cloudflare.com/browser-run-for-ai-agents/)
- [PulseMCP](https://www.pulsemcp.com/servers) · [Smithery vs Composio](https://hasmcp.com/alternatives/smithery-vs-composio) · [Official MCP Registry req](https://glama.ai/blog/2026-01-24-official-mcp-registry-serverjson-requirements)
- [STDIO vs HTTP](https://dev.to/jefe_cool/mcp-transports-explained-stdio-vs-streamable-http-and-when-to-use-each-3lco) · [LangChain sandbox patterns](https://blog.langchain.com/the-two-patterns-by-which-agents-connect-sandboxes/)

### Конкуренты (teardowns)
- [Copilot cloud agent docs](https://docs.github.com/copilot/concepts/agents/coding-agent/about-coding-agent) · [Copilot MCP](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent)
- [Codex CLI reference](https://developers.openai.com/codex/cli/reference) · [Codex pricing](https://developers.openai.com/codex/pricing)
- [Composer 2 Technical Report](https://cursor.com/resources/Composer2.pdf) · [Cursor BG Agents](https://docs.cursor.com/en/background-agent) · [The Harness Is the Product](https://cozypet.github.io/cursor-cloud-harness/)
- [Replit Agent 3→4](https://blog.replit.com/whats-changed-agent3-to-agent4) · [Inside Replit's Snapshot Engine](https://blog.replit.com/inside-replits-snapshot-engine) · [LangChain Replit](https://www.langchain.com/breakoutagents/replit)
- [Lovable for Designers 2026](https://muz.li/blog/lovable-for-designers-the-complete-guide-to-building-apps-with-ai-2026/) · [Lovable changelog](https://docs.lovable.dev/changelog)

### MCP-протокол
- [MCP TypeScript SDK releases](https://github.com/modelcontextprotocol/typescript-sdk/releases)
- [MCP spec 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/) · [WorkOS spec update](https://workos.com/blog/mcp-2025-11-25-spec-update)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) · [MCPJam Inspector](https://github.com/MCPJam/inspector) · [lastmile-ai mcp-eval](https://github.com/lastmile-ai/mcp-eval)

### Безопасность
- [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
- [AppSecSanta MCP audit 2026](https://appsecsanta.com/research/mcp-server-security-audit-2026)
- [Red Hat MCP logging & runtime](https://www.redhat.com/en/blog/mcp-security-logging-and-runtime-security-measures)
