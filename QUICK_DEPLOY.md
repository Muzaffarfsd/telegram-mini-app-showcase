# ⚡ Быстрое руководство по деплою

Краткая версия для быстрого старта. Полная инструкция в [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 1️⃣ GitHub (2 минуты)

### Через Replit UI:
1. Создайте репозиторий на [github.com](https://github.com/new)
2. В Replit: Git панель → Connect to GitHub
3. Выберите репозиторий → Commit & push

### Через Shell:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

---

## 2️⃣ Railway (3 минуты)

1. Откройте [railway.app](https://railway.app)
2. Login через GitHub
3. New Project → Deploy from GitHub repo
4. Выберите ваш репозиторий
5. Дождитесь первой сборки (может упасть - это нормально)

---

## 3️⃣ PostgreSQL (1 минута)

1. В проекте Railway: **+ New**
2. Database → **Add PostgreSQL**
3. Готово! `DATABASE_URL` добавлена автоматически

---

## 4️⃣ Переменные окружения (2 минуты)

В Railway → Ваш сервис → Variables → + New Variable:

```env
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
NODE_ENV=production
PORT=5000
```

⚠️ `DATABASE_URL` уже добавлена автоматически!

---

## 5️⃣ Домен Railway (1 минута)

1. Railway → Ваш сервис → Settings → Domains
2. **Generate Domain**
3. Скопируйте URL: `your-app.up.railway.app`

---

## 6️⃣ Telegram Webhook (2 минуты)

### Установите webhook:
Откройте в браузере:
```
https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook?url=https://YOUR-APP.up.railway.app/api/telegram/webhook
```

Должен вернуть: `{"ok": true, "result": true}`

### Проверьте webhook:
```
https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/getWebhookInfo
```

---

## 7️⃣ BotFather Menu Button (2 минуты)

1. Telegram → @BotFather
2. `/mybots` → Ваш бот
3. Bot Settings → Menu Button → Configure Menu Button
4. Введите URL: `https://YOUR-APP.up.railway.app`
5. Текст кнопки: "Открыть приложение"

---

## ✅ Готово!

**Общее время: ~15 минут**

Откройте вашего бота в Telegram и нажмите кнопку Menu!

---

## 🐛 Быстрое решение проблем

### Сервис не запускается?
→ Проверьте логи: Railway → Deployments → Последний деплой

### Webhook не работает?
→ URL должен быть HTTPS (Railway автоматически дает HTTPS)
→ Переустановите webhook через API

### База данных не подключается?
→ Проверьте что PostgreSQL Active (зеленый статус)
→ `DATABASE_URL` должна быть в Variables

### Изменения не применяются?
→ Сделайте `git push`
→ Railway автоматически начнет новый деплой

---

## 🔄 Обновление приложения

```bash
# В Replit Shell или Git панели
git add .
git commit -m "Update: описание изменений"
git push
```

Railway автоматически задеплоит изменения!

---

## 📚 Нужна помощь?

Смотрите полное руководство: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
