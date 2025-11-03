/**
 * PATH: src/pages/auth/LoginPage.jsx
 * Clean Login Page without demo account
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Brain, ArrowRight, AlertCircle } from 'lucide-react'

// Components
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

// Redux
import { loginUser, clearError, clearSuccess } from '../../store/slices/authSlice'

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please provide a valid email address'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
})

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)

  // Redux state
  const { isLoading, error, loginSuccess, isAuthenticated } = useSelector(state => state.auth)

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
  })

  // Handle successful login redirect
  useEffect(() => {
    if (loginSuccess && isAuthenticated) {
      toast.success('Welcome back to Studion! 🎉')
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [loginSuccess, isAuthenticated, navigate, location])

  // Handle registration success message
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message)
      
      // Pre-fill email if coming from registration
      if (location.state?.email) {
        setValue('email', location.state.email)
      }
    }
  }, [location.state, setValue])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearSuccess())
    }
  }, [dispatch])

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap()
      // Success handling is done in useEffect above
    } catch (error) {
      toast.error(error || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-slate-600">
            Sign in to continue your AI learning journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="john.doe@university.edu"
              autoComplete="email"
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
                placeholder="Enter your password"
                autoComplete="current-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              
              {/* Forgot Password Link */}
              <div className="mt-2 text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full"
              disabled={!isValid || isLoading}
              loading={isLoading}
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Create one for free
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-4">Trusted by thousands of learners worldwide</p>
          <div className="flex justify-center space-x-6 text-xs text-slate-400">
            <span>✓ Secure login</span>
            <span>✓ Auto-save progress</span>
            <span>✓ Cross-device sync</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage