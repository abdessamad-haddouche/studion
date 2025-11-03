/**
 * PATH: src/pages/HomePage.jsx
 * HomePage with Header and Footer
 */

import React from 'react'
import Layout from '../components/layout/Layout'
import { ArrowRight, PlayCircle, Star, Users, BookOpen, Brain } from 'lucide-react'

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-slate-700">Trusted by 50,000+ learners</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Master Any Subject with
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Learning
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload documents, get instant AI analysis, generate smart quizzes, and track your progress. 
              Transform any content into personalized learning experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Start Learning Free</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <button className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center space-x-2">
                <PlayCircle className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">500K+</div>
                <div className="text-sm text-slate-600">Documents Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">2M+</div>
                <div className="text-sm text-slate-600">Quizzes Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">50K+</div>
                <div className="text-sm text-slate-600">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">95%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Learn Smarter
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our AI-powered platform adapts to your learning style and helps you master any subject faster.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Document Analysis */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Smart Document Analysis</h3>
              <p className="text-slate-600 mb-4">
                Upload PDFs, Word docs, or any text and get instant AI-powered summaries, key insights, and learning objectives.
              </p>
              <div className="flex items-center text-blue-600 font-medium text-sm">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Quiz Generation */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">AI Quiz Generation</h3>
              <p className="text-slate-600 mb-4">
                Automatically generate multiple choice, true/false, fill-in-the-blank, and short answer quizzes from any content.
              </p>
              <div className="flex items-center text-green-600 font-medium text-sm">
                <span>Try it now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Progress Tracking */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Smart Analytics</h3>
              <p className="text-slate-600 mb-4">
                Track your progress, identify strengths and weaknesses, and get personalized recommendations for improvement.
              </p>
              <div className="flex items-center text-purple-600 font-medium text-sm">
                <span>View analytics</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners using AI to accelerate their education. Start free today.
          </p>
          <a 
            href="/register"
            className="inline-flex items-center space-x-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transform hover:scale-105 transition-all shadow-lg"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </Layout>
  )
}

export default HomePage