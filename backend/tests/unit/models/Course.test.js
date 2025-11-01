/**
 * Course Model Unit Tests
 * @description Tests for Course model following Document test patterns
 * @file tests/unit/models/course.test.js
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Course from '#models/course/Course.js';

describe('Course Model', () => {
  let mongoServer;
  
  // Valid test data
  const mockInstructorUserId = new mongoose.Types.ObjectId();
  
  const validCourseData = {
    title: 'Complete JavaScript Course',
    slug: 'complete-javascript-course',
    description: 'Learn JavaScript from basics to advanced concepts including ES6, async programming, DOM manipulation, and modern frameworks. This comprehensive course covers everything you need to become a proficient JavaScript developer.',
    category: 'programming',
    level: 'intermediate',
    source: 'internal',
    instructor: {
      name: 'John Doe',
      type: 'internal',
      userId: mockInstructorUserId,
      bio: 'Experienced JavaScript developer with 10+ years in the industry'
    },
    pricing: {
      currency: 'USD',
      originalPrice: 99.99,
      currentPrice: 79.99
    },
    content: {
      type: 'video',
      duration: {
        hours: 12,
        minutes: 30
      },
      totalLectures: 45,
      language: 'en',
      learningOutcomes: [
        'Master JavaScript fundamentals and advanced concepts',
        'Build interactive web applications',
        'Understand asynchronous programming'
      ]
    },
    media: {
      thumbnail: 'https://example.com/thumbnail.jpg'
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
    await Course.deleteMany({});
  });

  describe('Course Creation & Validation', () => {
    test('should create Course with correct properties', async () => {
      const course = new Course(validCourseData);
      const savedCourse = await course.save();
      
      expect(savedCourse.title).toBe('Complete JavaScript Course');
      expect(savedCourse.slug).toBe('complete-javascript-course');
      expect(savedCourse.description).toBe(validCourseData.description);
      expect(savedCourse.category).toBe('programming');
      expect(savedCourse.level).toBe('intermediate');
      expect(savedCourse.source).toBe('internal');
      expect(savedCourse.instructor.name).toBe('John Doe');
      expect(savedCourse.pricing.originalPrice).toBe(99.99);
      expect(savedCourse.pricing.currentPrice).toBe(79.99);
      expect(savedCourse.content.duration.hours).toBe(12);
      expect(savedCourse.content.duration.minutes).toBe(30);
      expect(savedCourse.id).toBeDefined();
    });
    
    test('should use default values when options not provided', async () => {
      const course = new Course(validCourseData);
      const savedCourse = await course.save();
      
      expect(savedCourse.status).toBe('draft');
      expect(savedCourse.pricing.currency).toBe('USD');
      expect(savedCourse.content.language).toBe('en');
      expect(savedCourse.content.type).toBe('video');
      expect(savedCourse.instructor.type).toBe('internal');
      expect(savedCourse.accessType).toBe('lifetime');
      expect(savedCourse.isActive).toBe(true);
      expect(savedCourse.isFeatured).toBe(false);
      expect(savedCourse.pricing.isFree).toBe(false);
      expect(savedCourse.content.hasSubtitles).toBe(false);
      expect(savedCourse.rating.average).toBe(0);
      expect(savedCourse.rating.count).toBe(0);
      expect(savedCourse.enrollment.totalStudents).toBe(0);
      expect(savedCourse.analytics.views).toBe(0);
      expect(savedCourse.analytics.clicks).toBe(0);
      expect(savedCourse.analytics.conversions).toBe(0);
      expect(savedCourse.business.totalSales).toBe(0);
      expect(savedCourse.business.revenue).toBe(0);
      expect(savedCourse.studion.pointsDiscount.enabled).toBe(true);
      expect(savedCourse.studion.pointsDiscount.maxPointsUsable).toBe(1000);
      expect(savedCourse.studion.pointsDiscount.pointsToDiscountRatio).toBe(0.01);
    });
    
    test('should auto-generate slug from title', async () => {
      const course = new Course({
        ...validCourseData,
        title: 'Advanced React & Redux Masterclass',
        slug: undefined // Remove slug to test auto-generation
      });
      
      const savedCourse = await course.save();
      expect(savedCourse.slug).toBe('advanced-react-redux-masterclass');
    });
    
    test('should calculate discount percentage automatically', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: {
          currency: 'USD',
          originalPrice: 100,
          currentPrice: 75
        }
      });
      
      const savedCourse = await course.save();
      expect(savedCourse.pricing.discount.percentage).toBe(25);
    });
    
    test('should set isFree flag when price is zero', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: {
          currency: 'USD',
          originalPrice: 99.99,
          currentPrice: 0
        }
      });
      
      const savedCourse = await course.save();
      expect(savedCourse.pricing.isFree).toBe(true);
    });
  });

  describe('Required Fields Validation', () => {
    test('should require title', async () => {
      const course = new Course({
        ...validCourseData,
        title: undefined
      });
      
      await expect(course.save()).rejects.toThrow('Course title is required');
    });
    
    test('should require description', async () => {
      const course = new Course({
        ...validCourseData,
        description: undefined
      });
      
      await expect(course.save()).rejects.toThrow('Course description is required');
    });
    
    test('should require category', async () => {
      const course = new Course({
        ...validCourseData,
        category: undefined
      });
      
      await expect(course.save()).rejects.toThrow('Course category is required');
    });
    
    test('should require level', async () => {
      const course = new Course({
        ...validCourseData,
        level: undefined
      });
      
      await expect(course.save()).rejects.toThrow('Course level is required');
    });
    
    test('should require source', async () => {
      const course = new Course({
        ...validCourseData,
        source: undefined
      });
      
      await expect(course.save()).rejects.toThrow('Course source is required');
    });
    
    test('should require instructor information', async () => {
      const course = new Course({
        ...validCourseData,
        instructor: undefined
      });
      
      await expect(course.save()).rejects.toThrow('Instructor information is required');
    });
    
    test('should require instructor name', async () => {
      const course = new Course({
        ...validCourseData,
        instructor: {
          type: 'internal',
          userId: mockInstructorUserId
        }
      });
      
      await expect(course.save()).rejects.toThrow('Instructor name is required');
    });
    
    test('should require pricing information', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: undefined
      });
      
      await expect(course.save()).rejects.toThrow('Pricing information is required');
    });
    
    test('should require original price', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: {
          currency: 'USD',
          currentPrice: 79.99
        }
      });
      
      await expect(course.save()).rejects.toThrow('Original price is required');
    });
    
    test('should require current price', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: {
          currency: 'USD',
          originalPrice: 99.99
        }
      });
      
      await expect(course.save()).rejects.toThrow('Current price is required');
    });
    
    test('should require content information', async () => {
      const course = new Course({
        ...validCourseData,
        content: undefined
      });
      
      await expect(course.save()).rejects.toThrow('Content information is required');
    });
    
    test('should require thumbnail', async () => {
      const course = new Course({
        ...validCourseData,
        media: {
          previewVideo: 'https://example.com/preview.mp4'
        }
      });
      
      await expect(course.save()).rejects.toThrow('Thumbnail is required');
    });
  });

  describe('Validation Rules', () => {
    test('should enforce title length limits', async () => {
      const shortTitle = new Course({
        ...validCourseData,
        title: 'Hi' // Too short
      });
      
      await expect(shortTitle.save()).rejects.toThrow('Title too short');
      
      const longTitle = new Course({
        ...validCourseData,
        title: 'A'.repeat(201), // Too long
        slug: 'long-title-course'
      });
      
      await expect(longTitle.save()).rejects.toThrow('Title too long');
    });
    
    test('should enforce description length limits', async () => {
      const shortDescription = new Course({
        ...validCourseData,
        description: 'Short description', // Too short
        slug: 'short-desc-course'
      });
      
      await expect(shortDescription.save()).rejects.toThrow('Description too short');
      
      const longDescription = new Course({
        ...validCourseData,
        description: 'A'.repeat(5001), // Too long
        slug: 'long-desc-course'
      });
      
      await expect(longDescription.save()).rejects.toThrow('Description too long');
    });
    
    test('should enforce price limits', async () => {
      const negativePriceCourse = new Course({
        ...validCourseData,
        slug: 'negative-price-course',
        pricing: {
          currency: 'USD',
          originalPrice: -10,
          currentPrice: 50
        }
      });
      
      await expect(negativePriceCourse.save()).rejects.toThrow();
      
      const expensiveCourse = new Course({
        ...validCourseData,
        slug: 'expensive-course',
        pricing: {
          currency: 'USD',
          originalPrice: 20000, // Too expensive
          currentPrice: 15000
        }
      });
      
      await expect(expensiveCourse.save()).rejects.toThrow();
    });
    
    test('should enforce duration limits', async () => {
      const invalidMinutes = new Course({
        ...validCourseData,
        slug: 'invalid-duration-course',
        content: {
          ...validCourseData.content,
          duration: {
            hours: 5,
            minutes: 75 // Invalid minutes
          }
        }
      });
      
      await expect(invalidMinutes.save()).rejects.toThrow();
    });
    
    test('should enforce instructor name length limits', async () => {
      const shortName = new Course({
        ...validCourseData,
        slug: 'short-name-course',
        instructor: {
          name: 'A',
          type: 'internal'
        }
      });
      
      await expect(shortName.save()).rejects.toThrow();
      
      const longName = new Course({
        ...validCourseData,
        slug: 'long-name-course',
        instructor: {
          name: 'A'.repeat(101),
          type: 'internal'
        }
      });
      
      await expect(longName.save()).rejects.toThrow();
    });
  });

  describe('Enum Validation', () => {
    test('should validate course categories', async () => {
      const invalidCategory = new Course({
        ...validCourseData,
        slug: 'invalid-category-course',
        category: 'invalid_category'
      });
      
      await expect(invalidCategory.save()).rejects.toThrow('Invalid course category');
    });
    
    test('should validate course levels', async () => {
      const invalidLevel = new Course({
        ...validCourseData,
        slug: 'invalid-level-course',
        level: 'invalid_level'
      });
      
      await expect(invalidLevel.save()).rejects.toThrow('Invalid course level');
    });
    
    test('should validate course statuses', async () => {
      const invalidStatus = new Course({
        ...validCourseData,
        slug: 'invalid-status-course',
        status: 'invalid_status'
      });
      
      await expect(invalidStatus.save()).rejects.toThrow('Invalid course status');
    });
    
    test('should validate currencies', async () => {
      const invalidCurrency = new Course({
        ...validCourseData,
        slug: 'invalid-currency-course',
        pricing: {
          ...validCourseData.pricing,
          currency: 'INVALID'
        }
      });
      
      await expect(invalidCurrency.save()).rejects.toThrow('Invalid currency');
    });
    
    test('should validate languages', async () => {
      const invalidLanguage = new Course({
        ...validCourseData,
        slug: 'invalid-language-course',
        content: {
          ...validCourseData.content,
          language: 'invalid'
        }
      });
      
      await expect(invalidLanguage.save()).rejects.toThrow('Invalid course language');
    });
    
    test('should validate instructor types', async () => {
      const invalidInstructorType = new Course({
        ...validCourseData,
        slug: 'invalid-instructor-type-course',
        instructor: {
          ...validCourseData.instructor,
          type: 'invalid_type'
        }
      });
      
      await expect(invalidInstructorType.save()).rejects.toThrow('Invalid instructor type');
    });
    
    test('should validate content types', async () => {
      const invalidContentType = new Course({
        ...validCourseData,
        slug: 'invalid-content-type-course',
        content: {
          ...validCourseData.content,
          type: 'invalid_type'
        }
      });
      
      await expect(invalidContentType.save()).rejects.toThrow('Invalid content type');
    });
    
    test('should validate course sources', async () => {
      const invalidSource = new Course({
        ...validCourseData,
        slug: 'invalid-source-course',
        source: 'invalid_source'
      });
      
      await expect(invalidSource.save()).rejects.toThrow('Invalid course source');
    });
  });

  describe('Virtual Properties', () => {
    test('formattedPrice should format correctly', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: {
          currency: 'USD',
          originalPrice: 99.99,
          currentPrice: 79.99
        }
      });
      const savedCourse = await course.save();
      
      expect(savedCourse.formattedPrice).toBe('$79.99');
      
      // Test free course
      savedCourse.pricing.currentPrice = 0;
      savedCourse.pricing.isFree = true;
      expect(savedCourse.formattedPrice).toBe('Free');
    });
    
    test('totalDurationMinutes should calculate correctly', async () => {
      const course = new Course({
        ...validCourseData,
        content: {
          ...validCourseData.content,
          duration: {
            hours: 2,
            minutes: 30
          }
        }
      });
      const savedCourse = await course.save();
      
      expect(savedCourse.totalDurationMinutes).toBe(150); // 2*60 + 30
    });
    
    test('formattedDuration should format correctly', async () => {
      const course = new Course(validCourseData);
      const savedCourse = await course.save();
      
      // Test hours and minutes
      savedCourse.content.duration = { hours: 2, minutes: 30 };
      expect(savedCourse.formattedDuration).toBe('2h 30m');
      
      // Test only hours
      savedCourse.content.duration = { hours: 3, minutes: 0 };
      expect(savedCourse.formattedDuration).toBe('3h');
      
      // Test only minutes
      savedCourse.content.duration = { hours: 0, minutes: 45 };
      expect(savedCourse.formattedDuration).toBe('45m');
    });
    
    test('hasDiscount should return correct value', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: {
          currency: 'USD',
          originalPrice: 100,
          currentPrice: 80
        }
      });
      const savedCourse = await course.save();
      
      expect(savedCourse.hasDiscount).toBe(true);
      
      // Test no discount - need to update the discount percentage field directly
      savedCourse.pricing.discount.percentage = 0;
      expect(savedCourse.hasDiscount).toBe(false);
    });
    
    test('isExternal should return correct value', async () => {
      const internalCourse = new Course({
        ...validCourseData,
        source: 'internal'
      });
      const savedInternal = await internalCourse.save();
      
      expect(savedInternal.isExternal).toBe(false);
      
      const externalCourse = new Course({
        ...validCourseData,
        title: 'External Course',
        slug: 'external-course',
        source: 'udemy'
      });
      const savedExternal = await externalCourse.save();
      
      expect(savedExternal.isExternal).toBe(true);
    });
    
    test('purchaseUrl should return correct URL', async () => {
      const internalCourse = new Course({
        ...validCourseData,
        source: 'internal',
        slug: 'test-course'
      });
      const savedInternal = await internalCourse.save();
      
      expect(savedInternal.purchaseUrl).toBe('/courses/test-course/purchase');
      
      const externalCourse = new Course({
        ...validCourseData,
        title: 'External Course',
        slug: 'external-course-test',
        source: 'udemy',
        external: {
          affiliateUrl: 'https://udemy.com/course/test?ref=affiliate'
        }
      });
      const savedExternal = await externalCourse.save();
      
      expect(savedExternal.purchaseUrl).toBe('https://udemy.com/course/test?ref=affiliate');
    });
    
    test('isAvailable should return correct value', async () => {
      const course = new Course({
        ...validCourseData,
        status: 'active',
        isActive: true
      });
      const savedCourse = await course.save();
      
      expect(savedCourse.isAvailable).toBe(true);
      
      // Test inactive course
      savedCourse.status = 'draft';
      expect(savedCourse.isAvailable).toBe(false);
      
      // Test soft deleted course
      savedCourse.status = 'active';
      savedCourse.deletedAt = new Date();
      expect(savedCourse.isAvailable).toBe(false);
    });
  });

  describe('Instance Methods', () => {
    describe('updateRating()', () => {
      test('should update course rating correctly', async () => {
        const course = new Course(validCourseData);
        const savedCourse = await course.save();
        
        await savedCourse.updateRating(5);
        
        expect(savedCourse.rating.count).toBe(1);
        expect(savedCourse.rating.average).toBe(5);
        expect(savedCourse.rating.distribution[5]).toBe(1);
        
        // Add another rating
        await savedCourse.updateRating(4);
        
        expect(savedCourse.rating.count).toBe(2);
        expect(savedCourse.rating.average).toBe(4.5); // (5+4)/2
        expect(savedCourse.rating.distribution[4]).toBe(1);
        expect(savedCourse.rating.distribution[5]).toBe(1);
      });
      
      test('should update existing rating', async () => {
        const course = new Course(validCourseData);
        const savedCourse = await course.save();
        
        await savedCourse.updateRating(3);
        expect(savedCourse.rating.average).toBe(3);
        
        // Update the rating from 3 to 5
        await savedCourse.updateRating(5, 3);
        
        expect(savedCourse.rating.count).toBe(1);
        expect(savedCourse.rating.average).toBe(5);
        expect(savedCourse.rating.distribution[3]).toBe(0);
        expect(savedCourse.rating.distribution[5]).toBe(1);
      });
    });
    
    describe('Analytics Methods', () => {
      test('recordView should update view analytics', async () => {
        const course = new Course(validCourseData);
        const savedCourse = await course.save();
        
        await savedCourse.recordView();
        
        const updatedCourse = await Course.findById(savedCourse._id);
        expect(updatedCourse.analytics.views).toBe(1);
        expect(updatedCourse.analytics.lastViewedAt).toBeInstanceOf(Date);
      });
      
      test('recordClick should update click analytics', async () => {
        const course = new Course(validCourseData);
        const savedCourse = await course.save();
        
        await savedCourse.recordClick();
        
        const updatedCourse = await Course.findById(savedCourse._id);
        expect(updatedCourse.analytics.clicks).toBe(1);
      });
      
      test('recordConversion should update conversion analytics', async () => {
        const course = new Course(validCourseData);
        const savedCourse = await course.save();
        
        await savedCourse.recordConversion(79.99);
        
        const updatedCourse = await Course.findById(savedCourse._id);
        expect(updatedCourse.analytics.conversions).toBe(1);
        expect(updatedCourse.enrollment.totalStudents).toBe(1);
        expect(updatedCourse.business.totalSales).toBe(1);
        expect(updatedCourse.business.revenue).toBe(79.99);
      });
    });
    
    describe('Points Discount Methods', () => {
      test('canUsePointsDiscount should return correct value', async () => {
        const course = new Course({
          ...validCourseData,
          studion: {
            pointsDiscount: {
              enabled: true,
              maxPointsUsable: 1000,
              pointsToDiscountRatio: 0.01
            }
          }
        });
        const savedCourse = await course.save();
        
        expect(savedCourse.canUsePointsDiscount(500)).toBe(true);
        expect(savedCourse.canUsePointsDiscount(0)).toBe(false);
        
        // Test free course
        savedCourse.pricing.currentPrice = 0;
        savedCourse.pricing.isFree = true;
        expect(savedCourse.canUsePointsDiscount(500)).toBe(false);
        
        // Test disabled points discount
        savedCourse.pricing.currentPrice = 79.99;
        savedCourse.pricing.isFree = false;
        savedCourse.studion.pointsDiscount.enabled = false;
        expect(savedCourse.canUsePointsDiscount(500)).toBe(false);
      });
      
      test('calculatePointsDiscount should calculate correctly', async () => {
        const course = new Course({
          ...validCourseData,
          pricing: {
            currency: 'USD',
            originalPrice: 100,
            currentPrice: 100
          },
          studion: {
            pointsDiscount: {
              enabled: true,
              maxPointsUsable: 1000,
              pointsToDiscountRatio: 0.01 // 1 point = $0.01
            }
          }
        });
        const savedCourse = await course.save();
        
        // Test normal discount
        expect(savedCourse.calculatePointsDiscount(500)).toBe(5); // 500 * 0.01 = $5
        
        // Test max points limit
        expect(savedCourse.calculatePointsDiscount(1500)).toBe(10); // max 1000 * 0.01 = $10
        
        // Test discount limited by course price
        expect(savedCourse.calculatePointsDiscount(15000)).toBe(10); // Max usable is 1000 points = $10
      });
      
      test('getFinalPrice should calculate correctly', async () => {
        const course = new Course({
          ...validCourseData,
          pricing: {
            currency: 'USD',
            originalPrice: 100,
            currentPrice: 80
          },
          studion: {
            pointsDiscount: {
              enabled: true,
              maxPointsUsable: 1000,
              pointsToDiscountRatio: 0.01
            }
          }
        });
        const savedCourse = await course.save();
        
        expect(savedCourse.getFinalPrice(0)).toBe(80); // No points used
        expect(savedCourse.getFinalPrice(500)).toBe(75); // $80 - $5 discount
        expect(savedCourse.getFinalPrice(10000)).toBe(70); // $80 - $10 max discount
      });
    });
    
    describe('Soft Delete Methods', () => {
      test('softDelete should set deletedAt timestamp and deactivate', async () => {
        const course = new Course(validCourseData);
        const savedCourse = await course.save();
        
        expect(savedCourse.deletedAt).toBeNull();
        expect(savedCourse.isActive).toBe(true);
        
        await savedCourse.softDelete();
        
        expect(savedCourse.deletedAt).toBeInstanceOf(Date);
        expect(savedCourse.isActive).toBe(false);
      });
      
      test('restore should clear deletedAt timestamp and reactivate', async () => {
        const course = new Course(validCourseData);
        const savedCourse = await course.save();
        
        savedCourse.deletedAt = new Date();
        savedCourse.isActive = false;
        await savedCourse.save();
        
        await savedCourse.restore();
        
        expect(savedCourse.deletedAt).toBeNull();
        expect(savedCourse.isActive).toBe(true);
      });
    });
  });

  describe('Static Methods', () => {
    describe('findWithFilters()', () => {
      test('should find courses with category filter', async () => {
        const course1 = new Course({
          ...validCourseData,
          category: 'programming',
          title: 'JavaScript Course',
          slug: 'javascript-course-test',
          status: 'active'
        });
        await course1.save();
        
        const course2 = new Course({
          ...validCourseData,
          category: 'graphic_design',
          title: 'Design Course',
          slug: 'design-course-test',
          status: 'active'
        });
        await course2.save();
        
        const programmingCourses = await Course.findWithFilters({
          category: 'programming',
          limit: 10
        });
        
        expect(programmingCourses).toHaveLength(1);
        expect(programmingCourses[0].title).toBe('JavaScript Course');
      });
      
      test('should find courses with price range filter', async () => {
        const course1 = new Course({
          ...validCourseData,
          title: 'Expensive Course',
          slug: 'expensive-course-test',
          status: 'active',
          pricing: {
            currency: 'USD',
            originalPrice: 200,
            currentPrice: 150
          }
        });
        await course1.save();
        
        const course2 = new Course({
          ...validCourseData,
          title: 'Cheap Course',
          slug: 'cheap-course-test',
          status: 'active',
          pricing: {
            currency: 'USD',
            originalPrice: 50,
            currentPrice: 30
          }
        });
        await course2.save();
        
        const affordableCourses = await Course.findWithFilters({
          priceRange: { min: 0, max: 100 },
          limit: 10
        });
        
        expect(affordableCourses).toHaveLength(1);
        expect(affordableCourses[0].title).toBe('Cheap Course');
      });
    });
    
    describe('searchByText()', () => {
      test('should perform text search', async () => {
        const course = new Course({
          ...validCourseData,
          title: 'Machine Learning with Python',
          slug: 'machine-learning-python-test',
          status: 'active',
          description: 'Learn data science and artificial intelligence using Python programming language'
        });
        await course.save();
        
        const results = await Course.searchByText('machine learning python');
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Machine Learning with Python');
      });
    });
    
    describe('getFeatured()', () => {
      test('should return featured courses', async () => {
        const course1 = new Course({
          ...validCourseData,
          title: 'Featured Course',
          slug: 'featured-course-test',
          status: 'active',
          isFeatured: true
        });
        await course1.save();
        
        const course2 = new Course({
          ...validCourseData,
          title: 'Regular Course',
          slug: 'regular-course-test',
          status: 'active',
          isFeatured: false
        });
        await course2.save();
        
        const featuredCourses = await Course.getFeatured(5);
        
        expect(featuredCourses).toHaveLength(1);
        expect(featuredCourses[0].title).toBe('Featured Course');
      });
    });
  });

  describe('Middleware', () => {
    test('should generate slug if not provided', async () => {
      const course = new Course({
        ...validCourseData,
        title: 'React & Node.js Full Stack!',
        slug: undefined
      });
      
      const savedCourse = await course.save();
      expect(savedCourse.slug).toBe('react-node-js-full-stack');
    });
    
    test('should calculate discount percentage on save', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: {
          currency: 'USD',
          originalPrice: 200,
          currentPrice: 150
        }
      });
      
      const savedCourse = await course.save();
      expect(savedCourse.pricing.discount.percentage).toBe(25);
    });
    
    test('should set isFree flag when price is zero', async () => {
      const course = new Course({
        ...validCourseData,
        pricing: {
          currency: 'USD',
          originalPrice: 100,
          currentPrice: 0
        }
      });
      
      const savedCourse = await course.save();
      expect(savedCourse.pricing.isFree).toBe(true);
    });
    
    test('should clean up tags', async () => {
      const course = new Course({
        ...validCourseData,
        tags: ['  JavaScript  ', 'programming', 'JAVASCRIPT', 'Programming', 'web-dev']
      });
      
      const savedCourse = await course.save();
      expect(savedCourse.tags).toEqual(['javascript', 'programming', 'web-dev']);
    });
  });

  describe('Query Helpers', () => {
    test('active() should filter active courses', async () => {
      const activeCourse = new Course({
        ...validCourseData,
        isActive: true,
        deletedAt: null
      });
      await activeCourse.save();
      
      const inactiveCourse = new Course({
        ...validCourseData,
        title: 'Inactive Course',
        slug: 'inactive-course-test',
        isActive: false
      });
      await inactiveCourse.save();
      
      const activeCourses = await Course.find().active();
      expect(activeCourses).toHaveLength(1);
      expect(activeCourses[0].title).toBe('Complete JavaScript Course');
    });
    
    test('free() should filter free courses', async () => {
      const freeCourse = new Course({
        ...validCourseData,
        pricing: {
          ...validCourseData.pricing,
          currentPrice: 0,
          isFree: true
        }
      });
      await freeCourse.save();
      
      const paidCourse = new Course({
        ...validCourseData,
        title: 'Paid Course',
        slug: 'paid-course-test',
        pricing: {
          ...validCourseData.pricing,
          isFree: false
        }
      });
      await paidCourse.save();
      
      const freeCourses = await Course.find().free();
      expect(freeCourses).toHaveLength(1);
      expect(freeCourses[0].pricing.isFree).toBe(true);
    });
    
    test('external() should filter external courses', async () => {
      const internalCourse = new Course({
        ...validCourseData,
        source: 'internal'
      });
      await internalCourse.save();
      
      const externalCourse = new Course({
        ...validCourseData,
        title: 'External Course',
        slug: 'external-course-test',
        source: 'udemy'
      });
      await externalCourse.save();
      
      const externalCourses = await Course.find().external();
      expect(externalCourses).toHaveLength(1);
      expect(externalCourses[0].source).toBe('udemy');
    });
  });
});