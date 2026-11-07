# 🚀 Простой способ загрузить код в GitHub

Репозиторий создан: **https://github.com/Muzaffarfsd/telegram-mini-app-showcase**

## ✅ Самый простой способ (3 клика):

### Шаг 1: Скачайте архив проекта
1. В Replit найдите файл `telegram-miniapp-export.tar.gz` в списке файлов слева
2. Нажмите правой кнопкой → **Download** (Скачать)

### Шаг 2: Распакуйте архив
1. Распакуйте скачанный файл на вашем компьютере

### Шаг 3: Загрузите в GitHub
1. Откройте https://github.com/Muzaffarfsd/telegram-mini-app-showcase
2. Нажмите **"Add file"** → **"Upload files"**
3. Перетащите ВСЕ файлы из распакованной папки
4. Нажмите **"Commit changes"**

Готово! ✅

---

## 🚂 После загрузки → Railway деплой

1. Откройте https://railway.app
2. **Login** через GitHub  
3. **New Project** → **Deploy from GitHub repo**
4. Выберите `telegram-mini-app-showcase`
5. Добавьте PostgreSQL (кнопка **+ New** → **Database** → **PostgreSQL**)
6. Настройте переменные окружения:
   - `TELEGRAM_BOT_TOKEN` = YOUR_TELEGRAM_BOT_TOKEN
   - `DATABASE_URL` = автоматически из PostgreSQL
   - `NODE_ENV` = production
   - `PORT` = 5000

7. Railway автоматически задеплоит приложение!

8. Скопируйте Railway URL (типа `https://ваш-проект.railway.app`)

9. Настройте Telegram webhook:
   ```
   https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook?url=https://ваш-проект.railway.app/api/telegram/webhook
   ```

🎉 Готово! Ваше приложение работает!
