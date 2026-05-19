// ═══════════════════════════════════════════════════════════════
// interceptorManager.js - Wire all interceptors to axios instance
// ═══════════════════════════════════════════════════════════════

import { instance } from '../axios/instance.js';

// Request interceptors
import { authTokenInterceptor } from '../interceptors/request/authToken.js';
import { requestIdInterceptor } from '../interceptors/request/requestId.js';
import { headersInterceptor } from '../interceptors/request/headers.js';

// Response interceptors
import { timestampLoggerInterceptor } from '../interceptors/response/timestampLogger.js';
import { responseTimeLoggerInterceptor, responseTimeErrorInterceptor } from '../interceptors/response/responseTimeLogger.js';
import { offlineHandlerInterceptor } from '../interceptors/response/offlineHandler.js';
import { errorNormalizerInterceptor } from '../interceptors/response/errorNormalizer.js';

// Auth refresh (axios-auth-refresh package)
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { refreshToken } from '../interceptors/auth/tokenRefresher.js';

// Retry (axios-retry package)
import axiosRetry from 'axios-retry';
import { isRetryable } from '../utils/errorUtils.js';

/**
 * Setup all interceptors on axios instance
 */
export function setupInterceptors() {
  // ═══ REQUEST INTERCEPTORS (Order matters: first to last) ═══

  // 1. Add request ID and metadata
  instance.interceptors.request.use(requestIdInterceptor);

  // 2. Add default headers
  instance.interceptors.request.use(headersInterceptor);

  // 3. Inject auth token
  instance.interceptors.request.use(authTokenInterceptor);

  // ═══ RESPONSE INTERCEPTORS (Order matters: last to first) ═══

  // 1. Log timestamp
  instance.interceptors.response.use(timestampLoggerInterceptor);

  // 2. Log response time
  instance.interceptors.response.use(
    responseTimeLoggerInterceptor,
    responseTimeErrorInterceptor
  );

  // 3. Handle offline
  instance.interceptors.response.use(null, offlineHandlerInterceptor);

  // 4. Normalize errors
  instance.interceptors.response.use(null, errorNormalizerInterceptor);

  // ═══ PACKAGE-BASED INTERCEPTORS ═══

  // axios-auth-refresh: Auto token refresh on 401
  createAuthRefreshInterceptor(instance, refreshToken, { statusCodes: [401] });

  // axios-retry: Auto retry with exponential backoff
  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return isRetryable(error);
    },
  });
}
