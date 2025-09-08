import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';
import { uploadImage, uploadImages, processImageUpload, processImagesUpload } from '../middleware/upload.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// دالة لتبسيط البيانات - تقبل قوائم بسيطة وتحولها للشكل المطلوب
const simplifyData = (data) => {
  if (!data) return [];
  
  // إذا كانت مصفوفة بالفعل، ارجعها كما هي
  if (Array.isArray(data)) return data;
  
  // إذا كانت نص، حاول تحليله كـ JSON
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      // إذا فشل، عالجها كقائمة بسيطة
      const items = data.split(',').map(item => item.trim()).filter(Boolean);
      return items.map(item => ({
        key: item.toLowerCase().replace(/\s+/g, '-'),
        name: item,
        icon: 'check',
        category: 'other',
        isActive: true
      }));
    }
  }
  
  return [];
};

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('📋 GET /api/projects - Starting request');
    
    const { 
      page = 1, 
      limit = 10, 
      type, 
      year, 
      tech, 
      featured,
      search 
    } = req.query;

    console.log('📋 Query parameters:', { page, limit, type, year, tech, featured, search });

    // Build query
    const query = { isPublished: true };

    if (type) query.type = type;
    if (year) query.year = parseInt(year);
    if (tech) query['techStack.name'] = { $regex: tech, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('📋 Database query:', query);

    // Execute query with pagination
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    console.log('📋 Found projects:', projects.length);

    // Get total count
    const total = await Project.countDocuments(query);

    console.log('📋 Total projects:', total);

    const response = {
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    };

    console.log('📋 Sending response:', JSON.stringify(response, null, 2));
    
    res.json(response);
  } catch (error) {
    console.error('❌ Get projects error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
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

// @desc    Get project by ID
// @route   GET /api/projects/id/:id
// @access  Public
router.get('/id/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
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
    console.error('Get project by ID error:', error);
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
router.post('/', protect, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and cannot exceed 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and cannot exceed 1000 characters'),
  body('techStack')
    .custom(value => {
      try {
        // تحقق مما إذا كانت القيمة مصفوفة بالفعل
        if (Array.isArray(value)) return true;
        
        // محاولة تحليل القيمة كـ JSON
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length >= 1;
      } catch (error) {
        // محاولة تحليل القيمة كنص عادي
        if (typeof value === 'string') {
          // إزالة الاقتباسات الخارجية إذا وجدت
          const cleanValue = value.trim().replace(/^\[|\]$/g, '');
          // تقسيم النص إلى مصفوفة
          const items = cleanValue.split(',').map(item => 
            item.trim().replace(/^['"]|['"]$/g, '')
          ).filter(Boolean);
          return items.length >= 1;
        }
        return false;
      }
    })
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
    .custom(value => {
      try {
        // تحقق مما إذا كانت القيمة مصفوفة بالفعل
        if (Array.isArray(value)) return true;
        
        // محاولة تحليل القيمة كـ JSON
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length >= 1;
      } catch (error) {
        // محاولة تحليل القيمة كنص عادي
        if (typeof value === 'string') {
          // إزالة الاقتباسات الخارجية إذا وجدت
          const cleanValue = value.trim().replace(/^\[|\]$/g, '');
          // تقسيم النص إلى مصفوفة
          const items = cleanValue.split(',').map(item => 
            item.trim().replace(/^['"]|['"]$/g, '')
          ).filter(Boolean);
          return items.length >= 1;
        }
        return false;
      }
    })
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

    // Cover image is optional now
    let coverData = null;
    if (req.cloudinaryResult) {
      coverData = {
        url: req.cloudinaryResult.url,
        public_id: req.cloudinaryResult.public_id
      };
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

    // معالجة حقل techStack - مبسطة
    const parsedTechStack = simplifyData(techStack);

    // معالجة حقل features - مبسطة
    const parsedFeatures = simplifyData(features);

    // معالجة حقل links - مبسطة
    let parsedLinks = [];
    if (links) {
      if (Array.isArray(links)) {
        parsedLinks = links;
      } else if (typeof links === 'object') {
        // تحويل النموذج القديم (object) إلى الجديد (array)
        parsedLinks = Object.entries(links).map(([key, url]) => ({
          key,
          url,
          title: key.charAt(0).toUpperCase() + key.slice(1),
          description: `Link to ${key}`,
          icon: key === 'github' ? 'github' : 'external-link',
          isActive: true
        }));
      } else {
        try {
          parsedLinks = JSON.parse(links);
        } catch (error) {
          console.error('Error parsing links:', error);
        }
      }
    }

    // معالجة stats - مبسطة
    let parsedStats = {};
    if (stats) {
      if (typeof stats === 'object') {
        parsedStats = stats;
      } else {
        try {
          parsedStats = JSON.parse(stats);
        } catch (error) {
          // إذا فشل، استخدم قيم افتراضية
          parsedStats = { downloads: 0, rating: 0, users: 0 };
        }
      }
    }

    // معالجة caseStudy - مبسطة
    let parsedCaseStudy = {};
    if (caseStudy) {
      if (typeof caseStudy === 'object') {
        parsedCaseStudy = caseStudy;
      } else {
        try {
          parsedCaseStudy = JSON.parse(caseStudy);
        } catch (error) {
          // إذا فشل، استخدم قيم افتراضية
          parsedCaseStudy = { challenges: [] };
        }
      }
    }

    // Create project
    const projectData = {
      title,
      description,
      techStack: parsedTechStack,
      role,
      year: parseInt(year),
      type,
      features: parsedFeatures,
      links: parsedLinks,
      stats: parsedStats,
      caseStudy: parsedCaseStudy,
      isFeatured: isFeatured === 'true'
    };

    // Add cover only if provided
    if (coverData) {
      projectData.cover = coverData;
    }

    const project = await Project.create(projectData);

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
    .custom(value => {
      if (!value) return true; // إذا كانت القيمة غير موجودة، فهي اختيارية
      try {
        // تحقق مما إذا كانت القيمة مصفوفة بالفعل
        if (Array.isArray(value)) return value.length >= 1;
        
        // محاولة تحليل القيمة كـ JSON
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length >= 1;
      } catch (error) {
        // محاولة تحليل القيمة كنص عادي
        if (typeof value === 'string') {
          // إزالة الاقتباسات الخارجية إذا وجدت
          const cleanValue = value.trim().replace(/^\[|\]$/g, '');
          // تقسيم النص إلى مصفوفة
          const items = cleanValue.split(',').map(item => 
            item.trim().replace(/^['"]|['"]$/g, '')
          ).filter(Boolean);
          return items.length >= 1;
        }
        return false;
      }
    })
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
    .custom(value => {
      if (!value) return true; // إذا كانت القيمة غير موجودة، فهي اختيارية
      try {
        // تحقق مما إذا كانت القيمة مصفوفة بالفعل
        if (Array.isArray(value)) return value.length >= 1;
        
        // محاولة تحليل القيمة كـ JSON
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length >= 1;
      } catch (error) {
        // محاولة تحليل القيمة كنص عادي
        if (typeof value === 'string') {
          // إزالة الاقتباسات الخارجية إذا وجدت
          const cleanValue = value.trim().replace(/^\[|\]$/g, '');
          // تقسيم النص إلى مصفوفة
          const items = cleanValue.split(',').map(item => 
            item.trim().replace(/^['"]|['"]$/g, '')
          ).filter(Boolean);
          return items.length >= 1;
        }
        return false;
      }
    })
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
    
    // معالجة حقل techStack - النموذج الجديد
    if (req.body.techStack) {
      let parsedTechStack = [];
      try {
        if (Array.isArray(req.body.techStack)) {
          parsedTechStack = req.body.techStack;
        } else {
          parsedTechStack = JSON.parse(req.body.techStack);
        }
      } catch (error) {
        // إذا فشل التحليل كـ JSON، نعالجه كنص عادي (للتوافق مع النموذج القديم)
        if (typeof req.body.techStack === 'string') {
          const cleanValue = req.body.techStack.trim().replace(/^\[|\]$/g, '');
          const items = cleanValue.split(',').map(item => 
            item.trim().replace(/^['"]|['"]$/g, '')
          ).filter(Boolean);
          // تحويل النموذج القديم إلى الجديد
          parsedTechStack = items.map(item => ({
            key: item.toLowerCase().replace(/\s+/g, '-'),
            name: item,
            icon: `devicon-${item.toLowerCase().replace(/\s+/g, '-')}-plain`,
            color: '#4285F4',
            category: 'other',
            version: '1.x',
            isActive: true
          }));
        }
      }
      updateData.techStack = parsedTechStack;
    }
    
    // معالجة حقل features - النموذج الجديد
    if (req.body.features) {
      let parsedFeatures = [];
      try {
        if (Array.isArray(req.body.features)) {
          parsedFeatures = req.body.features;
        } else {
          parsedFeatures = JSON.parse(req.body.features);
        }
      } catch (error) {
        // إذا فشل التحليل كـ JSON، نعالجه كنص عادي (للتوافق مع النموذج القديم)
        if (typeof req.body.features === 'string') {
          const cleanValue = req.body.features.trim().replace(/^\[|\]$/g, '');
          const items = cleanValue.split(',').map(item => 
            item.trim().replace(/^['"]|['"]$/g, '')
          ).filter(Boolean);
          // تحويل النموذج القديم إلى الجديد
          parsedFeatures = items.map(item => ({
            key: item.toLowerCase().replace(/\s+/g, '-'),
            title: item,
            description: item,
            icon: 'check',
            category: 'core',
            isHighlighted: false,
            isActive: true
          }));
        }
      }
      updateData.features = parsedFeatures;
    }
    
    // معالجة حقل links - النموذج الجديد
    if (req.body.links) {
      try {
        if (Array.isArray(req.body.links)) {
          updateData.links = req.body.links;
        } else if (typeof req.body.links === 'object') {
          // تحويل النموذج القديم (object) إلى الجديد (array)
          updateData.links = Object.entries(req.body.links).map(([key, url]) => ({
            key,
            url,
            title: key.charAt(0).toUpperCase() + key.slice(1),
            description: `Link to ${key}`,
            icon: key === 'github' ? 'github' : 'external-link',
            isActive: true
          }));
        } else {
          updateData.links = JSON.parse(req.body.links);
        }
      } catch (error) {
        console.error('Error parsing links:', error);
      }
    }
    
    if (req.body.stats) {
      try {
        updateData.stats = typeof req.body.stats === 'object' ? req.body.stats : JSON.parse(req.body.stats);
      } catch (error) {
        console.error('Error parsing stats:', error);
      }
    }
    
    if (req.body.caseStudy) {
      try {
        updateData.caseStudy = typeof req.body.caseStudy === 'object' ? req.body.caseStudy : JSON.parse(req.body.caseStudy);
      } catch (error) {
        console.error('Error parsing caseStudy:', error);
      }
    }
    
    if (req.body.year) updateData.year = parseInt(req.body.year);
    if (req.body.isFeatured !== undefined) updateData.isFeatured = req.body.isFeatured === 'true';

    // Handle new cover image
    if (req.cloudinaryResult) {
      // Delete old cover from Cloudinary if exists
      if (project.cover && project.cover.public_id) {
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

    // Delete cover image from Cloudinary if exists
    if (project.cover && project.cover.public_id) {
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

// @desc    Upload multiple gallery images for a project
// @route   POST /api/projects/:id/gallery
// @access  Private
router.post('/:id/gallery', protect, uploadImages, processImagesUpload, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!req.cloudinaryResults || req.cloudinaryResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
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
      message: `${newImages.length} images uploaded successfully`,
      data: {
        gallery: project.gallery
      }
    });
  } catch (error) {
    console.error('Upload gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update gallery image caption
// @route   PUT /api/projects/:projectId/gallery/:imageId
// @access  Private
router.put('/:projectId/gallery/:imageId', protect, [
  body('caption')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Caption cannot exceed 200 characters')
], async (req, res) => {
  try {
    const { caption } = req.body;
    
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const imageIndex = project.gallery.findIndex(img => img._id.toString() === req.params.imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }

    // Update caption
    project.gallery[imageIndex].caption = caption || '';
    await project.save();

    res.json({
      success: true,
      message: 'Image caption updated successfully',
      data: {
        image: project.gallery[imageIndex]
      }
    });
  } catch (error) {
    console.error('Update image caption error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Reorder gallery images
// @route   PUT /api/projects/:id/gallery/reorder
// @access  Private
router.put('/:id/gallery/reorder', protect, [
  body('imageIds')
    .isArray()
    .withMessage('Image IDs must be an array')
], async (req, res) => {
  try {
    const { imageIds } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Reorder gallery based on provided order
    const reorderedGallery = [];
    for (const imageId of imageIds) {
      const image = project.gallery.find(img => img._id.toString() === imageId);
      if (image) {
        reorderedGallery.push(image);
      }
    }

    project.gallery = reorderedGallery;
    await project.save();

    res.json({
      success: true,
      message: 'Gallery reordered successfully',
      data: {
        gallery: project.gallery
      }
    });
  } catch (error) {
    console.error('Reorder gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete gallery image
// @route   DELETE /api/projects/:projectId/gallery/:imageId
// @access  Private
router.delete('/:projectId/gallery/:imageId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const imageIndex = project.gallery.findIndex(img => img._id.toString() === req.params.imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
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
      message: 'Gallery image deleted successfully'
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
