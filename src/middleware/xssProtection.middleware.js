import xss from 'xss';

export const xssProtection = (req, res, next) => {
  const clean = (obj) => {
    if (typeof obj === 'string') return xss(obj);
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) obj[key] = clean(obj[key]);
    }
    return obj;
  };
  
  req.body = clean(req.body);
  req.query = clean(req.query);
  req.params = clean(req.params);
  
  next();
};