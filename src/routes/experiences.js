import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadIcon, processIconUpload } from '../middleware/upload.js';
import Experience from '../models/Experience.js';

const router = express.Router();

// Form data update route with icon upload - NO JSON parsing
router.put('/:id', protect, uploadIcon, processIconUpload, async (req, res) => {
  try {
    console.log('🔍 Form data update request:', {
      id: req.params.id,
      body: req.body,
      hasFile: !!req.file,
      hasIconResult: !!req.iconResult
    });

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
      console.log('📸 Icon uploaded:', req.iconResult);
      updateData.icon = {
        url: req.iconResult.secure_url,
        public_id: req.iconResult.public_id
      };
    }
    
    // Handle parsed JSON fields for form data
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

    console.log('📝 Update data:', updateData);

    // Update experience
    const updatedExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Experience updated successfully');

    res.json({
      success: true,
      data: updatedExperience
    });
  } catch (error) {
    console.error('Form update experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;
