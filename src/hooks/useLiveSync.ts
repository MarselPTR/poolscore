import { useEffect, useCallback } from 'react';
import type { Match } from '../types';

const CHANNEL_NAME = 'poolscore_live_sync_channel';
const STORAGE_KEY = 'poolscore_live_match_state';

export function useLiveBroadcast() {
  const broadcastMatch = useCallback((match: Match | null) => {
    try {
      if (typeof window !== 'undefined') {
        const payload = match ? JSON.stringify(match) : null;
        if (payload) {
          localStorage.setItem(STORAGE_KEY, payload);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }

        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel(CHANNEL_NAME);
          bc.postMessage({ type: 'MATCH_UPDATE', match });
          bc.close();
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return { broadcastMatch };
}

export function useLiveReceiver(onMatchUpdate: (match: Match | null) => void) {
  useEffect(() => {
    // Read initial cached state from localStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        onMatchUpdate(JSON.parse(cached));
      }
    } catch {
      // ignore
    }

    // Listen to BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'MATCH_UPDATE') {
          onMatchUpdate(event.data.match);
        }
      };
    }

    // Listen to storage events across tabs
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        if (event.newValue) {
          try {
            onMatchUpdate(JSON.parse(event.newValue));
          } catch {
            // ignore
          }
        } else {
          onMatchUpdate(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [onMatchUpdate]);
}
