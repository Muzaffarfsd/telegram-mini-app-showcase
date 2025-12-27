import { useEffect, useRef, useCallback } from 'react';

interface ScrollSoundConfig {
  enabled?: boolean;
  volume?: number;
  scrollThreshold?: number;
  cooldownMs?: number;
}

const defaultConfig: ScrollSoundConfig = {
  enabled: true,
  volume: 0.04,
  scrollThreshold: 40,
  cooldownMs: 60,
};

export function useScrollSound(config: ScrollSoundConfig = {}) {
  const settings = { ...defaultConfig, ...config };
  const audioContextRef = useRef<AudioContext | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const lastScrollRef = useRef(0);
  const lastSoundTimeRef = useRef(0);
  const isEnabledRef = useRef(settings.enabled);
  const scrollDirectionRef = useRef<'up' | 'down'>('down');

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      const compressor = audioContextRef.current.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, audioContextRef.current.currentTime);
      compressor.knee.setValueAtTime(30, audioContextRef.current.currentTime);
      compressor.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
      compressor.attack.setValueAtTime(0.003, audioContextRef.current.currentTime);
      compressor.release.setValueAtTime(0.25, audioContextRef.current.currentTime);
      compressor.connect(audioContextRef.current.destination);
      compressorRef.current = compressor;
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

      const masterGain = ctx.createGain();
      const output = compressorRef.current || ctx.destination;
      masterGain.connect(output);

      const volume = settings.volume ?? 0.04;
      const intensityMultiplier = intensity === 'light' ? 0.5 : intensity === 'medium' ? 0.75 : 1;
      const baseVolume = volume * intensityMultiplier;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const gain3 = ctx.createGain();
      
      const filter1 = ctx.createBiquadFilter();
      const filter2 = ctx.createBiquadFilter();

      osc1.connect(filter1);
      osc2.connect(filter1);
      osc3.connect(filter2);
      filter1.connect(gain1);
      filter2.connect(gain2);
      
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(3500, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(2, ctx.currentTime);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(gain3);

      gain1.connect(masterGain);
      gain2.connect(masterGain);
      gain3.connect(masterGain);

      const baseFreq = intensity === 'light' ? 4200 : intensity === 'medium' ? 3600 : 3000;
      const directionOffset = scrollDirectionRef.current === 'up' ? 200 : 0;
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq + directionOffset, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime((baseFreq + directionOffset) * 0.85, ctx.currentTime + 0.008);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime((baseFreq + directionOffset) * 1.5, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime((baseFreq + directionOffset) * 1.2, ctx.currentTime + 0.006);
      
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);
      osc3.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, ctx.currentTime + 0.012);

      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(8000, ctx.currentTime);
      filter1.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.015);
      filter1.Q.setValueAtTime(1.5, ctx.currentTime);
      
      filter2.type = 'highpass';
      filter2.frequency.setValueAtTime(200, ctx.currentTime);
      filter2.Q.setValueAtTime(0.7, ctx.currentTime);

      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(baseVolume * 0.6, ctx.currentTime + 0.001);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.018);

      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(baseVolume * 0.25, ctx.currentTime + 0.0015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.012);

      gain3.gain.setValueAtTime(0, ctx.currentTime);
      gain3.gain.linearRampToValueAtTime(baseVolume * 0.15, ctx.currentTime + 0.001);
      gain3.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.01);

      masterGain.gain.setValueAtTime(1, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.025);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc3.start(ctx.currentTime);
      noiseSource.start(ctx.currentTime);
      
      osc1.stop(ctx.currentTime + 0.03);
      osc2.stop(ctx.currentTime + 0.02);
      osc3.stop(ctx.currentTime + 0.025);
      noiseSource.stop(ctx.currentTime + 0.015);
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

      const masterGain = ctx.createGain();
      const output = compressorRef.current || ctx.destination;
      masterGain.connect(output);

      const volume = settings.volume ?? 0.04;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain1);
      
      const impactBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const impactData = impactBuffer.getChannelData(0);
      for (let i = 0; i < impactData.length; i++) {
        const t = i / ctx.sampleRate;
        impactData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 60) * 0.3;
      }
      const impactSource = ctx.createBufferSource();
      impactSource.buffer = impactBuffer;
      const impactFilter = ctx.createBiquadFilter();
      impactFilter.type = 'lowpass';
      impactFilter.frequency.setValueAtTime(400, ctx.currentTime);
      impactFilter.Q.setValueAtTime(1, ctx.currentTime);
      impactSource.connect(impactFilter);
      impactFilter.connect(gain2);

      gain1.connect(masterGain);
      gain2.connect(masterGain);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(180, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(120, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      filter.Q.setValueAtTime(2, ctx.currentTime);

      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + 0.005);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + 0.002);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      masterGain.gain.setValueAtTime(1, ctx.currentTime);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      impactSource.start(ctx.currentTime);
      
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);
      impactSource.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.debug('[ScrollSound] Bounce sound failed:', error);
    }
  }, [initAudioContext, settings.volume]);

  const playRubberBand = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      const output = compressorRef.current || ctx.destination;
      masterGain.connect(output);

      const volume = settings.volume ?? 0.04;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.debug('[ScrollSound] RubberBand sound failed:', error);
    }
  }, [initAudioContext, settings.volume]);

  useEffect(() => {
    isEnabledRef.current = settings.enabled;
  }, [settings.enabled]);

  useEffect(() => {
    if (!settings.enabled) return;

    let velocityHistory: number[] = [];
    let lastScrollTime = 0;

    const handleScroll = () => {
      const now = Date.now();
      const currentScroll = window.scrollY;
      const scrollDelta = currentScroll - lastScrollRef.current;
      const absDelta = Math.abs(scrollDelta);
      const timeDelta = now - lastScrollTime;
      
      if (scrollDelta > 0) {
        scrollDirectionRef.current = 'down';
      } else if (scrollDelta < 0) {
        scrollDirectionRef.current = 'up';
      }

      if (timeDelta > 0) {
        const velocity = absDelta / timeDelta;
        velocityHistory.push(velocity);
        if (velocityHistory.length > 5) velocityHistory.shift();
      }
      lastScrollTime = now;
      
      if (now - lastSoundTimeRef.current < (settings.cooldownMs ?? 60)) {
        lastScrollRef.current = currentScroll;
        return;
      }

      if (absDelta >= (settings.scrollThreshold ?? 40)) {
        const avgVelocity = velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;
        const intensity = avgVelocity > 3 ? 'heavy' : avgVelocity > 1.5 ? 'medium' : 'light';
        playScrollTick(intensity);
        lastSoundTimeRef.current = now;
        lastScrollRef.current = currentScroll;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScroll <= 0 && lastScrollRef.current > 5) {
        playBounce();
        velocityHistory = [];
      } else if (currentScroll >= maxScroll - 5 && lastScrollRef.current < maxScroll - 10) {
        playBounce();
        velocityHistory = [];
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
    playRubberBand,
    setEnabled,
    getEnabled,
  };
}
