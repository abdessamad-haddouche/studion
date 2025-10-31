/**
 * Base Error Classes Unit Tests
 * @description Tests for BaseError and HttpError classes
 * @file tests/unit/exceptions/base.test.js
 */

import { BaseError, HttpError } from '../../../src/exceptions/base/index.js';

describe('BaseError', () => {
    describe('Constructor', () => {
        test('should create BaseError with correct properties', () => {
            const error = new BaseError('Test message', {
                code: 'TEST_CODE',
                context: { userId: '123' },
                isOperational: true
            });
            
            expect(error.message).toBe('Test message');
            expect(error.name).toBe('BaseError');
            expect(error.code).toBe('TEST_CODE');
            expect(error.context.userId).toBe('123');
            expect(error.isOperational).toBe(true);
            expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            expect(error).toBeInstanceOf(Error);
        });
        
        test('should use default values when options not provided', () => {
            const error = new BaseError('Test message');
            
            expect(error.code).toBe('UNKNOWN_ERROR');
            expect(error.context).toEqual({});
            expect(error.isOperational).toBe(true);
        });
        
        test('should respect isOperational false setting', () => {
            const error = new BaseError('Test message', { isOperational: false });
            expect(error.isOperational).toBe(false);
        });
        
        test('should capture stack trace', () => {
            const error = new BaseError('Test message');
            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('BaseError');
        });
    });
    
    describe('toJSON()', () => {
        test('should return correct JSON format', () => {
            const error = new BaseError('Test message', {
                code: 'TEST_CODE',
                context: { field: 'email' }
            });
            const json = error.toJSON();
            
            expect(json).toEqual({
                name: 'BaseError',
                message: 'Test message',
                code: 'TEST_CODE',
                context: { field: 'email' },
                timestamp: expect.any(String),
                isOperational: true
            });
        });
        
        test('should include all properties in JSON', () => {
            const error = new BaseError('Test');
            const json = error.toJSON();
            
            expect(json).toHaveProperty('name');
            expect(json).toHaveProperty('message');
            expect(json).toHaveProperty('code');
            expect(json).toHaveProperty('context');
            expect(json).toHaveProperty('timestamp');
            expect(json).toHaveProperty('isOperational');
        });
    });
    
    describe('toClientSafe()', () => {
        test('should return client-safe format without sensitive data', () => {
            const error = new BaseError('Test message', {
                code: 'TEST_CODE',
                context: { secret: 'sensitive-data', userId: '123' }
            });
            const safe = error.toClientSafe();
            
            expect(safe).toEqual({
                error: 'BaseError',
                message: 'Test message',
                code: 'TEST_CODE',
                timestamp: expect.any(String)
            });
            
            expect(safe).not.toHaveProperty('context');
            expect(safe).not.toHaveProperty('secret');
            expect(safe).not.toHaveProperty('stack');
        });
        
        test('should not expose internal properties', () => {
            const error = new BaseError('Test message');
            const safe = error.toClientSafe();
            
            expect(safe).not.toHaveProperty('isOperational');
            expect(safe).not.toHaveProperty('stack');
        });
    });
    
    describe('Static Methods', () => {
        test('isOperational() should correctly identify operational errors', () => {
            const operationalError = new BaseError('Test', { isOperational: true });
            const nonOperationalError = new BaseError('Test', { isOperational: false });
            const regularError = new Error('Test');
            
            expect(BaseError.isOperational(operationalError)).toBe(true);
            expect(BaseError.isOperational(nonOperationalError)).toBe(false);
            expect(BaseError.isOperational(regularError)).toBe(false);
        });
        
        test('isOperational() should handle null/undefined', () => {
            expect(BaseError.isOperational(null)).toBe(false);
            expect(BaseError.isOperational(undefined)).toBe(false);
        });
    });
});

describe('HttpError', () => {
    describe('Constructor', () => {
        test('should create HttpError with HTTP-specific properties', () => {
            const error = new HttpError('Bad request', {
                statusCode: 400,
                code: 'BAD_REQUEST'
            });
            
            expect(error.message).toBe('Bad request');
            expect(error.name).toBe('HttpError');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('BAD_REQUEST');
            expect(error).toBeInstanceOf(BaseError);
            expect(error).toBeInstanceOf(Error);
        });
        
        test('should default to 500 status code', () => {
            const error = new HttpError('Server error');
            expect(error.statusCode).toBe(500);
        });
        
        test('should automatically set operational flag based on status code', () => {
            const clientError = new HttpError('Client error', { statusCode: 400 });
            const serverError = new HttpError('Server error', { statusCode: 500 });
            
            expect(clientError.isOperational).toBe(true);
            expect(serverError.isOperational).toBe(false);
        });
        
        test('should respect explicit isOperational setting', () => {
            const error = new HttpError('Error', {
                statusCode: 400,
                isOperational: false
            });
            expect(error.isOperational).toBe(false);
        });
    });
    
    describe('toHttpResponse()', () => {
        test('should return correct HTTP response format', () => {
            const error = new HttpError('Test error', {
                statusCode: 400,
                code: 'TEST_ERROR',
                context: { field: 'email' }
            });
            const response = error.toHttpResponse();
            
            expect(response).toEqual({
                success: false,
                error: {
                    name: 'HttpError',
                    message: 'Test error',
                    code: 'TEST_ERROR',
                    statusCode: 400,
                    timestamp: expect.any(String),
                    context: { field: 'email' }
                }
            });
        });
        
        test('should include context for client errors (4xx)', () => {
            const error = new HttpError('Client error', {
                statusCode: 400,
                context: { field: 'email' }
            });
            const response = error.toHttpResponse();
            
            expect(response.error.context).toEqual({ field: 'email' });
        });
        
        test('should not include context for server errors (5xx)', () => {
            const error = new HttpError('Server error', {
                statusCode: 500,
                context: { sensitive: 'data' }
            });
            const response = error.toHttpResponse();
            
            expect(response.error).not.toHaveProperty('context');
        });
    });
    
    describe('Status Detection Methods', () => {
        test('isClientError() should correctly identify 4xx errors', () => {
            const clientError = new HttpError('Client error', { statusCode: 400 });
            const serverError = new HttpError('Server error', { statusCode: 500 });
            const redirectError = new HttpError('Redirect', { statusCode: 301 });
            
            expect(clientError.isClientError()).toBe(true);
            expect(serverError.isClientError()).toBe(false);
            expect(redirectError.isClientError()).toBe(false);
        });
        
        test('isServerError() should correctly identify 5xx errors', () => {
            const clientError = new HttpError('Client error', { statusCode: 400 });
            const serverError = new HttpError('Server error', { statusCode: 500 });
            
            expect(clientError.isServerError()).toBe(false);
            expect(serverError.isServerError()).toBe(true);
        });
    });
    
    describe('Static Factory Methods', () => {
        test('badRequest() should create 400 error', () => {
            const error = HttpError.badRequest('Invalid input');
            
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('BAD_REQUEST');
            expect(error.message).toBe('Invalid input');
            expect(error.isOperational).toBe(true);
        });
        
        test('unauthorized() should create 401 error', () => {
            const error = HttpError.unauthorized('Access denied');
            
            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('UNAUTHORIZED');
            expect(error.message).toBe('Access denied');
        });
        
        test('forbidden() should create 403 error', () => {
            const error = HttpError.forbidden('Forbidden resource');
            
            expect(error.statusCode).toBe(403);
            expect(error.code).toBe('FORBIDDEN');
            expect(error.message).toBe('Forbidden resource');
        });
        
        test('notFound() should create 404 error', () => {
            const error = HttpError.notFound('User not found');
            
            expect(error.statusCode).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
            expect(error.message).toBe('User not found');
        });
        
        test('conflict() should create 409 error', () => {
            const error = HttpError.conflict('Resource conflict');
            
            expect(error.statusCode).toBe(409);
            expect(error.code).toBe('CONFLICT');
            expect(error.message).toBe('Resource conflict');
        });
        
        test('unprocessableEntity() should create 422 error', () => {
            const error = HttpError.unprocessableEntity('Validation failed');
            
            expect(error.statusCode).toBe(422);
            expect(error.code).toBe('UNPROCESSABLE_ENTITY');
            expect(error.message).toBe('Validation failed');
        });
        
        test('internalServerError() should create 500 error', () => {
            const error = HttpError.internalServerError('Database error');
            
            expect(error.statusCode).toBe(500);
            expect(error.code).toBe('INTERNAL_SERVER_ERROR');
            expect(error.message).toBe('Database error');
            expect(error.isOperational).toBe(false);
        });
        
        test('factory methods should accept options', () => {
            const error = HttpError.badRequest('Custom error', {
                context: { field: 'email' }
            });
            
            expect(error.context.field).toBe('email');
        });
        
        test('factory methods should use default messages', () => {
            const badRequest = HttpError.badRequest();
            const notFound = HttpError.notFound();
            
            expect(badRequest.message).toBe('Bad Request');
            expect(notFound.message).toBe('Not Found');
        });
    });
    
    describe('Integration with BaseError', () => {
        test('should inherit BaseError methods', () => {
            const error = new HttpError('Test error', { statusCode: 400 });
            
            expect(error.toJSON).toBeDefined();
            expect(error.toClientSafe).toBeDefined();
            expect(typeof error.toJSON).toBe('function');
            expect(typeof error.toClientSafe).toBe('function');
        });
        
        test('should work with BaseError.isOperational()', () => {
            const clientError = new HttpError('Client error', { statusCode: 400 });
            const serverError = new HttpError('Server error', { statusCode: 500 });
            
            expect(BaseError.isOperational(clientError)).toBe(true);
            expect(BaseError.isOperational(serverError)).toBe(false);
        });
    });
});