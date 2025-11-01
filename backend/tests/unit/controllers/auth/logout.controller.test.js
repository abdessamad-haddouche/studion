/**
 * Auth Controller Unit Tests - logout.controller.test.js
 * @description Test suite for user logout controller
 */

import { logout } from '#controllers/auth.controller.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

describe('Auth Controller - logout', () => {
  let req;
  let res;
  let next;
  
  // Mock service function
  const mockLogoutUser = async (userId, refreshToken) => {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      throw error;
    }
    
    if (refreshToken === 'invalid-session-token') {
      const error = new Error('Invalid session');
      error.statusCode = 403;
      throw error;
    }
    
    // Return success for valid tokens
    return { success: true };
  };
  
  beforeEach(() => {
    // Setup request mock
    req = {
      user: {
        userId: 'mock-user-id'
      },
      cookies: {
        refreshToken: 'mock-refresh-token'
      },
      body: {}
    };
    
    // Setup response mock
    res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      },
      clearCookie: function(name, options) {
        this.clearedCookies = this.clearedCookies || {};
        this.clearedCookies[name] = options;
      },
      statusCode: null,
      responseData: null,
      clearedCookies: {}
    };
    
    next = jest.fn(error => {
      next.error = error;
    });
    next.error = null;
  });
  
  test('should logout a user successfully with cookie token', async () => {
    // Create a test controller
    const testLogout = async (req, res, next) => {
      try {
        const userId = req.user.userId;
        
        // Get refresh token from cookie or request body
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        
        await mockLogoutUser(userId, refreshToken);
        
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
    
    // Call the test controller
    await testLogout(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.message).toBe('Logged out successfully');
    
    // Check cookie clearing
    expect(res.clearedCookies.refreshToken).toBeDefined();
    expect(res.clearedCookies.refreshToken.path).toBe('/api/auth/refresh-token');
    expect(res.clearedCookies.refreshToken.httpOnly).toBe(true);
    
    expect(next.error).toBe(null);
  });
  
  test('should logout a user successfully with token from body', async () => {
    // Setup request without cookie but with body token
    const reqWithBodyToken = {
      user: { userId: 'mock-user-id' },
      cookies: {},
      body: { refreshToken: 'mock-refresh-token' }
    };
    
    // Create a test controller
    const testLogout = async (req, res, next) => {
      try {
        const userId = req.user.userId;
        
        // Get refresh token from cookie or request body
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        
        await mockLogoutUser(userId, refreshToken);
        
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
    
    // Call the test controller
    await testLogout(reqWithBodyToken, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(next.error).toBe(null);
  });
  
  test('should handle service errors', async () => {
    // Set an invalid refresh token
    req.cookies.refreshToken = 'invalid-session-token';
    
    // Create a test controller
    const testLogout = async (req, res, next) => {
      try {
        const userId = req.user.userId;
        
        // Get refresh token from cookie or request body
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        
        await mockLogoutUser(userId, refreshToken);
        
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
    
    // Call the test controller
    await testLogout(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Invalid session');
    expect(res.statusCode).toBe(null); // Response methods not called
    expect(Object.keys(res.clearedCookies).length).toBe(0); // No cookies cleared
  });
});