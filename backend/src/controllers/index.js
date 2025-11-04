/**
 * Controllers Module
 * @module controllers
 * @description Central export point for all controller functions
 */

// Authentication Controller
export {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
} from './auth.controller.js';

// Document Controller
export {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentSummary,
  processPendingDocument,
  getDocumentAnalytics
} from './document.controller.js';

// Quiz Controller
export {
  generateQuiz,
  getAllQuizzes,
  getQuizById,
  getAllQuizzesForDocument,
  getDocumentQuizStats,
  selectQuizForDocument,
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getQuizAttemptResults,
  getUserQuizStats as getQuizUserStats,
  getQuizAttemptHistory
} from './quiz.controller.js';

// User Controller
export {
  getCurrentUser,
  updateUserProfile,
  updateUserPreferences,
  getUserStats,
  getUserPointsBalance,
  getUserPointsHistory,
  getUserDocumentsStats,
  getUserQuizStats,
  updateUserAvatar,
  updateAcademicInfo,
  manageFocusTimer
} from './user.controller.js';

// Course Controller
export {
  getAllCourses,
  getCourseById,
  getRecommendedCourses,
  purchaseCourse,
  getUserPurchasedCourses,
  getCourseCatalog,
  getCoursesByCategory,
  applyCourseDiscount
} from './course.controller.js';