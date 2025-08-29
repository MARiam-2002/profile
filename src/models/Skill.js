import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [50, 'Skill name cannot be more than 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    enum: ['Languages', 'Frameworks', 'Tools', 'Databases', 'Other'],
    default: 'Other'
  },
  level: {
    type: Number,
    required: [true, 'Skill level is required'],
    min: [1, 'Level must be at least 1'],
    max: [100, 'Level cannot be more than 100']
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [100, 'Icon name cannot be more than 100 characters']
  },
  color: {
    type: String,
    trim: true,
    default: '#899F87'
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
skillSchema.index({ category: 1, order: 1 });
skillSchema.index({ isPublished: 1 });
skillSchema.index({ level: -1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
