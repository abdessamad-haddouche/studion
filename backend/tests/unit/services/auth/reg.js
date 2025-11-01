/**
 * Auth Service Unit Tests - loginUser.test.js
 * @description Test suite for user login functionality
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { loginUser, registerUser } from '#services/auth.service.js';
import { BaseUser, Student } from '#models/users/index.js';
import { AuthSession } from '#models/auth/index.js';
import { HttpError } from '#exceptions/index.js';

describe('Auth Service - loginUser', () => {
  let mongoServer;
  let testUser;
  
  // Valid test data
  const validUserData = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
    academicLevel: 'undergraduate'
  };
  
  // Valid credentials
  const validCredentials = {
    email: validUserData.email,
    password: validUserData.password
  };
  
  const testIp = '192.168.1.1';
  const testUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36';
  
  // Setup MongoDB Memory Server
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  beforeEach(async () => {
    // Register a test user before each test
    testUser = await registerUser(validUserData);
  });
  
  afterEach(async () => {
    // Clean up database after each test
    await BaseUser.deleteMany({});
    await AuthSession.deleteMany({});
  });

  describe('Successful Login', () => {
    // [first tests remain the same]
    
    test('should create auth session in database', async () => {
      // Act
      const result = await loginUser(validCredentials, testIp, testUserAgent);
      
      // Assert - find session in database
      const sessions = await AuthSession.find({ 
        userId: new mongoose.Types.ObjectId(result.user.id) 
      });
      expect(sessions.length).toBeGreaterThan(0);
      
      const session = sessions[0];
      expect(session.status).toBe('active');
      expect(session.network.ipAddress).toBe(testIp);
      expect(session.device.userAgent).toBe(testUserAgent);
      
      // Session should have refreshTokenHash
      const sessionWithToken = await AuthSession.findById(session._id).select('+refreshTokenHash');
      expect(sessionWithToken.refreshTokenHash).toBeDefined();
    });
    
    test('should correctly parse device type from user agent', async () => {
      // Test desktop user agent
      const desktopResult = await loginUser(
        validCredentials, 
        testIp, 
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
      );
      
      // Find desktop session
      const desktopSession = await AuthSession.findOne({ 
        userId: new mongoose.Types.ObjectId(desktopResult.user.id),
        'device.userAgent': /Windows/
      });
      expect(desktopSession.device.type).toBe('desktop');
      
      // Test mobile user agent
      const mobileResult = await loginUser(
        validCredentials, 
        testIp, 
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) Mobile/15E148'
      );
      
      // Find mobile session
      const mobileSession = await AuthSession.findOne({ 
        userId: new mongoose.Types.ObjectId(mobileResult.user.id),
        'device.userAgent': /Mobile/
      });
      expect(mobileSession.device.type).toBe('mobile');
    });
  });
  
  describe('Login Failures', () => {
    // [first tests remain the same]
    
    test('should increment login attempts on failed password', async () => {
      // Arrange
      const invalidCredentials = {
        email: validUserData.email,
        password: 'WrongPassword123!'
      };
      
      // Initial login attempts - explicitly select security field
      const initialUser = await BaseUser.findByEmail(validUserData.email);
      const initialAttempts = initialUser.security?.loginAttempts || 0;
      
      // Act - try to login with wrong password
      try {
        await loginUser(invalidCredentials, testIp, testUserAgent);
      } catch (error) {
        // Expected error
      }
      
      // Assert - explicitly select security field
      const updatedUser = await BaseUser.findOne({ email: validUserData.email }).select('+security');
      expect(updatedUser.security.loginAttempts).toBe(1); // Should be 1 after first failed attempt
    });
    
    test('should lock account after multiple failed attempts', async () => {
      // Arrange
      const invalidCredentials = {
        email: validUserData.email,
        password: 'WrongPassword123!'
      };
      
      // Set login attempts close to threshold
      const user = await BaseUser.findByEmail(validUserData.email);
      
      // Make 4 failed attempts
      for (let i = 0; i < 4; i++) {
        try {
          await loginUser(invalidCredentials, testIp, testUserAgent);
        } catch (error) {
          // Expected error
        }
      }
      
      // Make 5th attempt (should trigger lock)
      try {
        await loginUser(invalidCredentials, testIp, testUserAgent);
      } catch (error) {
        // Expected error
      }
      
      // Assert - explicitly select security field
      const updatedUser = await BaseUser.findOne({ email: validUserData.email }).select('+security');
      expect(updatedUser.security.lockUntil).toBeDefined();
      
      // This test will need to be manually verified by checking if lockUntil is in the future
      const now = new Date();
      expect(new Date(updatedUser.security.lockUntil).getTime()).toBeGreaterThan(now.getTime());
    });
    
    test('should throw error when account is locked', async () => {
      // Arrange - lock the account manually
      const user = await BaseUser.findOne({ email: validUserData.email });
      
      // Update directly with updateOne to set lockUntil
      await BaseUser.updateOne(
        { _id: user._id },
        { 
          $set: { 
            'security.lockUntil': new Date(Date.now() + 3600000) // Lock for 1 hour
          } 
        }
      );
      
      // Act & Assert - even with correct password
      await expect(loginUser(validCredentials, testIp, testUserAgent))
        .rejects
        .toThrow('Account is temporarily locked');
        
      // Check error type and status code
      try {
        await loginUser(validCredentials, testIp, testUserAgent);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toBe(403); // Forbidden
      }
    });
    
    // [other tests remain the same]
  });
  
  // [remaining test sections remain the same]
});