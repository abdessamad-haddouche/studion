/**
 * Course Validation Middleware
 * @module middleware/course-validation
 * @description Request validation for course operations
 */

import { HttpError } from '#exceptions/index.js';
import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  COURSE_STATUSES,
  COURSE_SOURCES,
  CURRENCIES,
  COURSE_LANGUAGES,
  INSTRUCTOR_TYPES,
  CONTENT_TYPES,
  validateCourseTitle,
  validateCourseDescription,
  validatePrice,
  validateUrl
} from '#constants/models/course/index.js';

/**
 * Validate course creation request
 */
export const validateCourseCreation = (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      instructor,
      pricing
    } = req.body;

    // Validate required fields
    if (!title) {
      throw HttpError.badRequest('Course title is required');
    }

    if (!description) {
      throw HttpError.badRequest('Course description is required');
    }

    if (!category) {
      throw HttpError.badRequest('Course category is required');
    }

    if (!instructor || !instructor.name) {
      throw HttpError.badRequest('Instructor information is required');
    }

    if (!pricing || pricing.originalPrice == null || pricing.currentPrice == null) {
      throw HttpError.badRequest('Pricing information is required');
    }

    // Validate title
    if (!validateCourseTitle(title)) {
      throw HttpError.badRequest('Invalid course title format');
    }

    // Validate description
    if (!validateCourseDescription(description)) {
      throw HttpError.badRequest('Course description must be between 50 and 5000 characters');
    }

    // Validate category
    if (!COURSE_CATEGORIES.includes(category)) {
      throw HttpError.badRequest('Invalid course category');
    }

    // Validate level if provided
    if (req.body.level && !COURSE_LEVELS.includes(req.body.level)) {
      throw HttpError.badRequest('Invalid course level');
    }

    // Validate pricing
    if (!validatePrice(pricing.originalPrice) || !validatePrice(pricing.currentPrice)) {
      throw HttpError.badRequest('Invalid pricing values');
    }

    if (pricing.currentPrice > pricing.originalPrice) {
      throw HttpError.badRequest('Current price cannot be higher than original price');
    }

    // Validate instructor type if provided
    if (instructor.type && !INSTRUCTOR_TYPES.includes(instructor.type)) {
      throw HttpError.badRequest('Invalid instructor type');
    }

    // Validate source if provided
    if (req.body.source && !COURSE_SOURCES.includes(req.body.source)) {
      throw HttpError.badRequest('Invalid course source');
    }

    // Validate currency if provided
    if (pricing.currency && !CURRENCIES.includes(pricing.currency)) {
      throw HttpError.badRequest('Invalid currency');
    }

    // Validate URLs if provided
    if (req.body.media?.thumbnail && !validateUrl(req.body.media.thumbnail)) {
      throw HttpError.badRequest('Invalid thumbnail URL');
    }

    if (req.body.media?.previewVideo && !validateUrl(req.body.media.previewVideo)) {
      throw HttpError.badRequest('Invalid preview video URL');
    }

    if (req.body.external?.platformUrl && !validateUrl(req.body.external.platformUrl)) {
      throw HttpError.badRequest('Invalid platform URL');
    }

    // Validate content language if provided
    if (req.body.content?.language && !COURSE_LANGUAGES.includes(req.body.content.language)) {
      throw HttpError.badRequest('Invalid course language');
    }

    // Validate content type if provided
    if (req.body.content?.type && !CONTENT_TYPES.includes(req.body.content.type)) {
      throw HttpError.badRequest('Invalid content type');
    }

    // Validate duration if provided
    if (req.body.content?.duration) {
      const { hours, minutes } = req.body.content.duration;
      if (hours != null && (hours < 0 || hours > 1000)) {
        throw HttpError.badRequest('Duration hours must be between 0 and 1000');
      }
      if (minutes != null && (minutes < 0 || minutes > 59)) {
        throw HttpError.badRequest('Duration minutes must be between 0 and 59');
      }
    }

    // Validate arrays
    if (req.body.tags && Array.isArray(req.body.tags)) {
      if (req.body.tags.length > 20) {
        throw HttpError.badRequest('Maximum 20 tags allowed');
      }
      for (const tag of req.body.tags) {
        if (typeof tag !== 'string' || tag.length < 2 || tag.length > 30) {
          throw HttpError.badRequest('Each tag must be 2-30 characters long');
        }
      }
    }

    if (req.body.content?.learningOutcomes && Array.isArray(req.body.content.learningOutcomes)) {
      if (req.body.content.learningOutcomes.length > 20) {
        throw HttpError.badRequest('Maximum 20 learning outcomes allowed');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate course update request
 */
export const validateCourseUpdate = (req, res, next) => {
  try {
    const updateData = req.body;

    // If no data provided
    if (!updateData || Object.keys(updateData).length === 0) {
      throw HttpError.badRequest('No update data provided');
    }

    // Validate title if provided
    if (updateData.title && !validateCourseTitle(updateData.title)) {
      throw HttpError.badRequest('Invalid course title format');
    }

    // Validate description if provided
    if (updateData.description && !validateCourseDescription(updateData.description)) {
      throw HttpError.badRequest('Course description must be between 50 and 5000 characters');
    }

    // Validate category if provided
    if (updateData.category && !COURSE_CATEGORIES.includes(updateData.category)) {
      throw HttpError.badRequest('Invalid course category');
    }

    // Validate level if provided
    if (updateData.level && !COURSE_LEVELS.includes(updateData.level)) {
      throw HttpError.badRequest('Invalid course level');
    }

    // Validate status if provided
    if (updateData.status && !COURSE_STATUSES.includes(updateData.status)) {
      throw HttpError.badRequest('Invalid course status');
    }

    // Validate source if provided
    if (updateData.source && !COURSE_SOURCES.includes(updateData.source)) {
      throw HttpError.badRequest('Invalid course source');
    }

    // Validate pricing if provided
    if (updateData.pricing) {
      if (updateData.pricing.originalPrice != null && !validatePrice(updateData.pricing.originalPrice)) {
        throw HttpError.badRequest('Invalid original price');
      }
      if (updateData.pricing.currentPrice != null && !validatePrice(updateData.pricing.currentPrice)) {
        throw HttpError.badRequest('Invalid current price');
      }
      if (updateData.pricing.originalPrice != null && updateData.pricing.currentPrice != null) {
        if (updateData.pricing.currentPrice > updateData.pricing.originalPrice) {
          throw HttpError.badRequest('Current price cannot be higher than original price');
        }
      }
      if (updateData.pricing.currency && !CURRENCIES.includes(updateData.pricing.currency)) {
        throw HttpError.badRequest('Invalid currency');
      }
    }

    // Validate instructor if provided
    if (updateData.instructor) {
      if (updateData.instructor.type && !INSTRUCTOR_TYPES.includes(updateData.instructor.type)) {
        throw HttpError.badRequest('Invalid instructor type');
      }
    }

    // Validate content if provided
    if (updateData.content) {
      if (updateData.content.type && !CONTENT_TYPES.includes(updateData.content.type)) {
        throw HttpError.badRequest('Invalid content type');
      }
      if (updateData.content.language && !COURSE_LANGUAGES.includes(updateData.content.language)) {
        throw HttpError.badRequest('Invalid course language');
      }
      if (updateData.content.duration) {
        const { hours, minutes } = updateData.content.duration;
        if (hours != null && (hours < 0 || hours > 1000)) {
          throw HttpError.badRequest('Duration hours must be between 0 and 1000');
        }
        if (minutes != null && (minutes < 0 || minutes > 59)) {
          throw HttpError.badRequest('Duration minutes must be between 0 and 59');
        }
      }
    }

    // Validate URLs if provided
    if (updateData.media?.thumbnail && !validateUrl(updateData.media.thumbnail)) {
      throw HttpError.badRequest('Invalid thumbnail URL');
    }

    if (updateData.media?.previewVideo && !validateUrl(updateData.media.previewVideo)) {
      throw HttpError.badRequest('Invalid preview video URL');
    }

    if (updateData.external?.platformUrl && !validateUrl(updateData.external.platformUrl)) {
      throw HttpError.badRequest('Invalid platform URL');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate course purchase request
 */
export const validateCoursePurchase = (req, res, next) => {
  try {
    const { pointsToUse } = req.body;

    // Validate points if provided
    if (pointsToUse != null) {
      if (typeof pointsToUse !== 'number' || pointsToUse < 0) {
        throw HttpError.badRequest('Points to use must be a non-negative number');
      }
      if (pointsToUse > 100000) {
        throw HttpError.badRequest('Cannot use more than 100,000 points per transaction');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate course filters
 */
export const validateCourseFilters = (req, res, next) => {
  try {
    const {
      category,
      level,
      source,
      isFree,
      minPrice,
      maxPrice,
      minRating,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    // Validate category
    if (category && !COURSE_CATEGORIES.includes(category)) {
      throw HttpError.badRequest('Invalid category filter');
    }

    // Validate level
    if (level && !COURSE_LEVELS.includes(level)) {
      throw HttpError.badRequest('Invalid level filter');
    }

    // Validate source
    if (source && !COURSE_SOURCES.includes(source)) {
      throw HttpError.badRequest('Invalid source filter');
    }

    // Validate isFree
    if (isFree && !['true', 'false'].includes(isFree)) {
      throw HttpError.badRequest('isFree must be true or false');
    }

    // Validate price range
    if (minPrice && (isNaN(minPrice) || Number(minPrice) < 0)) {
      throw HttpError.badRequest('Invalid minimum price');
    }

    if (maxPrice && (isNaN(maxPrice) || Number(maxPrice) < 0)) {
      throw HttpError.badRequest('Invalid maximum price');
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      throw HttpError.badRequest('Minimum price cannot be greater than maximum price');
    }

    // Validate rating
    if (minRating && (isNaN(minRating) || Number(minRating) < 0 || Number(minRating) > 5)) {
      throw HttpError.badRequest('Rating must be between 0 and 5');
    }

    // Validate pagination
    if (page && (isNaN(page) || Number(page) < 1)) {
      throw HttpError.badRequest('Page must be a positive number');
    }

    if (limit && (isNaN(limit) || Number(limit) < 1 || Number(limit) > 100)) {
      throw HttpError.badRequest('Limit must be between 1 and 100');
    }

    // Validate sorting
    const allowedSortFields = [
      'title', 'createdAt', 'updatedAt', 'rating.average', 
      'enrollment.totalStudents', 'pricing.currentPrice'
    ];
    
    if (sortBy && !allowedSortFields.includes(sortBy)) {
      throw HttpError.badRequest(`Invalid sort field. Allowed: ${allowedSortFields.join(', ')}`);
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      throw HttpError.badRequest('Sort order must be asc or desc');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  validateCourseCreation,
  validateCourseUpdate,
  validateCoursePurchase,
  validateCourseFilters
};