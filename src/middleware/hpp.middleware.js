import hpp from 'hpp';

export const hppMiddleware = hpp({
  whitelist: ['price', 'rating', 'category'], // allowed duplicates
});