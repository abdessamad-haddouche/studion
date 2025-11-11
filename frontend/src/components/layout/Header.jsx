/**
 * PATH: src/components/layout/Header.jsx
 * FIXED Header - Courses Dropdown Hover Issue Resolved
 */

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, BookOpen, Brain, Trophy, Sparkles, User, LogOut, Settings, GraduationCap } from 'lucide-react'
import { logoutUser, fetchUserStats, getCurrentUser } from '../../store/slices/authSlice'
import { selectStats } from '../../store/slices/userStatsSlice'
import { selectCurrentPlan } from '../../store/slices/subscriptionSlice'
import toast from 'react-hot-toast'

// Helper function to handle different user object formats with proper capitalization
const getUserDisplayInfo = (user) => {
  if (!user) return { name: 'User', initials: 'U', fullName: 'User' }
  
  let firstName = ''
  let lastName = ''
  let fullName = ''
  let initials = 'U'
  
  const capitalize = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
  
  // Handle different user object structures
  if (user.fullName) {
    fullName = user.fullName
    const names = fullName.split(' ')
    firstName = capitalize(names[0] || '')
    lastName = capitalize(names[names.length - 1] || '')
    fullName = names.map(name => capitalize(name)).join(' ')
    initials = (firstName.charAt(0) + (lastName.charAt(0) || '')).toUpperCase()
  }
  else if (user.name?.first) {
    firstName = capitalize(user.name.first)
    lastName = capitalize(user.name.last || '')
    fullName = `${firstName} ${lastName}`.trim()
    initials = (firstName.charAt(0) + (lastName.charAt(0) || '')).toUpperCase()
  }
  else if (user.firstName) {
    firstName = capitalize(user.firstName)
    lastName = capitalize(user.lastName || '')
    fullName = `${firstName} ${lastName}`.trim()
    initials = (firstName.charAt(0) + (lastName.charAt(0) || '')).toUpperCase()
  }
  else if (user.username) {
    fullName = capitalize(user.username)
    initials = user.username.charAt(0).toUpperCase()
  }
  else if (user.email) {
    const emailName = user.email.split('@')[0]
    fullName = capitalize(emailName)
    initials = emailName.charAt(0).toUpperCase()
  }
  
  return {
    firstName,
    lastName,
    fullName: fullName || 'User',
    initials: initials || 'U'
  }
}

// Helper function to format plan name for display
const formatPlanName = (plan) => {
  if (!plan) return 'Free'
  
  const planNames = {
    free: 'Free',
    basic: 'Basic',
    premium: 'Premium', 
    pro: 'Pro',
    enterprise: 'Enterprise'
  }
  
  return planNames[plan] || plan.charAt(0).toUpperCase() + plan.slice(1)
}

