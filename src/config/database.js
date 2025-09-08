import mongoose from 'mongoose';

// Track connection state for serverless environments
let isConnected = false;

export const connectDB = async () => {
  // If already connected, return early
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('📦 Using existing MongoDB connection');
    return;
  }

  try {
    // Check if MONGODB_URI is available
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('📦 Connecting to MongoDB...');
    
    // Configure mongoose for serverless environment
    const options = {
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0,   // Disable mongoose buffering
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5,  // Maintain a minimum of 5 socket connections
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    isConnected = true;

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events for serverless
    mongoose.connection.on('connected', () => {
      console.log('📦 MongoDB connected');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
      isConnected = false;
    });

    return conn;

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    isConnected = false;
    throw error; // Re-throw to let the calling function handle it
  }
};
