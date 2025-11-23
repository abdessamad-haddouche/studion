/**
 * PATH: src/components/documents/DocumentsTable.jsx
 * FIXED - Show edit/delete buttons for ALL documents including failed ones
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
  Edit3,
  Check,
  X,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Calendar,
  HardDrive,
  Search
} from 'lucide-react'
import Button from '../ui/Button'
import DocumentReviseModal from './DocumentReviseModal'
import QuizSelectionModal from '../quiz/modals/QuizSelectionModal'
import { documentsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const DocumentsTable = ({
  documents = [],
  selectedDocuments = [],
  onDocumentSelect,
  onDocumentUpdate,
  onDocumentDelete,
  searchState = {},
  filters = {},
  currentSearchTerm = '',
  onClearSearch,
  onClearFilters,
  onUploadClick,
  // ✅ NEW: Add totalDocumentsCount to distinguish between no docs vs no search results
  totalDocumentsCount = 0,
  className = ''
}) => {
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [reviseModal, setReviseModal] = useState({ isOpen: false, document: null })
  const [quizModal, setQuizModal] = useState({ isOpen: false, document: null })

  // Edit/Delete states
  const [editingDocument, setEditingDocument] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ... (all existing functions remain the same - handleSort, getSortIcon, etc.)
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

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

  const startEditing = (document) => {
    setEditingDocument(document.id)
    setEditTitle(document.title || '')
  }

  const cancelEditing = () => {
    setEditingDocument(null)
    setEditTitle('')
  }

  const saveTitle = async (document) => {
    const trimmedTitle = editTitle.trim()
    
    if (!trimmedTitle) {
      toast.error('Title cannot be empty')
      return
    }

    if (trimmedTitle === document.title) {
      cancelEditing()
      return
    }

    setIsUpdating(true)
    
    try {
      const response = await documentsAPI.update(document.id, {
        title: trimmedTitle
      })

      if (response.data.success) {
        toast.success('Document title updated!')
        
        const updatedDocument = {
          ...document,
          title: trimmedTitle
        }
        onDocumentUpdate(updatedDocument)
        
        cancelEditing()
      } else {
        throw new Error(response.data.message || 'Update failed')
      }
    } catch (error) {
      console.error('Failed to update document title:', error)
      toast.error(error.response?.data?.message || 'Failed to update title')
    } finally {
      setIsUpdating(false)
    }
  }

  const startDelete = (document) => {
    setDeleteConfirm(document.id)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const confirmDelete = async (document) => {
    setIsDeleting(true)
    
    try {
      const response = await documentsAPI.delete(document.id, { permanent: false })
      
      if (response.data.success) {
        toast.success('Document deleted successfully!')
        onDocumentDelete(document.id)
        setDeleteConfirm(null)
      } else {
        throw new Error(response.data.message || 'Delete failed')
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      toast.error(error.response?.data?.message || 'Failed to delete document')
    } finally {
      setIsDeleting(false)
    }
  }

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

  const isSelected = (documentId) => selectedDocuments.includes(documentId)

  // ✅ FIXED: Same empty state logic as DocumentsGrid
  if (!documents || documents.length === 0) {
    const hasSearch = currentSearchTerm && currentSearchTerm.trim()
    const hasFilters = filters && Object.keys(filters).some(key => 
      key !== 'search' && filters[key] && filters[key] !== null && filters[key] !== ''
    )
    
    // ✅ KEY FIX: Check if user actually has documents vs search returning no results
    const userHasDocuments = totalDocumentsCount > 0
    
    if (hasSearch || hasFilters) {
      // ✅ SEARCH/FILTER RESULTS EMPTY STATE
      return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center ${className}`}>
          <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No documents found</h3>
          <p className="text-slate-500 mb-6">
            {hasSearch && hasFilters 
              ? `No documents match your search "${currentSearchTerm}" and selected filters.`
              : hasSearch 
              ? `No documents match your search "${currentSearchTerm}".`
              : 'No documents match your selected filters.'
            }
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 mb-3">
              💡 <strong>Search Tips:</strong>
            </p>
            <ul className="text-sm text-blue-600 text-left space-y-1">
              <li>• Try different keywords or shorter terms</li>
              <li>• Check your spelling</li>
              <li>• Remove some filters to broaden results</li>
              <li>• Search by document category or status</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasSearch && onClearSearch && (
                <Button 
                  variant="secondary" 
                  onClick={onClearSearch}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear search</span>
                </Button>
              )}
              {hasFilters && onClearFilters && (
                <Button 
                  variant="secondary" 
                  onClick={onClearFilters}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear filters</span>
                </Button>
              )}
              {onUploadClick && (
                <Button 
                  variant="primary" 
                  onClick={onUploadClick}
                  className="flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Upload Another Document</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    } else if (!userHasDocuments) {
      // ✅ TRULY NO DOCUMENTS
      return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center ${className}`}>
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Your Document Library Awaits</h3>
          <p className="text-slate-500 mb-6">
            Upload your first document to unlock AI-powered summaries, quizzes, and study materials. Transform your learning experience with intelligent document analysis.
          </p>
          {onUploadClick && (
            <Button 
              variant="primary" 
              onClick={onUploadClick}
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Your First Document</span>
            </Button>
          )}
        </div>
      )
    } else {
      // ✅ EDGE CASE
      return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center ${className}`}>
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No documents to display</h3>
          <p className="text-slate-500 mb-6">
            Something went wrong loading your documents. Try refreshing the page.
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2"
          >
            <span>Refresh Page</span>
          </Button>
        </div>
      )
    }
  }

  // ✅ MAIN TABLE RENDER (unchanged)
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
              {sortedDocuments.map((document) => {
                const isEditing = editingDocument === document.id
                const isShowingDeleteConfirm = deleteConfirm === document.id
                
                return (
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
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isUpdating}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveTitle(document)
                                  if (e.key === 'Escape') cancelEditing()
                                }}
                                autoFocus
                              />
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => saveTitle(document)}
                                  disabled={isUpdating}
                                  className="text-xs h-6 px-2"
                                >
                                  {isUpdating ? (
                                    <Clock className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelEditing}
                                  disabled={isUpdating}
                                  className="text-xs h-6 px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="group">
                              <div className="flex items-center space-x-2">
                                <p 
                                  className="font-medium text-slate-900 truncate cursor-pointer"
                                  onDoubleClick={() => startEditing(document)}
                                  title="Double-click to edit"
                                >
                                  {document.title || 'Untitled Document'}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(document)}
                                  className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6"
                                  title="Edit title"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-slate-500 truncate">
                                {document.description || 'No description'}
                              </p>
                            </div>
                          )}
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
                    
                    {/* ✅ FIXED: Show edit/delete buttons for ALL documents */}
                    <td className="px-4 py-4">
                      {isShowingDeleteConfirm ? (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => confirmDelete(document)}
                            disabled={isDeleting}
                            className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isDeleting ? (
                              <>
                                <Clock className="w-3 h-3 animate-spin mr-1" />
                                Deleting
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelDelete}
                            disabled={isDeleting}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1">
                          {document.status === 'completed' && (
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
                            </>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(document)}
                            className="p-1"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(document)}
                            className="p-1"
                            title="Edit title"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startDelete(document)}
                            className="p-1 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden divide-y divide-slate-200">
        {sortedDocuments.map((document) => {
          const isEditing = editingDocument === document.id
          const isShowingDeleteConfirm = deleteConfirm === document.id
          
          return (
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
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isUpdating}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(document)
                              if (e.key === 'Escape') cancelEditing()
                            }}
                            autoFocus
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => saveTitle(document)}
                              disabled={isUpdating}
                              className="text-xs"
                            >
                              {isUpdating ? (
                                <Clock className="w-3 h-3 animate-spin" />
                              ) : (
                                'Save'
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              disabled={isUpdating}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <h3 
                          className="font-medium text-slate-900 truncate cursor-pointer"
                          onDoubleClick={() => startEditing(document)}
                        >
                          {document.title || 'Untitled Document'}
                        </h3>
                      )}
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(document.createdAt)} • {formatFileSize(document.file?.size)}
                      </p>
                    </div>
                    {getStatusBadge(document.status)}
                  </div>
                  
                  {isShowingDeleteConfirm ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                      <p className="text-sm text-red-700 font-medium mb-2">
                        Delete this document?
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => confirmDelete(document)}
                          disabled={isDeleting}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isDeleting ? (
                            <>
                              <Clock className="w-3 h-3 animate-spin mr-1.5" />
                              Deleting
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3 mr-1.5" />
                              Delete
                            </>
                          )}
                        </button>
                        <button
                          onClick={cancelDelete}
                          disabled={isDeleting}
                          className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(document)}
                          className="p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startDelete(document)}
                          className="p-1 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
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