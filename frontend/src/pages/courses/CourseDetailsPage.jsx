/**
 * PATH: src/pages/courses/CourseDetailsPage.jsx
 * Course Details Page - Placeholder
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'

const CourseDetailsPage = () => {
  const { id } = useParams()

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Course Details</h1>
          <p className="text-slate-600">Course details page is under development.</p>
          <p className="text-sm text-slate-500 mt-2">Course ID: {id}</p>
        </div>
      </div>
    </Layout>
  )
}

export default CourseDetailsPage