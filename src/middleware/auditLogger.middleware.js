import prisma from "../lib/prisma";

export const auditLogger = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    if (req.user && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
      prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: req.method,
          endpoint: req.originalUrl,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          statusCode: res.statusCode,
        },
      }).catch(console.error);
    }
    originalSend.call(this, body);
  };
  
  next();
};