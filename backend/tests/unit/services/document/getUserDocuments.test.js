/**
 * Document Service Unit Tests - getUserDocuments.test.js
 * @description Test suite for retrieving user documents
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getUserDocuments } from '#services/document.service.js';
import Document from '#models/document/Document.js';

describe('Document Service - getUserDocuments', () => {
  let mongoServer;
  let userId;
  
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
    // Create some test documents with unique checksums
    const timestamp = Date.now();
    
    const documents = [
      {
        userId,
        title: 'Document 1',
        description: 'Test document 1',
        file: {
          originalName: 'document1.pdf',
          storagePath: '/tmp/uploads/document1.pdf',
          size: 10000,
          mimeType: 'application/pdf',
          checksum: `checksum1-${timestamp}-${Math.random()}`
        },
        classification: {
          type: 'academic',
          category: 'technology',
          difficulty: 'beginner',
          tags: ['test', 'technology']
        },
        status: 'completed',
        createdAt: new Date('2023-01-01')
      },
      {
        userId,
        title: 'Document 2',
        description: 'Test document 2',
        file: {
          originalName: 'document2.pdf',
          storagePath: '/tmp/uploads/document2.pdf',
          size: 20000,
          mimeType: 'application/pdf',
          checksum: `checksum2-${timestamp}-${Math.random()}`
        },
        classification: {
          type: 'textbook',
          category: 'science',
          difficulty: 'intermediate',
          tags: ['test', 'science']
        },
        status: 'pending',
        createdAt: new Date('2023-01-02')
      },
      {
        userId,
        title: 'Document 3',
        description: 'Test document 3',
        file: {
          originalName: 'document3.pdf',
          storagePath: '/tmp/uploads/document3.pdf',
          size: 30000,
          mimeType: 'application/pdf',
          checksum: `checksum3-${timestamp}-${Math.random()}`
        },
        classification: {
          type: 'article',
          category: 'technology',
          difficulty: 'advanced',
          tags: ['test', 'article']
        },
        status: 'completed',
        createdAt: new Date('2023-01-03')
      }
    ];
    
    await Document.insertMany(documents);
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Document.deleteMany({});
  });

  test('should get all user documents with default options', async () => {
    // Act
    const documents = await getUserDocuments(userId);
    
    // Assert
    expect(documents).toBeInstanceOf(Array);
    expect(documents.length).toBe(3);
    // Default sort is by createdAt desc
    expect(documents[0].title).toBe('Document 3');
  });
  
  test('should filter documents by status', async () => {
    // Act
    const documents = await getUserDocuments(userId, { status: 'completed' });
    
    // Assert
    expect(documents).toBeInstanceOf(Array);
    expect(documents.length).toBe(2);
    expect(documents.every(doc => doc.status === 'completed')).toBe(true);
  });
  
  test('should filter documents by category', async () => {
    // Act
    const documents = await getUserDocuments(userId, { category: 'technology' });
    
    // Assert
    expect(documents).toBeInstanceOf(Array);
    expect(documents.length).toBe(2);
    expect(documents.every(doc => doc.classification.category === 'technology')).toBe(true);
  });
  
  test('should filter documents by difficulty', async () => {
    // Act
    const documents = await getUserDocuments(userId, { difficulty: 'intermediate' });
    
    // Assert
    expect(documents).toBeInstanceOf(Array);
    expect(documents.length).toBe(1);
    expect(documents[0].classification.difficulty).toBe('intermediate');
  });
  
  test('should support pagination', async () => {
    // Act - request page 1 with limit 2
    const page1 = await getUserDocuments(userId, { page: 1, limit: 2 });
    const page2 = await getUserDocuments(userId, { page: 2, limit: 2 });
    
    // Assert
    expect(page1.length).toBe(2);
    expect(page2.length).toBe(1);
    expect(page1[0].title).not.toBe(page2[0].title); // Different documents
  });
  
  test('should support custom sorting', async () => {
    // Act - sort by title ascending
    const documents = await getUserDocuments(userId, { 
      sortBy: 'title', 
      sortOrder: 'asc' 
    });
    
    // Assert
    expect(documents[0].title).toBe('Document 1');
    expect(documents[1].title).toBe('Document 2');
    expect(documents[2].title).toBe('Document 3');
  });
  
  test('should support text search', async () => {
    // We need to mock the text search functionality since it requires a MongoDB text index
    const mockSearchResult = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Document 3',
        userId
      }
    ];
    
    // Mock the static method
    const originalSearchByText = Document.searchByText;
    Document.searchByText = jest.fn().mockResolvedValue(mockSearchResult);
    
    // Act
    const documents = await getUserDocuments(userId, { searchTerm: 'article' });
    
    // Assert
    expect(Document.searchByText).toHaveBeenCalledWith(userId, 'article', expect.any(Object));
    expect(documents).toEqual(mockSearchResult);
    
    // Clean up mock
    Document.searchByText = originalSearchByText;
  });
});