/**
 * Authentication Controller
 * @module controllers/auth
 * @description Handles user authentication, registration, and account management
 */

import { HttpError } from '#exceptions/index.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshUserToken 
} from '#services/auth.service.js';

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    // Log the body for debugging
    console.log('Request body:', JSON.stringify(req.body));
    
    // Validate required fields
    if (!req.body.email) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    if (!req.body.password) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    if (!req.body.firstName) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'First name is required'
      });
    }
    
    if (!req.body.lastName) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Last name is required'
      });
    }
    
    const userData = {
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      academicLevel: req.body.academicLevel,
      institution: req.body.institution,
      fieldOfStudy: req.body.fieldOfStudy
    };
    
    const metadata = {
      ip: req.ip,
      source: req.body.source || 'web'
    };
    
    const user = await registerUser(userData, metadata);
    
    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    // Better error handling - check specific error types
    console.error('Registration error:', error);
    
    // If it's a validation error, send a better response
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      // Extract validation error messages
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // If it's a MongoDB validation error, try to extract more info
    if (error.name === 'MongoServerError' && error.code === 121) {
      console.log('Document validation failed:', JSON.stringify(error.errInfo?.details, null, 2));
      
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Document validation failed',
        details: 'Please check server logs for details'
      });
    }
    
    // Pass other errors to the error handler middleware
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 * @description Login a user and get tokens
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Email and password are required'
      });
    };
    
    const credentials = {
      email: req.body.email,
      password: req.body.password
    };
    
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    
    const authResult = await loginUser(credentials, ip, userAgent);
    
    // Set refresh token as HTTP-only cookie for better security
    res.cookie('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // secure in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh-token',
      sameSite: 'strict'
    });
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Login successful',
      accessToken: authResult.accessToken,
      expiresIn: authResult.expiresIn,
      user: authResult.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/logout
 * @description Logout a user (invalidate token)
 * @access Private
 */
export const logout = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    await logoutUser(userId, refreshToken);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      path: '/api/auth/refresh-token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/refresh-token
 * @description Refresh access token using refresh token
 * @access Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      throw HttpError.badRequest('Refresh token is required');
    }
    
    const tokenResult = await refreshUserToken(refreshToken);
    
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      accessToken: tokenResult.accessToken,
      expiresIn: tokenResult.expiresIn
    });
  } catch (error) {
    next(error);
  }
};


export const verifyEmail = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      message: 'Email verification endpoint not yet implemented'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      message: 'Password reset request endpoint not yet implemented'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      message: 'Password reset endpoint not yet implemented'
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).json({
      message: 'Password change endpoint not yet implemented'
    });
  } catch (error) {
    next(error);
  }
};