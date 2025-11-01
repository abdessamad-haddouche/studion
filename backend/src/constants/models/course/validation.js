/**
 * Course Model Validation Constants
 * @module constants/models/course/validation
 * @description Validation rules and patterns for course model
 */

// ==========================================
// COURSE VALIDATION RULES
// ==========================================

/**
 * Course basic information validation rules
 */
export const COURSE_VALIDATION_RULES = Object.freeze({
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200,
    PATTERN: /^[a-zA-Z0-9\s\-_.,()[\]!?:;&'"]+$/,
    ERROR_MESSAGE: 'Title can only contain letters, numbers, spaces, and common punctuation'
  },

  SLUG: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-z0-9-]+$/,
    ERROR_MESSAGE: 'Slug can only contain lowercase letters, numbers, and hyphens'
  },

  DESCRIPTION: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 5000,
    ERROR_MESSAGE: 'Description must be between 50 and 5,000 characters'
  },

  SHORT_DESCRIPTION: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 300,
    ERROR_MESSAGE: 'Short description cannot exceed 300 characters'
  },

  SUBCATEGORY: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    ERROR_MESSAGE: 'Subcategory can only contain letters, numbers, spaces, hyphens, and underscores'
  },

  TAGS: {
    MAX_COUNT: 20,
    MAX_TAG_LENGTH: 30,
    MIN_TAG_LENGTH: 2,
    PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    ERROR_MESSAGE: 'Tags can only contain letters, numbers, spaces, hyphens, and underscores'
  }
});

// ==========================================
// INSTRUCTOR VALIDATION RULES
// ==========================================

/**
 * Instructor information validation rules
 */
export const INSTRUCTOR_VALIDATION_RULES = Object.freeze({
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s\-',.]+$/,
    ERROR_MESSAGE: 'Instructor name can only contain letters, spaces, hyphens, apostrophes, commas, and periods'
  },

  BIO: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 1000,
    ERROR_MESSAGE: 'Instructor bio cannot exceed 1,000 characters'
  },

  RATING: {
    MIN: 0,
    MAX: 5,
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Instructor rating must be between 0 and 5'
  },

  TOTAL_STUDENTS: {
    MIN: 0,
    MAX: 10000000, // 10 million
    ERROR_MESSAGE: 'Total students count cannot be negative or exceed 10 million'
  },

  EXTERNAL_PROFILE_URL: {
    PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    ERROR_MESSAGE: 'Invalid external profile URL format'
  }
});

// ==========================================
// PRICING VALIDATION RULES
// ==========================================

/**
 * Course pricing validation rules
 */
export const PRICING_VALIDATION_RULES = Object.freeze({
  ORIGINAL_PRICE: {
    MIN: 0,
    MAX: 10000, // $10,000
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Original price must be between 0 and 10,000'
  },

  CURRENT_PRICE: {
    MIN: 0,
    MAX: 10000, // $10,000
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Current price must be between 0 and 10,000'
  },

  DISCOUNT_PERCENTAGE: {
    MIN: 0,
    MAX: 100,
    DECIMAL_PLACES: 0,
    ERROR_MESSAGE: 'Discount percentage must be between 0 and 100'
  },

  COMMISSION_PERCENTAGE: {
    MIN: 0,
    MAX: 100,
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Commission percentage must be between 0 and 100'
  },

  COMMISSION_AMOUNT: {
    MIN: 0,
    MAX: 1000, // $1,000
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Commission amount must be between 0 and 1,000'
  }
});

// ==========================================
// CONTENT VALIDATION RULES
// ==========================================

/**
 * Course content validation rules
 */
export const CONTENT_VALIDATION_RULES = Object.freeze({
  DURATION_HOURS: {
    MIN: 0,
    MAX: 1000, // 1,000 hours max
    ERROR_MESSAGE: 'Duration hours must be between 0 and 1,000'
  },

  DURATION_MINUTES: {
    MIN: 0,
    MAX: 59,
    ERROR_MESSAGE: 'Duration minutes must be between 0 and 59'
  },

  TOTAL_LECTURES: {
    MIN: 0,
    MAX: 10000, // 10,000 lectures max
    ERROR_MESSAGE: 'Total lectures must be between 0 and 10,000'
  },

  LEARNING_OUTCOMES: {
    MAX_COUNT: 20,
    MAX_LENGTH: 200,
    MIN_LENGTH: 10,
    ERROR_MESSAGE: 'Learning outcomes must be between 10 and 200 characters'
  },

  REQUIREMENTS: {
    MAX_COUNT: 15,
    MAX_LENGTH: 200,
    MIN_LENGTH: 5,
    ERROR_MESSAGE: 'Requirements must be between 5 and 200 characters'
  },

  TARGET_AUDIENCE: {
    MAX_COUNT: 10,
    MAX_LENGTH: 200,
    MIN_LENGTH: 10,
    ERROR_MESSAGE: 'Target audience descriptions must be between 10 and 200 characters'
  }
});

