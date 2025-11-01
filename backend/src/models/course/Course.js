/**
 * Course Model
 * @module models/Course
 * @description Course marketplace model for both external aggregated courses and internal courses
 */

import mongoose from 'mongoose';

// Import course constants
import {
  // Enums
  COURSE_SOURCES,
  COURSE_LEVELS,
  COURSE_CATEGORIES,
  COURSE_STATUSES,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  COURSE_LANGUAGES,
  INSTRUCTOR_TYPES,
  CONTENT_TYPES,
  ACCESS_TYPES,
  RATING_SCALE,
  DISCOUNT_TYPES,
  QUIZ_RECOMMENDATION_CATEGORIES,
  COURSE_DEFAULTS,
  
  // Validation Rules
  COURSE_VALIDATION_RULES,
  INSTRUCTOR_VALIDATION_RULES,
  PRICING_VALIDATION_RULES,
  CONTENT_VALIDATION_RULES,
  MEDIA_VALIDATION_RULES,
  RATING_VALIDATION_RULES,
  ENROLLMENT_VALIDATION_RULES,
  ANALYTICS_VALIDATION_RULES,
  BUSINESS_VALIDATION_RULES,
  STUDION_VALIDATION_RULES,
  EXTERNAL_VALIDATION_RULES,
  
  // Validation Helpers
  validateCourseTitle,
  validateCourseDescription,
  validatePrice,
  validateRating,
  validateDuration,
  validateUrl,
  validateTags,
  validateLearningOutcomes,
  validateInstructorName,
  validatePointsDiscount,
  calculateDiscountPercentage,
  getCurrencySymbol
} from '#constants/models/course/index.js';

// ==========================================
// SCHEMA CONFIGURATION
// ==========================================

const SCHEMA_OPTIONS = {
  collection: 'courses',
  timestamps: true,
  versionKey: false,
  
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      
      // Hide sensitive business data from client responses
      if (ret.business && ret.business.commission) {
        delete ret.business.commission;
      }
      
      return ret;
    },
    virtuals: true
  },
  
  toObject: {
    virtuals: true
  }
};

// ==========================================
// INSTRUCTOR SUB-SCHEMA
// ==========================================

const instructorSchema = new mongoose.Schema({
  // For external courses: just store instructor info
  name: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    minlength: [INSTRUCTOR_VALIDATION_RULES.NAME.MIN_LENGTH, 'Instructor name too short'],
    maxlength: [INSTRUCTOR_VALIDATION_RULES.NAME.MAX_LENGTH, 'Instructor name too long'],
    validate: {
      validator: validateInstructorName,
      message: INSTRUCTOR_VALIDATION_RULES.NAME.ERROR_MESSAGE
    }
  },
  
  // For internal courses: reference to BaseUser
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    default: null
  },
  
  type: {
    type: String,
    enum: {
      values: INSTRUCTOR_TYPES,
      message: 'Invalid instructor type'
    },
    default: 'internal'
  },
  
  bio: {
    type: String,
    maxlength: [INSTRUCTOR_VALIDATION_RULES.BIO.MAX_LENGTH, INSTRUCTOR_VALIDATION_RULES.BIO.ERROR_MESSAGE],
    default: ''
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  rating: {
    type: Number,
    min: [INSTRUCTOR_VALIDATION_RULES.RATING.MIN, INSTRUCTOR_VALIDATION_RULES.RATING.ERROR_MESSAGE],
    max: [INSTRUCTOR_VALIDATION_RULES.RATING.MAX, INSTRUCTOR_VALIDATION_RULES.RATING.ERROR_MESSAGE],
    default: 0
  },
  
  totalStudents: {
    type: Number,
    min: [INSTRUCTOR_VALIDATION_RULES.TOTAL_STUDENTS.MIN, INSTRUCTOR_VALIDATION_RULES.TOTAL_STUDENTS.ERROR_MESSAGE],
    max: [INSTRUCTOR_VALIDATION_RULES.TOTAL_STUDENTS.MAX, INSTRUCTOR_VALIDATION_RULES.TOTAL_STUDENTS.ERROR_MESSAGE],
    default: 0
  },
  
  // External platform profile
  externalProfile: {
    url: {
      type: String,
      validate: {
        validator: function(url) {
          return !url || INSTRUCTOR_VALIDATION_RULES.EXTERNAL_PROFILE_URL.PATTERN.test(url);
        },
        message: INSTRUCTOR_VALIDATION_RULES.EXTERNAL_PROFILE_URL.ERROR_MESSAGE
      },
      default: null
    },
    verified: { type: Boolean, default: false }
  }
}, { _id: false });

