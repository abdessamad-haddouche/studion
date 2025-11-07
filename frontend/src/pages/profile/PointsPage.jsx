import { useState } from "react";
import Layout from "../../components/layout/Layout";
import {Brain}from 'lucide-react'

export default function Points() {
  
    const totalPoints = 0;
    const discount = 0;

  return (
        <Layout>
    <div className="max-w-4xl lg:min-h-screen mx-auto px-6 py-12 leading-relaxed text-gray-800">
    <Brain className="w-8 h-8 text-blue-600 mx-auto mb-4" />

        
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r text-center from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Points & Rewards
      </h1>
        
      <section className="space-y-6">
        <p>
          Earn points by completing quizzes! Each correct answer gives you 1 point. 
          Get all questions correct in a quiz to earn an extra 3 points.
        </p>

        <p>
          Points can be redeemed for discounts: <strong>every 100 points = $1 off</strong> your next subscription, up to a maximum of $5.
        </p>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 space-y-4">
          <div>
            <span className="font-semibold">Total Points:</span> {totalPoints}
          </div>
    
          <div>
            <span className="font-semibold">Current Discount:</span> ${discount}
          </div>
        </div>
      </section>
    </div>
    </Layout>
  );
}
