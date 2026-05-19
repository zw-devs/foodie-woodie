// ═══════════════════════════════════════════════════════════════
// rateLimiter.js - Throttling: max requests per time window (custom build)
// ═══════════════════════════════════════════════════════════════

import { API_CONFIG } from '../../config/apiConfig.js';

class RateLimiter {
  constructor() {
    this.maxRequests = API_CONFIG.RATE_LIMIT.MAX_REQUESTS;
    this.windowMs = API_CONFIG.RATE_LIMIT.WINDOW_MS;
    this.requests = [];
  }

  async execute(requestFn) {
    const now = Date.now();

    // Remove old requests outside window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    // If limit reached, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      console.log(`[RateLimiter] ⏳ Waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requests.push(Date.now());
    return requestFn();
  }

  get currentCount() {
    const now = Date.now();
    return this.requests.filter((time) => now - time < this.windowMs).length;
  }
}

export const rateLimiter = new RateLimiter();
