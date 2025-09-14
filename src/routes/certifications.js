import express from 'express';
import { body, validationResult } from 'express-validator';
import Certification from '../models/Certification.js';
import { protect } from '../middleware/auth.js';
import { uploadLogo, processImageUpload } from '../middleware/upload.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Get all certifications
// @route   GET /api/certifications
// @access  Public
router.get('/', async (req, res) => {
  try {
    const certifications = await Certification.find({ isPublished: true })
      .sort({ date: -1, order: 1 });

    res.json({
      success: true,
      data: certifications
    });
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get certification by ID
// @route   GET /api/certifications/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const certification = await Certification.findOne({ 
      _id: req.params.id, 
      isPublished: true 
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    res.json({
      success: true,
      data: certification
    });
  } catch (error) {
    console.error('Get certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new certification
// @route   POST /api/certifications
// @access  Private
router.post('/', protect, uploadLogo, processImageUpload, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters'),
  body('issuer')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Issuer is required and cannot exceed 100 characters'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('credentialUrl')
    .optional()
    .isURL()
    .withMessage('Credential URL must be a valid URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      issuer,
      date,
      credentialUrl,
      description,
      order
    } = req.body;

    // Create certification
    const certificationData = {
      title,
      issuer,
      date: new Date(date),
      credentialUrl: credentialUrl || '',
      description: description || '',
      order: order ? parseInt(order) : 0
    };

    // Add logo if uploaded
    if (req.cloudinaryResult) {
      certificationData.logo = {
        url: req.cloudinaryResult.url,
        public_id: req.cloudinaryResult.public_id
      };
    }

    const certification = await Certification.create(certificationData);

    res.status(201).json({
      success: true,
      data: certification
    });
  } catch (error) {
    console.error('Create certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update certification
// @route   PUT /api/certifications/:id
// @access  Private
router.put('/:id', protect, uploadLogo, processImageUpload, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('issuer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Issuer cannot exceed 100 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('credentialUrl')
    .optional()
    .isURL()
    .withMessage('Credential URL must be a valid URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle date field
    if (req.body.date) updateData.date = new Date(req.body.date);
    if (req.body.order) updateData.order = parseInt(req.body.order);

    // Handle new logo
    if (req.cloudinaryResult) {
      // Delete old logo from Cloudinary
      if (certification.logo.public_id) {
        try {
          await deleteFromCloudinary(certification.logo.public_id);
        } catch (error) {
          console.error('Error deleting old logo:', error);
        }
      }
      
      updateData.logo = {
        url: req.cloudinaryResult.url,
        public_id: req.cloudinaryResult.public_id
      };
    }

    // Update certification
    const updatedCertification = await Certification.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCertification
    });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Delete logo from Cloudinary
    if (certification.logo.public_id) {
      try {
        await deleteFromCloudinary(certification.logo.public_id);
      } catch (error) {
        console.error('Error deleting logo from Cloudinary:', error);
      }
    }

    await Certification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
