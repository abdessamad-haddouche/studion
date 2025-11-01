/**
 * Course Model Enums
 * @module constants/models/course/enums
 * @description Enumerated values for course model fields
 */

// ==========================================
// COURSE SOURCE ENUMS
// ==========================================

/**
 * Course sources/platforms
 */
export const COURSE_SOURCES = Object.freeze([
  'internal',      // Courses created on our platform
  'udemy',         // Udemy courses
  'coursera',      // Coursera courses
  'edx',           // edX courses
  'skillshare',    // Skillshare courses
  'pluralsight',   // Pluralsight courses
  'linkedin',      // LinkedIn Learning
  'masterclass',   // MasterClass
  'khan_academy',  // Khan Academy
  'codecademy',    // Codecademy
  'treehouse',     // Treehouse
  'udacity',       // Udacity
  'futurelearn',   // FutureLearn
  'brilliant',     // Brilliant
  'domestika',     // Domestika
  'other'          // Other platforms
]);

// ==========================================
// COURSE LEVEL ENUMS
// ==========================================

/**
 * Course difficulty/skill levels
 */
export const COURSE_LEVELS = Object.freeze([
  'beginner',      // No prior knowledge required
  'intermediate',  // Some basic knowledge required
  'advanced',      // Substantial knowledge required
  'expert',        // Professional/expert level
  'all_levels'     // Suitable for all skill levels
]);

// ==========================================
// COURSE CATEGORY ENUMS
// ==========================================

/**
 * Course categories for organization
 */
export const COURSE_CATEGORIES = Object.freeze([
  // Technology & Programming
  'programming',
  'web_development',
  'mobile_development',
  'data_science',
  'machine_learning',
  'artificial_intelligence',
  'cybersecurity',
  'cloud_computing',
  'devops',
  'blockchain',
  'game_development',
  'software_testing',
  
  // Design & Creative
  'graphic_design',
  'web_design',
  'ui_ux_design',
  'photography',
  'video_editing',
  'animation',
  'illustration',
  'music_production',
  'writing',
  'creative_writing',
  
  // Business & Marketing
  'business',
  'entrepreneurship',
  'marketing',
  'digital_marketing',
  'social_media_marketing',
  'sales',
  'project_management',
  'leadership',
  'finance',
  'accounting',
  'investing',
  'cryptocurrency',
  
  // Academic Subjects
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'engineering',
  'computer_science',
  'statistics',
  'economics',
  'psychology',
  'philosophy',
  'history',
  'literature',
  'science',
  
  // Languages
  'english_language',
  'spanish_language',
  'french_language',
  'german_language',
  'chinese_language',
  'japanese_language',
  'arabic_language',
  'programming_languages',
  
  // Personal Development
  'personal_development',
  'productivity',
  'time_management',
  'communication',
  'public_speaking',
  'mindfulness',
  'health_fitness',
  'nutrition',
  'mental_health',
  'relationships',
  
  // Professional Skills
  'excel',
  'data_analysis',
  'presentations',
  'negotiation',
  'customer_service',
  'hr_management',
  'operations',
  'supply_chain',
  
  // Arts & Crafts
  'painting',
  'drawing',
  'crafts',
  'cooking',
  'baking',
  'gardening',
  'interior_design',
  'fashion',
  
  // Other
  'lifestyle',
  'travel',
  'sports',
  'hobbies',
  'other'
]);

// ==========================================
// COURSE STATUS ENUMS
// ==========================================

/**
 * Course publication and availability status
 */
export const COURSE_STATUSES = Object.freeze([
  'draft',         // Being created, not published
  'active',        // Published and available
  'inactive',      // Temporarily unavailable
  'archived',      // Permanently unavailable but kept for records
  'under_review',  // Being reviewed before publication
  'rejected'       // Review failed, needs fixes
]);

// ==========================================
// CURRENCY ENUMS
// ==========================================

/**
 * Supported currencies for course pricing
 */
