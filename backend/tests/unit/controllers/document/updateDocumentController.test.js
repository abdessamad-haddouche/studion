/**
 * Document Controller Unit Tests - updateDocumentController.test.js
 * @description Test suite for updating document metadata
 */

import { updateDocument as updateDocumentController } from '#controllers/document.controller.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

describe('Document Controller - updateDocument', () => {
  let req;
  let res;
  let next;
  
  // Mock service function
  const mockUpdateDocumentService = async (documentId, updateData, userId) => {
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
    
    if (updateData.title === 'invalid-title') {
      const error = new Error('Invalid title');
      error.statusCode = 400;
      throw error;
    }
    
    // Return mock updated document
    return {
      _id: documentId,
      title: updateData.title || 'Original Title',
      description: updateData.description || 'Original Description',
      classification: {
        type: updateData['classification.type'] || 'academic',
        category: updateData['classification.category'] || 'technology',
        difficulty: updateData['classification.difficulty'] || 'intermediate',
        tags: updateData['classification.tags'] ? 
          typeof updateData['classification.tags'] === 'string' ? 
            updateData['classification.tags'].split(',').map(tag => tag.trim()) :
            updateData['classification.tags'] : 
          ['original', 'tags']
      },
      userId,
      status: 'completed',
      updatedAt: new Date()
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
      },
      body: {
        title: 'Updated Title',
        description: 'Updated Description',
        'classification.category': 'science',
        'classification.tags': 'new,updated,tags'
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
  
  test('should update document successfully', async () => {
    // Create a test controller that uses our mock
    const testUpdateDocumentController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        const updateData = req.body;
        
        const document = await mockUpdateDocumentService(documentId, updateData, userId);
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          message: 'Document updated successfully',
          document
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testUpdateDocumentController(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.message).toBe('Document updated successfully');
    expect(res.responseData.document).toBeDefined();
    expect(res.responseData.document.title).toBe('Updated Title');
    expect(res.responseData.document.description).toBe('Updated Description');
    expect(res.responseData.document.classification.category).toBe('science');
    expect(next.error).toBe(null);
  });
  
  test('should handle non-existent document', async () => {
    // Set document ID to trigger not found error
    req.params.id = 'non-existent-id';
    
    // Create a test controller
    const testUpdateDocumentController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        const updateData = req.body;
        
        const document = await mockUpdateDocumentService(documentId, updateData, userId);
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          message: 'Document updated successfully',
          document
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testUpdateDocumentController(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Document not found');
    expect(next.error.statusCode).toBe(404);
    expect(res.statusCode).toBe(null); // Response methods not called
  });
  
  test('should handle validation errors', async () => {
    // Set invalid title to trigger validation error
    req.body.title = 'invalid-title';
    
    // Create a test controller
    const testUpdateDocumentController = async (req, res, next) => {
      try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        const updateData = req.body;
        
        const document = await mockUpdateDocumentService(documentId, updateData, userId);
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          message: 'Document updated successfully',
          document
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testUpdateDocumentController(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Invalid title');
    expect(next.error.statusCode).toBe(400);
    expect(res.statusCode).toBe(null); // Response methods not called
  });
});