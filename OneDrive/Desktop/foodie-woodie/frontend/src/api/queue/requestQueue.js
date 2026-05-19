// ═══════════════════════════════════════════════════════════════
// requestQueue.js - Concurrency control with priority (custom build)
// ═══════════════════════════════════════════════════════════════

import { API_CONFIG } from '../../config/apiConfig.js';

class RequestQueue {
  constructor() {
    this.concurrency = API_CONFIG.CONCURRENCY.MAX_PARALLEL;
    this.running = 0;
    this.queue = [];
  }

  async add(requestFn, priority = 'normal') {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject,
        priority,
        addedAt: Date.now(),
      });

      // Sort: high priority first, then FIFO
      this.queue.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return a.addedAt - b.addedAt;
      });

      this.#process();
    });
  }

  async #process() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;

    const { requestFn, resolve, reject } = this.queue.shift();
    this.running++;

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.#process(); // Trigger next
    }
  }

  get size() {
    return this.queue.length;
  }

  get activeCount() {
    return this.running;
  }
}

export const requestQueue = new RequestQueue();
