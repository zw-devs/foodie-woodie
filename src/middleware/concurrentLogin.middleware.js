import prisma from "../lib/prisma";

export const concurrentLogin = async (req, res, next) => {
  const activeSessions = await prisma.session.count({
    where: {
      userId: req.user.id,
      isActive: true,
    },
  });
  
  if (activeSessions >= 3) {
    return res.status(403).json({ message: 'Max 3 concurrent sessions allowed' });
  }
  
  next();
};