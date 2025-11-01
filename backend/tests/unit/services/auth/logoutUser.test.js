/**
 * Auth Service Test - logoutUser.test.js
 * Tests for the logout functionality
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { registerUser, loginUser, logoutUser } from '#services/auth.service.js';
import { BaseUser } from '#models/users/index.js';
import { AuthSession } from '#models/auth/index.js';

describe('Auth Service - logoutUser', () => {
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  afterEach(async () => {
    await BaseUser.deleteMany({});
    await AuthSession.deleteMany({});
  });

  test('should throw error if refresh token is missing', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    
    await expect(logoutUser(userId, null))
      .rejects
      .toThrow('Refresh token is required');
  });

  test('should successfully log out a user', async () => {
    // 1. Register a test user
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    await registerUser(userData);
    
    // 2. Log the user in to create a session with a valid refresh token
    const loginResponse = await loginUser(
      { email: userData.email, password: userData.password },
      '192.168.1.1',
      'Test Browser'
    );
    
    // 3. Get the session directly
    const session = await AuthSession.findByRefreshToken(loginResponse.refreshToken);
    const sessionUserId = session.userId._id ? session.userId._id.toString() : session.userId.toString();
    
    // 4. Perform logout using the session's user ID
    const result = await logoutUser(sessionUserId, loginResponse.refreshToken);
    
    // 5. Verify success
    expect(result.success).toBe(true);
    
    // 6. Verify the session is revoked in the database
    const updatedSession = await AuthSession.findOne({ _id: session._id });
    expect(updatedSession.status).toBe('revoked');
  });

  test('should handle non-existent token gracefully', async () => {
    // 1. Register a test user
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    await registerUser(userData);
    
    // 2. Get a user ID
    const user = await BaseUser.findOne({ email: userData.email });
    const userId = user._id.toString();
    
    // 3. Try to log out with a non-existent token
    const result = await logoutUser(userId, 'non-existent-token');
    
    // 4. Verify it returns success (for security by obscurity)
    expect(result.success).toBe(true);
  });

  test('should throw error when trying to logout from another user\'s session', async () => {
    // 1. Create two users
    const user1Data = {
      email: 'user1@example.com',
      password: 'SecurePass123!',
      firstName: 'User',
      lastName: 'One'
    };
    
    const user2Data = {
      email: 'user2@example.com',
      password: 'SecurePass123!',
      firstName: 'User',
      lastName: 'Two'
    };
    
    await registerUser(user1Data);
    await registerUser(user2Data);
    
    // 2. Log in as user1
    const loginResponse = await loginUser(
      { email: user1Data.email, password: user1Data.password },
      '192.168.1.1',
      'Test Browser'
    );
    
    // 3. Get user2's ID
    const user2 = await BaseUser.findOne({ email: user2Data.email });
    const user2Id = user2._id.toString();
    
    // 4. Try to log out with user1's token but user2's ID
    await expect(logoutUser(user2Id, loginResponse.refreshToken))
      .rejects
      .toThrow('Invalid session');
  });
});