# 🔧 Исправление для Railway (Node 20 fix)

## Проблема
Railway использовал Node.js 18, а приложение требует Node.js 20+ для работы `import.meta.dirname`.

## ✅ Решение
Создан файл `.nvmrc` который заставит Railway использовать Node 20.

---

## 📤 Что делать сейчас:

### Вариант 1: Загрузить только файл .nvmrc (Быстро - 1 минута)

1. Откройте https://github.com/Muzaffarfsd/telegram-mini-app-showcase
2. Нажмите **"Add file"** → **"Create new file"**
3. В поле "Name your file..." введите: `.nvmrc`
4. В содержимое файла вставьте: `20`
5. Внизу нажмите **"Commit changes"**

✅ Готово! Railway автоматически пересоберет проект с Node 20.

### Вариант 2: Загрузить обновленный архив (если нужны все файлы)

1. Скачайте файл **`telegram-miniapp-fixed.tar.gz`** из Replit
2. Распакуйте его
3. Откройте https://github.com/Muzaffarfsd/telegram-mini-app-showcase  
4. Нажмите **"Add file"** → **"Upload files"**
5. Перетащите ВСЕ файлы (включая .nvmrc)
6. Нажмите **"Commit changes"**

---

## 🚂 Railway автоматически пересоберет проект

После загрузки .nvmrc в GitHub:
1. Откройте https://railway.app
2. Зайдите в ваш проект
3. Railway автоматически обнаружит изменения и начнет новую сборку
4. Подождите 2-3 минуты
5. ✅ Проект успешно соберется с Node 20!

---

## ✅ После успешного деплоя

1. Скопируйте Railway URL (Settings → Domains)
2. Настройте Telegram webhook:
   ```
   https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook?url=YOUR_RAILWAY_URL/api/telegram/webhook
   ```
3. Настройте Menu Button в @BotFather
4. Откройте бота - приложение работает! 🎉

---

**Время:** 1 минута для добавления .nvmrc
**Результат:** Приложение успешно соберется на Railway с Node 20
