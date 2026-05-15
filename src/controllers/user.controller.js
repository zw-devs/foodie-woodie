import prisma from "../lib/prisma";

import { hashPassword, validateEmail, validatePassword, validateUsername } from '../utils/helper.js';

const prisma = new PrismaClient();

// ============== CREATE USER ==============
export const createUser = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    const validatedEmail = validateEmail(email);
    const validatedPassword = validatePassword(password);

    const existing = await prisma.user.findUnique({ where: { email: validatedEmail } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already exists' });

    const user = await prisma.user.create({
      data: {
        email: validatedEmail,
        password: hashPassword(validatedPassword),
        username,
        role: role?.toUpperCase() || 'USER'
      },
      select: { id: true, email: true, username: true, role: true, isActive: true, createdAt: true }
    });

    res.status(201).json({ success: true, message: 'User created', data: { user } });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ============== GET ALL USERS ==============
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.body;

    const where = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role.toUpperCase();
    if (isActive !== undefined) where.isActive = isActive === true || isActive === 'true';

    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, username: true, role: true, isActive: true, createdAt: true },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.status(200).json({
      success: true,
      data: { users, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============== GET USER BY ID ==============
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: { user } });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============== UPDATE USER ==============
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role, isActive } = req.body;

    const updateData = {};
    if (username) updateData.username = validateUsername(username);
    if (email) {
      updateData.email = validateEmail(email);
      const existing = await prisma.user.findUnique({ where: { email: updateData.email } });
      if (existing && existing.id !== userId) {
        return res.status(409).json({ success: false, message: 'Email already taken' });
      }
    }
    if (role) updateData.role = role.toUpperCase();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, username: true, email: true, role: true, isActive: true, updatedAt: true }
    });

    res.status(200).json({ success: true, message: 'User updated', data: { user } });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ============== DELETE USER ==============
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.userId) {
      return res.status(403).json({ success: false, message: 'Cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ success: true, message: 'User deleted' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (role) updateData.role = role.toUpperCase();

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, username: true, role: true, isActive: true }
    });

    res.status(200).json({ success: true, message: 'User updated', data: { user } });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, username: true, role: true, isActive: true, createdAt: true, updatedAt: true }
      });
  
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
      res.status(200).json({ success: true, data: { user } });
  
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const updateData = {};

    if (username) updateData.username = validateUsername(username);
    if (email) {
      updateData.email = validateEmail(email);
      const existing = await prisma.user.findUnique({ where: { email: updateData.email } });
      if (existing && existing.id !== req.user.userId) {
        return res.status(409).json({ success: false, message: 'Email taken' });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: { id: true, email: true, username: true, role: true, isActive: true }
    });

    res.status(200).json({ success: true, message: 'Updated', data: { user } });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ============== BLOCK USER ==============  //only admin have these priviliges to block/unblock 
export const blockUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      if (userId === req.user.userId) {
        return res.status(403).json({ success: false, message: 'Cannot block yourself' });
      }
  
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
        select: { id: true, username: true, email: true, isActive: true }
      });
  
      res.status(200).json({ success: true, message: 'User blocked', data: { user } });
  
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  // ============== UNBLOCK USER ==============
  export const unblockUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
        select: { id: true, username: true, email: true, isActive: true }
      });
  
      res.status(200).json({ success: true, message: 'User unblocked', data: { user } });
  
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };