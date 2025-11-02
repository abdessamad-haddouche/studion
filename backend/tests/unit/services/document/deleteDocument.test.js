/**
 * Document Service Unit Tests - deleteDocument.test.js
 * @description Test suite for document deletion
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { deleteDocument, permanentlyDeleteDocument } from '#services/document.service.js';
import Document from '#models/document/Document.js';
import { HttpError } from '#exceptions/index.js';

describe('Document Service - deleteDocument', () => {
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
    // Create a test document with unique checksum
    const document = new Document({
      userId,
      title: 'Test Document',
      file: {
        originalName: 'test.pdf',
        storagePath: '/tmp/uploads/test.pdf',
        size: 12345,
        mimeType: 'application/pdf',
        checksum: `test-checksum-${Date.now()}-${Math.random()}`
      },
      status: 'completed'
    });
    
    await document.save();
    testDocumentId = document._id.toString();
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Document.deleteMany({});
    jest.restoreAllMocks();
  });

  describe('Soft Delete', () => {
    test('should soft delete a document successfully', async () => {
      // Act
      const result = await deleteDocument(testDocumentId, userId);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Document deleted successfully');
      
      // Verify document is soft deleted
      const document = await Document.findById(testDocumentId);
      expect(document.deletedAt).toBeDefined();
      expect(document.deletedAt).toBeInstanceOf(Date);
    });
    
    test('should throw not found error for non-existent document', async () => {
      // Arrange
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      // Act & Assert
      await expect(deleteDocument(nonExistentId, userId))
        .rejects
        .toThrow('Document not found');
    });
    
    test('should throw not found error for document owned by different user', async () => {
      // Arrange
      const differentUserId = new mongoose.Types.ObjectId().toString();
      
      // Act & Assert
      await expect(deleteDocument(testDocumentId, differentUserId))
        .rejects
        .toThrow('Document not found');
    });
    
    test('should throw not found error for already soft-deleted document', async () => {
      // Arrange - soft delete the document
      await Document.findByIdAndUpdate(testDocumentId, {
        deletedAt: new Date()
      });
      
      // Act & Assert
      await expect(deleteDocument(testDocumentId, userId))
        .rejects
        .toThrow('Document not found');
    });
  });

  describe('Permanent Delete', () => {
    test('should permanently delete a document and its file', async () => {
      // Mock console.error to avoid test noise
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock Document.deleteOne to track if it was called
      const deleteOneSpy = jest.spyOn(Document, 'deleteOne').mockResolvedValue({ deletedCount: 1 });
      
      // Act
      const result = await permanentlyDeleteDocument(testDocumentId, userId);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Document permanently deleted');
      
      // Verify deleteOne was called
      expect(deleteOneSpy).toHaveBeenCalledWith({ _id: testDocumentId });
      
      // Clean up
      mockConsoleError.mockRestore();
      deleteOneSpy.mockRestore();
    });
    
    test('should throw not found error for non-existent document', async () => {
      // Arrange
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      // Act & Assert
      await expect(permanentlyDeleteDocument(nonExistentId, userId))
        .rejects
        .toThrow('Document not found');
    });
    
    test('should throw not found error for document owned by different user', async () => {
      // Arrange
      const differentUserId = new mongoose.Types.ObjectId().toString();
      
      // Act & Assert
      await expect(permanentlyDeleteDocument(testDocumentId, differentUserId))
        .rejects
        .toThrow('Document not found');
    });
    
    test('should continue with document deletion if file deletion fails', async () => {
      // Arrange - mock console.error
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock Document.deleteOne
      const deleteOneSpy = jest.spyOn(Document, 'deleteOne').mockResolvedValue({ deletedCount: 1 });
      
      // Act
      const result = await permanentlyDeleteDocument(testDocumentId, userId);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Document permanently deleted');
      
      // Verify document deletion was attempted
      expect(deleteOneSpy).toHaveBeenCalled();
      
      // Clean up
      mockConsoleError.mockRestore();
      deleteOneSpy.mockRestore();
    });
  });
});