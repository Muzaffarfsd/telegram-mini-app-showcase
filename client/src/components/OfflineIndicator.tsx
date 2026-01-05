import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useOnlineStatus, useOfflineSync } from '@/hooks/useOfflineData';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { pendingSyncCount, isSyncing, lastSyncTime, syncNow } = useOfflineSync();
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (wasOffline) {
      setShowBanner(true);
      const timer = setTimeout(() => {
        if (pendingSyncCount === 0) {
          setShowBanner(false);
          setWasOffline(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, pendingSyncCount]);

  useEffect(() => {
    if (lastSyncTime && pendingSyncCount === 0) {
      setShowSyncSuccess(true);
      const timer = setTimeout(() => {
        setShowSyncSuccess(false);
        setShowBanner(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncTime, pendingSyncCount]);

  const handleSync = async () => {
    if (isOnline && pendingSyncCount > 0 && !isSyncing) {
      await syncNow();
    }
  };

  const getBannerContent = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'You are offline',
        subtext: 'Changes will sync when connected',
        color: 'from-amber-500/90 to-orange-500/90',
        iconColor: 'text-white'
      };
    }

    if (showSyncSuccess) {
      return {
        icon: Check,
        text: 'All synced!',
        subtext: 'Your data is up to date',
        color: 'from-emerald-500/90 to-green-500/90',
        iconColor: 'text-white'
      };
    }

    if (isSyncing) {
      return {
        icon: RefreshCw,
        text: 'Syncing...',
        subtext: `${pendingSyncCount} pending`,
        color: 'from-blue-500/90 to-indigo-500/90',
        iconColor: 'text-white animate-spin'
      };
    }

    if (pendingSyncCount > 0) {
      return {
        icon: AlertCircle,
        text: 'Back online',
        subtext: `${pendingSyncCount} changes to sync`,
        color: 'from-blue-500/90 to-indigo-500/90',
        iconColor: 'text-white'
      };
    }

    return null;
  };

  const content = getBannerContent();

  if (!showBanner || !content) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] safe-area-inset-top animate-in slide-in-from-top duration-300"
      data-testid="offline-indicator"
    >
      <div 
        className={`mx-4 mt-2 rounded-2xl bg-gradient-to-r ${content.color} backdrop-blur-md shadow-lg`}
        onClick={handleSync}
        role={pendingSyncCount > 0 && isOnline ? 'button' : undefined}
        style={{ cursor: pendingSyncCount > 0 && isOnline ? 'pointer' : 'default' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-shrink-0">
            <content.icon className={`w-5 h-5 ${content.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" data-testid="offline-status-text">
              {content.text}
            </p>
            {content.subtext && (
              <p className="text-xs text-white/80 truncate" data-testid="offline-subtext">
                {content.subtext}
              </p>
            )}
          </div>
          {pendingSyncCount > 0 && isOnline && !isSyncing && (
            <button
              className="flex-shrink-0 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleSync();
              }}
              data-testid="sync-button"
            >
              Sync now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function OfflineBadge() {
  const isOnline = useOnlineStatus();
  const { pendingSyncCount } = useOfflineSync();

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium animate-in zoom-in duration-200"
      style={{
        background: isOnline ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
        color: isOnline ? 'rgb(59, 130, 246)' : 'rgb(245, 158, 11)'
      }}
      data-testid="offline-badge"
    >
      {isOnline ? (
        <>
          <RefreshCw className="w-3 h-3" />
          <span>{pendingSyncCount} pending</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
