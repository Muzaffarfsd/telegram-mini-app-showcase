import { useState, useCallback } from "react";
import { navigate } from "./useRouting";
import { trackDemoView } from "./useGamification";

export function useAppNavigation(hapticFeedback: { light: () => void; medium: () => void }) {
  const [orderData, setOrderData] = useState<any>(null);

  const handleNavigate = useCallback((section: string, data?: any) => {
    if (data) {
      setOrderData(data);
    } else if (section !== 'checkout') {
      setOrderData(null);
    }
    navigate(`/${section}`);
    queueMicrotask(() => hapticFeedback.light());
  }, [hapticFeedback]);

  const handleOpenDemo = useCallback((demoId: string) => {
    navigate(`/demos/${demoId}/app`);
    queueMicrotask(() => hapticFeedback.medium());
    trackDemoView();
  }, [hapticFeedback]);

  const handleCloseDemo = useCallback(() => {
    navigate('/');
    queueMicrotask(() => hapticFeedback.light());
  }, [hapticFeedback]);

  const handleCheckoutBack = useCallback(() => {
    setOrderData(null);
    navigate('/constructor');
    queueMicrotask(() => hapticFeedback.light());
  }, [hapticFeedback]);

  const handlePaymentSuccess = useCallback(() => {
    setOrderData(null);
    navigate('/profile');
    queueMicrotask(() => hapticFeedback.medium());
  }, [hapticFeedback]);

  return {
    orderData,
    handleNavigate,
    handleOpenDemo,
    handleCloseDemo,
    handleCheckoutBack,
    handlePaymentSuccess,
  };
}
