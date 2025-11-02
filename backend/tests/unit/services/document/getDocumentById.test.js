/**
 * Document Service Unit Tests - getDocumentById.test.js
 * @description Test suite for retrieving a single document
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getDocumentById } from '#services/document.service.js';
import Document from '#models/document/Document.js';
import { HttpError } from '#exceptions/index.js';

describe('Document Service - getDocumentById', () => {
  let mongoServer;
  let userId;
  let testDocumentId;
  
  // Setup MongoDB Memory Server
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    // Create a mock user ID
    userId = new mongoose.Types.ObjectId().toString();
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  beforeEach(async () => {
    // Create a test document
    const document = new Document({
      userId,
      title: 'Test Document',
      description: 'This is a test document',
      file: {
        originalName: 'test.pdf',
        storagePath: '/tmp/uploads/test.pdf',
        size: 12345,
        mimeType: 'application/pdf'
      },
      classification: {
        type: 'academic',
        category: 'science',
        difficulty: 'beginner',
        tags: ['test']
      },
      status: 'completed'
    });
    
    await document.save();
    testDocumentId = document._id.toString();
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Document.deleteMany({});
  });

  test('should retrieve document by ID for valid user', async () => {
    // Act
    const document = await getDocumentById(testDocumentId, userId);
    
    // Assert
    expect(document).toBeDefined();
    expect(document._id.toString()).toBe(testDocumentId);
    expect(document.userId.toString()).toBe(userId);
    expect(document.title).toBe('Test Document');
  });
  
  test('should throw not found error for non-existent document', async () => {
    // Arrange
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    
    // Act & Assert
    await expect(getDocumentById(nonExistentId, userId))
      .rejects
      .toThrow('Document not found');
  });
  
  test('should throw not found error for document owned by different user', async () => {
    // Arrange
    const differentUserId = new mongoose.Types.ObjectId().toString();
    
    // Act & Assert
    await expect(getDocumentById(testDocumentId, differentUserId))
      .rejects
      .toThrow('Document not found');
  });
  
  test('should throw not found error for soft-deleted document', async () => {
    // Arrange - soft delete the document
    await Document.findByIdAndUpdate(testDocumentId, {
      deletedAt: new Date()
    });
    
    // Act & Assert
    await expect(getDocumentById(testDocumentId, userId))
      .rejects
      .toThrow('Document not found');
  });
  
  test('should increment view count when retrieving document', async () => {
    // Arrange
    const originalDocument = await Document.findById(testDocumentId);
    const originalViewCount = originalDocument.analytics.viewCount;
    
    // Mock the recordView method
    const mockRecordView = jest.fn().mockResolvedValue({});
    originalDocument.recordView = mockRecordView;
    
    // Mock findOne to return our document with mocked method
    const originalFindOne = Document.findOne;
    Document.findOne = jest.fn().mockResolvedValue(originalDocument);
    
    // Act
    await getDocumentById(testDocumentId, userId);
    
    // Assert
    expect(mockRecordView).toHaveBeenCalled();
    
    // Clean up mocks
    Document.findOne = originalFindOne;
  });
});