// ═══════════════════════════════════════════════════════════════
// tokenRefresher.js - Auth interceptor: Refresh token on 401
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig.js';

/**
 * Refresh access token using refresh token
 * @param {import('axios').AxiosError} failedRequest
 * @returns {Promise}
 */
export async function refreshToken(failedRequest) {
  try {
    const refreshToken = localStorage.getItem(API_CONFIG.AUTH.REFRESH_KEY);
    const { data } = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REFRESH_ENDPOINT}`,
      { refreshToken }
    );

    // Save new tokens
    localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, data.data.accessToken);
    localStorage.setItem(API_CONFIG.AUTH.REFRESH_KEY, data.data.refreshToken);

    // Update failed request with new token
    failedRequest.response.config.headers.Authorization = `Bearer ${data.data.accessToken}`;

    console.log('[TokenRefresher] 🔑 Token refreshed successfully');
  } catch (error) {
    console.error('[TokenRefresher] ❌ Refresh failed');
    localStorage.clear();
    window.location.href = '/login';
    throw error;
  }
}
