import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { hashPassword,validateEmail,validatePassword,verifyPassword } from '../utils/helper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// ============== CRYPTO UTILS ==============
const hashPassword = (password) => {
  const salt = randomBytes(32).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}$${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split('$');
  if (!salt || !hash) return false;
  
  const derivedKey = pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  const storedBuffer = Buffer.from(hash, 'hex');
  
  if (derivedKey.length !== storedBuffer.length) return false;
  
  return timingSafeEqual(derivedKey, storedBuffer);
};

const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ============== VALIDATION ==============
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') throw new Error('Email required');
  const trimmed = email.trim().toLowerCase();
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(trimmed)) throw new Error('Invalid email');
  return trimmed;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') throw new Error('Password required');
  if (password.length < 8) throw new Error('Password must be 8+ chars');
  if (!/[a-z]/.test(password)) throw new Error('Need lowercase letter');
  if (!/[A-Z]/.test(password)) throw new Error('Need uppercase letter');
  if (!/[0-9]/.test(password)) throw new Error('Need number');
  return password;
};

const validateUsername = (username) => {
  if (!username || typeof username !== 'string') throw new Error('Username required');
  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 50) throw new Error('Username 2-50 chars');
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) throw new Error('Username can only contain letters, numbers, underscore, hyphen');
  return trimmed;
};

// ============== CONTROLLERS ==============

export const register = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    const validatedEmail = validateEmail(email);
    const validatedPassword = validatePassword(password);
    const validatedUsername = validateUsername(username);

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: validatedEmail } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already exists' });

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedEmail,
        password: hashPassword(validatedPassword),
        username: validatedUsername,
        role: role?.toUpperCase() || 'USER'
      }
    });

    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'Registered',
      data: {
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
        token
      }
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validatedEmail = validateEmail(email);
    if (!password) return res.status(400).json({ success: false, message: 'Password required' });

    const user = await prisma.user.findUnique({ where: { email: validatedEmail } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
        token
      }
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });
  
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
  
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  };



export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords required' });
    }

    const validatedNew = validatePassword(newPassword);

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({ success: false, message: 'Current password wrong' });
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashPassword(validatedNew) }
    });

    res.status(200).json({ success: true, message: 'Password changed' });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



