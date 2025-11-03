/**
 * PATH: src/App.jsx
 * Studion App - Main Component
 */

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Pages
import HomePage from './pages/HomePage'
import DashboardPage from './pages/dashboard/DashboardPage'

const App = () => {
  return (
    <Router>
      <div className="App min-h-screen">
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App