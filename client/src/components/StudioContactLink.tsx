import type { MouseEvent } from 'react';
import telegramLogo from '../assets/telegram-logo.svg';

const contactUrl = 'https://t.me/web4tgs';

function openContact(event: MouseEvent<HTMLAnchorElement>) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const app = window.Telegram?.WebApp;
  if (!app?.openTelegramLink) return;
  try {
    app.openTelegramLink(contactUrl);
    event.preventDefault();
  } catch { /* The link also works in browsers and older Telegram clients. */ }
}

export function StudioContactLink({ ru }: { ru: boolean }) {
  return <a className="studio-contact" href={contactUrl} target="_blank" rel="noopener noreferrer" onClick={openContact}>
    <img src={telegramLogo} width={22} height={22} alt="" draggable={false} />
    {ru ? 'Написать в Telegram' : 'Message us on Telegram'}
  </a>;
}
