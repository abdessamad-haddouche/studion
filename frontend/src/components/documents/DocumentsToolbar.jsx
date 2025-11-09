/**
 * PATH: src/components/documents/DocumentsToolbar.jsx
 * COMPLETELY FIXED - NO MORE INFINITE LOOPS
 * 
 * ✅ SOLUTION: Removed all useEffect dependencies and automatic triggers
 * ✅ SOLUTION: Direct function calls only when user explicitly interacts
 */

import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Grid3X3,
  List,
  X,
  ChevronDown,
  Check,
  Trash2,
  Download
} from 'lucide-react'
import Button from '../ui/Button'
import { 
  VIEW_MODES,
  FILTER_OPTIONS,
  getAvailableSortOptions,
  getAvailableFilterOptions,
  canAccessFeature
} from './DocumentsPageConfig'

const DocumentsToolbar = ({
  currentPlan,
  viewMode,
  onViewModeChange,
  onFilterChange,
  onSortChange,
  selectedCount = 0,
  onBulkAction,
  className = ''
}) => {
  // ✅ FIXED: Local state that NEVER gets reset from outside
  const [searchInput, setSearchInput] = useState('') // ✅ SEPARATE from any external state
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    category: null,
    difficulty: null
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [searchTimeoutId, setSearchTimeoutId] = useState(null)

  // Get available options based on subscription
  const availableSortOptions = getAvailableSortOptions(currentPlan)
  const availableFilters = getAvailableFilterOptions(currentPlan)
  const hasAdvancedSearch = canAccessFeature('advanced_search', currentPlan)
  const canBulkActions = canAccessFeature('bulk_actions', currentPlan)

  // ✅ FIXED: Direct filter building function
  const buildFilters = (searchValue, filters) => {
    const finalFilters = { ...filters }
    
    // ✅ CRITICAL: Only add search filter if there's actual text
    const trimmedSearch = searchValue ? searchValue.trim() : ''
    if (trimmedSearch) {
      finalFilters.search = trimmedSearch
    } else {
      // ✅ IMPORTANT: Remove search completely when empty to show ALL documents
      delete finalFilters.search
    }
    
    // Remove null/undefined values
    Object.keys(finalFilters).forEach(key => {
      if (finalFilters[key] === null || finalFilters[key] === undefined) {
        delete finalFilters[key]
      }
    })
    
    console.log('🔧 buildFilters:', { searchValue, trimmedSearch, finalFilters })
    return finalFilters
  }

  // ✅ FIXED: Search handling that PRESERVES input text and removes blink
  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value) // ✅ ALWAYS keep what user types in the input
    
    // Clear any existing timeout to prevent multiple calls
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId)
    }
    
    // ✅ REMOVED BLINK: No immediate state changes, just debounced API call
    const newTimeoutId = setTimeout(() => {
      const finalFilters = buildFilters(value, activeFilters)
      console.log('🔍 Search API call:', value, finalFilters)
      onFilterChange(finalFilters)
    }, 200) // ✅ FASTER: 200ms for quicker response
    
    setSearchTimeoutId(newTimeoutId)
  }

  // ✅ FIXED: Clear search - ONLY clears when user explicitly clicks X
  const handleClearSearch = () => {
    console.log('🧹 User clicked clear search')
    setSearchInput('') // ✅ Clear the input
    
    // Clear any pending search
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId)
      setSearchTimeoutId(null)
    }
    
    const finalFilters = buildFilters('', activeFilters)
    console.log('🧹 Clearing search, filters:', finalFilters)
    onFilterChange(finalFilters)
  }

  // ✅ FIXED: Filter change preserves search input
  const handleFilterChange = (filterType, value) => {
    const newActiveFilters = {
      ...activeFilters,
      [filterType]: value
    }
    setActiveFilters(newActiveFilters)
    
    // ✅ PRESERVE search input - use current searchInput value
    const finalFilters = buildFilters(searchInput, newActiveFilters)
    console.log('🏷️ Filter changed:', filterType, value, finalFilters)
    onFilterChange(finalFilters)
  }

  // ✅ FIXED: Sort change without loops
  const handleSortSelect = (option) => {
    setSortBy(option.field)
    setSortOrder(option.order)
    setShowSortMenu(false)
    console.log('📊 Sort changed:', option)
    onSortChange(option.field, option.order)
  }

  // ✅ FIXED: Clear search - clears input AND returns to all documents
  const clearSearch = () => {
    console.log('🧹 Clearing search input and returning to all documents')
    setSearchQuery('') // ✅ Clear the input field
    const finalFilters = buildFilters('', activeFilters) // ✅ Build filters without search
    console.log('🧹 Search cleared, filters:', finalFilters)
    onFilterChange(finalFilters) // ✅ This will fetch ALL documents
  }

  // ✅ FIXED: Clear all - clears everything including search input
  const handleClearAllFilters = () => {
    console.log('🧹 Clearing everything')
    setSearchInput('') // ✅ Clear search input
    setActiveFilters({
      status: null,
      category: null,
      difficulty: null
    })
    
    // Clear any pending search
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId)
      setSearchTimeoutId(null)
    }
    
    console.log('🧹 All cleared, fetching all documents')
    onFilterChange({}) // ✅ Empty filters = all documents
  }

  // Active filters detection
  const hasActiveFilters = searchInput.trim() || Object.values(activeFilters).some(value => value !== null)

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      
      {/* Main Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left: Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={hasAdvancedSearch ? "Search documents by title, content, or category..." : "Search documents..."}
              value={searchInput}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Filters and Sort */}
        <div className="flex items-center space-x-3">
          
          {/* Filters Button */}
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 ${hasActiveFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(activeFilters).filter(v => v !== null).length + (searchInput.trim() ? 1 : 0)}
                </span>
              )}
            </Button>

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                <div className="p-4 space-y-4">
                  
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={activeFilters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value || null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(availableFilters.status).map(option => (
                        <option key={option.value || 'all'} value={option.value || ''}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  {availableFilters.category && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category
                      </label>
                      <select
                        value={activeFilters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.values(availableFilters.category).map(option => (
                          <option key={option.value || 'all'} value={option.value || ''}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Difficulty Filter */}
                  {availableFilters.difficulty && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={activeFilters.difficulty || ''}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.values(availableFilters.difficulty).map(option => (
                          <option key={option.value || 'all'} value={option.value || ''}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="pt-2 border-t border-slate-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Clear All Filters</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sort Button */}
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center space-x-2"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              <span className="hidden sm:inline">Sort</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* Sort Dropdown */}
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                <div className="p-2">
                  {availableSortOptions.map(option => (
                    <button
                      key={`${option.field}-${option.order}`}
                      onClick={() => handleSortSelect(option)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between ${
                        sortBy === option.field && sortOrder === option.order ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.field && sortOrder === option.order && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange(VIEW_MODES.GRID)}
              className={`p-2 rounded-md transition-colors ${
                viewMode === VIEW_MODES.GRID 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange(VIEW_MODES.TABLE)}
              className={`p-2 rounded-md transition-colors ${
                viewMode === VIEW_MODES.TABLE 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && canBulkActions && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-700">
                {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onBulkAction('download')}
                  className="flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onBulkAction('delete')}
                  className="flex items-center space-x-1 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkAction('clear_selection')}
              className="text-slate-500"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="text-sm text-slate-500">Active filters:</span>
            
            {/* Search Filter Badge */}
            {searchInput.trim() && (
              <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                <span>Search: "{searchInput.trim()}"</span>
                <button 
                  onClick={handleClearSearch}
                  className="hover:text-blue-600"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {/* Other Filter Badges */}
            {Object.entries(activeFilters).map(([key, value]) => {
              if (!value) return null
              
              const filterOption = availableFilters[key]
              const option = Object.values(filterOption).find(opt => opt.value === value)
              
              return (
                <span 
                  key={key}
                  className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full"
                >
                  <span>{key}: {option?.label}</span>
                  <button 
                    onClick={() => handleFilterChange(key, null)}
                    className="hover:text-slate-500"
                    title={`Clear ${key} filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
            
            {/* Clear All Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-slate-500 text-xs ml-2"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Plan Limitations Notice */}
      {!hasAdvancedSearch && searchInput.trim() && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            🔍 Upgrade to Premium for advanced search across document content and metadata.
            <button 
              onClick={() => window.location.href = '/pricing'}
              className="ml-1 underline hover:no-underline"
            >
              Learn more
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

export default DocumentsToolbar