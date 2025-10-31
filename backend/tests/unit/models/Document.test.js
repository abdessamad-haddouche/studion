/**
 * Document Model Unit Tests
 * @description Tests for Document model following BaseUser test patterns
 * @file tests/unit/models/document.test.js
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Document from '#models/document/Document.js';

describe('Document Model', () => {
  let mongoServer;
  
  // Valid test data
  const mockUserId = new mongoose.Types.ObjectId();
  const mockUserId2 = new mongoose.Types.ObjectId();
  
  const validDocumentData = {
    userId: mockUserId,
    title: 'Test Document',
    file: {
      originalName: 'test-document.pdf',
      storagePath: '/uploads/test-document.pdf',
      size: 1024000,
      mimeType: 'application/pdf',
      checksum: `abc123-${Date.now()}-${Math.random()}`
    }
  };
  
  // Setup and teardown
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  afterEach(async () => {
    await Document.deleteMany({});
  });

  describe('Document Creation & Validation', () => {
    test('should create Document with correct properties', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      expect(savedDoc.userId).toEqual(mockUserId);
      expect(savedDoc.title).toBe('Test Document');
      expect(savedDoc.file.originalName).toBe('test-document.pdf');
      expect(savedDoc.file.size).toBe(1024000);
      expect(savedDoc.file.mimeType).toBe('application/pdf');
      expect(savedDoc.id).toBeDefined();
    });
    
    test('should use default values when options not provided', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      expect(savedDoc.status).toBe('pending');
      expect(savedDoc.classification.type).toBe('other');
      expect(savedDoc.classification.category).toBe('other');
      expect(savedDoc.classification.difficulty).toBe('intermediate');
      expect(savedDoc.processing.stage).toBe('upload');
      expect(savedDoc.processing.quality).toBe('balanced');
      expect(savedDoc.processing.summaryStyle).toBe('paragraph');
      expect(savedDoc.analytics.viewCount).toBe(0);
      expect(savedDoc.analytics.downloadCount).toBe(0);
      expect(savedDoc.analytics.quizGeneratedCount).toBe(0);
      expect(savedDoc.description).toBe('');
    });
    
    test('should auto-generate title from filename', async () => {
      const doc = new Document({
        userId: mockUserId,
        file: {
          originalName: 'my-research-paper.pdf',
          storagePath: '/uploads/test.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
          checksum: `abc123-${Date.now()}-${Math.random()}`
        }
      });
      
      const savedDoc = await doc.save();
      expect(savedDoc.title).toBe('my-research-paper');
    });
  });

  describe('Required Fields Validation', () => {
    test('should require userId', async () => {
      const doc = new Document({
        title: 'Test Document',
        file: {
          originalName: 'test.pdf',
          storagePath: '/uploads/test.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
          checksum: `abc123-${Date.now()}-${Math.random()}`
        }
      });
      
      await expect(doc.save()).rejects.toThrow('Document must belong to a user');
    });
      
  test('should require title', async () => {
    const doc = new Document({
      userId: mockUserId,
      // Remove file.originalName so title can't be auto-generated
      file: {
        storagePath: '/uploads/test.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        checksum: `abc123-${Date.now()}-${Math.random()}`
      }
    });
    
    await expect(doc.save()).rejects.toThrow('Document title is required');
  });
    
    test('should require file.originalName', async () => {
      const doc = new Document({
        userId: mockUserId,
        title: 'Test Document',
        file: {
          storagePath: '/uploads/test.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
          checksum: `abc123-${Date.now()}-${Math.random()}`
        }
      });
      
      await expect(doc.save()).rejects.toThrow();
    });
    
    test('should require file.storagePath', async () => {
      const doc = new Document({
        userId: mockUserId,
        title: 'Test Document',
        file: {
          originalName: 'test.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
          checksum: `abc123-${Date.now()}-${Math.random()}`
        }
      });
      
      await expect(doc.save()).rejects.toThrow();
    });
    
    test('should require file.size', async () => {
      const doc = new Document({
        userId: mockUserId,
        title: 'Test Document',
        file: {
          originalName: 'test.pdf',
          storagePath: '/uploads/test.pdf',
          mimeType: 'application/pdf',
          checksum: `abc123-${Date.now()}-${Math.random()}`
        }
      });
      
      await expect(doc.save()).rejects.toThrow();
    });
    
    test('should require file.mimeType', async () => {
      const doc = new Document({
        userId: mockUserId,
        title: 'Test Document',
        file: {
          originalName: 'test.pdf',
          storagePath: '/uploads/test.pdf',
          size: 1024000,
          checksum: `abc123-${Date.now()}-${Math.random()}`
        }
      });
      
      await expect(doc.save()).rejects.toThrow();
    });
  });

  describe('Virtual Properties', () => {
    test('isProcessed should return correct value', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      expect(savedDoc.isProcessed).toBe(false);
      
      savedDoc.status = 'completed';
      savedDoc.content.summary = 'Test summary';
      expect(savedDoc.isProcessed).toBe(true);
    });
    
    test('hasFailed should return correct value', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      expect(savedDoc.hasFailed).toBe(false);
      
      savedDoc.status = 'failed';
      expect(savedDoc.hasFailed).toBe(true);
    });
    
    test('isProcessing should return correct value', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      expect(savedDoc.isProcessing).toBe(true); // Default status is 'pending'
      
      savedDoc.status = 'processing';
      expect(savedDoc.isProcessing).toBe(true);
      
      savedDoc.status = 'completed';
      expect(savedDoc.isProcessing).toBe(false);
    });
    
    test('processingDuration should calculate correctly', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      expect(savedDoc.processingDuration).toBeNull();
      
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');
      
      savedDoc.processing.startedAt = startTime;
      savedDoc.processing.completedAt = endTime;
      
      expect(savedDoc.processingDuration).toBe(5 * 60 * 1000); // 5 minutes
    });
    
    test('fileSizeFormatted should format correctly', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      savedDoc.file.size = 500;
      expect(savedDoc.fileSizeFormatted).toBe('500 B');
      
      savedDoc.file.size = 1536; // 1.5 KB
      expect(savedDoc.fileSizeFormatted).toBe('1.5 KB');
      
      savedDoc.file.size = 2097152; // 2 MB
      expect(savedDoc.fileSizeFormatted).toBe('2.0 MB');
    });
    
    test('fileExtension should extract correctly', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      expect(savedDoc.fileExtension).toBe('pdf');
      
      savedDoc.file.originalName = 'document.PDF';
      expect(savedDoc.fileExtension).toBe('pdf');
      
      savedDoc.file.originalName = 'noextension';
      expect(savedDoc.fileExtension).toBeNull();
    });
    
    test('isOwner should work correctly', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      const ownerCheck = savedDoc.isOwner;
      expect(ownerCheck(mockUserId)).toBe(true);
      expect(ownerCheck(mockUserId2)).toBe(false);
    });
  });

  describe('Instance Methods', () => {
    describe('markAsProcessed()', () => {
      test('should mark document as processed with AI results', async () => {
        const doc = new Document(validDocumentData);
        const savedDoc = await doc.save();
        
        const aiResults = {
          summary: 'This is a comprehensive test summary that meets the minimum length requirement for document summaries and provides detailed analysis.',
          keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
          topics: ['Mathematics', 'Science', 'Research'],
          metadata: {
            model: 'gpt-3.5-turbo',
            tokensUsed: 750,
            confidence: 0.92
          }
        };
        
        await savedDoc.markAsProcessed(aiResults);
        
        expect(savedDoc.status).toBe('completed');
        expect(savedDoc.processing.stage).toBe('finalization');
        expect(savedDoc.processing.completedAt).toBeInstanceOf(Date);
        expect(savedDoc.content.summary).toBe(aiResults.summary);
        expect(savedDoc.content.keyPoints).toEqual(aiResults.keyPoints);
        expect(savedDoc.content.topics).toEqual(aiResults.topics);
        expect(savedDoc.processing.aiMetadata.model).toBe('gpt-3.5-turbo');
      });
    });
    
    describe('markAsFailed()', () => {
      test('should mark document as failed with error details', async () => {
        const doc = new Document(validDocumentData);
        const savedDoc = await doc.save();
        
        await savedDoc.markAsFailed('extraction_failed', 'Could not extract text from PDF', { code: 500 });
        
        expect(savedDoc.status).toBe('failed');
        expect(savedDoc.processing.completedAt).toBeInstanceOf(Date);
        expect(savedDoc.processing.error.type).toBe('extraction_failed');
        expect(savedDoc.processing.error.message).toBe('Could not extract text from PDF');
        expect(savedDoc.processing.error.details).toEqual({ code: 500 });
        expect(savedDoc.processing.error.occurredAt).toBeInstanceOf(Date);
      });
    });
    
    describe('incrementAttempts()', () => {
      test('should increment processing attempts', async () => {
        const doc = new Document(validDocumentData);
        const savedDoc = await doc.save();
        
        expect(savedDoc.processing.attempts).toBe(0);
        await savedDoc.incrementAttempts();
        
        const refreshed = await Document.findById(savedDoc._id);
        expect(refreshed.processing.attempts).toBe(1);
      });
    });
    
    describe('Analytics Methods', () => {
      test('recordView should update view analytics', async () => {
        const doc = new Document(validDocumentData);
        const savedDoc = await doc.save();
        
        await savedDoc.recordView();
        
        const updatedDoc = await Document.findById(savedDoc._id);
        expect(updatedDoc.analytics.viewCount).toBe(1);
        expect(updatedDoc.analytics.lastViewedAt).toBeInstanceOf(Date);
      });
      
      test('recordDownload should update download analytics', async () => {
        const doc = new Document(validDocumentData);
        const savedDoc = await doc.save();
        
        await savedDoc.recordDownload();
        
        const updatedDoc = await Document.findById(savedDoc._id);
        expect(updatedDoc.analytics.downloadCount).toBe(1);
        expect(updatedDoc.analytics.lastDownloadedAt).toBeInstanceOf(Date);
      });
      
      test('recordQuizGeneration should update quiz analytics', async () => {
        const doc = new Document(validDocumentData);
        const savedDoc = await doc.save();
        
        await savedDoc.recordQuizGeneration();
        
        const updatedDoc = await Document.findById(savedDoc._id);
        expect(updatedDoc.analytics.quizGeneratedCount).toBe(1);
      });
    });
    
    describe('Soft Delete Methods', () => {
      test('softDelete should set deletedAt timestamp', async () => {
        const doc = new Document(validDocumentData);
        const savedDoc = await doc.save();
        
        expect(savedDoc.deletedAt).toBeNull();
        await savedDoc.softDelete();
        expect(savedDoc.deletedAt).toBeInstanceOf(Date);
      });
      
      test('restore should clear deletedAt timestamp', async () => {
        const doc = new Document(validDocumentData);
        const savedDoc = await doc.save();
        
        savedDoc.deletedAt = new Date();
        await savedDoc.save();
        
        await savedDoc.restore();
        expect(savedDoc.deletedAt).toBeNull();
      });
    });
  });

  describe('Static Methods', () => {
    describe('findByUser()', () => {
      test('should find documents by user with filters', async () => {
        const doc1 = new Document({
          ...validDocumentData,
          checksum: `unique1-${Date.now()}-${Math.random()}` // Make it unique
        });
        await doc1.save();
        
        const doc2 = new Document({
          ...validDocumentData,
          title: 'Science Document',
          classification: { category: 'science' },
          file: {
            ...validDocumentData.file,
            checksum: `unique2-${Date.now()}-${Math.random()}` // Different checksum
          }
        });
        await doc2.save();
        
        const userDocs = await Document.findByUser(mockUserId, {
          category: 'science',
          limit: 10
        });
        
        expect(userDocs).toHaveLength(1);
        expect(userDocs[0].title).toBe('Science Document');
      });
    });
    
    describe('searchByText()', () => {
      test('should perform text search', async () => {
        const doc = new Document({
          ...validDocumentData,
          title: 'Machine Learning Research'
        });
        await doc.save();
        
        const results = await Document.searchByText(mockUserId, 'machine learning');
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Machine Learning Research');
      });
    });
    
    describe('findNeedingProcessing()', () => {
      test('should find documents needing processing', async () => {
        const doc = new Document({
          ...validDocumentData,
          status: 'pending'
        });
        await doc.save();
        
        const results = await Document.findNeedingProcessing(5);
        expect(results).toHaveLength(1);
        expect(results[0].status).toBe('pending');
      });
    });
  });

  describe('Middleware', () => {
    test('should generate checksum if not provided', async () => {
      const doc = new Document({
        userId: mockUserId,
        title: 'Test Document',
        file: {
          originalName: 'test.pdf',
          storagePath: '/uploads/test.pdf',
          size: 1024000,
          mimeType: 'application/pdf'
          // No checksum provided - rely on pre-save middleware
        }
      });
      
      const savedDoc = await doc.save();
      expect(savedDoc.file.checksum).toBeDefined();
      expect(savedDoc.file.checksum).toHaveLength(64);
    });
    
    test('should set processing timestamps on status change', async () => {
      const doc = new Document(validDocumentData);
      const savedDoc = await doc.save();
      
      // Change to processing
      savedDoc.status = 'processing';
      await savedDoc.save();
      expect(savedDoc.processing.startedAt).toBeInstanceOf(Date);
      
      // Change to completed
      savedDoc.status = 'completed';
      await savedDoc.save();
      expect(savedDoc.processing.completedAt).toBeInstanceOf(Date);
    });
    
    test('should clean up tags', async () => {
      const doc = new Document({
        ...validDocumentData,
        classification: {
          tags: ['  Math  ', 'science', 'MATH', 'Science', 'physics']
        }
      });
      
      const savedDoc = await doc.save();
      expect(savedDoc.classification.tags).toEqual(['math', 'science', 'physics']);
    });
  });
});