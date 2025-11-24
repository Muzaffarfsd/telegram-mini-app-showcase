import { memo } from 'react';
import { CircleUser } from 'lucide-react';

interface UserAvatarProps {
  photoUrl?: string;
  firstName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar = memo<UserAvatarProps>(({ photoUrl, firstName, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // If we have a photo URL, show the image
  if (photoUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white/30 ${className}`}>
        <img 
          src={photoUrl} 
          alt={firstName || 'User'} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // If we have a first name, show initials
  if (firstName) {
    const initial = firstName.charAt(0).toUpperCase();
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white ${className}`}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {initial}
      </div>
    );
  }

  // Fallback to icon
  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}>
      <CircleUser className={`${iconSizes[size]} text-white/70`} strokeWidth={2} />
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
