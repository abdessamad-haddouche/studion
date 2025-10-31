/**
 * Database Error Classes Unit Tests
 * @description Tests for DatabaseError, ValidationError, and DuplicateError classes
 * @file tests/unit/exceptions/database.test.js
 */

import { DatabaseError, ValidationError, DuplicateError } from '../../../src/exceptions/database/index.js';
import { BaseError } from '../../../src/exceptions/base/index.js';

describe('DatabaseError', () => {
    describe('Constructor', () => {
        test('should create DatabaseError with correct properties', () => {
            const mongoError = { code: 6, message: 'Connection failed' };
            const error = new DatabaseError('DB error', {
                code: 'DB_CONNECTION_FAILED',
                mongoError,
                operation: 'find',
                context: { host: 'localhost' }
            });
            
            expect(error.message).toBe('DB error');
            expect(error.name).toBe('DatabaseError');
            expect(error.code).toBe('DB_CONNECTION_FAILED');
            expect(error.mongoError).toBe(mongoError);
            expect(error.operation).toBe('find');
            expect(error.mongoCode).toBe(6);
            expect(error).toBeInstanceOf(BaseError);
        });
        
        test('should use default values when options not provided', () => {
            const error = new DatabaseError('DB error');
            
            expect(error.code).toBe('DB_UNKNOWN_ERROR');
            expect(error.mongoError).toBeNull();
            expect(error.operation).toBeNull();
            expect(error.isOperational).toBe(true);
        });
        
        test('should extract mongo properties from mongoError', () => {
            const mongoError = {
                code: 11000,
                message: 'Duplicate key',
                collection: 'users'
            };
            const error = new DatabaseError('DB error', { mongoError });
            
            expect(error.mongoCode).toBe(11000);
            expect(error.collection).toBe('users');
        });
    });
    
    describe('toDatabaseFormat()', () => {
        test('should include database-specific information', () => {
            const error = new DatabaseError('DB error', {
                operation: 'insert',
                mongoError: { code: 11000 }
            });
            const format = error.toDatabaseFormat();
            
            expect(format).toHaveProperty('database');
            expect(format.database).toEqual({
                operation: 'insert',
                mongoCode: 11000,
                collection: null
            });
            expect(format.name).toBe('DatabaseError');
            expect(format.message).toBe('DB error');
        });
        
        test('should include all base properties', () => {
            const error = new DatabaseError('Test error');
            const format = error.toDatabaseFormat();
            
            expect(format).toHaveProperty('name');
            expect(format).toHaveProperty('message');
            expect(format).toHaveProperty('code');
            expect(format).toHaveProperty('timestamp');
            expect(format).toHaveProperty('database');
        });
    });
    
    describe('Error Detection Methods', () => {
        test('isConnectionError() should detect connection errors by mongo code', () => {
            const connectionCodes = [6, 7, 89, 91];
            
            connectionCodes.forEach(code => {
                const error = new DatabaseError('Connection failed', {
                    mongoError: { code }
                });
                expect(error.isConnectionError()).toBe(true);
            });
        });
        
        test('isConnectionError() should detect connection errors by app code', () => {
            const error = new DatabaseError('Connection failed', {
                code: 'DB_CONNECTION_FAILED'
            });
            expect(error.isConnectionError()).toBe(true);
        });
        
        test('isConnectionError() should return false for non-connection errors', () => {
            const error = new DatabaseError('Other error', {
                mongoError: { code: 100 }
            });
            expect(error.isConnectionError()).toBe(false);
        });
        
        test('isTimeoutError() should detect timeout errors', () => {
            const timeoutError = new DatabaseError('Timeout', {
                mongoError: { code: 50 }
            });
            const codeTimeoutError = new DatabaseError('Timeout', {
                code: 'DB_OPERATION_TIMEOUT'
            });
            
            expect(timeoutError.isTimeoutError()).toBe(true);
            expect(codeTimeoutError.isTimeoutError()).toBe(true);
        });
    });
    
    describe('Static Methods', () => {
        test('fromMongoError() should map MongoDB error codes correctly', () => {
            const connectionError = { code: 6, message: 'Connection failed' };
            const timeoutError = { code: 50, message: 'Operation timed out' };
            const authError = { code: 18, message: 'Auth failed' };
            const unknownError = { code: 999, message: 'Unknown error' };
            
            const dbConnectionError = DatabaseError.fromMongoError(connectionError);
            const dbTimeoutError = DatabaseError.fromMongoError(timeoutError);
            const dbAuthError = DatabaseError.fromMongoError(authError);
            const dbUnknownError = DatabaseError.fromMongoError(unknownError);
            
            expect(dbConnectionError.code).toBe('DB_CONNECTION_FAILED');
            expect(dbTimeoutError.code).toBe('DB_OPERATION_TIMEOUT');
            expect(dbAuthError.code).toBe('DB_AUTH_FAILED');
            expect(dbUnknownError.code).toBe('DB_OPERATION_FAILED');
        });
        
        test('fromMongoError() should preserve original error and options', () => {
            const mongoError = { code: 6, message: 'Connection failed' };
            const options = { operation: 'connect', context: { host: 'localhost' } };
            
            const error = DatabaseError.fromMongoError(mongoError, options);
            
            expect(error.mongoError).toBe(mongoError);
            expect(error.operation).toBe('connect');
            expect(error.context.host).toBe('localhost');
        });
        
        test('connectionFailed() should create connection error', () => {
            const error = DatabaseError.connectionFailed('Connection lost');
            
            expect(error.code).toBe('DB_CONNECTION_FAILED');
            expect(error.message).toBe('Connection lost');
            expect(error.isOperational).toBe(false);
        });
        
        test('operationTimeout() should create timeout error', () => {
            const error = DatabaseError.operationTimeout('Query timed out');
            
            expect(error.code).toBe('DB_OPERATION_TIMEOUT');
            expect(error.message).toBe('Query timed out');
            expect(error.isOperational).toBe(true);
        });
    });
});

describe('ValidationError', () => {
    describe('Constructor', () => {
        test('should create ValidationError with validation-specific properties', () => {
            const error = new ValidationError('Email is required', {
                field: 'email',
                value: '',
                validator: 'required',
                errors: [{ field: 'email', message: 'Required' }]
            });
            
            expect(error.message).toBe('Email is required');
            expect(error.name).toBe('ValidationError');
            expect(error.field).toBe('email');
            expect(error.value).toBe('');
            expect(error.validator).toBe('required');
            expect(error.errors).toHaveLength(1);
            expect(error.statusCode).toBe(422);
            expect(error.isOperational).toBe(true);
            expect(error).toBeInstanceOf(DatabaseError);
        });
        
        test('should use default values', () => {
            const error = new ValidationError('Validation failed');
            
            expect(error.code).toBe('VALIDATION_SCHEMA_ERROR');
            expect(error.field).toBeNull();
            expect(error.value).toBeNull();
            expect(error.validator).toBeNull();
            expect(error.errors).toEqual([]);
            expect(error.operation).toBe('validation');
        });
    });
    
    describe('toValidationFormat()', () => {
        test('should include validation-specific information', () => {
            const error = new ValidationError('Invalid email', {
                field: 'email',
                value: 'invalid-email',
                validator: 'format',
                errors: [{ field: 'email', message: 'Invalid format' }]
            });
            const format = error.toValidationFormat();
            
            expect(format).toHaveProperty('validation');
            expect(format.validation).toEqual({
                field: 'email',
                value: 'invalid-email',
                validator: 'format',
                errors: [{ field: 'email', message: 'Invalid format' }]
            });
            expect(format.statusCode).toBe(422);
        });
        
        test('should exclude value when field is null', () => {
            const error = new ValidationError('Validation failed', {
                value: 'some-value'
            });
            const format = error.toValidationFormat();
            
            expect(format.validation.value).toBeUndefined();
        });
        
        test('should exclude errors when array is empty', () => {
            const error = new ValidationError('Validation failed');
            const format = error.toValidationFormat();
            
            expect(format.validation.errors).toBeUndefined();
        });
    });
    
    describe('toClientSafe()', () => {
        test('should return client-safe validation error', () => {
            const error = new ValidationError('Invalid email', {
                field: 'email',
                value: 'sensitive@secret.com',
                validator: 'format',
                errors: [
                    { field: 'email', message: 'Invalid format', validator: 'format', value: 'sensitive' }
                ]
            });
            const safe = error.toClientSafe();
            
            expect(safe.field).toBe('email');
            expect(safe.validator).toBe('format');
            expect(safe.statusCode).toBe(422);
            expect(safe.errors).toEqual([
                { field: 'email', message: 'Invalid format', validator: 'format' }
            ]);
            expect(safe).not.toHaveProperty('value');
            expect(safe.errors[0]).not.toHaveProperty('value');
        });
    });
    
    describe('fromMongoError()', () => {
        test('should handle Mongoose validation errors', () => {
            const mongooseError = {
                name: 'ValidationError',
                message: 'Validation failed',
                errors: {
                    email: {
                        message: 'Email is required',
                        path: 'email',
                        kind: 'required',
                        value: undefined
                    },
                    age: {
                        message: 'Age must be at least 18',
                        path: 'age',
                        kind: 'min',
                        value: 15
                    }
                }
            };
            
            const validationError = ValidationError.fromMongoError(mongooseError);
            
            expect(validationError.field).toBe('email');
            expect(validationError.errors).toHaveLength(2);
            expect(validationError.errors[0]).toEqual({
                field: 'email',
                message: 'Email is required',
                validator: 'required'
            });
            expect(validationError.errors[1]).toEqual({
                field: 'age',
                message: 'Age must be at least 18',
                validator: 'min'
            });
        });
        
        test('should handle non-Mongoose validation errors', () => {
            const genericError = {
                name: 'SomeError',
                message: 'Generic validation failed'
            };
            
            const validationError = ValidationError.fromMongoError(genericError);
            
            expect(validationError.message).toBe('Generic validation failed');
            expect(validationError.code).toBe('VALIDATION_SCHEMA_ERROR');
        });
        
        test('should handle empty Mongoose errors', () => {
            const emptyError = {
                name: 'ValidationError',
                errors: {}
            };
            
            const validationError = ValidationError.fromMongoError(emptyError);
            
            expect(validationError.message).toBe('Validation failed');
            expect(validationError.errors).toEqual([]);
        });
    });
    
    describe('Static Factory Methods', () => {
        test('requiredField() should create required field error', () => {
            const error = ValidationError.requiredField('email');
            
            expect(error.code).toBe('VALIDATION_REQUIRED_FIELD');
            expect(error.field).toBe('email');
            expect(error.validator).toBe('required');
            expect(error.message).toBe('email is required');
        });
        
        test('invalidFormat() should create format error', () => {
            const error = ValidationError.invalidFormat('email', 'invalid-email');
            
            expect(error.code).toBe('VALIDATION_INVALID_FORMAT');
            expect(error.field).toBe('email');
            expect(error.value).toBe('invalid-email');
            expect(error.validator).toBe('format');
            expect(error.message).toBe('email has invalid format');
        });
        
        test('invalidType() should create type error', () => {
            const error = ValidationError.invalidType('age', 'string', 'number');
            
            expect(error.code).toBe('VALIDATION_INVALID_TYPE');
            expect(error.field).toBe('age');
            expect(error.value).toBe('string');
            expect(error.validator).toBe('type');
            expect(error.message).toBe('age must be number');
            expect(error.context.expectedType).toBe('number');
        });
    });
});

describe('DuplicateError', () => {
    describe('Constructor', () => {
        test('should create DuplicateError with duplicate-specific properties', () => {
            const error = new DuplicateError('Email already exists', {
                field: 'email',
                value: 'user@example.com',
                collection: 'users'
            });
            
            expect(error.message).toBe('Email already exists');
            expect(error.name).toBe('DuplicateError');
            expect(error.field).toBe('email');
            expect(error.value).toBe('user@example.com');
            expect(error.collection).toBe('users');
            expect(error.statusCode).toBe(409);
            expect(error.isOperational).toBe(true);
            expect(error).toBeInstanceOf(DatabaseError);
        });
        
        test('should use default values', () => {
            const error = new DuplicateError('Duplicate error');
            
            expect(error.code).toBe('DUPLICATE_KEY_ERROR');
            expect(error.field).toBeNull();
            expect(error.value).toBeNull();
            expect(error.collection).toBeNull();
            expect(error.operation).toBe('insert');
        });
    });
    
    describe('toDuplicateFormat()', () => {
        test('should include duplicate-specific information', () => {
            const error = new DuplicateError('Email exists', {
                field: 'email',
                value: 'user@example.com',
                collection: 'users'
            });
            const format = error.toDuplicateFormat();
            
            expect(format).toHaveProperty('duplicate');
            expect(format.duplicate).toEqual({
                field: 'email',
                value: 'user@example.com',
                collection: 'users'
            });
            expect(format.statusCode).toBe(409);
        });
        
        test('should exclude value when field is null', () => {
            const error = new DuplicateError('Duplicate', {
                value: 'some-value'
            });
            const format = error.toDuplicateFormat();
            
            expect(format.duplicate.value).toBeUndefined();
        });
    });
    
    describe('toClientSafe()', () => {
        test('should hide sensitive duplicate values', () => {
            const error = new DuplicateError('Email exists', {
                field: 'email',
                value: 'sensitive@secret.com'
            });
            const safe = error.toClientSafe();
            
            expect(safe.field).toBe('email');
            expect(safe.statusCode).toBe(409);
            expect(safe).not.toHaveProperty('value');
        });
    });
    
    describe('fromMongoError()', () => {
        test('should parse E11000 MongoDB duplicate key errors', () => {
            const e11000Error = {
                code: 11000,
                message: 'E11000 duplicate key error collection: mydb.users index: email_1 dup key: { email: "user@example.com" }'
            };
            
            const duplicateError = DuplicateError.fromMongoError(e11000Error);
            
            expect(duplicateError.field).toBe('email');
            expect(duplicateError.collection).toBe('users');
            expect(duplicateError.message).toBe('email already exists');
        });
        
        test('should handle complex collection names', () => {
            const e11000Error = {
                code: 11000,
                message: 'E11000 duplicate key error collection: prod_db.user_profiles index: username_1 dup key: { username: "johndoe" }'
            };
            
            const duplicateError = DuplicateError.fromMongoError(e11000Error);
            
            expect(duplicateError.field).toBe('username');
            expect(duplicateError.collection).toBe('user_profiles');
        });
        
        test('should handle unparseable errors gracefully', () => {
            const weirdError = {
                code: 11000,
                message: 'Some weird duplicate error format'
            };
            
            const duplicateError = DuplicateError.fromMongoError(weirdError);
            
            expect(duplicateError.field).toBeNull();
            expect(duplicateError.message).toBe('A record with this information already exists');
        });
        
        test('should map field to specific error codes', () => {
            const emailError = {
                code: 11000,
                message: 'E11000 duplicate key error collection: db.users index: email_1 dup key: { email: "test@example.com" }'
            };
            const usernameError = {
                code: 11000,
                message: 'E11000 duplicate key error collection: db.users index: username_1 dup key: { username: "testuser" }'
            };
            
            const emailDuplicateError = DuplicateError.fromMongoError(emailError);
            const usernameDuplicateError = DuplicateError.fromMongoError(usernameError);
            
            expect(emailDuplicateError.code).toBe('DUPLICATE_EMAIL_ERROR');
            expect(usernameDuplicateError.code).toBe('DUPLICATE_USERNAME_ERROR');
        });
    });
    
    describe('Static Factory Methods', () => {
        test('duplicateEmail() should create email duplicate error', () => {
            const error = DuplicateError.duplicateEmail('user@example.com');
            
            expect(error.code).toBe('DUPLICATE_EMAIL_ERROR');
            expect(error.field).toBe('email');
            expect(error.value).toBe('user@example.com');
            expect(error.message).toBe('Email address already exists');
        });
        
        test('duplicateUsername() should create username duplicate error', () => {
            const error = DuplicateError.duplicateUsername('johndoe');
            
            expect(error.code).toBe('DUPLICATE_USERNAME_ERROR');
            expect(error.field).toBe('username');
            expect(error.value).toBe('johndoe');
            expect(error.message).toBe('Username already exists');
        });
        
        test('isDuplicateKeyError() should detect E11000 errors', () => {
            const e11000Error = { code: 11000 };
            const e11000MessageError = { message: 'E11000 duplicate key error...' };
            const duplicateMessageError = { message: 'duplicate key violation' };
            const otherError = { code: 50 };
            
            expect(DuplicateError.isDuplicateKeyError(e11000Error)).toBe(true);
            expect(DuplicateError.isDuplicateKeyError(e11000MessageError)).toBe(true);
            expect(DuplicateError.isDuplicateKeyError(duplicateMessageError)).toBe(true);
            expect(DuplicateError.isDuplicateKeyError(otherError)).toBe(false);
        });
    });
});

