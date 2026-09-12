import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { getQueuedActivities, syncQueuedActivities, QueuedActivity } from './offlineQueue';

export interface NetworkStatusState {
  isOnline: boolean; // browser navigator.onLine
  isBackendReachable: boolean; // actual HTTP heartbeat check
  isChecking: boolean;
  pendingCount: number;
  lastCheckedAt: Date | null;
  checkHealth: () => Promise<boolean>;
  triggerSync: () => Promise<{ succeeded: number; failed: number; total: number }>;
}

/**
 * Lightweight heartbeat ping to verify backend server connectivity.
 */
export async function checkBackendReachable(timeoutMs: number = 3000): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    // If /api/health isn't available or server is offline, try a fast OPTIONS or root ping
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const fallbackRes = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      return fallbackRes.ok || fallbackRes.status === 404; // Server responded
    } catch {
      return false;
    }
  }
}

/**
 * Custom React hook that monitors real online/offline status, queue count, and auto-syncs.
 */
export function useNetworkStatus(): NetworkStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isBackendReachable, setIsBackendReachable] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(() => getQueuedActivities().length);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);

  const prevReachableRef = useRef<boolean>(true);

  // Check health
  const checkHealth = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    const reachable = await checkBackendReachable(2500);
    setIsBackendReachable(reachable);
    setIsChecking(false);
    setLastCheckedAt(new Date());

    // If transitioned from unreachable to reachable, auto-trigger background sync
    if (reachable && !prevReachableRef.current) {
      console.log('[NetworkStatus] Connectivity restored! Automatically syncing queued activities…');
      syncQueuedActivities().then((res) => {
        setPendingCount(getQueuedActivities().length);
      });
    }

    prevReachableRef.current = reachable;
    return reachable;
  }, []);

  // Trigger manual sync
  const triggerSync = useCallback(async () => {
    const result = await syncQueuedActivities();
    setPendingCount(getQueuedActivities().length);
    await checkHealth();
    return {
      succeeded: result.succeeded,
      failed: result.failed,
      total: result.total,
    };
  }, [checkHealth]);

  // Listen to queue changes in localStorage
  useEffect(() => {
    const handleQueueChange = () => {
      setPendingCount(getQueuedActivities().length);
    };

    window.addEventListener('smritisetu_offline_queue_changed', handleQueueChange);
    window.addEventListener('storage', handleQueueChange);

    return () => {
      window.removeEventListener('smritisetu_offline_queue_changed', handleQueueChange);
      window.removeEventListener('storage', handleQueueChange);
    };
  }, []);

  // Listen to browser online/offline events & periodic heartbeat
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsBackendReachable(false);
      prevReachableRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkHealth();

    // Check heartbeat periodically every 15 seconds
    const interval = setInterval(() => {
      checkHealth();
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkHealth]);

  return {
    isOnline,
    isBackendReachable,
    isChecking,
    pendingCount,
    lastCheckedAt,
    checkHealth,
    triggerSync,
  };
}
