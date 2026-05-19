// ═══════════════════════════════════════════════════════════════
// authToken.js - Request interceptor: Inject auth token
// ═══════════════════════════════════════════════════════════════

import { API_CONFIG } from '../../config/apiConfig.js';

/**
 * Inject access token into request headers
 * @param {import('axios').AxiosRequestConfig} config
 * @returns {import('axios').AxiosRequestConfig}
 */
export function authTokenInterceptor(config) {
  const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}
