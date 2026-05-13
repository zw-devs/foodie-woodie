import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter — sirf jpeg/jpg
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg'];
  const allowedExt = ['.jpeg', '.jpg'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG/JPG images allowed'), false);
  }
};

// Multiple images (max 5)
export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 },
}).array('images', 5);

// Single image
export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('image');

// Multer error handler
export const multerError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Max 5 images allowed' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name' });
    }
  }
  if (err.message === 'Only JPEG/JPG images allowed') {
    return res.status(400).json({ message: 'Only .jpeg or .jpg allowed' });
  }
  next(err);
};