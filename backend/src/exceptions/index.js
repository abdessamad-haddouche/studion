/**
 * Exceptions Module Exports
 * @module exceptions
 * @description Central export point for all application exceptions
 */

// ==========================================
// BASE EXCEPTIONS
// ==========================================
export { BaseError, HttpError } from './base/index.js';

// ==========================================
// DATABASE EXCEPTIONS
// ==========================================
export {
    DatabaseError,
    ValidationError,
    DuplicateError
} from './database/index.js';