import { useEffect, useRef, useCallback } from 'react';

interface ScrollSoundConfig {
  enabled?: boolean;
  volume?: number;
  scrollThreshold?: number;
  cooldownMs?: number;
}

const defaultConfig: ScrollSoundConfig = {
  enabled: true,
  volume: 0.03,
  scrollThreshold: 50,
  cooldownMs: 80,
};

export function useScrollSound(config: ScrollSoundConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastScrollRef = useRef(0);
  const lastSoundTimeRef = useRef(0);
  const isEnabledRef = useRef(settings.enabled);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playScrollTick = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      const baseFreq = intensity === 'light' ? 2800 : intensity === 'medium' ? 2200 : 1800;
      const volume = settings.volume ?? 0.03;
      const baseVolume = intensity === 'light' ? volume * 0.6 : intensity === 'medium' ? volume * 0.8 : volume;
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.015);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4000, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (error) {
      console.debug('[ScrollSound] Audio playback failed:', error);
    }
  }, [initAudioContext, settings.volume]);

  const playBounce = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
      
      const volume = settings.volume ?? 0.03;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
      console.debug('[ScrollSound] Bounce sound failed:', error);
    }
  }, [initAudioContext, settings.volume]);

  useEffect(() => {
    isEnabledRef.current = settings.enabled;
  }, [settings.enabled]);

  useEffect(() => {
    if (!settings.enabled) return;

    const handleScroll = () => {
      const now = Date.now();
      const currentScroll = window.scrollY;
      const scrollDelta = Math.abs(currentScroll - lastScrollRef.current);
      
      if (now - lastSoundTimeRef.current < (settings.cooldownMs ?? 80)) {
        lastScrollRef.current = currentScroll;
        return;
      }

      if (scrollDelta >= (settings.scrollThreshold ?? 50)) {
        const intensity = scrollDelta > 150 ? 'heavy' : scrollDelta > 80 ? 'medium' : 'light';
        playScrollTick(intensity);
        lastSoundTimeRef.current = now;
        lastScrollRef.current = currentScroll;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScroll <= 0 && lastScrollRef.current > 0) {
        playBounce();
      } else if (currentScroll >= maxScroll && lastScrollRef.current < maxScroll) {
        playBounce();
      }
    };

    const initOnInteraction = () => {
      initAudioContext();
      window.removeEventListener('touchstart', initOnInteraction);
      window.removeEventListener('click', initOnInteraction);
    };

    window.addEventListener('touchstart', initOnInteraction, { passive: true });
    window.addEventListener('click', initOnInteraction, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('touchstart', initOnInteraction);
      window.removeEventListener('click', initOnInteraction);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [settings.enabled, settings.scrollThreshold, settings.cooldownMs, playScrollTick, playBounce, initAudioContext]);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
    localStorage.setItem('scroll-sound-enabled', JSON.stringify(enabled));
  }, []);

  const getEnabled = useCallback(() => {
    const saved = localStorage.getItem('scroll-sound-enabled');
    if (saved !== null) {
      try {
        return JSON.parse(saved) as boolean;
      } catch {
        return true;
      }
    }
    return true;
  }, []);

  return {
    playScrollTick,
    playBounce,
    setEnabled,
    getEnabled,
  };
}
