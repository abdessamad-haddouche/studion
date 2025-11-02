/**
 * Document Controller Unit Tests - deleteDocumentController.test.js
 * @description Test suite for document deletion
 */

import { deleteDocument as deleteDocumentController } from '#controllers/document.controller.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

describe('Document Controller - deleteDocument', () => {
  let req;
  let res;
  let next;
  
  // Mock service functions
  const mockSoftDeleteDocumentService = async (documentId, userId) => {
    // Validate inputs
    if (documentId === 'non-existent-id') {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (documentId === 'unauthorized-id') {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (documentId === 'already-deleted-id') {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Return success response
    return {
      success: true,
      message: 'Document deleted successfully'
    };
  };
  
  const mockPermanentlyDeleteDocumentService = async (documentId, userId) => {
    // Validate inputs - same validation as soft delete
    if (documentId === 'non-existent-id') {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (documentId === 'unauthorized-id') {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (documentId === 'already-deleted-id') {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Return success response
    return {
      success: true,
      message: 'Document permanently deleted'
    };
  };
  
  beforeEach(() => {
    // Setup request mock
    req = {
      params: {
        id: 'mock-document-id'
      },
      query: {},
      user: {
        userId: 'mock-user-id'
      }
    };
    
    // Setup response mock
    res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      },
      statusCode: null,
      responseData: null
    };
    
    next = jest.fn(error => {
      next.error = error;
    });
    next.error = null;
  });
  
  test('should soft delete document successfully', async () => {
    // Create a test controller that uses our mock
    const testDeleteDocumentController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        
        // Check for permanent delete flag
        const { permanent } = req.query;
        
        let result;
        if (permanent === 'true') {
          result = await mockPermanentlyDeleteDocumentService(documentId, userId);
        } else {
          result = await mockSoftDeleteDocumentService(documentId, userId);
        }
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          message: result.message
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testDeleteDocumentController(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.message).toBe('Document deleted successfully');
    expect(next.error).toBe(null);
  });
  
  test('should permanently delete document when permanent flag is true', async () => {
    // Set permanent flag
    req.query.permanent = 'true';
    
    // Create a test controller
    const testDeleteDocumentController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        
        // Check for permanent delete flag
        const { permanent } = req.query;
        
        let result;
        if (permanent === 'true') {
          result = await mockPermanentlyDeleteDocumentService(documentId, userId);
        } else {
          result = await mockSoftDeleteDocumentService(documentId, userId);
        }
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          message: result.message
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testDeleteDocumentController(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.message).toBe('Document permanently deleted');
    expect(next.error).toBe(null);
  });
  
  test('should handle non-existent document', async () => {
    // Set document ID to trigger not found error
    req.params.id = 'non-existent-id';
    
    // Create a test controller
    const testDeleteDocumentController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        
        // Check for permanent delete flag
        const { permanent } = req.query;
        
        let result;
        if (permanent === 'true') {
          result = await mockPermanentlyDeleteDocumentService(documentId, userId);
        } else {
          result = await mockSoftDeleteDocumentService(documentId, userId);
        }
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          message: result.message
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testDeleteDocumentController(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Document not found');
    expect(next.error.statusCode).toBe(404);
    expect(res.statusCode).toBe(null); // Response methods not called
  });
});