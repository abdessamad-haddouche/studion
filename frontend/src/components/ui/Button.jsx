/**
 * Premium Button Component
 * @description Beautiful, accessible button with multiple variants
 */

import React from 'react'
import { clsx } from 'clsx'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-indigo-600 text-white
      hover:from-blue-700 hover:to-indigo-700
      focus:ring-blue-500 shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-white text-slate-700 border-2 border-slate-200
      hover:border-slate-300 hover:bg-slate-50
      focus:ring-slate-500 shadow-sm hover:shadow-md
    `,
    success: `
      bg-gradient-to-r from-emerald-500 to-green-600 text-white
      hover:from-emerald-600 hover:to-green-700
      focus:ring-emerald-500 shadow-lg hover:shadow-xl
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-600 text-white
      hover:from-red-600 hover:to-pink-700
      focus:ring-red-500 shadow-lg hover:shadow-xl
    `,
    ghost: `
      text-slate-600 hover:text-slate-900 hover:bg-slate-100
      focus:ring-slate-500
    `,
    premium: `
      bg-gradient-to-r from-purple-600 to-pink-600 text-white
      hover:from-purple-700 hover:to-pink-700
      focus:ring-purple-500 shadow-lg hover:shadow-xl
      transform hover:scale-105
    `
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

export default Button