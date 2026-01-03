import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      data-testid="button-language-toggle"
      className="relative font-semibold text-xs"
      title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
    >
      <span className="uppercase tracking-wide">
        {language === 'ru' ? 'EN' : 'RU'}
      </span>
    </Button>
  );
}
