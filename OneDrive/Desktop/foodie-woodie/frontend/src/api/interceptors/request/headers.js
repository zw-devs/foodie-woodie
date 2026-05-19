// ═══════════════════════════════════════════════════════════════
// headers.js - Request interceptor: Add default/custom headers
// ═══════════════════════════════════════════════════════════════

import { API_CONFIG } from '../../config/apiConfig.js';

/**
 * Ensure all required headers are present
 * @param {import('axios').AxiosRequestConfig} config
 * @returns {import('axios').AxiosRequestConfig}
 */
export function headersInterceptor(config) {
  // Merge default headers
  config.headers = {
    ...API_CONFIG.HEADERS,
    ...config.headers,
  };
  return config;
}
