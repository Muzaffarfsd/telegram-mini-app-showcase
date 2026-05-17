/**
 * Script to send and pin a message with Web App button in Telegram channel
 * Usage: tsx scripts/pin-telegram-button.ts <channel_username>
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = 'https://w4tg.up.railway.app';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

const channelUsername = process.argv[2];
if (!channelUsername) {
  console.error('❌ Please provide channel username as argument');
  console.log('Usage: tsx scripts/pin-telegram-button.ts @your_channel');
  process.exit(1);
}

async function sendAndPinMessage() {
  try {
    console.log('📤 Sending message with Web App button...');
    
    // Send message with inline keyboard containing Web App button
    const sendResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelUsername,
        text: '🚀 *Telegram Mini App Portfolio*\n\n18 полнофункциональных демо бизнес-приложений с ИИ-агентами:\n\n• 👔 Магазины одежды\n• 🍽 Рестораны и кафе\n• 💪 Фитнес-центры\n• 💇 Салоны красоты\n• 🏪 E-commerce\n• И многое другое!\n\n👇 *Нажмите кнопку ниже* для запуска Mini App',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '💎 Открыть приложение',
              url: 'https://t.me/w4tg_bot/w4tg'
            }
          ]]
        }
      })
    });

    const sendData = await sendResponse.json();
    
    if (!sendData.ok) {
      console.error('❌ Failed to send message:', sendData.description);
      console.log('\n💡 Убедитесь что:');
      console.log('1. Бот добавлен как администратор канала');
      console.log('2. У бота есть права "Отправка сообщений"');
      console.log('3. Username канала указан правильно (с @ или ID)');
      process.exit(1);
    }

    const messageId = sendData.result.message_id;
    console.log('✅ Message sent! Message ID:', messageId);

    // Pin the message
    console.log('📌 Pinning message...');
    const pinResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/pinChatMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelUsername,
        message_id: messageId,
        disable_notification: false
      })
    });

    const pinData = await pinResponse.json();
    
    if (!pinData.ok) {
      console.error('❌ Failed to pin message:', pinData.description);
      console.log('\n💡 Убедитесь что у бота есть права "Закрепление сообщений"');
      process.exit(1);
    }

    console.log('✅ Message pinned successfully!');
    console.log('\n🎉 Готово! Кнопка приложения закреплена в канале!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

sendAndPinMessage();
