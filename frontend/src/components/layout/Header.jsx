/**
 * PATH: src/components/layout/Header.jsx
 * FIXED Header with Consistent Points Display - FULL CODE
 * 
 * ✅ FIXED: Points display now consistent across ALL pages (dashboard, documents, etc.)
 * ✅ FIXED: Real-time stats integration working everywhere
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, BookOpen, Brain, Trophy, Sparkles, User, LogOut, Settings } from 'lucide-react'
import { logoutUser, fetchUserStats } from '../../store/slices/authSlice'
import { selectStats } from '../../store/slices/userStatsSlice'
import toast from 'react-hot-toast'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  // Auth state from Redux
  const { isAuthenticated, user } = useSelector(state => state.auth)
  
  // ✅ FIXED: Get real-time stats from Redux (consistent across all pages)
  const authStats = useSelector(state => state.auth.userStats) // From authSlice
  const userStatsSliceStats = useSelector(selectStats) // From userStatsSlice
  
  // ✅ FIXED: Merge stats from both sources (most recent wins)
  const liveStats = {
    totalPoints: 0,
    quizzesCompleted: 0,
    bestScore: 0,
    // Auth slice stats (lower priority)
    ...authStats,
    // UserStats slice stats (higher priority - most recent)
    ...userStatsSliceStats
  }

  // ✅ FIXED: Auto-refresh stats when header mounts OR when route changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Header: Auto-refreshing stats for route:', location.pathname)
      dispatch(fetchUserStats())
    }
  }, [dispatch, isAuthenticated, location.pathname]) // ✅ Added location.pathname

  // ✅ FIXED: Log stats updates for debugging
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🏆 Header: Stats updated for page', location.pathname, {
        authStats,
        userStatsSliceStats,
        liveStats,
        displayedPoints: liveStats.totalPoints
      })
    }
  }, [authStats, userStatsSliceStats, isAuthenticated, location.pathname])

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  // Guest Header (Not Logged In)
  const GuestNavigation = () => (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        <a 
          href="/features" 
          className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          Features
        </a>
        
        <a 
          href="/pricing" 
          className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          Pricing
        </a>
        
        <a 
          href="/about" 
          className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          About
        </a>
      </nav>

      {/* Auth Buttons */}
      <div className="hidden md:flex items-center space-x-3">
        <a 
          href="/login"
          className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-all"
        >
          Login
        </a>
        <a 
          href="/register"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
        >
          Get Started
        </a>
      </div>
    </>
  )

  // Authenticated Header (Logged In)
  const AuthenticatedNavigation = () => (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        <a 
          href="/dashboard" 
          className={`font-medium transition-colors flex items-center space-x-1 ${
            location.pathname === '/dashboard' 
              ? 'text-blue-600' 
              : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Dashboard</span>
        </a>
        
        <a 
          href="/documents" 
          className={`font-medium transition-colors ${
            location.pathname === '/documents' 
              ? 'text-blue-600' 
              : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          Documents
        </a>
        
        <a 
          href="/quizzes" 
          className={`font-medium transition-colors ${
            location.pathname === '/quizzes' 
              ? 'text-blue-600' 
              : 'text-slate-600 hover:text-blue-600'
          }`}
        >
          Quizzes
        </a>

        {/* Courses Dropdown */}
        <div className="relative">
          <button
            onMouseEnter={() => setIsCoursesDropdownOpen(true)}
            onMouseLeave={() => setIsCoursesDropdownOpen(false)}
            className={`font-medium transition-colors flex items-center space-x-1 ${
              location.pathname.startsWith('/courses') 
                ? 'text-blue-600' 
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            <span>Courses</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isCoursesDropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
              onMouseEnter={() => setIsCoursesDropdownOpen(true)}
              onMouseLeave={() => setIsCoursesDropdownOpen(false)}
            >
              <a href="/courses" className="block px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors">
                Browse All Courses
              </a>
              <a href="/courses/my-courses" className="block px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors">
                My Courses
              </a>
              <a href="/courses/categories" className="block px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors">
                Categories
              </a>
              <div className="border-t border-slate-200 my-2"></div>
              <a href="/subscription" className="block px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Premium Plans</span>
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* User Section */}
      <div className="hidden md:flex items-center space-x-4">
        {/* ✅ FIXED: Consistent Points Display - ALWAYS VISIBLE on ALL pages */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">
            {liveStats.totalPoints || 0} pts
          </span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.initials || user?.name?.first?.charAt(0) || 'U'}
              </span>
            </div>
            
            {/* User Name */}
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">
                {user?.fullName || user?.name?.first || 'User'}
              </p>
              <p className="text-xs text-slate-500">
                {user?.subscription?.tier || 'Free'} Plan
              </p>
            </div>
            
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* User Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-900">
                  {user?.fullName || `${user?.name?.first} ${user?.name?.last}`}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                
                {/* ✅ FIXED: Live stats in dropdown - CONSISTENT everywhere */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Points: {liveStats.totalPoints}</span>
                  <span className="text-slate-500">Best: {liveStats.bestScore}%</span>
                </div>
              </div>
              
              <a href="/profile" className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </a>
              
              <a href="/settings" className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </a>
              
              <a href="/subscription" className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors">
                <Sparkles className="w-4 h-4" />
                <span>Upgrade Plan</span>
              </a>
              
              <div className="border-t border-slate-200 my-2"></div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Studion
                </h1>
                <p className="text-xs text-slate-500 -mt-1">AI Learning Platform</p>
              </div>
            </a>
          </div>

          {/* Conditional Navigation */}
          {isAuthenticated ? <AuthenticatedNavigation /> : <GuestNavigation />}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  {/* ✅ FIXED: Mobile stats display - CONSISTENT everywhere */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {liveStats.totalPoints} pts
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {liveStats.quizzesCompleted} quizzes
                      </span>
                    </div>
                  </div>

                  {/* Authenticated Mobile Menu */}
                  <a href="/dashboard" className={`font-medium py-2 ${
                    location.pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Dashboard
                  </a>
                  <a href="/documents" className={`font-medium py-2 ${
                    location.pathname === '/documents' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Documents
                  </a>
                  <a href="/quizzes" className={`font-medium py-2 ${
                    location.pathname === '/quizzes' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Quizzes
                  </a>
                  <a href="/courses" className={`font-medium py-2 ${
                    location.pathname.startsWith('/courses') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                  }`}>
                    Courses
                  </a>
                  
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.initials || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user?.fullName || 'User'}
                        </p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                    
                    <a href="/profile" className="text-slate-600 hover:text-blue-600 font-medium py-2 block">
                      Profile
                    </a>
                    <a href="/settings" className="text-slate-600 hover:text-blue-600 font-medium py-2 block">
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 font-medium py-2 text-left w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Guest Mobile Menu */}
                  <a href="/features" className="text-slate-600 hover:text-blue-600 font-medium py-2">
                    Features
                  </a>
                  <a href="/pricing" className="text-slate-600 hover:text-blue-600 font-medium py-2">
                    Pricing
                  </a>
                  <a href="/about" className="text-slate-600 hover:text-blue-600 font-medium py-2">
                    About
                  </a>
                  
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex flex-col space-y-2">
                      <a 
                        href="/login"
                        className="text-slate-600 hover:text-slate-900 font-medium py-2"
                      >
                        Login
                      </a>
                      <a 
                        href="/register"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-center"
                      >
                        Get Started
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header