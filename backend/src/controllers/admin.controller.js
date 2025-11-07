/**
 * Admin Controller
 * @module controllers/admin
 * @description Admin management and dashboard functionality
 */

import { HttpError } from '#exceptions/index.js';
import { 
  getAllUsers,
  getUserById as getUserByIdService,
  updateUserStatus,
  deleteUser,
  getUserStatistics,
  getSystemAnalytics,
  createAdmin,
  getAllAdminUsers,
  updateAdminData
} from '../services/admin.service.js';

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================

/**
 * Get admin dashboard data
 * @route GET /api/admin/dashboard
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const admin = req.user;
    
    // Check admin permissions
    if (!admin || admin.userType !== 'admin') {
      return next(HttpError.forbidden('Admin access required'));
    }

    const dashboardData = await getSystemAnalytics();
    
    res.status(200).json({
      success: true,
      data: {
        admin: {
          name: admin.fullName,
          role: admin.adminInfo?.role || 'admin',
          lastAccess: new Date()
        },
        ...dashboardData
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN MANAGEMENT
// ==========================================

/**
 * Create new admin (Super Admin only)
 * @route POST /api/admin/admins
 */
export const createAdminUser = async (req, res, next) => {
  try {
    const currentAdmin = req.user;
    
    // Check if current user is super admin
    if (!currentAdmin || currentAdmin.userType !== 'admin' || currentAdmin.adminInfo?.role !== 'super_admin') {
      return next(HttpError.forbidden('Super admin access required to create admins'));
    }

    const { email, password, name, role, department, permissions } = req.body;
    
    // Validate required fields
    if (!email || !password || !name?.first || !name?.last) {
      return next(HttpError.badRequest('Email, password, first name, and last name are required'));
    }

    // Validate admin role
    if (role && !['admin', 'moderator'].includes(role)) {
      return next(HttpError.badRequest('Invalid admin role. Only admin and moderator can be created'));
    }

    const adminData = {
      email,
      password,
      name,
      role: role || 'admin',
      department: department || 'General',
      permissions: permissions || []
    };

    const newAdmin = await createAdmin(adminData);
    
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { admin: newAdmin }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all admins (Super Admin only)
 * @route GET /api/admin/admins
 */
export const getAllAdmins = async (req, res, next) => {
  try {
    const currentAdmin = req.user;
    
    // Check if current user is super admin
    if (!currentAdmin || currentAdmin.userType !== 'admin' || currentAdmin.adminInfo?.role !== 'super_admin') {
      return next(HttpError.forbidden('Super admin access required'));
    }

    const admins = await getAllAdminUsers();
    
    res.status(200).json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin role/permissions (Super Admin only)
 * @route PUT /api/admin/admins/:adminId
 */
export const updateAdminUser = async (req, res, next) => {
  try {
    const currentAdmin = req.user;
    const { adminId } = req.params;
    const { role, permissions, isActive } = req.body;
    
    // Check if current user is super admin
    if (!currentAdmin || currentAdmin.userType !== 'admin' || currentAdmin.adminInfo?.role !== 'super_admin') {
      return next(HttpError.forbidden('Super admin access required'));
    }

    // Cannot modify super admins
    if (currentAdmin._id.toString() === adminId) {
      return next(HttpError.badRequest('Cannot modify your own admin account'));
    }

    const updatedAdmin = await updateAdminData(adminId, { role, permissions, isActive });
    
    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin: updatedAdmin }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Get all users (admin only)
 * @route GET /api/admin/users
 */
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const admin = req.user;
    
    // Check permissions
    if (!admin || admin.userType !== 'admin') {
      return next(HttpError.forbidden('Admin access required'));
    }

    const { page = 1, limit = 20, userType, status, search } = req.query;
    
    const result = await getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      userType,
      status,
      search
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 * @route GET /api/admin/users/:userId
 */
export const getUserByIdAdmin = async (req, res, next) => {
  try {
    const admin = req.user;
    const { userId } = req.params;
    
    // Check permissions
    if (!admin || admin.userType !== 'admin') {
      return next(HttpError.forbidden('Admin access required'));
    }

    const user = await getUserByIdService(userId);
    
    if (!user) {
      return next(HttpError.notFound('User not found'));
    }
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (admin only)
 * @route PUT /api/admin/users/:userId/status
 */
export const updateUserStatusAdmin = async (req, res, next) => {
  try {
    const admin = req.user;
    const { userId } = req.params;
    const { status, reason } = req.body;
    
    // Check permissions
    if (!admin || admin.userType !== 'admin') {
      return next(HttpError.forbidden('Admin access required'));
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return next(HttpError.badRequest('Invalid status'));
    }

    const user = await updateUserStatus(userId, status, reason);
    
    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/admin/users/:userId
 */
export const deleteUserAdmin = async (req, res, next) => {
  try {
    const admin = req.user;
    const { userId } = req.params;
    
    // Check permissions (only super_admin can delete)
    if (!admin || admin.userType !== 'admin' || admin.adminInfo?.role !== 'super_admin') {
      return next(HttpError.forbidden('Super admin access required'));
    }

    await deleteUser(userId);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// STATISTICS & REPORTS
// ==========================================

/**
 * Get user statistics (admin only)
 * @route GET /api/admin/stats/users
 */
export const getUserStatsAdmin = async (req, res, next) => {
  try {
    const admin = req.user;
    
    // Check permissions
    if (!admin || admin.userType !== 'admin') {
      return next(HttpError.forbidden('Admin access required'));
    }

    const stats = await getUserStatistics();
    
    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system analytics (admin only)
 * @route GET /api/admin/analytics
 */
export const getSystemAnalyticsAdmin = async (req, res, next) => {
  try {
    const admin = req.user;
    
    // Check permissions
    if (!admin || admin.userType !== 'admin') {
      return next(HttpError.forbidden('Admin access required'));
    }

    const analytics = await getSystemAnalytics();
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};