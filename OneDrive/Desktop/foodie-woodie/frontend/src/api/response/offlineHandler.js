// ═══════════════════════════════════════════════════════════════
// offlineHandler.js - Response interceptor: Handle offline errors
// ═══════════════════════════════════════════════════════════════

import { offlineQueue } from '../queue/offlineQueue.js';

/**
 * Queue requests when offline
 * @param {Error} error
 * @returns {Promise}
 */
export function offlineHandlerInterceptor(error) {
  const original = error.config;

  if (!navigator.onLine && original) {
    console.log('[OfflineHandler] 📵 Offline - queuing request');
    return offlineQueue.enqueue(original);
  }

  return Promise.reject(error);
}
