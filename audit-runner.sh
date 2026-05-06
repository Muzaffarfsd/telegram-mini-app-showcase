#!/usr/bin/env bash
# ============================================================
# WEB4TG Audit Runner v1.0
# Автоматический сбор baseline данных для UI/UX аудита
#
# Решает проблему "Stream idle timeout" — выносит тяжёлые операции
# (Lighthouse, Playwright, axe) из Claude Code в standalone pipeline.
#
# Usage:
#   bash audit-runner.sh                   # все шаги
#   bash audit-runner.sh --skip-videos     # пропустить видео (быстрее)
#   bash audit-runner.sh --quick           # только Lighthouse + screenshots
#   DEV_URL=http://localhost:3000 bash audit-runner.sh
# ============================================================

set -e

# === Конфигурация ===
DEV_URL="${DEV_URL:-http://localhost:5173}"
AUDIT_DIR=".audit"
DEV_START_CMD="${DEV_START_CMD:-npm run dev}"
SKIP_VIDEOS=false
QUICK_MODE=false

for arg in "$@"; do
  case $arg in
    --skip-videos) SKIP_VIDEOS=true ;;
    --quick) QUICK_MODE=true; SKIP_VIDEOS=true ;;
  esac
done

# 7 priority surfaces (main + 7 demos) — настрой пути под свой роутинг
PAGES=(
  "/"
  "/projects"
  "/demos/clothing-store/app"
  "/demos/beauty/app"
  "/demos/electronics/app"
  "/demos/florist/app"
  "/demos/luxury-perfume/app"
  "/demos/sneaker-store/app"
  "/demos/luxury-watches/app"
)

# === Цвета для логов ===
G='\033[0;32m'
Y='\033[0;33m'
R='\033[0;31m'
B='\033[0;34m'
NC='\033[0m'

log() { echo -e "${B}[$(date +%H:%M:%S)]${NC} $1"; }
ok()  { echo -e "${G}✓${NC} $1"; }
warn(){ echo -e "${Y}⚠${NC} $1"; }
err() { echo -e "${R}✗${NC} $1"; }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 WEB4TG Audit Runner — Automated Baseline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Audit dir: $AUDIT_DIR"
echo "🌐 Dev URL:   $DEV_URL"
echo "⚡ Mode:      $([ "$QUICK_MODE" = true ] && echo 'QUICK' || echo 'FULL')"
echo ""

log "Step 1/9: Setup directories"
mkdir -p $AUDIT_DIR/{screenshots/baseline,videos/baseline,reports,scripts}

if ! grep -q "^$AUDIT_DIR/$" .gitignore 2>/dev/null; then
  echo "$AUDIT_DIR/" >> .gitignore
  ok "Added $AUDIT_DIR/ to .gitignore"
fi

log "Step 2/9: Install audit tools"

if [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
elif [ -f "yarn.lock" ]; then PM="yarn"
elif [ -f "bun.lockb" ]; then PM="bun"
else PM="npm"
fi
ok "Package manager: $PM"

log "Installing Playwright browsers (Chromium)..."
npx --yes playwright install chromium --with-deps 2>&1 | tail -3 || warn "Playwright install had issues — continuing"

log "Step 3/9: Generate helper scripts"

cat > $AUDIT_DIR/scripts/tg-mock.js << 'MOCK_EOF'
// Telegram WebApp mock for headless browser testing
window.Telegram = {
  WebApp: {
    initData: "mock_init_data",
    initDataUnsafe: { user: { id: 1, first_name: "Test", language_code: "ru" } },
    version: "7.10",
    platform: "ios",
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    themeParams: {
      bg_color: "#17212B", text_color: "#F5F5F5", hint_color: "#7D8E98",
      link_color: "#6AB3F3", button_color: "#5288C1", button_text_color: "#FFFFFF",
      secondary_bg_color: "#232E3C"
    },
    isExpanded: true,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
    ready: () => {}, expand: () => {}, close: () => {},
    MainButton: {
      text: "", isVisible: false, isActive: true, isProgressVisible: false,
      setText(t){ this.text=t; return this; },
      show(){ this.isVisible=true; return this; },
      hide(){ this.isVisible=false; return this; },
      enable(){ this.isActive=true; return this; },
      disable(){ this.isActive=false; return this; },
      showProgress(){ this.isProgressVisible=true; return this; },
      hideProgress(){ this.isProgressVisible=false; return this; },
      onClick(){}, offClick(){}, setParams(){}
    },
    BackButton: {
      isVisible: false,
      show(){ this.isVisible=true; return this; },
      hide(){ this.isVisible=false; return this; },
      onClick(){}, offClick(){}
    },
    HapticFeedback: {
      impactOccurred(){}, notificationOccurred(){}, selectionChanged(){}
    },
    CloudStorage: {
      _data: {},
      setItem(k, v, cb){ this._data[k]=v; cb && cb(null, true); },
      getItem(k, cb){ cb && cb(null, this._data[k] || null); },
      removeItem(k, cb){ delete this._data[k]; cb && cb(null, true); },
      getKeys(cb){ cb && cb(null, Object.keys(this._data)); }
    },
    showPopup(){}, showAlert(){}, showConfirm(){},
    switchInlineQuery(){}, sendData(){},
    onEvent(){}, offEvent(){},
    enableClosingConfirmation(){}, disableClosingConfirmation(){}
  }
};
MOCK_EOF
ok "TG mock generated"

cat > $AUDIT_DIR/scripts/screenshots.mjs << 'SCREEN_EOF'
import { chromium } from 'playwright';
import fs from 'fs';

const DEV_URL = process.env.DEV_URL || 'http://localhost:5173';
const PAGES = JSON.parse(process.env.PAGES_JSON || '[]');
const TG_MOCK = fs.readFileSync('./.audit/scripts/tg-mock.js', 'utf-8');

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1194 },
  { name: 'desktop', width: 1440, height: 900 }
];

