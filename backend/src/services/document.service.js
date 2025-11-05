/**
 * Document Service
 * @module services/document
 * @description Core business logic for document operations
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Document from '#models/document/Document.js';
import { HttpError } from '#exceptions/index.js';
import { DOCUMENT_STATUSES } from '#constants/models/document/index.js';

// Convert fs.unlink to promise-based
const unlinkAsync = promisify(fs.unlink);

/**
 * Upload and create a new document
 * @param {Object} fileData - File data from multer
 * @param {Object} documentData - Document metadata
 * @param {string} userId - User ID who owns the document
 * @returns {Promise<Object>} Created document
 */
export const createDocument = async (fileData, documentData, userId) => {
  console.log('🔍 DEBUG createDocument:');
  console.log('  fileData.path:', fileData.path);
  console.log('  fileData:', fileData);

  if (!fileData) {
    throw HttpError.badRequest('No file uploaded');
  }

  // Create document object
  const document = new Document({
    userId,
    title: documentData.title || fileData.originalname.replace(/\.[^/.]+$/, ''),
    description: documentData.description || '',
    file: {
      originalName: fileData.originalname,
      storagePath: fileData.path,
      size: fileData.size,
      mimeType: fileData.mimetype
    },
    classification: {
      type: documentData.type || undefined, // needs to be determined by ai
      category: documentData.category || undefined, // needs to be determined by ai
      difficulty: documentData.difficulty || undefined, // needs to be determined by ai
      tags: documentData.tags ? documentData.tags.split(',').map(tag => tag.trim()) : [] // needs to be determined by ai
    },
    status: 'pending'
  });

  try {
    await document.save();
    return document;
  } catch (error) {
    // Delete the file if document creation fails
    try {
      await unlinkAsync(fileData.path);
    } catch (deleteError) {
      console.error('Error deleting file after failed document creation:', deleteError);
    }
    throw error;
  }
};

/**
 * Get all documents for a user with optional filtering
 * @param {string} userId - User ID
 * @param {Object} options - Query options (status, category, etc.)
 * @returns {Promise<Array>} Documents array
 */
export const getUserDocuments = async (userId, options = {}) => {
  const { 
    status, 
    category, 
    difficulty, 
    searchTerm,
    page = 1, 
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  
  // Configure sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // If search term is provided, use text search
  if (searchTerm) {
    return Document.searchByText(userId, searchTerm, { limit, skip });
  }

  // Otherwise use standard query
  return Document.findByUser(userId, {
    status,
    category,
    difficulty,
    limit: parseInt(limit),
    skip: parseInt(skip),
    sort
  });
};

/**
 * Get document by ID
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID for ownership validation
 * @returns {Promise<Object>} Document object
 */
export const getDocumentById = async (documentId, userId) => {
  try {
    const document = await Document.findOne({
      _id: documentId,
      userId,  // This parameter comes from the controller
      deletedAt: null
    }).select('+file.storagePath');
    
    if (!document) {
      throw HttpError.notFound('Document not found');
    }
    
    return document;
  } catch (error) {
    throw error;
  }
};

/**
 * Update document metadata
 * @param {string} documentId - Document ID
 * @param {Object} updateData - Data to update
 * @param {string} userId - User ID for ownership validation
 * @returns {Promise<Object>} Updated document
 */
export const updateDocument = async (documentId, updateData, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    userId,
    deletedAt: null
  });

  if (!document) {
    throw HttpError.notFound('Document not found');
  }

  // Only allow updating certain fields
  const allowedUpdates = [
    'title',
    'description',
    'classification.type',
    'classification.category',
    'classification.difficulty',
    'classification.tags'
  ];

  // Apply updates to allowed fields
  Object.keys(updateData).forEach(key => {
    if (allowedUpdates.includes(key)) {
      if (key === 'classification.tags' && typeof updateData[key] === 'string') {
        // Handle tags as comma-separated string
        document.classification.tags = updateData[key].split(',').map(tag => tag.trim());
      } else if (key.startsWith('classification.')) {
        // Handle nested fields
        const nestedKey = key.split('.')[1];
        document.classification[nestedKey] = updateData[key];
      } else {
        document[key] = updateData[key];
      }
    }
  });

  await document.save();
  return document;
};

/**
 * Delete document (soft delete)
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID for ownership validation
 * @returns {Promise<Object>} Result object
 */
export const deleteDocument = async (documentId, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    userId,
    deletedAt: null
  });

  if (!document) {
    throw HttpError.notFound('Document not found');
  }

  await document.softDelete();
  
  return { success: true, message: 'Document deleted successfully' };
};

/**
 * Permanently delete document and file
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID for ownership validation
 * @returns {Promise<Object>} Result object
 */
export const permanentlyDeleteDocument = async (documentId, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    userId
  }).select('+file.storagePath');

  if (!document) {
    throw HttpError.notFound('Document not found');
  }

  // Delete the file from storage
  if (document.file && document.file.storagePath) {
    try {
      await unlinkAsync(document.file.storagePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with document deletion even if file deletion fails
    }
  }

  // Permanently remove from database
  await Document.deleteOne({ _id: documentId });
  
  return { success: true, message: 'Document permanently deleted' };
};

export default {
  createDocument,
  getUserDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  permanentlyDeleteDocument
};