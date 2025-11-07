/**
 * Admin Service
 * @module services/admin
 * @description Admin-related business logic and database operations
 */

import { Student, Admin } from '../models/users/index.js';
import { HttpError } from '#exceptions/index.js';

// ==========================================
// USER MANAGEMENT SERVICES
// ==========================================
/**
 * Get all admin users
 */
export const getAllAdminUsers = async () => {
  try {
    const admins = await Admin.find({ status: 'active' })
      .select('-password -security')
      .sort({ createdAt: -1 })
      .lean();
    
    return admins;
  } catch (error) {
    throw new Error(`Failed to get admins: ${error.message}`);
  }
};

/**
 * Update admin data
 */
export const updateAdminData = async (adminId, updateData) => {
  try {
    const { role, permissions, isActive } = updateData;
    
    const updateFields = {};
    
    if (role) {
      updateFields['adminInfo.role'] = role;
    }
    
    if (permissions && Array.isArray(permissions)) {
      updateFields['adminInfo.permissions'] = permissions;
    }
    
    if (typeof isActive === 'boolean') {
      updateFields['adminInfo.isActive'] = isActive;
    }

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateFields },
      { new: true, select: '-password -security' }
    );

    if (!admin) {
      throw HttpError.notFound('Admin not found');
    }

    return admin;
  } catch (error) {
    throw new Error(`Failed to update admin: ${error.message}`);
  }
};

/**
 * Check if user has admin permission
 */
export const checkAdminPermission = (user, requiredPermission) => {
  if (!user || user.userType !== 'admin') {
    return false;
  }
  
  // Super admin has all permissions
  if (user.adminInfo?.role === 'super_admin') {
    return true;
  }
  
  // Check if admin is active
  if (!user.adminInfo?.isActive) {
    return false;
  }
  
  // Check specific permission
  return user.adminInfo?.permissions?.includes(requiredPermission) || false;
};


/**
 * Get all users with pagination and filtering
 */
export const getAllUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    userType,
    status,
    search
  } = options;

  // Build query
  const query = {};
  
  if (userType) {
    query.userType = userType;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { 'name.first': searchRegex },
      { 'name.last': searchRegex },
      { email: searchRegex }
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      Student.find(query)
        .select('-password -security')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Student.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const user = await Student.findById(userId)
      .select('-password -security')
      .lean();
    
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (userId, status, reason = '') => {
  try {
    const user = await Student.findByIdAndUpdate(
      userId,
      { 
        status,
        'metadata.statusChangedAt': new Date(),
        'metadata.statusChangeReason': reason
      },
      { new: true, select: '-password -security' }
    );

    if (!user) {
      throw HttpError.notFound('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to update user status: ${error.message}`);
  }
};

/**
 * Delete user (soft delete by setting status to 'deleted')
 */
export const deleteUser = async (userId) => {
  try {
    const user = await Student.findByIdAndUpdate(
      userId,
      { 
        status: 'deleted',
        'metadata.deletedAt': new Date()
      }
    );

    if (!user) {
      throw HttpError.notFound('User not found');
    }

    return true;
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

// ==========================================
// ANALYTICS SERVICES
// ==========================================

/**
 * Get user statistics
 */
export const getUserStatistics = async () => {
  try {
    const [userStats, studentStats] = await Promise.all([
      // Basic user stats
      Student.aggregate([
        {
          $group: {
            _id: '$userType',
            count: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            verified: {
              $sum: { $cond: ['$verification.isEmailVerified', 1, 0] }
            }
          }
        }
      ]),
      
      // Student-specific stats
      Student.aggregate([
        { $match: { userType: 'student', status: 'active' } },
        {
          $group: {
            _id: '$subscription.tier',
            count: { $sum: 1 },
            avgQuizzes: { $avg: '$progress.quizzesCompleted' },
            avgScore: { $avg: '$progress.averageScore' },
            avgPoints: { $avg: '$progress.totalPoints' }
          }
        }
      ])
    ]);

    return {
      userStats,
      studentStats,
      totalUsers: userStats.reduce((sum, stat) => sum + stat.count, 0),
      activeUsers: userStats.reduce((sum, stat) => sum + stat.active, 0)
    };
  } catch (error) {
    throw new Error(`Failed to get user statistics: ${error.message}`);
  }
};

/**
 * Get system analytics
 */
export const getSystemAnalytics = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      averageScore,
      totalQuizzes,
      totalDocuments
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      Student.countDocuments({ createdAt: { $gte: startOfDay } }),
      Student.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Student.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Student.aggregate([
        { $match: { userType: 'student', status: 'active' } },
        { $group: { _id: null, avgScore: { $avg: '$progress.averageScore' } } }
      ]),
      Student.aggregate([
        { $match: { userType: 'student', status: 'active' } },
        { $group: { _id: null, total: { $sum: '$progress.quizzesCompleted' } } }
      ]),
      Student.aggregate([
        { $match: { userType: 'student', status: 'active' } },
        { $group: { _id: null, total: { $sum: '$progress.documentsUploaded' } } }
      ])
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth
      },
      performance: {
        averageScore: averageScore[0]?.avgScore || 0,
        totalQuizzes: totalQuizzes[0]?.total || 0,
        totalDocuments: totalDocuments[0]?.total || 0
      },
      growth: {
        dailyGrowth: newUsersToday,
        weeklyGrowth: newUsersThisWeek,
        monthlyGrowth: newUsersThisMonth
      }
    };
  } catch (error) {
    throw new Error(`Failed to get system analytics: ${error.message}`);
  }
};

/**
 * Create admin user
 */
export const createAdmin = async (adminData) => {
  try {
    const {
      email,
      password,
      name,
      role = 'admin',
      department = 'General',
      permissions = []
    } = adminData;

    // Check if admin with email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw HttpError.conflict('Admin with this email already exists');
    }

    // Default permissions based on role
    const defaultPermissions = {
      super_admin: [
        'users:read', 'users:create', 'users:update', 'users:delete',
        'courses:read', 'courses:create', 'courses:update', 'courses:delete',
        'analytics:read', 'system:manage', 'content:moderate'
      ],
      admin: [
        'users:read', 'users:update',
        'courses:read', 'courses:update',
        'analytics:read', 'content:moderate'
      ],
      moderator: [
        'users:read', 'content:moderate'
      ]
    };

    const admin = new Admin({
      email,
      password,
      name,
      adminInfo: {
        role,
        department,
        permissions: permissions.length > 0 ? permissions : defaultPermissions[role] || []
      },
      verification: {
        isEmailVerified: true // Admins are pre-verified
      }
    });

    await admin.save();

    // Remove password from response
    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    return adminResponse;
  } catch (error) {
    throw new Error(`Failed to create admin: ${error.message}`);
  }
};