describe('Database Errors Integration', () => {
    test('should maintain proper inheritance chain', () => {
        const validationError = new ValidationError('Test');
        const duplicateError = new DuplicateError('Test');
        
        expect(validationError).toBeInstanceOf(ValidationError);
        expect(validationError).toBeInstanceOf(DatabaseError);
        expect(validationError).toBeInstanceOf(BaseError);
        expect(validationError).toBeInstanceOf(Error);
        
        expect(duplicateError).toBeInstanceOf(DuplicateError);
        expect(duplicateError).toBeInstanceOf(DatabaseError);
        expect(duplicateError).toBeInstanceOf(BaseError);
        expect(duplicateError).toBeInstanceOf(Error);
    });
    
    test('should work with BaseError.isOperational()', () => {
        const validationError = new ValidationError('Test');
        const duplicateError = new DuplicateError('Test');
        const connectionError = DatabaseError.connectionFailed();
        
        expect(BaseError.isOperational(validationError)).toBe(true);
        expect(BaseError.isOperational(duplicateError)).toBe(true);
        expect(BaseError.isOperational(connectionError)).toBe(false);
    });
    
    test('should handle real-world MongoDB error simulation', () => {
        // Simulate real MongoDB/Mongoose errors
        const mongooseValidationError = {
            name: 'ValidationError',
            errors: {
                email: { message: 'Email is required', path: 'email', kind: 'required' },
                password: { message: 'Password too short', path: 'password', kind: 'minlength' }
            }
        };
        
        const mongoE11000Error = {
            code: 11000,
            message: 'E11000 duplicate key error collection: myapp.users index: email_1 dup key: { email: "existing@example.com" }'
        };
        
        const mongoConnectionError = {
            code: 6,
            message: 'connection 0 to localhost:27017 closed'
        };
        
        // Test error creation from real MongoDB errors
        const validationError = ValidationError.fromMongoError(mongooseValidationError);
        const duplicateError = DuplicateError.fromMongoError(mongoE11000Error);
        const connectionError = DatabaseError.fromMongoError(mongoConnectionError);
        
        expect(validationError.errors).toHaveLength(2);
        expect(duplicateError.field).toBe('email');
        expect(connectionError.isConnectionError()).toBe(true);
    });
});