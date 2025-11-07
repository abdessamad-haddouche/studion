/**
 * PATH: src/components/layout/Footer.jsx
 * Premium Footer Component for Studion
 */

import React from 'react'
import { 
  Brain, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Github, 
  Linkedin,
  Heart,
  Sparkles,
  BookOpen,
  Trophy,
  Users,
  Shield
} from 'lucide-react'
import NewsLetter from './NewsLetter'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Studion
                </h3>
                <p className="text-xs text-slate-400">AI Learning Platform</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Transform your learning experience with AI-powered document analysis, 
              smart quiz generation, and premium courses from top creators worldwide.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Mail className="w-4 h-4" />
                <span>hello@studion.ai</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Platform</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/documents" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Document Analysis
                </a>
              </li>
              <li>
                <a href="/quizzes" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  AI Quiz Generator
                </a>
              </li>
              <li>
                <a href="/courses" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Course Marketplace
                </a>
              </li>
              <li>
                <a href="/analytics" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Learning Analytics
                </a>
              </li>
              <li>
                <a href="/points" className="text-slate-300 hover:text-blue-400 transition-colors text-sm flex items-center space-x-1">
                  <Trophy className="w-3 h-3" />
                  <span>Rewards System</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-400" />
              <span>Support</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-slate-300 hover:text-green-400 transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/tutorials" className="text-slate-300 hover:text-green-400 transition-colors text-sm">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="/api-docs" className="text-slate-300 hover:text-green-400 transition-colors text-sm">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="/community" className="text-slate-300 hover:text-green-400 transition-colors text-sm">
                  Community Forum
                </a>
              </li>
              <li>
                <a href="/contact" className="text-slate-300 hover:text-green-400 transition-colors text-sm">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="/feedback" className="text-slate-300 hover:text-green-400 transition-colors text-sm">
                  Send Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Company</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-slate-300 hover:text-purple-400 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-slate-300 hover:text-purple-400 transition-colors text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="/blog" className="text-slate-300 hover:text-purple-400 transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="/press" className="text-slate-300 hover:text-purple-400 transition-colors text-sm">
                  Press Kit
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-slate-300 hover:text-purple-400 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-slate-300 hover:text-purple-400 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>

            {/* Subscription Plans */}
            <div className="mt-6 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
              <h5 className="text-sm font-semibold text-purple-300 flex items-center space-x-1 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Premium Plans</span>
              </h5>
              <p className="text-xs text-slate-300 mb-2">
                Unlock advanced AI features and unlimited access
              </p>
              <a 
                href="/subscription" 
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>

        {/* Social Links & Newsletter */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">Follow us:</span>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className="flex items-center space-x-3">
              <NewsLetter />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-sm text-slate-400">
              © 2024 Studion AI Learning Platform. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-sm text-slate-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              <span>for learners worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer