/**
 * PATH: src/components/courses/CourseSearch.jsx
 * Course Search Component - Premium search with suggestions
 */

import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Search, X, Clock, TrendingUp, Sparkles } from 'lucide-react'
import {
  selectFilters,
  setFilters,
  fetchCourses,
  selectPagination,
  setSearchTerm
} from '../../store/slices/coursesSlice'

const CourseSearch = ({ className = '' }) => {
  const dispatch = useDispatch()
  const filters = useSelector(selectFilters)
  const pagination = useSelector(selectPagination)
  
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Popular search suggestions
  const popularSearches = [
    'React', 'Python', 'JavaScript', 'Machine Learning', 'UI/UX Design',
    'Digital Marketing', 'Data Science', 'Web Development', 'AI', 'Cybersecurity'
  ]

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studion_recent_searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }, [])

  // Handle search input changes with debouncing
  const handleSearchChange = (value) => {
    setSearchInput(value)
    dispatch(setSearchTerm(value))

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      if (value.trim() !== filters.search) {
        performSearch(value.trim())
      }
    }, 500) // 500ms debounce
  }

  // Perform search
  const performSearch = (searchTerm) => {
    const newFilters = {
      ...filters,
      search: searchTerm
    }

    dispatch(setFilters(newFilters))
    dispatch(fetchCourses({
      ...newFilters,
      page: 1, // Reset to first page
      limit: pagination.limit
    }))

    // Save to recent searches
    if (searchTerm && searchTerm.length > 2) {
      saveToRecentSearches(searchTerm)
    }

    setShowSuggestions(false)
  }

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    performSearch(searchInput.trim())
    searchRef.current?.blur()
  }

  // Save search term to recent searches
  const saveToRecentSearches = (term) => {
    try {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('studion_recent_searches', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving recent search:', error)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (term) => {
    setSearchInput(term)
    performSearch(term)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchInput('')
    dispatch(setSearchTerm(''))
    
    const newFilters = { ...filters, search: '' }
    dispatch(setFilters(newFilters))
    dispatch(fetchCourses({
      ...newFilters,
      page: 1,
      limit: pagination.limit
    }))
  }

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(true)
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          
          <input
            type="text"
            placeholder="Search for courses, instructors, or topics..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={handleFocus}
            className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
          />
          
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X />
            </button>
          )}
        </div>

        {/* Search Button (Mobile) */}
        <button
          type="submit"
          className="md:hidden absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Recent Searches</span>
              </div>
              <div className="space-y-1">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(term)}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Popular Searches</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(term)}
                  className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Search Tips */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">Search Tips</span>
            </div>
            <div className="text-xs text-purple-700 space-y-1">
              <div>• Try searching for specific technologies like "React" or "Python"</div>
              <div>• Use instructor names to find courses by specific teachers</div>
              <div>• Search for topics like "machine learning" or "web design"</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Search Indicator */}
      {filters.search && (
        <div className="mt-3">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            <span>Searching for: "{filters.search}"</span>
            <button
              onClick={handleClearSearch}
              className="hover:text-blue-900"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseSearch