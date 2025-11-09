/**
 * PATH: src/components/documents/DocumentsTable.jsx
 * Documents Table View Component - FULL CODE
 * 
 * ✅ FEATURES:
 * - Compact table view for documents
 * - Sortable columns
 * - Row selection with checkboxes
 * - Quick actions in each row
 * - Status indicators
 * - Responsive design with mobile adaptations
 */

import React, { useState } from 'react'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Brain, 
  Download,
  Trash2,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Calendar,
  HardDrive
} from 'lucide-react'
import Button from '../ui/Button'
import DocumentReviseModal from './DocumentReviseModal'
import QuizSelectionModal from '../quiz/modals/QuizSelectionModal'

const DocumentsTable = ({
  documents = [],
  selectedDocuments = [],
  onDocumentSelect,
  className = ''
}) => {
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [reviseModal, setReviseModal] = useState({ isOpen: false, document: null })
  const [quizModal, setQuizModal] = useState({ isOpen: false, document: null })

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sort documents
  const sortedDocuments = [...documents].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (sortField === 'createdAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortField === 'title') {
      aValue = aValue?.toLowerCase() || ''
      bValue = bValue?.toLowerCase() || ''
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getSortIcon = (field) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    )
  }

  const getStatusBadge = (status) => {
    const configs = {
      completed: { 
        icon: <CheckCircle className="w-3 h-3 text-green-500" />,
        text: 'Completed',
        class: 'bg-green-50 text-green-700 border-green-200'
      },
      processing: { 
        icon: <Clock className="w-3 h-3 text-blue-500 animate-spin" />,
        text: 'Processing',
        class: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      pending: { 
        icon: <Clock className="w-3 h-3 text-yellow-500" />,
        text: 'Pending',
        class: 'bg-yellow-50 text-yellow-700 border-yellow-200'
      },
      failed: { 
        icon: <AlertCircle className="w-3 h-3 text-red-500" />,
        text: 'Failed',
        class: 'bg-red-50 text-red-700 border-red-200'
      }
    }
    
    const config = configs[status] || configs.pending
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${config.class}`}>
        {config.icon}
        <span>{config.text}</span>
      </span>
    )
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Handle document actions
  const handleRevise = (document) => {
    setReviseModal({ isOpen: true, document })
  }

  const handleQuiz = (document) => {
    if (document.status !== 'completed') {
      return
    }
    setQuizModal({ isOpen: true, document })
  }

  const handleStartQuiz = (quizData) => {
    setQuizModal({ isOpen: false, document: null })
    window.location.href = `/quiz/${quizData.quizId}`
  }

  const handleDownload = (document) => {
    window.open(`/api/documents/${document.id}/download`, '_blank')
  }

  const handleDelete = async (document) => {
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      console.log('Delete document:', document.id)
    }
  }

  const isSelected = (documentId) => selectedDocuments.includes(documentId)

  if (!documents || documents.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center ${className}`}>
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No documents found</h3>
        <p className="text-slate-500">Your documents will appear here once you upload them</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      
      {/* Table Header - Desktop */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-8 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={documents.length > 0 && documents.every(doc => isSelected(doc.id))}
                    onChange={(e) => {
                      documents.forEach(doc => {
                        onDocumentSelect(doc.id, e.target.checked)
                      })
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                </th>
                
                <th 
                  className="text-left px-4 py-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Document</span>
                    {getSortIcon('title')}
                  </div>
                </th>
                
                <th 
                  className="text-left px-4 py-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                
                <th className="text-left px-4 py-3 font-medium text-slate-700">
                  Category
                </th>
                
                <th className="text-left px-4 py-3 font-medium text-slate-700">
                  Size
                </th>
                
                <th 
                  className="text-left px-4 py-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    {getSortIcon('createdAt')}
                  </div>
                </th>
                
                <th className="text-right px-4 py-3 font-medium text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody>
              {sortedDocuments.map((document) => (
                <tr 
                  key={document.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    isSelected(document.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected(document.id)}
                      onChange={(e) => onDocumentSelect(document.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate">
                          {document.title || 'Untitled Document'}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {document.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    {getStatusBadge(document.status)}
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600 capitalize">
                      {document.classification?.category || 'Unknown'}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">
                      {formatFileSize(document.file?.size)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">
                      {formatDate(document.createdAt)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      {document.status === 'completed' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevise(document)}
                            className="p-1"
                            title="Study"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuiz(document)}
                            className="p-1"
                            title="Quiz"
                          >
                            <Brain className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(document)}
                            className="p-1"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                          className="p-1"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document)}
                        className="p-1 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden divide-y divide-slate-200">
        {sortedDocuments.map((document) => (
          <div 
            key={document.id}
            className={`p-4 ${isSelected(document.id) ? 'bg-blue-50' : ''}`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={isSelected(document.id)}
                onChange={(e) => onDocumentSelect(document.id, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">
                      {document.title || 'Untitled Document'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(document.createdAt)} • {formatFileSize(document.file?.size)}
                    </p>
                  </div>
                  {getStatusBadge(document.status)}
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500 capitalize">
                    {document.classification?.category || 'Unknown'}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    {document.status === 'completed' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevise(document)}
                          className="p-1"
                        >
                          <BookOpen className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuiz(document)}
                          className="p-1"
                        >
                          <Brain className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(document)}
                      className="p-1"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <DocumentReviseModal
        isOpen={reviseModal.isOpen}
        document={reviseModal.document}
        onClose={() => setReviseModal({ isOpen: false, document: null })}
      />

      <QuizSelectionModal
        isOpen={quizModal.isOpen}
        document={quizModal.document}
        onClose={() => setQuizModal({ isOpen: false, document: null })}
        onStartQuiz={handleStartQuiz}
      />
    </div>
  )
}

export default DocumentsTable