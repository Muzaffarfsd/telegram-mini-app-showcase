# 🎯 Простая инструкция: От Replit до Railway

## ✅ ШАГ 1: Скачать код из Replit

1. В списке файлов слева найдите файл: **`telegram-miniapp.tar.gz`**
2. Нажмите на него правой кнопкой мыши
3. Выберите **"Download"** (Скачать)
4. Сохраните файл на компьютер

## ✅ ШАГ 2: Распаковать архив

1. Найдите скачанный файл `telegram-miniapp.tar.gz` на вашем компьютере
2. Распакуйте его:
   - **Windows**: Используйте 7-Zip или WinRAR
   - **Mac/Linux**: Двойной клик или команда `tar -xzf telegram-miniapp.tar.gz`
3. Вы получите папку с кодом приложения

## ✅ ШАГ 3: Загрузить в GitHub

1. Откройте https://github.com/Muzaffarfsd/telegram-mini-app-showcase
2. Нажмите кнопку **"uploading an existing file"** или **"Add file" → "Upload files"**
3. **ПЕРЕТАЩИТЕ** все файлы из распакованной папки в окно GitHub
   - ⚠️ Загружайте именно содержимое папки, а не саму папку!
4. Внизу напишите commit message: "Initial commit - Ready for Railway"
5. Нажмите **"Commit changes"** (зеленая кнопка)

⏳ Подождите пока GitHub загрузит файлы (1-2 минуты)

✅ **Код в GitHub! Переходим к Railway**

---

## 🚂 ШАГ 4: Деплой на Railway

### 4.1 Создать проект

1. Откройте https://railway.app
2. Нажмите **"Login"** → войдите через **GitHub**
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Найдите и выберите **`telegram-mini-app-showcase`**
6. Railway начнет автоматический деплой!

### 4.2 Добавить PostgreSQL

1. В проекте нажмите кнопку **"+ New"**
2. Выберите **"Database"**  
3. Выберите **"Add PostgreSQL"**
4. Railway автоматически создаст базу данных

### 4.3 Настроить переменные окружения

1. Кликните на ваш сервис (не на PostgreSQL)
2. Перейдите на вкладку **"Variables"**
3. Добавьте переменные:

```
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
NODE_ENV=production
PORT=5000
```

4. `DATABASE_URL` добавится автоматически из PostgreSQL

### 4.4 Перезапустить деплой

1. Перейдите на вкладку **"Deployments"**
2. Нажмите **"Redeploy"** или дождитесь автоматического деплоя

⏳ Подождите 2-3 минуты пока Railway соберет и запустит приложение

---

## 🎯 ШАГ 5: Получить URL и настроить Telegram

### 5.1 Скопировать Railway URL

1. В Railway кликните на ваш сервис
2. Перейдите на вкладку **"Settings"**
3. Прокрутите до секции **"Networking"** или **"Domains"**
4. Нажмите **"Generate Domain"** если домен еще не создан
5. Скопируйте URL (например: `https://telegram-mini-app-showcase-production.up.railway.app`)

### 5.2 Настроить Telegram Webhook

1. Откройте браузер
2. Вставьте этот URL (замените YOUR_RAILWAY_URL на ваш Railway URL):

```
https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook?url=YOUR_RAILWAY_URL/api/telegram/webhook
```

Пример:
```
https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook?url=https://telegram-mini-app-showcase-production.up.railway.app/api/telegram/webhook
```

3. Нажмите Enter
4. Вы должны увидеть: `{"ok":true,"result":true,...}`

---

## 🎉 ШАГ 6: Настроить Mini App в Telegram

1. Откройте Telegram → найдите **@BotFather**
2. Отправьте команду: `/mybots`
3. Выберите вашего бота
4. Нажмите **"Bot Settings"** → **"Menu Button"**
5. Выберите **"Configure menu button"** или **"Edit Menu Button URL"**
6. Вставьте ваш Railway URL (тот же самый)
7. Установите название кнопки: "Открыть App" или "Launch"

---

## ✅ ГОТОВО!

Теперь откройте вашего бота в Telegram и нажмите кнопку внизу - приложение откроется! 🎊

### Проверка работы:

- ✅ Откройте бота в Telegram
- ✅ Нажмите кнопку "Launch" или "Open App"  
- ✅ Должна открыться витрина с 18 демо-приложениями
- ✅ Геймификация, реферальная программа - все работает!

### Если что-то не работает:

1. Проверьте логи в Railway (**Deployments** → кликните на деплой → **View logs**)
2. Убедитесь что все переменные окружения установлены
3. Проверьте что PostgreSQL подключен
4. Убедитесь что webhook установлен правильно

---

**Время выполнения:** ~10-15 минут
**Сложность:** Легко 
**Стоимость:** Railway предоставляет $5 бесплатных кредитов каждый месяц

🚀 Удачи!
