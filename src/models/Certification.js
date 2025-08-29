import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Certification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  issuer: {
    type: String,
    required: [true, 'Issuer name is required'],
    trim: true,
    maxlength: [100, 'Issuer name cannot be more than 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Certification date is required']
  },
  credentialUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Credential URL cannot be more than 500 characters']
  },
  logo: {
    url: {
      type: String,
      trim: true
    },
    public_id: {
      type: String,
      trim: true
    }
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
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
certificationSchema.index({ date: -1 });
certificationSchema.index({ issuer: 1 });
certificationSchema.index({ isPublished: 1 });
certificationSchema.index({ order: 1 });

const Certification = mongoose.model('Certification', certificationSchema);

export default Certification;