const slugify = (p) => p.replace(/^\//, '').replace(/\//g, '-') || 'landing';

const browser = await chromium.launch();

for (const viewport of VIEWPORTS) {
  console.log(`📸 Viewport: ${viewport.name} (${viewport.width}×${viewport.height})`);

  for (const pagePath of PAGES) {
    for (const scheme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: scheme,
        deviceScaleFactor: 2
      });

      await context.addInitScript({ content: TG_MOCK });
      const page = await context.newPage();

      try {
        await page.goto(`${DEV_URL}${pagePath}`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);

        const slug = slugify(pagePath);
        const dir = `.audit/screenshots/baseline/${slug}`;
        fs.mkdirSync(dir, { recursive: true });

        await page.screenshot({
          path: `${dir}/${viewport.name}-${scheme}.png`,
          fullPage: false
        });
        console.log(`  ✓ ${slug} ${scheme}`);
      } catch (e) {
        console.log(`  ✗ ${pagePath} ${scheme}: ${e.message.split('\n')[0]}`);
      }

      await context.close();
    }
  }
}

await browser.close();
console.log('✅ Screenshots complete');
SCREEN_EOF
ok "Screenshots script generated"

cat > $AUDIT_DIR/scripts/funnel-videos.mjs << 'VIDEO_EOF'
import { chromium } from 'playwright';
import fs from 'fs';

const DEV_URL = process.env.DEV_URL || 'http://localhost:5173';
const TG_MOCK = fs.readFileSync('./.audit/scripts/tg-mock.js', 'utf-8');

const browser = await chromium.launch();

async function funnelA() {
  console.log('🎥 Funnel A: Cold visitor');
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: { dir: './.audit/videos/baseline/funnel-A/', size: { width: 390, height: 844 } }
  });
  await context.addInitScript({ content: TG_MOCK });
  const page = await context.newPage();

  try {
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const projectsLink = await page.$('a[href*="projects"], a[href*="demos"], button:has-text("Проект"), button:has-text("Demo")');
    if (projectsLink) {
      await projectsLink.click();
      await page.waitForTimeout(2000);
    }
    const demoCard = await page.$('a[href*="demos/"], [data-testid="demo-card"]');
    if (demoCard) {
      await demoCard.click();
      await page.waitForTimeout(3000);
      await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log(`  ⚠ ${e.message.split('\n')[0]}`);
  }

  await context.close();
  console.log('  ✓ Funnel A recorded');
}

async function funnelB() {
  console.log('🎥 Funnel B: AI Agent engagement');
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: { dir: './.audit/videos/baseline/funnel-B/', size: { width: 390, height: 844 } }
  });
  await context.addInitScript({ content: TG_MOCK });
  const page = await context.newPage();

  try {
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const aiTrigger = await page.$('[data-testid*="ai"], [aria-label*="ассистент"], [aria-label*="AI"], button:has-text("Алекс"), button:has-text("AI")');
    if (aiTrigger) {
      await aiTrigger.click();
      await page.waitForTimeout(3000);
      const input = await page.$('textarea, input[type="text"]');
      if (input) {
        await input.fill('Расскажи про ваши услуги для ресторана');
        await page.waitForTimeout(1500);
        const sendBtn = await page.$('button[type="submit"], button:has-text("Отправить"), [aria-label*="Send"]');
        if (sendBtn) {
          await sendBtn.click();
          await page.waitForTimeout(5000);
        }
      }
    } else {
      console.log('  ⚠ AI trigger not auto-detected (manual recording needed)');
    }
  } catch (e) {
    console.log(`  ⚠ ${e.message.split('\n')[0]}`);
  }

  await context.close();
  console.log('  ✓ Funnel B recorded');
}

