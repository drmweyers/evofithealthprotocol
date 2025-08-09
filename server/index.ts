import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ViteExpress from 'vite-express';

// Import routes
import authRoutes from './routes/authRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '4001', 10);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:4001', 'http://localhost:5173'],
  credentials: true
}));

// Increase payload size limit for health protocols
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Health Protocol Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Health Protocol Server running on port ${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  });
} else {
  ViteExpress.listen(app, PORT, () => {
    console.log(`🚀 Health Protocol Development Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔧 Vite HMR enabled`);
  });
}