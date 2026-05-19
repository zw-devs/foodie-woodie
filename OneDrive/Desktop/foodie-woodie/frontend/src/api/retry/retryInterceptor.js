// ═══════════════════════════════════════════════════════════════
// retryInterceptor.js - Retry with exponential backoff (custom build)
// ═══════════════════════════════════════════════════════════════

import { API_CONFIG } from '../../config/apiConfig.js';
import { isRetryable } from '../../utils/errorUtils.js';
import {axios} from 'axios';

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} retries - Remaining retries
 * @param {number} delay - Current delay in ms
 * @returns {Promise}
 */
export async function retryWithBackoff(fn, retries = API_CONFIG.RETRY.MAX_RETRIES, delay = API_CONFIG.RETRY.BASE_DELAY) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !isRetryable(error)) throw error;

    const jitter = API_CONFIG.RETRY.JITTER ? Math.random() * 1000 : 0;
    const waitTime = delay + jitter;

    console.log(`[RetryInterceptor] ⏳ Waiting ${Math.round(waitTime)}ms... (${retries} left)`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Response error handler with retry logic
 * @param {Error} error
 * @returns {Promise}
 */
export async function retryInterceptor(error) {
  const original = error.config;

  if (isRetryable(error) && original && !original._retryCount) {
    original._retryCount = 1;
    console.log(`[RetryInterceptor] 🔄 Retrying ${original.url}`);
    return retryWithBackoff(() => axios(original), API_CONFIG.RETRY.MAX_RETRIES, API_CONFIG.RETRY.BASE_DELAY);
  }

  return Promise.reject(error);
}
