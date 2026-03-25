# 🚂 Полный гайд: Деплой Replit Vite приложений на Railway

**Цель:** Успешно задеплоить Vite + React приложение с Replit на Railway без проблем с загрузкой.

---

## 📋 Содержание

1. [Подготовка проекта](#1-подготовка-проекта)
2. [Настройка Railway конфигурации](#2-настройка-railway-конфигурации)
3. [Vite конфигурация](#3-vite-конфигурация)
4. [Package.json настройки](#4-packagejson-настройки)
5. [HTML оптимизация](#5-html-оптимизация)
6. [Деплой на Railway](#6-деплой-на-railway)
7. [Решение проблем](#7-решение-проблем)

---

## 1. Подготовка проекта

### Структура файлов

```
your-project/
├── client/              # Frontend код
│   ├── src/
│   ├── index.html      # HTML шаблон
│   └── ...
├── dist/               # Собранные файлы (создаётся при build)
├── server/             # Backend (если есть)
├── vite.config.ts      # ✅ КРИТИЧЕСКИЙ файл
├── railway.json        # ✅ КРИТИЧЕСКИЙ файл
├── package.json        # ✅ КРИТИЧЕСКИЙ файл
└── .gitignore
```

### .gitignore обязательно должен содержать:

```gitignore
node_modules/
.env
.env.local
dist/
.DS_Store
```

**⚠️ НЕ КОММИТЬТЕ `dist/` в git!** Railway соберёт его сам.

---

## 2. Настройка Railway конфигурации

### Создайте `railway.json` в корне проекта:

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

### ✅ Что это делает:

- **`"builder": "RAILPACK"`** - использует новый Railpack builder (быстрее Nixpacks)
- **`healthcheckPath: "/"`** - Railway проверит главную страницу
- **`healthcheckTimeout: 100`** - дает 100 секунд на старт

### ❌ НИКОГДА НЕ ДЕЛАЙТЕ:

```json
{
  "deploy": {
    "startCommand": null  // ❌ НЕ СТАВЬТЕ null - это отключает Caddy!
  }
}
```

**Правило:** Если у вас SPA без бэкенда - **НЕ указывайте startCommand вообще**. Railpack сам запустит Caddy.

---

## 3. Vite конфигурация

### ✅ ПРАВИЛЬНЫЙ `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: '/',  // ✅ Обязательно для Railway
  
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    // Другие плагины...
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  
  root: path.resolve(import.meta.dirname, "client"),
  
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    target: 'es2020',
    minify: 'terser',
    
    rollupOptions: {
      output: {
        // ✅ КРИТИЧНО: НЕ разделяйте React в отдельный chunk!
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // ✅ React ДОЛЖЕН остаться в vendor chunk
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Все остальное включая React в vendor
            return 'vendor';
          }
          
          // Route splitting (опционально)
          if (id.includes('/src/pages/')) {
            return 'pages';
          }
        },
        
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    chunkSizeWarningLimit: 500,
    sourcemap: 'hidden',
    cssCodeSplit: true,
  },
  
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,  // ✅ Для Railway важно!
  },
});
```

### 🚨 ЧАСТЫЕ ОШИБКИ:

#### ❌ НЕ ДЕЛАЙТЕ ТАК:

```typescript
manualChunks: (id) => {
  if (id.includes('react') || id.includes('react-dom')) {
    return 'react-vendor';  // ❌ ОШИБКА: создаёт проблемы загрузки!
  }
  return 'vendor';
}
```

**Проблема:** React загрузится ПОСЛЕ vendor chunk, который уже попытается использовать `useState` → **crash!**

#### ✅ ПРАВИЛЬНО:

```typescript
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    // React остаётся в vendor - гарантирует правильный порядок загрузки
    return 'vendor';
  }
}
```

---

## 4. Package.json настройки

### ✅ ПРАВИЛЬНЫЙ package.json:

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
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

### 🚨 ВАЖНО:

#### ❌ НЕ добавляйте `"start"` script для SPA:

```json
{
  "scripts": {
    "start": "node server.js"  // ❌ Только для бэкенд приложений!
  }
}
```

**Почему:** Railpack автоматически определяет SPA по отсутствию start script и запускает Caddy.

#### ✅ Если у вас ЕСТЬ backend:

```json
{
  "scripts": {
    "build": "vite build",
    "start": "node server/index.js"
  }
}
```

Тогда Railway запустит `npm start` вместо Caddy.

---

## 5. HTML оптимизация

### ❌ НЕ добавляйте вручную modulepreload:

```html
<!-- ❌ УДАЛИТЕ ЭТО из client/index.html -->
<link rel="modulepreload" href="/src/main.tsx">
```

**Проблема:** Vite сам добавит правильные modulepreload при сборке. Если добавите вручную - создаст data URI который браузер отклонит.

### ✅ ПРАВИЛЬНЫЙ client/index.html:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your App</title>
  
  <!-- ✅ Vite сам добавит modulepreload при build -->
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

После `npm run build` → Vite создаст `dist/index.html` с правильными путями:

```html
<!-- dist/index.html после сборки -->
<script type="module" src="/assets/index-ABC123.js"></script>
<link rel="modulepreload" href="/assets/vendor-XYZ789.js">
```

---

## 6. Деплой на Railway

### Шаг 1: Создайте проект в Railway

1. Зайдите на [railway.app](https://railway.app)
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Выберите ваш репозиторий

### Шаг 2: Настройте переменные окружения

В Railway Dashboard → **Variables** → **Add Variable**:

```
RAILPACK_SPA_OUTPUT_DIR=dist
```

**Зачем:** Говорит Railpack где искать собранные файлы.

### Шаг 3: Проверьте настройки

В Railway Dashboard → **Settings**:

- ✅ **Builder:** должен быть **Railpack** (не Nixpacks)
- ✅ **Start Command:** должно быть **ПУСТО** (для SPA)
- ✅ **Root Directory:** `.` (корень проекта)

### Шаг 4: Деплой

Railway автоматически:
1. Клонирует ваш repo
2. Запустит `npm install`
3. Запустит `npm run build`
4. Запустит Caddy сервер для раздачи `dist/`
5. Сделает healthcheck на `/`
6. Если healthcheck пройдёт → деплой успешен! ✅

### Шаг 5: Получите URL

В Railway Dashboard → **Settings** → **Networking** → **Generate Domain**

Ваше приложение будет доступно по адресу: `https://yourapp.up.railway.app`

---

## 7. Решение проблем

### Проблема 1: Контейнер убивается через 5 секунд

**Симптомы:**
```
[inf] server running
[inf] handled request
[inf] Stopping Container (через 5 сек)
```

**Причина:** Healthcheck не проходит.

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

2. Убедитесь что переменная `RAILPACK_SPA_OUTPUT_DIR=dist` установлена

3. Проверьте что `dist/index.html` существует после сборки

---

### Проблема 2: "Cannot read properties of undefined (reading 'useState')"

**Симптомы:** Сайт показывает только loading screen, в консоли:
```
vendor-ABC.js:1 Uncaught TypeError: Cannot read properties of undefined (reading 'useState')
```

**Причина:** React загружается ПОСЛЕ кода который его использует.

**Решение:** Не разделяйте React в отдельный chunk:

```typescript
// ❌ НЕПРАВИЛЬНО
manualChunks: (id) => {
  if (id.includes('react')) return 'react-vendor';
  return 'vendor';
}

// ✅ ПРАВИЛЬНО
manualChunks: (id) => {
  if (id.includes('node_modules')) return 'vendor'; // React тоже здесь
}
```

---

### Проблема 3: "Expected JavaScript but got application/octet-stream"

**Симптомы:**
```
Failed to load module script: Expected a JavaScript module 
but the server responded with a MIME type of "application/octet-stream"
```

**Причина:** В `client/index.html` есть ручной modulepreload с data URI.

**Решение:** Удалите все `<link rel="modulepreload">` из `client/index.html`. Vite добавит их сам при сборке.

---

### Проблема 4: Файлы не загружаются (404)

**Симптомы:** В Network tab браузера все JS/CSS файлы показывают 404.

**Причина:** Caddy не видит папку `dist/`.

**Решение:**

1. Проверьте что `dist/` создаётся при `npm run build`
2. Добавьте переменную: `RAILPACK_SPA_OUTPUT_DIR=dist`
3. Проверьте `vite.config.ts`:
```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist"),
}
```

---

### Проблема 5: "npm start" запускается вместо Caddy

**Симптомы:** В логах Railway видно `npm start` → `node server.js`

**Причина:** В `package.json` есть `"start"` script.

**Решение:**

#### Для SPA (без backend):
Удалите `"start"` script из package.json:

```json
{
  "scripts": {
    "build": "vite build"
    // ✅ НЕТ "start" script
  }
}
```

#### Для Full-Stack (с backend):
Оставьте `"start"`, но убедитесь что сервер раздаёт `dist/`:

```javascript
// server/index.js
import express from 'express';
import path from 'path';

const app = express();

// Раздавать статику из dist/
app.use(express.static(path.join(process.cwd(), 'dist')));

// Все остальные маршруты → index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(process.env.PORT || 3000);
```

---

## 📋 Чеклист перед деплоем

Перед каждым деплоем на Railway проверьте:

- [ ] ✅ `railway.json` существует с правильными настройками
- [ ] ✅ `vite.config.ts` НЕ разделяет React в отдельный chunk
- [ ] ✅ `client/index.html` БЕЗ ручных modulepreload
- [ ] ✅ `package.json` БЕЗ "start" script (для SPA)
- [ ] ✅ `.gitignore` содержит `dist/` и `node_modules/`
- [ ] ✅ `npm run build` работает локально
- [ ] ✅ В Railway переменная `RAILPACK_SPA_OUTPUT_DIR=dist`
- [ ] ✅ В Railway Start Command **ПУСТОЙ**
- [ ] ✅ Healthcheck Path = `/`

---

## 🎯 Быстрый старт (TL;DR)

Для успешного деплоя нужно всего **3 файла**:

### 1. `railway.json`:
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {"builder": "RAILPACK"},
  "deploy": {"healthcheckPath": "/", "healthcheckTimeout": 100}
}
```

### 2. `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/',
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  }
});
```

### 3. `package.json`:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

**+ Переменная в Railway:** `RAILPACK_SPA_OUTPUT_DIR=dist`

**Всё!** Теперь ваше приложение задеплоится без проблем! 🚀

---

## 🔗 Полезные ссылки

- [Railway Docs](https://docs.railway.com)
- [Railpack Docs](https://railpack.com)
- [Vite Static Deploy Guide](https://vite.dev/guide/static-deploy)
- [Railway Templates](https://railway.app/templates)

---

**Создано:** 18 ноября 2025  
**Версия:** 1.0  
**Статус:** ✅ Проверено на production
