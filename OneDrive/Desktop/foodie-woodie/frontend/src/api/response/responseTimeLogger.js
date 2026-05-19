// ═══════════════════════════════════════════════════════════════
// responseTimeLogger.js - Response interceptor: Log request duration
// ═══════════════════════════════════════════════════════════════

import { getDuration, formatDuration } from '../../utils/timeUtils.js';

/**
 * Log request/response duration
 * @param {import('axios').AxiosResponse} response
 * @returns {import('axios').AxiosResponse}
 */
export function responseTimeLoggerInterceptor(response) {
  const duration = getDuration(response.config.metadata.startTime);
  const formatted = formatDuration(duration);
  const id = response.config.metadata?.requestId;

  console.log(`[ResponseTimeLogger] ⏱️  Request ${id} completed in ${formatted}`);
  return response;
}

/**
 * Log error response duration
 * @param {Error} error
 * @returns {Promise<never>}
 */
export function responseTimeErrorInterceptor(error) {
  const startTime = error.config?.metadata?.startTime;
  if (startTime) {
    const duration = getDuration(startTime);
    const formatted = formatDuration(duration);
    const id = error.config.metadata?.requestId;
    console.log(`[ResponseTimeLogger] ⏱️  Request ${id} failed after ${formatted}`);
  }
  return Promise.reject(error);
}
