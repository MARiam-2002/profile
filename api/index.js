import app from '../src/server.js';

// Vercel serverless function handler
export default function handler(req, res) {
  return app(req, res);
}
