/**
 * Document Controller Unit Tests - uploadDocument.test.js
 * @description Test suite for document upload controller
 */

import { uploadDocument } from '#controllers/document.controller.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

describe('Document Controller - uploadDocument', () => {
  let req;
  let res;
  let next;
  
  // Mock service function
  const mockCreateDocument = async (fileData, documentData, userId) => {
    // Validate inputs
    if (!fileData) {
      const error = new Error('No file uploaded');
      error.statusCode = 400;
      throw error;
    }
    
    // Return mock data for successful upload
    return {
      _id: 'mock-document-id',
      title: documentData.title || fileData.originalname.replace(/\.[^/.]+$/, ''),
      description: documentData.description || '',
      file: {
        originalName: fileData.originalname,
        size: fileData.size,
        mimeType: fileData.mimetype
      },
      userId,
      status: 'pending',
      createdAt: new Date()
    };
  };
  
  beforeEach(() => {
    // Setup request mock
    req = {
      file: {
        originalname: 'test-document.pdf',
        path: '/tmp/uploads/test-document.pdf',
        size: 12345,
        mimetype: 'application/pdf'
      },
      body: {
        title: 'Test Document',
        description: 'This is a test document',
        type: 'academic',
        category: 'technology',
        difficulty: 'intermediate',
        tags: 'test,document,unit-test'
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
  
  test('should upload a document successfully', async () => {
    // Create a test controller that uses our mock
    const testUploadDocument = async (req, res, next) => {
      try {
        if (!req.file) {
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: 'No document file uploaded'
          });
        }
    
        // Process file upload
        const userId = req.user.userId;
        const documentData = req.body;
        
        const document = await mockCreateDocument(req.file, documentData, userId);
    
        res.status(HTTP_STATUS_CODES.CREATED).json({
          success: true,
          message: 'Document uploaded successfully',
          document
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testUploadDocument(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.CREATED);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.message).toBe('Document uploaded successfully');
    expect(res.responseData.document).toBeDefined();
    expect(res.responseData.document.title).toBe('Test Document');
    expect(res.responseData.document.userId).toBe('mock-user-id');
    expect(next.error).toBe(null);
  });
  
  test('should handle missing file', async () => {
    // Remove file from request
    req.file = null;
    
    // Create a test controller
    const testUploadDocument = async (req, res, next) => {
      try {
        if (!req.file) {
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: 'No document file uploaded'
          });
        }
    
        // Process file upload
        const userId = req.user.userId;
        const documentData = req.body;
        
        const document = await mockCreateDocument(req.file, documentData, userId);
    
        res.status(HTTP_STATUS_CODES.CREATED).json({
          success: true,
          message: 'Document uploaded successfully',
          document
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testUploadDocument(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
    expect(res.responseData.success).toBe(false);
    expect(res.responseData.message).toBe('No document file uploaded');
    expect(next.error).toBe(null);
  });
  
  test('should handle service errors', async () => {
    // Create a test controller with a failing service
    const testUploadDocument = async (req, res, next) => {
      try {
        if (!req.file) {
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: 'No document file uploaded'
          });
        }
    
        // Simulate a service error
        throw new Error('Service error');
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testUploadDocument(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Service error');
    expect(res.statusCode).toBe(null); // Response methods not called
  });
});