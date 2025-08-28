/**
 * EvoFit Health Protocol API Routes
 * 
 * This file defines all API endpoints for the EvoFit Health Protocol application.
 * Routes are organized by functionality: authentication, health protocols,
 * admin operations, and progress tracking.
 * 
 * Security Model:
 * - Public routes: Basic application info
 * - Authenticated routes: Health protocol generation, user profile, progress tracking
 * - Admin routes: User management, analytics
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRouter from "./authRoutes";
import { requireAuth, requireRole } from "./middleware/auth";
import passwordRouter from "./passwordRoutes";
import invitationRouter from "./invitationRoutes";
import adminRouter from "./routes/adminRoutes";
import trainerRouter from "./routes/trainerRoutes";
import customerRouter from "./routes/customerRoutes";
import profileRouter from "./routes/profileRoutes";
import progressRouter from "./routes/progressRoutes";
import pdfRouter from "./routes/pdf";
import specializedRouter from "./routes/specializedRoutes";
import protocolTemplateRoutes from "./routes/protocolTemplateRoutes";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Register all API routes and middleware
 * 
 * Sets up authentication, defines all endpoints, and returns the HTTP server.
 * Routes are processed in order, so authentication must be set up first.
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication and core routes
  app.use('/api/auth', authRouter);
  app.use('/api/password', passwordRouter);
  app.use('/api/invitations', invitationRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/trainer', trainerRouter);
  app.use('/api/customer', customerRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/pdf', pdfRouter);
  app.use('/api/specialized', specializedRouter);
  app.use('/api/protocol-templates', protocolTemplateRoutes);

  /**
   * Public Health Info Routes
   * 
   * Basic application information accessible without authentication.
   */
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'EvoFit Health Protocol API'
    });
  });

  // Application info endpoint  
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'EvoFit Health Protocol',
      version: process.env.npm_package_version || '1.0.0',
      description: 'Specialized health protocols for longevity and parasite cleanse programs'
    });
  });

  // Handle 404 for removed meal plan endpoints
  app.all('/api/recipes*', (req, res) => {
    res.status(404).json({ 
      message: 'Recipe endpoints have been removed. This application now focuses on health protocols.' 
    });
  });

  app.all('/api/meal-plan*', (req, res) => {
    res.status(404).json({ 
      message: 'Meal plan endpoints have been removed. This application now focuses on health protocols.' 
    });
  });

  app.all('/api/generate-meal-plan*', (req, res) => {
    res.status(404).json({ 
      message: 'Meal plan generation has been removed. This application now focuses on health protocols.' 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
