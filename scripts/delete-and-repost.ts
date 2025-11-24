/**
 * Delete old messages and post new one with Apple-style description
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = 'https://w4tg.up.railway.app';
const channelUsername = '@web4_tg';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found');
  process.exit(1);
}

async function deleteAndRepost() {
  try {
    // Delete old messages (ID 4 and 6)
    console.log('🗑️ Deleting old messages...');
    
    for (const messageId of [4, 6]) {
      const deleteResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelUsername,
          message_id: messageId
        })
      });
      
      const deleteData = await deleteResponse.json();
      if (deleteData.ok) {
        console.log(`✅ Deleted message ${messageId}`);
      } else {
        console.log(`⚠️ Could not delete message ${messageId}: ${deleteData.description}`);
      }
    }

    // Send new message with Apple-style description
    console.log('\n📤 Sending new message...');
    
    const sendResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelUsername,
        text: '*Будущее бизнеса.*\n*Сегодня.*\n\n18 умных решений с ИИ.',
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
    console.log('\n🎉 Готово! Apple-style пост создан и закреплен!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAndRepost();
