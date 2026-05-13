import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

export const sanitizeMiddleware = [
  mongoSanitize(), // NoSQL injection
  xss(), // XSS clean
];