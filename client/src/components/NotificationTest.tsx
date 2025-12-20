import { useState } from 'react';
import { Bell, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import WebApp from '@twa-dev/sdk';

export function NotificationTest() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const telegramUser = WebApp.initDataUnsafe?.user;
  const initData = WebApp.initData;

  const sendTestNotification = async () => {
    if (!telegramUser?.id) {
      toast({
        title: 'Ошибка',
        description: 'Откройте приложение через Telegram',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Telegram-Init-Data': initData || '',
        },
        body: JSON.stringify({
          chatId: telegramUser.id,
          message: `<b>Тестовое уведомление</b>\n\nПривет, ${telegramUser.first_name || 'друг'}! Это тестовое push-уведомление от WEB4TG.\n\nВремя: ${new Date().toLocaleTimeString('ru-RU')}`,
          parseMode: 'HTML',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult('success');
        toast({
          title: 'Отправлено!',
          description: 'Проверьте Telegram - вам пришло сообщение',
        });
      } else {
        setResult('error');
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setResult('error');
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendInteractiveNotification = async () => {
    if (!telegramUser?.id) {
      toast({
        title: 'Ошибка',
        description: 'Откройте приложение через Telegram',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();

      const response = await fetch('/api/notifications/interactive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Telegram-Init-Data': initData || '',
        },
        body: JSON.stringify({
          chatId: telegramUser.id,
          message: `<b>Новое предложение!</b>\n\nСпециально для вас скидка 20% на все услуги.\n\nДействует до конца дня.`,
          parseMode: 'HTML',
          buttons: [
            [
              { text: 'Открыть каталог', url: 'https://t.me/web4tgs' },
              { text: 'Подробнее', callback_data: 'details' }
            ]
          ],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult('success');
        toast({
          title: 'Отправлено!',
          description: 'Уведомление с кнопками отправлено в Telegram',
        });
      } else {
        setResult('error');
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setResult('error');
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="card-notification-test">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push-уведомления
        </CardTitle>
        <CardDescription>
          Отправьте себе тестовое уведомление в Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {telegramUser ? (
          <>
            <p className="text-sm text-muted-foreground">
              Telegram ID: <span className="font-mono">{telegramUser.id}</span>
            </p>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={sendTestNotification}
                disabled={isSending}
                className="w-full"
                data-testid="button-send-notification"
              >
                {isSending ? (
                  'Отправка...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Простое уведомление
                  </>
                )}
              </Button>

              <Button
                onClick={sendInteractiveNotification}
                disabled={isSending}
                variant="outline"
                className="w-full"
                data-testid="button-send-interactive"
              >
                {isSending ? (
                  'Отправка...'
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    С кнопками
                  </>
                )}
              </Button>
            </div>

            {result === 'success' && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Уведомление отправлено!</span>
              </div>
            )}

            {result === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Ошибка отправки</span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Откройте это приложение через Telegram чтобы протестировать уведомления
          </p>
        )}
      </CardContent>
    </Card>
  );
}
