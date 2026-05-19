// ═══════════════════════════════════════════════════════════════
// logger.js - Request/response logging utility (custom build)
// ═══════════════════════════════════════════════════════════════

import { getTimestamp } from '../../utils/timeUtils.js';

/**
 * Log outgoing request
 * @param {import('axios').AxiosRequestConfig} config
 */
export function logRequest(config) {
  const time = getTimestamp();
  const method = config.method?.toUpperCase().padEnd(6);
  const url = config.url;
  const id = config.metadata?.requestId;
  console.log(`[${time}] ➡️  ${method} ${url} | ID: ${id}`);
}

/**
 * Log successful response
 * @param {import('axios').AxiosResponse} response
 * @param {number} duration
 */
export function logResponse(response, duration) {
  const time = getTimestamp();
  const method = response.config.method?.toUpperCase().padEnd(6);
  const status = response.status;
  const url = response.config.url;
  const id = response.config.metadata?.requestId;
  console.log(`[${time}] ✅ ${method} ${url} | ${status} | ${duration}ms | ID: ${id}`);
}

/**
 * Log error response
 * @param {Error} error
 * @param {number} duration
 * @param {string} requestId
 */
export function logError(error, duration, requestId) {
  const time = getTimestamp();
  const method = error.config?.method?.toUpperCase().padEnd(6) || 'UNKNOWN';
  const url = error.config?.url || 'unknown';
  const status = error.response?.status || 'NETWORK';
  console.log(`[${time}] ❌ ${method} ${url} | ${status} | ${duration}ms | ID: ${requestId}`);
}
