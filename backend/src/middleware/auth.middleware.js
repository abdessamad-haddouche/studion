/**
 * Authentication Middleware
 * @module middleware/auth
 * @description JWT authentication middleware
 */

import jwt from 'jsonwebtoken';
import { HttpError } from '#exceptions/index.js';
import { Student, Admin } from '../models/users/index.js';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'studion-dev-secret';

/**
 * Verify JWT token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateJWT = async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(HttpError.unauthorized('Authorization token required'));
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch full user data based on userType
        let user;
        if (decoded.userType === 'admin') {
            user = await Admin.findById(decoded.userId)
                .select('-password -security')
                .lean();
        } else {
            user = await Student.findById(decoded.userId)
                .select('-password -security')
                .lean();
        }
        
        if (!user) {
            return next(HttpError.unauthorized('User not found'));
        }
        
        // Check if user is active
        if (user.status !== 'active') {
            return next(HttpError.unauthorized('User account is inactive'));
        }
        
        // Add full user data to request
        req.user = {
            ...decoded,
            ...user,
            fullName: `${user.name?.first || ''} ${user.name?.last || ''}`.trim()
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(HttpError.unauthorized('Token expired'));
        }
        
        if (error.name === 'JsonWebTokenError') {
            return next(HttpError.unauthorized('Invalid token'));
        }
        
        next(error);
    }
};

/**
 * Optional JWT authentication - doesn't error if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const optionalAuthenticateJWT = async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Continue without authentication
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch full user data based on userType
        let user;
        if (decoded.userType === 'admin') {
            user = await Admin.findById(decoded.userId)
                .select('-password -security')
                .lean();
        } else {
            user = await Student.findById(decoded.userId)
                .select('-password -security')
                .lean();
        }
        
        if (user && user.status === 'active') {
            // Add full user data to request
            req.user = {
                ...decoded,
                ...user,
                fullName: `${user.name?.first || ''} ${user.name?.last || ''}`.trim()
            };
        }
    } catch (error) {
        // Continue without authentication on error
    }
    
    next();
};

export default { authenticateJWT, optionalAuthenticateJWT };