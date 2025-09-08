import app from '../src/server.js';

// Vercel serverless function handler
export default function handler(req, res) {
  return app(req, res);
}

// Export the app for potential direct usage
export { default as app } from '../src/server.js';