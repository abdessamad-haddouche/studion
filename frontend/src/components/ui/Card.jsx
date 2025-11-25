/**
 * Premium Card Component
 * @description card with glass effect and animations
 */

import React from 'react'
import { clsx } from 'clsx'

const Card = ({ 
  children, 
  className = '',
  variant = 'default',
  hover = false,
  gradient = false,
  ...props 
}) => {
  const baseClasses = `
    bg-white backdrop-blur-sm border border-slate-200/50
    rounded-2xl shadow-lg transition-all duration-300
  `

  const variants = {
    default: 'p-6',
    compact: 'p-4',
    spacious: 'p-8',
    glass: `
      bg-white/70 backdrop-blur-md border-white/20
      shadow-xl shadow-slate-200/20
    `,
    premium: `
      bg-gradient-to-br from-white to-slate-50/50
      border-slate-200/30 shadow-2xl shadow-slate-200/30
    `
  }

  const hoverEffects = hover ? `
    hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1
    cursor-pointer
  ` : ''

  const gradientBorder = gradient ? `
    relative before:absolute before:inset-0 before:rounded-2xl
    before:bg-gradient-to-r before:from-blue-500 before:to-purple-600
    before:p-[1px] before:content-['']
    bg-gradient-to-r from-blue-500 to-purple-600 p-[1px]
  ` : ''

  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        hoverEffects,
        gradientBorder,
        className
      )}
      {...props}
    >
      {gradient && (
        <div className="bg-white rounded-2xl p-6 h-full">
          {children}
        </div>
      )}
      {!gradient && children}
    </div>
  )
}

export default Card