import { memo } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shareMessage, isShareMessageSupported, haptic } from '@/lib/telegram';

interface ShareButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const ShareButton = memo(function ShareButton({
  text,
  className,
  variant = 'outline',
  size = 'icon',
  children
}: ShareButtonProps) {
  const isSupported = isShareMessageSupported();
  
  const handleShare = async () => {
    haptic.light();
    const success = await shareMessage({ text });
    if (success) {
      haptic.success();
    }
  };
  
  if (!isSupported) return null;
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleShare}
      data-testid="button-share"
    >
      {children || <Share2 className="w-4 h-4" />}
    </Button>
  );
});
