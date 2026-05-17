/**
 * Check if Web App is registered and get its info
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found');
  process.exit(1);
}

async function checkWebAppInfo() {
  try {
    // Get bot info
    const botResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botData = await botResponse.json();
    
    if (!botData.ok) {
      console.error('❌ Failed to get bot info');
      process.exit(1);
    }
    
    const username = botData.result.username;
    console.log('🤖 Бот:', `@${username}`);
    console.log('');
    
    console.log('📝 Чтобы создать прямую ссылку на Mini App:');
    console.log('');
    console.log('1️⃣ Открой @BotFather в Telegram');
    console.log('2️⃣ Отправь команду: /newapp');
    console.log('3️⃣ Выбери своего бота: @' + username);
    console.log('4️⃣ Заполни данные:');
    console.log('   - Title: WEB4TG Portfolio');
    console.log('   - Description: Showcase of 18 business Mini Apps');
    console.log('   - Photo: (загрузи логотип)');
    console.log('   - Demo GIF: (можно пропустить /empty)');
    console.log('   - Web App URL: https://w4tg.up.railway.app');
    console.log('   - Short name: portfolio (можно любое)');
    console.log('');
    console.log('5️⃣ После создания получишь ссылку вида:');
    console.log('   https://t.me/' + username + '/portfolio');
    console.log('');
    console.log('6️⃣ Эту ссылку можно использовать в кнопке!');
    console.log('');
    console.log('💡 Или используй временное решение:');
    console.log('   https://t.me/' + username + '?startapp=open');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkWebAppInfo();
