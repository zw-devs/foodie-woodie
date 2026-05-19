// ═══════════════════════════════════════════════════════════════
// offlineQueue.js - Queue requests when offline (custom build)
// ═══════════════════════════════════════════════════════════════

class OfflineQueue {
    constructor() {
      this.queue = [];
      this.isOnline = navigator.onLine;
      this.api = null;
  
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('[OfflineQueue] 🌐 Back online. Flushing...');
        this.#flush();
      });
  
      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('[OfflineQueue] 📵 Gone offline. Queuing requests.');
      });
    }
  
    setApi(api) {
      this.api = api;
    }
  
    async enqueue(config) {
      return new Promise((resolve, reject) => {
        this.queue.push({ config, resolve, reject });
        console.log(`[OfflineQueue] Queued. Size: ${this.queue.length}`);
      });
    }
  
    async #flush() {
      if (!this.api) return;
      while (this.queue.length > 0) {
        const { config, resolve, reject } = this.queue.shift();
        try {
          const res = await this.api.request(config);
          resolve(res);
        } catch (err) {
          reject(err);
        }
      }
    }
  
    get size() {
      return this.queue.length;
    }
  
    get online() {
      return this.isOnline;
    }
  }
  
  export const offlineQueue = new OfflineQueue();
  