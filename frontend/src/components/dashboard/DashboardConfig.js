/**
 * PATH: src/components/dashboard/DashboardConfig.js
 * Dashboard Configuration - Control which components to show
 */

export const DASHBOARD_COMPONENTS = {
  WELCOME_HEADER: 'welcome_header',
  USER_STATS: 'user_stats', 
  USAGE_INDICATOR: 'usage_indicator', // ✅ ADD THIS
  UPLOAD_CTA: 'upload_cta',
  DOCUMENTS_GRID: 'documents_grid',
  QUICK_ACTIONS: 'quick_actions',
  RECENT_ACTIVITY: 'recent_activity'
}

// Dashboard configuration - easily enable/disable components
export const dashboardConfig = {
  // Core components (always visible based on user state)
  [DASHBOARD_COMPONENTS.WELCOME_HEADER]: {
    enabled: true,
    showForEmpty: true,
    showForPopulated: true,
    order: 1
  },
  
  [DASHBOARD_COMPONENTS.USER_STATS]: {
    enabled: false,
    showForEmpty: false,
    showForPopulated: true,
    order: 2
  },
  
  // ✅ ADD THIS
  [DASHBOARD_COMPONENTS.USAGE_INDICATOR]: {
    enabled: true,
    showForEmpty: true,
    showForPopulated: true,
    order: 3
  },
  
  [DASHBOARD_COMPONENTS.UPLOAD_CTA]: {
    enabled: true,
    showForEmpty: true,
    showForPopulated: true,
    order: 4
  },
  
  [DASHBOARD_COMPONENTS.DOCUMENTS_GRID]: {
    enabled: true,
    showForEmpty: false,
    showForPopulated: true,
    order: 5
  },
  
  [DASHBOARD_COMPONENTS.QUICK_ACTIONS]: {
    enabled: true,
    showForEmpty: true,
    showForPopulated: true,
    order: 6
  },
  
  [DASHBOARD_COMPONENTS.RECENT_ACTIVITY]: {
    enabled: false, // Example: disabled component
    showForEmpty: false,
    showForPopulated: true,
    order: 7
  }
}

/**
 * Get enabled components for current state
 * @param {boolean} hasDocuments - Whether user has documents
 * @returns {Array} Sorted array of enabled components
 */
export const getEnabledComponents = (hasDocuments) => {
  return Object.entries(dashboardConfig)
    .filter(([key, config]) => {
      if (!config.enabled) return false
      if (hasDocuments) return config.showForPopulated
      return config.showForEmpty
    })
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key)
}