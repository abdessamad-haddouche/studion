/**
 * Document Management Routes Swagger Documentation
 * @description OpenAPI documentation for all document management and AI processing endpoints
 * @location src/docs/swagger/document-routes-docs.js
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 650a1b2c3d4e5f6789012345
 *         title:
 *           type: string
 *           example: Machine Learning Fundamentals
 *         description:
 *           type: string
 *           example: Comprehensive guide to machine learning concepts
 *         file:
 *           type: object
 *           properties:
 *             originalName:
 *               type: string
 *               example: ml-fundamentals.pdf
 *             size:
 *               type: number
 *               example: 2048576
 *             mimetype:
 *               type: string
 *               example: application/pdf
 *             checksum:
 *               type: string
 *               example: a1b2c3d4e5f6789012345
 *             metadata:
 *               type: object
 *               properties:
 *                 pageCount:
 *                   type: number
 *                   example: 50
 *                 wordCount:
 *                   type: number
 *                   example: 12500
 *         content:
 *           type: object
 *           properties:
 *             summary:
 *               type: string
 *               example: This document covers fundamental machine learning concepts...
 *             keyPoints:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Supervised learning", "Neural networks", "Feature engineering"]
 *             topics:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["machine learning", "artificial intelligence", "algorithms"]
 *         classification:
 *           type: object
 *           properties:
 *             category:
 *               type: string
 *               enum: [academic, research, technical, business, personal]
 *               example: academic
 *             difficulty:
 *               type: string
 *               enum: [beginner, intermediate, advanced]
 *               example: intermediate
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["machine learning", "AI", "algorithms"]
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           example: completed
 *         processing:
 *           type: object
 *           properties:
 *             stage:
 *               type: string
 *               enum: [pending, ai_analysis, processing, completed]
 *               example: completed
 *             startedAt:
 *               type: string
 *               format: date-time
 *             completedAt:
 *               type: string
 *               format: date-time
 *             comprehensiveMetadata:
 *               type: object
 *               properties:
 *                 summaryGenerated:
 *                   type: boolean
 *                   example: true
 *                 quizCollectionGenerated:
 *                   type: boolean
 *                   example: true
 *                 quizzesStored:
 *                   type: number
 *                   example: 5
 *                 totalQuestions:
 *                   type: number
 *                   example: 50
 *         analytics:
 *           type: object
 *           properties:
 *             viewCount:
 *               type: number
 *               example: 15
 *             downloadCount:
 *               type: number
 *               example: 3
 *             quizGeneratedCount:
 *               type: number
 *               example: 5
 *             lastViewedAt:
 *               type: string
 *               format: date-time
 *         quizInfo:
 *           type: object
 *           properties:
 *             quizzesGenerated:
 *               type: number
 *               example: 5
 *             hasQuizzes:
 *               type: boolean
 *               example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     DocumentUploadRequest:
 *       type: object
 *       required:
 *         - file
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: PDF or TXT file to upload
 *         title:
 *           type: string
 *           example: Machine Learning Fundamentals
 *         description:
 *           type: string
 *           example: Comprehensive guide to machine learning concepts
 *         type:
 *           type: string
 *           description: Document type (determined by AI)
 *           example: educational
 *         category:
 *           type: string
 *           enum: [academic, research, technical, business, personal]
 *           example: academic
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           example: intermediate
 *         tags:
 *           type: string
 *           description: Comma-separated tags (enhanced by AI)
 *           example: machine learning,AI,algorithms
 *         processImmediately:
 *           type: boolean
 *           default: false
 *           description: Start AI processing immediately after upload
 * 
 *     DocumentUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Updated Document Title
 *         description:
 *           type: string
 *           example: Updated document description
 *         category:
 *           type: string
 *           enum: [academic, research, technical, business, personal]
 *           example: research
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           example: advanced
 *         tags:
 *           type: string
 *           description: Comma-separated tags
 *           example: research,analysis,data
 * 
 *     DocumentSummary:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           example: This document provides a comprehensive overview of machine learning...
 *         keyPoints:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Supervised learning algorithms", "Feature engineering techniques"]
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *           example: ["machine learning", "data science", "algorithms"]
 *         metadata:
 *           type: object
 *           properties:
 *             confidence:
 *               type: number
 *               example: 0.95
 *             processingTime:
 *               type: number
 *               example: 1250
 * 
 *     CustomAnalysisRequest:
 *       type: object
 *       required:
 *         - prompt
 *       properties:
 *         prompt:
 *           type: string
 *           example: Summarize the key mathematical concepts in this document
 * 
 *     AIServiceStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [operational, error]
 *           example: operational
 *         model:
 *           type: string
 *           example: deepseek-chat
 *         available:
 *           type: boolean
 *           example: true
 *         lastChecked:
 *           type: string
 *           format: date-time
 *         details:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             responseTime:
 *               type: number
 *             features:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["summarization", "quiz_generation", "custom_analysis"]
 * 
 *     DocumentAnalytics:
 *       type: object
 *       properties:
 *         views:
 *           type: number
 *           example: 15
 *         downloads:
 *           type: number
 *           example: 3
 *         quizzesGenerated:
 *           type: number
 *           example: 5
 *         lastViewed:
 *           type: string
 *           format: date-time
 *         lastDownloaded:
 *           type: string
 *           format: date-time
 * 
 *     ProcessingResult:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         documentId:
 *           type: string
 *           example: 650a1b2c3d4e5f6789012345
 *         summary:
 *           type: object
 *           properties:
 *             summaryGenerated:
 *               type: boolean
 *               example: true
 *             summaryLength:
 *               type: number
 *               example: 500
 *             keyPointsCount:
 *               type: number
 *               example: 8
 *         quizCollection:
 *           type: object
 *           properties:
 *             quizzesGenerated:
 *               type: number
 *               example: 5
 *             quizzesStored:
 *               type: number
 *               example: 5
 *             quizzesFailed:
 *               type: number
 *               example: 0
 *             totalQuestions:
 *               type: number
 *               example: 50
 *         processingTime:
 *           type: number
 *           description: Processing time in milliseconds
 *           example: 45000
 */

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Upload document
 *     description: Upload a PDF or TXT document with optional immediate AI processing
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DocumentUploadRequest'
 *           example:
 *             title: Machine Learning Guide
 *             description: Comprehensive ML tutorial
 *             category: academic
 *             difficulty: intermediate
 *             tags: machine learning,AI,tutorial
 *             processImmediately: true
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Document uploaded successfully
 *                 document:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 650a1b2c3d4e5f6789012345
 *                     title:
 *                       type: string
 *                       example: Machine Learning Guide
 *                     originalName:
 *                       type: string
 *                       example: ml-guide.pdf
 *                     size:
 *                       type: number
 *                       example: 2048576
 *                     status:
 *                       type: string
 *                       example: pending
 *                     processing:
 *                       type: string
 *                       enum: [started, pending]
 *                       example: started
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_file:
 *                 summary: No file uploaded
 *                 value:
 *                   success: false
 *                   error:
 *                     message: No file uploaded
 *                     code: BAD_REQUEST
 *               invalid_type:
 *                 summary: Invalid file type
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Only PDF and TXT files are allowed
 *                     code: BAD_REQUEST
 *       413:
 *         description: File too large (max 50MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   get:
 *     summary: Get user documents
 *     description: Retrieve all documents for the authenticated user with filtering and pagination
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filter by processing status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [academic, research, technical, business, personal]
 *         description: Filter by document category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, summary, and tags
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of documents per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, status]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     description: Retrieve a specific document with enhanced quiz information
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 document:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Invalid document ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   put:
 *     summary: Update document metadata
 *     description: Update document title, description, category, difficulty, and tags
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentUpdateRequest'
 *           example:
 *             title: Updated Machine Learning Guide
 *             description: Enhanced comprehensive ML tutorial
 *             category: research
 *             difficulty: advanced
 *             tags: machine learning,deep learning,neural networks
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Document updated successfully
 *                 document:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Invalid update data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   delete:
 *     summary: Delete document
 *     description: Delete a document (soft delete by default, permanent if specified)
 *     tags: [Document Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: query
 *         name: permanent
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Permanently delete the document
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Document deleted successfully
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /documents/{id}/summary:
 *   get:
 *     summary: Get document summary
 *     description: Retrieve AI-generated summary, key points, and topics for the document
 *     tags: [AI Processing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 summary:
 *                   $ref: '#/components/schemas/DocumentSummary'
 *       404:
 *         description: Document or summary not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               document_not_found:
 *                 summary: Document not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Document not found
 *                     code: NOT_FOUND
 *               summary_not_available:
 *                 summary: Summary not available
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Document summary not available
 *                     code: NOT_FOUND
 */

/**
 * @swagger
 * /documents/{id}/process:
 *   post:
 *     summary: Process document with AI
 *     description: Manually trigger comprehensive AI processing (summarization + quiz generation) for a pending document
 *     tags: [AI Processing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: AI processing started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comprehensive processing started
 *                 documentId:
 *                   type: string
 *                   example: 650a1b2c3d4e5f6789012345
 *                 status:
 *                   type: string
 *                   example: processing
 *       400:
 *         description: Document not in processable state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: Document is not in a processable state
 *                 code: INVALID_DOCUMENT_STATUS
 *                 context:
 *                   currentStatus: completed
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /documents/{id}/custom-analysis:
 *   post:
 *     summary: Generate custom analysis
 *     description: Generate custom AI analysis of the document using a user-provided prompt
 *     tags: [AI Processing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomAnalysisRequest'
 *           examples:
 *             math_concepts:
 *               summary: Extract mathematical concepts
 *               value:
 *                 prompt: Identify and explain all mathematical concepts and formulas in this document
 *             key_insights:
 *               summary: Generate key insights
 *               value:
 *                 prompt: What are the most important insights and takeaways from this document?
 *             study_guide:
 *               summary: Create study guide
 *               value:
 *                 prompt: Create a comprehensive study guide with main topics and subtopics from this document
 *     responses:
 *       200:
 *         description: Custom analysis generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     prompt:
 *                       type: string
 *                       example: Identify and explain all mathematical concepts in this document
 *                     generatedText:
 *                       type: string
 *                       example: The document contains several key mathematical concepts including linear algebra, calculus, and probability theory...
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         confidence:
 *                           type: number
 *                           example: 0.92
 *                         processingTime:
 *                           type: number
 *                           example: 2500
 *       400:
 *         description: Custom prompt missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: AI analysis generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /documents/{id}/analytics:
 *   get:
 *     summary: Get document analytics
 *     description: Retrieve usage analytics for the document including views, downloads, and quiz generation stats
 *     tags: [Document Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analytics:
 *                   $ref: '#/components/schemas/DocumentAnalytics'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /documents/ai/status:
 *   get:
 *     summary: Check AI service status
 *     description: Get current status and health of the AI processing service
 *     tags: [AI Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI service status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 aiService:
 *                   $ref: '#/components/schemas/AIServiceStatus'
 *             examples:
 *               operational:
 *                 summary: AI service operational
 *                 value:
 *                   success: true
 *                   aiService:
 *                     status: operational
 *                     model: deepseek-chat
 *                     available: true
 *                     lastChecked: "2025-11-07T18:30:00Z"
 *                     details:
 *                       success: true
 *                       responseTime: 850
 *                       features: ["summarization", "quiz_generation", "custom_analysis"]
 *               error:
 *                 summary: AI service error
 *                 value:
 *                   success: true
 *                   aiService:
 *                     status: error
 *                     model: deepseek-chat
 *                     available: false
 *                     lastChecked: "2025-11-07T18:30:00Z"
 *                     error: Connection timeout to AI service
 */