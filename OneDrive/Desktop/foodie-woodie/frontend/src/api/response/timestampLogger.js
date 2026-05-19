// ═══════════════════════════════════════════════════════════════
// timestampLogger.js - Response interceptor: Log response timestamp
// ═══════════════════════════════════════════════════════════════

import { getTimestamp } from '../../utils/timeUtils.js';

/**
 * Log response with timestamp
 * @param {import('axios').AxiosResponse} response
 * @returns {import('axios').AxiosResponse}
 */
export function timestampLoggerInterceptor(response) {
  const time = getTimestamp();
  const method = response.config.method?.toUpperCase().padEnd(6);
  const status = response.status;
  const url = response.config.url;
  const id = response.config.metadata?.requestId;

  console.log(`[${time}] ✅ ${method} ${url} | ${status} | ID: ${id}`);
  return response;
}
