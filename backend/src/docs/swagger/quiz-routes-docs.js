/**
 * Enhanced Quiz System Routes Swagger Documentation
 * @description OpenAPI documentation for enhanced quiz system with bulk collection support
 * @location src/docs/swagger/enhanced-quiz-routes-docs.js
 */

/**
 * @swagger
 * /quizzes/generate:
 *   post:
 *     summary: Generate or select quiz
 *     description: Generate a custom quiz or select from pre-generated collection based on criteria
 *     tags: [Quiz Generation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *             properties:
 *               documentId:
 *                 type: string
 *                 example: 650a1b2c3d4e5f6789012345
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 default: medium
 *                 example: medium
 *               questionType:
 *                 type: string
 *                 enum: [multiple_choice, true_false, fill_blank]
 *                 example: multiple_choice
 *               questionCount:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: If specified and not 20, creates custom quiz
 *                 example: 15
 *               title:
 *                 type: string
 *                 description: Custom quiz title
 *                 example: My Custom React Quiz
 *           examples:
 *             select_existing:
 *               summary: Select from pre-generated collection
 *               value:
 *                 documentId: 650a1b2c3d4e5f6789012345
 *                 difficulty: medium
 *                 questionType: multiple_choice
 *             custom_quiz:
 *               summary: Generate custom quiz
 *               value:
 *                 documentId: 650a1b2c3d4e5f6789012345
 *                 difficulty: hard
 *                 questionCount: 15
 *                 title: Advanced React Concepts Quiz
 *     responses:
 *       200:
 *         description: Quiz selected from collection successfully
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
 *                   example: Quiz selected successfully
 *                 quiz:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 650a1b2c3d4e5f6789012347
 *                     title:
 *                       type: string
 *                       example: React Fundamentals Quiz - Medium
 *                     description:
 *                       type: string
 *                       example: Test your knowledge of React fundamentals
 *                     difficulty:
 *                       type: string
 *                       example: medium
 *                     questionType:
 *                       type: string
 *                       example: multiple_choice
 *                     questionCount:
 *                       type: integer
 *                       example: 20
 *                     estimatedTime:
 *                       type: integer
 *                       description: Estimated time in minutes
 *                       example: 25
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           question:
 *                             type: string
 *                             example: What is JSX in React?
 *                           options:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"]
 *                           type:
 *                             type: string
 *                             example: multiple_choice
 *       201:
 *         description: Custom quiz created successfully
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
 *                   example: Custom quiz created successfully
 *                 quiz:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     questionCount:
 *                       type: integer
 *                     estimatedTime:
 *                       type: integer
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid request or document not processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               document_not_processed:
 *                 summary: Document not processed
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Document must be processed before generating quizzes
 *                     code: DOCUMENT_NOT_PROCESSED
 *                     context:
 *                       currentStatus: pending
 *               insufficient_questions:
 *                 summary: Not enough questions available
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Not enough questions available. Found 10, requested 15
 *                     code: INSUFFICIENT_QUESTIONS
 *       404:
 *         description: Document not found or no quizzes available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /quizzes/document/{documentId}:
 *   get:
 *     summary: Get quizzes for document
 *     description: Retrieve all pre-generated quizzes for a specific document
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty
 *       - in: query
 *         name: questionType
 *         schema:
 *           type: string
 *           enum: [multiple_choice, true_false, fill_blank]
 *         description: Filter by question type
 *       - in: query
 *         name: excludeUsed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Exclude already attempted quizzes
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Maximum number of quizzes to return
 *     responses:
 *       200:
 *         description: Document quizzes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 quizzes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       quizId:
 *                         type: string
 *                         example: 650a1b2c3d4e5f6789012347
 *                       title:
 *                         type: string
 *                         example: React Fundamentals Quiz - Easy
 *                       difficulty:
 *                         type: string
 *                         example: easy
 *                       questionType:
 *                         type: string
 *                         example: multiple_choice
 *                       questionCount:
 *                         type: integer
 *                         example: 20
 *                       isUsed:
 *                         type: boolean
 *                         example: false
 *                       estimatedTime:
 *                         type: integer
 *                         example: 20
 *                 total:
 *                   type: integer
 *                   example: 15
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /quizzes/document/{documentId}/stats:
 *   get:
 *     summary: Get document quiz statistics
 *     description: Retrieve statistics about quiz collection for a document
 *     tags: [Quiz Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Quiz statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalQuizzes:
 *                       type: integer
 *                       example: 15
 *                     byDifficulty:
 *                       type: object
 *                       properties:
 *                         easy:
 *                           type: integer
 *                           example: 5
 *                         medium:
 *                           type: integer
 *                           example: 5
 *                         hard:
 *                           type: integer
 *                           example: 5
 *                     byQuestionType:
 *                       type: object
 *                       properties:
 *                         multiple_choice:
 *                           type: integer
 *                           example: 10
 *                         true_false:
 *                           type: integer
 *                           example: 5
 *                     totalQuestions:
 *                       type: integer
 *                       example: 300
 *                     averageQuestions:
 *                       type: number
 *                       example: 20
 *                     usageStats:
 *                       type: object
 *                       properties:
 *                         totalAttempts:
 *                           type: integer
 *                           example: 45
 *                         averageScore:
 *                           type: number
 *                           example: 78.5
 */

