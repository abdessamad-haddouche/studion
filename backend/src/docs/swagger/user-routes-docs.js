/**
 * User Management Routes Swagger Documentation
 * @description OpenAPI documentation for all user profile and management endpoints
 * @location src/docs/swagger/user-routes-docs.js
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 650a1b2c3d4e5f6789012345
 *         email:
 *           type: string
 *           format: email
 *           example: student@example.com
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         avatar:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               example: https://example.com/avatar.jpg
 *         academicInfo:
 *           type: object
 *           properties:
 *             level:
 *               type: string
 *               enum: [undergraduate, graduate, phd, professional]
 *               example: undergraduate
 *             institution:
 *               type: string
 *               example: University of Technology
 *             fieldOfStudy:
 *               type: string
 *               example: Computer Science
 *         preferences:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               enum: [light, dark, auto]
 *               example: dark
 *             language:
 *               type: string
 *               example: en
 *             notifications:
 *               type: object
 *               properties:
 *                 email:
 *                   type: boolean
 *                   example: true
 *                 push:
 *                   type: boolean
 *                   example: false
 *         pointsBalance:
 *           type: number
 *           example: 2500
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     UserProfileUpdateRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         bio:
 *           type: string
 *           example: Computer Science student passionate about AI
 *         phoneNumber:
 *           type: string
 *           example: +1234567890
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: 1995-06-15
 * 
 *     UserPreferencesUpdateRequest:
 *       type: object
 *       properties:
 *         theme:
 *           type: string
 *           enum: [light, dark, auto]
 *           example: dark
 *         language:
 *           type: string
 *           example: en
 *         notifications:
 *           type: object
 *           properties:
 *             email:
 *               type: boolean
 *               example: true
 *             push:
 *               type: boolean
 *               example: false
 *             quiz:
 *               type: boolean
 *               example: true
 *             course:
 *               type: boolean
 *               example: true
 *         privacy:
 *           type: object
 *           properties:
 *             profileVisibility:
 *               type: string
 *               enum: [public, private, friends]
 *               example: public
 * 
 *     AcademicInfoUpdateRequest:
 *       type: object
 *       properties:
 *         level:
 *           type: string
 *           enum: [undergraduate, graduate, phd, professional]
 *           example: graduate
 *         institution:
 *           type: string
 *           example: MIT
 *         fieldOfStudy:
 *           type: string
 *           example: Machine Learning
 *         graduationYear:
 *           type: number
 *           example: 2025
 * 
 *     UserStatistics:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           properties:
 *             totalStudyTime:
 *               type: number
 *               description: Total study time in minutes
 *               example: 2400
 *             documentsUploaded:
 *               type: number
 *               example: 15
 *             quizzesCompleted:
 *               type: number
 *               example: 42
 *             coursesEnrolled:
 *               type: number
 *               example: 3
 *         performance:
 *           type: object
 *           properties:
 *             averageQuizScore:
 *               type: number
 *               example: 85.6
 *             streakDays:
 *               type: number
 *               example: 7
 *             pointsEarned:
 *               type: number
 *               example: 3250
 *         recent:
 *           type: object
 *           properties:
 *             lastActive:
 *               type: string
 *               format: date-time
 *             recentAchievements:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Quiz Master", "Study Streak"]
 * 
 *     PointsBalance:
 *       type: object
 *       properties:
 *         current:
 *           type: number
 *           example: 2500
 *         lifetime:
 *           type: number
 *           example: 5000
 *         pending:
 *           type: number
 *           example: 100
 *         breakdown:
 *           type: object
 *           properties:
 *             earned:
 *               type: number
 *               example: 5000
 *             spent:
 *               type: number
 *               example: 2500
 * 
 *     FocusTimerRequest:
 *       type: object
 *       required:
 *         - action
 *       properties:
 *         action:
 *           type: string
 *           enum: [start, complete, cancel]
 *           example: start
 *         duration:
 *           type: number
 *           description: Session duration in minutes (for start action)
 *           example: 25
 *         subject:
 *           type: string
 *           description: Study subject
 *           example: Mathematics
 *         documentId:
 *           type: string
 *           description: Associated document ID
 *           example: 650a1b2c3d4e5f6789012345
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's complete profile information
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                   example: User profile retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   put:
 *     summary: Update user profile
 *     description: Update user profile information (name, bio, contact details)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdateRequest'
 *           example:
 *             firstName: John
 *             lastName: Smith
 *             bio: Updated bio information
 *             phoneNumber: +1234567890
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: No update data provided or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/avatar:
 *   put:
 *     summary: Update user avatar
 *     description: Update user profile picture/avatar URL
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarUrl
 *             properties:
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/new-avatar.jpg
 *           example:
 *             avatarUrl: https://example.com/new-avatar.jpg
 *     responses:
 *       200:
 *         description: Avatar updated successfully
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
 *                   example: Avatar updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                       example: https://example.com/new-avatar.jpg
 *       400:
 *         description: Avatar URL missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/preferences:
 *   put:
 *     summary: Update user preferences
 *     description: Update user application preferences and settings
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferencesUpdateRequest'
 *           example:
 *             theme: dark
 *             language: en
 *             notifications:
 *               email: true
 *               push: false
 *               quiz: true
 *     responses:
 *       200:
 *         description: Preferences updated successfully
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
 *                   example: Preferences updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated preferences object
 *       400:
 *         description: No preferences data provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/academic:
 *   put:
 *     summary: Update academic information
 *     description: Update user's academic background and educational details
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicInfoUpdateRequest'
 *           example:
 *             level: graduate
 *             institution: MIT
 *             fieldOfStudy: Machine Learning
 *             graduationYear: 2025
 *     responses:
 *       200:
 *         description: Academic information updated successfully
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
 *                   example: Academic information updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated academic information
 *       400:
 *         description: No academic data provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve comprehensive learning statistics and performance data
 *     tags: [User Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                   example: User statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserStatistics'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/stats/documents:
 *   get:
 *     summary: Get document usage statistics
 *     description: Retrieve statistics about user's document uploads and processing
 *     tags: [User Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document statistics retrieved successfully
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
 *                   example: Document statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDocuments:
 *                       type: number
 *                       example: 25
 *                     totalSize:
 *                       type: number
 *                       description: Total size in bytes
 *                       example: 52428800
 *                     byType:
 *                       type: object
 *                       properties:
 *                         pdf:
 *                           type: number
 *                           example: 15
 *                         docx:
 *                           type: number
 *                           example: 8
 *                         txt:
 *                           type: number
 *                           example: 2
 *                     recentUploads:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/stats/quizzes:
 *   get:
 *     summary: Get quiz performance statistics
 *     description: Retrieve statistics about user's quiz attempts and performance
 *     tags: [User Analytics]
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
 *                 message:
 *                   type: string
 *                   example: Quiz statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalQuizzes:
 *                       type: number
 *                       example: 42
 *                     averageScore:
 *                       type: number
 *                       example: 85.6
 *                     bestScore:
 *                       type: number
 *                       example: 98.5
 *                     completionRate:
 *                       type: number
 *                       example: 92.3
 *                     streakRecord:
 *                       type: number
 *                       example: 12
 *                     byDifficulty:
 *                       type: object
 *                       properties:
 *                         easy:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                               example: 20
 *                             averageScore:
 *                               type: number
 *                               example: 92.1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/points:
 *   get:
 *     summary: Get points balance
 *     description: Retrieve user's current points balance and breakdown
 *     tags: [Points System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Points balance retrieved successfully
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
 *                   example: Points balance retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PointsBalance'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/points/history:
 *   get:
 *     summary: Get points transaction history
 *     description: Retrieve user's points earning and spending history
 *     tags: [Points System]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of transactions per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [earned, spent, all]
 *           default: all
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Points history retrieved successfully
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
 *                   example: Points history retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [earned, spent]
 *                           amount:
 *                             type: number
 *                           reason:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                 note:
 *                   type: string
 *                   example: Transaction history will be implemented when Transaction service is ready
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/me/focus-timer:
 *   post:
 *     summary: Manage focus timer sessions
 *     description: Start, complete, or cancel focus timer sessions for studying
 *     tags: [Focus Timer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FocusTimerRequest'
 *           examples:
 *             start:
 *               summary: Start a focus session
 *               value:
 *                 action: start
 *                 duration: 25
 *                 subject: Mathematics
 *                 documentId: 650a1b2c3d4e5f6789012345
 *             complete:
 *               summary: Complete a focus session
 *               value:
 *                 action: complete
 *             cancel:
 *               summary: Cancel a focus session
 *               value:
 *                 action: cancel
 *     responses:
 *       200:
 *         description: Focus timer action successful
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
 *                   example: Focus timer start successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: 650a1b2c3d4e5f6789012346
 *                     status:
 *                       type: string
 *                       enum: [active, completed, cancelled]
 *                       example: active
 *                     duration:
 *                       type: number
 *                       example: 25
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                     pointsEarned:
 *                       type: number
 *                       example: 50
 *       400:
 *         description: Invalid action or missing required data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */