import { LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { navigate } from '../hooks/useRouting';
import './DemoHomeButton.css';

/** Returns to the WEB4TG showcase, not the current demo's home screen. */
export function DemoHomeButton({ color }: { color?: string }) {
  const { language } = useLanguage();
  const label = language === 'ru' ? 'Вернуться в WEB4TG' : 'Back to WEB4TG';

  return (
    <button
      type="button"
      className="demo-home-button"
      aria-label={label}
      title={label}
      data-testid="demo-return-web4tg"
      onClick={() => navigate('/')}
      style={color ? { color } : undefined}
    >
      <LogOut size={19} strokeWidth={1.8} aria-hidden="true" />
      <span aria-hidden="true">WEB4TG</span>
    </button>
  );
}
