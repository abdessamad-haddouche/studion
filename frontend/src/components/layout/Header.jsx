/**
 * PATH: src/components/layout/Header.jsx
 * Premium Header Component for Studion
 */

import React, { useState } from 'react'
import { Menu, X, ChevronDown, BookOpen, Brain, Trophy, Sparkles } from 'lucide-react'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3 group">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="/dashboard" 
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1"
            >
              <BookOpen className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            
            <a 
              href="/documents" 
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Documents
            </a>
            
            <a 
              href="/quizzes" 
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Quizzes
            </a>

            {/* Courses Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsCoursesDropdownOpen(true)}
                onMouseLeave={() => setIsCoursesDropdownOpen(false)}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1"
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

            <a 
              href="/points" 
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1"
            >
              <Trophy className="w-4 h-4" />
              <span>Rewards</span>
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* User Points Display (when logged in) */}
            <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">1,250 pts</span>
            </div>

            {/* Login/Register Buttons */}
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
              <a href="/dashboard" className="text-slate-600 hover:text-blue-600 font-medium py-2">
                Dashboard
              </a>
              <a href="/documents" className="text-slate-600 hover:text-blue-600 font-medium py-2">
                Documents
              </a>
              <a href="/quizzes" className="text-slate-600 hover:text-blue-600 font-medium py-2">
                Quizzes
              </a>
              <a href="/courses" className="text-slate-600 hover:text-blue-600 font-medium py-2">
                Courses
              </a>
              <a href="/points" className="text-slate-600 hover:text-blue-600 font-medium py-2">
                Rewards
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
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header