export const CURRENCIES = Object.freeze([
  'USD',  // US Dollar
  'EUR',  // Euro
  'GBP',  // British Pound
  'MAD',  // Moroccan Dirham
  'CAD',  // Canadian Dollar
  'AUD',  // Australian Dollar
  'JPY',  // Japanese Yen
  'CNY',  // Chinese Yuan
  'INR',  // Indian Rupee
  'BRL'   // Brazilian Real
]);

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS = Object.freeze({
  USD: '$',
  EUR: '€',
  GBP: '£',
  MAD: 'DH',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$'
});

// ==========================================
// LANGUAGE ENUMS
// ==========================================

/**
 * Supported languages for course content
 */
export const COURSE_LANGUAGES = Object.freeze([
  'en',    // English
  'es',    // Spanish
  'fr',    // French
  'de',    // German
  'it',    // Italian
  'pt',    // Portuguese
  'ru',    // Russian
  'zh',    // Chinese
  'ja',    // Japanese
  'ko',    // Korean
  'ar',    // Arabic
  'hi',    // Hindi
  'nl',    // Dutch
  'sv',    // Swedish
  'da',    // Danish
  'no',    // Norwegian
  'fi',    // Finnish
  'pl',    // Polish
  'tr',    // Turkish
  'he',    // Hebrew
  'th',    // Thai
  'vi',    // Vietnamese
  'id',    // Indonesian
  'ms',    // Malay
  'tl',    // Filipino
  'other'  // Other languages
]);

// ==========================================
// INSTRUCTOR TYPE ENUMS
// ==========================================

/**
 * Types of course instructors
 */
export const INSTRUCTOR_TYPES = Object.freeze([
  'internal',      // Platform instructors (BaseUser)
  'external',      // External platform instructors
  'guest',         // Guest instructors
  'organization',  // Organizational accounts
  'verified',      // Verified industry experts
  'celebrity'      // Celebrity/famous instructors
]);

// ==========================================
// CONTENT TYPE ENUMS
// ==========================================

/**
 * Course content delivery formats
 */
export const CONTENT_TYPES = Object.freeze([
  'video',         // Video lectures
  'text',          // Text-based content
  'interactive',   // Interactive content
  'quiz',          // Quiz/assessment
  'assignment',    // Practical assignments
  'live',          // Live sessions
  'workshop',      // Workshop format
  'bootcamp',      // Intensive bootcamp
  'certification', // Certification course
  'micro_learning' // Short micro-lessons
]);

// ==========================================
// RATING SCALE ENUMS
// ==========================================

/**
 * Rating scale values (1-5 stars)
 */
export const RATING_SCALE = Object.freeze([1, 2, 3, 4, 5]);

/**
 * Rating categories for detailed feedback
 */
export const RATING_CATEGORIES = Object.freeze([
  'overall',           // Overall course rating
  'content_quality',   // Quality of content
  'instructor',        // Instructor effectiveness
  'value_for_money',   // Price vs value
  'production_quality',// Video/audio quality
  'clarity',           // Clarity of explanations
  'engagement',        // How engaging the course is
  'practical_value'    // Practical applicability
]);

// ==========================================
// DISCOUNT TYPE ENUMS
// ==========================================

/**
 * Types of discounts available
 */
export const DISCOUNT_TYPES = Object.freeze([
  'percentage',    // Percentage discount (e.g., 20% off)
  'fixed_amount',  // Fixed amount discount (e.g., $10 off)
  'points',        // Points-based discount
  'bundle',        // Bundle discount
  'early_bird',    // Early bird discount
  'loyalty',       // Loyalty program discount
  'referral',      // Referral discount
  'seasonal',      // Seasonal/holiday discount
  'flash_sale',    // Limited time flash sale
  'bulk'           // Bulk purchase discount
]);

// ==========================================
// ACCESS TYPE ENUMS
// ==========================================

/**
 * Course access types and restrictions
 */
export const ACCESS_TYPES = Object.freeze([
  'lifetime',      // Lifetime access
  'subscription',  // Subscription-based access
  'time_limited',  // Limited time access
  'enrollment_based', // Based on enrollment period
  'free',          // Free access
  'premium',       // Premium subscription required
  'one_time'       // One-time purchase
]);

// ==========================================
// COMPLETION CRITERIA ENUMS
// ==========================================

/**
 * Course completion criteria
 */
