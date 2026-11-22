import { useState, useEffect, useCallback } from 'react';

// Progressive client-side login throttle. After a run of failed password
// attempts, the login form locks for a cooldown that GROWS with each further
// failure (30s → 1m → 2m → 4m … capped at 15m). This is a UX deterrent against
// casual brute force on the form; the real protection is Supabase's own
// server-side auth rate limiting.
const KEY = 'poolscore_login_guard';
const THRESHOLD = 5; // locking begins once failures reach this many
const BASE_SEC = 30;
const CAP_SEC = 15 * 60;

interface Guard {
  count: number;
  lockUntil: number;
}

function read(): Guard {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Guard;
  } catch {
    // ignore (private mode / blocked storage)
  }
  return { count: 0, lockUntil: 0 };
}

function write(g: Guard) {
  try {
    localStorage.setItem(KEY, JSON.stringify(g));
  } catch {
    // ignore
  }
}

export function useLoginThrottle() {
  const [remainingSec, setRemainingSec] = useState(0);

  const refresh = useCallback(() => {
    const ms = read().lockUntil - Date.now();
    setRemainingSec(ms > 0 ? Math.ceil(ms / 1000) : 0);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 1000);
    return () => clearInterval(t);
  }, [refresh]);

  /** Record one failed attempt and extend the lock if the threshold is hit. */
  const recordFailure = useCallback(() => {
    const g = read();
    g.count += 1;
    if (g.count >= THRESHOLD) {
      const level = g.count - THRESHOLD + 1; // 1, 2, 3, …
      const sec = Math.min(CAP_SEC, BASE_SEC * 2 ** (level - 1));
      g.lockUntil = Date.now() + sec * 1000;
    }
    write(g);
    refresh();
  }, [refresh]);

  /** Clear everything after a successful login. */
  const recordSuccess = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setRemainingSec(0);
  }, []);

  return {
    remainingSec,
    isLocked: remainingSec > 0,
    recordFailure,
    recordSuccess,
  };
}
