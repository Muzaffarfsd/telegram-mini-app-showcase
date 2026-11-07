# 🚀 Финальная инструкция: Деплой на Railway

## ✅ Что исправлено:
1. **AI чат удален** - плавающий чат убран из приложения
2. **Node 20 конфигурация** - создан `.nvmrc` для Railway
3. **Все файлы проверены** - готовы к деплою

---

## 📦 ШАГ 1: Загрузка кода в GitHub (5 минут)

### 1.1 Скачайте финальный архив
1. В Replit найдите файл: **`telegram-miniapp-final.tar.gz`**
2. Правый клик → **Download**
3. Сохраните на компьютер

### 1.2 Распакуйте архив
- **Windows**: ПКМ → Извлечь с 7-Zip/WinRAR
- **Mac**: Двойной клик  
- **Linux**: `tar -xzf telegram-miniapp-final.tar.gz`

### 1.3 Загрузите в GitHub
1. Откройте: https://github.com/Muzaffarfsd/telegram-mini-app-showcase
2. Кликните **"Add file"** → **"Upload files"**
3. **Перетащите ВСЕ файлы и папки** из распакованного архива
4. Должны быть папки: `client/`, `server/`, `shared/`, `attached_assets/`
5. **Важно:** Убедитесь что файл `.nvmrc` тоже загружен!
6. Внизу введите: "Add complete application code - Ready for Railway"
7. Нажмите **"Commit changes"**

⏳ Подождите 1-2 минуты пока GitHub загрузит все файлы

---

## 🚂 ШАГ 2: Деплой на Railway (5 минут)

### 2.1 Создать проект
1. Откройте https://railway.app
2. **Login** → войдите через **GitHub**
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Найдите и выберите **`telegram-mini-app-showcase`**

Railway автоматически обнаружит:
- ✅ Node.js проект (из package.json)
- ✅ Build команду: `npm run build`
- ✅ Start команду: `npm start`
- ✅ Node 20 (из .nvmrc)

### 2.2 Добавить PostgreSQL
1. В проекте нажмите кнопку **"+ New"**
2. Выберите **"Database"**
3. Выберите **"Add PostgreSQL"**
4. Railway автоматически:
   - Создаст базу данных
   - Добавит переменную `DATABASE_URL`
   - Подключит её к вашему сервису

### 2.3 Настроить переменные окружения
1. Кликните на ваш **сервис** (НЕ на PostgreSQL)
2. Перейдите на вкладку **"Variables"**
3. Нажмите **"+ Add Variable"**
4. Добавьте:

```
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
NODE_ENV=production
PORT=5000
```

5. `DATABASE_URL` уже должен быть там (добавлен автоматически из PostgreSQL)

### 2.4 Запустить деплой
1. Railway автоматически начнет сборку
2. Перейдите на вкладку **"Deployments"**
3. Кликните на текущий деплой
4. Нажмите **"View Logs"** чтобы следить за процессом

⏳ Подождите 3-5 минут - Railway:
- Установит зависимости (`npm install`)
- Соберет frontend (`vite build`)
- Соберет backend (`esbuild server`)
- Запустит сервер (`node dist/index.js`)

✅ **Сборка успешна** когда увидите: `serving on port 5000`

---

## 🌐 ШАГ 3: Получить URL и настроить домен

### 3.1 Сгенерировать домен
1. Кликните на ваш сервис
2. Перейдите на вкладку **"Settings"**
3. Прокрутите до секции **"Networking"**
4. Нажмите **"Generate Domain"**
5. Скопируйте URL (например: `https://telegram-mini-app-showcase-production.up.railway.app`)

---

## 📱 ШАГ 4: Настроить Telegram Bot

### 4.1 Установить Webhook
1. Откройте браузер
2. Вставьте этот URL (замените `YOUR_RAILWAY_URL`):

```
https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook?url=YOUR_RAILWAY_URL/api/telegram/webhook
```

**Пример:**
```
https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook?url=https://telegram-mini-app-showcase-production.up.railway.app/api/telegram/webhook
```

3. Нажмите **Enter**
4. Вы должны увидеть: `{"ok":true,"result":true,"description":"Webhook was set"}`

### 4.2 Настроить Menu Button в BotFather
1. Откройте Telegram → найдите **@BotFather**
2. Отправьте: `/mybots`
3. Выберите вашего бота
4. Нажмите **"Bot Settings"**
5. Выберите **"Menu Button"**
6. Нажмите **"Configure menu button"** или **"Edit Menu Button URL"**
7. Вставьте ваш Railway URL: `https://telegram-mini-app-showcase-production.up.railway.app`
8. Установите текст кнопки: **"Открыть App"** или **"Launch"**

---

## 🎉 ГОТОВО! Проверка работы

### Тестирование:
1. **Откройте вашего бота** в Telegram
2. **Нажмите кнопку** "Открыть App" или "Launch" внизу
3. Должна открыться витрина с 18 бизнес-приложениями
4. Проверьте:
   - ✅ Витрина загружается
   - ✅ Видео проигрываются
   - ✅ Демо открываются
   - ✅ Навигация работает
   - ✅ Геймификация работает
   - ✅ Реферальная система работает

---

## 🔍 Если что-то не работает

### Проверьте логи Railway:
1. Railway → ваш проект → **Deployments**
2. Кликните на деплой → **View Logs**
3. Ищите ошибки (красный текст)

### Частые проблемы:

**Проблема:** `Could not resolve entry module "client/index.html"`
**Решение:** Убедитесь что `.nvmrc` файл загружен в GitHub и Railway перезапустил сборку с Node 20

**Проблема:** Database connection error
**Решение:** Проверьте что PostgreSQL добавлен и `DATABASE_URL` в переменных окружения

**Проблема:** Telegram webhook не работает
**Решение:** 
- Проверьте Railway URL доступен (откройте в браузере)
- Проверьте webhook установлен правильно
- Убедитесь URL заканчивается на `/api/telegram/webhook`

---

## 📊 Мониторинг

### Railway Dashboard показывает:
- **Deployments**: история деплоев
- **Metrics**: CPU, RAM, Network usage
- **Logs**: логи приложения в реальном времени
- **Variables**: переменные окружения

### База данных:
- Откройте PostgreSQL в Railway
- Вкладка **"Data"** → просмотр таблиц
- Вкладка **"Query"** → SQL запросы

---

## ⚡ Полезные команды

### Проверить webhook:
```
https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/getWebhookInfo
```

### Удалить webhook (для тестирования):
```
https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/deleteWebhook
```

---

**Время выполнения:** ~15 минут  
**Стоимость:** Railway дает $5 бесплатных кредитов каждый месяц  
**Результат:** Рабочее Telegram Mini App на production! 🎊
