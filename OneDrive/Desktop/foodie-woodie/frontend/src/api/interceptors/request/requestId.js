// ═══════════════════════════════════════════════════════════════
// requestId.js - Request interceptor: Add unique request ID
// ═══════════════════════════════════════════════════════════════

import { generateRequestId } from '../../utils/idGenerator.js';

/**
 * Attach unique request ID for distributed tracing
 * @param {import('axios').AxiosRequestConfig} config
 * @returns {import('axios').AxiosRequestConfig}
 */
export function requestIdInterceptor(config) {
  const requestId = generateRequestId();

  // Store in metadata for response interceptors
  config.metadata = {
    ...config.metadata,
    requestId,
    startTime: Date.now(),
  };

  // Add to headers for backend tracing
  config.headers['X-Request-ID'] = requestId;

  return config;
}
