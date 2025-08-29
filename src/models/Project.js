import mongoose from 'mongoose';
import slugify from 'slugify';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  cover: {
    url: {
      type: String,
      required: [true, 'Project cover image is required']
    },
    public_id: {
      type: String,
      required: [true, 'Project cover public ID is required']
    }
  },
  gallery: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot be more than 200 characters']
    }
  }],
  techStack: [{
    type: String,
    required: [true, 'At least one technology is required'],
    trim: true
  }],
  role: {
    type: String,
    required: [true, 'Project role is required'],
    trim: true,
    maxlength: [100, 'Role cannot be more than 100 characters']
  },
  year: {
    type: Number,
    required: [true, 'Project year is required'],
    min: [2000, 'Year must be after 2000'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  type: {
    type: String,
    required: [true, 'Project type is required'],
    enum: ['mobile', 'web', 'desktop', 'other'],
    default: 'mobile'
  },
  features: [{
    type: String,
    required: [true, 'At least one feature is required'],
    trim: true,
    maxlength: [200, 'Feature cannot be more than 200 characters']
  }],
  links: {
    github: {
      type: String,
      trim: true
    },
    demo: {
      type: String,
      trim: true
    },
    article: {
      type: String,
      trim: true
    },
    store: {
      type: String,
      trim: true
    }
  },
  stats: {
    downloads: {
      type: Number,
      default: 0,
      min: [0, 'Downloads cannot be negative']
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5']
    },
    users: {
      type: Number,
      default: 0,
      min: [0, 'Users cannot be negative']
    }
  },
  caseStudy: {
    problem: {
      type: String,
      maxlength: [1000, 'Problem description cannot be more than 1000 characters']
    },
    solution: {
      type: String,
      maxlength: [1000, 'Solution description cannot be more than 1000 characters']
    },
    architecture: {
      type: String,
      maxlength: [1000, 'Architecture description cannot be more than 1000 characters']
    },
    stateManagement: {
      type: String,
      maxlength: [500, 'State management description cannot be more than 500 characters']
    },
    challenges: [{
      type: String,
      maxlength: [300, 'Challenge description cannot be more than 300 characters']
    }],
    results: {
      type: String,
      maxlength: [1000, 'Results description cannot be more than 1000 characters']
    }
  },
  isFeatured: {
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

// Create slug from title before saving
projectSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    return next();
  }
  
  this.slug = slugify(this.title, { 
    lower: true, 
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  
  next();
});

// Index for better query performance
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ type: 1 });
projectSchema.index({ year: 1 });
projectSchema.index({ techStack: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
