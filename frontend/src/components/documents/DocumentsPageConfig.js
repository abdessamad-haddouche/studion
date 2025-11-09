/**
 * PATH: src/components/documents/DocumentsPageConfig.js
 * Documents Page Configuration - Control which components to show
 * 
 * ✅ FEATURES:
 * - Configurable component system like dashboard
 * - Subscription-aware limits
 * - Easy enable/disable functionality
 * - Order management
 */

// ==========================================
// COMPONENT CONSTANTS
// ==========================================

export const DOCUMENTS_COMPONENTS = {
  HEADER: 'header',
  STATS: 'stats',
  TOOLBAR: 'toolbar', 
  GRID: 'grid',
  TABLE: 'table',
  PAGINATION: 'pagination',
  UPLOAD_CTA: 'upload_cta',
  EMPTY_STATE: 'empty_state'
}

// ==========================================
// VIEW MODES
// ==========================================

export const VIEW_MODES = {
  GRID: 'grid',
  TABLE: 'table',
  LIST: 'list'
}

// ==========================================
// SORT OPTIONS
// ==========================================

export const SORT_OPTIONS = {
  NEWEST: { field: 'createdAt', order: 'desc', label: 'Newest First' },
  OLDEST: { field: 'createdAt', order: 'asc', label: 'Oldest First' },
  NAME_AZ: { field: 'title', order: 'asc', label: 'Name A-Z' },
  NAME_ZA: { field: 'title', order: 'desc', label: 'Name Z-A' },
  STATUS: { field: 'status', order: 'desc', label: 'Status' },
  SIZE: { field: 'fileSize', order: 'desc', label: 'File Size' }
}

// ==========================================
// FILTER OPTIONS
// ==========================================

export const FILTER_OPTIONS = {
  STATUS: {
    ALL: { value: null, label: 'All Statuses' },
    COMPLETED: { value: 'completed', label: 'Completed' },
    PROCESSING: { value: 'processing', label: 'Processing' },
    PENDING: { value: 'pending', label: 'Pending' },
    FAILED: { value: 'failed', label: 'Failed' }
  },
  CATEGORY: {
    ALL: { value: null, label: 'All Categories' },
    ACADEMIC: { value: 'academic', label: 'Academic' },
    BUSINESS: { value: 'business', label: 'Business' },
    RESEARCH: { value: 'research', label: 'Research' },
    PERSONAL: { value: 'personal', label: 'Personal' },
    OTHER: { value: 'other', label: 'Other' }
  },
  DIFFICULTY: {
    ALL: { value: null, label: 'All Levels' },
    BEGINNER: { value: 'beginner', label: 'Beginner' },
    INTERMEDIATE: { value: 'intermediate', label: 'Intermediate' },
    ADVANCED: { value: 'advanced', label: 'Advanced' }
  }
}

// ==========================================
// SUBSCRIPTION LIMITS
// ==========================================

export const SUBSCRIPTION_LIMITS = {
  free: {
    documentsLimit: 5,
    documentsPerPage: 10,
    maxFileSize: 10, // MB
    allowedFormats: ['pdf', 'txt'],
    features: ['basic_search', 'basic_sort']
  },
  basic: {
    documentsLimit: 8,
    documentsPerPage: 20,
    maxFileSize: 25, // MB
    allowedFormats: ['pdf', 'txt', 'docx'],
    features: ['basic_search', 'basic_sort', 'category_filter']
  },
  premium: {
    documentsLimit: 25,
    documentsPerPage: 50,
    maxFileSize: 50, // MB
    allowedFormats: ['pdf', 'txt', 'docx', 'pptx'],
    features: ['advanced_search', 'advanced_sort', 'all_filters', 'bulk_actions']
  },
  pro: {
    documentsLimit: 100,
    documentsPerPage: 100,
    maxFileSize: 100, // MB
    allowedFormats: ['pdf', 'txt', 'docx', 'pptx', 'xlsx'],
    features: ['advanced_search', 'advanced_sort', 'all_filters', 'bulk_actions', 'export']
  },
  enterprise: {
    documentsLimit: -1, // Unlimited
    documentsPerPage: 100,
    maxFileSize: 500, // MB
    allowedFormats: ['pdf', 'txt', 'docx', 'pptx', 'xlsx', 'csv'],
    features: ['advanced_search', 'advanced_sort', 'all_filters', 'bulk_actions', 'export', 'api_access']
  }
}

// ==========================================
// COMPONENT CONFIGURATION
// ==========================================

