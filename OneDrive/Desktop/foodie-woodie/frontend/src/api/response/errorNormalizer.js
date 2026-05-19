// ═══════════════════════════════════════════════════════════════
// errorNormalizer.js - Response interceptor: Normalize errors
// ═══════════════════════════════════════════════════════════════

import { isNetworkError, isTimeoutError } from '../../utils/errorUtils.js';

/**
 * Normalize any error into standard format
 * @param {Error} error
 * @returns {Object} Normalized error
 */
export function normalizeError(error) {
  const status = error.response?.status;
  const data = error.response?.data;

  const normalized = {
    status: status || null,
    message: 'Something went wrong',
    code: 'UNKNOWN_ERROR',
    details: null,
    isRetryable: false,
    original: error,
  };

  if (!navigator.onLine || isNetworkError(error)) {
    normalized.message = 'No internet connection. Please check your network.';
    normalized.code = 'OFFLINE';
    normalized.isRetryable = true;
    return normalized;
  }

  if (isTimeoutError(error)) {
    normalized.message = 'Request timed out. Please try again.';
    normalized.code = 'TIMEOUT';
    normalized.isRetryable = true;
    return normalized;
  }

  switch (status) {
    case 400:
      normalized.message = data?.message || 'Invalid request';
      normalized.code = 'BAD_REQUEST';
      normalized.details = data?.errors || data;
      break;
    case 401:
      normalized.message = 'Session expired. Please login again.';
      normalized.code = 'UNAUTHORIZED';
      break;
    case 403:
      normalized.message = 'You do not have permission.';
      normalized.code = 'FORBIDDEN';
      break;
    case 404:
      normalized.message = 'Resource not found.';
      normalized.code = 'NOT_FOUND';
      break;
    case 422:
      normalized.message = 'Validation failed.';
      normalized.code = 'VALIDATION_ERROR';
      normalized.details = data?.errors || data;
      break;
    case 429:
      normalized.message = 'Too many requests. Please slow down.';
      normalized.code = 'RATE_LIMITED';
      normalized.isRetryable = true;
      break;
    case 500:
      normalized.message = 'Server error. Please try again later.';
      normalized.code = 'SERVER_ERROR';
      normalized.isRetryable = true;
      break;
    case 502:
    case 503:
    case 504:
      normalized.message = 'Service temporarily unavailable.';
      normalized.code = 'SERVICE_UNAVAILABLE';
      normalized.isRetryable = true;
      break;
    default:
      normalized.message = data?.message || error.message || 'An unexpected error occurred';
      normalized.code = `HTTP_${status || 'UNKNOWN'}`;
      normalized.isRetryable = status >= 500;
  }

  return normalized;
}

/**
 * Response error handler - normalize and log
 * @param {Error} error
 * @returns {Promise<never>}
 */
export function errorNormalizerInterceptor(error) {
  const normalized = normalizeError(error);
  console.error('[ErrorNormalizer]', normalized);
  return Promise.reject(normalized);
}
