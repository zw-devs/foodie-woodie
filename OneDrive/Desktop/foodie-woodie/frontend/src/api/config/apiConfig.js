// ═══════════════════════════════════════════════════════════════
// apiConfig.js - Centralized API configuration
// ═══════════════════════════════════════════════════════════════

import { ENV } from './env.js';

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: ENV.API_TIMEOUT,

  AUTH: {
    TOKEN_KEY: 'accessToken',
    REFRESH_KEY: 'refreshToken',
    REFRESH_ENDPOINT: '/auth/refresh-token',
  },

  RATE_LIMIT: {
    MAX_REQUESTS: 15,
    WINDOW_MS: 1000,
  },

  CONCURRENCY: {
    MAX_PARALLEL: 3,
  },

  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutes
    ENABLED: true,
  },

  RETRY: {
    MAX_RETRIES: 3,
    BASE_DELAY: 1000,
    JITTER: true,
  },

  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
