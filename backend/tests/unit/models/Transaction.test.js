/**
 * Transaction Model Unit Tests
 * @description Tests for Transaction model following Document test patterns
 * @file tests/unit/models/transaction.test.js
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Transaction from '#models/transaction/Transaction.js';

describe('Transaction Model', () => {
  let mongoServer;
  
  // Valid test data
  const mockUserId = new mongoose.Types.ObjectId();
  const mockUserId2 = new mongoose.Types.ObjectId();
  const mockCourseId = new mongoose.Types.ObjectId();
  const mockQuizId = new mongoose.Types.ObjectId();
  const mockSubscriptionId = new mongoose.Types.ObjectId();
  
  const validTransactionData = {
    userId: mockUserId,
    type: 'quiz_completion',
    description: 'Points earned from completing Math Quiz',
    amount: 0,
    pointsEarned: 50
  };
  
  const validCourseTransactionData = {
    userId: mockUserId,
    courseId: mockCourseId,
    type: 'course_purchase',
    description: 'Purchase of JavaScript Fundamentals Course',
    amount: 99.99,
    currency: 'USD',
    payment: {
      method: 'credit_card',
      provider: 'stripe'
    }
  };
  
  const validPointsDiscountData = {
    userId: mockUserId,
    courseId: mockCourseId,
    type: 'course_discount',
    description: 'Points used for course discount',
    amount: 79.99, // Final price after discount
    pointsUsed: 200,
    discountUsed: {
      type: 'points',
      percentage: 20,
      amount: 19.99
    },
    payment: {
      method: 'points'
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
    await Transaction.deleteMany({});
  });

  describe('Transaction Creation & Validation', () => {
    test('should create Transaction with correct properties', async () => {
      const transaction = new Transaction(validTransactionData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.userId).toEqual(mockUserId);
      expect(savedTransaction.type).toBe('quiz_completion');
      expect(savedTransaction.description).toBe('Points earned from completing Math Quiz');
      expect(savedTransaction.amount).toBe(0);
      expect(savedTransaction.pointsEarned).toBe(50);
      expect(savedTransaction.referenceId).toBeDefined();
      expect(savedTransaction.id).toBeDefined();
    });
    
    test('should use default values when options not provided', async () => {
      const transaction = new Transaction(validTransactionData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.status).toBe('pending');
      expect(savedTransaction.currency).toBe('USD');
      expect(savedTransaction.pointsUsed).toBe(0);
      expect(savedTransaction.payment.method).toBe('points');
      expect(savedTransaction.discountUsed.percentage).toBe(0);
      expect(savedTransaction.discountUsed.amount).toBe(0);
      expect(savedTransaction.notes).toBe('');
      expect(savedTransaction.metadata.source).toBe('web');
    });
    
    test('should auto-generate referenceId', async () => {
      const transaction = new Transaction(validTransactionData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.referenceId).toMatch(/^TXN_/);
      expect(savedTransaction.referenceId).toContain('QUIZ');
    });
    
    test('should create course purchase transaction', async () => {
      const transaction = new Transaction(validCourseTransactionData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.courseId).toEqual(mockCourseId);
      expect(savedTransaction.type).toBe('course_purchase');
      expect(savedTransaction.amount).toBe(99.99);
      expect(savedTransaction.payment.method).toBe('credit_card');
      expect(savedTransaction.payment.provider).toBe('stripe');
    });
    
    test('should create points discount transaction', async () => {
      const transaction = new Transaction(validPointsDiscountData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.pointsUsed).toBe(200);
      expect(savedTransaction.discountUsed.type).toBe('points');
      expect(savedTransaction.discountUsed.percentage).toBe(20);
      expect(savedTransaction.discountUsed.amount).toBe(19.99);
      expect(savedTransaction.payment.method).toBe('points');
    });
  });

  describe('Required Fields Validation', () => {
    test('should require userId', async () => {
      const transaction = new Transaction({
        type: 'quiz_completion',
        description: 'Test transaction',
        amount: 0
      });
      
      await expect(transaction.save()).rejects.toThrow('Transaction must belong to a user');
    });
    
    test('should require type', async () => {
      const transaction = new Transaction({
        userId: mockUserId,
        description: 'Test transaction',
        amount: 0
      });
      
      await expect(transaction.save()).rejects.toThrow('Transaction type is required');
    });
    
    test('should require description', async () => {
      const transaction = new Transaction({
        userId: mockUserId,
        type: 'quiz_completion',
        amount: 0
      });
      
      await expect(transaction.save()).rejects.toThrow('Transaction description is required');
    });
    
    test('should require amount', async () => {
      // Don't include amount field at all so Mongoose validation kicks in first
      const transaction = new Transaction({
        userId: mockUserId,
        type: 'quiz_completion',
        description: 'Test transaction'
        // amount field missing entirely
      });
      
      await expect(transaction.save()).rejects.toThrow('Transaction amount is required');
    });
    
    test('should validate transaction type enum', async () => {
      const transaction = new Transaction({
        userId: mockUserId,
        type: 'invalid_type',
        description: 'Test transaction',
        amount: 0
      });
      
      await expect(transaction.save()).rejects.toThrow('Invalid transaction type');
    });
    
    test('should validate transaction status enum', async () => {
      const transaction = new Transaction({
        ...validTransactionData,
        status: 'invalid_status'
      });
      
      await expect(transaction.save()).rejects.toThrow('Invalid transaction status');
    });
  });

  describe('Amount and Points Validation', () => {
    test('should validate minimum amount', async () => {
      const transaction = new Transaction({
        ...validTransactionData,
        amount: -1
      });
      
      await expect(transaction.save()).rejects.toThrow();
    });
    
    test('should validate maximum amount', async () => {
      const transaction = new Transaction({
        ...validTransactionData,
        amount: 200000 // Over the limit
      });
      
      await expect(transaction.save()).rejects.toThrow();
    });
    
    test('should validate points earned range', async () => {
      const transaction = new Transaction({
        ...validTransactionData,
        pointsEarned: 15000 // Over the limit
      });
      
      await expect(transaction.save()).rejects.toThrow();
    });
    
    test('should validate points used range', async () => {
      const transaction = new Transaction({
        ...validTransactionData,
        pointsUsed: 60000 // Over the limit
      });
      
      await expect(transaction.save()).rejects.toThrow();
    });
    
    test('should validate discount percentage', async () => {
      const transaction = new Transaction({
        ...validPointsDiscountData,
        discountUsed: {
          ...validPointsDiscountData.discountUsed,
          percentage: 150 // Over 100%
        }
      });
      
      await expect(transaction.save()).rejects.toThrow();
    });
  });

  describe('Virtual Properties', () => {
    test('isCompleted should return correct value', async () => {
      const transaction = new Transaction(validTransactionData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.isCompleted).toBe(false);
      
      // Update directly in database to avoid middleware conflicts
      await Transaction.updateOne(
        { _id: savedTransaction._id },
        { 
          status: 'completed',
          completedAt: new Date()
        }
      );
      
      // Refresh from database to get updated virtual
      const refreshedTransaction = await Transaction.findById(savedTransaction._id);
      expect(refreshedTransaction.isCompleted).toBe(true);
    });
    
    test('isPending should return correct value', async () => {
      const transaction = new Transaction(validTransactionData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.isPending).toBe(true); // Default status is 'pending'
      
      savedTransaction.status = 'completed';
      expect(savedTransaction.isPending).toBe(false);
    });
    
    test('hasFailed should return correct value', async () => {
      const transaction = new Transaction(validTransactionData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.hasFailed).toBe(false);
      
      savedTransaction.status = 'failed';
      expect(savedTransaction.hasFailed).toBe(true);
    });
    
    test('category should return correct category', async () => {
      const pointsTransaction = new Transaction(validTransactionData);
      const courseTransaction = new Transaction(validCourseTransactionData);
      
      expect(pointsTransaction.category).toBe('points_earning');
      expect(courseTransaction.category).toBe('monetary');
    });
    
    test('finalAmount should calculate correctly', async () => {
      const transaction = new Transaction(validPointsDiscountData);
      const savedTransaction = await transaction.save();
      
      expect(savedTransaction.finalAmount).toBe(60.00); // 79.99 - 19.99 discount
    });
    
    test('processingTime should calculate correctly', async () => {
      const transaction = new Transaction({
        ...validTransactionData,
        referenceId: `processing-time-${Date.now()}-${Math.random()}`
      });
      
      const savedTransaction = await transaction.save();
      
      // Test with null values first
      expect(savedTransaction.processingTime).toBeNull();
      
      // Now test the calculation by creating a new transaction with specific dates
      const startTime = new Date('2024-01-01T10:00:00.000Z');
      const endTime = new Date('2024-01-01T10:01:30.000Z');
      
      const testTransaction = new Transaction({
        ...validTransactionData,
        referenceId: `test-${Date.now()}-${Math.random()}`
      });
      
      // Set the dates before saving
      testTransaction.createdAt = startTime;
      testTransaction.completedAt = endTime;
      
      // The virtual should calculate correctly: 90000ms (1.5 minutes)
      expect(testTransaction.processingTime).toBe(90000);
    });
  });

  describe('Instance Methods', () => {
    describe('markAsProcessed()', () => {
      test('should mark transaction as processed', async () => {
        const transaction = new Transaction(validTransactionData);
        const savedTransaction = await transaction.save();
        
        await savedTransaction.markAsProcessed();
        
        expect(savedTransaction.status).toBe('processing');
        expect(savedTransaction.processedAt).toBeInstanceOf(Date);
      });
    });
    
    describe('complete()', () => {
      test('should complete transaction without gateway data', async () => {
        const transaction = new Transaction(validTransactionData);
        const savedTransaction = await transaction.save();
        
        await savedTransaction.complete();
        
        expect(savedTransaction.status).toBe('completed');
        expect(savedTransaction.completedAt).toBeInstanceOf(Date);
      });
      
      test('should complete transaction with gateway data', async () => {
        const transaction = new Transaction(validCourseTransactionData);
        const savedTransaction = await transaction.save();
        
        const gatewayData = {
          id: 'stripe_tx_123456',
          response: { status: 'succeeded', fee: 3.20 }
        };
        
        await savedTransaction.complete(gatewayData);
        
        expect(savedTransaction.status).toBe('completed');
        expect(savedTransaction.payment.gatewayTransactionId).toBe('stripe_tx_123456');
        expect(savedTransaction.payment.gatewayResponse).toEqual(gatewayData.response);
      });
    });
    
    describe('fail()', () => {
      test('should mark transaction as failed with error details', async () => {
        const transaction = new Transaction(validTransactionData);
        const savedTransaction = await transaction.save();
        
        await savedTransaction.fail('PAYMENT_DECLINED', 'Card was declined', { code: 4000 });
        
        expect(savedTransaction.status).toBe('failed');
        expect(savedTransaction.failedAt).toBeInstanceOf(Date);
        expect(savedTransaction.error.code).toBe('PAYMENT_DECLINED');
        expect(savedTransaction.error.message).toBe('Card was declined');
        expect(savedTransaction.error.details).toEqual({ code: 4000 });
      });
    });
    
    describe('cancel()', () => {
      test('should cancel transaction with reason', async () => {
        const transaction = new Transaction(validTransactionData);
        const savedTransaction = await transaction.save();
        
        await savedTransaction.cancel('User cancelled order');
        
        expect(savedTransaction.status).toBe('cancelled');
        expect(savedTransaction.notes).toBe('User cancelled order');
      });
    });
    
    describe('refund()', () => {
      test('should create refund transaction', async () => {
        const transaction = new Transaction(validCourseTransactionData);
        const savedTransaction = await transaction.save();
        savedTransaction.status = 'completed';
        await savedTransaction.save();
        
        const refund = await savedTransaction.refund(50.00, 'Partial refund requested');
        
        expect(refund.type).toBe('course_refund');
        expect(refund.amount).toBe(50.00); // Positive amount for validation
        expect(refund.courseId).toEqual(mockCourseId);
        expect(refund.notes).toBe('Partial refund requested');
        expect(refund.status).toBe('completed');
      });
    });
    
    describe('canRefund()', () => {
      test('should return true for refundable transactions', async () => {
        const transaction = new Transaction(validCourseTransactionData);
        const savedTransaction = await transaction.save();
        savedTransaction.status = 'completed';
        
        expect(savedTransaction.canRefund()).toBe(true);
      });
      
      test('should return false for non-refundable transactions', async () => {
        const transaction = new Transaction(validTransactionData);
        const savedTransaction = await transaction.save();
        
        expect(savedTransaction.canRefund()).toBe(false);
      });
      
      test('should return false for zero amount transactions', async () => {
        const transaction = new Transaction({
          userId: mockUserId,
          type: 'quiz_completion', // This type doesn't require amount > 0
          description: 'Points earned from quiz',
          amount: 0,
          pointsEarned: 50
        });
        const savedTransaction = await transaction.save();
        savedTransaction.status = 'completed';
        
        expect(savedTransaction.canRefund()).toBe(false);
      });
    });
  });

  describe('Static Methods', () => {
    describe('findByUser()', () => {
      test('should find transactions by user with filters', async () => {
        const transaction1 = new Transaction({
          ...validTransactionData,
          referenceId: `unique1-${Date.now()}-${Math.random()}`
        });
        await transaction1.save();
        
        const transaction2 = new Transaction({
          ...validCourseTransactionData,
          referenceId: `unique2-${Date.now()}-${Math.random()}`
        });
        await transaction2.save();
        
        const userTransactions = await Transaction.findByUser(mockUserId, {
          type: 'course_purchase',
          limit: 10
        });
        
        expect(userTransactions).toHaveLength(1);
        expect(userTransactions[0].type).toBe('course_purchase');
      });
      
      test('should filter by category', async () => {
        const pointsTransaction = new Transaction({
          ...validTransactionData,
          referenceId: `unique3-${Date.now()}-${Math.random()}`
        });
        await pointsTransaction.save();
        
        const monetaryTransaction = new Transaction({
          ...validCourseTransactionData,
          referenceId: `unique4-${Date.now()}-${Math.random()}`
        });
        await monetaryTransaction.save();
        
        const pointsResults = await Transaction.findByUser(mockUserId, {
          category: 'points_earning'
        });
        
        const monetaryResults = await Transaction.findByUser(mockUserId, {
          category: 'monetary'
        });
        
        expect(pointsResults).toHaveLength(1);
        expect(monetaryResults).toHaveLength(1);
        expect(pointsResults[0].type).toBe('quiz_completion');
        expect(monetaryResults[0].type).toBe('course_purchase');
      });
    });
    
    describe('calculatePointsBalance()', () => {
      test('should calculate user points balance correctly', async () => {
        // Create earning transaction
        const earningTransaction = new Transaction({
          ...validTransactionData,
          status: 'completed',
          pointsEarned: 100,
          referenceId: `earn-${Date.now()}-${Math.random()}`
        });
        await earningTransaction.save();
        
        // Create spending transaction  
        const spendingTransaction = new Transaction({
          ...validPointsDiscountData,
          status: 'completed',
          pointsUsed: 30,
          referenceId: `spend-${Date.now()}-${Math.random()}`
        });
        await spendingTransaction.save();
        
        const [balance] = await Transaction.calculatePointsBalance(mockUserId);
        
        expect(balance.totalEarned).toBe(100);
        expect(balance.totalSpent).toBe(30);
        expect(balance.balance).toBe(70);
      });
      
      test('should return zero balance for user with no transactions', async () => {
        const balance = await Transaction.calculatePointsBalance(mockUserId2);
        expect(balance).toHaveLength(0);
      });
    });
    
    describe('getUserStats()', () => {
      test('should return user transaction statistics', async () => {
        const transaction1 = new Transaction({
          ...validTransactionData,
          status: 'completed',
          referenceId: `stats1-${Date.now()}-${Math.random()}`
        });
        await transaction1.save();
        
        const transaction2 = new Transaction({
          ...validCourseTransactionData,
          status: 'pending',
          referenceId: `stats2-${Date.now()}-${Math.random()}`
        });
        await transaction2.save();
        
        const stats = await Transaction.getUserStats(mockUserId);
        
        expect(stats).toHaveLength(2);
        
        const completedStats = stats.find(s => s._id === 'completed');
        const pendingStats = stats.find(s => s._id === 'pending');
        
        expect(completedStats.count).toBe(1);
        expect(pendingStats.count).toBe(1);
      });
    });
    
    describe('getRevenueStats()', () => {
      test('should calculate revenue statistics', async () => {
        const courseTransaction = new Transaction({
          ...validCourseTransactionData,
          status: 'completed',
          referenceId: `revenue1-${Date.now()}-${Math.random()}`
        });
        await courseTransaction.save();
        
        const subscriptionTransaction = new Transaction({
          userId: mockUserId,
          subscriptionId: mockSubscriptionId,
          type: 'subscription_payment',
          description: 'Premium subscription payment',
          amount: 29.99,
          status: 'completed',
          referenceId: `revenue2-${Date.now()}-${Math.random()}`
        });
        await subscriptionTransaction.save();
        
        const stats = await Transaction.getRevenueStats();
        
        expect(stats).toHaveLength(2);
        
        const courseStats = stats.find(s => s._id === 'course_purchase');
        const subscriptionStats = stats.find(s => s._id === 'subscription_payment');
        
        expect(courseStats.totalRevenue).toBe(99.99);
        expect(subscriptionStats.totalRevenue).toBe(29.99);
      });
    });
    
    describe('findStaleTransactions()', () => {
      test('should find old pending transactions', async () => {
        // Calculate the old date first
        const twentyFiveHoursAgo = new Date(Date.now() - (25 * 60 * 60 * 1000));
        
        // Create transaction directly with old date using MongoDB insertOne
        const transactionData = {
          userId: mockUserId,
          type: 'quiz_completion',
          description: 'Points earned from completing Math Quiz',
          amount: 0,
          pointsEarned: 50,
          status: 'pending',
          referenceId: `stale-${Date.now()}-${Math.random()}`,
          currency: 'USD',
          payment: { method: 'points' },
          discountUsed: { percentage: 0, amount: 0 },
          createdAt: twentyFiveHoursAgo,
          updatedAt: twentyFiveHoursAgo
        };
        
        // Insert directly into MongoDB to bypass Mongoose middleware
        const result = await Transaction.collection.insertOne(transactionData);
        
        // Verify it was inserted
        const inserted = await Transaction.findById(result.insertedId);
        expect(inserted).toBeTruthy();
        expect(inserted.status).toBe('pending');
        
        // Now test the static method
        const staleTransactions = await Transaction.findStaleTransactions(24);
        expect(staleTransactions).toHaveLength(1);
        expect(staleTransactions[0].status).toBe('pending');
        expect(staleTransactions[0]._id.toString()).toBe(result.insertedId.toString());
      });
    });
  });

  describe('Middleware', () => {
    test('should calculate net amount on save', async () => {
      const transaction = new Transaction({
        ...validCourseTransactionData,
        payment: {
          ...validCourseTransactionData.payment,
          processingFee: 3.99
        }
      });
      
      const savedTransaction = await transaction.save();
      expect(savedTransaction.payment.netAmount).toBe(96.00); // 99.99 - 3.99
    });
    
    test('should set timestamps based on status changes', async () => {
      const transaction = new Transaction(validTransactionData);
      const savedTransaction = await transaction.save();
      
      // Change to completed
      savedTransaction.status = 'completed';
      await savedTransaction.save();
      expect(savedTransaction.completedAt).toBeInstanceOf(Date);
      
      // Reset and change to failed
      const failedTransaction = new Transaction({
        ...validTransactionData,
        referenceId: `failed-${Date.now()}-${Math.random()}`
      });
      const savedFailedTransaction = await failedTransaction.save();
      
      savedFailedTransaction.status = 'failed';
      await savedFailedTransaction.save();
      expect(savedFailedTransaction.failedAt).toBeInstanceOf(Date);
    });
    
    test('should validate transaction consistency in pre-save', async () => {
      const inconsistentTransaction = new Transaction({
        userId: mockUserId,
        type: 'course_discount',
        description: 'Invalid transaction',
        amount: 50,
        pointsUsed: 100, // This is required for course_discount
        payment: {
          method: 'credit_card' // Should be 'points' for course_discount
        }
      });
      
      await expect(inconsistentTransaction.save()).rejects.toThrow('Transaction data is inconsistent');
    });
  });

  describe('Query Helpers', () => {
    test('completed query helper should work', async () => {
      const completedTransaction = new Transaction({
        ...validTransactionData,
        status: 'completed',
        referenceId: `completed-${Date.now()}-${Math.random()}`
      });
      await completedTransaction.save();
      
      const pendingTransaction = new Transaction({
        ...validTransactionData,
        status: 'pending',
        referenceId: `pending-${Date.now()}-${Math.random()}`
      });
      await pendingTransaction.save();
      
      const completedResults = await Transaction.find().completed();
      expect(completedResults).toHaveLength(1);
      expect(completedResults[0].status).toBe('completed');
    });
    
    test('pointsEarning query helper should work', async () => {
      const pointsTransaction = new Transaction({
        ...validTransactionData,
        referenceId: `points-${Date.now()}-${Math.random()}`
      });
      await pointsTransaction.save();
      
      const courseTransaction = new Transaction({
        ...validCourseTransactionData,
        referenceId: `course-${Date.now()}-${Math.random()}`
      });
      await courseTransaction.save();
      
      const pointsResults = await Transaction.find().pointsEarning();
      expect(pointsResults).toHaveLength(1);
      expect(pointsResults[0].type).toBe('quiz_completion');
    });
    
    test('recent query helper should work', async () => {
      const recentTransaction = new Transaction({
        ...validTransactionData,
        referenceId: `recent-${Date.now()}-${Math.random()}`
      });
      await recentTransaction.save();
      
      const recentResults = await Transaction.find().recent(30);
      expect(recentResults).toHaveLength(1);
    });
  });
});