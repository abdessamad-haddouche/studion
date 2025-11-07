/**
 * Admin Middleware
 * @module middleware/admin
 * @description Admin authorization and permission checking middleware
 */

import { HttpError } from '#exceptions/index.js';
import { checkAdminPermission } from '../services/admin.service.js';

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.userType !== 'admin') {
    return next(HttpError.forbidden('Admin access required'));
  }
  
  // Check if admin is active
  if (!req.user.adminInfo?.isActive) {
    return next(HttpError.forbidden('Admin account is inactive'));
  }
  
  next();
};

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.userType !== 'admin') {
    return next(HttpError.forbidden('Admin access required'));
  }
  
  if (req.user.adminInfo?.role !== 'super_admin') {
    return next(HttpError.forbidden('Super admin access required'));
  }
  
  next();
};

/**
 * Middleware factory to check specific admin permission
 * @param {string} permission - Required permission
 * @returns {Function} Express middleware function
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!checkAdminPermission(req.user, permission)) {
      return next(HttpError.forbidden(`Permission required: ${permission}`));
    }
    next();
  };
};

/**
 * Middleware to check user management permissions
 */
export const requireUserManagement = requirePermission('users:update');

/**
 * Middleware to check user deletion permissions
 */
export const requireUserDeletion = requirePermission('users:delete');

/**
 * Middleware to check analytics permissions
 */
export const requireAnalytics = requirePermission('analytics:read');

export default {
  requireAdmin,
  requireSuperAdmin,
  requirePermission,
  requireUserManagement,
  requireUserDeletion,
  requireAnalytics
};