/**
 * Exceptions Index Tests
 * @description Tests for the main exceptions module exports
 * @file tests/unit/exceptions/index.test.js
 */

import * as Exceptions from '../../../src/exceptions/index.js';

describe('Exceptions Module Exports', () => {
    test('should export all base error classes', () => {
        expect(Exceptions.BaseError).toBeDefined();
        expect(Exceptions.HttpError).toBeDefined();
        expect(typeof Exceptions.BaseError).toBe('function');
        expect(typeof Exceptions.HttpError).toBe('function');
    });
    
    test('should export all database error classes', () => {
        expect(Exceptions.DatabaseError).toBeDefined();
        expect(Exceptions.ValidationError).toBeDefined();
        expect(Exceptions.DuplicateError).toBeDefined();
        expect(typeof Exceptions.DatabaseError).toBe('function');
        expect(typeof Exceptions.ValidationError).toBe('function');
        expect(typeof Exceptions.DuplicateError).toBe('function');
    });
    
    test('should create error instances correctly', () => {
        const baseError = new Exceptions.BaseError('Test');
        const validationError = new Exceptions.ValidationError('Test validation');
        const duplicateError = new Exceptions.DuplicateError('Test duplicate');
        
        expect(baseError).toBeInstanceOf(Exceptions.BaseError);
        expect(validationError).toBeInstanceOf(Exceptions.ValidationError);
        expect(duplicateError).toBeInstanceOf(Exceptions.DuplicateError);
        
        // Test inheritance chain
        expect(validationError).toBeInstanceOf(Exceptions.DatabaseError);
        expect(duplicateError).toBeInstanceOf(Exceptions.DatabaseError);
    });
    
    test('should have correct error properties', () => {
        const validationError = new Exceptions.ValidationError('Test validation');
        const duplicateError = new Exceptions.DuplicateError('Test duplicate');
        
        expect(validationError.statusCode).toBe(422);
        expect(duplicateError.statusCode).toBe(409);
        expect(validationError.isOperational).toBe(true);
        expect(duplicateError.isOperational).toBe(true);
    });
});