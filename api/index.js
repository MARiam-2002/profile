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
      error: errorMessage, // Always show error for now to debug
      debug: {
        mongoUriExists: !!process.env.MONGODB_URI,
        mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'Not set',
        nodeEnv: process.env.NODE_ENV,
        errorType: error.name,
        errorStack: error.stack?.split('\n')[0] // First line of stack trace
      }
    });
  }
}

// Export the app for potential direct usage
export { default as app } from '../src/server.js';