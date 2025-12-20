import { NotificationTest } from '@/components/NotificationTest';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Тест уведомлений</h1>
        </div>
        
        <NotificationTest />
        
        <p className="text-sm text-muted-foreground text-center mt-6">
          Эта страница демонстрирует отправку push-уведомлений через Telegram Bot API
        </p>
      </div>
    </div>
  );
}
