/**
 * User Progress Update Service
 * @module services/userProgress
 * @description Updates user progress statistics after quiz completion
 */

import { Student } from '#models/users/index.js';
import { HttpError } from '#exceptions/index.js';

/**
 * Update user progress after quiz completion
 * @param {string} userId - User ID
 * @param {Object} quizResults - Quiz completion results
 * @returns {Promise<Object>} Updated progress
 */
export const updateQuizProgress = async (userId, quizResults) => {
  try {
    const { score, percentage, pointsEarned, timeSpent } = quizResults;

    console.log(`📊 Updating user progress for: ${userId}`);
    console.log(`📈 Quiz results: ${percentage}% (${score} correct, ${pointsEarned} points)`);

    // Find the user
    const user = await Student.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }

    // Calculate new progress values
    const currentProgress = user.progress;
    const newQuizzesCompleted = currentProgress.quizzesCompleted + 1;
    const newTotalPoints = currentProgress.totalPoints + pointsEarned;
    
    // Calculate new average score
    const currentTotalScore = currentProgress.averageScore * currentProgress.quizzesCompleted;
    const newAverageScore = (currentTotalScore + percentage) / newQuizzesCompleted;
    
    // Update best score if applicable
    const newBestScore = Math.max(currentProgress.bestScore, percentage);
    
    // Update study streak logic
    const today = new Date();
    const lastStudyDate = currentProgress.lastStudyDate;
    let newStudyStreak = currentProgress.studyStreak;
    
    if (lastStudyDate) {
      const daysSinceLastStudy = Math.floor((today - new Date(lastStudyDate)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastStudy === 1) {
        // Consecutive day
        newStudyStreak += 1;
      } else if (daysSinceLastStudy === 0) {
        // Same day, keep streak
        newStudyStreak = currentProgress.studyStreak;
      } else {
        // Streak broken
        newStudyStreak = 1;
      }
    } else {
      // First study session
      newStudyStreak = 1;
    }

    // Update user progress
    const updatedUser = await Student.findByIdAndUpdate(
      userId,
      {
        $set: {
          'progress.quizzesCompleted': newQuizzesCompleted,
          'progress.averageScore': Math.round(newAverageScore * 100) / 100, // Round to 2 decimals
          'progress.bestScore': newBestScore,
          'progress.totalPoints': newTotalPoints,
          'progress.studyStreak': newStudyStreak,
          'progress.lastStudyDate': today,
          'analytics.lastActiveAt': today,
        }
      },
      { new: true }
    );

    console.log(`✅ User progress updated:`);
    console.log(`  📊 Quizzes completed: ${currentProgress.quizzesCompleted} → ${newQuizzesCompleted}`);
    console.log(`  📈 Average score: ${currentProgress.averageScore}% → ${newAverageScore.toFixed(2)}%`);
    console.log(`  🏆 Best score: ${currentProgress.bestScore}% → ${newBestScore}%`);
    console.log(`  💰 Total points: ${currentProgress.totalPoints} → ${newTotalPoints}`);
    console.log(`  🔥 Study streak: ${currentProgress.studyStreak} → ${newStudyStreak} days`);

    return {
      success: true,
      previousProgress: currentProgress,
      newProgress: updatedUser.progress,
      improvements: {
        quizzesCompleted: newQuizzesCompleted - currentProgress.quizzesCompleted,
        averageScoreChange: newAverageScore - currentProgress.averageScore,
        pointsEarned: pointsEarned,
        streakChange: newStudyStreak - currentProgress.studyStreak,
        newBestScore: newBestScore > currentProgress.bestScore
      }
    };

  } catch (error) {
    console.error('❌ Update user progress error:', error);
    throw HttpError.internalServerError(`Failed to update user progress: ${error.message}`);
  }
};

/**
 * Update user progress after document upload
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated progress
 */
export const updateDocumentUploadProgress = async (userId) => {
  try {
    console.log(`📄 Updating document upload progress for: ${userId}`);

    const updatedUser = await Student.findByIdAndUpdate(
      userId,
      {
        $inc: {
          'progress.documentsUploaded': 1,
          'progress.totalPoints': 5 // Base points for document upload
        },
        $set: {
          'analytics.lastActiveAt': new Date()
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      throw HttpError.notFound('User not found');
    }

    console.log(`✅ Document upload progress updated: ${updatedUser.progress.documentsUploaded} documents`);

    return {
      success: true,
      documentsUploaded: updatedUser.progress.documentsUploaded,
      pointsEarned: 5,
      totalPoints: updatedUser.progress.totalPoints
    };

  } catch (error) {
    console.error('❌ Update document progress error:', error);
    throw HttpError.internalServerError(`Failed to update document progress: ${error.message}`);
  }
};

/**
 * Update quiz generation progress
 * @param {string} userId - User ID
 * @param {number} quizzesGenerated - Number of quizzes generated
 * @returns {Promise<Object>} Updated progress
 */
export const updateQuizGenerationProgress = async (userId, quizzesGenerated = 1) => {
  try {
    console.log(`🎯 Updating quiz generation progress for: ${userId} (+${quizzesGenerated})`);

    const updatedUser = await Student.findByIdAndUpdate(
      userId,
      {
        $inc: {
          'progress.quizzesGenerated': quizzesGenerated
        },
        $set: {
          'analytics.lastActiveAt': new Date()
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      throw HttpError.notFound('User not found');
    }

    console.log(`✅ Quiz generation progress updated: ${updatedUser.progress.quizzesGenerated} quizzes generated`);

    return {
      success: true,
      quizzesGenerated: updatedUser.progress.quizzesGenerated
    };

  } catch (error) {
    console.error('❌ Update quiz generation progress error:', error);
    throw HttpError.internalServerError(`Failed to update quiz generation progress: ${error.message}`);
  }
};

export default {
  updateQuizProgress,
  updateDocumentUploadProgress,
  updateQuizGenerationProgress
};