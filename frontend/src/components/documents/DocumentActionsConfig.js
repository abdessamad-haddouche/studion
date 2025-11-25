/**
 * PATH: src/components/documents/DocumentActionsConfig.js
 * Document Actions Configuration - Control available actions per document
 */

export const DOCUMENT_ACTIONS = {
  REVISE: 'revise',
  QUIZ: 'quiz',
  DOWNLOAD: 'download',
  SHARE: 'share',
  DELETE: 'delete'
}

export const QUIZ_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium', 
  HARD: 'hard'
}

export const REVISION_MODES = {
  SUMMARY: 'summary',
  KEY_POINTS: 'key_points',
  TOPICS: 'topics',
  FULL_CONTENT: 'full_content'
}

// Document actions configuration
export const documentActionsConfig = {
  [DOCUMENT_ACTIONS.REVISE]: {
    enabled: true,
    label: 'Revise',
    description: 'Study summaries, key points & topics',
    icon: 'BookOpen',
    color: 'blue',
    requiresProcessed: true, // Only show for completed documents
    order: 1
  },
  
  [DOCUMENT_ACTIONS.QUIZ]: {
    enabled: true,
    label: 'Take Quiz',
    description: 'Test your knowledge',
    icon: 'Brain',
    color: 'purple',
    requiresProcessed: true,
    order: 2
  },
  
  [DOCUMENT_ACTIONS.DOWNLOAD]: {
    enabled: true,
    label: 'Download',
    description: 'Download original file',
    icon: 'Download',
    color: 'green',
    requiresProcessed: false, // Available for any document
    order: 3
  },
  
  [DOCUMENT_ACTIONS.SHARE]: {
    enabled: false,
    label: 'Share',
    description: 'Share with others',
    icon: 'Share2',
    color: 'indigo',
    requiresProcessed: true,
    order: 4
  },
  
  [DOCUMENT_ACTIONS.DELETE]: {
    enabled: true,
    label: 'Delete',
    description: 'Remove document',
    icon: 'Trash2',
    color: 'red',
    requiresProcessed: false,
    order: 5
  }
}

// Revision modes configuration
export const revisionConfig = {
  [REVISION_MODES.SUMMARY]: {
    enabled: true,
    label: 'Summary',
    description: 'AI-generated overview',
    icon: 'FileText',
    order: 1
  },
  
  [REVISION_MODES.KEY_POINTS]: {
    enabled: true,
    label: 'Key Points',
    description: 'Important highlights',
    icon: 'List',
    order: 2
  },
  
  [REVISION_MODES.TOPICS]: {
    enabled: true,
    label: 'Topics',
    description: 'Main subjects covered',
    icon: 'Tag',
    order: 3
  },
  
  [REVISION_MODES.FULL_CONTENT]: {
    enabled: false,
    label: 'Full Text',
    description: 'Complete extracted content',
    icon: 'Scroll',
    order: 4
  }
}

// Quiz configuration
export const quizConfig = {
  [QUIZ_DIFFICULTIES.EASY]: {
    enabled: true,
    label: 'Easy',
    description: 'Basic understanding',
    questionsCount: 5,
    color: 'green',
    icon: 'Smile'
  },
  
  [QUIZ_DIFFICULTIES.MEDIUM]: {
    enabled: true,
    label: 'Medium',
    description: 'Moderate challenge',
    questionsCount: 10,
    color: 'yellow',
    icon: 'Meh'
  },
  
  [QUIZ_DIFFICULTIES.HARD]: {
    enabled: true,
    label: 'Hard',
    description: 'Advanced concepts',
    questionsCount: 15,
    color: 'red',
    icon: 'Frown'
  }
}

/**
 * Get enabled actions for a document based on its status
 * @param {string} documentStatus - Document processing status
 * @returns {Array} Available actions for the document
 */
export const getAvailableActions = (documentStatus) => {
  return Object.entries(documentActionsConfig)
    .filter(([key, config]) => {
      if (!config.enabled) return false
      
      // Check if action requires processed document
      if (config.requiresProcessed && documentStatus !== 'completed') {
        return false
      }
      
      return true
    })
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key)
}

/**
 * Get enabled revision modes
 * @returns {Array} Available revision modes
 */
export const getEnabledRevisionModes = () => {
  return Object.entries(revisionConfig)
    .filter(([, config]) => config.enabled)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key)
}

/**
 * Get enabled quiz difficulties
 * @returns {Array} Available quiz difficulties
 */
export const getEnabledQuizDifficulties = () => {
  return Object.entries(quizConfig)
    .filter(([, config]) => config.enabled)
    .map(([key]) => key)
}