import prisma from "../lib/prisma";

const attempts = new Map(); // In-memory (use Redis in production)

export const suspiciousActivity = async (req, res, next) => {
  const ip = req.ip;
  const key = `${ip}:${req.path}`;
  
  const count = attempts.get(key) || 0;
  
  if (count > 5) {
    return res.status(429).json({ message: 'Suspicious activity detected' });
  }
  
  attempts.set(key, count + 1);
  setTimeout(() => attempts.delete(key), 3600000); // 1 hour
  
  next();
};