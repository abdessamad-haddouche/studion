/**
 * Authentication Service
 * @module services/auth
 * @description Core authentication business logic
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Student, BaseUser } from '#models/users/index.js';
import { AuthSession } from '#models/auth/index.js';
import { HttpError } from '#exceptions/index.js';

// JWT configuration from env
const JWT_SECRET = process.env.JWT_SECRET || 'studion-dev-super-secret-jwt-key-change-in-production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Register a new student user
 * @param {Object} userData - User registration data
 * @param {Object} metadata - Additional registration metadata
 * @returns {Promise<Object>} Created user object (without sensitive data)
 */
export const registerUser = async (userData, metadata = {}) => {
  // Check if email already exists
  const existingUser = await BaseUser.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    throw HttpError.conflict('Email already exists');
  }

  // Create new Student model instance
  const newUser = new Student({
    email: userData.email.toLowerCase(),
    password: userData.password,
    name: {
      first: userData.firstName,
      last: userData.lastName
    },
    // REMOVE the userType: 'student' line
    academic: {
      level: userData.academicLevel || 'undergraduate',
      institution: userData.institution || null,
      fieldOfStudy: userData.fieldOfStudy || null
    },
    metadata: {
      registrationSource: metadata.source || 'web',
      registrationIP: metadata.ip || null
    }
  });

  // Save to database
  const savedUser = await newUser.save();

  // Return user without sensitive data
  return {
    id: savedUser._id,
    email: savedUser.email,
    name: {
      first: savedUser.name.first,
      last: savedUser.name.last,
      full: savedUser.fullName
    },
    academicLevel: savedUser.academic.level,
    createdAt: savedUser.createdAt
  };
};

/**
 * Authenticate user and create session
 * @param {Object} credentials - Login credentials
 * @param {String} ip - Client IP address
 * @param {String} userAgent - Client user agent
 * @returns {Promise<Object>} Tokens and user info
 */
export const loginUser = async (credentials, ip, userAgent) => {
  // Find user by email with password field (normally excluded)
  const user = await BaseUser.findByEmail(credentials.email);
  
  if (!user) {
    throw HttpError.unauthorized('Invalid email or password');
  }
  
  // Check if account is active
  if (user.status !== 'active') {
    throw HttpError.forbidden('Account is not active');
  }
  
  // Check if account is locked
  if (user.isLocked) {
    throw HttpError.forbidden('Account is temporarily locked. Try again later');
  }
  
  // Compare passwords
  const isPasswordValid = await user.comparePassword(credentials.password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    await user.handleFailedLogin();
    throw HttpError.unauthorized('Invalid email or password');
  }
  
  // Handle successful login (reset login attempts)
  await user.handleSuccessfulLogin({ ip });
  
  // Generate tokens
  const { accessToken, refreshToken, expiresAt } = generateTokens(user);
  
  // Get device info from user agent
  const deviceInfo = parseUserAgent(userAgent);
  
  // Create auth session
  const sessionData = {
    refreshToken,
    accessTokenExpiresAt: expiresAt.accessToken,
    refreshTokenExpiresAt: expiresAt.refreshToken,
    ipAddress: ip,
    userAgent,
    deviceInfo
  };
  
  await AuthSession.createSession(user._id, sessionData);
  
  // Return tokens and user data
  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor((expiresAt.accessToken - Date.now()) / 1000),
    user: {
      id: user._id,
      email: user.email,
      name: {
        first: user.name.first,
        last: user.name.last,
        full: user.fullName
      },
      userType: user.userType,
      lastLogin: new Date()
    }
  };
};

/**
 * Logout user by invalidating session
 * @param {String} userId - User ID
 * @param {String} refreshToken - Refresh token
 * @returns {Promise<Object>} Logout result
 */
export const logoutUser = async (userId, refreshToken) => {
  if (!refreshToken) {
    throw HttpError.badRequest('Refresh token is required');
  }
  
  // Find session by refresh token
  const session = await AuthSession.findByRefreshToken(refreshToken);
  
  if (!session) {
    // Session not found, but we don't tell the client
    return { success: true };
  }
  
  // Modified comparison to handle populated userId
  const sessionUserId = session.userId._id ? session.userId._id.toString() : session.userId.toString();
  
  // Verify the session belongs to the user
  if (sessionUserId !== userId) {
    throw HttpError.forbidden('Invalid session');
  }
  
  // Revoke the session
  await session.revoke('User logout');
  
  return { success: true };
};

