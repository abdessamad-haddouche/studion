/**
 * PATH: src/pages/subscription/PlansPage.jsx
 * Updated Plans Page with Current Plan Banner
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
  
  // Update page title
  useEffect(() => {
    document.title = 'Subscription Plans - Studion'
  }, [])
  
  // Component mapping
  const componentMap = {
    [SUBSCRIPTION_COMPONENTS.PRICING_HEADER]: (
      <PricingHeader key="header" className="mb-12" />
    ),
    
    [SUBSCRIPTION_COMPONENTS.PLAN_CARDS]: (
      <div key="plans" className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {SUBSCRIPTION_PLANS.map(planKey => (
            <PlanCard
              key={planKey}
              planKey={planKey}
              highlighted={planKey === 'premium'} // Highlight premium
            />
          ))}
        </div>
      </div>
    ),
    
    [SUBSCRIPTION_COMPONENTS.FEATURE_COMPARISON]: (
      <FeatureComparison key="comparison" className="mb-16" />
    ),
    
    [SUBSCRIPTION_COMPONENTS.FAQ_SECTION]: (
      <div key="faq" className="mb-16">
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
                Premium users get detailed strengths and weaknesses analysis based on quiz performance, 
                learning progress tracking, and personalized improvement recommendations.
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
              plan: "Premium"
            },
            {
              name: "Ahmed Hassan", 
              role: "Engineering Student",
              content: "The strengths and weaknesses analysis showed me exactly what to focus on.",
              plan: "Premium"
            },
            {
              name: "Lisa Chen",
              role: "MBA Student", 
              content: "Love how I can upload my lecture notes and get instant study materials.",
              plan: "Basic"
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
          
          {/* ✅ ADD: Current Plan Banner */}
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
                    ${PLAN_FEATURES[currentPlan]?.price || 0}
                    <span className="text-lg text-slate-500">/month</span>
                  </div>
                  <div className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded-full">
                    {PLAN_FEATURES[currentPlan]?.documentsLimit === -1 
                      ? 'Unlimited documents' 
                      : `${PLAN_FEATURES[currentPlan]?.documentsLimit} documents`}
                  </div>
                  {PLAN_FEATURES[currentPlan]?.strengthsWeaknesses && (
                    <div className="text-xs text-purple-600 mt-1">
                      ✨ Premium Analytics Included
                    </div>
                  )}
                </div>
              </div>
              
              {/* ✅ Quick feature list for current plan */}
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
          
          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-slate-100 rounded-lg text-xs text-slate-600">
              <strong>Plans Page Debug:</strong> 
              <span className="ml-2">
                currentPlan: {currentPlan} | 
                enabledComponents: {enabledComponents.length} | 
                components: {enabledComponents.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default PlansPage