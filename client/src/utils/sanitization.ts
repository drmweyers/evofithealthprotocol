/**
 * Input Sanitization and Validation Utilities
 * Prevents XSS attacks and validates user input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  // Configure DOMPurify to be strict
  const config = {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content but strip tags
  };
  
  return DOMPurify.sanitize(input, config).trim();
}

/**
 * Sanitize and validate protocol name
 */
export function sanitizeProtocolName(input: string): string {
  // Remove HTML tags and limit length
  const sanitized = sanitizeHTML(input);
  
  // Remove special characters that could cause issues
  const cleaned = sanitized
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 100); // Limit to 100 characters
  
  return cleaned;
}

/**
 * Sanitize and validate description text
 */
export function sanitizeDescription(input: string): string {
  // Remove HTML tags but allow basic formatting
  const sanitized = sanitizeHTML(input);
  
  // Limit length
  return sanitized.substring(0, 1000);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate numeric input
 */
export function validateNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Validate required field
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * Sanitize array of strings (e.g., tags, conditions)
 */
export function sanitizeStringArray(arr: string[]): string[] {
  return arr.map(item => sanitizeHTML(item)).filter(item => item.length > 0);
}

/**
 * Validate date input
 */
export function validateDate(date: string): boolean {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Sanitize and validate duration (in days)
 */
export function validateDuration(duration: number): boolean {
  return validateNumber(duration, 1, 365);
}

/**
 * Sanitize and validate intensity level
 */
export function validateIntensity(intensity: string): boolean {
  const validIntensities = ['low', 'moderate', 'high', 'gentle', 'intensive'];
  return validIntensities.includes(intensity.toLowerCase());
}

/**
 * Comprehensive form validation for protocol creation
 */
export interface ProtocolFormErrors {
  name?: string;
  description?: string;
  type?: string;
  duration?: string;
  intensity?: string;
  client?: string;
  template?: string;
  goals?: string;
  conditions?: string;
}

export function validateProtocolForm(data: any): ProtocolFormErrors {
  const errors: ProtocolFormErrors = {};
  
  // Validate name
  if (!validateRequired(data.name)) {
    errors.name = 'Protocol name is required';
  } else if (data.name.length < 3) {
    errors.name = 'Protocol name must be at least 3 characters';
  } else if (data.name.length > 100) {
    errors.name = 'Protocol name must be less than 100 characters';
  }
  
  // Validate description
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }
  
  // Validate type
  if (data.requiresType && !validateRequired(data.type)) {
    errors.type = 'Protocol type is required';
  }
  
  // Validate duration
  if (data.duration && !validateDuration(data.duration)) {
    errors.duration = 'Duration must be between 1 and 365 days';
  }
  
  // Validate intensity
  if (data.intensity && !validateIntensity(data.intensity)) {
    errors.intensity = 'Invalid intensity level';
  }
  
  // Validate client selection (for wizard)
  if (data.requiresClient && !validateRequired(data.client)) {
    errors.client = 'Please select a client';
  }
  
  // Validate template selection (if required)
  if (data.requiresTemplate && !validateRequired(data.template)) {
    errors.template = 'Please select a template';
  }
  
  // Validate goals
  if (data.requiresGoals && (!data.goals || data.goals.length === 0)) {
    errors.goals = 'Please select at least one health goal';
  }
  
  return errors;
}

/**
 * Check if form has errors
 */
export function hasErrors(errors: ProtocolFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Sanitize all form inputs
 */
export function sanitizeProtocolFormData(data: any): any {
  return {
    ...data,
    name: data.name ? sanitizeProtocolName(data.name) : '',
    description: data.description ? sanitizeDescription(data.description) : '',
    goals: data.goals ? sanitizeStringArray(data.goals) : [],
    conditions: data.conditions ? sanitizeStringArray(data.conditions) : [],
    medications: data.medications ? sanitizeStringArray(data.medications) : [],
    allergies: data.allergies ? sanitizeStringArray(data.allergies) : [],
    notes: data.notes ? sanitizeDescription(data.notes) : '',
  };
}