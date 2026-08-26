import { useCallback, useRef } from 'react';

export function useSoundEffects(soundEnabled: boolean = true, volume: number = 0.8, vibrationEnabled: boolean = true) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const triggerVibration = useCallback((pattern: number | number[] = 35) => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  }, [vibrationEnabled]);

  // Realistic Acoustic Billiard Ball Pocket Drop Sound FX (Ball dropping into cloth & leather pocket)
  const playPocketDrop = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Heavy ball acoustic thud / drop resonance (phenolic ball landing in pocket net)
      const oscThud = ctx.createOscillator();
      const gainThud = ctx.createGain();
      const filterThud = ctx.createBiquadFilter();

      oscThud.type = 'sine';
      oscThud.frequency.setValueAtTime(160, now);
      oscThud.frequency.exponentialRampToValueAtTime(55, now + 0.09);

      filterThud.type = 'lowpass';
      filterThud.frequency.setValueAtTime(350, now);

      gainThud.gain.setValueAtTime(0.01, now);
      gainThud.gain.linearRampToValueAtTime(0.7 * volume, now + 0.008);
      gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      oscThud.connect(filterThud);
      filterThud.connect(gainThud);
      gainThud.connect(ctx.destination);

      oscThud.start(now);
      oscThud.stop(now + 0.15);

      // 2. Leather & cloth friction impact (crisp pocket rattle)
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.018));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, now);
      noiseFilter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45 * volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.08);

      // 3. Secondary subtle ball settling rattle
      const oscSettle = ctx.createOscillator();
      const gainSettle = ctx.createGain();
      oscSettle.type = 'triangle';
      oscSettle.frequency.setValueAtTime(110, now + 0.04);
      oscSettle.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gainSettle.gain.setValueAtTime(0.01, now + 0.04);
      gainSettle.gain.linearRampToValueAtTime(0.3 * volume, now + 0.045);
      gainSettle.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      oscSettle.connect(gainSettle);
      gainSettle.connect(ctx.destination);

      oscSettle.start(now + 0.04);
      oscSettle.stop(now + 0.14);

      triggerVibration([40, 20, 60]);
    } catch {
      // ignore
    }
  }, [soundEnabled, volume, getAudioContext, triggerVibration]);

  // Ball collision click (Phenolic resin contact sound)
  const playBallHit = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.Q.setValueAtTime(6, ctx.currentTime);

      gain.gain.setValueAtTime(0.4 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);

      triggerVibration(25);
    } catch {
      // ignore
    }
  }, [soundEnabled, volume, getAudioContext, triggerVibration]);

  // Rack Win Chime - plays realistic pocket drop
  const playRackWon = useCallback(() => {
    playPocketDrop();
  }, [playPocketDrop]);

  // Match Victory: Disabled fanfare sound as requested by user
  const playMatchWon = useCallback(() => {
    // Intentionally silent per user request ("tapi kalau sound kemenangan tidak usah!")
    triggerVibration([80, 40, 100]);
  }, [triggerVibration]);

  // Foul Buzzer
  const playFoul = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.35 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);

      triggerVibration([120, 60, 120]);
    } catch {
      // ignore
    }
  }, [soundEnabled, volume, getAudioContext, triggerVibration]);

  // Standard Button Click
  const playButtonClick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.15 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.035);

      triggerVibration(15);
    } catch {
      // ignore
    }
  }, [soundEnabled, volume, getAudioContext, triggerVibration]);

  return {
    playPocketDrop,
    playBallHit,
    playRackWon,
    playMatchWon,
    playFoul,
    playButtonClick,
    triggerVibration,
  };
}
