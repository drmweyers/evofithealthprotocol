/**
 * PDF Export Routes
 * 
 * Handles PDF generation for health protocols using Puppeteer
 * Protected routes requiring trainer or admin authentication
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { exportPdfController } from '../controllers/exportPdfController';

const pdfRouter = Router();

/**
 * POST /api/pdf/export
 * Export health protocol to PDF
 * 
 * Body: { protocolData: Protocol, customerName?: string, options?: ExportOptions }
 * Returns: PDF file stream
 */
pdfRouter.post('/export', requireAuth, (req, res, next) => {
  const userRole = (req as any).user?.role;
  if (userRole === 'trainer' || userRole === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    status: 'error',
    message: 'Insufficient permissions',
    code: 'FORBIDDEN'
  });
}, exportPdfController);

/**
 * POST /api/pdf/test-export
 * Test PDF export without authentication (for development only)
 * 
 * Body: { protocolData: Protocol, customerName?: string, options?: ExportOptions }
 * Returns: PDF file stream
 */
pdfRouter.post('/test-export', exportPdfController);

export default pdfRouter;