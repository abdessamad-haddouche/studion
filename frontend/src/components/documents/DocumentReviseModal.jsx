/**
 * PATH: src/components/documents/DocumentReviseModal.jsx
 * Document Revise Modal - Study materials and revision interface
 */

import React, { useState, useEffect } from 'react'
import { X, BookOpen, FileText, List, Tag, Eye, Clock, CheckCircle } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import { 
  revisionConfig, 
  getEnabledRevisionModes,
  REVISION_MODES 
} from './DocumentActionsConfig'

const DocumentReviseModal = ({ isOpen, document, onClose }) => {
  const [activeMode, setActiveMode] = useState(REVISION_MODES.SUMMARY)
  const [readingProgress, setReadingProgress] = useState(0)
  const [studyTime, setStudyTime] = useState(0)

  // Icon mapping
  const iconMap = {
    FileText: <FileText className="w-4 h-4" />,
    List: <List className="w-4 h-4" />,
    Tag: <Tag className="w-4 h-4" />,
    Scroll: <Eye className="w-4 h-4" />
  }

  // Track study time
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setStudyTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen])

  // Format study time
  const formatStudyTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get enabled revision modes
  const enabledModes = getEnabledRevisionModes()

  if (!isOpen || !document) return null

  // Check if document has the required content
  const hasContent = {
    [REVISION_MODES.SUMMARY]: !!document.content?.summary,
    [REVISION_MODES.KEY_POINTS]: !!document.content?.keyPoints?.length,
    [REVISION_MODES.TOPICS]: !!document.content?.topics?.length,
    [REVISION_MODES.FULL_CONTENT]: !!document.content?.extractedText
  }

  const renderContent = () => {
    switch (activeMode) {
      case REVISION_MODES.SUMMARY:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">AI Summary</h3>
            </div>
            
            {hasContent[REVISION_MODES.SUMMARY] ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {document.content.summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>No summary available for this document.</p>
              </div>
            )}
          </div>
        )

      case REVISION_MODES.KEY_POINTS:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <List className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-slate-900">Key Points</h3>
            </div>
            
            {hasContent[REVISION_MODES.KEY_POINTS] ? (
              <div className="space-y-3">
                {document.content.keyPoints.map((point, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs font-semibold">{index + 1}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <List className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>No key points extracted for this document.</p>
              </div>
            )}
          </div>
        )

      case REVISION_MODES.TOPICS:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-slate-900">Topics Covered</h3>
            </div>
            
            {hasContent[REVISION_MODES.TOPICS] ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {document.content.topics.map((topic, index) => (
                  <div 
                    key={index}
                    className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center"
                  >
                    <span className="text-purple-700 font-medium capitalize">
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>No topics extracted for this document.</p>
              </div>
            )}
          </div>
        )

      case REVISION_MODES.FULL_CONTENT:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">Full Content</h3>
            </div>
            
            {hasContent[REVISION_MODES.FULL_CONTENT] ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {document.content.extractedText}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>No extracted text available for this document.</p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-slate-500">
            <p>Select a revision mode to start studying.</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Revise Document</h2>
              <p className="text-sm text-slate-600">{document.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Study Timer */}
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{formatStudyTime(studyTime)}</span>
            </div>
            
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Revision Modes */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Study Modes</h3>
            
            <div className="space-y-2">
              {enabledModes.map(mode => {
                const config = revisionConfig[mode]
                const isActive = activeMode === mode
                const hasData = hasContent[mode]
                
                return (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    disabled={!hasData}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-100 border-blue-200 text-blue-900' 
                        : hasData
                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    } border`}
                  >
                    <div className="flex items-center space-x-3">
                      {iconMap[config.icon]}
                      <div>
                        <p className="font-medium text-sm">{config.label}</p>
                        <p className="text-xs opacity-75">{config.description}</p>
                      </div>
                      {hasData && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Study Progress</span>
                <span className="font-medium text-slate-900">{readingProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span>Document processed: {new Date(document.processing?.completedAt).toLocaleDateString()}</span>
              {document.processing?.aiMetadata?.tokensUsed && (
                <span className="ml-4">Tokens: {document.processing.aiMetadata.tokensUsed}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Close
              </Button>
              
              <Button
                variant="primary"
                onClick={() => {
                  // Mark as studied or set progress
                  setReadingProgress(100)
                  setTimeout(() => onClose(), 1000)
                }}
              >
                Mark as Studied
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentReviseModal