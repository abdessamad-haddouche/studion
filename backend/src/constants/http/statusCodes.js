/**
 * HTTP Status Codes Constants
 * @module constants/http/statusCodes
 * @description Standard HTTP status codes for consistent usage across the application
 */

/**
 * HTTP status codes mapping
 * Organized by category for easy reference
 */
export const HTTP_STATUS_CODES = Object.freeze({
    // 2xx Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    
    // 4xx Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    
    // 5xx Server Errors
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
});

/**
 * Status code categories for easy checking
 */
export const STATUS_CATEGORIES = Object.freeze({
    INFORMATIONAL: { min: 100, max: 199 },
    SUCCESS: { min: 200, max: 299 },
    REDIRECTION: { min: 300, max: 399 },
    CLIENT_ERROR: { min: 400, max: 499 },
    SERVER_ERROR: { min: 500, max: 599 }
});

/**
 * Common status code groups for convenience
 */
export const STATUS_GROUPS = Object.freeze({
    SUCCESS: [
        HTTP_STATUS_CODES.OK,
        HTTP_STATUS_CODES.CREATED,
        HTTP_STATUS_CODES.ACCEPTED,
        HTTP_STATUS_CODES.NO_CONTENT
    ],
    
    CLIENT_ERRORS: [
        HTTP_STATUS_CODES.BAD_REQUEST,
        HTTP_STATUS_CODES.UNAUTHORIZED,
        HTTP_STATUS_CODES.FORBIDDEN,
        HTTP_STATUS_CODES.NOT_FOUND,
        HTTP_STATUS_CODES.CONFLICT,
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
    ],
    
    SERVER_ERRORS: [
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        HTTP_STATUS_CODES.BAD_GATEWAY,
        HTTP_STATUS_CODES.SERVICE_UNAVAILABLE,
        HTTP_STATUS_CODES.GATEWAY_TIMEOUT
    ]
});

/**
 * Default messages for status codes
 */
export const STATUS_MESSAGES = Object.freeze({
    [HTTP_STATUS_CODES.OK]: 'OK',
    [HTTP_STATUS_CODES.CREATED]: 'Created',
    [HTTP_STATUS_CODES.ACCEPTED]: 'Accepted',
    [HTTP_STATUS_CODES.NO_CONTENT]: 'No Content',
    
    [HTTP_STATUS_CODES.BAD_REQUEST]: 'Bad Request',
    [HTTP_STATUS_CODES.UNAUTHORIZED]: 'Unauthorized',
    [HTTP_STATUS_CODES.FORBIDDEN]: 'Forbidden',
    [HTTP_STATUS_CODES.NOT_FOUND]: 'Not Found',
    [HTTP_STATUS_CODES.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
    [HTTP_STATUS_CODES.CONFLICT]: 'Conflict',
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HTTP_STATUS_CODES.TOO_MANY_REQUESTS]: 'Too Many Requests',
    
    [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HTTP_STATUS_CODES.NOT_IMPLEMENTED]: 'Not Implemented',
    [HTTP_STATUS_CODES.BAD_GATEWAY]: 'Bad Gateway',
    [HTTP_STATUS_CODES.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [HTTP_STATUS_CODES.GATEWAY_TIMEOUT]: 'Gateway Timeout'
});

