import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';
import { uploadImage, uploadImages, processImageUpload, processImagesUpload } from '../middleware/upload.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      year, 
      tech, 
      featured,
      search 
    } = req.query;

    // Build query
    const query = { isPublished: true };

    if (type) query.type = type;
    if (year) query.year = parseInt(year);
    if (tech) query.techStack = { $in: [tech] };
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const projects = await Project.find({ 
      isFeatured: true, 
      isPublished: true 
    }).sort({ createdAt: -1 }).limit(6);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get featured projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get project by slug
// @route   GET /api/projects/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, uploadImage, processImageUpload, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and cannot exceed 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and cannot exceed 1000 characters'),
  body('techStack')
    .isArray({ min: 1 })
    .withMessage('At least one technology is required'),
  body('role')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Role is required and cannot exceed 100 characters'),
  body('year')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be between 2000 and current year'),
  body('type')
    .isIn(['mobile', 'web', 'desktop', 'other'])
    .withMessage('Type must be mobile, web, desktop, or other'),
  body('features')
    .isArray({ min: 1 })
    .withMessage('At least one feature is required')
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

    if (!req.cloudinaryResult) {
      return res.status(400).json({
        success: false,
        message: 'Project cover image is required'
      });
    }

    const {
      title,
      description,
      techStack,
      role,
      year,
      type,
      features,
      links,
      stats,
      caseStudy,
      isFeatured
    } = req.body;

    // Create project
    const project = await Project.create({
      title,
      description,
      cover: {
        url: req.cloudinaryResult.url,
        public_id: req.cloudinaryResult.public_id
      },
      techStack: JSON.parse(techStack),
      role,
      year: parseInt(year),
      type,
      features: JSON.parse(features),
      links: links ? JSON.parse(links) : {},
      stats: stats ? JSON.parse(stats) : {},
      caseStudy: caseStudy ? JSON.parse(caseStudy) : {},
      isFeatured: isFeatured === 'true'
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', protect, uploadImage, processImageUpload, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('techStack')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one technology is required'),
  body('role')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Role cannot exceed 100 characters'),
  body('year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be between 2000 and current year'),
  body('type')
    .optional()
    .isIn(['mobile', 'web', 'desktop', 'other'])
    .withMessage('Type must be mobile, web, desktop, or other'),
  body('features')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one feature is required')
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

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle parsed JSON fields
    if (req.body.techStack) updateData.techStack = JSON.parse(req.body.techStack);
    if (req.body.features) updateData.features = JSON.parse(req.body.features);
    if (req.body.links) updateData.links = JSON.parse(req.body.links);
    if (req.body.stats) updateData.stats = JSON.parse(req.body.stats);
    if (req.body.caseStudy) updateData.caseStudy = JSON.parse(req.body.caseStudy);
    if (req.body.year) updateData.year = parseInt(req.body.year);
    if (req.body.isFeatured !== undefined) updateData.isFeatured = req.body.isFeatured === 'true';

    // Handle new cover image
    if (req.cloudinaryResult) {
      // Delete old cover from Cloudinary
      if (project.cover.public_id) {
        try {
          await deleteFromCloudinary(project.cover.public_id);
        } catch (error) {
          console.error('Error deleting old cover:', error);
        }
      }
      
      updateData.cover = {
        url: req.cloudinaryResult.url,
        public_id: req.cloudinaryResult.public_id
      };
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete cover image from Cloudinary
    if (project.cover.public_id) {
      try {
        await deleteFromCloudinary(project.cover.public_id);
      } catch (error) {
        console.error('Error deleting cover from Cloudinary:', error);
      }
    }

    // Delete gallery images from Cloudinary
    for (const image of project.gallery) {
      if (image.public_id) {
        try {
          await deleteFromCloudinary(image.public_id);
        } catch (error) {
          console.error('Error deleting gallery image from Cloudinary:', error);
        }
      }
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Upload project gallery images
// @route   POST /api/projects/:id/gallery
// @access  Private
router.post('/:id/gallery', protect, uploadImages, processImagesUpload, async (req, res) => {
  try {
    if (!req.cloudinaryResults || req.cloudinaryResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Add new images to gallery
    const newImages = req.cloudinaryResults.map(result => ({
      url: result.url,
      public_id: result.public_id,
      caption: ''
    }));

    project.gallery.push(...newImages);
    await project.save();

    res.json({
      success: true,
      data: {
        gallery: project.gallery
      }
    });
  } catch (error) {
    console.error('Upload gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete gallery image
// @route   DELETE /api/projects/:id/gallery/:imageId
// @access  Private
router.delete('/:id/gallery/:imageId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const imageIndex = project.gallery.findIndex(
      img => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete image from Cloudinary
    const image = project.gallery[imageIndex];
    if (image.public_id) {
      try {
        await deleteFromCloudinary(image.public_id);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    // Remove image from gallery
    project.gallery.splice(imageIndex, 1);
    await project.save();

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
