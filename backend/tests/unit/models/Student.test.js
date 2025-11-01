/**
 * Student Model Unit Tests - COMPREHENSIVE VERSION
 * @description Complete tests for Student model functionality and compatibility
 * @file tests/unit/models/Student.test.js
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import BaseUser from '#models/users/BaseUser.js';
import Student from '#models/users/Student.js';

describe('Student Model', () => {
    let mongoServer;
    
    // Valid test data
    const validStudentData = {
        email: 'student@example.com',
        password: 'SecurePass123!',
        name: {
            first: 'Alice',
            last: 'Johnson'
        },
        academic: {
            level: 'undergraduate',
            institution: 'MIT',
            fieldOfStudy: 'Computer Science'
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
        await Student.deleteMany({});
        await BaseUser.deleteMany({});
    });

    describe('Student Creation & Inheritance', () => {
        test('should create student with valid data', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            expect(savedStudent.email).toBe('student@example.com');
            expect(savedStudent.name.first).toBe('Alice');
            expect(savedStudent.name.last).toBe('Johnson');
            expect(savedStudent.userType).toBe('Student');
            expect(savedStudent.academic.level).toBe('undergraduate');
            expect(savedStudent.academic.institution).toBe('MIT');
            expect(savedStudent.subscription.tier).toBe('free');
            expect(savedStudent.progress.totalPoints).toBe(0);
            expect(savedStudent.id).toBeDefined();
        });
        
        test('should inherit BaseUser functionality', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Test BaseUser inheritance
            expect(savedStudent.fullName).toBe('Alice Johnson');
            expect(savedStudent.initials).toBe('AJ');
            expect(savedStudent.status).toBe('active');
            expect(savedStudent.isActive).toBe(true);
            expect(savedStudent.verification.isEmailVerified).toBe(false);
        });
        
        test('should set default values correctly', async () => {
            const minimalData = {
                email: 'minimal@example.com',
                password: 'SecurePass123!',
                name: { first: 'John', last: 'Doe' }
            };
            
            const student = new Student(minimalData);
            const savedStudent = await student.save();
            
            expect(savedStudent.academic.level).toBe('undergraduate');
            expect(savedStudent.subscription.tier).toBe('free');
            expect(savedStudent.subscription.isActive).toBe(true);
            expect(savedStudent.progress.documentsUploaded).toBe(0);
            expect(savedStudent.progress.quizzesCompleted).toBe(0);
            expect(savedStudent.progress.totalPoints).toBe(0);
            expect(savedStudent.progress.studyStreak).toBe(0);
            expect(savedStudent.learningPreferences.preferredDifficulty).toBe('medium');
        });
    });
    
    describe('Academic Information Validation', () => {
        test('should accept valid academic levels', async () => {
            const validLevels = ['high_school', 'undergraduate', 'graduate', 'professional'];
            
            for (const level of validLevels) {
                const student = new Student({
                    ...validStudentData,
                    email: `${level}@example.com`,
                    academic: { level }
                });
                await expect(student.save()).resolves.toBeDefined();
                await student.deleteOne();
            }
        });
        
        test('should reject invalid academic level', async () => {
            const student = new Student({
                ...validStudentData,
                academic: { level: 'invalid_level' }
            });
            
            await expect(student.save()).rejects.toThrow('Invalid academic level');
        });
        
        test('should validate institution name length', async () => {
            const longInstitution = 'A'.repeat(101); // 101 characters
            const student = new Student({
                ...validStudentData,
                academic: { 
                    level: 'undergraduate',
                    institution: longInstitution
                }
            });
            
            await expect(student.save()).rejects.toThrow('Institution name too long');
        });
    });
    
    describe('Subscription Management', () => {
        test('should accept valid subscription tiers', async () => {
            const validTiers = ['free', 'premium', 'student'];
            
            for (const tier of validTiers) {
                const student = new Student({
                    ...validStudentData,
                    email: `${tier}@example.com`,
                    subscription: { tier }
                });
                const saved = await student.save();
                expect(saved.subscription.tier).toBe(tier);
                await student.deleteOne();
            }
        });
        
        test('should reject invalid subscription tier', async () => {
            const student = new Student({
                ...validStudentData,
                subscription: { tier: 'invalid_tier' }
            });
            
            await expect(student.save()).rejects.toThrow('Invalid subscription tier');
        });
    });
    
    describe('Virtual Properties', () => {
        test('should calculate hasActiveSubscription virtual', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            expect(savedStudent.hasActiveSubscription).toBe(true);
            
            savedStudent.subscription.isActive = false;
            expect(savedStudent.hasActiveSubscription).toBe(false);
        });
        
        test('should calculate isPremium virtual', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Free tier
            expect(savedStudent.isPremium).toBe(false);
            
            // Premium tier
            savedStudent.subscription.tier = 'premium';
            expect(savedStudent.isPremium).toBe(true);
            
            // Premium but inactive
            savedStudent.subscription.isActive = false;
            expect(savedStudent.isPremium).toBe(false);
        });
        
        test('should calculate availablePoints virtual', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.progress.totalPoints = 100;
            savedStudent.progress.pointsUsed = 30;
            
            expect(savedStudent.availablePoints).toBe(70);
        });
        
        test('should calculate completionRate virtual', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // No quizzes generated
            expect(savedStudent.completionRate).toBe(0);
            
            // 8 completed out of 10 generated
            savedStudent.progress.quizzesGenerated = 10;
            savedStudent.progress.quizzesCompleted = 8;
            expect(savedStudent.completionRate).toBe(80);
        });
        
        test('should calculate hasActiveStreak virtual', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // No study date
            expect(savedStudent.hasActiveStreak).toBe(false);
            
            // Studied today
            savedStudent.progress.lastStudyDate = new Date();
            expect(savedStudent.hasActiveStreak).toBe(true);
            
            // Studied 3 days ago
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            savedStudent.progress.lastStudyDate = threeDaysAgo;
            expect(savedStudent.hasActiveStreak).toBe(false);
        });
    });
    
    describe('Points System Methods - Transaction Compatibility', () => {
        test('should add points correctly', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.addPoints(50);
            expect(savedStudent.progress.totalPoints).toBe(50);
            
            savedStudent.addPoints(25);
            expect(savedStudent.progress.totalPoints).toBe(75);
        });
        
        test('should handle zero or negative points', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.addPoints(0);
            expect(savedStudent.progress.totalPoints).toBe(0);
            
            savedStudent.addPoints(-10);
            expect(savedStudent.progress.totalPoints).toBe(0);
        });
        
        test('should use points correctly', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.progress.totalPoints = 100;
            
            await savedStudent.usePoints(30);
            const updated = await Student.findById(savedStudent._id);
            expect(updated.progress.pointsUsed).toBe(30);
            expect(updated.availablePoints).toBe(70);
        });
        
        test('should throw error for insufficient points', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.progress.totalPoints = 50;
            
            // Test insufficient points
            try {
                await savedStudent.usePoints(100);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Insufficient points');
            }
            
            // Test zero points
            try {
                await savedStudent.usePoints(0);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Points must be greater than 0');
            }
            
            // Test negative points
            try {
                await savedStudent.usePoints(-10);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Points must be greater than 0');
            }
        });
        
        test('should check affordability correctly', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.progress.totalPoints = 100;
            savedStudent.progress.pointsUsed = 20;
            
            expect(savedStudent.canAfford(50)).toBe(true);
            expect(savedStudent.canAfford(80)).toBe(true);
            expect(savedStudent.canAfford(100)).toBe(false);
        });
    });
    
    describe('Activity Recording Methods', () => {
        test('should record document upload', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            await savedStudent.recordDocumentUpload();
            const updated = await Student.findById(savedStudent._id);
            
            expect(updated.progress.documentsUploaded).toBe(1);
            expect(updated.progress.studyStreak).toBe(1);
            expect(updated.progress.lastStudyDate).toBeDefined();
        });
        
        test('should record quiz generation', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            await savedStudent.recordQuizGeneration();
            const updated = await Student.findById(savedStudent._id);
            
            expect(updated.progress.quizzesGenerated).toBe(1);
        });
        
        test('should record quiz completion with full data', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            await savedStudent.recordQuizCompletion(85, 20, 300, 'mathematics');
            const updated = await Student.findById(savedStudent._id);
            
            expect(updated.progress.quizzesCompleted).toBe(1);
            expect(updated.progress.averageScore).toBe(85);
            expect(updated.progress.bestScore).toBe(85);
            expect(updated.progress.totalPoints).toBe(20);
            expect(updated.analytics.totalStudyTime).toBe(5); // 300 seconds = 5 minutes
            expect(updated.progress.studyStreak).toBe(1);
            
            // Check subject performance
            const mathPerf = updated.analytics.subjectPerformance.find(s => s.subject === 'mathematics');
            expect(mathPerf).toBeDefined();
            expect(mathPerf.averageScore).toBe(85);
            expect(mathPerf.attemptsCount).toBe(1);
        });
        
        test('should calculate averages correctly over multiple attempts', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // First quiz: 80%
            await savedStudent.recordQuizCompletion(80, 10, 300);
            let updated = await Student.findById(savedStudent._id);
            expect(updated.progress.averageScore).toBe(80);
            
            // Second quiz: 90%
            await updated.recordQuizCompletion(90, 15, 240);
            updated = await Student.findById(savedStudent._id);
            expect(updated.progress.averageScore).toBe(85); // (80 + 90) / 2
            expect(updated.progress.bestScore).toBe(90);
            expect(updated.progress.totalPoints).toBe(25); // 10 + 15
        });
        
        test('should record course interactions', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            await savedStudent.recordCourseView();
            await savedStudent.recordCoursePurchase();
            
            const updated = await Student.findById(savedStudent._id);
            expect(updated.progress.coursesViewed).toBe(1);
            expect(updated.progress.coursesPurchased).toBe(1);
        });
    });
    
    describe('Study Streak Management', () => {
        test('should start study streak on first activity', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.updateStudyStreak();
            
            expect(savedStudent.progress.studyStreak).toBe(1);
            expect(savedStudent.progress.lastStudyDate).toBeDefined();
        });
        
        test('should increment streak for consecutive days', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Day 1
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            savedStudent.progress.lastStudyDate = yesterday;
            savedStudent.progress.studyStreak = 1;
            
            // Day 2 (today)
            savedStudent.updateStudyStreak();
            
            expect(savedStudent.progress.studyStreak).toBe(2);
        });
        
        test('should reset streak for non-consecutive days', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // 3 days ago
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            savedStudent.progress.lastStudyDate = threeDaysAgo;
            savedStudent.progress.studyStreak = 5;
            
            // Today (gap of 2 days)
            savedStudent.updateStudyStreak();
            
            expect(savedStudent.progress.studyStreak).toBe(1);
        });
        
        test('should not change streak for same day', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.progress.lastStudyDate = new Date();
            savedStudent.progress.studyStreak = 3;
            
            savedStudent.updateStudyStreak();
            
            expect(savedStudent.progress.studyStreak).toBe(3);
        });
    });
    
    describe('Achievement System', () => {
        test('should award points achievements', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Add 100 points to trigger achievement
            savedStudent.addPoints(100);
            savedStudent.checkPointsAchievements();
            
            const achievement = savedStudent.analytics.achievements.find(
                a => a.type === 'first_100_points'
            );
            expect(achievement).toBeDefined();
            expect(achievement.description).toContain('first 100 points');
        });
        
        test('should award streak achievements', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            savedStudent.progress.studyStreak = 7;
            savedStudent.checkStreakAchievements();
            
            const achievement = savedStudent.analytics.achievements.find(
                a => a.type === 'week_warrior'
            );
            expect(achievement).toBeDefined();
            expect(achievement.description).toContain('7-day study streak');
        });
        
        test('should not duplicate achievements', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Add achievement manually
            savedStudent.analytics.achievements.push({
                type: 'first_100_points',
                description: 'Already earned',
                achievedAt: new Date()
            });
            
            // Try to add same achievement again
            savedStudent.addPoints(100);
            savedStudent.checkPointsAchievements();
            
            const achievements = savedStudent.analytics.achievements.filter(
                a => a.type === 'first_100_points'
            );
            expect(achievements).toHaveLength(1);
        });
    });
    
    describe('Performance Analysis', () => {
        test('should analyze strengths and weaknesses', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Add subject performances
            savedStudent.analytics.subjectPerformance = [
                { subject: 'mathematics', averageScore: 90, attemptsCount: 5 },
                { subject: 'science', averageScore: 50, attemptsCount: 3 },
                { subject: 'history', averageScore: 75, attemptsCount: 2 }
            ];
            
            const analysis = savedStudent.getPerformanceAnalysis();
            
            expect(analysis.strengths).toHaveLength(1);
            expect(analysis.strengths[0].subject).toBe('mathematics');
            expect(analysis.weaknesses).toHaveLength(1);
            expect(analysis.weaknesses[0].subject).toBe('science');
        });
        
        test('should update subject performance correctly', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // First attempt
            savedStudent.updateSubjectPerformance('mathematics', 80);
            expect(savedStudent.analytics.subjectPerformance).toHaveLength(1);
            
            const mathPerf = savedStudent.analytics.subjectPerformance[0];
            expect(mathPerf.subject).toBe('mathematics');
            expect(mathPerf.averageScore).toBe(80);
            expect(mathPerf.attemptsCount).toBe(1);
            
            // Second attempt
            savedStudent.updateSubjectPerformance('mathematics', 90);
            
            const updatedMathPerf = savedStudent.analytics.subjectPerformance[0];
            expect(updatedMathPerf.averageScore).toBe(85); // (80 + 90) / 2
            expect(updatedMathPerf.attemptsCount).toBe(2);
        });
    });
    
    describe('Subscription Management', () => {
        test('should update subscription correctly', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            const subscriptionId = new mongoose.Types.ObjectId();
            await savedStudent.updateSubscription('premium', true, subscriptionId);
            
            const updated = await Student.findById(savedStudent._id);
            expect(updated.subscription.tier).toBe('premium');
            expect(updated.subscription.isActive).toBe(true);
            expect(updated.subscription.subscriptionId.toString()).toBe(subscriptionId.toString());
        });
    });
    
    describe('Static Methods', () => {
        test('should find students by academic level', async () => {
            // Create students with different levels
            const undergrad = new Student({
                ...validStudentData,
                academic: { level: 'undergraduate' }
            });
            await undergrad.save();
            
            const grad = new Student({
                ...validStudentData,
                email: 'grad@example.com',
                academic: { level: 'graduate' }
            });
            await grad.save();
            
            const undergrads = await Student.findByLevel('undergraduate');
            expect(undergrads).toHaveLength(1);
            expect(undergrads[0].academic.level).toBe('undergraduate');
        });
        
        test('should find premium subscribers', async () => {
            // Create free user
            const freeUser = new Student(validStudentData);
            await freeUser.save();
            
            // Create premium user
            const premiumUser = new Student({
                ...validStudentData,
                email: 'premium@example.com',
                subscription: { tier: 'premium', isActive: true }
            });
            await premiumUser.save();
            
            const premiumUsers = await Student.findPremiumSubscribers();
            expect(premiumUsers).toHaveLength(1);
            expect(premiumUsers[0].subscription.tier).toBe('premium');
        });
        
        test('should get points leaderboard', async () => {
            // Create students with different points
            const student1 = new Student({
                ...validStudentData,
                progress: { totalPoints: 100 }
            });
            await student1.save();
            
            const student2 = new Student({
                ...validStudentData,
                email: 'student2@example.com',
                progress: { totalPoints: 200 }
            });
            await student2.save();
            
            const leaderboard = await Student.getPointsLeaderboard(10);
            expect(leaderboard).toHaveLength(2);
            expect(leaderboard[0].progress.totalPoints).toBe(200); // Highest first
            expect(leaderboard[1].progress.totalPoints).toBe(100);
        });
        
        test('should get comprehensive statistics', async () => {
            // Create students with different tiers
            const freeStudent = new Student(validStudentData);
            await freeStudent.save();
            
            const premiumStudent = new Student({
                ...validStudentData,
                email: 'premium@example.com',
                subscription: { tier: 'premium' },
                progress: { documentsUploaded: 5, totalPoints: 100 }
            });
            await premiumStudent.save();
            
            const stats = await Student.getComprehensiveStats();
            expect(stats).toHaveLength(2); // free and premium tiers
            
            const freeStats = stats.find(s => s._id === 'free');
            const premiumStats = stats.find(s => s._id === 'premium');
            
            expect(freeStats.count).toBe(1);
            expect(premiumStats.count).toBe(1);
            expect(premiumStats.avgPoints).toBe(100);
        });
        
        test('should find inactive students', async () => {
            const activeStudent = new Student({
                ...validStudentData,
                progress: { lastStudyDate: new Date() }
            });
            await activeStudent.save();
            
            const inactiveDate = new Date();
            inactiveDate.setDate(inactiveDate.getDate() - 10);
            
            const inactiveStudent = new Student({
                ...validStudentData,
                email: 'inactive@example.com',
                progress: { lastStudyDate: inactiveDate }
            });
            await inactiveStudent.save();
            
            const inactive = await Student.findInactiveStudents(7); // 7 days
            expect(inactive).toHaveLength(1);
            expect(inactive[0].email).toBe('inactive@example.com');
        });
    });
    
    describe('Query Helpers', () => {
        test('should filter by subscription tier', async () => {
            const freeStudent = new Student(validStudentData);
            await freeStudent.save();
            
            const premiumStudent = new Student({
                ...validStudentData,
                email: 'premium@example.com',
                subscription: { tier: 'premium' }
            });
            await premiumStudent.save();
            
            const premiumStudents = await Student.find().byTier('premium');
            expect(premiumStudents).toHaveLength(1);
            expect(premiumStudents[0].subscription.tier).toBe('premium');
        });
        
        test('should filter high performers', async () => {
            const lowPerformer = new Student({
                ...validStudentData,
                progress: { averageScore: 65 }
            });
            await lowPerformer.save();
            
            const highPerformer = new Student({
                ...validStudentData,
                email: 'high@example.com',
                progress: { averageScore: 95 }
            });
            await highPerformer.save();
            
            const highPerformers = await Student.find().highPerformers(80);
            expect(highPerformers).toHaveLength(1);
            expect(highPerformers[0].progress.averageScore).toBe(95);
        });
        
        test('should filter by points range', async () => {
            const lowPoints = new Student({
                ...validStudentData,
                progress: { totalPoints: 50 }
            });
            await lowPoints.save();
            
            const highPoints = new Student({
                ...validStudentData,
                email: 'high@example.com',
                progress: { totalPoints: 150 }
            });
            await highPoints.save();
            
            const midRangeStudents = await Student.find().byPointsRange(40, 100);
            expect(midRangeStudents).toHaveLength(1);
            expect(midRangeStudents[0].progress.totalPoints).toBe(50);
        });
    });
    
    describe('Model Compatibility Integration', () => {
        test('should work correctly with Transaction model expectations', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Simulate earning points (Transaction model scenario)
            savedStudent.addPoints(50);
            expect(savedStudent.progress.totalPoints).toBe(50);
            
            // Simulate using points for purchase (Transaction model scenario)
            await savedStudent.usePoints(20);
            expect(savedStudent.availablePoints).toBe(30);
            
            // Check affordability (Course model scenario)
            expect(savedStudent.canAfford(25)).toBe(true);
            expect(savedStudent.canAfford(35)).toBe(false);
        });
        
        test('should integrate properly with Quiz model expectations', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Record quiz activities (Quiz/QuizAttempt model scenario)
            await savedStudent.recordQuizGeneration();
            await savedStudent.recordQuizCompletion(85, 15, 300, 'mathematics');
            
            const updated = await Student.findById(savedStudent._id);
            expect(updated.progress.quizzesGenerated).toBe(1);
            expect(updated.progress.quizzesCompleted).toBe(1);
            expect(updated.completionRate).toBe(100);
            expect(updated.progress.totalPoints).toBe(15);
        });
        
        test('should integrate properly with Document model expectations', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Record document activities (Document model scenario)
            await savedStudent.recordDocumentUpload();
            
            const updated = await Student.findById(savedStudent._id);
            expect(updated.progress.documentsUploaded).toBe(1);
            expect(updated.progress.studyStreak).toBe(1);
        });
        
        test('should integrate properly with Course model expectations', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            // Record course activities (Course model scenario)
            await savedStudent.recordCourseView();
            await savedStudent.recordCoursePurchase();
            
            const updated = await Student.findById(savedStudent._id);
            expect(updated.progress.coursesViewed).toBe(1);
            expect(updated.progress.coursesPurchased).toBe(1);
        });
        
        test('should integrate properly with Subscription model expectations', async () => {
            const student = new Student(validStudentData);
            const savedStudent = await student.save();
            
            const subscriptionId = new mongoose.Types.ObjectId();
            
            // Update subscription (Subscription model scenario)
            await savedStudent.updateSubscription('premium', true, subscriptionId);
            
            const updated = await Student.findById(savedStudent._id);
            expect(updated.subscription.tier).toBe('premium');
            expect(updated.subscription.subscriptionId.toString()).toBe(subscriptionId.toString());
            expect(updated.isPremium).toBe(true);
        });
    });
    
    describe('Indexes and Performance', () => {
        test('should have created proper indexes', async () => {
            const indexes = await Student.collection.getIndexes();
            
            // Check for Student-specific indexes
            expect(Object.hasOwnProperty.call(indexes, 'academic.level_1_status_1')).toBe(true);
            expect(Object.hasOwnProperty.call(indexes, 'subscription.tier_1_subscription.isActive_1')).toBe(true);
            expect(Object.hasOwnProperty.call(indexes, 'progress.totalPoints_-1')).toBe(true);
            expect(Object.hasOwnProperty.call(indexes, 'progress.averageScore_-1')).toBe(true);
            
            // Should also inherit BaseUser indexes
            expect(indexes).toHaveProperty('email_1');
            expect(indexes).toHaveProperty('userType_1_status_1');
        });
    });
});