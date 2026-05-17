/**
 * Post WOW message for entrepreneurs - Apple style
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = 'https://w4tg.up.railway.app';
const channelUsername = '@web4_tg';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found');
  process.exit(1);
}

async function postWowMessage() {
  try {
    // Delete message 8
    console.log('🗑️ Deleting old message...');
    
    const deleteResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelUsername,
        message_id: 8
      })
    });
    
    const deleteData = await deleteResponse.json();
    if (deleteData.ok) {
      console.log('✅ Deleted message 8');
    }

    // Send WOW message
    console.log('\n📤 Sending WOW message...');
    
    const sendResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelUsername,
        text: '*ИИ заменит 5 сотрудников.*\n*Работает 24/7.*\n*Окупается за неделю.*\n\n11 готовых решений для вашего бизнеса.',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '📱 Открыть приложение',
              url: APP_URL
            }
          ]]
        }
      })
    });

    const sendData = await sendResponse.json();
    
    if (!sendData.ok) {
      console.error('❌ Failed to send message:', sendData.description);
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
      process.exit(1);
    }

    console.log('✅ Message pinned successfully!');
    console.log('\n🎉 Готово! WOW-пост для предпринимателей создан!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

postWowMessage();
