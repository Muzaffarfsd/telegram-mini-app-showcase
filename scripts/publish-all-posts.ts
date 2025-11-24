/**
 * Publish 10 unique posts to Telegram channel
 * Run: tsx scripts/publish-all-posts.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const channelUsername = '@web4_tg';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found');
  process.exit(1);
}

// Load posts plan
const postsData = JSON.parse(fs.readFileSync('scripts/telegram-posts-plan.json', 'utf-8'));

async function uploadPhoto(imagePath: string): Promise<string> {
  const formData = new FormData();
  
  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  const blob = new Blob([imageBuffer], { type: 'image/png' });
  
  formData.append('chat_id', channelUsername);
  formData.append('photo', blob, path.basename(imagePath));
  
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Failed to upload photo: ${data.description}`);
  }
  
  // Get file_id from response
  return data.result.photo[data.result.photo.length - 1].file_id;
}

async function publishPost(post: any, delay: number = 0) {
  // Wait delay before posting (to space out posts)
  if (delay > 0) {
    console.log(`⏳ Waiting ${delay}ms before posting...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  try {
    console.log(`\n📤 Publishing post #${post.id}...`);
    console.log(`Style: ${post.style}`);
    
    // Send photo with caption
    const formData = new FormData();
    
    // Read image file
    const imageBuffer = fs.readFileSync(post.image);
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    
    formData.append('chat_id', channelUsername);
    formData.append('photo', blob, path.basename(post.image));
    formData.append('caption', post.text);
    formData.append('parse_mode', 'Markdown');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error(`❌ Failed to publish post #${post.id}: ${data.description}`);
      return false;
    }
    
    console.log(`✅ Post #${post.id} published successfully!`);
    console.log(`Message ID: ${data.result.message_id}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error publishing post #${post.id}:`, error);
    return false;
  }
}

async function publishAllPosts() {
  console.log('🚀 Starting to publish 10 posts...\n');
  console.log('⏱️  Posts will be spaced 5 seconds apart to avoid spam limits\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < postsData.length; i++) {
    const post = postsData[i];
    const delay = i === 0 ? 0 : 5000; // 5 seconds delay between posts
    
    const success = await publishPost(post, delay);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n\n📊 Publishing Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📝 Total: ${postsData.length}`);
  
  if (successCount === postsData.length) {
    console.log('\n🎉 All posts published successfully!');
  } else {
    console.log('\n⚠️  Some posts failed to publish. Check errors above.');
  }
}

// Run
publishAllPosts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
