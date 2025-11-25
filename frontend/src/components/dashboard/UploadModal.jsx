/**
 * PATH: src/components/dashboard/UploadModal.jsx
 */

import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Upload, FileText, CheckCircle, AlertCircle, Clock, Sparkles, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import { uploadDocument } from '../../store/slices/documentsSlice'

import { 
  selectCurrentPlan, 
  selectPlanFeatures 
} from '../../store/slices/subscriptionSlice'
import { hasReachedUploadLimit } from '../subscription/SubscriptionConfig'

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)
  
  const currentPlan = useSelector(selectCurrentPlan)
  const planFeatures = useSelector(selectPlanFeatures)
  const documents = useSelector(state => state.documents?.documents)
  const currentDocumentCount = documents?.length || 0
  const hasReachedLimit = hasReachedUploadLimit(currentPlan, currentDocumentCount)
  
  // Check if user can upload more documents
  const canUpload = planFeatures.documentsLimit === -1 || currentDocumentCount < planFeatures.documentsLimit
  const remainingUploads = planFeatures.documentsLimit === -1 ? 'Unlimited' : planFeatures.documentsLimit - currentDocumentCount
  
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadStep, setUploadStep] = useState('select') // select, uploading, processing, complete, error, limit_reached
  const [processWithAI, setProcessWithAI] = useState(true)
  const [uploadedDocument, setUploadedDocument] = useState(null)
  const [processingProgress, setProcessingProgress] = useState(0)

  // Redux state
  const isUploading = useSelector(state => state.documents?.isUploading)

  // Supported file types
  const supportedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  useEffect(() => {
    if (isOpen) {
      if (hasReachedLimit) {
        setUploadStep('limit_reached')
      } else {
        setUploadStep('select')
      }
      setSelectedFile(null)
      setUploadedDocument(null)
      setProcessingProgress(0)
    }
  }, [isOpen, hasReachedLimit])

  // Simulate processing progress
  useEffect(() => {
    if (uploadStep === 'processing') {
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            return prev // Stop at 90% until real completion
          }
          return prev + Math.random() * 15
        })
      }, 500)

      return () => clearInterval(interval)
    }
  }, [uploadStep])

  // Poll for document status if processing
  useEffect(() => {
    if (uploadStep === 'processing' && uploadedDocument) {
      const pollInterval = setInterval(async () => {
        try {
          setTimeout(() => {
            setProcessingProgress(100)
            setUploadStep('complete')
            toast.success('Document processed successfully! 🎉')
          }, 10000) // 10 seconds simulation
          
          clearInterval(pollInterval)
        } catch (error) {
          console.error('Error polling document status:', error)
        }
      }, 2000)

      return () => clearInterval(pollInterval)
    }
  }, [uploadStep, uploadedDocument])

  const validateFile = (file) => {
    if (!supportedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file')
      return false
    }
    
    if (file.size > maxFileSize) {
      toast.error('File size must be less than 10MB')
      return false
    }
    
    return true
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStep('uploading')
    
    try {
      const metadata = {
        title: selectedFile.name.replace(/\.[^/.]+$/, ''),
        description: `Uploaded on ${new Date().toLocaleDateString()}`
      }

      const result = await dispatch(uploadDocument({
        file: selectedFile,
        metadata,
        processImmediately: processWithAI
      })).unwrap()

      setUploadedDocument(result.document)
      
      if (processWithAI) {
        setUploadStep('processing')
        setProcessingProgress(10)
        toast.success('Upload successful! AI processing started...')
      } else {
        setUploadStep('complete')
        toast.success('Document uploaded successfully!')
      }

    } catch (error) {
      setUploadStep('error')
      toast.error(error || 'Upload failed. Please try again.')
    }
  }

  const handleClose = () => {
    if (uploadStep === 'processing') {
      const confirmClose = window.confirm(
        'Your document is still being processed. Are you sure you want to close? Processing will continue in the background.'
      )
      if (!confirmClose) return
    }
    
    if (uploadStep === 'complete' && onSuccess) {
      onSuccess(uploadedDocument)
    }
    
    onClose()
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {uploadStep === 'limit_reached' ? 'Upload Limit Reached' :
             uploadStep === 'select' ? 'Upload Document' :
             uploadStep === 'uploading' ? 'Uploading...' :
             uploadStep === 'processing' ? 'Processing with AI...' :
             uploadStep === 'complete' ? 'Upload Complete!' :
             'Upload Error'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600"
            disabled={uploadStep === 'uploading'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {uploadStep === 'limit_reached' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h4 className="font-semibold text-slate-900 mb-2">
                Upload Limit Reached
              </h4>
              
              <p className="text-slate-600 mb-4">
                You've uploaded <strong>{currentDocumentCount}</strong> of <strong>{planFeatures.documentsLimit}</strong> documents allowed on your <span className="font-semibold capitalize text-blue-600">{currentPlan}</span> plan.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h5 className="font-semibold text-blue-900 mb-2">Upgrade to continue uploading:</h5>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>• <strong>Plus (150 MAD/mo):</strong> Unlimited documents</div>
                  <div>• <strong>Pro (1000 MAD/year):</strong> Unlimited + Team features</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    onClose() // Close the upload modal first
                    window.location.href = '/subscription'
                  }}
                  variant="premium"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>View Plans & Upgrade</span>
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* File Selection Step */}
          {uploadStep === 'select' && canUpload && (
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50 scale-105' 
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Drop your document here or click to browse
                  </h4>
                  
                  <p className="text-slate-600 mb-4">
                    Supports PDF, Word documents, and text files up to 10MB
                  </p>
                  
                  <div className="bg-slate-100 rounded-lg p-3 mb-4">
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-semibold">{currentDocumentCount}</span> of{' '}
                      <span className="font-semibold">
                        {planFeatures.documentsLimit === -1 ? '∞' : planFeatures.documentsLimit}
                      </span>{' '}
                      documents used on <span className="capitalize font-semibold text-blue-600">{currentPlan}</span> plan
                    </p>
                    
                    {planFeatures.documentsLimit !== -1 && (
                      <div className="space-y-2">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(currentDocumentCount / planFeatures.documentsLimit) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          {remainingUploads} uploads remaining
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded">PDF</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">DOCX</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">DOC</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">TXT</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Preview */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">{selectedFile.name}</p>
                        <p className="text-sm text-slate-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearFile}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* AI Processing Option */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processWithAI}
                        onChange={(e) => setProcessWithAI(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-slate-900">Process with AI</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Get instant summary, key points, and enable quiz generation
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    variant="premium"
                    size="lg"
                    className="w-full"
                    icon={<CheckCircle className="w-5 h-5" />}
                  >
                    {processWithAI ? 'Upload & Process with AI' : 'Upload Document'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {uploadStep === 'uploading' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 animate-bounce" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Uploading your document...</h4>
              <p className="text-slate-600">Please wait while we upload your file</p>
            </div>
          )}

          {uploadStep === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">AI is analyzing your document...</h4>
              <p className="text-slate-600 mb-4">Creating summary, extracting key points, and preparing quizzes</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500">{Math.round(processingProgress)}% complete</p>
              
              <div className="mt-4 text-xs text-slate-500">
                <p>💡 This usually takes 10-30 seconds depending on document length</p>
              </div>
            </div>
          )}

          {uploadStep === 'complete' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Document Uploaded!</h4>
              <p className="text-slate-600 mb-4">
                Your document has been uploaded successfully and is ready to use.
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={handleClose}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  View in Dashboard
                </Button>
              </div>
            </div>
          )}

          {uploadStep === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Upload failed</h4>
              <p className="text-slate-600 mb-4">Something went wrong. Please try again.</p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => setUploadStep('select')}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="lg"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default UploadModal