# 🚀 Деплой на Railway - Инструкция

## ✅ Что уже настроено:

1. ✅ `vite.config.ts` - оптимизирован для быстрой загрузки
2. ✅ `railway.json` - использует RAILPACK builder
3. ✅ `package.json` - без "start" script (для SPA mode)
4. ✅ `.gitignore` - исключает dist/ и node_modules/

---

## 📋 Шаги для деплоя:

### 1. Push на GitHub

```bash
git add .
git commit -m "Optimize for Railway deployment"
git push origin main --force
```

### 2. Настройка Railway

1. Откройте [Railway Dashboard](https://railway.app/dashboard)
2. Найдите ваш проект
3. Перейдите в **Settings** → **Variables**
4. Добавьте переменную окружения:

```
RAILPACK_SPA_OUTPUT_DIR=dist
```

### 3. Принудительный Redeploy

1. Откройте **Deployments** tab
2. Нажмите **"Clear Build Cache"** в Settings
3. Нажмите **"Redeploy"** на последнем деплое

---

## 🔍 Ожидаемый результат:

**Build Logs должны показывать:**

```
✓ built in ~60s
✓ 487 modules transformed
dist/index.html                           1.23 kB │ gzip: 0.62 kB
dist/assets/vendor-[hash].js            342.45 kB │ gzip: 112.34 kB
dist/assets/ui-vendor-[hash].js         156.78 kB │ gzip: 52.12 kB
dist/assets/tanstack-vendor-[hash].js    45.67 kB │ gzip: 15.23 kB
dist/assets/icons-vendor-[hash].js       89.12 kB │ gzip: 28.45 kB
dist/assets/utils-vendor-[hash].js       78.34 kB │ gzip: 24.56 kB
dist/assets/index-[hash].js              12.34 kB │ gzip: 4.56 kB
```

**Deploy Logs должны показывать:**

```
[inf] Starting Container
[inf] server running          ← Caddy static server
[inf] handled request          ← Успешные HTTP запросы
```

---

## ⚡ Проверка скорости:

После деплоя откройте DevTools (F12) → Network:

- **TTFB (Time to First Byte):** < 500ms
- **FCP (First Contentful Paint):** 3-4 секунды
- **LCP (Largest Contentful Paint):** < 5 секунд

**Chunks должны загружаться:**
1. `vendor-*.js` (React) - первым
2. `ui-vendor-*.js` (Radix UI) - вторым
3. `index-*.js` (ваш код) - третьим

---

## 🐛 Troubleshooting:

### Проблема: FCP > 10 секунд

**Решение:**
1. Очистите кэш: Settings → Clear Build Cache
2. Redeploy
3. В браузере: Ctrl+Shift+R (hard refresh)

### Проблема: "Cannot read 'forwardRef' of undefined"

**Решение:**
- Проверьте что `vite.config.ts` содержит правильный chunk splitting
- React должен быть в `vendor` chunk, а НЕ в отдельном `react-vendor`

### Проблема: Показывает старую версию

**Решение:**
1. Telegram: Settings → Data and Storage → Clear Cache
2. Перезапустите Telegram
3. Проверьте что GitHub имеет последний коммит

---

## 📊 Архитектура деплоя:

```
Replit (Development)
  ↓
GitHub (Source Code)
  ↓
Railway (Production)
  ├── Build: npm run build (Vite)
  ├── Output: dist/ folder
  └── Server: Caddy (automatic SPA routing)
```

**Backend остается на Replit** - Railway деплоит только frontend!

---

## 🔗 Полезные ссылки:

- Production URL: https://w4tg.up.railway.app
- Railway Dashboard: https://railway.app/dashboard
- GitHub Repo: https://github.com/Muzaffarfsd/telegram-mini-app-showcase

---

**Последнее обновление:** 24 ноября 2025
