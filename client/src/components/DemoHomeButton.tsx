import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { navigate } from '../hooks/useRouting';
import { BrandMark } from './BrandMark';
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
      <span className="demo-home-button__mark" data-testid="demo-return-brand" aria-hidden="true">
        <ArrowLeft className="demo-home-button__arrow" size={9} strokeWidth={2} />
        <BrandMark compact />
      </span>
    </button>
  );
}