// ==========================================
// MEDIA VALIDATION RULES
// ==========================================

/**
 * Course media validation rules
 */
export const MEDIA_VALIDATION_RULES = Object.freeze({
  THUMBNAIL: {
    REQUIRED: true,
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    MIN_WIDTH: 400,
    MIN_HEIGHT: 300,
    RECOMMENDED_RATIO: 16/9,
    ERROR_MESSAGE: 'Thumbnail must be JPG, PNG, or WebP format, max 5MB, min 400x300px'
  },

  PREVIEW_VIDEO: {
    ALLOWED_FORMATS: ['mp4', 'webm', 'mov'],
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_DURATION: 300, // 5 minutes
    ERROR_MESSAGE: 'Preview video must be MP4, WebM, or MOV format, max 100MB, max 5 minutes'
  },

  IMAGES: {
    MAX_COUNT: 10,
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB per image
    ERROR_MESSAGE: 'Images must be JPG, PNG, or WebP format, max 5MB each, max 10 images'
  }
});

// ==========================================
// RATING VALIDATION RULES
// ==========================================

/**
 * Course rating validation rules
 */
export const RATING_VALIDATION_RULES = Object.freeze({
  AVERAGE: {
    MIN: 0,
    MAX: 5,
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Rating average must be between 0 and 5'
  },

  COUNT: {
    MIN: 0,
    MAX: 1000000, // 1 million reviews max
    ERROR_MESSAGE: 'Rating count cannot be negative or exceed 1 million'
  },

  DISTRIBUTION: {
    MIN_VALUE: 0,
    MAX_VALUE: 1000000, // 1 million per rating level
    ERROR_MESSAGE: 'Rating distribution values cannot be negative or exceed 1 million'
  }
});

// ==========================================
// ENROLLMENT VALIDATION RULES
// ==========================================

/**
 * Course enrollment validation rules
 */
export const ENROLLMENT_VALIDATION_RULES = Object.freeze({
  TOTAL_STUDENTS: {
    MIN: 0,
    MAX: 10000000, // 10 million
    ERROR_MESSAGE: 'Total students cannot be negative or exceed 10 million'
  },

  ACTIVE_STUDENTS: {
    MIN: 0,
    MAX: 10000000, // 10 million
    ERROR_MESSAGE: 'Active students cannot be negative or exceed 10 million'
  },

  COMPLETION_RATE: {
    MIN: 0,
    MAX: 100,
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Completion rate must be between 0 and 100'
  }
});

// ==========================================
// ANALYTICS VALIDATION RULES
// ==========================================

/**
 * Course analytics validation rules
 */
export const ANALYTICS_VALIDATION_RULES = Object.freeze({
  VIEWS: {
    MIN: 0,
    MAX: 1000000000, // 1 billion views
    ERROR_MESSAGE: 'Views count cannot be negative or exceed 1 billion'
  },

  CLICKS: {
    MIN: 0,
    MAX: 1000000000, // 1 billion clicks
    ERROR_MESSAGE: 'Clicks count cannot be negative or exceed 1 billion'
  },

  CONVERSIONS: {
    MIN: 0,
    MAX: 10000000, // 10 million conversions
    ERROR_MESSAGE: 'Conversions count cannot be negative or exceed 10 million'
  }
});

// ==========================================
// BUSINESS VALIDATION RULES
// ==========================================

/**
 * Course business metrics validation rules
 */
export const BUSINESS_VALIDATION_RULES = Object.freeze({
  TOTAL_SALES: {
    MIN: 0,
    MAX: 10000000, // 10 million sales
    ERROR_MESSAGE: 'Total sales cannot be negative or exceed 10 million'
  },

  REVENUE: {
    MIN: 0,
    MAX: 100000000, // $100 million
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Revenue cannot be negative or exceed $100 million'
  }
});

// ==========================================
// STUDION INTEGRATION VALIDATION RULES
// ==========================================

/**
 * Studion-specific validation rules
 */
export const STUDION_VALIDATION_RULES = Object.freeze({
  MAX_POINTS_USABLE: {
    MIN: 0,
    MAX: 100000, // 100,000 points
    ERROR_MESSAGE: 'Max points usable must be between 0 and 100,000'
  },

  POINTS_TO_DISCOUNT_RATIO: {
    MIN: 0,
    MAX: 1,
    DECIMAL_PLACES: 4,
    ERROR_MESSAGE: 'Points to discount ratio must be between 0 and 1'
  },

  QUIZ_SCORE: {
    MIN: 0,
    MAX: 100,
    DECIMAL_PLACES: 2,
    ERROR_MESSAGE: 'Quiz score must be between 0 and 100'
  }
});

// ==========================================
// EXTERNAL PLATFORM VALIDATION RULES
// ==========================================

/**
 * External platform integration validation rules
 */
