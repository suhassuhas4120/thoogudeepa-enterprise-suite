/**
 * Client-Side Local-First Offline Outbox Sync Manager for Waiter Mobile
 * Persists queued orders and service actions in browser IndexedDB/LocalStorage
 * with automated flush when connectivity is restored.
 */

export interface QueuedAction {
  id: string;
  type: 'FIRE_KOT' | 'CALL_KITCHEN' | 'SEAT_GUESTS' | 'VACATE_TABLE';
  payload: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = 'thoogudeepa_waiter_outbox_queue';

class WaiterLocalOutbox {
  private queue: QueuedAction[] = [];
  private isFlushing: boolean = false;
  private listeners: Set<(queue: QueuedAction[]) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueue();
      window.addEventListener('online', () => {
        this.flushQueue();
      });
      // Periodic background retry every 10 seconds if online
      setInterval(() => {
        if (navigator.onLine && this.queue.length > 0) {
          this.flushQueue();
        }
      }, 10000);
    }
  }

  public getQueue(): QueuedAction[] {
    return [...this.queue];
  }

  public subscribe(fn: (queue: QueuedAction[]) => void): () => void {
    this.listeners.add(fn);
    fn(this.getQueue());
    return () => this.listeners.delete(fn);
  }

  public enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>): QueuedAction {
    const item: QueuedAction = {
      ...action,
      id: 'outbox-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.queue.push(item);
    this.saveQueue();
    this.notify();

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.flushQueue();
    }
    return item;
  }

  public async flushQueue(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) return;
    this.isFlushing = true;

    try {
      const pending = [...this.queue];
      for (const item of pending) {
        try {
          let success = true;
          if (item.type === 'FIRE_KOT') {
            const res = await fetch('/api/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.payload),
            });
            success = res.ok;
          }

          if (success) {
            this.queue = this.queue.filter((q) => q.id !== item.id);
            this.saveQueue();
            this.notify();
          } else {
            item.retryCount += 1;
            if (item.retryCount > 5) {
              // Discard or dead-letter after 5 failed attempts
              this.queue = this.queue.filter((q) => q.id !== item.id);
              this.saveQueue();
              this.notify();
            }
          }
        } catch {
          // Network dropped mid-flush; halt and wait for next online event
          break;
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private loadQueue(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {}
  }

  private notify(): void {
    const copy = this.getQueue();
    for (const fn of this.listeners) {
      try {
        fn(copy);
      } catch {}
    }
  }
}

export const waiterLocalOutbox = new WaiterLocalOutbox();
