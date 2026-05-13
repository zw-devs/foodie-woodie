// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';


// 1. AUTHENTICATE — Token verify
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user || user.isBlocked) return res.status(401).json({ message: 'Unauthorized' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// 2. AUTHORIZE ROLE — Role check
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Role not allowed' });
    }
    next();
  };
};

// 3. PROTECT ROUTE PARAMS — Ownership check
export const protect = (model, ownerField = 'userId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await prisma[model].findUnique({ where: { id: resourceId } });

      if (!resource) return res.status(404).json({ message: 'Not found' });
      
      if (resource[ownerField] !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not your resource' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};

