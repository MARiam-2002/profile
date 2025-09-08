import app from '../src/server.js';
import { connectDB } from '../src/config/database.js';

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Ensure database connection for each request in serverless environment
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Database connection error:', error);
    
    // More detailed error response for debugging
    const errorMessage = error.message || 'Unknown database error';
    const isEnvMissing = !process.env.MONGODB_URI;
    
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage,
      debug: process.env.NODE_ENV === 'production' ? undefined : {
        mongoUriExists: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV,
        errorType: error.name
      }
    });
  }
}

// Export the app for potential direct usage
export { default as app } from '../src/server.js';