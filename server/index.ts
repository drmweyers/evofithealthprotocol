import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { 
  securityHeaders, 
  generalRateLimit, 
  sanitizeInput, 
  detectSuspiciousActivity 
} from './middleware/security';

// Import routes
import authRoutes from './authRoutes';
import trainerRoutes from './routes/trainerRoutes';
import pdfRoutes from './routes/pdf';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';
import customerRoutes from './routes/customerRoutes';
import profileRoutes from './routes/profileRoutes';
import progressRoutes from './routes/progressRoutes';
import passwordRoutes from './passwordRoutes';
import invitationRoutes from './invitationRoutes';
import specializedRoutes from './routes/specializedRoutes';
import protocolRoutes from './routes/protocolRoutes';

// Load environment variables
dotenv.config();

// Using import.meta.dirname for ES modules in Node.js 20+

const app = express();
const PORT = parseInt(process.env.PORT || '3501', 10);

// Security middleware - MUST be first
app.use(securityHeaders);
app.use(detectSuspiciousActivity);
app.use(generalRateLimit);

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3500', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware with security limits
app.use(express.json({ 
  limit: '500kb'
}));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// For now, cookies will be handled manually in auth routes
// TODO: Add cookie-parser after Docker rebuild

// Input sanitization - MUST be after body parsing
app.use(sanitizeInput);

// Debug: Log all incoming requests
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Health check routes - must be BEFORE ViteExpress middleware
app.use('/', healthRoutes);

console.log('✅ Health routes registered');

// API Routes - MUST be defined BEFORE ViteExpress middleware
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');

app.use('/api/password', passwordRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/specialized', specializedRoutes);
app.use('/api/protocols', protocolRoutes);

console.log('✅ All API routes registered');
console.log('✅ Protocol optimization routes registered');

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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from client build directory
  const clientBuildPath = path.join(process.cwd(), 'client', 'dist-evofithealthprotocol');
  app.use(express.static(clientBuildPath));
  
  // Handle client-side routing - send index.html for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next(); // Let API routes handle this
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Health Protocol Production Server running on port ${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  });
} else {
  // Development mode - import Vite integration for STORY-007 testing
  import('./vite.js').then(({ setupVite }) => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Health Protocol Server with Frontend running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔧 Development mode with Vite integration for testing`);
      console.log(`✅ API routes and frontend serving enabled`);
    });
    
    setupVite(app, server).catch(console.error);
  }).catch(() => {
    // Fallback to API-only mode if Vite integration fails
    app.listen(PORT, () => {
      console.log(`🚀 Health Protocol API Server running on http://localhost:${PORT} (Fallback)`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔧 Pure API mode - no frontend serving`);
      console.log(`💬 Frontend should run separately on Vite dev server`);
      console.log(`✅ API routes are working correctly`);
    });
  });
}