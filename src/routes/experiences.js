import express from 'express';
import { body, validationResult } from 'express-validator';
import Experience from '../models/Experience.js';
import { protect } from '../middleware/auth.js';
import { uploadIcon, processIconUpload } from '../middleware/upload.js';
import multer from 'multer';

const router = express.Router();


// @desc    Get all experiences
// @route   GET /api/experiences
// @access  Public
router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find({ isPublished: true })
      .sort({ startDate: -1 });

    res.json({
      success: true,
      data: experiences
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get experience by ID
// @route   GET /api/experiences/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const experience = await Experience.findOne({ 
      _id: req.params.id, 
      isPublished: true 
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    res.json({
      success: true,
      data: experience
    });
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new experience
// @route   POST /api/experiences
// @access  Private
router.post('/', protect, uploadIcon, processIconUpload, [
  body('company')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name is required and cannot exceed 100 characters'),
  body('role')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Role is required and cannot exceed 100 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('description')
    .isArray({ min: 1 })
    .withMessage('At least one description point is required'),
  body('tech')
    .optional()
    .isArray()
    .withMessage('Tech must be an array'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Color cannot exceed 50 characters'),
  body('type')
    .optional()
    .isIn(['work', 'training', 'education', 'internship'])
    .withMessage('Type must be one of: work, training, education, internship'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('isCurrent')
    .optional()
    .isBoolean()
    .withMessage('isCurrent must be a boolean')
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
      company,
      role,
      startDate,
      endDate,
      description,
      tech,
      location,
      color,
      type,
      achievements,
      isCurrent
    } = req.body;

    // Prepare icon data
    let iconData = null;
    if (req.iconResult) {
      iconData = {
        url: req.iconResult.secure_url,
        public_id: req.iconResult.public_id
      };
    }

    // Create experience
    const experience = await Experience.create({
      company,
      role,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description: Array.isArray(description) ? description : (typeof description === 'string' ? JSON.parse(description) : [description]),
      tech: tech ? (Array.isArray(tech) ? tech : (typeof tech === 'string' ? JSON.parse(tech) : [tech])) : [],
      location: location || '',
      icon: iconData,
      color: color || 'from-blue-500 to-cyan-500',
      type: type || 'work',
      achievements: achievements ? (Array.isArray(achievements) ? achievements : (typeof achievements === 'string' ? JSON.parse(achievements) : [achievements])) : [],
      isCurrent: isCurrent === 'true' || isCurrent === true
    });

    res.status(201).json({
      success: true,
      data: experience
    });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update experience
// @route   PUT /api/experiences/:id
// @access  Private
router.put('/:id', protect, uploadIcon, processIconUpload, [
  body('company')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('role')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Role cannot exceed 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('description')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one description point is required'),
  body('tech')
    .optional()
    .isArray()
    .withMessage('Tech must be an array'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Color cannot exceed 50 characters'),
  body('type')
    .optional()
    .isIn(['work', 'training', 'education', 'internship'])
    .withMessage('Type must be one of: work, training, education, internship'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('isCurrent')
    .optional()
    .isBoolean()
    .withMessage('isCurrent must be a boolean')
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

    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle icon upload
    if (req.iconResult) {
      updateData.icon = {
        url: req.iconResult.secure_url,
        public_id: req.iconResult.public_id
      };
    }
    
    // Handle parsed JSON fields
    if (req.body.description) {
      try {
        updateData.description = Array.isArray(req.body.description) 
          ? req.body.description 
          : JSON.parse(req.body.description);
      } catch (error) {
        console.error('Error parsing description:', error);
        updateData.description = [req.body.description];
      }
    }
    if (req.body.tech) {
      try {
        updateData.tech = Array.isArray(req.body.tech) 
          ? req.body.tech 
          : JSON.parse(req.body.tech);
      } catch (error) {
        console.error('Error parsing tech:', error);
        updateData.tech = [req.body.tech];
      }
    }
    if (req.body.achievements) {
      try {
        updateData.achievements = Array.isArray(req.body.achievements) 
          ? req.body.achievements 
          : JSON.parse(req.body.achievements);
      } catch (error) {
        console.error('Error parsing achievements:', error);
        updateData.achievements = [req.body.achievements];
      }
    }
    if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
    if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
    if (req.body.isCurrent !== undefined) updateData.isCurrent = req.body.isCurrent === 'true' || req.body.isCurrent === true;

    // Update experience
    const updatedExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedExperience
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete experience
// @route   DELETE /api/experiences/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    await Experience.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
