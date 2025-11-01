/**
 * Auth Service Unit Tests - registerUser.test.js
 * @description Test suite for user registration functionality
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { registerUser } from '#services/auth.service.js';
import { BaseUser, Student } from '#models/users/index.js';
import { HttpError } from '#exceptions/index.js';

describe('Auth Service - registerUser', () => {
  let mongoServer;
  
  // Valid test data
  const validUserData = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
    academicLevel: 'undergraduate',
    institution: 'Test University',
    fieldOfStudy: 'Computer Science'
  };
  
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
  
  afterEach(async () => {
    await BaseUser.deleteMany({});
  });

  describe('Successful Registration', () => {
    test('should register a new user with valid data', async () => {
      // Act
      const result = await registerUser(validUserData, { ip: '127.0.0.1' });
      
      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(validUserData.email);
      expect(result.name.first).toBe(validUserData.firstName);
      expect(result.name.last).toBe(validUserData.lastName);
      
      // Check if user was saved to database
      // Important: select password field explicitly since it's excluded by default
      const savedUser = await Student.findOne({ email: validUserData.email }).select('+password');
      expect(savedUser).toBeDefined();
      expect(savedUser.email).toBe(validUserData.email);
      expect(savedUser.name.first).toBe(validUserData.firstName);
      expect(savedUser.name.last).toBe(validUserData.lastName);
      
      // Password should be hashed, not stored as plaintext
      expect(savedUser.password).not.toBe(validUserData.password);
      expect(savedUser.password).toMatch(/^\$2[aby]/); // bcrypt pattern
    });
    
    test('should set academic information correctly', async () => {
      // Act
      const result = await registerUser(validUserData);
      
      // Assert
      const savedUser = await Student.findOne({ email: validUserData.email });
      expect(savedUser.academic.level).toBe(validUserData.academicLevel);
      expect(savedUser.academic.institution).toBe(validUserData.institution);
      expect(savedUser.academic.fieldOfStudy).toBe(validUserData.fieldOfStudy);
    });
    
    test('should set metadata correctly', async () => {
      // Arrange
      const metadata = {
        ip: '192.168.1.1',
        source: 'mobile'
      };
      
      // Act
      await registerUser(validUserData, metadata);
      
      // Assert
      const savedUser = await Student.findOne({ email: validUserData.email });
      expect(savedUser.metadata.registrationIP).toBe(metadata.ip);
      expect(savedUser.metadata.registrationSource).toBe(metadata.source);
    });
    
    test('should convert email to lowercase', async () => {
      // Arrange
      const mixedCaseEmail = 'TeSt@ExAmPle.CoM';
      const userData = { ...validUserData, email: mixedCaseEmail };
      
      // Act
      const result = await registerUser(userData);
      
      // Assert
      expect(result.email).toBe(mixedCaseEmail.toLowerCase());
      
      // Check database
      const savedUser = await Student.findOne({ email: mixedCaseEmail.toLowerCase() });
      expect(savedUser).toBeDefined();
      expect(savedUser.email).toBe(mixedCaseEmail.toLowerCase());
    });
    
    test('should use default values when optional fields are missing', async () => {
      // Arrange
      const minimalUserData = {
        email: 'minimal@example.com',
        password: 'SecurePass123!',
        firstName: 'Minimal',
        lastName: 'User'
      };
      
      // Act
      await registerUser(minimalUserData);
      
      // Assert
      const savedUser = await Student.findOne({ email: minimalUserData.email });
      expect(savedUser.academic.level).toBe('undergraduate'); // Default academic level
      expect(savedUser.academic.institution).toBeNull();
      expect(savedUser.academic.fieldOfStudy).toBeNull();
      expect(savedUser.metadata.registrationSource).toBe('web'); // Default source
    });
  });
  
  describe('Registration Validation', () => {
    test('should throw conflict error when email already exists', async () => {
      // Arrange
      // Create a user first
      await registerUser(validUserData);
      
      // Act & Assert
      await expect(registerUser(validUserData))
        .rejects
        .toThrow('Email already exists');
        
      // Verify the error is an HttpError with conflict status
      try {
        await registerUser(validUserData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toBe(409); // Conflict status code
      }
    });
    
    test('should not be case-sensitive when checking for existing email', async () => {
      // Arrange
      await registerUser(validUserData);
      
      // Try to register with same email in different case
      const upperCaseEmail = validUserData.email.toUpperCase();
      const userData = { ...validUserData, email: upperCaseEmail };
      
      // Act & Assert
      await expect(registerUser(userData))
        .rejects
        .toThrow('Email already exists');
    });
  });
  
  describe('Return Value Format', () => {
    test('should return user object without sensitive data', async () => {
      // Act
      const result = await registerUser(validUserData);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('academicLevel');
      expect(result).toHaveProperty('createdAt');
      
      // Should not contain sensitive data
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('security');
      
      // Check name object structure
      expect(result.name).toHaveProperty('first', validUserData.firstName);
      expect(result.name).toHaveProperty('last', validUserData.lastName);
      expect(result.name).toHaveProperty('full', `${validUserData.firstName} ${validUserData.lastName}`);
    });
  });
});