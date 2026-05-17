import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface NotificationButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface SendNotificationParams {
  chatId: number;
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

interface BroadcastNotificationParams {
  userIds: number[];
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

interface InteractiveNotificationParams {
  chatId: number;
  message: string;
  buttons?: NotificationButton[][];
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

interface SendNotificationResponse {
  success: boolean;
  messageId?: number;
}

interface BroadcastNotificationResponse {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
}

export function useSendNotification() {
  return useMutation({
    mutationFn: async (params: SendNotificationParams): Promise<SendNotificationResponse> => {
      const response = await apiRequest('POST', '/api/notifications/send', params);
      return response.json();
    },
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: async (params: BroadcastNotificationParams): Promise<BroadcastNotificationResponse> => {
      const response = await apiRequest('POST', '/api/notifications/broadcast', params);
      return response.json();
    },
  });
}

export function useInteractiveNotification() {
  return useMutation({
    mutationFn: async (params: InteractiveNotificationParams): Promise<SendNotificationResponse> => {
      const response = await apiRequest('POST', '/api/notifications/interactive', params);
      return response.json();
    },
  });
}

export function useTelegramNotifications() {
  const sendMutation = useSendNotification();
  const broadcastMutation = useBroadcastNotification();
  const interactiveMutation = useInteractiveNotification();

  const sendToUser = async (chatId: number, message: string, parseMode?: 'HTML' | 'Markdown') => {
    return sendMutation.mutateAsync({ chatId, message, parseMode });
  };

  const broadcast = async (userIds: number[], message: string, parseMode?: 'HTML' | 'Markdown') => {
    return broadcastMutation.mutateAsync({ userIds, message, parseMode });
  };

  const sendWithButtons = async (
    chatId: number,
    message: string,
    buttons: NotificationButton[][],
    parseMode?: 'HTML' | 'Markdown'
  ) => {
    return interactiveMutation.mutateAsync({ chatId, message, buttons, parseMode });
  };

  const sendOrderUpdate = async (chatId: number, orderId: string, status: string) => {
    const statusMessages: Record<string, string> = {
      pending: 'Ваш заказ принят в обработку',
      confirmed: 'Ваш заказ подтверждён',
      preparing: 'Ваш заказ готовится',
      ready: 'Ваш заказ готов к выдаче',
      delivering: 'Ваш заказ в пути',
      delivered: 'Ваш заказ доставлен',
      cancelled: 'Ваш заказ отменён',
    };

    const message = `<b>Заказ #${orderId}</b>\n\n${statusMessages[status] || status}`;
    return sendMutation.mutateAsync({ chatId, message, parseMode: 'HTML' });
  };

  const sendPromotion = async (chatId: number, title: string, description: string, url?: string) => {
    const message = `<b>${title}</b>\n\n${description}`;
    
    if (url) {
      return interactiveMutation.mutateAsync({
        chatId,
        message,
        parseMode: 'HTML',
        buttons: [[{ text: 'Подробнее', url }]],
      });
    }
    
    return sendMutation.mutateAsync({ chatId, message, parseMode: 'HTML' });
  };

  const sendAchievement = async (chatId: number, achievement: string, xpEarned: number) => {
    const message = `🏆 <b>Достижение разблокировано!</b>\n\n${achievement}\n\n+${xpEarned} XP`;
    return sendMutation.mutateAsync({ chatId, message, parseMode: 'HTML' });
  };

  const sendReferralBonus = async (chatId: number, referredName: string, bonus: number) => {
    const message = `<b>Реферальный бонус!</b>\n\n${referredName} присоединился по вашей ссылке.\n\n+${bonus} монет`;
    return sendMutation.mutateAsync({ chatId, message, parseMode: 'HTML' });
  };

  return {
    sendToUser,
    broadcast,
    sendWithButtons,
    sendOrderUpdate,
    sendPromotion,
    sendAchievement,
    sendReferralBonus,
    isSending: sendMutation.isPending || interactiveMutation.isPending,
    isBroadcasting: broadcastMutation.isPending,
    error: sendMutation.error || broadcastMutation.error || interactiveMutation.error,
  };
}
