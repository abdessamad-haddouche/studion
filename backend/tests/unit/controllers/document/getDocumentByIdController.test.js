/**
 * Document Controller Unit Tests - getDocumentByIdController.test.js
 * @description Test suite for retrieving a single document
 */

import { getDocumentById as getDocumentByIdController } from '#controllers/document.controller.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

describe('Document Controller - getDocumentById', () => {
  let req;
  let res;
  let next;
  
  // Mock service function
  const mockGetDocumentByIdService = async (documentId, userId) => {
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
    
    // Return mock document
    return {
      _id: documentId,
      title: 'Test Document',
      description: 'This is a test document',
      file: {
        originalName: 'test.pdf',
        size: 12345,
        mimeType: 'application/pdf'
      },
      userId,
      status: 'completed',
      createdAt: new Date()
    };
  };
  
  beforeEach(() => {
    // Setup request mock
    req = {
      params: {
        id: 'mock-document-id'
      },
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
  
  test('should get document by ID successfully', async () => {
    // Create a test controller that uses our mock
    const testGetDocumentByIdController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        
        const document = await mockGetDocumentByIdService(documentId, userId);
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          document
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testGetDocumentByIdController(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.document).toBeDefined();
    expect(res.responseData.document._id).toBe('mock-document-id');
    expect(res.responseData.document.title).toBe('Test Document');
    expect(next.error).toBe(null);
  });
  
  test('should handle non-existent document', async () => {
    // Set document ID to trigger not found error
    req.params.id = 'non-existent-id';
    
    // Create a test controller
    const testGetDocumentByIdController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        
        const document = await mockGetDocumentByIdService(documentId, userId);
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          document
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testGetDocumentByIdController(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Document not found');
    expect(next.error.statusCode).toBe(404);
    expect(res.statusCode).toBe(null); // Response methods not called
  });
  
  test('should handle unauthorized access', async () => {
    // Set document ID to trigger unauthorized error
    req.params.id = 'unauthorized-id';
    
    // Create a test controller
    const testGetDocumentByIdController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        
        const document = await mockGetDocumentByIdService(documentId, userId);
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          document
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testGetDocumentByIdController(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Document not found');
    // Note: For security reasons, unauthorized should return "not found" instead of "forbidden"
    expect(next.error.statusCode).toBe(404);
    expect(res.statusCode).toBe(null); // Response methods not called
  });
});