await funnelA();
await funnelB();

await browser.close();
console.log('✅ Videos complete');
VIDEO_EOF
ok "Videos script generated"

log "Step 4/9: Start dev server"

if curl -s --max-time 2 "$DEV_URL" > /dev/null 2>&1; then
  ok "Dev server already running at $DEV_URL"
  DEV_PID=""
else
  log "Starting dev server: $DEV_START_CMD"
  $DEV_START_CMD > $AUDIT_DIR/dev-server.log 2>&1 &
  DEV_PID=$!
  echo $DEV_PID > $AUDIT_DIR/dev-server.pid

  log "Waiting for server (max 60s)..."
  for i in {1..30}; do
    if curl -s --max-time 2 "$DEV_URL" > /dev/null 2>&1; then
      ok "Server ready (PID: $DEV_PID)"
      break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
      err "Server didn't start in 60s. Check $AUDIT_DIR/dev-server.log"
      kill $DEV_PID 2>/dev/null || true
      exit 1
    fi
  done
fi

cleanup() {
  if [ -n "$DEV_PID" ]; then
    log "Stopping dev server (PID: $DEV_PID)"
    kill $DEV_PID 2>/dev/null || true
    rm -f $AUDIT_DIR/dev-server.pid
  fi
}
trap cleanup EXIT

log "Step 5/9: Run Lighthouse on $((${#PAGES[@]})) pages"

slugify() { echo "$1" | sed 's/^\///' | sed 's/\//-/g' | sed 's/^$/landing/' | sed 's/^-/landing-/'; }

LH_PIDS=()
for page in "${PAGES[@]}"; do
  slug=$(slugify "$page")
  [ -z "$slug" ] && slug="landing"

  npx --yes lighthouse "$DEV_URL$page" \
    --output=json \
    --output-path="$AUDIT_DIR/reports/lh-$slug.json" \
    --quiet \
    --chrome-flags="--headless --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,pwa \
    --throttling-method=simulate \
    --form-factor=mobile \
    > /dev/null 2>&1 &
  LH_PIDS+=($!)
done

log "Waiting for Lighthouse runs to complete (this is the slowest step, ~3-5 min)..."
for pid in "${LH_PIDS[@]}"; do
  wait $pid 2>/dev/null || true
done

LH_DONE=0
for page in "${PAGES[@]}"; do
  slug=$(slugify "$page")
  [ -z "$slug" ] && slug="landing"
  if [ -f "$AUDIT_DIR/reports/lh-$slug.json" ]; then
    LH_DONE=$((LH_DONE+1))
  fi
done
ok "Lighthouse: $LH_DONE/${#PAGES[@]} pages audited"

log "Step 6/9: Run accessibility scan (axe-core)"

cat > $AUDIT_DIR/scripts/axe-runner.mjs << 'AXE_EOF'
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';

const DEV_URL = process.env.DEV_URL || 'http://localhost:5173';
const PAGES = JSON.parse(process.env.PAGES_JSON || '[]');
const TG_MOCK = fs.readFileSync('./.audit/scripts/tg-mock.js', 'utf-8');

