/**
 * Transaction and Points System Routes Swagger Documentation
 * @description OpenAPI documentation for transaction history, points management, and payment endpoints
 * @location src/docs/swagger/transaction-routes-docs.js
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 650a1b2c3d4e5f6789012345
 *         userId:
 *           type: string
 *           example: 650a1b2c3d4e5f6789012346
 *         type:
 *           type: string
 *           enum: [quiz_completion, course_purchase, daily_bonus, course_discount, premium_feature]
 *           example: quiz_completion
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *           example: completed
 *         description:
 *           type: string
 *           example: Points earned for completing Machine Learning Quiz
 *         amount:
 *           type: number
 *           description: Monetary amount (if applicable)
 *           example: 79.99
 *         pointsEarned:
 *           type: number
 *           example: 50
 *         pointsUsed:
 *           type: number
 *           example: 0
 *         category:
 *           type: string
 *           enum: [points_earning, points_spending, monetary]
 *           example: points_earning
 *         relatedEntity:
 *           type: object
 *           properties:
 *             quizId:
 *               type: string
 *               example: 650a1b2c3d4e5f6789012347
 *             courseId:
 *               type: string
 *               example: 650a1b2c3d4e5f6789012348
 *         metadata:
 *           type: object
 *           properties:
 *             source:
 *               type: string
 *               example: web
 *             ipAddress:
 *               type: string
 *               example: 192.168.1.1
 *             userAgent:
 *               type: string
 *               example: Mozilla/5.0...
 *         createdAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 * 
 *     TransactionHistory:
 *       type: object
 *       properties:
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *             total:
 *               type: integer
 *               example: 150
 *             pages:
 *               type: integer
 *               example: 8
 * 
 *     TransactionStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             totalTransactions:
 *               type: number
 *               example: 45
 *             totalPointsEarned:
 *               type: number
 *               example: 2500
 *             totalPointsSpent:
 *               type: number
 *               example: 800
 *             totalMonetaryValue:
 *               type: number
 *               example: 299.97
 *         breakdown:
 *           type: object
 *           properties:
 *             byType:
 *               type: object
 *               properties:
 *                 quiz_completion:
 *                   type: number
 *                   example: 25
 *                 course_purchase:
 *                   type: number
 *                   example: 3
 *                 daily_bonus:
 *                   type: number
 *                   example: 15
 *             byCategory:
 *               type: object
 *               properties:
 *                 points_earning:
 *                   type: number
 *                   example: 40
 *                 points_spending:
 *                   type: number
 *                   example: 3
 *                 monetary:
 *                   type: number
 *                   example: 2
 *         trends:
 *           type: object
 *           properties:
 *             thisWeek:
 *               type: number
 *               example: 150
 *             thisMonth:
 *               type: number
 *               example: 600
 *             lastMonth:
 *               type: number
 *               example: 450
 * 
 *     PointsBalance:
 *       type: object
 *       properties:
 *         balance:
 *           type: number
 *           description: Current available points
 *           example: 1700
 *         totalEarned:
 *           type: number
 *           description: Total points earned all time
 *           example: 2500
 *         totalSpent:
 *           type: number
 *           description: Total points spent all time
 *           example: 800
 *         recentEarnings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: quiz_completion
 *               points:
 *                 type: number
 *                 example: 50
 *               description:
 *                 type: string
 *                 example: Completed React Fundamentals Quiz
 *               earnedAt:
 *                 type: string
 *                 format: date-time
 * 
 *     CourseDiscountValidation:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *           example: true
 *         pointsToUse:
 *           type: number
 *           example: 1000
 *         originalPrice:
 *           type: number
 *           example: 79.99
 *         discount:
 *           type: number
 *           example: 10.00
 *         finalPrice:
 *           type: number
 *           example: 69.99
 *         userPointsBalance:
 *           type: number
 *           example: 1700
 *         remainingPoints:
 *           type: number
 *           example: 700
 *         discountPercentage:
 *           type: number
 *           example: 12.5
 * 
 *     PointsSpendingRequest:
 *       type: object
 *       required:
 *         - type
 *         - pointsUsed
 *         - description
 *       properties:
 *         type:
 *           type: string
 *           enum: [course_discount, premium_feature, avatar_unlock, theme_unlock]
 *           example: course_discount
 *         pointsUsed:
 *           type: number
 *           minimum: 1
 *           example: 1000
 *         description:
 *           type: string
 *           example: Course discount for React Fundamentals
 *         amount:
 *           type: number
 *           minimum: 0
 *           example: 10.00
 *         courseId:
 *           type: string
 *           example: 650a1b2c3d4e5f6789012348
 *         metadata:
 *           type: object
 *           properties:
 *             originalPrice:
 *               type: number
 *               example: 79.99
 *             finalPrice:
 *               type: number
 *               example: 69.99
 *             discountPercentage:
 *               type: number
 *               example: 12.5
 */

