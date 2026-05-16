import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import {
  hashPassword,
  validateEmail,
  validatePassword,
  verifyPassword,
  validateUsername,
  generateToken,
} from "../utils/helper.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// ========== REGISTER ==========

export const register = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    const validatedEmail = validateEmail(email);
    const validatedPassword = validatePassword(password);
    const validatedUsername = validateUsername(username);

    const existing = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });

    const user = await prisma.user.create({
      data: {
        email: validatedEmail,
        password: hashPassword(validatedPassword),
        username: validatedUsername,
        role: role?.toUpperCase() || "USER",
      },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({
      success: true,
      message: "Registered",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== LOGIN ==========

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validatedEmail = validateEmail(email);
    if (!password)
      return res
        .status(400)
        .json({ success: false, message: "Password required" });

    const user = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    if (!user.isActive)
      return res
        .status(403)
        .json({ success: false, message: "Account deactivated" });

    if (!verifyPassword(password, user.password)) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== REFRESH TOKEN ==========

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res
        .status(401)
        .json({ success: false, message: "Refresh token required" });

    const stored = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, isRevoked: false },
    });

    if (!stored)
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const { accessToken, refreshToken: newRefresh } = generateTokens(
      decoded.userId,
    );

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefresh,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: { accessToken, refreshToken: newRefresh },
    });
  } catch (err) {
    res.status(401).json({ success: false, message: "Token refresh failed" });
  }
};

// ========== LOGOUT ==========

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// ========== CHANGE PASSWORD ==========

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Both passwords required" });
    }

    const validatedNew = validatePassword(newPassword);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!verifyPassword(currentPassword, user.password)) {
      return res
        .status(401)
        .json({ success: false, message: "Current password wrong" });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashPassword(validatedNew) },
    });

    res.status(200).json({ success: true, message: "Password changed" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
