/**
 * BaseUser Model Unit Tests - FIXED VERSION
 * @description Comprehensive tests for BaseUser model functionality
 * @file tests/unit/models/BaseUser.test.js
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import BaseUser from '#models/users/BaseUser.js';

describe('BaseUser Model', () => {
    let mongoServer;
    
    // Valid test data
    const validUserData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: {
            first: 'John',
            last: 'Doe'
        }
    };
    
    // Setup and teardown
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
    });

    describe('User Creation & Validation', () => {
        test('should create user with valid data', async () => {
            const user = new BaseUser(validUserData);
            const savedUser = await user.save();
            
            expect(savedUser.email).toBe('test@example.com');
            expect(savedUser.name.first).toBe('John');
            expect(savedUser.name.last).toBe('Doe');
            expect(savedUser.status).toBe('active');
            expect(savedUser.verification.isEmailVerified).toBe(false);
            expect(savedUser.id).toBeDefined();
        });
        
        test('should hash password on save', async () => {
            const user = new BaseUser(validUserData);
            const savedUser = await user.save();
            
            // Password should be hashed
            expect(savedUser.password).not.toBe(validUserData.password);
            expect(savedUser.password).toMatch(/^\$2[aby]\$12\$/); // bcrypt hash pattern
            
            // Should be able to compare password
            const isMatch = await bcrypt.compare(validUserData.password, savedUser.password);
            expect(isMatch).toBe(true);
        });
        
        test('should require email', async () => {
            const user = new BaseUser({ ...validUserData, email: undefined });
            
            await expect(user.save()).rejects.toThrow('Email is required');
        });
        
        test('should require password', async () => {
            const user = new BaseUser({ ...validUserData, password: undefined });
            
            await expect(user.save()).rejects.toThrow('Password is required');
        });
        
        test('should require first name', async () => {
            const user = new BaseUser({ 
                ...validUserData, 
                name: { last: 'Doe' }
            });
            
            await expect(user.save()).rejects.toThrow('First name is required');
        });
        
        test('should require last name', async () => {
            const user = new BaseUser({ 
                ...validUserData, 
                name: { first: 'John' }
            });
            
            await expect(user.save()).rejects.toThrow('Last name is required');
        });
    });
    
    describe('Email Validation', () => {
        test('should accept valid email formats', async () => {
            const validEmails = [
                'test@example.com',
                'user.name@example.co.uk',
                'test+tag@example.org',
                'user123@test-domain.com'
            ];
            
            for (const email of validEmails) {
                const user = new BaseUser({ ...validUserData, email });
                await expect(user.save()).resolves.toBeDefined();
                await user.deleteOne();
            }
        });
        
        test('should reject invalid email formats', async () => {
            const invalidEmails = [
                'notanemail',
                'test@',
                '@example.com',
                'test@.com',
                'test@com'
            ];
            
            for (const email of invalidEmails) {
                const user = new BaseUser({ ...validUserData, email });
                await expect(user.save()).rejects.toThrow();
            }
        });
        
        test('should convert email to lowercase', async () => {
            const user = new BaseUser({ 
                ...validUserData, 
                email: 'TEST@EXAMPLE.COM' 
            });
            const savedUser = await user.save();
            
            expect(savedUser.email).toBe('test@example.com');
        });
        
        test('should enforce unique email constraint', async () => {
            const user1 = new BaseUser(validUserData);
            await user1.save();
            
            const user2 = new BaseUser(validUserData);
            await expect(user2.save()).rejects.toThrow(/duplicate key/i);
        });
    });
    
    describe('Virtual Properties', () => {
        test('should generate fullName virtual', async () => {
            const user = new BaseUser(validUserData);
            const savedUser = await user.save();
            
            expect(savedUser.fullName).toBe('John Doe');
        });
        
        test('should generate initials virtual', async () => {
            const user = new BaseUser(validUserData);
            const savedUser = await user.save();
            
            expect(savedUser.initials).toBe('JD');
        });
        
        test('should calculate isLocked virtual', async () => {
            const user = new BaseUser(validUserData);
            const savedUser = await user.save();
            
            // Initially not locked
            expect(savedUser.isLocked).toBe(false);
            
            // Lock the account
            savedUser.security.lockUntil = new Date(Date.now() + 60000);
            expect(savedUser.isLocked).toBe(true);
        });
        
        test('should calculate isActive virtual', async () => {
            const user = new BaseUser(validUserData);
            const savedUser = await user.save();
            
            // Active and not locked
            expect(savedUser.isActive).toBe(true);
            
            // Inactive status
            savedUser.status = 'suspended';
            expect(savedUser.isActive).toBe(false);
        });
    });
    
    describe('Instance Methods', () => {
        describe('comparePassword()', () => {
            test('should return true for correct password', async () => {
                const user = new BaseUser(validUserData);
                const savedUser = await user.save();
                
                const isMatch = await savedUser.comparePassword('SecurePass123!');
                expect(isMatch).toBe(true);
            });
            
            test('should return false for incorrect password', async () => {
                const user = new BaseUser(validUserData);
                const savedUser = await user.save();
                
                const isMatch = await savedUser.comparePassword('WrongPassword');
                expect(isMatch).toBe(false);
            });
        });
        
        describe('handleFailedLogin()', () => {
            test('should increment login attempts', async () => {
                const user = new BaseUser(validUserData);
                const savedUser = await user.save();
                
                await savedUser.handleFailedLogin();
                
                // Refresh from database with specific security fields
                const refreshedUser = await BaseUser.findById(savedUser._id)
                    .select('+security.loginAttempts +security.lockUntil');
                
                expect(refreshedUser.security.loginAttempts).toBe(1);
            });
            
            test('should lock account after max attempts', async () => {
                const user = new BaseUser(validUserData);
                const savedUser = await user.save();
                
                // Simulate 4 failed attempts
                savedUser.security.loginAttempts = 4;
                await savedUser.save();
                
                // 5th attempt should lock the account
                await savedUser.handleFailedLogin();
                
                // Refresh from database
                const refreshedUser = await BaseUser.findById(savedUser._id)
                    .select('+security.loginAttempts +security.lockUntil');
                
                expect(refreshedUser.security.lockUntil).toBeDefined();
                expect(refreshedUser.isLocked).toBe(true);
            });
            
            test('should reset attempts if lockout expired', async () => {
                const user = new BaseUser(validUserData);
                const savedUser = await user.save();
                
                // Set expired lockout
                savedUser.security.loginAttempts = 5;
                savedUser.security.lockUntil = new Date(Date.now() - 60000);
                await savedUser.save();
                
                await savedUser.handleFailedLogin();
                
                // Refresh from database
                const refreshedUser = await BaseUser.findById(savedUser._id)
                    .select('+security.loginAttempts +security.lockUntil');
                
                expect(refreshedUser.security.loginAttempts).toBe(1);
                expect(refreshedUser.security.lockUntil).toBeUndefined();
            });
        });
        
        describe('handleSuccessfulLogin()', () => {
            test('should reset login attempts and update timestamps', async () => {
                const user = new BaseUser(validUserData);
                const savedUser = await user.save();
                
                // Set some failed attempts
                savedUser.security.loginAttempts = 3;
                await savedUser.save();
                
                const loginInfo = { ip: '192.168.1.1' };
                await savedUser.handleSuccessfulLogin(loginInfo);
                
                // Refresh from database
                const refreshedUser = await BaseUser.findById(savedUser._id);
                
                expect(refreshedUser.security.loginAttempts).toBeUndefined();
                expect(refreshedUser.lastLoginAt).toBeDefined();
                expect(refreshedUser.metadata.loginCount).toBe(1);
                expect(refreshedUser.metadata.lastLoginIP).toBe('192.168.1.1');
            });
        });
    });
    
    describe('Static Methods', () => {
        describe('findByEmail()', () => {
            test('should find user by email and include password', async () => {
                const user = new BaseUser(validUserData);
                await user.save();
                
                const foundUser = await BaseUser.findByEmail('test@example.com');
                
                expect(foundUser).toBeDefined();
                expect(foundUser.email).toBe('test@example.com');
                expect(foundUser.password).toBeDefined();
            });
            
            test('should return null for non-existent email', async () => {
                const foundUser = await BaseUser.findByEmail('nonexistent@example.com');
                expect(foundUser).toBeNull();
            });
        });
        
        describe('findActive()', () => {
            test('should return only active users', async () => {
                // Create active user
                const activeUser = new BaseUser(validUserData);
                await activeUser.save();
                
                // Create suspended user
                const suspendedUser = new BaseUser({
                    ...validUserData,
                    email: 'suspended@example.com',
                    status: 'suspended'
                });
                await suspendedUser.save();
                
                const activeUsers = await BaseUser.findActive();
                
                expect(activeUsers).toHaveLength(1);
                expect(activeUsers[0].status).toBe('active');
            });
        });
        
        describe('search()', () => {
            test('should search users by name and email', async () => {
                const user1 = new BaseUser(validUserData);
                await user1.save();
                
                const user2 = new BaseUser({
                    ...validUserData,
                    email: 'jane@example.com',
                    name: { first: 'Jane', last: 'Smith' }
                });
                await user2.save();
                
                // Search by first name
                const results1 = await BaseUser.search('John');
                expect(results1).toHaveLength(1);
                expect(results1[0].name.first).toBe('John');
                
                // Search by email
                const results2 = await BaseUser.search('jane@');
                expect(results2).toHaveLength(1);
                expect(results2[0].email).toBe('jane@example.com');
            });
        });
        
        describe('getStats()', () => {
            test('should return user statistics', async () => {
                const user1 = new BaseUser(validUserData);
                await user1.save();
                
                const user2 = new BaseUser({
                    ...validUserData,
                    email: 'verified@example.com',
                    verification: { isEmailVerified: true }
                });
                await user2.save();
                
                const stats = await BaseUser.getStats();
                
                expect(stats).toHaveLength(1);
                expect(stats[0]).toHaveProperty('_id', null);
                expect(stats[0].count).toBe(2);
                expect(stats[0].active).toBe(2);
                expect(stats[0].verified).toBe(1);
            });
        });
    });
    
    describe('Query Helpers', () => {
        test('should filter active users', async () => {
            const activeUser = new BaseUser(validUserData);
            await activeUser.save();
            
            const suspendedUser = new BaseUser({
                ...validUserData,
                email: 'suspended@example.com',
                status: 'suspended'
            });
            await suspendedUser.save();
            
            const activeUsers = await BaseUser.find().active();
            
            expect(activeUsers).toHaveLength(1);
            expect(activeUsers[0].status).toBe('active');
        });
        
        test('should filter verified users', async () => {
            const unverifiedUser = new BaseUser(validUserData);
            await unverifiedUser.save();
            
            const verifiedUser = new BaseUser({
                ...validUserData,
                email: 'verified@example.com',
                verification: { isEmailVerified: true }
            });
            await verifiedUser.save();
            
            const verifiedUsers = await BaseUser.find().verified();
            
            expect(verifiedUsers).toHaveLength(1);
            expect(verifiedUsers[0].verification.isEmailVerified).toBe(true);
        });
    });
    
    describe('Indexes and Performance', () => {
        test('should have created proper indexes', async () => {
            const indexes = await BaseUser.collection.getIndexes();
            
            // Check for important indexes - use Object.hasOwnProperty for dot notation properties
            expect(indexes).toHaveProperty('email_1');
            expect(indexes).toHaveProperty('email_1_status_1');
            expect(Object.hasOwnProperty.call(indexes, 'verification.isEmailVerified_1_status_1')).toBe(true);
            expect(indexes).toHaveProperty('lastActiveAt_-1');
            expect(indexes).toHaveProperty('createdAt_-1');
            expect(indexes).toHaveProperty('userType_1_status_1');
        });
    });
});