// ==========================================
// PRICING SUB-SCHEMA
// ==========================================

const pricingSchema = new mongoose.Schema({
  currency: {
    type: String,
    enum: {
      values: CURRENCIES,
      message: 'Invalid currency'
    },
    default: 'USD'
  },
  
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [PRICING_VALIDATION_RULES.ORIGINAL_PRICE.MIN, PRICING_VALIDATION_RULES.ORIGINAL_PRICE.ERROR_MESSAGE],
    max: [PRICING_VALIDATION_RULES.ORIGINAL_PRICE.MAX, PRICING_VALIDATION_RULES.ORIGINAL_PRICE.ERROR_MESSAGE],
    validate: {
      validator: validatePrice,
      message: PRICING_VALIDATION_RULES.ORIGINAL_PRICE.ERROR_MESSAGE
    }
  },
  
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [PRICING_VALIDATION_RULES.CURRENT_PRICE.MIN, PRICING_VALIDATION_RULES.CURRENT_PRICE.ERROR_MESSAGE],
    max: [PRICING_VALIDATION_RULES.CURRENT_PRICE.MAX, PRICING_VALIDATION_RULES.CURRENT_PRICE.ERROR_MESSAGE],
    validate: {
      validator: validatePrice,
      message: PRICING_VALIDATION_RULES.CURRENT_PRICE.ERROR_MESSAGE
    }
  },
  
  isFree: {
    type: Boolean,
    default: false
  },
  
  // Discount info
  discount: {
    percentage: {
      type: Number,
      min: [PRICING_VALIDATION_RULES.DISCOUNT_PERCENTAGE.MIN, PRICING_VALIDATION_RULES.DISCOUNT_PERCENTAGE.ERROR_MESSAGE],
      max: [PRICING_VALIDATION_RULES.DISCOUNT_PERCENTAGE.MAX, PRICING_VALIDATION_RULES.DISCOUNT_PERCENTAGE.ERROR_MESSAGE],
      default: 0
    },
    validUntil: {
      type: Date,
      default: null
    }
  }
}, { _id: false });

// ==========================================
// CONTENT SUB-SCHEMA
// ==========================================

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: {
      values: CONTENT_TYPES,
      message: 'Invalid content type'
    },
    default: 'video'
  },
  
  duration: {
    hours: {
      type: Number,
      min: [CONTENT_VALIDATION_RULES.DURATION_HOURS.MIN, CONTENT_VALIDATION_RULES.DURATION_HOURS.ERROR_MESSAGE],
      max: [CONTENT_VALIDATION_RULES.DURATION_HOURS.MAX, CONTENT_VALIDATION_RULES.DURATION_HOURS.ERROR_MESSAGE],
      default: 0
    },
    minutes: {
      type: Number,
      min: [CONTENT_VALIDATION_RULES.DURATION_MINUTES.MIN, CONTENT_VALIDATION_RULES.DURATION_MINUTES.ERROR_MESSAGE],
      max: [CONTENT_VALIDATION_RULES.DURATION_MINUTES.MAX, CONTENT_VALIDATION_RULES.DURATION_MINUTES.ERROR_MESSAGE],
      default: 0
    }
  },
  
  totalLectures: {
    type: Number,
    min: [CONTENT_VALIDATION_RULES.TOTAL_LECTURES.MIN, CONTENT_VALIDATION_RULES.TOTAL_LECTURES.ERROR_MESSAGE],
    max: [CONTENT_VALIDATION_RULES.TOTAL_LECTURES.MAX, CONTENT_VALIDATION_RULES.TOTAL_LECTURES.ERROR_MESSAGE],
    default: 0
  },
  
  hasSubtitles: {
    type: Boolean,
    default: false
  },
  
  language: {
    type: String,
    enum: {
      values: COURSE_LANGUAGES,
      message: 'Invalid course language'
    },
    default: "en"
  },
  
  subtitleLanguages: [{
    type: String,
    enum: {
      values: COURSE_LANGUAGES,
      message: 'Invalid subtitle language'
    }
  }],
  
  // What students will learn
  learningOutcomes: [{
    type: String,
    minlength: [CONTENT_VALIDATION_RULES.LEARNING_OUTCOMES.MIN_LENGTH, CONTENT_VALIDATION_RULES.LEARNING_OUTCOMES.ERROR_MESSAGE],
    maxlength: [CONTENT_VALIDATION_RULES.LEARNING_OUTCOMES.MAX_LENGTH, CONTENT_VALIDATION_RULES.LEARNING_OUTCOMES.ERROR_MESSAGE]
  }],
  
  // Prerequisites
  requirements: [{
    type: String,
    minlength: [CONTENT_VALIDATION_RULES.REQUIREMENTS.MIN_LENGTH, CONTENT_VALIDATION_RULES.REQUIREMENTS.ERROR_MESSAGE],
    maxlength: [CONTENT_VALIDATION_RULES.REQUIREMENTS.MAX_LENGTH, CONTENT_VALIDATION_RULES.REQUIREMENTS.ERROR_MESSAGE]
  }],
  
  // Target audience
  targetAudience: [{
    type: String,
    minlength: [CONTENT_VALIDATION_RULES.TARGET_AUDIENCE.MIN_LENGTH, CONTENT_VALIDATION_RULES.TARGET_AUDIENCE.ERROR_MESSAGE],
    maxlength: [CONTENT_VALIDATION_RULES.TARGET_AUDIENCE.MAX_LENGTH, CONTENT_VALIDATION_RULES.TARGET_AUDIENCE.ERROR_MESSAGE]
  }]
}, { _id: false });

