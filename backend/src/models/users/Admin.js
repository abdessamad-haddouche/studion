/**
 * Admin User Model
 * @module models/users/Admin
 * @description Admin model with basic administrative capabilities
 */

import mongoose from 'mongoose';
import BaseUser, { baseUserSchema } from './BaseUser.js';

// ==========================================
// ADMIN SCHEMA
// ==========================================

const adminSchema = new baseUserSchema.constructor({
  // Admin-specific fields
  adminInfo: {
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator'],
      default: 'admin',
      index: true
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department name too long'],
      default: 'General'
    },
    permissions: [{
      type: String,
      enum: [
        'users:read', 'users:create', 'users:update', 'users:delete',
        'courses:read', 'courses:create', 'courses:update', 'courses:delete',
        'analytics:read', 'system:manage', 'content:moderate'
      ]
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },

  // Admin activity tracking
  adminActivity: {
    lastDashboardAccess: {
      type: Date,
      default: null
    },
    actionsPerformed: {
      type: Number,
      default: 0,
      min: 0
    },
    usersManaged: {
      type: Number,
      default: 0,
      min: 0
    },
    coursesManaged: {
      type: Number,
      default: 0,
      min: 0
    }
  }
});

// ==========================================
// INDEXES
// ==========================================

adminSchema.index({ 'adminInfo.role': 1, status: 1 });
adminSchema.index({ 'adminInfo.isActive': 1 });
adminSchema.index({ 'adminActivity.lastDashboardAccess': -1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

/**
 * Check if admin is super admin
 */
adminSchema.virtual('isSuperAdmin').get(function() {
  return this.adminInfo.role === 'super_admin';
});

/**
 * Check if admin is active and has admin role
 */
adminSchema.virtual('isActiveAdmin').get(function() {
  return this.status === 'active' && this.adminInfo.isActive;
});

/**
 * Get admin display title
 */
adminSchema.virtual('adminTitle').get(function() {
  const roles = {
    'super_admin': 'Super Administrator',
    'admin': 'Administrator',
    'moderator': 'Moderator'
  };
  return roles[this.adminInfo.role] || 'Administrator';
});

// ==========================================
// METHODS
// ==========================================

/**
 * Check if admin has specific permission
 */
adminSchema.methods.hasPermission = function(permission) {
  if (this.adminInfo.role === 'super_admin') {
    return true; // Super admin has all permissions
  }
  return this.adminInfo.permissions.includes(permission);
};

/**
 * Add permission to admin
 */
adminSchema.methods.addPermission = function(permission) {
  if (!this.adminInfo.permissions.includes(permission)) {
    this.adminInfo.permissions.push(permission);
  }
  return this.save();
};

/**
 * Remove permission from admin
 */
adminSchema.methods.removePermission = function(permission) {
  this.adminInfo.permissions = this.adminInfo.permissions.filter(p => p !== permission);
  return this.save();
};

/**
 * Record admin action
 */
adminSchema.methods.recordAction = function(actionType = 'general') {
  this.adminActivity.actionsPerformed += 1;
  this.adminActivity.lastDashboardAccess = new Date();
  
  // Track specific action types
  if (actionType === 'user_management') {
    this.adminActivity.usersManaged += 1;
  } else if (actionType === 'course_management') {
    this.adminActivity.coursesManaged += 1;
  }
  
  return this.save();
};

/**
 * Update admin role and permissions
 */
adminSchema.methods.updateRole = function(newRole, permissions = []) {
  this.adminInfo.role = newRole;
  if (permissions.length > 0) {
    this.adminInfo.permissions = permissions;
  }
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find admins by role
 */
adminSchema.statics.findByRole = function(role) {
  return this.find({
    'adminInfo.role': role,
    'adminInfo.isActive': true,
    status: 'active'
  });
};

/**
 * Find active admins
 */
adminSchema.statics.findActiveAdmins = function() {
  return this.find({
    'adminInfo.isActive': true,
    status: 'active'
  });
};

/**
 * Get admin statistics
 */
adminSchema.statics.getAdminStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$adminInfo.role',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: ['$adminInfo.isActive', 1, 0] }
        },
        totalActions: { $sum: '$adminActivity.actionsPerformed' },
        avgActions: { $avg: '$adminActivity.actionsPerformed' }
      }
    }
  ]);
};

// ==========================================
// CREATE DISCRIMINATOR MODEL
// ==========================================

const Admin = BaseUser.discriminator('admin', adminSchema);

export default Admin;