/**
 * Refresh access token using refresh token
 * @param {String} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw HttpError.badRequest('Refresh token is required');
  }
  
  // Find session by refresh token
  const session = await AuthSession.findByRefreshToken(refreshToken);
  
  if (!session) {
    throw HttpError.unauthorized('Invalid refresh token');
  }
  
  // Check if session is valid
  if (!session.isValid) {
    throw HttpError.unauthorized('Session is no longer valid');
  }
  
  // Get user
  const user = await BaseUser.findById(session.userId);
  
  if (!user || user.status !== 'active') {
    // Revoke session if user no longer exists or is inactive
    await session.revoke('User not found or inactive');
    throw HttpError.unauthorized('User account is not active');
  }
  
  // Generate new access token
  const { accessToken, expiresAt } = generateAccessToken(user);
  
  // Update session access
  await session.updateAccess();
  
  return {
    accessToken,
    expiresIn: Math.floor((expiresAt - Date.now()) / 1000)
  };
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate JWT tokens for user
 * @param {Object} user - User object
 * @returns {Object} Access token, refresh token and expiry timestamps
 */
const generateTokens = (user) => {
  // Generate access token
  const { accessToken, expiresAt: accessTokenExpiresAt } = generateAccessToken(user);
  
  // Generate refresh token
  const refreshTokenId = crypto.randomBytes(32).toString('hex');
  const refreshTokenExpiresAt = new Date(Date.now() + ms(JWT_REFRESH_EXPIRY));
  
  const refreshToken = jwt.sign(
    {
      type: 'refresh',
      userId: user._id,
      jti: refreshTokenId
    },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );
  
  return {
    accessToken,
    refreshToken,
    expiresAt: {
      accessToken: accessTokenExpiresAt,
      refreshToken: refreshTokenExpiresAt
    }
  };
};

/**
 * Generate access token for user
 * @param {Object} user - User object
 * @returns {Object} Access token and expiry timestamp
 */
const generateAccessToken = (user) => {
  const tokenId = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + ms(JWT_ACCESS_EXPIRY));
  
  const accessToken = jwt.sign(
    {
      type: 'access',
      userId: user._id,
      email: user.email,
      userType: user.userType,
      jti: tokenId,
      name: user.fullName
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );
  
  return { accessToken, expiresAt };
};

/**
 * Parse user agent to extract device info
 * @param {String} userAgent - User agent string
 * @returns {Object} Device info
 */
const parseUserAgent = (userAgent) => {
  // Simple detection for MVP
  const deviceInfo = {
    type: 'unknown',
    browser: { name: 'unknown', version: 'unknown' },
    os: { name: 'unknown', version: 'unknown' }
  };
  
  if (!userAgent) return deviceInfo;
  
  // Mobile detection
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    deviceInfo.type = 'mobile';
  } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
    deviceInfo.type = 'tablet';
  } else {
    deviceInfo.type = 'desktop';
  }
  
  // Browser detection (simple)
  if (userAgent.includes('Chrome')) {
    deviceInfo.browser.name = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    deviceInfo.browser.name = 'Firefox';
  } else if (userAgent.includes('Safari')) {
    deviceInfo.browser.name = 'Safari';
  } else if (userAgent.includes('Edge')) {
    deviceInfo.browser.name = 'Edge';
  }
  
  return deviceInfo;
};

/**
 * Convert time string to milliseconds
 * @param {String} str - Time string like "15m", "7d"
 * @returns {Number} Time in milliseconds
 */
function ms(str) {
  const match = /^(\d+)([smhdwy])$/.exec(str);
  if (!match) return 0;

  const num = parseInt(match[1], 10);
  const type = match[2];
  
  switch (type) {
    case 's': return num * 1000; // seconds
    case 'm': return num * 60 * 1000; // minutes
    case 'h': return num * 60 * 60 * 1000; // hours
    case 'd': return num * 24 * 60 * 60 * 1000; // days
    case 'w': return num * 7 * 24 * 60 * 60 * 1000; // weeks
    case 'y': return num * 365 * 24 * 60 * 60 * 1000; // years (simplified)
    default: return 0;
  }
}