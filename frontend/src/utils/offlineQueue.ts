import { API_BASE_URL } from '../config';

export interface QueuedActivity {
  id: string;
  type: 'game_session' | 'reminder_completed' | 'voice_interaction';
  label: string; // Friendly name, e.g. "Memory Match", "Who Is This?", "Daily Routine"
  endpoint: string;
  method: 'POST';
  payload: Record<string, any>;
  timestamp: string; // ISO string
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  lastError?: string;
  accuracyPct?: number;
  durationMs?: number;
  difficultyLevel?: string;
}

export interface SyncResult {
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{
    id: string;
    label: string;
    success: boolean;
    serverId?: string;
    error?: string;
  }>;
}

const STORAGE_KEY = 'smritisetu_offline_queue_v1';

/**
 * Retrieve all queued activities from persistent local storage.
 */
export function getQueuedActivities(): QueuedActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[OfflineQueue] Failed to parse queued activities:', err);
    return [];
  }
}

/**
 * Save array of activities to persistent local storage.
 */
function saveQueue(queue: QueuedActivity[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    // Dispatch a custom window event so UI components immediately react to queue changes
    window.dispatchEvent(new CustomEvent('smritisetu_offline_queue_changed', { detail: queue }));
  } catch (err) {
    console.error('[OfflineQueue] Failed to save queue to localStorage:', err);
  }
}

/**
 * Enqueue a new activity to be synced when online.
 */
export function enqueueActivity(
  item: Omit<QueuedActivity, 'id' | 'timestamp' | 'retryCount' | 'status'>
): QueuedActivity {
  const current = getQueuedActivities();
  const newActivity: QueuedActivity = {
    ...item,
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };

  const updated = [...current, newActivity];
  saveQueue(updated);
  return newActivity;
}

/**
 * Remove a specific activity from queue by ID.
 */
export function removeQueuedActivity(id: string): void {
  const current = getQueuedActivities();
  const updated = current.filter((a) => a.id !== id);
  saveQueue(updated);
}

/**
 * Update an existing activity in the queue (e.g. status, error, retryCount).
 */
export function updateQueuedActivity(id: string, updates: Partial<QueuedActivity>): void {
  const current = getQueuedActivities();
  const updated = current.map((a) => (a.id === id ? { ...a, ...updates } : a));
  saveQueue(updated);
}

/**
 * Clear all activities that have been marked as synced.
 */
export function clearSyncedActivities(): void {
  const current = getQueuedActivities();
  const updated = current.filter((a) => a.status !== 'synced');
  saveQueue(updated);
}

/**
 * Clear the entire queue (utility for resetting).
 */
export function clearAllQueuedActivities(): void {
  saveQueue([]);
}

/**
 * Attempt to sync all queued items sequentially to the backend.
 * Handles partial failures gracefully: succeeded items are removed, failed ones remain with error details.
 */
export async function syncQueuedActivities(): Promise<SyncResult> {
  const queue = getQueuedActivities();
  if (queue.length === 0) {
    return { total: 0, succeeded: 0, failed: 0, results: [] };
  }

  const syncResult: SyncResult = {
    total: queue.length,
    succeeded: 0,
    failed: 0,
    results: [],
  };

  const remainingQueue: QueuedActivity[] = [];

  for (const item of queue) {
    try {
      // Mark as syncing in memory/storage
      updateQueuedActivity(item.id, { status: 'syncing' });

      const url = item.endpoint.startsWith('http')
        ? item.endpoint
        : `${API_BASE_URL}${item.endpoint.startsWith('/') ? '' : '/'}${item.endpoint}`;

      const res = await fetch(url, {
        method: item.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const responseData = await res.json().catch(() => ({}));
      syncResult.succeeded += 1;
      syncResult.results.push({
        id: item.id,
        label: item.label,
        success: true,
        serverId: responseData.id || responseData.sessionId,
      });

      // Successful sync -> do not add to remainingQueue (it is removed)
    } catch (err: any) {
      console.warn(`[OfflineQueue] Failed syncing item ${item.id} (${item.label}):`, err);
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      
      syncResult.failed += 1;
      syncResult.results.push({
        id: item.id,
        label: item.label,
        success: false,
        error: errorMsg,
      });

      // Retain failed item with updated error and retry count
      remainingQueue.push({
        ...item,
        status: 'failed',
        retryCount: (item.retryCount || 0) + 1,
        lastError: errorMsg,
      });
    }
  }

  // Update storage with only the remaining failed/pending items
  saveQueue(remainingQueue);

  return syncResult;
}
