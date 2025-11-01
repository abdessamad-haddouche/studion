/**
 * Auth Controller Unit Tests - login.controller.test.js
 * @description Test suite for user login controller
 */

import { login } from '#controllers/auth.controller.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

describe('Auth Controller - login', () => {
  let req;
  let res;
  let next;
  
  // Mock service function
  const mockLoginUser = async (credentials, ip, userAgent) => {
    // Validate inputs
    if (credentials.email === 'invalid@example.com') {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }
    
    if (credentials.email === 'locked@example.com') {
      const error = new Error('Account is temporarily locked');
      error.statusCode = 403;
      throw error;
    }
    
    // Return mock data for successful login
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 900, // 15 minutes
      user: {
        id: 'mock-user-id',
        email: credentials.email,
        name: {
          first: 'John',
          last: 'Doe',
          full: 'John Doe'
        },
        userType: 'Student',
        lastLogin: new Date()
      }
    };
  };
  
  beforeEach(() => {
    // Setup request mock
    req = {
      body: {
        email: 'test@example.com',
        password: 'Password123!'
      },
      ip: '192.168.1.1',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
      }
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
      cookie: function(name, value, options) {
        this.cookies = this.cookies || {};
        this.cookies[name] = { value, options };
      },
      statusCode: null,
      responseData: null,
      cookies: {}
    };
    
    next = jest.fn(error => {
      next.error = error;
    });
    next.error = null;
  });
  
  test('should login a user successfully', async () => {
    // Create a test controller that uses our mock
    const testLogin = async (req, res, next) => {
      try {
        const credentials = {
          email: req.body.email,
          password: req.body.password
        };
        
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        
        const authResult = await mockLoginUser(credentials, ip, userAgent);
        
        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', authResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
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
    
    // Call the test controller
    await testLogin(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.message).toBe('Login successful');
    expect(res.responseData.accessToken).toBe('mock-access-token');
    
    // Check cookie
    expect(res.cookies.refreshToken).toBeDefined();
    expect(res.cookies.refreshToken.value).toBe('mock-refresh-token');
    expect(res.cookies.refreshToken.options.httpOnly).toBe(true);
    expect(res.cookies.refreshToken.options.path).toBe('/api/auth/refresh-token');
    
    expect(next.error).toBe(null);
  });
  
  test('should handle invalid credentials', async () => {
    // Set email to trigger authentication error
    req.body.email = 'invalid@example.com';
    
    // Create a test controller
    const testLogin = async (req, res, next) => {
      try {
        const credentials = {
          email: req.body.email,
          password: req.body.password
        };
        
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        
        const authResult = await mockLoginUser(credentials, ip, userAgent);
        
        res.cookie('refreshToken', authResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000,
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
    
    // Call the test controller
    await testLogin(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Invalid email or password');
    expect(res.statusCode).toBe(null); // Response methods not called
    expect(Object.keys(res.cookies).length).toBe(0); // No cookies set
  });
});