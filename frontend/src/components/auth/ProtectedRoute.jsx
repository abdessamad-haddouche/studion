/**
 * Protected Route Component
 * @description Wrapper component that protects routes requiring authentication
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated)
  
  // For now, let's allow access (you'll implement real auth later)
  // Replace this with real authentication check
  const isLoggedIn = isAuthenticated || localStorage.getItem('token')

  if (!isLoggedIn) {
    // Redirect to login with current location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute