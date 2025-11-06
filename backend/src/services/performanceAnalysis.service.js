/**
 * Performance Analysis Service
 * @module services/performanceAnalysis
 * @description Analyzes quiz performance and determines strengths/weaknesses
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
      
      // Use the question's skillCategory and topicArea directly - no mapping!
      const skillCategory = question.skillCategory || 'unknown_skill';
      const topicArea = question.topicArea || 'unknown_topic';
      
      // Track skill performance
      if (!skillPerformance[skillCategory]) {
        skillPerformance[skillCategory] = { correct: 0, total: 0 };
      }
      skillPerformance[skillCategory].total++;
      if (answer.isCorrect) {
        skillPerformance[skillCategory].correct++;
      }
      
      // Track topic performance (only if different from skill)
      if (topicArea !== skillCategory) {
        if (!skillPerformance[topicArea]) {
          skillPerformance[topicArea] = { correct: 0, total: 0 };
        }
        skillPerformance[topicArea].total++;
        if (answer.isCorrect) {
          skillPerformance[topicArea].correct++;
        }
      }
    });
    
    // Calculate strengths (≥75% accuracy) and weaknesses (<60% accuracy)
    const strengths = [];
    const weaknesses = [];
    
    Object.entries(skillPerformance).forEach(([area, performance]) => {
      const score = Math.round((performance.correct / performance.total) * 100);
      
      console.log(`📊 ${area}: ${performance.correct}/${performance.total} = ${score}%`);
      
      const areaData = {
        area: area, // Use the raw area name - no validation!
        score,
        totalQuestions: performance.total,
        correctAnswers: performance.correct
      };
      
      if (score >= 75 && performance.total >= 1) {
        strengths.push(areaData);
        console.log(`💪 Strength: ${area} (${score}%)`);
      } else if (score < 60 && performance.total >= 1) {
        weaknesses.push(areaData);
        console.log(`📚 Weakness: ${area} (${score}%)`);
      }
    });
    
    console.log(`✅ Performance analysis complete: ${strengths.length} strengths, ${weaknesses.length} weaknesses`);
    
    return { 
      strengths: strengths.sort((a, b) => b.score - a.score),
      weaknesses: weaknesses.sort((a, b) => a.score - b.score)
    };
    
  } catch (error) {
    console.error('❌ Performance analysis error:', error);
    return { strengths: [], weaknesses: [] };
  }
};

export default { analyzeQuizPerformance };