// Helper function to get plan styling
const getPlanStyling = (plan) => {
  const planStyles = {
    free: 'text-slate-600',
    basic: 'text-blue-600',
    premium: 'text-purple-600',
    pro: 'text-green-600', 
    enterprise: 'text-orange-600'
  }
  
  return planStyles[plan] || planStyles.free
}

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  // Auth state from Redux
  const { isAuthenticated, user } = useSelector(state => state.auth)
  
  // Get current subscription plan from Redux
  const currentPlan = useSelector(selectCurrentPlan)
  const planDisplayName = formatPlanName(currentPlan)
  const planColor = getPlanStyling(currentPlan)
  
  // Get real-time stats from Redux (consistent across all pages)
  const authStats = useSelector(state => state.auth.userStats)
  const userStatsSliceStats = useSelector(selectStats)
  
  // Merge stats from both sources (most recent wins)
  const liveStats = {
    totalPoints: 0,
    quizzesCompleted: 0,
    bestScore: 0,
    ...authStats,
    ...userStatsSliceStats
  }

  // ✅ FIX: Add timeout to prevent dropdown from closing immediately
  const [coursesDropdownTimeout, setCoursesDropdownTimeout] = useState(null)

  const handleCoursesMouseEnter = () => {
    if (coursesDropdownTimeout) {
      clearTimeout(coursesDropdownTimeout)
    }
    setIsCoursesDropdownOpen(true)
  }

  const handleCoursesMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsCoursesDropdownOpen(false)
    }, 150) // 150ms delay before closing
    setCoursesDropdownTimeout(timeout)
  }

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserStats())
    }
  }, [dispatch, isAuthenticated, location.pathname])

  // ✅ Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (coursesDropdownTimeout) {
        clearTimeout(coursesDropdownTimeout)
      }
    }
  }, [coursesDropdownTimeout])

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
      <nav className="hidden md:flex items-center space-x-8">
        <a 
          href="/courses" 
          className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          Courses
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

        {/* ✅ FIXED: Courses Dropdown with proper hover handling */}
        <div 
          className="relative"
          onMouseEnter={handleCoursesMouseEnter}
          onMouseLeave={handleCoursesMouseLeave}
        >
          <button
            className={`font-medium transition-colors flex items-center space-x-1 ${
              location.pathname.startsWith('/courses') || location.pathname.startsWith('/my-courses')
                ? 'text-blue-600' 
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            <span>Courses</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isCoursesDropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-3 z-50"
            >
              {/* All Courses */}
              <a 
                href="/courses" 
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                onClick={() => setIsCoursesDropdownOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">All Courses</div>
                    <div className="text-xs text-slate-500">Browse course marketplace</div>
                  </div>
                </div>
              </a>
              
              {/* My Courses */}
              <a 
                href="/my-courses" 
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                onClick={() => setIsCoursesDropdownOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">My Courses</div>
                    <div className="text-xs text-slate-500">Your purchased courses</div>
                  </div>
                </div>
              </a>
              
              <div className="border-t border-slate-200 my-2"></div>
              
              {/* Categories */}
              <a 
                href="/courses/categories" 
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                onClick={() => setIsCoursesDropdownOpen(false)}
              >
                <div className="font-medium text-sm">Browse Categories</div>
                <div className="text-xs text-slate-500">Programming, Design, Business & more</div>
              </a>
            </div>
          )}
        </div>
      </nav>

      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">
            {liveStats.totalPoints || 0} pts
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserDisplayInfo(user).initials}
              </span>
            </div>
            
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">
                {getUserDisplayInfo(user).fullName}
              </p>
              <p className={`text-xs font-medium ${planColor}`}>
                {planDisplayName} Plan
              </p>
            </div>
            
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-900">
                  {getUserDisplayInfo(user).fullName}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Points: {liveStats.totalPoints}</span>
                  <span className={`font-medium ${planColor}`}>
                    {planDisplayName}
                  </span>
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
              
              {currentPlan === 'free' ? (
                <a href="/subscription" className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors border-l-4 border-purple-600 bg-purple-50/30">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Upgrade Plan</span>
                </a>
              ) : (
                <a href="/subscription" className={`flex items-center space-x-2 px-4 py-2 hover:bg-gradient-to-r transition-colors border-l-4 bg-opacity-20 font-medium ${
                  currentPlan === 'basic' ? 'text-blue-700 hover:from-blue-50 hover:to-blue-100 border-blue-600 bg-blue-50' :
                  currentPlan === 'premium' ? 'text-purple-700 hover:from-purple-50 hover:to-purple-100 border-purple-600 bg-purple-50' :
                  currentPlan === 'pro' ? 'text-green-700 hover:from-green-50 hover:to-green-100 border-green-600 bg-green-50' :
                  currentPlan === 'enterprise' ? 'text-orange-700 hover:from-orange-50 hover:to-orange-100 border-orange-600 bg-orange-50' :
                  'text-slate-700 hover:from-slate-50 hover:to-slate-100 border-slate-600 bg-slate-50'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  <span>Manage Plan</span>
                </a>
              )}
              
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

          {isAuthenticated ? <AuthenticatedNavigation /> : <GuestNavigation />}

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
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {liveStats.totalPoints} pts
                      </span>
                    </div>
                  </div>

                  <a href="/dashboard" className="font-medium py-2 text-slate-600 hover:text-blue-600">Dashboard</a>
                  <a href="/documents" className="font-medium py-2 text-slate-600 hover:text-blue-600">Documents</a>
                  <a href="/courses" className="font-medium py-2 text-slate-600 hover:text-blue-600">All Courses</a>
                  <a href="/my-courses" className="font-medium py-2 text-slate-600 hover:text-blue-600">My Courses</a>
                  
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getUserDisplayInfo(user).initials}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {getUserDisplayInfo(user).fullName}
                        </p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                        <p className={`text-xs font-medium ${planColor}`}>
                          {planDisplayName} Plan
                        </p>
                      </div>
                    </div>
                    
                    <a href="/profile" className="text-slate-600 hover:text-blue-600 font-medium py-2 block">Profile</a>
                    <a href="/settings" className="text-slate-600 hover:text-blue-600 font-medium py-2 block">Settings</a>
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
                  <a href="/courses" className="text-slate-600 hover:text-blue-600 font-medium py-2">Courses</a>
                  <a href="/pricing" className="text-slate-600 hover:text-blue-600 font-medium py-2">Pricing</a>
                  <a href="/about" className="text-slate-600 hover:text-blue-600 font-medium py-2">About</a>
                  
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex flex-col space-y-2">
                      <a href="/login" className="text-slate-600 hover:text-slate-900 font-medium py-2">Login</a>
                      <a href="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-center">Get Started</a>
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