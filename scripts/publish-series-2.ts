import fs from 'fs';
import path from 'path';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = '@web4_tg';

interface Post {
  id: number;
  image: string;
  text: string;
  style: string;
}

async function sendPhoto(imagePath: string): Promise<any> {
  const formData = new FormData();
  
  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  const blob = new Blob([imageBuffer]);
  
  formData.append('chat_id', CHANNEL_ID);
  formData.append('photo', blob, path.basename(imagePath));

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send photo: ${error}`);
  }

  return response.json();
}

async function sendMessage(text: string): Promise<any> {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send message: ${error}`);
  }

  return response.json();
}

async function publishAllPosts() {
  const postsData = fs.readFileSync('scripts/telegram-posts-series-2.json', 'utf-8');
  const posts: Post[] = JSON.parse(postsData);

  console.log(`🚀 Starting to publish ${posts.length} posts (Series 2)...\n`);
  console.log(`⏱️  Posts will be spaced 5 seconds apart to avoid spam limits\n\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    
    try {
      console.log(`📤 Publishing post #${post.id}...`);
      console.log(`Style: ${post.style}`);
      
      // First send the photo
      const photoResult = await sendPhoto(post.image);
      
      if (photoResult.ok) {
        console.log(`📸 Photo sent successfully!`);
        
        // Then send the text as a separate message
        const textResult = await sendMessage(post.text);
        
        if (textResult.ok) {
          successCount++;
          console.log(`✅ Post #${post.id} published successfully!`);
          console.log(`Photo ID: ${photoResult.result.message_id}, Text ID: ${textResult.result.message_id}`);
        } else {
          failCount++;
          console.log(`❌ Text failed for post #${post.id}: ${textResult.description}`);
        }
      } else {
        failCount++;
        console.log(`❌ Photo failed for post #${post.id}: ${photoResult.description}`);
      }
      
      // Wait 5 seconds between posts (except for the last one)
      if (i < posts.length - 1) {
        console.log(`⏳ Waiting 5000ms before posting...\n`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      failCount++;
      console.error(`❌ Error publishing post #${post.id}:`, error);
    }
  }

  console.log(`\n\n📊 Publishing Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📝 Total: ${posts.length}`);
  
  if (successCount === posts.length) {
    console.log(`\n🎉 All posts published successfully!`);
  }
}

publishAllPosts().catch(console.error);
