/**
 * Offline-First Sync Manager
 * Handles local caching, offline operations, and synchronization when online
 */

interface SyncQueueItem {
  id: string;
  type: 'order' | 'bill' | 'kot-print' | 'bill-print';
  action: 'create' | 'update' | 'delete' | 'print';
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface CachedData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineSyncManager {
  private dbName = 'RestaurantPOS_DB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private observers: Set<(isOnline: boolean) => void> = new Set();

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.setupEventListeners();
        // Removed continuous sync interval - only sync when coming back online
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: false,
          });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', {
            keyPath: 'id',
            autoIncrement: false,
          });
          cacheStore.createIndex('type', 'type', { unique: false });
          cacheStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('printQueue')) {
          const printStore = db.createObjectStore('printQueue', {
            keyPath: 'id',
            autoIncrement: false,
          });
          printStore.createIndex('type', 'type', { unique: false });
          printStore.createIndex('printed', 'printed', { unique: false });
        }
      };
    });
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('[OfflineSync] Connection restored, syncing pending data...');
      this.isOnline = true;
      this.notifyObservers(true);
      // Only sync when coming back online, not continuously
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineSync] Connection lost, going offline...');
      this.isOnline = false;
      this.notifyObservers(false);
    });
  }

  // Add item to sync queue
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'retries'>) {
    if (!this.db) await this.init();

    const queueItem: SyncQueueItem = {
      ...item,
      id: `${item.type}-${Date.now()}-${Math.random()}`,
      retries: 0,
    };

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add(queueItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Add to print queue (for auto-printing)
  async addToPrintQueue(
    type: 'bill' | 'kot',
    data: any,
    autoprint: boolean = true
  ) {
    if (!this.db) await this.init();

    const printItem = {
      id: `print-${type}-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      printed: false,
      autoprint,
    };

    return new Promise<string>((resolve, reject) => {
      const transaction = this.db!.transaction(['printQueue'], 'readwrite');
      const store = transaction.objectStore('printQueue');
      const request = store.add(printItem);

      request.onsuccess = () => {
        if (autoprint && this.isOnline) {
          this.processPrintQueue();
        }
        resolve(printItem.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data locally
  async cacheData(type: string, data: any) {
    if (!this.db) await this.init();

    const cacheItem: CachedData = {
      id: `${type}-${data._id || data.id || Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data by type
  async getCachedData(type: string): Promise<CachedData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync all pending items (called only when transitioning from offline to online)
  async syncAll() {
    if (!this.isOnline) {
      console.log('[OfflineSync] Cannot sync - offline');
      return;
    }

    console.log('[OfflineSync] Starting sync...');
    this.notifyObservers(true);

    // Sync print queue first
    await this.processPrintQueue();

    // Sync other items
    await this.processSyncQueue();

    console.log('[OfflineSync] Sync completed');
  }

  // Process sync queue
  private async processSyncQueue() {
    if (!this.db) return;

    return new Promise<void>((resolve) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = async () => {
        const items = (request.result || []) as SyncQueueItem[];
        
        for (const item of items) {
          if (item.retries < item.maxRetries) {
            try {
              const response = await fetch(item.endpoint, {
                method: item.action === 'create' ? 'POST' : item.action === 'update' ? 'PATCH' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data),
              });

              if (response.ok) {
                // Remove from queue
                const deleteTransaction = this.db!.transaction(
                  ['syncQueue'],
                  'readwrite'
                );
                deleteTransaction
                  .objectStore('syncQueue')
                  .delete(item.id);

                console.log(`[OfflineSync] Synced ${item.type}:`, item.id);
              } else {
                // Increment retry count
                item.retries++;
                item.timestamp = Date.now();
                const updateTransaction = this.db!.transaction(
                  ['syncQueue'],
                  'readwrite'
                );
                updateTransaction.objectStore('syncQueue').put(item);
              }
            } catch (error) {
              console.error(`[OfflineSync] Error syncing ${item.type}:`, error);
              item.retries++;
              item.timestamp = Date.now();
              const updateTransaction = this.db!.transaction(
                ['syncQueue'],
                'readwrite'
              );
              updateTransaction.objectStore('syncQueue').put(item);
            }
          }
        }
        resolve();
      };
    });
  }

  // Process print queue
  private async processPrintQueue() {
    if (!this.db) return;

    return new Promise<void>((resolve) => {
      const transaction = this.db!.transaction(['printQueue'], 'readwrite');
      const store = transaction.objectStore('printQueue');
      const request = store.getAll();

      request.onsuccess = async () => {
        const items = (request.result || []) as any[];
        
        for (const item of items) {
          if (!item.printed) {
            try {
              // Trigger print
              if (item.type === 'bill') {
                this.printBill(item.data);
              } else if (item.type === 'kot') {
                this.printKOT(item.data);
              }

              // Mark as printed
              item.printed = true;
              const updateTransaction = this.db!.transaction(
                ['printQueue'],
                'readwrite'
              );
              updateTransaction.objectStore('printQueue').put(item);
              console.log(`[OfflineSync] Printed ${item.type}`);
            } catch (error) {
              console.error(`[OfflineSync] Error printing ${item.type}:`, error);
            }
          }
        }
        resolve();
      };
    });
  }

  // Print bill utility
  private printBill(billData: any) {
    const content = this.generateBillContent(billData);
    const printWindow = window.open('', '', 'height=700,width=420');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Courier New', monospace; margin: 10px; }
            pre { font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <pre>${content}</pre>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  }

  // Print KOT utility
  private printKOT(kotData: any) {
    const content = this.generateKOTContent(kotData);
    const printWindow = window.open('', '', 'height=700,width=420');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Courier New', monospace; margin: 10px; }
            pre { font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <pre>${content}</pre>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  }

  private generateBillContent(data: any): string {
    const now = new Date();
    return `
========== RESTAURANT BILL ==========
Date: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
${data.tableNumber ? `Table: ${data.tableNumber}` : 'Type: Walk-in'}
${data.customerName ? `Customer: ${data.customerName}` : ''}
${data.customerPhone ? `Phone: ${data.customerPhone}` : ''}
======================================
${(data.items || [])
  .map(
    (item: any) =>
      `${item.name.substring(0, 25).padEnd(25)} x${item.qty} ₹${(item.price * item.qty)
        .toFixed(2)
        .padStart(7)}`
  )
  .join('\n')}
======================================
Subtotal...................... ₹${(data.subtotal || 0).toFixed(2).padStart(7)}
${data.discount > 0 ? `Discount..................... -₹${data.discount.toFixed(2).padStart(7)}\n` : ''}Tax (10%).................... ₹${(data.tax || 0).toFixed(2).padStart(7)}
${data.roundOff !== 0 && data.roundOff ? `Round Off.................... ${data.roundOff > 0 ? '+' : '-'}₹${Math.abs(data.roundOff).toFixed(2).padStart(7)}\n` : ''}======================================
TOTAL......................... ₹${(data.total || 0).toFixed(2).padStart(7)}
======================================
Payment Mode: ${(data.paymentMode || 'CASH').toUpperCase()}

   **Thank You! Visit Again**
      Have a Great Day!
======================================
    `.trim();
  }

  private generateKOTContent(data: any): string {
    const now = new Date();
    return `
=================== KOT ===================
Date: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
Table: ${data.tableNumber || 'Walk-in'}
Order #${data.orderNumber || 'N/A'}
==========================================
${
  (data.items || [])
    .map((item: any) => `${item.name} x${item.quantity}`)
    .join('\n')
}
==========================================
Special Instructions:
${data.specialInstructions || 'None'}
==========================================
    `.trim();
  }

  // Subscribe to online/offline status changes
  subscribe(callback: (isOnline: boolean) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(isOnline: boolean) {
    this.observers.forEach((cb) => cb(isOnline));
  }

  // Get current online status
  getStatus() {
    return this.isOnline;
  }

  // Cleanup
  destroy() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Export singleton instance
export const offlineSyncManager = new OfflineSyncManager();

// Initialize on import
if (typeof window !== 'undefined') {
  offlineSyncManager.init().catch(console.error);
}
