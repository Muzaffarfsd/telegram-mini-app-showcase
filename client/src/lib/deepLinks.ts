type Platform = 'ios' | 'android' | 'unknown';

class DeepLinker {
  private platform: Platform;

  constructor() {
    this.platform = this.detectPlatform();
  }

  private detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (/ipad|iphone|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'unknown';
  }

  openInstagram(username: string, postId?: string) {
    let deepLink: string;
    let webUrl: string;
    
    if (postId) {
      webUrl = `https://instagram.com/p/${postId}`;
      deepLink = this.platform === 'android' 
        ? `intent://instagram.com/p/${postId}#Intent;package=com.instagram.android;scheme=https;end`
        : `instagram://media?id=${postId}`;
    } else {
      webUrl = `https://instagram.com/${username}`;
      deepLink = this.platform === 'android'
        ? `intent://instagram.com/${username}/#Intent;package=com.instagram.android;scheme=https;end`
        : `instagram://user?username=${username}`;
    }
    
    this.attemptOpen(deepLink, webUrl, 'Instagram');
  }

  openTikTok(username: string, videoId?: string) {
    let deepLink: string;
    let webUrl: string;
    
    if (videoId) {
      webUrl = `https://tiktok.com/@${username}/video/${videoId}`;
      deepLink = this.platform === 'android'
        ? `intent://www.tiktok.com/@${username}/video/${videoId}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`
        : `tiktok://video/${videoId}`;
    } else {
      webUrl = `https://tiktok.com/@${username}`;
      deepLink = this.platform === 'android'
        ? `intent://www.tiktok.com/@${username}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`
        : `tiktok://user/@${username}`;
    }
    
    this.attemptOpen(deepLink, webUrl, 'TikTok');
  }

  openYouTube(videoId: string) {
    const webUrl = `https://youtube.com/watch?v=${videoId}`;
    const deepLink = this.platform === 'android'
      ? `intent://youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end`
      : `youtube://watch?v=${videoId}`;
    
    this.attemptOpen(deepLink, webUrl, 'YouTube');
  }

  openYouTubeChannel(channelId: string) {
    const webUrl = `https://youtube.com/channel/${channelId}`;
    const deepLink = this.platform === 'android'
      ? `intent://youtube.com/channel/${channelId}#Intent;package=com.google.android.youtube;scheme=https;end`
      : `youtube://channel/${channelId}`;
    
    this.attemptOpen(deepLink, webUrl, 'YouTube');
  }

  openTelegramChannel(username: string) {
    const webUrl = `https://t.me/${username}`;
    const deepLink = `tg://resolve?domain=${username}`;
    const isInTelegramWebView = window.Telegram?.WebApp;
    
    window.location.href = deepLink;
    
    setTimeout(() => {
      if (!document.hidden) {
        if (isInTelegramWebView) {
          window.Telegram.WebApp.openLink(webUrl);
        } else {
          window.location.href = webUrl;
        }
      }
    }, 1500);
  }

  private attemptOpen(deepLink: string, webUrl: string, appName: string) {
    const isInTelegramWebView = window.Telegram?.WebApp;
    
    if (this.platform === 'android' || this.platform === 'ios') {
      if (this.platform === 'ios') {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = deepLink;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          if (!document.hidden) {
            if (isInTelegramWebView) {
              window.Telegram.WebApp.openLink(webUrl);
            } else {
              window.open(webUrl, '_blank');
            }
          }
        }, 1500);
      } else {
        window.location.href = deepLink;
        setTimeout(() => {
          if (!document.hidden && isInTelegramWebView) {
            window.Telegram.WebApp.openLink(webUrl);
          }
        }, 1500);
      }
    } else {
      if (isInTelegramWebView) {
        window.Telegram.WebApp.openLink(webUrl);
      } else {
        window.open(webUrl, '_blank');
      }
    }
  }

  shareViaMessenger(text: string, url?: string) {
    if (window.Telegram?.WebApp) {
      const shareUrl = url || window.location.href;
      
      window.location.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    }
  }
}

export const deepLinker = new DeepLinker();