export const documentsPageConfig = {
  // Page Header with title and upload button
  [DOCUMENTS_COMPONENTS.HEADER]: {
    enabled: true,
    showForEmpty: true,
    showForPopulated: true,
    order: 1,
    props: {
      showUploadButton: true,
      showStats: true
    }
  },

  // Usage stats and subscription info
  [DOCUMENTS_COMPONENTS.STATS]: {
    enabled: false, // ✅ DISABLED per user request
    showForEmpty: true,
    showForPopulated: true,
    order: 2,
    props: {
      showUpgradePrompt: true,
      showUsageBar: true
    }
  },

  // Search, filter, and sort toolbar
  [DOCUMENTS_COMPONENTS.TOOLBAR]: {
    enabled: true,
    showForEmpty: false,
    showForPopulated: true,
    order: 3,
    props: {
      showSearch: true,
      showFilters: true,
      showSort: true,
      showViewToggle: true
    }
  },

  // Main documents grid view
  [DOCUMENTS_COMPONENTS.GRID]: {
    enabled: true,
    showForEmpty: false,
    showForPopulated: true,
    order: 4,
    props: {
      defaultView: VIEW_MODES.GRID,
      showActions: true,
      enableSelection: true
    }
  },

  // Alternative table view
  [DOCUMENTS_COMPONENTS.TABLE]: {
    enabled: false, // Disabled by default, user can toggle
    showForEmpty: false,
    showForPopulated: true,
    order: 4, // Same order as grid (mutually exclusive)
    props: {
      showActions: true,
      enableSelection: true,
      compactMode: false
    }
  },

  // Pagination for large document lists
  [DOCUMENTS_COMPONENTS.PAGINATION]: {
    enabled: true,
    showForEmpty: false,
    showForPopulated: true,
    order: 5,
    props: {
      showPageInfo: true,
      showJumpToPage: true
    }
  },

  // Upload CTA for when users have documents but want to add more
  [DOCUMENTS_COMPONENTS.UPLOAD_CTA]: {
    enabled: true,
    showForEmpty: false,
    showForPopulated: true,
    order: 6,
    props: {
      compact: true,
      showLimits: true
    }
  },

  // Empty state when no documents exist
  [DOCUMENTS_COMPONENTS.EMPTY_STATE]: {
    enabled: true,
    showForEmpty: true,
    showForPopulated: false,
    order: 3, // Replace toolbar when empty
    props: {
      showUploadButton: true,
      showSamples: true,
      showTutorial: true
    }
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get enabled components for current state and subscription
 * @param {boolean} hasDocuments - Whether user has documents
 * @param {string} userPlan - User's subscription plan
 * @param {string} viewMode - Current view mode (grid/table)
 * @returns {Array} Sorted array of enabled components
 */
export const getEnabledDocumentsComponents = (hasDocuments, userPlan = 'free', viewMode = VIEW_MODES.GRID) => {
  const planLimits = SUBSCRIPTION_LIMITS[userPlan] || SUBSCRIPTION_LIMITS.free
  
  return Object.entries(documentsPageConfig)
    .filter(([key, config]) => {
      // Check if component is enabled
      if (!config.enabled) return false
      
      // Check view mode specific components
      if (key === DOCUMENTS_COMPONENTS.GRID && viewMode !== VIEW_MODES.GRID) return false
      if (key === DOCUMENTS_COMPONENTS.TABLE && viewMode !== VIEW_MODES.TABLE) return false
      
      // Check if component should show for current user state
      if (hasDocuments) {
        return config.showForPopulated
      } else {
        return config.showForEmpty
      }
    })
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key)
}

/**
 * Get subscription limits for user plan
 * @param {string} plan - User's subscription plan
 * @returns {Object} Plan limits and features
 */
export const getDocumentLimits = (plan) => {
  return SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.free
}

/**
 * Check if user can access a feature
 * @param {string} feature - Feature to check
 * @param {string} plan - User's subscription plan
 * @returns {boolean} Whether user can access the feature
 */
export const canAccessFeature = (feature, plan) => {
  const limits = getDocumentLimits(plan)
  return limits.features.includes(feature)
}

/**
 * Get pagination settings for user plan
 * @param {string} plan - User's subscription plan
 * @returns {Object} Pagination settings
 */
export const getPaginationSettings = (plan) => {
  const limits = getDocumentLimits(plan)
  return {
    defaultPageSize: Math.min(limits.documentsPerPage, 20),
    maxPageSize: limits.documentsPerPage,
    pageSizeOptions: [10, 20, 50, 100].filter(size => size <= limits.documentsPerPage)
  }
}

/**
 * Check if user has reached upload limit
 * @param {string} plan - User's subscription plan
 * @param {number} currentCount - Current document count
 * @returns {boolean} Whether user has reached limit
 */
export const hasReachedUploadLimit = (plan, currentCount) => {
  const limits = getDocumentLimits(plan)
  if (limits.documentsLimit === -1) return false // Unlimited
  return currentCount >= limits.documentsLimit
}

/**
 * Get available sort options for user plan
 * @param {string} plan - User's subscription plan
 * @returns {Array} Available sort options
 */
export const getAvailableSortOptions = (plan) => {
  const hasAdvancedSort = canAccessFeature('advanced_sort', plan)
  
  if (hasAdvancedSort) {
    return Object.values(SORT_OPTIONS)
  } else {
    // Basic plans get basic sorting only
    return [
      SORT_OPTIONS.NEWEST,
      SORT_OPTIONS.OLDEST,
      SORT_OPTIONS.NAME_AZ
    ]
  }
}

/**
 * Get available filter options for user plan
 * @param {string} plan - User's subscription plan
 * @returns {Object} Available filter options
 */
export const getAvailableFilterOptions = (plan) => {
  const filters = {
    status: FILTER_OPTIONS.STATUS
  }
  
  if (canAccessFeature('category_filter', plan)) {
    filters.category = FILTER_OPTIONS.CATEGORY
  }
  
  if (canAccessFeature('all_filters', plan)) {
    filters.difficulty = FILTER_OPTIONS.DIFFICULTY
  }
  
  return filters
}