// ==========================================
// MAIN COURSE SCHEMA
// ==========================================

const courseSchema = new mongoose.Schema({
  
  // ==========================================
  // BASIC INFORMATION
  // ==========================================
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    minlength: [COURSE_VALIDATION_RULES.TITLE.MIN_LENGTH, 'Title too short'],
    maxlength: [COURSE_VALIDATION_RULES.TITLE.MAX_LENGTH, 'Title too long'],
    validate: {
      validator: validateCourseTitle,
      message: COURSE_VALIDATION_RULES.TITLE.ERROR_MESSAGE
    },
    index: 'text'
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [COURSE_VALIDATION_RULES.SLUG.MIN_LENGTH, 'Slug too short'],
    maxlength: [COURSE_VALIDATION_RULES.SLUG.MAX_LENGTH, 'Slug too long'],
    validate: {
      validator: function(slug) {
        return COURSE_VALIDATION_RULES.SLUG.PATTERN.test(slug);
      },
      message: COURSE_VALIDATION_RULES.SLUG.ERROR_MESSAGE
    },
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Course description is required'],
    minlength: [COURSE_VALIDATION_RULES.DESCRIPTION.MIN_LENGTH, 'Description too short'],
    maxlength: [COURSE_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH, 'Description too long'],
    validate: {
      validator: validateCourseDescription,
      message: COURSE_VALIDATION_RULES.DESCRIPTION.ERROR_MESSAGE
    },
    index: 'text'
  },
  
  shortDescription: {
    type: String,
    maxlength: [COURSE_VALIDATION_RULES.SHORT_DESCRIPTION.MAX_LENGTH, COURSE_VALIDATION_RULES.SHORT_DESCRIPTION.ERROR_MESSAGE],
    default: ''
  },
  
  // ==========================================
  // CATEGORIZATION
  // ==========================================
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: {
      values: COURSE_CATEGORIES,
      message: 'Invalid course category'
    },
    index: true
  },
  
  subcategory: {
    type: String,
    maxlength: [COURSE_VALIDATION_RULES.SUBCATEGORY.MAX_LENGTH, COURSE_VALIDATION_RULES.SUBCATEGORY.ERROR_MESSAGE],
    validate: {
      validator: function(subcategory) {
        return !subcategory || COURSE_VALIDATION_RULES.SUBCATEGORY.PATTERN.test(subcategory);
      },
      message: COURSE_VALIDATION_RULES.SUBCATEGORY.ERROR_MESSAGE
    },
    default: null
  },
  
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: {
      values: COURSE_LEVELS,
      message: 'Invalid course level'
    },
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    minlength: [COURSE_VALIDATION_RULES.TAGS.MIN_TAG_LENGTH, 'Tag too short'],
    maxlength: [COURSE_VALIDATION_RULES.TAGS.MAX_TAG_LENGTH, 'Tag too long'],
    validate: {
      validator: function(tag) {
        return COURSE_VALIDATION_RULES.TAGS.PATTERN.test(tag);
      },
      message: COURSE_VALIDATION_RULES.TAGS.ERROR_MESSAGE
    }
  }],
  
  // ==========================================
  // INSTRUCTOR & SOURCE
  // ==========================================
  instructor: {
    type: instructorSchema,
    required: [true, 'Instructor information is required']
  },
  
  source: {
    type: String,
    required: [true, 'Course source is required'],
    enum: {
      values: COURSE_SOURCES,
      message: 'Invalid course source'
    },
    index: true
  },
  
  // External course data
  external: {
    platformUrl: {
      type: String,
      validate: {
        validator: function(url) {
          return !url || validateUrl(url);
        },
        message: EXTERNAL_VALIDATION_RULES.PLATFORM_URL.ERROR_MESSAGE
      },
      default: null
    },
    
    platformCourseId: {
      type: String,
      minlength: [EXTERNAL_VALIDATION_RULES.PLATFORM_COURSE_ID.MIN_LENGTH, 'Platform course ID too short'],
      maxlength: [EXTERNAL_VALIDATION_RULES.PLATFORM_COURSE_ID.MAX_LENGTH, 'Platform course ID too long'],
      validate: {
        validator: function(id) {
          return !id || EXTERNAL_VALIDATION_RULES.PLATFORM_COURSE_ID.PATTERN.test(id);
        },
        message: EXTERNAL_VALIDATION_RULES.PLATFORM_COURSE_ID.ERROR_MESSAGE
      },
      default: null,
      index: true
    },
    
    lastSynced: {
      type: Date,
      default: null
    },
    
    affiliateUrl: {
      type: String,
      validate: {
        validator: function(url) {
          return !url || validateUrl(url);
        },
        message: EXTERNAL_VALIDATION_RULES.AFFILIATE_URL.ERROR_MESSAGE
      },
      default: null
    }
  },
  
  // ==========================================
  // PRICING & BUSINESS
  // ==========================================
  pricing: {
    type: pricingSchema,
    required: [true, 'Pricing information is required']
  },
  
  business: {
    commission: {
      percentage: {
        type: Number,
        min: [PRICING_VALIDATION_RULES.COMMISSION_PERCENTAGE.MIN, PRICING_VALIDATION_RULES.COMMISSION_PERCENTAGE.ERROR_MESSAGE],
        max: [PRICING_VALIDATION_RULES.COMMISSION_PERCENTAGE.MAX, PRICING_VALIDATION_RULES.COMMISSION_PERCENTAGE.ERROR_MESSAGE],
        default: 0
      },
      amount: {
        type: Number,
        min: [PRICING_VALIDATION_RULES.COMMISSION_AMOUNT.MIN, PRICING_VALIDATION_RULES.COMMISSION_AMOUNT.ERROR_MESSAGE],
        max: [PRICING_VALIDATION_RULES.COMMISSION_AMOUNT.MAX, PRICING_VALIDATION_RULES.COMMISSION_AMOUNT.ERROR_MESSAGE],
        default: 0
      }
    },
    
    totalSales: {
      type: Number,
      min: [BUSINESS_VALIDATION_RULES.TOTAL_SALES.MIN, BUSINESS_VALIDATION_RULES.TOTAL_SALES.ERROR_MESSAGE],
      max: [BUSINESS_VALIDATION_RULES.TOTAL_SALES.MAX, BUSINESS_VALIDATION_RULES.TOTAL_SALES.ERROR_MESSAGE],
      default: 0
    },
    
    revenue: {
      type: Number,
      min: [BUSINESS_VALIDATION_RULES.REVENUE.MIN, BUSINESS_VALIDATION_RULES.REVENUE.ERROR_MESSAGE],
      max: [BUSINESS_VALIDATION_RULES.REVENUE.MAX, BUSINESS_VALIDATION_RULES.REVENUE.ERROR_MESSAGE],
      default: 0
    }
  },
  
  // ==========================================
  // CONTENT & MEDIA
  // ==========================================
  content: {
    type: contentSchema,
    required: [true, 'Content information is required']
  },
  
  media: {
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required']
    },
    
    previewVideo: {
      type: String,
      default: null
    },
    
    images: [{
      url: String,
      alt: String,
      type: { 
        type: String, 
        enum: ['thumbnail', 'preview', 'screenshot', 'banner'] 
      }
    }]
  },
  
  // ==========================================
  // RATINGS & REVIEWS
  // ==========================================
  rating: {
    average: {
      type: Number,
      min: [RATING_VALIDATION_RULES.AVERAGE.MIN, RATING_VALIDATION_RULES.AVERAGE.ERROR_MESSAGE],
      max: [RATING_VALIDATION_RULES.AVERAGE.MAX, RATING_VALIDATION_RULES.AVERAGE.ERROR_MESSAGE],
      default: 0
    },
    
    count: {
      type: Number,
      min: [RATING_VALIDATION_RULES.COUNT.MIN, RATING_VALIDATION_RULES.COUNT.ERROR_MESSAGE],
      max: [RATING_VALIDATION_RULES.COUNT.MAX, RATING_VALIDATION_RULES.COUNT.ERROR_MESSAGE],
      default: 0
    },
    
    distribution: {
      5: { 
        type: Number, 
        min: [RATING_VALIDATION_RULES.DISTRIBUTION.MIN_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        max: [RATING_VALIDATION_RULES.DISTRIBUTION.MAX_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        default: 0 
      },
      4: { 
        type: Number, 
        min: [RATING_VALIDATION_RULES.DISTRIBUTION.MIN_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        max: [RATING_VALIDATION_RULES.DISTRIBUTION.MAX_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        default: 0 
      },
      3: { 
        type: Number, 
        min: [RATING_VALIDATION_RULES.DISTRIBUTION.MIN_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        max: [RATING_VALIDATION_RULES.DISTRIBUTION.MAX_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        default: 0 
      },
      2: { 
        type: Number, 
        min: [RATING_VALIDATION_RULES.DISTRIBUTION.MIN_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        max: [RATING_VALIDATION_RULES.DISTRIBUTION.MAX_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        default: 0 
      },
      1: { 
        type: Number, 
        min: [RATING_VALIDATION_RULES.DISTRIBUTION.MIN_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        max: [RATING_VALIDATION_RULES.DISTRIBUTION.MAX_VALUE, RATING_VALIDATION_RULES.DISTRIBUTION.ERROR_MESSAGE],
        default: 0 
      }
    }
  },
  
  // ==========================================
  // ENROLLMENT & ANALYTICS
  // ==========================================
  enrollment: {
    totalStudents: {
      type: Number,
      min: [ENROLLMENT_VALIDATION_RULES.TOTAL_STUDENTS.MIN, ENROLLMENT_VALIDATION_RULES.TOTAL_STUDENTS.ERROR_MESSAGE],
      max: [ENROLLMENT_VALIDATION_RULES.TOTAL_STUDENTS.MAX, ENROLLMENT_VALIDATION_RULES.TOTAL_STUDENTS.ERROR_MESSAGE],
      default: 0
    },
    
    activeStudents: {
      type: Number,
      min: [ENROLLMENT_VALIDATION_RULES.ACTIVE_STUDENTS.MIN, ENROLLMENT_VALIDATION_RULES.ACTIVE_STUDENTS.ERROR_MESSAGE],
      max: [ENROLLMENT_VALIDATION_RULES.ACTIVE_STUDENTS.MAX, ENROLLMENT_VALIDATION_RULES.ACTIVE_STUDENTS.ERROR_MESSAGE],
      default: 0
    },
    
    completionRate: {
      type: Number,
      min: [ENROLLMENT_VALIDATION_RULES.COMPLETION_RATE.MIN, ENROLLMENT_VALIDATION_RULES.COMPLETION_RATE.ERROR_MESSAGE],
      max: [ENROLLMENT_VALIDATION_RULES.COMPLETION_RATE.MAX, ENROLLMENT_VALIDATION_RULES.COMPLETION_RATE.ERROR_MESSAGE],
      default: 0
    }
  },
  
  analytics: {
    views: {
      type: Number,
      min: [ANALYTICS_VALIDATION_RULES.VIEWS.MIN, ANALYTICS_VALIDATION_RULES.VIEWS.ERROR_MESSAGE],
      max: [ANALYTICS_VALIDATION_RULES.VIEWS.MAX, ANALYTICS_VALIDATION_RULES.VIEWS.ERROR_MESSAGE],
      default: 0
    },
    
    clicks: {
      type: Number,
      min: [ANALYTICS_VALIDATION_RULES.CLICKS.MIN, ANALYTICS_VALIDATION_RULES.CLICKS.ERROR_MESSAGE],
      max: [ANALYTICS_VALIDATION_RULES.CLICKS.MAX, ANALYTICS_VALIDATION_RULES.CLICKS.ERROR_MESSAGE],
      default: 0
    },
    
    conversions: {
      type: Number,
      min: [ANALYTICS_VALIDATION_RULES.CONVERSIONS.MIN, ANALYTICS_VALIDATION_RULES.CONVERSIONS.ERROR_MESSAGE],
      max: [ANALYTICS_VALIDATION_RULES.CONVERSIONS.MAX, ANALYTICS_VALIDATION_RULES.CONVERSIONS.ERROR_MESSAGE],
      default: 0
    },
    
    lastViewedAt: {
      type: Date,
      default: null
    }
  },
  
  // ==========================================
  // STATUS & AVAILABILITY
  // ==========================================
  status: {
    type: String,
    enum: {
      values: COURSE_STATUSES,
      message: 'Invalid course status'
    },
    default: 'draft',
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  accessType: {
    type: String,
    enum: {
      values: ACCESS_TYPES,
      message: 'Invalid access type'
    },
    default: "lifetime"
  },
  
  // ==========================================
  // STUDION INTEGRATION
  // ==========================================
  studion: {
    // Courses recommended based on quiz performance
    recommendedForQuizzes: [{
      quizCategory: {
        type: String,
        enum: {
          values: QUIZ_RECOMMENDATION_CATEGORIES,
          message: 'Invalid quiz category'
        }
      },
      difficulty: String,
      scoreRange: {
        min: {
          type: Number,
          min: [STUDION_VALIDATION_RULES.QUIZ_SCORE.MIN, STUDION_VALIDATION_RULES.QUIZ_SCORE.ERROR_MESSAGE],
          max: [STUDION_VALIDATION_RULES.QUIZ_SCORE.MAX, STUDION_VALIDATION_RULES.QUIZ_SCORE.ERROR_MESSAGE]
        },
        max: {
          type: Number,
          min: [STUDION_VALIDATION_RULES.QUIZ_SCORE.MIN, STUDION_VALIDATION_RULES.QUIZ_SCORE.ERROR_MESSAGE],
          max: [STUDION_VALIDATION_RULES.QUIZ_SCORE.MAX, STUDION_VALIDATION_RULES.QUIZ_SCORE.ERROR_MESSAGE]
        }
      }
    }],
    
    // Points discount eligibility
    pointsDiscount: {
      enabled: {
        type: Boolean,
        default: true
      },
      
      maxPointsUsable: {
        type: Number,
        min: [STUDION_VALIDATION_RULES.MAX_POINTS_USABLE.MIN, STUDION_VALIDATION_RULES.MAX_POINTS_USABLE.ERROR_MESSAGE],
        max: [STUDION_VALIDATION_RULES.MAX_POINTS_USABLE.MAX, STUDION_VALIDATION_RULES.MAX_POINTS_USABLE.ERROR_MESSAGE],
        default: 1000
      },
      
      pointsToDiscountRatio: {
        type: Number,
        min: [STUDION_VALIDATION_RULES.POINTS_TO_DISCOUNT_RATIO.MIN, STUDION_VALIDATION_RULES.POINTS_TO_DISCOUNT_RATIO.ERROR_MESSAGE],
        max: [STUDION_VALIDATION_RULES.POINTS_TO_DISCOUNT_RATIO.MAX, STUDION_VALIDATION_RULES.POINTS_TO_DISCOUNT_RATIO.ERROR_MESSAGE],
        default: 0.01
      }
    }
  },
  
  // ==========================================
  // SOFT DELETE
  // ==========================================
  deletedAt: {
    type: Date,
    default: null,
    index: true
  }
  
}, SCHEMA_OPTIONS);

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

// Core search and filter indexes
courseSchema.index({ category: 1, level: 1, isActive: 1 });
courseSchema.index({ 'pricing.currentPrice': 1, isActive: 1 });
courseSchema.index({ 'rating.average': -1, 'enrollment.totalStudents': -1 });
courseSchema.index({ isFeatured: 1, isActive: 1, createdAt: -1 });
courseSchema.index({ source: 1, 'external.platformCourseId': 1 });

// Text search index
courseSchema.index({
  title: 'text',
  description: 'text',
  'instructor.name': 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    'instructor.name': 5,
    tags: 3,
    description: 1
  }
});

// Analytics indexes
courseSchema.index({ 'analytics.views': -1 });
courseSchema.index({ 'analytics.conversions': -1 });
courseSchema.index({ createdAt: -1 });

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

courseSchema.pre('validate', function(next) {
  // Validate tags array length
  if (this.tags && this.tags.length > COURSE_VALIDATION_RULES.TAGS.MAX_COUNT) {
    return next(new Error(`Cannot have more than ${COURSE_VALIDATION_RULES.TAGS.MAX_COUNT} tags`));
  }
  
  // Validate learning outcomes count
  if (this.content && this.content.learningOutcomes && this.content.learningOutcomes.length > CONTENT_VALIDATION_RULES.LEARNING_OUTCOMES.MAX_COUNT) {
    return next(new Error(`Cannot have more than ${CONTENT_VALIDATION_RULES.LEARNING_OUTCOMES.MAX_COUNT} learning outcomes`));
  }
  
  // Validate requirements count
  if (this.content && this.content.requirements && this.content.requirements.length > CONTENT_VALIDATION_RULES.REQUIREMENTS.MAX_COUNT) {
    return next(new Error(`Cannot have more than ${CONTENT_VALIDATION_RULES.REQUIREMENTS.MAX_COUNT} requirements`));
  }
  
  // Validate target audience count
  if (this.content && this.content.targetAudience && this.content.targetAudience.length > CONTENT_VALIDATION_RULES.TARGET_AUDIENCE.MAX_COUNT) {
    return next(new Error(`Cannot have more than ${CONTENT_VALIDATION_RULES.TARGET_AUDIENCE.MAX_COUNT} target audience items`));
  }
  
  // Validate duration
  if (this.content && !validateDuration(this.content.duration.hours, this.content.duration.minutes)) {
    return next(new Error('Invalid duration'));
  }
  
  // Validate points discount configuration
  if (this.studion && this.studion.pointsDiscount && !validatePointsDiscount(this.studion.pointsDiscount.maxPointsUsable, this.studion.pointsDiscount.pointsToDiscountRatio)) {
    return next(new Error('Invalid points discount configuration'));
  }
  
  next();
});

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

courseSchema.pre('save', function(next) {
  try {
    // Generate slug if not exists
    if (this.isModified('title') && !this.slug) {
      this.slug = this.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '-')  // Replace special chars with hyphens
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens
        .substring(0, 100);
    }
    
    // Calculate discount percentage
    if (this.pricing && this.pricing.originalPrice > 0) {
      this.pricing.discount.percentage = calculateDiscountPercentage(
        this.pricing.originalPrice, 
        this.pricing.currentPrice
      );
    }
    
    // Set isFree flag
    if (this.pricing && this.pricing.currentPrice === 0) {
      this.pricing.isFree = true;
    }
    
    // Clean up tags (remove duplicates, empty strings)
    if (this.tags) {
      this.tags = [...new Set(
        this.tags
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0)
      )];
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

/**
 * Get formatted price with currency symbol
 */
courseSchema.virtual('formattedPrice').get(function() {
  if (this.pricing.isFree) return 'Free';
  
  const symbol = getCurrencySymbol(this.pricing.currency);
  return `${symbol}${this.pricing.currentPrice.toFixed(2)}`;
});

/**
 * Get total duration in minutes
 */
courseSchema.virtual('totalDurationMinutes').get(function() {
  return (this.content.duration.hours * 60) + this.content.duration.minutes;
});

/**
 * Get formatted duration
 */
courseSchema.virtual('formattedDuration').get(function() {
  const hours = this.content.duration.hours;
  const minutes = this.content.duration.minutes;
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
});

/**
 * Check if course has discount
 */
courseSchema.virtual('hasDiscount').get(function() {
  return this.pricing.discount.percentage > 0;
});

/**
 * Check if course is external
 */
courseSchema.virtual('isExternal').get(function() {
  return this.source !== 'internal';
});

/**
 * Get purchase URL (internal or external)
 */
courseSchema.virtual('purchaseUrl').get(function() {
  if (this.isExternal && this.external.affiliateUrl) {
    return this.external.affiliateUrl;
  }
  return `/courses/${this.slug}/purchase`;
});

/**
 * Get course availability status
 */
courseSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.isActive && !this.deletedAt;
});

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Update course rating
 */
courseSchema.methods.updateRating = function(newRating, oldRating = null) {
  const distribution = this.rating.distribution;
  
  // Remove old rating
  if (oldRating && validateRating(oldRating)) {
    distribution[oldRating]--;
    this.rating.count--;
  }
  
  // Add new rating
  if (validateRating(newRating)) {
    distribution[newRating]++;
    this.rating.count++;
    
    // Calculate new average
    const total = (distribution[5] * 5) + (distribution[4] * 4) + 
                  (distribution[3] * 3) + (distribution[2] * 2) + 
                  (distribution[1] * 1);
    
    this.rating.average = this.rating.count > 0 ? (total / this.rating.count) : 0;
  }
  
  return this.save();
};

/**
 * Increment view count
 */
courseSchema.methods.recordView = function() {
  return this.updateOne({
    $inc: { 'analytics.views': 1 },
    $set: { 'analytics.lastViewedAt': new Date() }
  });
};

/**
 * Record click
 */
courseSchema.methods.recordClick = function() {
  return this.updateOne({
    $inc: { 'analytics.clicks': 1 }
  });
};

/**
 * Record conversion (purchase)
 */
courseSchema.methods.recordConversion = function(amount = null) {
  const updateData = {
    $inc: { 
      'analytics.conversions': 1,
      'enrollment.totalStudents': 1,
      'business.totalSales': 1
    }
  };
  
  if (amount && typeof amount === 'number') {
    updateData.$inc['business.revenue'] = amount;
  }
  
  return this.updateOne(updateData);
};

/**
 * Check if user can use points discount
 */
courseSchema.methods.canUsePointsDiscount = function(userPoints) {
  return this.studion.pointsDiscount.enabled && 
         userPoints > 0 && 
         this.pricing.currentPrice > 0 &&
         !this.pricing.isFree;
};

/**
 * Calculate points discount amount
 */
courseSchema.methods.calculatePointsDiscount = function(pointsToUse) {
  if (!this.canUsePointsDiscount(pointsToUse)) return 0;
  
  const maxPoints = Math.min(pointsToUse, this.studion.pointsDiscount.maxPointsUsable);
  const discountAmount = maxPoints * this.studion.pointsDiscount.pointsToDiscountRatio;
  
  return Math.min(discountAmount, this.pricing.currentPrice);
};

/**
 * Get final price after points discount
 */
courseSchema.methods.getFinalPrice = function(pointsToUse = 0) {
  const discount = this.calculatePointsDiscount(pointsToUse);
  return Math.max(0, this.pricing.currentPrice - discount);
};

/**
 * Soft delete course
 */
courseSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

/**
 * Restore soft deleted course
 */
courseSchema.methods.restore = function() {
  this.deletedAt = null;
  this.isActive = true;
  return this.save();
};

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Find courses with filters
 */
courseSchema.statics.findWithFilters = function(filters = {}) {
  const {
    category,
    level,
    priceRange,
    rating,
    source,
    isFree,
    isExternal,
    limit = 20,
    skip = 0,
    sort = { 'rating.average': -1, 'enrollment.totalStudents': -1 }
  } = filters;
  
  const query = { isActive: true, deletedAt: null };
  
  if (category) query.category = category;
  if (level) query.level = level;
  if (source) query.source = source;
  if (isFree !== undefined) query['pricing.isFree'] = isFree;
  if (rating) query['rating.average'] = { $gte: rating };
  if (isExternal !== undefined) {
    query.source = isExternal ? { $ne: 'internal' } : 'internal';
  }
  
  if (priceRange) {
    query['pricing.currentPrice'] = {
      $gte: priceRange.min || 0,
      $lte: priceRange.max || 10000
    };
  }
  
  return this.find(query)
    .limit(limit)
    .skip(skip)
    .sort(sort);
};

/**
 * Search courses by text
 */
courseSchema.statics.searchByText = function(searchTerm, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    isActive: true,
    deletedAt: null,
    $text: { $search: searchTerm }
  }, {
    score: { $meta: 'textScore' }
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit)
  .skip(skip);
};

/**
 * Get featured courses
 */
courseSchema.statics.getFeatured = function(limit = 10) {
  return this.find({
    isFeatured: true,
    isActive: true,
    deletedAt: null
  })
  .sort({ 'rating.average': -1, 'enrollment.totalStudents': -1 })
  .limit(limit);
};

/**
 * Get courses recommended for quiz performance
 */
courseSchema.statics.getRecommendedForQuiz = function(quizCategory, difficulty, userScore, limit = 5) {
  return this.find({
    isActive: true,
    deletedAt: null,
    'studion.recommendedForQuizzes': {
      $elemMatch: {
        quizCategory,
        difficulty,
        'scoreRange.min': { $lte: userScore },
        'scoreRange.max': { $gte: userScore }
      }
    }
  })
  .sort({ 'rating.average': -1, 'enrollment.totalStudents': -1 })
  .limit(limit);
};

/**
 * Get course statistics
 */
courseSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { isActive: true, deletedAt: null } },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        totalStudents: { $sum: '$enrollment.totalStudents' },
        averageRating: { $avg: '$rating.average' },
        totalRevenue: { $sum: '$business.revenue' },
        categoriesCount: { $addToSet: '$category' },
        avgPrice: { $avg: '$pricing.currentPrice' },
        freeCourses: { $sum: { $cond: ['$pricing.isFree', 1, 0] } }
      }
    }
  ]);
};

// ==========================================
// QUERY HELPERS
// ==========================================

courseSchema.query.active = function() {
  return this.where({ isActive: true, deletedAt: null });
};

courseSchema.query.featured = function() {
  return this.where({ isFeatured: true });
};

courseSchema.query.byCategory = function(category) {
  return this.where({ category });
};

courseSchema.query.byLevel = function(level) {
  return this.where({ level });
};

courseSchema.query.free = function() {
  return this.where({ 'pricing.isFree': true });
};

courseSchema.query.paid = function() {
  return this.where({ 'pricing.isFree': false });
};

courseSchema.query.external = function() {
  return this.where({ source: { $ne: 'internal' } });
};

courseSchema.query.internal = function() {
  return this.where({ source: 'internal' });
};

courseSchema.query.withPointsDiscount = function() {
  return this.where({ 'studion.pointsDiscount.enabled': true });
};

// ==========================================
// EXPORT MODEL
// ==========================================

const Course = mongoose.model('Course', courseSchema);

export default Course;
export { courseSchema };