// ═══════════════════════════════════════════════════════════════
// axiosSetup.js - Initialize axios with all configurations
// ═══════════════════════════════════════════════════════════════

import { instance } from '../axios/instance.js';
import { setupInterceptors } from './interceptorManager.js';
import { offlineQueue } from '../interceptors/queue/offlineQueue.js';

/**
 * Initialize and configure axios instance
 * @returns {import('axios').AxiosInstance}
 */
export function createAxiosInstance() {
  // Wire all interceptors
  setupInterceptors();

  // Set API instance for offline queue
  offlineQueue.setApi(instance);

  return instance;
}
