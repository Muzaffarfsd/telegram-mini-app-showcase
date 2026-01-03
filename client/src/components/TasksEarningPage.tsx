import { useTelegram } from '@/hooks/useTelegram';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';

interface TasksEarningPageProps {
  onNavigate: (section: string) => void;
}

export function TasksEarningPage({ onNavigate }: TasksEarningPageProps) {
  const { t } = useLanguage();
  const { hapticFeedback } = useTelegram();
  const { isDark } = useTheme();

  const handleInviteFriends = () => {
    hapticFeedback.light();
    onNavigate('referral');
  };

  const colors = {
    background: isDark ? '#09090B' : '#FFFFFF',
    textPrimary: isDark ? '#FAFAFA' : '#000000',
    textSecondary: isDark ? '#71717A' : '#6B7280',
    textMuted: isDark ? '#52525B' : '#9CA3AF',
    cardBg: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    accent: '#8B5CF6',
  };

  return (
    <div 
      className="min-h-screen"
      style={{ background: colors.background }}
    >
      <div className="max-w-md mx-auto px-6 py-12 pb-32">
        
        <p 
          style={{ 
            fontSize: '10px', 
            fontWeight: 600, 
            letterSpacing: '0.15em', 
            color: colors.textMuted,
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}
        >
          {t('earningPage.sectionTitle')}
        </p>

        <h1 
          style={{ 
            fontSize: '32px', 
            fontWeight: 700, 
            lineHeight: 1.2,
            color: colors.textPrimary,
            marginBottom: '20px'
          }}
        >
          {t('earningPage.heroLine1')}{' '}
          <span style={{ color: colors.accent }}>{t('earningPage.heroHighlight')}</span>{' '}
          {t('earningPage.heroLine2')}
        </h1>

        <p 
          style={{ 
            fontSize: '15px', 
            lineHeight: 1.6,
            color: colors.textSecondary,
            marginBottom: '48px'
          }}
        >
          {t('earningPage.description')}
        </p>

        <p 
          style={{ 
            fontSize: '10px', 
            fontWeight: 600, 
            letterSpacing: '0.15em', 
            color: colors.textMuted,
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}
        >
          {t('earningPage.howItWorksTitle')}
        </p>

        <div
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <p 
            style={{ 
              fontSize: '15px', 
              lineHeight: 1.7,
              color: colors.textSecondary,
              fontStyle: 'italic'
            }}
          >
            {t('earningPage.howItWorksQuote')}
          </p>
        </div>

      </div>

      <div 
        style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: '380px',
          zIndex: 50
        }}
      >
        <button
          onClick={handleInviteFriends}
          data-testid="button-invite-friends"
          style={{
            width: '100%',
            padding: '18px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.4)',
          }}
        >
          {t('earningPage.inviteButton')}
        </button>
      </div>
    </div>
  );
}

export default TasksEarningPage;
