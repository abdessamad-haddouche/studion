/**
 * Student Model Constants
 * @module constants/models/user/student
 * @description Essential constants for Student user type
 */

// ==========================================
// ACADEMIC LEVELS
// ==========================================

export const ACADEMIC_LEVELS = [
  'high_school',
  'undergraduate', 
  'graduate',
  'professional'
];

// ==========================================
// SUBSCRIPTION TIERS (Core Business Model)
// ==========================================

export const SUBSCRIPTION_TIERS = [
  'free',          // Limited documents & quizzes
  'premium',       // Unlimited access
  'student'        // Discounted for students
];


// ==========================================
// BASIC QUIZ TYPES (Future Implementation)
// ==========================================

export const QUIZ_TYPES = [
  'multiple_choice',
  'true_false',
  'short_answer'
];

// ==========================================
// LEARNING PREFERENCES (Simple)
// ==========================================

export const LEARNING_PREFERENCES = [
  'visual',
  'text',
  'mixed'
];