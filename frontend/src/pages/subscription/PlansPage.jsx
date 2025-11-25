/**
 * PATH: src/pages/subscription/PlansPage.jsx
 */

import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Layout from '../../components/layout/Layout'

// Configuration
import { 
  SUBSCRIPTION_COMPONENTS, 
  getEnabledSubscriptionComponents,
  PLAN_FEATURES
} from '../../components/subscription/SubscriptionConfig'

// Components
import PricingHeader from '../../components/subscription/PricingHeader'
import PlanCard from '../../components/subscription/PlanCard'
import FeatureComparison from '../../components/subscription/FeatureComparison'
import { selectCurrentPlan } from '../../store/slices/subscriptionSlice'
import { SUBSCRIPTION_PLANS } from '../../components/subscription/SubscriptionConfig'

const PlansPage = () => {
  const currentPlan = useSelector(selectCurrentPlan)
  
  // Get enabled components based on configuration
  const enabledComponents = getEnabledSubscriptionComponents(currentPlan)
  
  const formatCurrentPlanPrice = (plan) => {
    if (!plan || plan.price === 0) return 'Free'
    
    if (typeof plan.price === 'number') {
      const billing = plan.billing === 'year' ? '/year' : '/month'
      return `${plan.price} MAD${billing}`
    }
    
    if (typeof plan.price === 'string') {
      if (plan.price.includes('MAD')) {
        return plan.price
      }
      // Convert any dollar format to MAD
      const amount = plan.price.replace(/[$]/g, '').replace('/month', '').replace('/mo', '')
      const billing = plan.billing === 'year' ? '/year' : '/month'
      return `${amount} MAD${billing}`
    }
    
    return 'Free'
  }
  
  // Handle URL hash scrolling on page load and hash changes
  useEffect(() => {
    document.title = 'Subscription Plans - Studion'
    
    // Function to handle hash scrolling
    const handleHashScroll = () => {
      const hash = window.location.hash.substring(1) // Remove the '#'
      console.log('🔗 PlansPage: Hash detected:', hash)
      
      if (hash) {
        // Use setTimeout to ensure elements are rendered
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            console.log('✅ PlansPage: Scrolling to element:', hash)
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            })
          } else {
            console.log('❌ PlansPage: Element not found:', hash)
          }
        }, 200)
      }
    }
    
    // Initial hash scroll on page load
    handleHashScroll()
    
    // Listen for hash changes (when user clicks navigation links)
    const handleHashChange = () => {
      console.log('🔗 PlansPage: Hash change detected')
      handleHashScroll()
    }
    
    window.addEventListener('hashchange', handleHashChange)
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])
  
  // Component mapping with PROPER scroll anchors
  const componentMap = {
    [SUBSCRIPTION_COMPONENTS.PRICING_HEADER]: (
      <div key="header" className="mb-12">
        <PricingHeader className="" />
      </div>
    ),
    
    [SUBSCRIPTION_COMPONENTS.PLAN_CARDS]: (
      <div key="plans" id="plan-cards" className="mb-16 scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Learning Plan</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Select the perfect plan to accelerate your education with AI-powered learning tools
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map(planKey => (
            <PlanCard
              key={planKey}
              planKey={planKey}
              highlighted={planKey === 'plus'} // Highlight plus plan
            />
          ))}
        </div>
      </div>
    ),
    
    [SUBSCRIPTION_COMPONENTS.FEATURE_COMPARISON]: (
      <div key="comparison" id="feature-comparison" className="mb-16 scroll-mt-20">
        <FeatureComparison />
      </div>
    ),
    
    [SUBSCRIPTION_COMPONENTS.FAQ_SECTION]: (
      <div key="faq" id="faq-section" className="mb-16 scroll-mt-20">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-slate-600 text-sm">
                Yes! You can upgrade or downgrade your plan instantly. Changes take effect immediately 
                and you'll have access to all features of your new plan right away.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What are "Areas of Improvement" in Premium+?
              </h3>
              <p className="text-slate-600 text-sm">
                Plus and Pro plans include AI-powered analysis that identifies specific areas 
                where you need more practice, with personalized study recommendations to help you improve faster.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What happens to my documents when I downgrade?
              </h3>
              <p className="text-slate-600 text-sm">
                Your existing documents remain safe and accessible. However, you won't be able to 
                upload new documents if you exceed your new plan's limit.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-slate-600 text-sm">
                Since this is a demo version, all plan changes are instant and free. In the real 
                version, we'll offer a 30-day money-back guarantee.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                What's included in Premium analytics?
              </h3>
              <p className="text-slate-600 text-sm">
                Plus and Pro users get detailed strengths and weaknesses analysis, areas of improvement 
                suggestions, learning progress tracking, and personalized study recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    
    [SUBSCRIPTION_COMPONENTS.UPGRADE_CTA]: (
      <div key="cta" className="mb-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Supercharge Your Learning?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of students using AI to accelerate their education. 
            Start with our free plan or upgrade for premium features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Start Free Trial
            </button>
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors">
              View All Plans
            </button>
          </div>
        </div>
      </div>
    ),
    
    [SUBSCRIPTION_COMPONENTS.TESTIMONIALS]: (
      <div key="testimonials" className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            What Our Users Say
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Johnson",
              role: "Medical Student",
              content: "Studion helped me ace my biochemistry exam. The AI-generated quizzes were spot on!",
              plan: "Plus"
            },
            {
              name: "Ahmed Hassan", 
              role: "Engineering Student",
              content: "The areas of improvement feature showed me exactly what to focus on for my finals.",
              plan: "Plus"
            },
            {
              name: "Lisa Chen",
              role: "MBA Student", 
              content: "Love how I can upload my lecture notes and get instant study materials.",
              plan: "Free"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <p className="text-slate-600 mb-4">"{testimonial.content}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
                <div className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {testimonial.plan}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {currentPlan && (
            <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Your Current Subscription</h2>
                  <p className="text-slate-600">
                    You're currently on the <span className="font-semibold capitalize text-blue-600">{currentPlan}</span> plan
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {PLAN_FEATURES[currentPlan]?.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {formatCurrentPlanPrice(PLAN_FEATURES[currentPlan])}
                  </div>
                  <div className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded-full">
                    {PLAN_FEATURES[currentPlan]?.documentsLimit === -1 
                      ? 'Unlimited documents' 
                      : `${PLAN_FEATURES[currentPlan]?.documentsLimit} documents`}
                  </div>
                  {PLAN_FEATURES[currentPlan]?.areasOfImprovement && (
                    <div className="text-xs text-purple-600 mt-1">
                      ✨ Areas of Improvement Included
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick feature list for current plan */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">AI Quiz Generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">Basic Analytics</span>
                  </div>
                  {PLAN_FEATURES[currentPlan]?.strengthsWeaknesses && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-slate-600">Strengths & Weaknesses</span>
                    </div>
                  )}
                  {PLAN_FEATURES[currentPlan]?.areasOfImprovement && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-slate-600">Areas of Improvement</span>
                    </div>
                  )}
                  {PLAN_FEATURES[currentPlan]?.prioritySupport && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-600">Priority Support</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Render enabled components in configured order */}
          {enabledComponents.map(componentKey => componentMap[componentKey])}
          
        </div>
      </div>
    </Layout>
  )
}

export default PlansPage