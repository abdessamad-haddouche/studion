/**
 * Admin Management Routes Swagger Documentation
 * @description OpenAPI documentation for all admin management, dashboard, and system administration endpoints
 * @location src/docs/swagger/admin-routes-docs.js
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 650a1b2c3d4e5f6789012345
 *         email:
 *           type: string
 *           format: email
 *           example: admin@studion.com
 *         name:
 *           type: object
 *           properties:
 *             first:
 *               type: string
 *               example: John
 *             last:
 *               type: string
 *               example: Admin
 *         fullName:
 *           type: string
 *           example: John Admin
 *         userType:
 *           type: string
 *           enum: [admin]
 *           example: admin
 *         adminInfo:
 *           type: object
 *           properties:
 *             role:
 *               type: string
 *               enum: [super_admin, admin, moderator]
 *               example: admin
 *             department:
 *               type: string
 *               example: Education
 *             permissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: [users:read, users:update, courses:manage]
 *             isActive:
 *               type: boolean
 *               example: true
 *             lastAccess:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     StudentUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 650a1b2c3d4e5f6789012346
 *         email:
 *           type: string
 *           format: email
 *           example: student@example.com
 *         name:
 *           type: object
 *           properties:
 *             first:
 *               type: string
 *               example: Jane
 *             last:
 *               type: string
 *               example: Student
 *         userType:
 *           type: string
 *           enum: [student]
 *           example: student
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: active
 *         academicInfo:
 *           type: object
 *           properties:
 *             level:
 *               type: string
 *               example: undergraduate
 *             institution:
 *               type: string
 *               example: University of Technology
 *             fieldOfStudy:
 *               type: string
 *               example: Computer Science
 *         pointsBalance:
 *           type: number
 *           example: 2500
 *         statistics:
 *           type: object
 *           properties:
 *             documentsUploaded:
 *               type: number
 *               example: 15
 *             quizzesCompleted:
 *               type: number
 *               example: 42
 *             averageScore:
 *               type: number
 *               example: 85.6
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastActiveAt:
 *           type: string
 *           format: date-time
 * 
 *     AdminDashboard:
 *       type: object
 *       properties:
 *         admin:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: John Admin
 *             role:
 *               type: string
 *               example: super_admin
 *             lastAccess:
 *               type: string
 *               format: date-time
 *         users:
 *           type: object
 *           properties:
 *             totalUsers:
 *               type: number
 *               example: 1250
 *             activeUsers:
 *               type: number
 *               example: 980
 *             newUsersToday:
 *               type: number
 *               example: 15
 *             newUsersThisWeek:
 *               type: number
 *               example: 85
 *         courses:
 *           type: object
 *           properties:
 *             totalCourses:
 *               type: number
 *               example: 150
 *             activeCourses:
 *               type: number
 *               example: 142
 *             featuredCourses:
 *               type: number
 *               example: 25
 *         documents:
 *           type: object
 *           properties:
 *             totalDocuments:
 *               type: number
 *               example: 3500
 *             processedDocuments:
 *               type: number
 *               example: 3200
 *             pendingDocuments:
 *               type: number
 *               example: 300
 *         quizzes:
 *           type: object
 *           properties:
 *             totalQuizzes:
 *               type: number
 *               example: 1800
 *             completedAttempts:
 *               type: number
 *               example: 15000
 *             averageScore:
 *               type: number
 *               example: 78.5
 *         revenue:
 *           type: object
 *           properties:
 *             totalRevenue:
 *               type: number
 *               example: 125000.50
 *             monthlyRevenue:
 *               type: number
 *               example: 12500.00
 *             revenueGrowth:
 *               type: number
 *               example: 8.5
 * 
 *     UserManagementList:
 *       type: object
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StudentUser'
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
 *               example: 1250
 *             pages:
 *               type: integer
 *               example: 63
 *         filters:
 *           type: object
 *           properties:
 *             userType:
 *               type: string
 *               example: student
 *             status:
 *               type: string
 *               example: active
 *             search:
 *               type: string
 *               example: john
 * 
 *     SystemAnalytics:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           properties:
 *             totalUsers:
 *               type: number
 *               example: 1250
 *             totalCourses:
 *               type: number
 *               example: 150
 *             totalDocuments:
 *               type: number
 *               example: 3500
 *             totalQuizzes:
 *               type: number
 *               example: 1800
 *         growth:
 *           type: object
 *           properties:
 *             userGrowth:
 *               type: object
 *               properties:
 *                 thisMonth:
 *                   type: number
 *                   example: 85
 *                 lastMonth:
 *                   type: number
 *                   example: 72
 *                 growthRate:
 *                   type: number
 *                   example: 18.1
 *         engagement:
 *           type: object
 *           properties:
 *             dailyActiveUsers:
 *               type: number
 *               example: 320
 *             weeklyActiveUsers:
 *               type: number
 *               example: 780
 *             averageSessionTime:
 *               type: number
 *               example: 45.5
 *         performance:
 *           type: object
 *           properties:
 *             averageQuizScore:
 *               type: number
 *               example: 78.5
 *             courseCompletionRate:
 *               type: number
 *               example: 65.3
 *             documentProcessingRate:
 *               type: number
 *               example: 91.4
 * 
 *     AdminCreateRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: newadmin@studion.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: SecureAdminPass123!
 *         name:
 *           type: object
 *           required:
 *             - first
 *             - last
 *           properties:
 *             first:
 *               type: string
 *               example: John
 *             last:
 *               type: string
 *               example: NewAdmin
 *         role:
 *           type: string
 *           enum: [admin, moderator]
 *           default: admin
 *           example: admin
 *         department:
 *           type: string
 *           default: General
 *           example: Education
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           default: []
 *           example: [users:read, users:update, courses:read]
 * 
 *     UserStatusUpdateRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: suspended
 *         reason:
 *           type: string
 *           example: Violation of terms of service
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     description: Retrieve comprehensive dashboard data including system overview, user statistics, and analytics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AdminDashboard'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: Admin access required
 *                 code: FORBIDDEN
 */

