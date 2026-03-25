# 🚀 МАСТЕР-ГАЙД: Разработка в Replit → Деплой на Railway

**Цель:** С ПЕРВОГО РАЗА успешно задеплоить любое Vite+React приложение с Replit на Railway.

**Важно:** Следуйте этому гайду СТРОГО по порядку. Каждый шаг критичен!

---

## 📚 СОДЕРЖАНИЕ

### ЧАСТЬ 1: РАЗРАБОТКА В REPLIT
1. [Создание проекта в Replit](#часть-1-разработка-в-replit)
2. [Структура проекта](#структура-проекта)
3. [Важные файлы конфигурации](#важные-файлы-конфигурации)
4. [Best Practices в Replit](#best-practices-в-replit)

### ЧАСТЬ 2: ПОДГОТОВКА К ДЕПЛОЮ
5. [Чеклист перед деплоем](#часть-2-подготовка-к-деплою)
6. [Критические файлы для Railway](#критические-файлы-для-railway)
7. [Git настройка](#git-настройка)

### ЧАСТЬ 3: ДЕПЛОЙ НА RAILWAY
8. [Первый деплой (пошагово)](#часть-3-деплой-на-railway)
9. [Настройка переменных окружения](#настройка-переменных-окружения)
10. [Проверка деплоя](#проверка-деплоя)

### ЧАСТЬ 4: TROUBLESHOOTING
11. [Частые ошибки и решения](#часть-4-troubleshooting)
12. [Как читать логи Railway](#как-читать-логи-railway)
13. [Отладка в production](#отладка-в-production)

### ЧАСТЬ 5: ПОСЛЕ ДЕПЛОЯ
14. [Continuous Deployment](#часть-5-после-деплоя)
15. [Обновления приложения](#обновления-приложения)
16. [Мониторинг и метрики](#мониторинг-и-метрики)

---

# ЧАСТЬ 1: РАЗРАБОТКА В REPLIT

## 1.1. Создание проекта в Replit

### Способ 1: С нуля (Node.js)

1. Зайдите на [replit.com](https://replit.com)
2. Нажмите **"Create Repl"**
3. Выберите **"Node.js"** (не Vite, не React - выберите чистый Node.js)
4. Введите имя проекта
5. Нажмите **"Create Repl"**

**Почему Node.js а не React template?** Replit шаблоны часто устаревшие. Лучше настроить всё вручную.

### Способ 2: Импорт из GitHub

1. Создайте repo на GitHub
2. В Replit нажмите **"Create Repl"**
3. Выберите **"Import from GitHub"**
4. Вставьте URL вашего repo
5. Нажмите **"Import from GitHub"**

---

## 1.2. Структура проекта

### ✅ ПРАВИЛЬНАЯ структура для Vite+React:

```
your-project/
├── client/                    # Frontend код
│   ├── src/
│   │   ├── main.tsx          # Entry point
│   │   ├── App.tsx           # Main component
│   │   ├── index.css         # Global styles
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utilities
│   │   └── hooks/            # Custom hooks
│   ├── index.html            # HTML template
│   └── public/               # Static assets
│
├── server/                    # Backend (опционально)
│   ├── index.ts              # Server entry
│   └── routes.ts             # API routes
│
├── shared/                    # Shared types/schemas
│   └── schema.ts             # Database schema
│
├── attached_assets/           # Replit assets (images)
│
├── dist/                      # ⚠️ Build output (НЕ коммитить!)
│
├── node_modules/              # ⚠️ Dependencies (НЕ коммитить!)
│
├── .gitignore                 # ✅ КРИТИЧНО!
├── package.json               # ✅ КРИТИЧНО!
├── vite.config.ts             # ✅ КРИТИЧНО!
├── railway.json               # ✅ КРИТИЧНО для Railway!
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── replit.md                  # Документация проекта
```

### 🚨 ВАЖНО: Что НЕ коммитить в Git

Создайте `.gitignore` **СРАЗУ**:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
dist-ssr/
*.local

# Environment
.env
.env.local
.env.production
.env.development

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*

# Editor
.DS_Store
.vscode/
.idea/

# Replit specific
.replit
.upm/
.config/
.cache/

# Don't commit these to Railway!
.breakpoints
replit.nix
```

**⚠️ НИКОГДА НЕ КОММИТЬТЕ:**
- `dist/` - Railway соберёт его сам
- `node_modules/` - Railway установит сам
- `.env` - секреты никогда в git!

---

## 1.3. Важные файлы конфигурации

### 📄 `package.json` - КРИТИЧЕСКИЙ файл!

```json
{
  "name": "your-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

### 🚨 ДЛЯ SPA (БЕЗ BACKEND):

**НЕ ДОБАВЛЯЙТЕ `"start"` script!**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
    // ❌ НЕТ "start"! Это важно для Railway!
  }
}
```

**Почему?** Railway видит отсутствие `start` → автоматически использует Caddy для SPA.

### ✅ ДЛЯ FULL-STACK (С BACKEND):

```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "start": "node server/index.js"
  }
}
```

---

### 📄 `vite.config.ts` - КРИТИЧЕСКИЙ для production!

**✅ КОПИРУЙТЕ ЭТУ КОНФИГУРАЦИЮ:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // ✅ ОБЯЗАТЕЛЬНО для Railway
  base: '/',
  
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  
  // ✅ КРИТИЧНО: root указывает на client/
  root: path.resolve(import.meta.dirname, "client"),
  
  build: {
    // ✅ Output в dist/ (корень проекта)
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    target: 'es2020',
    minify: 'terser',
    
    rollupOptions: {
      output: {
        // 🚨 КРИТИЧНО: Правильный chunk splitting!
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // ✅ React ДОЛЖЕН быть в vendor chunk!
            // ❌ НЕ создавайте отдельный react-vendor!
            
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Все остальное включая React
            return 'vendor';
          }
        },
        
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    sourcemap: 'hidden',
    cssCodeSplit: true,
  },
  
  // ✅ Dev server настройки для Replit
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,  // Важно для Railway!
  },
});
```

### 🚨 ЧАСТАЯ ОШИБКА - НЕ ДЕЛАЙТЕ ТАК:

```typescript
// ❌ НЕПРАВИЛЬНО - создаёт проблемы загрузки!
manualChunks: (id) => {
  if (id.includes('react') || id.includes('react-dom')) {
    return 'react-vendor';  // ❌ React загрузится после vendor!
  }
  return 'vendor';
}
```

**Проблема:** Vendor chunk загружается первым и пытается использовать React → **"Cannot read 'useState' of undefined"** crash!

---

### 📄 `railway.json` - СОЗДАЙТЕ СРАЗУ!

**В КОРНЕ ПРОЕКТА** создайте файл `railway.json`:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK"
  },
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

### 🔍 Что это делает:

- **`builder: "RAILPACK"`** - Использует новый Railpack (быстрее Nixpacks)
- **`healthcheckPath: "/"`** - Railway проверит главную страницу после старта
- **`healthcheckTimeout: 100`** - Даёт 100 секунд на запуск

### ❌ ОШИБКИ которых избегать:

```json
{
  "deploy": {
    "startCommand": null  // ❌ НЕ СТАВЬТЕ null!
  }
}
```

**Почему плохо:** `null` отключает автозапуск Caddy. Лучше вообще не указывать `startCommand` для SPA.

---

### 📄 `client/index.html` - Базовый шаблон

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your App</title>
  
  <!-- ✅ НЕ добавляйте вручную modulepreload! -->
  <!-- Vite добавит их автоматически при сборке -->
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### 🚨 НЕ ДЕЛАЙТЕ:

```html
<!-- ❌ УДАЛИТЕ если есть! -->
<link rel="modulepreload" href="/src/main.tsx">
<link rel="modulepreload" href="data:application/octet-stream;base64,...">
```

**Проблема:** Создаёт MIME type ошибки в production. Vite сам добавит правильные preload при `vite build`.

---

## 1.4. Best Practices в Replit

### ✅ Workflow настройка

В Replit создайте `.replit` файл:

```toml
run = "npm run dev"

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "npm run build"]
```

### ✅ Используйте TypeScript

```typescript
// Строгие типы предотвращают ошибки
const MyComponent: React.FC = () => {
  return <div>Hello</div>;
};
```

### ✅ Environment Variables

В Replit создайте **Secrets** (не .env файл!):

1. Sidebar → **Tools** → **Secrets**
2. Добавьте ключи: `DATABASE_URL`, `API_KEY` и т.д.

**⚠️ НИКОГДА** не коммитьте .env в git!

### ✅ Database (если используете)

Если нужна БД в dev:

1. Используйте Replit встроенную PostgreSQL: Tools → Database
2. Или подключитесь к внешней БД (Neon, Supabase)

**На Railway:** БД **НЕ будет**! Это только static frontend.

---

# ЧАСТЬ 2: ПОДГОТОВКА К ДЕПЛОЮ

## 2.1. Чеклист перед деплоем (ОБЯЗАТЕЛЬНО!)

Пройдите этот чеклист **ДО ДЕПЛОЯ:**

### 📋 Файлы конфигурации

- [ ] ✅ `railway.json` создан с правильными настройками
- [ ] ✅ `.gitignore` содержит `dist/`, `node_modules/`, `.env`
- [ ] ✅ `vite.config.ts` с правильным chunk splitting (React в vendor)
- [ ] ✅ `client/index.html` БЕЗ ручных modulepreload
- [ ] ✅ `package.json` БЕЗ "start" script (для SPA)

### 📋 Код

- [ ] ✅ `npm run build` работает локально без ошибок
- [ ] ✅ `dist/` создаётся и содержит `index.html`
- [ ] ✅ Все пути импортов правильные (без абсолютных `/app/...`)
- [ ] ✅ Нет hardcoded `localhost` URLs (используйте env variables)

### 📋 Git

- [ ] ✅ Все изменения закоммичены
- [ ] ✅ `.env` НЕ в git (проверьте `git status`)
- [ ] ✅ `dist/` НЕ в git
- [ ] ✅ Branch pushed на GitHub

### 📋 Assets

- [ ] ✅ Все images/fonts доступны в `public/` или `attached_assets/`
- [ ] ✅ Пути к assets используют относительные или @aliases

---

## 2.2. Критические файлы для Railway

### ✅ Минимальный набор для SPA:

```
your-project/
├── client/
│   ├── src/
│   └── index.html
├── .gitignore          ✅ ОБЯЗАТЕЛЬНО
├── package.json        ✅ ОБЯЗАТЕЛЬНО
├── vite.config.ts      ✅ ОБЯЗАТЕЛЬНО
└── railway.json        ✅ ОБЯЗАТЕЛЬНО
```

### Проверьте каждый файл:

#### `.gitignore`:
```bash
# В Replit Shell проверьте:
cat .gitignore | grep -E "dist|node_modules"

# Должно показать:
# dist/
# node_modules/
```

#### `package.json`:
```bash
# Проверьте что НЕТ "start":
grep -E '"start"' package.json

# Для SPA должно быть ПУСТО!
```

#### `vite.config.ts`:
```bash
# Проверьте chunk config:
grep -A 10 "manualChunks" vite.config.ts

# НЕ должно быть 'react-vendor'!
```

#### `railway.json`:
```bash
cat railway.json

# Должно быть:
# {
#   "build": { "builder": "RAILPACK" },
#   "deploy": { "healthcheckPath": "/" }
# }
```

---

## 2.3. Git настройка

### Инициализация Git (если ещё нет)

```bash
# 1. Инициализация
git init

# 2. Создайте .gitignore ПЕРЕД первым commit!
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.replit
.upm/
EOF

# 3. Первый commit
git add .
git commit -m "Initial commit: Vite+React app ready for Railway"

# 4. Подключите GitHub repo
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### Регулярные обновления

```bash
# После изменений:
git add .
git commit -m "Describe your changes"
git push
```

### 🚨 ЕСЛИ ЗАБЫЛИ .gitignore

Если вы уже закоммитили `dist/` или `node_modules/`:

```bash
# Удалите из git (но оставьте локально):
git rm -r --cached dist/ node_modules/
git commit -m "Remove build artifacts from git"
git push
```

---

# ЧАСТЬ 3: ДЕПЛОЙ НА RAILWAY

## 3.1. Первый деплой (пошагово)

### Шаг 1: Создайте аккаунт Railway

1. Зайдите на [railway.app](https://railway.app)
2. Нажмите **"Login"** → войдите через GitHub
3. Подтвердите доступ к GitHub

### Шаг 2: Создайте новый проект

1. На dashboard нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Нажмите **"Configure GitHub App"** (если первый раз)
4. Выберите ваш репозиторий из списка
5. Нажмите **"Deploy Now"**

### Шаг 3: Railway начнёт сборку

Вы увидите логи:

```
[INFO] Starting build...
[INFO] Installing dependencies...
[INFO] Running npm install...
[INFO] Running npm run build...
[INFO] Build complete!
[INFO] Starting deployment...
```

### Шаг 4: Настройте переменные

Пока идёт сборка:

1. Перейдите на вкладку **"Variables"**
2. Нажмите **"New Variable"**
3. Добавьте:
   - **Name:** `RAILPACK_SPA_OUTPUT_DIR`
   - **Value:** `dist`
4. Нажмите **"Add"**

### Шаг 5: Проверьте Settings

1. Перейдите на вкладку **"Settings"**
2. Найдите секцию **"Deploy"**
3. Убедитесь:
   - ✅ **Builder:** Railpack (не Nixpacks)
   - ✅ **Start Command:** **ПУСТО** (не заполнено)
   - ✅ **Root Directory:** `.` (корень)

### Шаг 6: Generate Domain

1. В Settings → **Networking**
2. Нажмите **"Generate Domain"**
3. Скопируйте URL: `https://yourapp-production.up.railway.app`

### Шаг 7: Дождитесь завершения

Следите за логами:

```
✅ Build completed successfully
✅ Starting Caddy server...
✅ Server running on port 3000
✅ Health check passed
✅ Deployment successful!
```

### Шаг 8: Откройте сайт!

1. Нажмите на **URL** в верхней части dashboard
2. Или откройте `https://yourapp-production.up.railway.app`

🎉 **Если сайт загрузился - УСПЕХ!**

---

## 3.2. Настройка переменных окружения

### Для SPA (обычно хватает):

```
RAILPACK_SPA_OUTPUT_DIR=dist
```

### Если используете API keys (например, для Vite env vars):

В Railway **Variables** добавьте с префиксом `VITE_`:

```
VITE_API_URL=https://api.example.com
VITE_TELEGRAM_BOT_NAME=YourBot
```

**Важно:** Vite **НЕ** видит переменные без `VITE_` префикса!

В коде:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Секреты (API keys, tokens):

```
STRIPE_SECRET_KEY=sk_live_...
DATABASE_URL=postgresql://...
```

**⚠️ НИКОГДА** не коммитьте секреты в git!

---

## 3.3. Проверка деплоя

### ✅ Признаки успешного деплоя:

1. **В логах Railway:**
```
✅ [INFO] Build completed
✅ [INFO] Caddy server running
✅ [INFO] Health check passed
✅ [INFO] Deployment Active
```

2. **В браузере:**
- Сайт загружается быстро (1-3 секунды)
- Нет бесконечного loading spinner
- Консоль (F12) без красных ошибок

3. **В Railway Dashboard:**
- Status: **Active** (зелёный)
- Health: **Healthy**
- Metrics показывают requests

### ❌ Признаки проблем:

1. **В логах:**
```
❌ [ERROR] Build failed
❌ [ERROR] Health check timeout
❌ [INFO] Stopping Container
```

2. **В браузере:**
- Infinite loading spinner
- 404 Not Found
- Console errors: "Cannot read 'useState'"

3. **В Railway:**
- Status: **Failed** (красный)
- Container restarts каждые 5 секунд

→ Смотрите [ЧАСТЬ 4: Troubleshooting](#часть-4-troubleshooting)

---

# ЧАСТЬ 4: TROUBLESHOOTING

## 4.1. Частые ошибки и решения

### ❌ ОШИБКА 1: "Cannot read properties of undefined (reading 'useState')"

**Симптомы:**
- Сайт показывает только loading screen
- В Console (F12): `vendor-ABC.js:1 Uncaught TypeError`

**Причина:** React chunk загружается **после** vendor chunk который его использует.

**Решение:**

1. Откройте `vite.config.ts`
2. Найдите `manualChunks`
3. Убедитесь что React **НЕ** в отдельном chunk:

```typescript
// ✅ ПРАВИЛЬНО
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    return 'vendor'; // React тоже здесь!
  }
}

// ❌ НЕПРАВИЛЬНО
manualChunks: (id) => {
  if (id.includes('react')) return 'react-vendor'; // ❌
  return 'vendor';
}
```

4. Пересоберите:
```bash
npm run build
git add vite.config.ts
git commit -m "Fix: keep React in vendor bundle"
git push
```

Railway автоматически задеплоит новую версию.

---

### ❌ ОШИБКА 2: Контейнер убивается через 5-10 секунд

**Симптомы:**
```
[INFO] Caddy server running
[INFO] handled request
[INFO] Stopping Container (5 секунд спустя)
```

**Причина:** Health check не проходит.

**Решение:**

1. Проверьте `railway.json`:
```json
{
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

2. Проверьте переменную `RAILPACK_SPA_OUTPUT_DIR=dist`

3. Убедитесь что `dist/index.html` создаётся при build:
```bash
npm run build
ls dist/index.html  # Должен существовать!
```

4. Если нет - проверьте `vite.config.ts`:
```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist"),
}
```

---

### ❌ ОШИБКА 3: "Expected JavaScript but got application/octet-stream"

**Симптомы:**
```
Failed to load module script: Expected a JavaScript module
but the server responded with a MIME type of "application/octet-stream"
```

**Причина:** В `client/index.html` есть ручной modulepreload с data URI.

**Решение:**

1. Откройте `client/index.html`
2. **Удалите** все строки с `<link rel="modulepreload">`:

```html
<!-- ❌ УДАЛИТЕ -->
<link rel="modulepreload" href="/src/main.tsx">
<link rel="modulepreload" href="data:application/octet-stream;base64,...">
```

3. Пересоберите:
```bash
npm run build
git add client/index.html
git commit -m "Remove manual modulepreload"
git push
```

**Почему:** Vite **сам** добавит правильные modulepreload при сборке в `dist/index.html`.

---

### ❌ ОШИБКА 4: Все файлы возвращают 404

**Симптомы:**
- В Network tab (F12): все JS/CSS файлы показывают 404
- Сайт полностью не загружается

**Причина:** Caddy не видит папку `dist/`.

**Решение:**

1. Проверьте что `dist/` создаётся:
```bash
npm run build
ls -la dist/
# Должны быть: index.html, assets/, manifest.json
```

2. Проверьте переменную в Railway:
   - Variables → `RAILPACK_SPA_OUTPUT_DIR=dist`

3. Проверьте `vite.config.ts`:
```typescript
root: path.resolve(import.meta.dirname, "client"),
build: {
  outDir: path.resolve(import.meta.dirname, "dist"),
}
```

4. Убедитесь что `dist/` **НЕ** в git:
```bash
git status
# НЕ должно показывать файлы из dist/
```

---

### ❌ ОШИБКА 5: "npm start" запускается вместо Caddy

**Симптомы:**
```
> npm start
> node server.js

Server started on port 5000
Stopping Container (5 сек)
```

**Причина:** В `package.json` есть `"start"` script.

**Решение для SPA:**

1. Откройте `package.json`
2. **Удалите** `"start"` script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
    // ✅ НЕТ "start"
  }
}
```

3. Commit и push:
```bash
git add package.json
git commit -m "Remove start script for SPA deployment"
git push
```

**Решение для Full-Stack:**

Если у вас **ЕСТЬ backend**, оставьте `"start"`, но настройте сервер правильно:

```javascript
// server/index.js
import express from 'express';
import path from 'path';

const app = express();

// Раздавать статику
app.use(express.static('dist'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(process.env.PORT || 3000);
```

---

### ❌ ОШИБКА 6: Vite environment variables не работают

**Симптомы:**
```typescript
console.log(import.meta.env.VITE_API_URL); // undefined
```

**Причина:** Переменные без `VITE_` префикса или не добавлены в Railway.

**Решение:**

1. В Railway **Variables** добавьте с префиксом `VITE_`:
```
VITE_API_URL=https://api.example.com
VITE_BOT_NAME=MyBot
```

2. В коде используйте:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

**⚠️ ВАЖНО:** Переменные инжектятся **во время build**, не runtime!

---

### ❌ ОШИБКА 7: Images/assets не загружаются (404)

**Симптомы:**
- Картинки показывают broken image icon
- В Console: 404 для `/assets/image.png`

**Причина:** Неправильные пути к assets.

**Решение:**

1. **В dev** используйте абсолютные пути от public:
```typescript
// ❌ НЕПРАВИЛЬНО
<img src="./image.png" />

// ✅ ПРАВИЛЬНО
<img src="/image.png" />  // Из public/image.png
```

2. **Для динамических imports** используйте @assets alias:
```typescript
import logoUrl from '@assets/logo.png';
<img src={logoUrl} />
```

3. Убедитесь что `vite.config.ts` содержит alias:
```typescript
resolve: {
  alias: {
    "@assets": path.resolve(import.meta.dirname, "attached_assets"),
  }
}
```

---

## 4.2. Как читать логи Railway

### Где найти логи

1. Railway Dashboard → ваш сервис
2. Вкладка **"Deployments"**
3. Кликните на последний deployment
4. Нажмите **"View Logs"**

### Типы логов

#### ✅ Успешная сборка:
```
[INFO] Starting build...
[INFO] Installing dependencies... ✓
[INFO] Running npm run build... ✓
[INFO] Build complete! ✓
[INFO] Creating image... ✓
[INFO] Pushing image... ✓
```

#### ✅ Успешный запуск:
```
[INFO] Starting Container
[INFO] Caddy server running
[INFO] serving initial configuration
[INFO] handled request (healthcheck)
```

#### ❌ Ошибка сборки:
```
[ERROR] npm ERR! Build failed
[ERROR] Exit code 1
```

→ Проверьте `npm run build` локально!

#### ❌ Health check failed:
```
[INFO] Caddy server running
[INFO] Stopping Container (5-10 сек)
```

→ Healthcheck не вернул 200!

### Полезные команды для поиска

Используйте Ctrl+F в логах:

- Найти ошибки: `ERROR`
- Найти warnings: `WARN`
- Проверить healthcheck: `handled request`
- Проверить Caddy: `server running`

---

## 4.3. Отладка в production

### Метод 1: Browser Console

1. Откройте сайт
2. Нажмите **F12**
3. Вкладка **"Console"**
4. Ищите **красные ошибки**

Типичные ошибки:
```
❌ Failed to fetch module
❌ TypeError: Cannot read...
❌ 404 Not Found
```

### Метод 2: Network Tab

1. F12 → вкладка **"Network"**
2. Обновите страницу (F5)
3. Найдите **красные** файлы (404, Failed)

Проверьте:
- ✅ `index.html` → 200 OK
- ✅ `assets/index-ABC.js` → 200 OK
- ✅ `assets/vendor-XYZ.js` → 200 OK

### Метод 3: Проверка отдельных файлов

Откройте напрямую:
```
https://yourapp.up.railway.app/assets/index-ABC123.js
```

Если видите код → файл раздаётся ✅  
Если 404 → Caddy не видит файл ❌

### Метод 4: Sourcemaps

Если ошибка в минифицированном коде:

1. Включите sourcemaps в `vite.config.ts`:
```typescript
build: {
  sourcemap: true, // Временно для отладки
}
```

2. Пересоберите и задеплойте
3. Теперь в Console увидите **реальные** строки кода

**⚠️ После отладки:** Верните `sourcemap: 'hidden'` (безопаснее для production)

---

# ЧАСТЬ 5: ПОСЛЕ ДЕПЛОЯ

## 5.1. Continuous Deployment

Railway **автоматически** задеплоит при каждом push в main branch!

### Workflow:

```bash
# 1. Делаете изменения локально в Replit
# 2. Тестируете: npm run dev

# 3. Commit
git add .
git commit -m "Add new feature"

# 4. Push
git push

# Railway автоматически:
# - Обнаружит новый commit
# - Запустит npm install
# - Запустит npm run build
# - Задеплоит новую версию
# - Выполнит healthcheck
# - Переключит трафик на новую версию
```

**Время деплоя:** обычно 2-4 минуты.

### Отключить auto-deploy:

Если не хотите деплоить при каждом push:

1. Railway → Settings → **Source**
2. Отключите **"Auto Deploy"**
3. Теперь деплой только вручную: **"Deploy Now"**

---

## 5.2. Обновления приложения

### Безопасный процесс обновления:

1. **Тестируйте локально:**
```bash
npm run build
npm run preview  # Проверка production build
```

2. **Проверьте что всё работает**

3. **Commit и push:**
```bash
git add .
git commit -m "Update: describe changes"
git push
```

4. **Следите за Railway логами**

5. **Проверьте production сайт**

### Rollback (откат) если что-то сломалось:

1. Railway → Deployments
2. Найдите **предыдущий успешный** deployment
3. Нажмите три точки **⋮**
4. Выберите **"Redeploy"**

Railway вернётся к старой версии!

---

## 5.3. Мониторинг и метрики

### В Railway Dashboard:

1. **Metrics** - показывает:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

2. **Logs** - все логи приложения

3. **Health** - статус healthcheck

### Установите уведомления:

1. Railway → Settings → **Notifications**
2. Подключите Discord/Slack/Email
3. Получайте уведомления о:
   - Deployment failures
   - Health check failures
   - High resource usage

---

## 📋 ИТОГОВЫЙ ЧЕКЛИСТ

Перед КАЖДЫМ деплоем проверяйте:

### Файлы:
- [ ] ✅ `railway.json` с Railpack и healthcheck
- [ ] ✅ `vite.config.ts` с правильным chunk splitting
- [ ] ✅ `.gitignore` содержит dist/, node_modules/, .env
- [ ] ✅ `client/index.html` БЕЗ ручных modulepreload
- [ ] ✅ `package.json` БЕЗ "start" (для SPA)

### Тесты:
- [ ] ✅ `npm run build` работает без ошибок
- [ ] ✅ `dist/index.html` создаётся
- [ ] ✅ Нет hardcoded localhost URLs
- [ ] ✅ Все assets доступны

### Git:
- [ ] ✅ Все изменения закоммичены
- [ ] ✅ dist/ НЕ в git
- [ ] ✅ .env НЕ в git
- [ ] ✅ Push в main branch

### Railway:
- [ ] ✅ Переменная `RAILPACK_SPA_OUTPUT_DIR=dist`
- [ ] ✅ Start Command **ПУСТОЙ**
- [ ] ✅ Builder = Railpack
- [ ] ✅ Domain generated

---

## 🎯 Quick Reference

### Если что-то сломалось:

| Симптом | Решение |
|---------|---------|
| "Cannot read 'useState'" | React в отдельном chunk → переместите в vendor |
| Container stops after 5s | Health check не проходит → проверьте railway.json |
| "application/octet-stream" | Удалите ручные modulepreload из index.html |
| 404 на все файлы | dist/ не создаётся → проверьте vite.config.ts |
| "npm start" запускается | Удалите "start" script из package.json |
| Env vars не работают | Добавьте VITE_ префикс в Railway Variables |

### Важные команды:

```bash
# Локальная сборка
npm run build

# Проверка production build
npm run preview

# Git workflow
git add .
git commit -m "message"
git push

# Проверка gitignore
git status  # dist/ НЕ должно быть в списке
```

---

## 🔗 Полезные ссылки

- [Railway Docs](https://docs.railway.com)
- [Railpack Docs](https://railpack.com)
- [Vite Docs](https://vite.dev)
- [Railway Status](https://status.railway.app) - проверка аптайма

---

**Версия:** 2.0  
**Дата:** 18 ноября 2025  
**Статус:** ✅ Проверено на production  
**Автор:** Полный опыт миграции Replit → Railway

🚀 **Следуйте этому гайду и ваш деплой пройдёт С ПЕРВОГО РАЗА!**
