/**
 * Quiz Models Index 
 * @module models/quiz
 * @description Export point for quiz models
 */

// Quiz Model
export { quizSchema } from './Quiz.js'; 
export { default as Quiz } from './Quiz.js';

// Quiz Attempt Model  
export { quizAttemptSchema, answerSchema, performanceAreaSchema } from './QuizAttempt.js';
export { default as QuizAttempt } from './QuizAttempt.js';