/**
 * @swagger
 * /admin/admins:
 *   post:
 *     summary: Create new admin user
 *     description: Create a new admin user (Super Admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreateRequest'
 *           example:
 *             email: newadmin@studion.com
 *             password: SecureAdminPass123!
 *             name:
 *               first: John
 *               last: NewAdmin
 *             role: admin
 *             department: Education
 *             permissions: [users:read, users:update, courses:read]
 *     responses:
 *       201:
 *         description: Admin created successfully
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
 *                   example: Admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/AdminUser'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Email, password, first name, and last name are required
 *                     code: BAD_REQUEST
 *               invalid_role:
 *                 summary: Invalid admin role
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Invalid admin role. Only admin and moderator can be created
 *                     code: BAD_REQUEST
 *       403:
 *         description: Super admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   get:
 *     summary: Get all admin users
 *     description: Retrieve all admin users (Super Admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin users retrieved successfully
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
 *                     admins:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminUser'
 *       403:
 *         description: Super admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /admin/admins/{adminId}:
 *   put:
 *     summary: Update admin user
 *     description: Update admin role, permissions, or status (Super Admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, moderator]
 *                 example: moderator
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [users:read, courses:read]
 *               isActive:
 *                 type: boolean
 *                 example: true
 *           example:
 *             role: moderator
 *             permissions: [users:read, courses:read]
 *             isActive: true
 *     responses:
 *       200:
 *         description: Admin updated successfully
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
 *                   example: Admin updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/AdminUser'
 *       400:
 *         description: Cannot modify own account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Super admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users with pagination and filtering (Admin only)
 *     tags: [User Management]
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
 *         description: Number of users per page
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [student, admin]
 *         description: Filter by user type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by user status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserManagementList'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve detailed information about a specific user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/StudentUser'
 *       403:
 *         description: Admin access required
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
 */

/**
 * @swagger
 * /admin/users/{userId}/status:
 *   put:
 *     summary: Update user status
 *     description: Update user status to active, inactive, or suspended (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserStatusUpdateRequest'
 *           example:
 *             status: suspended
 *             reason: Violation of terms of service
 *     responses:
 *       200:
 *         description: User status updated successfully
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
 *                   example: User status updated to suspended
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/StudentUser'
 *       400:
 *         description: Invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
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
 */

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account (Super Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted successfully
 *       403:
 *         description: Super admin access required
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
 */

/**
 * @swagger
 * /admin/stats/users:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve comprehensive user statistics and metrics (Admin only)
 *     tags: [Admin Analytics]
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                           example: 1250
 *                         activeUsers:
 *                           type: number
 *                           example: 980
 *                         newUsersThisMonth:
 *                           type: number
 *                           example: 85
 *                         userGrowthRate:
 *                           type: number
 *                           example: 8.5
 *                         usersByStatus:
 *                           type: object
 *                           properties:
 *                             active:
 *                               type: number
 *                               example: 980
 *                             inactive:
 *                               type: number
 *                               example: 200
 *                             suspended:
 *                               type: number
 *                               example: 70
 *                         topInstitutions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               institution:
 *                                 type: string
 *                                 example: University of Technology
 *                               count:
 *                                 type: number
 *                                 example: 150
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get system analytics
 *     description: Retrieve comprehensive system analytics and performance metrics (Admin only)
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemAnalytics'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */