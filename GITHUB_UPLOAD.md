# 📤 Как загрузить код в GitHub

Репозиторий уже создан: https://github.com/Muzaffarfsd/telegram-mini-app-showcase

## Метод 1: Через Replit UI

1. В Replit найдите **Tools** → **Version Control** в верхнем меню
2. Или найдите иконку Git в левой панели
3. Нажмите "Connect to GitHub" и выберите репозиторий `telegram-mini-app-showcase`
4. Нажмите "Commit & Push"

## Метод 2: Через Shell (если UI недоступен)

Откройте **Shell** в Replit и выполните эти команды по очереди:

```bash
# 1. Инициализация (если нужно)
git init
git config user.email "your@email.com"
git config user.name "Your Name"

# 2. Подключение к GitHub
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Muzaffarfsd/telegram-mini-app-showcase.git

# 3. Подготовка файлов
git add .

# 4. Создание коммита
git commit -m "Initial commit - Telegram Mini App ready for Railway"

# 5. Загрузка на GitHub
git branch -M main
git push -u origin main
```

При запросе логина/пароля используйте:
- **Username:** Muzaffarfsd
- **Password:** ваш GitHub токен (ghp_...)

---

## После загрузки → Деплой на Railway

1. Откройте https://railway.app
2. Login через GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Выберите `telegram-mini-app-showcase`
5. Railway автоматически начнёт деплой!

Готово! 🚀
