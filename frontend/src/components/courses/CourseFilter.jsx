/**
 * PATH: src/components/courses/CourseFilter.jsx
 * Course Filter Component - Filtering interface
 */

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Filter, X, ChevronDown, DollarSign, Star, BookOpen,
  Crown, Sparkles, RefreshCw, SlidersHorizontal
} from 'lucide-react'
import Button from '../ui/Button'
import {
  selectFilters,
  setFilters,
  clearFilters,
  fetchCourses,
  selectPagination,
  selectUserPoints
} from '../../store/slices/coursesSlice'

const CourseFilter = ({ className = '' }) => {
  const dispatch = useDispatch()
  const filters = useSelector(selectFilters)
  const pagination = useSelector(selectPagination)
  const userPoints = useSelector(selectUserPoints)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Filter options
  const categories = [
    'programming', 'design', 'business', 'marketing',
    'data_science', 'ai_ml', 'cybersecurity', 'web_development',
    'mobile_development', 'game_development', 'other'
  ]

  const levels = ['beginner', 'intermediate', 'advanced', 'expert']

  const sources = ['internal', 'udemy', 'coursera', 'edx', 'skillshare']

  const priceRanges = [
    { label: 'Free', min: 0, max: 0 },
    { label: '$1 - $25', min: 1, max: 25 },
    { label: '$26 - $50', min: 26, max: 50 },
    { label: '$51 - $100', min: 51, max: 100 },
    { label: '$100+', min: 101, max: 1000 }
  ]

  const sortOptions = [
    { value: 'rating.average', label: 'Highest Rated', order: 'desc' },
    { value: 'enrollment.totalStudents', label: 'Most Popular', order: 'desc' },
    { value: 'pricing.currentPrice', label: 'Price: Low to High', order: 'asc' },
    { value: 'pricing.currentPrice', label: 'Price: High to Low', order: 'desc' },
    { value: 'createdAt', label: 'Newest First', order: 'desc' },
    { value: 'title', label: 'A to Z', order: 'asc' }
  ]

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    
    dispatch(setFilters(newFilters))
    
    // Auto-fetch with new filters
    dispatch(fetchCourses({
      ...newFilters,
      page: 1, // Reset to first page
      limit: pagination.limit
    }))
  }

  const handlePriceRangeChange = (range) => {
    const newFilters = {
      ...filters,
      minPrice: range.min,
      maxPrice: range.max === 1000 ? null : range.max
    }
    
    dispatch(setFilters(newFilters))
    dispatch(fetchCourses({
      ...newFilters,
      page: 1,
      limit: pagination.limit
    }))
  }

  const handleSortChange = (sortOption) => {
    const newFilters = {
      ...filters,
      sortBy: sortOption.value,
      sortOrder: sortOption.order
    }
    
    dispatch(setFilters(newFilters))
    dispatch(fetchCourses({
      ...newFilters,
      page: pagination.page,
      limit: pagination.limit
    }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
    dispatch(fetchCourses({
      page: 1,
      limit: pagination.limit
    }))
  }

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.category || filters.level || filters.source || 
           filters.isFree !== null || filters.minPrice !== null || 
           filters.maxPrice !== null || filters.minRating !== null
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.level) count++
    if (filters.source) count++
    if (filters.isFree !== null) count++
    if (filters.minPrice !== null || filters.maxPrice !== null) count++
    if (filters.minRating !== null) count++
    return count
  }

  const getCurrentSortLabel = () => {
    const current = sortOptions.find(opt => 
      opt.value === filters.sortBy && opt.order === filters.sortOrder
    )
    return current?.label || 'Highest Rated'
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${className}`}>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-slate-900">Filters</h3>
            {hasActiveFilters() && (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showMobileFilters ? 'Hide' : 'Show'} Filters</span>
          </Button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`p-4 space-y-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.isFree === true ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleFilterChange('isFree', filters.isFree === true ? null : true)}
            className="flex items-center space-x-1"
          >
            <BookOpen className="w-3 h-3" />
            <span>Free Courses</span>
          </Button>
          
          {userPoints > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange('pointsDiscount', true)}
              className="flex items-center space-x-1 text-purple-600 border-purple-200"
            >
              <Sparkles className="w-3 h-3" />
              <span>Points Discount</span>
            </Button>
          )}
          
          <Button
            variant={filters.source === 'internal' ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleFilterChange('source', filters.source === 'internal' ? null : 'internal')}
            className="flex items-center space-x-1"
          >
            <Crown className="w-3 h-3" />
            <span>Studion Courses</span>
          </Button>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', filters.category === category ? null : category)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.category === category
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">Difficulty Level</label>
          <div className="flex flex-wrap gap-2">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => handleFilterChange('level', filters.level === level ? null : level)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filters.level === level
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">Price Range</label>
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <button
                key={index}
                onClick={() => handlePriceRangeChange(range)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  (filters.minPrice === range.min && 
                   (filters.maxPrice === range.max || (range.max === 1000 && filters.maxPrice === null)))
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{range.label}</span>
                  {range.label === 'Free' && <BookOpen className="w-4 h-4 text-green-600" />}
                  {range.label !== 'Free' && <DollarSign className="w-4 h-4 text-slate-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">Minimum Rating</label>
          <div className="flex space-x-2">
            {[4.5, 4.0, 3.5, 3.0].map(rating => (
              <button
                key={rating}
                onClick={() => handleFilterChange('minRating', filters.minRating === rating ? null : rating)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.minRating === rating
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{rating}+</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">Sort By</label>
          <div className="relative">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                handleSortChange({ value: sortBy, order: sortOrder })
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={`${option.value}-${option.order}`} value={`${option.value}-${option.order}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center space-x-2 text-slate-600"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear All Filters</span>
            </Button>
          </div>
        )}

        {/* Points Balance Display */}
        {userPoints > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Your Points Balance</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {userPoints.toLocaleString()} points
            </div>
            <div className="text-sm text-purple-600">
              Use points to get discounts on courses!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseFilter