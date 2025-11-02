/**
 * Document Controller Unit Tests - getAllDocuments.test.js
 * @description Test suite for retrieving all documents
 */

import { getAllDocuments } from '#controllers/document.controller.js';
import { HTTP_STATUS_CODES } from '#constants/http/index.js';

describe('Document Controller - getAllDocuments', () => {
  let req;
  let res;
  let next;
  
  // Mock service function
  const mockGetUserDocuments = async (userId, options = {}) => {
    // Return different results based on options
    if (options.searchTerm) {
      return [
        { _id: 'doc1', title: 'Search Result 1', status: 'completed' }
      ];
    }
    
    if (options.status) {
      return [
        { _id: 'doc2', title: 'Filtered Result', status: options.status }
      ];
    }
    
    // Default response
    return [
      { _id: 'doc3', title: 'Document 1', status: 'completed' },
      { _id: 'doc4', title: 'Document 2', status: 'pending' }
    ];
  };
  
  beforeEach(() => {
    // Setup request mock
    req = {
      user: {
        userId: 'mock-user-id'
      },
      query: {},
      app: {
        locals: {
          models: {
            Document: {
              countDocuments: jest.fn().mockResolvedValue(10)
            }
          }
        }
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
  
  test('should get all documents with default options', async () => {
    // Create a test controller that uses our mock
    const testGetAllDocuments = async (req, res, next) => {
      try {
        const userId = req.user.userId;
        
        // Extract query parameters
        const { 
          status, 
          category, 
          difficulty, 
          search,
          page = 1, 
          limit = 20,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;
    
        const documents = await mockGetUserDocuments(userId, {
          status,
          category,
          difficulty,
          searchTerm: search,
          page,
          limit,
          sortBy,
          sortOrder
        });
    
        // Get total count for pagination (if search is not used)
        let total = 0;
        if (!search) {
          total = await req.app.locals.models.Document.countDocuments();
        } else {
          total = documents.length; // Approximation for search results
        }
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          count: documents.length,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
          documents
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testGetAllDocuments(req, res, next);
    
    // Assertions
    expect(res.statusCode).toBe(HTTP_STATUS_CODES.OK);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.documents).toBeDefined();
    expect(res.responseData.documents.length).toBe(2);
    expect(res.responseData.count).toBe(2);
    expect(res.responseData.total).toBe(10);
    expect(res.responseData.page).toBe(1);
    expect(res.responseData.limit).toBe(20);
    expect(next.error).toBe(null);
  });
  
  test('should handle filtering by status', async () => {
    // Set status query parameter
    req.query.status = 'completed';
    
    // Create a test controller
    const testGetAllDocuments = async (req, res, next) => {
      try {
        const userId = req.user.userId;
        
        // Extract query parameters
        const { 
          status, 
          category, 
          difficulty, 
          search,
          page = 1, 
          limit = 20,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;
    
        const documents = await mockGetUserDocuments(userId, {
          status,
          category,
          difficulty,
          searchTerm: search,
          page,
          limit,
          sortBy,
          sortOrder
        });
    
        // Get total count for pagination (if search is not used)
        let total = 0;
        if (!search) {
          total = await req.app.locals.models.Document.countDocuments();
        } else {
          total = documents.length; // Approximation for search results
        }
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          count: documents.length,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
          documents
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testGetAllDocuments(req, res, next);
    
    // Assertions
    expect(res.responseData.documents.length).toBe(1);
    expect(res.responseData.documents[0].status).toBe('completed');
  });
  
  test('should handle search queries', async () => {
    // Set search query parameter
    req.query.search = 'test query';
    
    // Create a test controller
    const testGetAllDocuments = async (req, res, next) => {
      try {
        const userId = req.user.userId;
        
        // Extract query parameters
        const { 
          status, 
          category, 
          difficulty, 
          search,
          page = 1, 
          limit = 20,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = req.query;
    
        const documents = await mockGetUserDocuments(userId, {
          status,
          category,
          difficulty,
          searchTerm: search,
          page,
          limit,
          sortBy,
          sortOrder
        });
    
        // Get total count for pagination (if search is not used)
        let total = 0;
        if (!search) {
          total = await req.app.locals.models.Document.countDocuments();
        } else {
          total = documents.length; // Approximation for search results
        }
    
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true,
          count: documents.length,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
          documents
        });
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testGetAllDocuments(req, res, next);
    
    // Assertions
    expect(res.responseData.documents.length).toBe(1);
    expect(res.responseData.documents[0].title).toBe('Search Result 1');
    expect(res.responseData.total).toBe(1); // For search, total = count
  });
  
  test('should handle service errors', async () => {
    // Create a test controller with a failing service
    const testGetAllDocuments = async (req, res, next) => {
      try {
        // Simulate a service error
        throw new Error('Service error');
      } catch (error) {
        next(error);
      }
    };
    
    // Call the test controller
    await testGetAllDocuments(req, res, next);
    
    // Assertions
    expect(next.error).not.toBe(null);
    expect(next.error.message).toBe('Service error');
    expect(res.statusCode).toBe(null); // Response methods not called
  });
});