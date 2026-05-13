export const payloadSize = (maxSize = '7mb') => {
    return (req, res, next) => {
      const size = parseInt(req.headers['content-length'] || 0);
      const limit = parseInt(maxSize) * 1024 * 1024;
      
      if (size > limit) {
        return res.status(413).json({ message: 'Payload too large' });
      }
      next();
    };
  };