import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { uploadImage, processImageUpload } from '../middleware/upload.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users
// @access  Public
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ isActive: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot be more than 20 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot be more than 100 characters')
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

    const { name, email, phone, bio, location } = req.body;

    // Check if user exists
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is updating their own profile
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || user.name,
        email: email || user.email,
        phone: phone !== undefined ? phone : user.phone,
        bio: bio !== undefined ? bio : user.bio,
        location: location !== undefined ? location : user.location
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
router.post('/upload-avatar', protect, uploadImage, processImageUpload, async (req, res) => {
  try {
    if (!req.cloudinaryResult) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.profilePicture.public_id) {
      try {
        await deleteFromCloudinary(user.profilePicture.public_id);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Update user with new avatar
    user.profilePicture = {
      url: req.cloudinaryResult.url,
      public_id: req.cloudinaryResult.public_id
    };

    await user.save();

    res.json({
      success: true,
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user avatar
// @route   DELETE /api/users/delete-avatar
// @access  Private
router.delete('/delete-avatar', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete avatar from Cloudinary if exists
    if (user.profilePicture.public_id) {
      try {
        await deleteFromCloudinary(user.profilePicture.public_id);
      } catch (error) {
        console.error('Error deleting avatar from Cloudinary:', error);
      }
    }

    // Clear avatar from user
    user.profilePicture = {
      url: '',
      public_id: ''
    };

    await user.save();

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
