import express from 'express';
import { body, validationResult } from 'express-validator';
import Social from '../models/Social.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all social links
// @route   GET /api/socials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const socials = await Social.find({ isActive: true })
      .sort({ order: 1 });

    res.json({
      success: true,
      data: socials
    });
  } catch (error) {
    console.error('Get socials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get social by ID
// @route   GET /api/socials/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const social = await Social.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!social) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }

    res.json({
      success: true,
      data: social
    });
  } catch (error) {
    console.error('Get social error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new social link
// @route   POST /api/socials
// @access  Private
router.post('/', protect, [
  body('platform')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Platform name is required and cannot exceed 50 characters'),
  body('url')
    .isURL()
    .withMessage('URL must be a valid URL'),
  body('icon')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Icon is required and cannot exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 7 })
    .withMessage('Color must be a valid hex color'),
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
      platform,
      url,
      icon,
      color,
      order
    } = req.body;

    // Create social link
    const social = await Social.create({
      platform,
      url,
      icon,
      color: color || '#899F87',
      order: order ? parseInt(order) : 0
    });

    res.status(201).json({
      success: true,
      data: social
    });
  } catch (error) {
    console.error('Create social error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update social link
// @route   PUT /api/socials/:id
// @access  Private
router.put('/:id', protect, [
  body('platform')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Platform name cannot exceed 50 characters'),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL must be a valid URL'),
  body('icon')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Icon cannot exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 7 })
    .withMessage('Color must be a valid hex color'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
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

    const social = await Social.findById(req.params.id);
    if (!social) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle numeric and boolean fields
    if (req.body.order) updateData.order = parseInt(req.body.order);
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true';

    // Update social link
    const updatedSocial = await Social.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedSocial
    });
  } catch (error) {
    console.error('Update social error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete social link
// @route   DELETE /api/socials/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const social = await Social.findById(req.params.id);
    if (!social) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found'
      });
    }

    await Social.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Social link deleted successfully'
    });
  } catch (error) {
    console.error('Delete social error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update social links order
// @route   PUT /api/socials/order
// @access  Private
router.put('/order', protect, [
  body('socials')
    .isArray()
    .withMessage('Socials must be an array'),
  body('socials.*.id')
    .isMongoId()
    .withMessage('Invalid social ID'),
  body('socials.*.order')
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

    const { socials } = req.body;

    // Update socials order
    const updatePromises = socials.map(social => 
      Social.findByIdAndUpdate(social.id, { order: social.order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Social links order updated successfully'
    });
  } catch (error) {
    console.error('Update socials order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