const slugify = (p) => p.replace(/^\//, '').replace(/\//g, '-') || 'landing';

const browser = await chromium.launch();
const summary = [];

for (const pagePath of PAGES) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  await context.addInitScript({ content: TG_MOCK });
  const page = await context.newPage();

  try {
    await page.goto(`${DEV_URL}${pagePath}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const slug = slugify(pagePath);
    fs.writeFileSync(`./.audit/reports/axe-${slug}.json`, JSON.stringify(results, null, 2));

    summary.push({
      page: pagePath,
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      critical: results.violations.filter(v => v.impact === 'critical').length,
      serious: results.violations.filter(v => v.impact === 'serious').length
    });

    console.log(`  ✓ ${slug}: ${results.violations.length} violations (${results.violations.filter(v => v.impact === 'critical').length} critical)`);
  } catch (e) {
    console.log(`  ✗ ${pagePath}: ${e.message.split('\n')[0]}`);
  }

  await context.close();
}

fs.writeFileSync('./.audit/reports/axe-summary.json', JSON.stringify(summary, null, 2));
await browser.close();
console.log('✅ Axe scan complete');
AXE_EOF

if ! npm ls @axe-core/playwright > /dev/null 2>&1; then
  case $PM in
    pnpm) pnpm add -D @axe-core/playwright > /dev/null 2>&1 ;;
    yarn) yarn add -D @axe-core/playwright > /dev/null 2>&1 ;;
    bun)  bun add -d @axe-core/playwright > /dev/null 2>&1 ;;
    *)    npm install --save-dev @axe-core/playwright > /dev/null 2>&1 ;;
  esac
fi

PAGES_JSON=$(printf '%s\n' "${PAGES[@]}" | jq -R . | jq -s . 2>/dev/null) || \
  PAGES_JSON=$(node -e "console.log(JSON.stringify($(printf '\"%s\",' "${PAGES[@]}" | sed 's/,$//' | sed 's/^/[/' | sed 's/$/]/')))" 2>/dev/null) || \
  PAGES_JSON='["/", "/projects"]'

DEV_URL="$DEV_URL" PAGES_JSON="$PAGES_JSON" node $AUDIT_DIR/scripts/axe-runner.mjs || warn "Axe scan had issues"

log "Step 7/9: Capture screenshots"
DEV_URL="$DEV_URL" PAGES_JSON="$PAGES_JSON" node $AUDIT_DIR/scripts/screenshots.mjs || warn "Screenshots had issues"

if [ "$SKIP_VIDEOS" = false ]; then
  log "Step 8/9: Record funnel videos"
  DEV_URL="$DEV_URL" node $AUDIT_DIR/scripts/funnel-videos.mjs || warn "Videos had issues"
else
  log "Step 8/9: Videos skipped (--skip-videos)"
fi

log "Step 9/9: Aggregate baseline metrics"

cat > $AUDIT_DIR/scripts/aggregate.mjs << 'AGG_EOF'
import fs from 'fs';

const reportsDir = './.audit/reports';
const PAGES = JSON.parse(process.env.PAGES_JSON || '[]');
const slugify = (p) => p.replace(/^\//, '').replace(/\//g, '-') || 'landing';

let md = '# Baseline Metrics\n\n';
md += `Generated: ${new Date().toISOString()}\n\n`;
md += '## Lighthouse + Axe Summary\n\n';
md += '| Page | Performance | LCP | INP | CLS | TBT | A11y (LH) | Axe Violations | Critical |\n';
md += '|------|-------------|-----|-----|-----|-----|-----------|----------------|----------|\n';

const axeSummary = JSON.parse(fs.readFileSync(`${reportsDir}/axe-summary.json`, 'utf-8') || '[]');

for (const page of PAGES) {
  const slug = slugify(page);
  let row = `| \`${page}\` |`;

  try {
    const lh = JSON.parse(fs.readFileSync(`${reportsDir}/lh-${slug}.json`, 'utf-8'));
    const perf = (lh.categories.performance.score * 100).toFixed(0);
    const a11y = (lh.categories.accessibility.score * 100).toFixed(0);
    const lcp = lh.audits['largest-contentful-paint']?.displayValue || '-';
    const inp = lh.audits['interactive']?.displayValue || lh.audits['max-potential-fid']?.displayValue || '-';
    const cls = lh.audits['cumulative-layout-shift']?.displayValue || '-';
    const tbt = lh.audits['total-blocking-time']?.displayValue || '-';

    row += ` ${perf} | ${lcp} | ${inp} | ${cls} | ${tbt} | ${a11y} |`;
  } catch (e) {
    row += ' - | - | - | - | - | - |';
  }

  const axe = axeSummary.find(a => a.page === page);
  if (axe) {
    row += ` ${axe.violations} | ${axe.critical} |`;
  } else {
    row += ' - | - |';
  }

  md += row + '\n';
}

md += '\n## Files\n\n';
md += '- Lighthouse JSON: `.audit/reports/lh-*.json`\n';
md += '- Axe JSON: `.audit/reports/axe-*.json`\n';
md += '- Axe summary: `.audit/reports/axe-summary.json`\n';
md += '- Screenshots: `.audit/screenshots/baseline/`\n';
md += '- Videos: `.audit/videos/baseline/`\n';

fs.writeFileSync(`${reportsDir}/baseline-metrics.md`, md);
console.log('✅ Baseline metrics aggregated');
AGG_EOF

PAGES_JSON="$PAGES_JSON" node $AUDIT_DIR/scripts/aggregate.mjs || warn "Aggregation had issues"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${G}✅ Audit pipeline complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results in: $AUDIT_DIR/"
echo "   ├── reports/baseline-metrics.md"
echo "   ├── reports/lh-*.json"
echo "   ├── reports/axe-*.json"
echo "   ├── screenshots/baseline/"
echo "   └── videos/baseline/"
echo ""
