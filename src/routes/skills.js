import express from 'express';
import { body, validationResult } from 'express-validator';
import Skill from '../models/Skill.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find({ isPublished: true })
      .sort({ category: 1, order: 1 });

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedSkills
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get skills by category
// @route   GET /api/skills/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const skills = await Skill.find({ 
      category: req.params.category,
      isPublished: true 
    }).sort({ order: 1, level: -1 });

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('Get skills by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get skill by ID
// @route   GET /api/skills/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findOne({ 
      _id: req.params.id, 
      isPublished: true 
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private
router.post('/', protect, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name is required and cannot exceed 50 characters'),
  body('category')
    .isIn(['Languages', 'Frameworks', 'Tools', 'Databases', 'Other'])
    .withMessage('Category must be Languages, Frameworks, Tools, Databases, or Other'),
  body('level')
    .isInt({ min: 1, max: 100 })
    .withMessage('Level must be between 1 and 100'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Icon name cannot exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 7 })
    .withMessage('Color must be a valid hex color'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
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
      name,
      category,
      level,
      icon,
      color,
      description,
      order
    } = req.body;

    // Create skill
    const skill = await Skill.create({
      name,
      category,
      level: parseInt(level),
      icon: icon || '',
      color: color || '#899F87',
      description: description || '',
      order: order ? parseInt(order) : 0
    });

    res.status(201).json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private
router.put('/:id', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name cannot exceed 50 characters'),
  body('category')
    .optional()
    .isIn(['Languages', 'Frameworks', 'Tools', 'Databases', 'Other'])
    .withMessage('Category must be Languages, Frameworks, Tools, Databases, or Other'),
  body('level')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Level must be between 1 and 100'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Icon name cannot exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 7 })
    .withMessage('Color must be a valid hex color'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
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

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle numeric fields
    if (req.body.level) updateData.level = parseInt(req.body.level);
    if (req.body.order) updateData.order = parseInt(req.body.order);

    // Update skill
    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedSkill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await Skill.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update skills order
// @route   PUT /api/skills/order
// @access  Private
router.put('/order', protect, [
  body('skills')
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*.id')
    .isMongoId()
    .withMessage('Invalid skill ID'),
  body('skills.*.order')
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

    const { skills } = req.body;

    // Update skills order
    const updatePromises = skills.map(skill => 
      Skill.findByIdAndUpdate(skill.id, { order: skill.order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Skills order updated successfully'
    });
  } catch (error) {
    console.error('Update skills order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
