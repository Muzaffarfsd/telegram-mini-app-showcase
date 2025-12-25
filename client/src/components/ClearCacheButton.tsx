import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { clearAllCaches } from '@/utils/cacheBuster';

export function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAllCaches();
      // Show success message
      alert('Cache cleared successfully! Page will reload with fresh content.');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      onClick={handleClearCache}
      disabled={isClearing}
      variant="outline"
      size="sm"
      data-testid="button-clear-cache"
      className="gap-2"
    >
      <RotateCcw className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
      {isClearing ? 'Clearing...' : 'Clear Cache'}
    </Button>
  );
}
