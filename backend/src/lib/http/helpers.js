/**
 * HTTP Helper Functions
 * @module lib/http/helpers
 */

import { STATUS_MESSAGES } from '#constants/http/index.js';

/**
 * Helper functions for status code operations
 */
export const StatusCodeHelpers = {
    /**
     * Check if status code is successful (2xx)
     */
    isSuccess: (code) => code >= 200 && code < 300,
    
    /**
     * Check if status code is client error (4xx)
     */
    isClientError: (code) => code >= 400 && code < 500,
    
    /**
     * Check if status code is server error (5xx)
     */
    isServerError: (code) => code >= 500 && code < 600,
    
    /**
     * Get default message for status code
     */
    getMessage: (code) => STATUS_MESSAGES[code] || 'Unknown Status',
    
    /**
     * Get category for status code
     */
    getCategory: (code) => {
        if (code >= 100 && code < 200) return 'INFORMATIONAL';
        if (code >= 200 && code < 300) return 'SUCCESS';
        if (code >= 300 && code < 400) return 'REDIRECTION';
        if (code >= 400 && code < 500) return 'CLIENT_ERROR';
        if (code >= 500 && code < 600) return 'SERVER_ERROR';
        return 'UNKNOWN';
    }
};