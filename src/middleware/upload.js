import multer from 'multer';
import path from 'path';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Check file extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Middleware to handle single image upload (optional)
export const uploadImage = upload.single('cover');

// Middleware to handle logo upload
export const uploadLogo = upload.single('logo');

// Middleware to handle icon upload
export const uploadIcon = upload.single('icon');

// Middleware to handle multiple image uploads
export const uploadImages = upload.array('images', 10); // Max 10 images

// Middleware to process uploaded images and upload to Cloudinary
export const processImageUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(dataURI, 'portfolio');

    // Add Cloudinary result to request
    req.cloudinaryResult = result;
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to process icon upload
export const processIconUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary with specific folder for icons
    const result = await uploadToCloudinary(dataURI, 'portfolio/icons');

    // Add Cloudinary result to request
    req.iconResult = result;
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to process multiple image uploads
export const processImagesUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      return await uploadToCloudinary(dataURI, 'portfolio');
    });

    const results = await Promise.all(uploadPromises);
    req.cloudinaryResults = results;
    
    next();
  } catch (error) {
    next(error);
  }
};
