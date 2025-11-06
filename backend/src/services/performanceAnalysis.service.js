/**
 * Performance Analysis Service
 * @module services/performanceAnalysis
 * @description Analyzes quiz performance and determines strengths/weaknesses without AI calls
 */

/**
 * Analyze quiz performance and determine strengths/weaknesses
 * @param {Array} userAnswers - Array of user answers with isCorrect field
 * @param {Array} quizQuestions - Array of quiz questions with skillCategory/topicArea
 * @returns {Object} { strengths, weaknesses }
 */
export const analyzeQuizPerformance = (userAnswers, quizQuestions) => {
  try {
    console.log(`📊 Analyzing performance: ${userAnswers.length} answers, ${quizQuestions.length} questions`);
    
    const skillPerformance = {};
    const topicPerformance = {};
    
    // Process each answer
    userAnswers.forEach((answer) => {
      // Find the corresponding question
      const question = quizQuestions.find(q => {
        const questionId = q.id || (quizQuestions.indexOf(q) + 1);
        return questionId.toString() === answer.questionId.toString();
      });
      
      if (!question) {
        console.warn(`⚠️ Question not found for answer: ${answer.questionId}`);
        return;
      }
      
      const skillCategory = question.skillCategory || 'unknown';
      const topicArea = question.topicArea || 'general';
      
      // Track skill performance
      if (!skillPerformance[skillCategory]) {
        skillPerformance[skillCategory] = { correct: 0, total: 0 };
      }
      skillPerformance[skillCategory].total++;
      if (answer.isCorrect) {
        skillPerformance[skillCategory].correct++;
      }
      
      // Track topic performance  
      if (!topicPerformance[topicArea]) {
        topicPerformance[topicArea] = { correct: 0, total: 0 };
      }
      topicPerformance[topicArea].total++;
      if (answer.isCorrect) {
        topicPerformance[topicArea].correct++;
      }
    });
    
    // Calculate strengths (≥75% accuracy) and weaknesses (<60% accuracy)
    const strengths = [];
    const weaknesses = [];
    
    // Process skills
    Object.entries(skillPerformance).forEach(([skill, performance]) => {
      const score = Math.round((performance.correct / performance.total) * 100);
      
      if (score >= 75 && performance.total >= 2) {
        strengths.push({
          area: skill,
          score,
          totalQuestions: performance.total,
          correctAnswers: performance.correct
        });
      } else if (score < 60) {
        weaknesses.push({
          area: skill,
          score,
          totalQuestions: performance.total,
          correctAnswers: performance.correct
        });
      }
    });
    
    // Process topics
    Object.entries(topicPerformance).forEach(([topic, performance]) => {
      const score = Math.round((performance.correct / performance.total) * 100);
      
      if (score >= 75 && performance.total >= 2) {
        strengths.push({
          area: topic,
          score,
          totalQuestions: performance.total,
          correctAnswers: performance.correct
        });
      } else if (score < 60) {
        weaknesses.push({
          area: topic,
          score,
          totalQuestions: performance.total,
          correctAnswers: performance.correct
        });
      }
    });
    
    console.log(`✅ Performance analysis complete: ${strengths.length} strengths, ${weaknesses.length} weaknesses`);
    
    return { 
      strengths: strengths.sort((a, b) => b.score - a.score), // Sort by score descending
      weaknesses: weaknesses.sort((a, b) => a.score - b.score) // Sort by score ascending
    };
    
  } catch (error) {
    console.error('❌ Performance analysis error:', error);
    return { strengths: [], weaknesses: [] };
  }
};

export default { analyzeQuizPerformance };