/**
 * @swagger
 * /quizzes/document/{documentId}/select:
 *   post:
 *     summary: Select random quiz
 *     description: Select a random quiz from the document's pre-generated collection
 *     tags: [Quiz Generation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 example: medium
 *               questionType:
 *                 type: string
 *                 enum: [multiple_choice, true_false, fill_blank]
 *                 example: multiple_choice
 *           example:
 *             difficulty: medium
 *             questionType: multiple_choice
 *     responses:
 *       200:
 *         description: Quiz selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 quiz:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 650a1b2c3d4e5f6789012347
 *                     title:
 *                       type: string
 *                       example: React Fundamentals Quiz - Medium
 *                     difficulty:
 *                       type: string
 *                       example: medium
 *                     questionType:
 *                       type: string
 *                       example: multiple_choice
 *                     questionCount:
 *                       type: integer
 *                       example: 20
 *                     estimatedTime:
 *                       type: integer
 *                       example: 25
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           question:
 *                             type: string
 *                           options:
 *                             type: array
 *                             items:
 *                               type: string
 *                           type:
 *                             type: string
 *       404:
 *         description: No quizzes available for criteria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /quizzes/{id}/attempt:
 *   post:
 *     summary: Start quiz attempt
 *     description: Start a new attempt for the specified quiz
 *     tags: [Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       201:
 *         description: Quiz attempt started successfully
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
 *                   example: Quiz attempt started successfully
 *                 attempt:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 650a1b2c3d4e5f6789012349
 *                     quizId:
 *                       type: string
 *                       example: 650a1b2c3d4e5f6789012347
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       example: in_progress
 *                     timeLimit:
 *                       type: number
 *                       description: Time limit in milliseconds
 *                       example: 1800000
 *                 quiz:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     questionCount:
 *                       type: integer
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *       200:
 *         description: Existing attempt found
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
 *                   example: Existing attempt found
 *                 attempt:
 *                   type: object
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /quizzes/{id}/attempt/{attemptId}:
 *   put:
 *     summary: Submit quiz answer
 *     description: Submit answer for a specific question in the quiz attempt
 *     tags: [Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attempt ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - answer
 *             properties:
 *               questionId:
 *                 type: integer
 *                 example: 1
 *               answer:
 *                 oneOf:
 *                   - type: string
 *                   - type: integer
 *                   - type: boolean
 *                 example: 0
 *                 description: Answer (index for multiple choice, true/false for boolean, text for fill-in)
 *               timeSpent:
 *                 type: number
 *                 default: 0
 *                 example: 45.5
 *                 description: Time spent on question in seconds
 *           examples:
 *             multiple_choice:
 *               summary: Multiple choice answer
 *               value:
 *                 questionId: 1
 *                 answer: 0
 *                 timeSpent: 30.2
 *             true_false:
 *               summary: True/false answer
 *               value:
 *                 questionId: 2
 *                 answer: true
 *                 timeSpent: 15.8
 *             fill_blank:
 *               summary: Fill in the blank answer
 *               value:
 *                 questionId: 3
 *                 answer: "useState"
 *                 timeSpent: 60.1
 *     responses:
 *       200:
 *         description: Answer submitted successfully
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
 *                   example: Answer submitted successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                       example: 1
 *                     isCorrect:
 *                       type: boolean
 *                       example: true
 *                     pointsEarned:
 *                       type: number
 *                       example: 10
 *                     correctAnswer:
 *                       type: string
 *                       example: "JavaScript XML"
 *                     explanation:
 *                       type: string
 *                       example: "JSX stands for JavaScript XML and allows you to write HTML-like syntax in JavaScript."
 *                     personalizedFeedback:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: [strength, weakness]
 *                           example: strength
 *                         message:
 *                           type: string
 *                           example: "Great understanding of JSX fundamentals!"
 *                         skillCategory:
 *                           type: string
 *                           example: "React Basics"
 *                         topicArea:
 *                           type: string
 *                           example: "JSX and Components"
 *                     currentScore:
 *                       type: integer
 *                       example: 8
 *                     answeredQuestions:
 *                       type: integer
 *                       example: 10
 *                     totalQuestions:
 *                       type: integer
 *                       example: 20
 *                     totalPointsEarned:
 *                       type: number
 *                       example: 85
 *                     isQuizComplete:
 *                       type: boolean
 *                       example: false
 *                     percentage:
 *                       type: number
 *                       example: 80.0
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Quiz attempt not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /quizzes/{id}/attempt/{attemptId}/complete:
 *   post:
 *     summary: Complete quiz attempt
 *     description: Complete the quiz attempt and get final results with personalized feedback
 *     tags: [Quiz Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attempt ID
 *     responses:
 *       200:
 *         description: Quiz completed successfully
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
 *                   example: Quiz attempt completed successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     attemptId:
 *                       type: string
 *                       example: 650a1b2c3d4e5f6789012349
 *                     score:
 *                       type: integer
 *                       example: 16
 *                     percentage:
 *                       type: number
 *                       example: 80.0
 *                     pointsEarned:
 *                       type: number
 *                       example: 160
 *                     timeSpent:
 *                       type: number
 *                       description: Time spent in milliseconds
 *                       example: 1200000
 *                     performanceLevel:
 *                       type: string
 *                       enum: [excellent, good, average, needs_improvement]
 *                       example: good
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     feedback:
 *                       type: object
 *                       properties:
 *                         overall:
 *                           type: string
 *                           example: "Good performance! You demonstrate solid understanding of React fundamentals."
 *                         strengths:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["JSX and Components", "State Management"]
 *                         weaknesses:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Event Handling", "Lifecycle Methods"]
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Practice more with event handlers", "Review React lifecycle documentation"]
 *       404:
 *         description: Quiz attempt not found or already completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /quizzes/stats:
 *   get:
 *     summary: Get user quiz statistics
 *     description: Retrieve comprehensive quiz performance statistics for the authenticated user
 *     tags: [Quiz Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quiz statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     attempts:
 *                       type: object
 *                       properties:
 *                         totalAttempts:
 *                           type: integer
 *                           example: 45
 *                         averageScore:
 *                           type: number
 *                           example: 78.5
 *                         totalPointsEarned:
 *                           type: number
 *                           example: 3500
 *                         passRate:
 *                           type: number
 *                           example: 82.2
 *                         averageTimeMinutes:
 *                           type: number
 *                           example: 22.5
 *                     quizzes:
 *                       type: object
 *                       properties:
 *                         totalQuizzes:
 *                           type: integer
 *                           example: 25
 *                         activeQuizzes:
 *                           type: integer
 *                           example: 23
 *                         totalAttempts:
 *                           type: integer
 *                           example: 45
 *                         avgDifficulty:
 *                           type: number
 *                           example: 2.1
 *                         categoriesUsed:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["React", "JavaScript", "Node.js"]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /quizzes/history:
 *   get:
 *     summary: Get quiz attempt history
 *     description: Retrieve user's quiz attempt history with filtering and pagination
 *     tags: [Quiz Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_progress, completed, abandoned]
 *         description: Filter by attempt status
 *       - in: query
 *         name: documentId
 *         schema:
 *           type: string
 *         description: Filter by document ID
 *     responses:
 *       200:
 *         description: Quiz history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 attempts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 650a1b2c3d4e5f6789012349
 *                       quiz:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           difficulty:
 *                             type: string
 *                       document:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                       status:
 *                         type: string
 *                         example: completed
 *                       score:
 *                         type: integer
 *                         example: 16
 *                       percentage:
 *                         type: number
 *                         example: 80.0
 *                       pointsEarned:
 *                         type: number
 *                         example: 160
 *                       passed:
 *                         type: boolean
 *                         example: true
 *                       startedAt:
 *                         type: string
 *                         format: date-time
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                       durationMinutes:
 *                         type: number
 *                         example: 22.5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalItems:
 *                       type: integer
 *                       example: 45
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 20
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */