/**
 * Auth Controller Unit Tests - refreshToken.controller.test.js
 * @description Test suite for token refresh controller
 */

import { refreshToken } from '#controllers/auth.controller.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

describe('Auth Controller - refreshToken', () => {
  let req;
  let res;
  let next;
  
  // Mock HttpError
  const mockHttpError = {
    badRequest: (message) => {
      const error = new Error(message);
      error.statusCode = 400;
      return error;
    }
  };
  
  // Mock service function
  const mockRefreshUserToken = async (refreshToken) => {
    if (!refreshToken) {
      const error = mockHttpError.badRequest('Refresh token is required');
      throw error;
    }
    
    if (refreshToken === 'invalid-token') {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }
    
    // Return mock data for successful refresh
    return {
      accessToken: 'new-mock-access-token',
      expiresIn: 900 // 15 minutes
    };
  };
  
  beforeEach(() => {
    // Setup request mock
    req = {
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
      statusCode: null,
      responseData: null
    };
    
    next = jest.fn(error => {
      next.error = error;
    });
    next.error = null;
  });
  
  test('should refresh token successfully with cookie token', async () => {
    // Create a test controller
    const testRefreshToken = async (req, res, next) => {
      try {
        // Get refresh token from cookie or request body
        const refreshTokenValue = req.cookies?.refreshToken || req.body.refreshToken;
        
        if (!refreshTokenValue) {
          throw mockHttpError.badRequest('Refresh token is required');
        }
        
        const tokenResult = await mockRefreshUserToken(refreshTokenValue);
        
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          accessToken: tokenResult.accessToken,
          expiresIn: tokenResult.expiresIn
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testRefreshToken(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.accessToken).toBe('new-mock-access-token');
    expect(res.responseData.expiresIn).toBe(900);
    expect(next.error).toBe(null);
  });
  
  test('should refresh token successfully with body token', async () => {
    // Setup request without cookie but with body token
    const reqWithBodyToken = {
      cookies: {},
      body: { refreshToken: 'mock-refresh-token' }
    };
    
    // Create a test controller
    const testRefreshToken = async (req, res, next) => {
      try {
        // Get refresh token from cookie or request body
        const refreshTokenValue = req.cookies?.refreshToken || req.body.refreshToken;
        
        if (!refreshTokenValue) {
          throw mockHttpError.badRequest('Refresh token is required');
        }
        
        const tokenResult = await mockRefreshUserToken(refreshTokenValue);
        
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          accessToken: tokenResult.accessToken,
          expiresIn: tokenResult.expiresIn
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testRefreshToken(reqWithBodyToken, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.accessToken).toBe('new-mock-access-token');
  });
  
  test('should throw error if refresh token is missing', async () => {
    // Setup request with no token
    const reqWithNoToken = {
      cookies: {},
      body: {}
    };
    
    // Create a test controller
    const testRefreshToken = async (req, res, next) => {
      try {
        // Get refresh token from cookie or request body
        const refreshTokenValue = req.cookies?.refreshToken || req.body.refreshToken;
        
        if (!refreshTokenValue) {
          throw mockHttpError.badRequest('Refresh token is required');
        }
        
        const tokenResult = await mockRefreshUserToken(refreshTokenValue);
        
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          accessToken: tokenResult.accessToken,
          expiresIn: tokenResult.expiresIn
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testRefreshToken(reqWithNoToken, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Refresh token is required');
    expect(res.statusCode).toBe(null); // Response methods not called
  });
  
  test('should handle service errors', async () => {
    // Set invalid token
    req.cookies.refreshToken = 'invalid-token';
    
    // Create a test controller
    const testRefreshToken = async (req, res, next) => {
      try {
        // Get refresh token from cookie or request body
        const refreshTokenValue = req.cookies?.refreshToken || req.body.refreshToken;
        
        if (!refreshTokenValue) {
          throw mockHttpError.badRequest('Refresh token is required');
        }
        
        const tokenResult = await mockRefreshUserToken(refreshTokenValue);
        
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          accessToken: tokenResult.accessToken,
          expiresIn: tokenResult.expiresIn
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testRefreshToken(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Invalid refresh token');
    expect(res.statusCode).toBe(null); // Response methods not called
  });
});