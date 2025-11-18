import { useCallback } from 'react';
import { haptic } from '@/lib/telegram';

export function useHaptic() {
  const light = useCallback(() => {
    haptic.light();
  }, []);
  
  const medium = useCallback(() => {
    haptic.medium();
  }, []);
  
  const heavy = useCallback(() => {
    haptic.heavy();
  }, []);
  
  const success = useCallback(() => {
    haptic.success();
  }, []);
  
  const error = useCallback(() => {
    haptic.error();
  }, []);
  
  const warning = useCallback(() => {
    haptic.warning();
  }, []);
  
  const selection = useCallback(() => {
    haptic.selection();
  }, []);
  
  return {
    light,
    medium,
    heavy,
    success,
    error,
    warning,
    selection
  };
}
