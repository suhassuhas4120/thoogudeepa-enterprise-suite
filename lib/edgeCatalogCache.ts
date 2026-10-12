/**
 * Edge Authoritative Catalog & Realtime 86 Inventory Cache
 * Serves zero-latency menu reads directly from server memory,
 * bypassing Postgres connection bottlenecks during peak dining rush.
 */

import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import { MenuItem } from '../types/customer';
import { supabase } from './supabase';

interface CachedCatalog {
  items: MenuItem[];
  items86: Set<string>;
  lastSyncedAt: number;
}

class EdgeCatalogCache {
  private cache: CachedCatalog = {
    items: INITIAL_MENU_ITEMS,
    items86: new Set<string>(),
    lastSyncedAt: 0,
  };

  private syncPromise: Promise<void> | null = null;
  private readonly TTL_MS = 60000; // 60 seconds auto-refresh window

  constructor() {
    if (typeof globalThis !== 'undefined') {
      const g = globalThis as any;
      if (g.__edgeCatalogCacheInstance) {
        return g.__edgeCatalogCacheInstance;
      }
      g.__edgeCatalogCacheInstance = this;
    }
  }

  /**
   * Fast synchronous menu read from in-memory edge cache (0ms latency, 0 DB connections)
   */
  public getMenu(): MenuItem[] {
    this.ensureFreshness();
    return this.cache.items;
  }

  /**
   * Check if a dish is 86 (out of stock) in 0ms
   */
  public isItem86(itemIdOrName: string): boolean {
    this.ensureFreshness();
    const clean = (itemIdOrName || '').toLowerCase().trim();
    for (const id of this.cache.items86) {
      if (id.toLowerCase() === clean) return true;
    }
    return false;
  }

  /**
   * Get all currently 86 items as an array
   */
  public get86Items(): string[] {
    this.ensureFreshness();
    return Array.from(this.cache.items86);
  }

  /**
   * Immediately update the 86 status in edge memory when toggled by kitchen
   */
  public update86Status(itemId: string, is86: boolean): void {
    if (is86) {
      this.cache.items86.add(itemId);
    } else {
      this.cache.items86.delete(itemId);
    }
    this.cache.lastSyncedAt = Date.now();
  }

  /**
   * Trigger background sync if TTL expired without blocking active request
   */
  private ensureFreshness(): void {
    if (Date.now() - this.cache.lastSyncedAt > this.TTL_MS) {
      this.syncFromDatabase().catch(() => {});
    }
  }

  /**
   * Sync active 86 inventory state from Supabase
   */
  public async syncFromDatabase(): Promise<void> {
    if (this.syncPromise) return this.syncPromise;

    this.syncPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('menu_86')
          .select('id, name, is_86')
          .eq('is_86', true);

        if (!error && Array.isArray(data)) {
          const fresh86 = new Set<string>();
          for (const row of data) {
            if (row.id) fresh86.add(row.id);
            if (row.name) fresh86.add(row.name);
          }
          this.cache.items86 = fresh86;
          this.cache.lastSyncedAt = Date.now();
        }
      } catch {
        // Fall back gracefully to existing in-memory state
      } finally {
        this.syncPromise = null;
      }
    })();

    return this.syncPromise;
  }
}

export const edgeCatalogCache = new EdgeCatalogCache();
