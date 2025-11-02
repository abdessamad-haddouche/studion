/**
 * ObjectId Validation Middleware
 * @module middleware/validation
 * @description Validates MongoDB ObjectId parameters before reaching controllers
 */

import mongoose from 'mongoose';
import { HttpError } from '#exceptions/index.js';

/**
 * Validate ObjectId parameters middleware
 * @param {string} paramName - Parameter name to validate (default: 'id')
 * @returns {Function} Express middleware function
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return next(HttpError.badRequest(`Missing ${paramName} parameter`));
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(HttpError.badRequest(`Invalid ${paramName} format`));
    }
    
    next();
  };
};

/**
 * Validate multiple ObjectId parameters
 * @param {Array<string>} paramNames - Array of parameter names to validate
 * @returns {Function} Express middleware function
 */
export const validateObjectIds = (paramNames = ['id']) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return next(HttpError.badRequest(`Invalid ${paramName} format`));
      }
    }
    
    next();
  };
};

export default {
  validateObjectId,
  validateObjectIds
};