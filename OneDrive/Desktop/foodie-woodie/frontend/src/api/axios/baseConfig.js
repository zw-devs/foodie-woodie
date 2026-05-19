// ═══════════════════════════════════════════════════════════════
// baseConfig.js - Axios base configuration
// ═══════════════════════════════════════════════════════════════

import { API_CONFIG } from '../config/apiConfig.js';

export const baseConfig = {
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { ...API_CONFIG.HEADERS },
};
