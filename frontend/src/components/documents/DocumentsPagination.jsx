/**
 * PATH: src/components/documents/DocumentsPagination.jsx
 * Documents Pagination Component - FULL CODE
 * 
 * ✅ FEATURES:
 * - Page navigation with first, previous, next, last
 * - Page size selection based on subscription
 * - Jump to page functionality
 * - Responsive design
 * - Total items and current range display
 * - Keyboard navigation support
 */

import React, { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react'
import Button from '../ui/Button'

const DocumentsPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = ''
}) => {
  const [jumpToPage, setJumpToPage] = useState('')

  // Calculate current range
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers to show
  const generatePageNumbers = () => {
    const pages = []
    const maxVisible = 5 // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)
      
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...')
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handlePageSizeChange = (newPageSize) => {
    if (newPageSize !== pageSize) {
      onPageSizeChange(newPageSize)
    }
  }

  const handleJumpToPage = (e) => {
    e.preventDefault()
    const page = parseInt(jumpToPage)
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page)
      setJumpToPage('')
    }
  }

  const pageNumbers = generatePageNumbers()

  if (totalPages <= 1) {
    return null // Don't show pagination if only one page
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
        
        {/* Left: Items Info and Page Size */}
        <div className="flex items-center space-x-6">
          {/* Items Range */}
          <div className="text-sm text-slate-600">
            Showing <span className="font-medium text-slate-900">{startItem}</span> to{' '}
            <span className="font-medium text-slate-900">{endItem}</span> of{' '}
            <span className="font-medium text-slate-900">{totalItems}</span> documents
          </div>
          
          {/* Page Size Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-slate-600">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-600">per page</span>
          </div>
        </div>

        {/* Center: Page Navigation */}
        <div className="flex items-center space-x-2">
          
          {/* First Page */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          
          {/* Previous Page */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-slate-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                ) : (
                  <Button
                    variant={page === currentPage ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[40px] ${
                      page === currentPage 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Page */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          {/* Last Page */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Right: Jump to Page */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">Go to page:</span>
          <form onSubmit={handleJumpToPage} className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              placeholder={currentPage.toString()}
              className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={!jumpToPage || parseInt(jumpToPage) === currentPage}
            >
              Go
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile-friendly compact view */}
      <div className="lg:hidden mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DocumentsPagination