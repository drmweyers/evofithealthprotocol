/**
 * PDF Validation Utilities
 * 
 * Validates and sanitizes health protocol data for PDF generation
 */

import { z } from 'zod';

// Health protocol validation schema
const protocolSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Protocol name is required'),
  description: z.string().optional().default(''),
  type: z.enum(['longevity', 'parasite_cleanse']),
  duration: z.string().min(1, 'Duration is required'),
  supplements: z.array(z.object({
    name: z.string().min(1, 'Supplement name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    timing: z.string().min(1, 'Timing is required'),
    notes: z.string().optional().default('')
  })),
  guidelines: z.array(z.object({
    category: z.string().min(1, 'Category is required'),
    instruction: z.string().min(1, 'Instruction is required'),
    importance: z.enum(['low', 'medium', 'high']).optional().default('medium')
  })),
  precautions: z.array(z.string()).optional().default([]),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

/**
 * Validates health protocol data for PDF generation
 */
export function validateProtocolForPDF(protocolData: any) {
  try {
    return protocolSchema.parse(protocolData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Protocol validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Sanitizes text for PDF generation
 */
export function sanitizeForPDF(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Validates and sanitizes protocol name
 */
export function validateProtocolName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Protocol name is required');
  }
  
  const sanitized = sanitizeForPDF(name);
  if (sanitized.length === 0) {
    throw new Error('Protocol name cannot be empty');
  }
  
  if (sanitized.length > 100) {
    throw new Error('Protocol name is too long (max 100 characters)');
  }
  
  return sanitized;
}

/**
 * Validates protocol type
 */
export function validateProtocolType(type: string): string {
  const validTypes = ['longevity', 'parasite_cleanse'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid protocol type. Must be one of: ${validTypes.join(', ')}`);
  }
  return type;
}

export { protocolSchema };