export const COMPLETION_CRITERIA = Object.freeze([
  'all_lessons',   // Complete all lessons
  'quiz_pass',     // Pass final quiz
  'assignment',    // Submit assignment
  'project',       // Complete final project
  'time_based',    // Spend minimum time
  'attendance',    // Attend minimum sessions
  'custom'         // Custom criteria
]);

// ==========================================
// STUDION INTEGRATION ENUMS
// ==========================================

/**
 * Quiz difficulty levels for course recommendations
 */
export const QUIZ_DIFFICULTY_LEVELS = Object.freeze([
  'easy',          // Basic understanding
  'medium',        // Intermediate knowledge
  'hard'           // Advanced concepts
]);

/**
 * Quiz categories that can trigger course recommendations
 */
export const QUIZ_RECOMMENDATION_CATEGORIES = Object.freeze([
  'mathematics',
  'science',
  'programming',
  'language',
  'business',
  'design',
  'personal_development',
  'technology',
  'arts',
  'health',
  'other'
]);

/**
 * Points usage patterns for analytics
 */
export const POINTS_USAGE_TYPES = Object.freeze([
  'course_discount',   // Used for course discounts
  'bonus_unlock',      // Unlock bonus content
  'priority_support',  // Priority customer support
  'exclusive_access',  // Access to exclusive courses
  'merchandise',       // Platform merchandise
  'certification'      // Certification fees
]);

// ==========================================
// COURSE DEFAULTS
// ==========================================

/**
 * Default values for course fields
 */
export const COURSE_DEFAULTS = Object.freeze({
  STATUS: 'active',
  LEVEL: 'intermediate',
  CATEGORY: 'other',
  CURRENCY: 'USD',
  LANGUAGE: 'en',
  SOURCE: 'internal',
  INSTRUCTOR_TYPE: 'internal',
  ACCESS_TYPE: 'lifetime',
  
  // Pricing defaults
  COMMISSION_PERCENTAGE: 0,
  POINTS_TO_DISCOUNT_RATIO: 0.01, // 1 point = 1% discount
  MAX_POINTS_USABLE: 1000,
  
  // Content defaults
  DURATION_HOURS: 0,
  DURATION_MINUTES: 0,
  TOTAL_LECTURES: 0,
  
  // Rating defaults
  RATING_AVERAGE: 0,
  RATING_COUNT: 0,
  
  // Analytics defaults
  VIEWS: 0,
  CLICKS: 0,
  CONVERSIONS: 0,
  TOTAL_STUDENTS: 0,
  ACTIVE_STUDENTS: 0,
  COMPLETION_RATE: 0,
  
  // Business defaults
  TOTAL_SALES: 0,
  REVENUE: 0
});

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Check if value is valid course source
 */
export const isValidCourseSource = (source) => {
  return COURSE_SOURCES.includes(source);
};

/**
 * Check if value is valid course level
 */
export const isValidCourseLevel = (level) => {
  return COURSE_LEVELS.includes(level);
};

/**
 * Check if value is valid course category
 */
export const isValidCourseCategory = (category) => {
  return COURSE_CATEGORIES.includes(category);
};

/**
 * Check if value is valid course status
 */
export const isValidCourseStatus = (status) => {
  return COURSE_STATUSES.includes(status);
};

/**
 * Check if value is valid currency
 */
export const isValidCurrency = (currency) => {
  return CURRENCIES.includes(currency);
};

/**
 * Check if value is valid language
 */
export const isValidCourseLanguage = (language) => {
  return COURSE_LANGUAGES.includes(language);
};

/**
 * Check if value is valid rating
 */
export const isValidRating = (rating) => {
  return RATING_SCALE.includes(rating);
};

/**
 * Get currency symbol for currency code
 */
export const getCurrencySymbol = (currency) => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

/**
 * Get default category for a quiz category
 */
export const mapQuizCategoryToCourseCategory = (quizCategory) => {
  const mapping = {
    'mathematics': 'mathematics',
    'science': 'science',
    'programming': 'programming',
    'language': 'english_language',
    'business': 'business',
    'design': 'graphic_design',
    'personal_development': 'personal_development',
    'technology': 'programming',
    'arts': 'painting',
    'health': 'health_fitness'
  };
  
  return mapping[quizCategory] || 'other';
};