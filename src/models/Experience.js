import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Job role is required'],
    trim: true,
    maxlength: [100, 'Role cannot be more than 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    default: null // null means current position
  },
  description: [{
    type: String,
    required: [true, 'At least one description point is required'],
    trim: true,
    maxlength: [300, 'Description point cannot be more than 300 characters']
  }],
  tech: [{
    type: String,
    trim: true,
    maxlength: [50, 'Technology name cannot be more than 50 characters']
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for duration
experienceSchema.virtual('duration').get(function() {
  const start = this.startDate;
  const end = this.endDate || new Date();
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  if (diffYears > 0) {
    const remainingMonths = diffMonths % 12;
    return `${diffYears} year${diffYears > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  } else {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
});

// Ensure virtual fields are serialized
experienceSchema.set('toJSON', { virtuals: true });

// Index for better query performance
experienceSchema.index({ startDate: -1 });
experienceSchema.index({ isCurrent: 1 });
experienceSchema.index({ isPublished: 1 });

const Experience = mongoose.model('Experience', experienceSchema);

export default Experience;
