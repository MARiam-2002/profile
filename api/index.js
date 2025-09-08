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
    return res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
}

// Export the app for potential direct usage
export { default as app } from '../src/server.js';