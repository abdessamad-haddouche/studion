/**
 * PATH: src/utils/currency.js
 * Currency utilities for Morocco (MAD)
 */

/**
 * Format price in MAD currency for Morocco market
 * @param {number|string} price - Price to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted price in MAD
 */
export const formatMADPrice = (price, options = {}) => {
  const { 
    showDecimals = false, 
    showCurrency = true,
    billing = null 
  } = options

  // Handle zero/free
  if (price === 0 || price === '0') return 'Free'

  // Extract numeric value from string prices
  let numericPrice = price
  if (typeof price === 'string') {
    numericPrice = parseFloat(price.replace(/[^\d.]/g, '')) || 0
  }

  // Format the number
  const formatted = showDecimals 
    ? numericPrice.toFixed(2)
    : Math.round(numericPrice).toString()

  // Add currency and billing
  let result = showCurrency ? `${formatted} MAD` : formatted
  
  if (billing) {
    result += `/${billing}`
  }

  return result
}

/**
 * Format course price specifically for course cards and modals
 * @param {Object} course - Course object
 * @returns {string} Formatted course price
 */
export const formatCoursePrice = (course) => {
  if (!course) return 'Free'

  // Check multiple price locations
  const price = course.pricing?.currentPrice || 
               course.price || 
               course.cost || 
               0

  // Handle free courses
  const isFree = course.pricing?.isFree || price === 0
  if (isFree) return 'Free'

  return formatMADPrice(price)
}

/**
 * Format subscription plan price
 * @param {Object} plan - Subscription plan object
 * @returns {string} Formatted plan price
 */
export const formatPlanPrice = (plan) => {
  if (!plan || plan.price === 0) return 'Free'

  const billing = plan.billing === 'year' ? 'year' : 'month'
  return formatMADPrice(plan.price, { billing })
}

/**
 * Convert USD to MAD (approximate rate for display)
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in MAD
 */
export const convertUSDToMAD = (usdAmount) => {
  const exchangeRate = 10.2 // Approximate USD to MAD rate
  return Math.round(usdAmount * exchangeRate)
}

/**
 * Ensure course data uses MAD pricing
 * @param {Object} course - Course object
 * @returns {Object} Course with MAD pricing
 */
export const ensureMADPricing = (course) => {
  if (!course) return course

  // If price is in USD format, convert it
  let price = course.pricing?.currentPrice || course.price || 0

  if (typeof price === 'string' && price.includes('$')) {
    const usdAmount = parseFloat(price.replace('$', ''))
    price = convertUSDToMAD(usdAmount)
  }

  return {
    ...course,
    pricing: {
      ...course.pricing,
      currentPrice: price,
      currency: 'MAD',
      isFree: price === 0
    },
    price: price // Legacy support
  }
}

/**
 * Batch convert course array to MAD pricing
 * @param {Array} courses - Array of course objects
 * @returns {Array} Courses with MAD pricing
 */
export const ensureMADPricingBatch = (courses) => {
  if (!Array.isArray(courses)) return courses
  return courses.map(ensureMADPricing)
}

/**
 * Format discount amount in MAD
 * @param {number} discountAmount - Discount amount
 * @returns {string} Formatted discount
 */
export const formatMADDiscount = (discountAmount) => {
  return formatMADPrice(discountAmount, { showCurrency: true })
}

/**
 * Currency symbols and info for Morocco
 */
export const MOROCCO_CURRENCY = {
  code: 'MAD',
  symbol: 'MAD',
  name: 'Moroccan Dirham',
  position: 'after', // "100 MAD" not "MAD 100"
  decimals: 0 // Typically no decimals shown for MAD
}

export default {
  formatMADPrice,
  formatCoursePrice,
  formatPlanPrice,
  convertUSDToMAD,
  ensureMADPricing,
  ensureMADPricingBatch,
  formatMADDiscount,
  MOROCCO_CURRENCY
}