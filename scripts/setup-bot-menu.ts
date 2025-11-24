/**
 * Setup bot menu button to open Web App
 * This makes the app accessible from the bot's menu
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = 'https://w4tg.up.railway.app';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

async function setupMenuButton() {
  try {
    console.log('🔧 Setting up bot menu button...');
    
    // Set menu button to open Web App
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Открыть приложение',
          web_app: { url: APP_URL }
        }
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('❌ Failed to set menu button:', data.description);
      process.exit(1);
    }

    console.log('✅ Menu button set successfully!');
    console.log('\n🎉 Готово! Теперь бот открывает приложение через Mini App!');
    console.log('\n📱 Как проверить:');
    console.log('1. Откройте бота в Telegram');
    console.log('2. Нажмите кнопку "Меню" (внизу слева)');
    console.log('3. Выберите "Открыть приложение"');
    console.log('4. Приложение откроется как Telegram Mini App (не как сайт!)');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupMenuButton();
