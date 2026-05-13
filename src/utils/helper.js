import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

// ============== PASSWORD HASHING ==============
export const hashPassword = (password) => {
  const salt = randomBytes(32).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}$${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split('$');
  if (!salt || !hash) return false;
  
  const derivedKey = pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  const storedBuffer = Buffer.from(hash, 'hex');
  
  if (derivedKey.length !== storedBuffer.length) return false;
  
  return timingSafeEqual(derivedKey, storedBuffer);
};

// ============== VALIDATION ==============
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') throw new Error('Email required');
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) throw new Error('Invalid email');
  return trimmed;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') throw new Error('Password required');
  if (password.length < 8) throw new Error('Password must be 8+ chars');
  if (!/[a-z]/.test(password)) throw new Error('Need lowercase letter');
  if (!/[A-Z]/.test(password)) throw new Error('Need uppercase letter');
  if (!/[0-9]/.test(password)) throw new Error('Need number');
  return password;
};

export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') throw new Error('Username required');
  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 50) throw new Error('Username 2-50 chars');
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) throw new Error('Invalid username');
  return trimmed;
};