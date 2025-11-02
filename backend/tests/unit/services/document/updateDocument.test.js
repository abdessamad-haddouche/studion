/**
 * Document Service Unit Tests - updateDocument.test.js
 * @description Test suite for updating document metadata
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { updateDocument } from '#services/document.service.js';
import Document from '#models/document/Document.js';
import { HttpError } from '#exceptions/index.js';

describe('Document Service - updateDocument', () => {
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
      title: 'Original Title',
      description: 'Original Description',
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
        tags: ['original', 'test']
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

  test('should update document metadata successfully', async () => {
    // Arrange
    const updateData = {
      title: 'Updated Title',
      description: 'Updated Description',
      'classification.category': 'technology',
      'classification.difficulty': 'intermediate'
    };
    
    // Act
    const updatedDocument = await updateDocument(testDocumentId, updateData, userId);
    
    // Assert
    expect(updatedDocument.title).toBe('Updated Title');
    expect(updatedDocument.description).toBe('Updated Description');
    expect(updatedDocument.classification.category).toBe('technology');
    expect(updatedDocument.classification.difficulty).toBe('intermediate');
    
    // Verify changes in database
    const savedDocument = await Document.findById(testDocumentId);
    expect(savedDocument.title).toBe('Updated Title');
  });
  
  test('should handle updating tags as comma-separated string', async () => {
    // Arrange
    const updateData = {
      'classification.tags': 'updated,new,tags'
    };
    
    // Act
    const updatedDocument = await updateDocument(testDocumentId, updateData, userId);
    
    // Assert
    expect(updatedDocument.classification.tags).toBeInstanceOf(Array);
    expect(updatedDocument.classification.tags).toContain('updated');
    expect(updatedDocument.classification.tags).toContain('new');
    expect(updatedDocument.classification.tags).toContain('tags');
    expect(updatedDocument.classification.tags).not.toContain('original');
  });
  
  test('should throw not found error for non-existent document', async () => {
    // Arrange
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = { title: 'New Title' };
    
    // Act & Assert
    await expect(updateDocument(nonExistentId, updateData, userId))
      .rejects
      .toThrow('Document not found');
  });
  
  test('should throw not found error for document owned by different user', async () => {
    // Arrange
    const differentUserId = new mongoose.Types.ObjectId().toString();
    const updateData = { title: 'New Title' };
    
    // Act & Assert
    await expect(updateDocument(testDocumentId, updateData, differentUserId))
      .rejects
      .toThrow('Document not found');
  });
  
  test('should ignore updates to non-allowed fields', async () => {
    // Arrange
    const updateData = {
      title: 'Updated Title',
      status: 'failed', // Should be ignored
      'file.size': 99999 // Should be ignored
    };
    
    // Act
    const updatedDocument = await updateDocument(testDocumentId, updateData, userId);
    
    // Assert
    expect(updatedDocument.title).toBe('Updated Title');
    expect(updatedDocument.status).toBe('completed'); // Should not change
    expect(updatedDocument.file.size).toBe(12345); // Should not change
  });
});