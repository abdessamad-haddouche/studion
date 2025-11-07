/**
 * Course Routes Swagger Documentation
 * @description OpenAPI documentation for all course-related endpoints
 * @location src/docs/swagger/course-routes-docs.js
 */

/**
 * @swagger
 * /admin/courses:
 *   post:
 *     summary: Create a new course
 *     description: Create a new course (Admin only)
 *     tags: [Courses - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreateRequest'
 *           example:
 *             title: "Complete React Development Course"
 *             description: "Learn React from basics to advanced concepts with hands-on projects and real-world examples. This comprehensive course covers component lifecycle, state management, hooks, routing, and much more."
 *             category: "programming"
 *             level: "beginner"
 *             instructor:
 *               name: "John Doe"
 *               type: "internal"
 *             pricing:
 *               originalPrice: 99.99
 *               currentPrice: 79.99
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 * 
 *   get:
 *     summary: Get all courses (Admin view)
 *     description: Retrieve all courses with admin-level details
 *     tags: [Courses - Admin]
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
 *           default: 10
 *         description: Number of courses per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [programming, design, business, marketing]
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @swagger
 * /admin/courses/{id}:
 *   put:
 *     summary: Update course
 *     description: Update an existing course (Admin only)
 *     tags: [Courses - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               pricing:
 *                 type: object
 *                 properties:
 *                   currentPrice:
 *                     type: number
 *           example:
 *             title: "Updated Course Title"
 *             pricing:
 *               currentPrice: 69.99
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 * 
 *   delete:
 *     summary: Delete course
 *     description: Delete a course (soft delete by default)
 *     tags: [Courses - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: query
 *         name: permanent
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Permanently delete
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /admin/courses/analytics:
 *   get:
 *     summary: Get course analytics
 *     description: Retrieve comprehensive course analytics (Admin only)
 *     tags: [Courses - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalCourses:
 *                           type: integer
 *                           example: 150
 *                         activeCourses:
 *                           type: integer
 *                           example: 142
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses (Public)
 *     description: Browse all active courses
 *     tags: [Courses - Public]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Courses per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [programming, design, business, marketing]
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search courses
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     description: Get detailed course information
 *     tags: [Courses - Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       400:
 *         description: Invalid course ID
 */

/**
 * @swagger
 * /courses/featured:
 *   get:
 *     summary: Get featured courses
 *     description: Retrieve featured courses
 *     tags: [Courses - Public]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of courses
 *     responses:
 *       200:
 *         description: Featured courses retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /courses/recommended:
 *   get:
 *     summary: Get recommended courses
 *     description: Get personalized course recommendations (Student only)
 *     tags: [Courses - Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Student access required
 */

/**
 * @swagger
 * /courses/{id}/calculate-price:
 *   post:
 *     summary: Calculate course price with points
 *     description: Calculate final price after points discount
 *     tags: [Courses - Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointsToUse:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1000
 *           example:
 *             pointsToUse: 1000
 *     responses:
 *       200:
 *         description: Price calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     pricing:
 *                       type: object
 *                       properties:
 *                         originalPrice:
 *                           type: number
 *                           example: 79.99
 *                         pointsUsed:
 *                           type: integer
 *                           example: 1000
 *                         finalPrice:
 *                           type: number
 *                           example: 69.99
 */

/**
 * @swagger
 * /courses/{id}/purchase:
 *   post:
 *     summary: Purchase course
 *     description: Purchase a course with points (MVP)
 *     tags: [Courses - Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointsToUse:
 *                 type: integer
 *                 minimum: 0
 *                 example: 500
 *           example:
 *             pointsToUse: 500
 *     responses:
 *       200:
 *         description: Course purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase:
 *                       type: object
 *                       properties:
 *                         transactionId:
 *                           type: string
 *                           example: "tx_1234567890"
 *                         status:
 *                           type: string
 *                           example: "completed"
 */