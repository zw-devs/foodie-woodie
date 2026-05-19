// ═══════════════════════════════════════════════════════════════
// env.js - Environment variables (Vite built-in, no dotenv package)
// ═══════════════════════════════════════════════════════════════

export const ENV = {
    API_BASE_URL: import.meta.env.VITE_API_URL,
    API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    NODE_ENV: import.meta.env.MODE,
    IS_DEV: import.meta.env.DEV,
    IS_PROD: import.meta.env.PROD,
  };
  