/**
 * @swagger
 * /transactions/history:
 *   get:
 *     summary: Get transaction history
 *     description: Retrieve user's transaction history with filtering and pagination
 *     tags: [Transaction History]
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
 *           enum: [quiz_completion, course_purchase, daily_bonus, course_discount, premium_feature]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         description: Filter by transaction status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [points_earning, points_spending, monetary]
 *         description: Filter by transaction category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions from this date
 *         example: 2025-01-01T00:00:00Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions to this date
 *         example: 2025-12-31T23:59:59Z
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
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
 *                   example: Transaction history retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
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
 *                       example: 150
 *                     pages:
 *                       type: integer
 *                       example: 8
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: Invalid transaction type
 *                 code: INVALID_TRANSACTION_TYPE
 *                 validTypes: [quiz_completion, course_purchase, daily_bonus, course_discount, premium_feature]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     description: Retrieve comprehensive transaction statistics for the authenticated user
 *     tags: [Transaction Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, week, month, year]
 *           default: all
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Transaction statistics retrieved successfully
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
 *                   example: Transaction statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TransactionStats'
 *       400:
 *         description: Invalid period parameter
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
 * /transactions/{transactionId}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve detailed information about a specific transaction
 *     tags: [Transaction History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
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
 *                   example: Transaction retrieved successfully
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Transaction'
 *                     - type: object
 *                       properties:
 *                         quiz:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             title:
 *                               type: string
 *                             difficulty:
 *                               type: string
 *                         course:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             title:
 *                               type: string
 *                             price:
 *                               type: number
 *       404:
 *         description: Transaction not found
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
 * /transactions/points/balance:
 *   get:
 *     summary: Get points balance
 *     description: Retrieve user's current points balance with detailed breakdown and recent earnings
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
 * /transactions/validate-course-discount:
 *   post:
 *     summary: Validate course discount with points
 *     description: Validate if user can use specified points for course discount and calculate final price
 *     tags: [Points System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pointsToUse
 *               - coursePrice
 *             properties:
 *               pointsToUse:
 *                 type: number
 *                 minimum: 1
 *                 example: 1000
 *                 description: Number of points to use for discount
 *               coursePrice:
 *                 type: number
 *                 minimum: 0
 *                 example: 79.99
 *                 description: Original course price
 *           example:
 *             pointsToUse: 1000
 *             coursePrice: 79.99
 *     responses:
 *       200:
 *         description: Discount validation successful
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
 *                   example: Course discount validation successful
 *                 data:
 *                   $ref: '#/components/schemas/CourseDiscountValidation'
 *       400:
 *         description: Validation failed or insufficient points
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Course discount validation failed
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: Insufficient points balance
 *                 error:
 *                   type: string
 *                   example: User has 500 points but requested 1000
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /transactions/spend-points:
 *   post:
 *     summary: Create points spending transaction
 *     description: Create a transaction to spend user points for course discounts, premium features, etc.
 *     tags: [Points System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointsSpendingRequest'
 *           examples:
 *             course_discount:
 *               summary: Course discount purchase
 *               value:
 *                 type: course_discount
 *                 pointsUsed: 1000
 *                 description: Course discount for React Fundamentals
 *                 amount: 10.00
 *                 courseId: 650a1b2c3d4e5f6789012348
 *                 metadata:
 *                   originalPrice: 79.99
 *                   finalPrice: 69.99
 *                   discountPercentage: 12.5
 *             premium_feature:
 *               summary: Premium feature unlock
 *               value:
 *                 type: premium_feature
 *                 pointsUsed: 500
 *                 description: Unlock advanced quiz analytics
 *                 metadata:
 *                   feature: advanced_analytics
 *                   duration: monthly
 *     responses:
 *       201:
 *         description: Points spending transaction created successfully
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
 *                   example: Points spending transaction created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     pointsUsed:
 *                       type: number
 *                       example: 1000
 *                     remainingPoints:
 *                       type: number
 *                       example: 700
 *       400:
 *         description: Invalid request data or insufficient points
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_data:
 *                 summary: Missing required data
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Transaction type, points used, and description are required
 *                     code: MISSING_TRANSACTION_DATA
 *               insufficient_points:
 *                 summary: Insufficient points
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Insufficient points balance
 *                     code: INSUFFICIENT_POINTS
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */