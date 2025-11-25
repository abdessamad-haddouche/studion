/**
 * PATH: src/pages/auth/RegisterPage.jsx
 * Enhanced Register Page with Redux integration
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Brain, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

// Components
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

// Redux
import { registerUser, clearError, clearSuccess } from '../../store/slices/authSlice'

// Validation schema matching your backend
const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Please provide a valid email address')
    .min(5, 'Email is too short')
    .max(320, 'Email is too long'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
  
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  
  academicLevel: yup
    .string()
    .required('Academic level is required')
    .oneOf(['high_school', 'undergraduate', 'graduate', 'professional'], 'Invalid academic level'),
  
  institution: yup
    .string()
    .max(100, 'Institution name is too long')
    .nullable(),
  
  fieldOfStudy: yup
    .string()
    .max(100, 'Field of study is too long')
    .nullable(),
  
  terms: yup
    .boolean()
    .required('You must accept the terms and conditions')
    .oneOf([true], 'You must accept the terms and conditions')
})

const RegisterPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redux state
  const { isLoading, error, registerSuccess } = useSelector(state => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange'
  })

  const password = watch('password')

  // Handle successful registration
  useEffect(() => {
    if (registerSuccess) {
      toast.success('Account created successfully! Please log in to continue.')
      
      // Navigate to login with user email
      const formData = watch()
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in.',
          email: formData.email 
        }
      })
    }
  }, [registerSuccess, navigate, watch])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearSuccess())
    }
  }, [dispatch])

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[@$!%*?&]/.test(password)) score++

    const levels = {
      0: { label: '', color: 'bg-gray-200' },
      1: { label: 'Very Weak', color: 'bg-red-500' },
      2: { label: 'Weak', color: 'bg-orange-500' },
      3: { label: 'Fair', color: 'bg-yellow-500' },
      4: { label: 'Good', color: 'bg-blue-500' },
      5: { label: 'Strong', color: 'bg-green-500' }
    }

    return { score, ...levels[score] }
  }

  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async (data) => {
    try {
      // Prepare data for backend (matching your controller expectations)
      const userData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        academicLevel: data.academicLevel,
        institution: data.institution || undefined,
        fieldOfStudy: data.fieldOfStudy || undefined,
        source: 'web'
      }

      await dispatch(registerUser(userData)).unwrap()
      // Success handling is done in useEffect above
    } catch (error) {
      toast.error(error || 'Registration failed. Please try again.')
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
            Join Studion
          </h2>
          <p className="mt-2 text-slate-600">
            Transform your learning with AI-powered tools
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="First Name"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  placeholder="John"
                />
              </div>
              <div>
                <Input
                  label="Last Name"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="john.doe@university.edu"
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
                placeholder="Create a strong password"
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Confirm your password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            {/* Academic Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Academic Level
              </label>
              <select
                {...register('academicLevel')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Select your academic level</option>
                <option value="high_school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="professional">Professional</option>
              </select>
              {errors.academicLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.academicLevel.message}</p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <Input
                label="Institution (Optional)"
                {...register('institution')}
                error={errors.institution?.message}
                placeholder="University of Example"
              />
              
              <Input
                label="Field of Study (Optional)"
                {...register('fieldOfStudy')}
                error={errors.fieldOfStudy?.message}
                placeholder="Computer Science, Biology, etc."
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                {...register('terms')}
                className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-slate-600">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

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
              <span>Create Account</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-4">Join thousands of learners using AI to accelerate their education</p>
          <div className="flex justify-center space-x-6 text-xs text-slate-400">
            <span>✓ Free to start</span>
            <span>✓ AI-powered quizzes</span>
            <span>✓ Smart analytics</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage