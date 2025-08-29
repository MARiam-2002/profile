import mongoose from 'mongoose';

const socialSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: [true, 'Platform name is required'],
    trim: true,
    maxlength: [50, 'Platform name cannot be more than 50 characters']
  },
  url: {
    type: String,
    required: [true, 'Social media URL is required'],
    trim: true,
    maxlength: [500, 'URL cannot be more than 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true,
    maxlength: [100, 'Icon name cannot be more than 100 characters']
  },
  color: {
    type: String,
    trim: true,
    default: '#899F87'
  },
  isActive: {
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
socialSchema.index({ platform: 1 });
socialSchema.index({ isActive: 1 });
socialSchema.index({ order: 1 });

const Social = mongoose.model('Social', socialSchema);

export default Social;