export const EXTERNAL_VALIDATION_RULES = Object.freeze({
  PLATFORM_URL: {
    PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    MAX_LENGTH: 2000,
    ERROR_MESSAGE: 'Invalid platform URL format or too long'
  },

  PLATFORM_COURSE_ID: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\-_]+$/,
    ERROR_MESSAGE: 'Platform course ID can only contain letters, numbers, hyphens, and underscores'
  },

  AFFILIATE_URL: {
    PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    MAX_LENGTH: 2000,
    ERROR_MESSAGE: 'Invalid affiliate URL format or too long'
  }
});

// ==========================================
// COMPREHENSIVE VALIDATION HELPERS
// ==========================================

/**
 * Validate course title
 */
export const validateCourseTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return false;
  }
  
  const rules = COURSE_VALIDATION_RULES.TITLE;
  return title.length >= rules.MIN_LENGTH && 
         title.length <= rules.MAX_LENGTH && 
         rules.PATTERN.test(title);
};

/**
 * Validate course description
 */
export const validateCourseDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return false;
  }
  
  const rules = COURSE_VALIDATION_RULES.DESCRIPTION;
  return description.length >= rules.MIN_LENGTH && 
         description.length <= rules.MAX_LENGTH;
};

/**
 * Validate price
 */
export const validatePrice = (price) => {
  if (typeof price !== 'number' || price < 0) {
    return false;
  }
  
  const rules = PRICING_VALIDATION_RULES.ORIGINAL_PRICE;
  return price >= rules.MIN && price <= rules.MAX;
};

/**
 * Validate rating
 */
export const validateRating = (rating) => {
  if (typeof rating !== 'number') {
    return false;
  }
  
  const rules = RATING_VALIDATION_RULES.AVERAGE;
  return rating >= rules.MIN && rating <= rules.MAX;
};

/**
 * Validate duration
 */
export const validateDuration = (hours, minutes) => {
  const hourRules = CONTENT_VALIDATION_RULES.DURATION_HOURS;
  const minuteRules = CONTENT_VALIDATION_RULES.DURATION_MINUTES;
  
  return (typeof hours === 'number' && hours >= hourRules.MIN && hours <= hourRules.MAX) &&
         (typeof minutes === 'number' && minutes >= minuteRules.MIN && minutes <= minuteRules.MAX);
};

/**
 * Validate URL format
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return EXTERNAL_VALIDATION_RULES.PLATFORM_URL.PATTERN.test(url);
};

/**
 * Validate tags array
 */
export const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    return false;
  }
  
  const rules = COURSE_VALIDATION_RULES.TAGS;
  
  if (tags.length > rules.MAX_COUNT) {
    return false;
  }
  
  return tags.every(tag => {
    if (typeof tag !== 'string') return false;
    if (tag.length < rules.MIN_TAG_LENGTH) return false;
    if (tag.length > rules.MAX_TAG_LENGTH) return false;
    return rules.PATTERN.test(tag);
  });
};

/**
 * Validate learning outcomes array
 */
export const validateLearningOutcomes = (outcomes) => {
  if (!Array.isArray(outcomes)) {
    return false;
  }
  
  const rules = CONTENT_VALIDATION_RULES.LEARNING_OUTCOMES;
  
  if (outcomes.length > rules.MAX_COUNT) {
    return false;
  }
  
  return outcomes.every(outcome => {
    if (typeof outcome !== 'string') return false;
    return outcome.length >= rules.MIN_LENGTH && outcome.length <= rules.MAX_LENGTH;
  });
};

/**
 * Validate instructor name
 */
export const validateInstructorName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const rules = INSTRUCTOR_VALIDATION_RULES.NAME;
  return name.length >= rules.MIN_LENGTH && 
         name.length <= rules.MAX_LENGTH && 
         rules.PATTERN.test(name);
};

/**
 * Validate file size
 */
export const validateFileSize = (size, maxSize) => {
  return typeof size === 'number' && size > 0 && size <= maxSize;
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (width, height, minWidth, minHeight) => {
  return width >= minWidth && height >= minHeight;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (originalPrice <= 0 || currentPrice < 0 || currentPrice > originalPrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Validate points discount configuration
 */
export const validatePointsDiscount = (maxPoints, ratio) => {
  const maxPointsRules = STUDION_VALIDATION_RULES.MAX_POINTS_USABLE;
  const ratioRules = STUDION_VALIDATION_RULES.POINTS_TO_DISCOUNT_RATIO;
  
  return (maxPoints >= maxPointsRules.MIN && maxPoints <= maxPointsRules.MAX) &&
         (ratio >= ratioRules.MIN && ratio <= ratioRules.MAX);
};

/**
 * Validate course completion data
 */
export const validateCompletionData = (totalStudents, activeStudents, completionRate) => {
  return totalStudents >= 0 && 
         activeStudents >= 0 && 
         activeStudents <= totalStudents &&
         completionRate >= 0 && 
         completionRate <= 100;
};