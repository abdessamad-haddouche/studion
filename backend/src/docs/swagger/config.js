/**
 * Swagger Configuration
 * @description OpenAPI documentation setup for Studion API
 * @location src/docs/swagger/config.js
 */

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// ==========================================
// SWAGGER CONFIGURATION
// ==========================================

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Studion API Documentation',
    version: '1.0.0',
    description: 'Comprehensive API documentation for Studion course management platform',
    contact: {
      name: 'Studion API Support',
      email: 'api@studion.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development server',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme'
      },
    },
    schemas: {
      // Success Response Schema
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' }
        }
      },
      
      // Error Response Schema
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Resource not found' },
              code: { type: 'string', example: 'NOT_FOUND' },
              context: { type: 'object' }
            }
          }
        }
      },
      
      // Course Schema
      Course: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '650a1b2c3d4e5f6789012345' },
          title: { type: 'string', example: 'Complete React Development Course' },
          slug: { type: 'string', example: 'complete-react-development-course' },
          description: { type: 'string', example: 'Learn React from basics to advanced concepts' },
          category: { 
            type: 'string', 
            enum: ['programming', 'design', 'business', 'marketing'], 
            example: 'programming' 
          },
          level: { 
            type: 'string', 
            enum: ['beginner', 'intermediate', 'advanced'], 
            example: 'beginner' 
          },
          instructor: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'John Doe' },
              type: { type: 'string', example: 'internal' }
            }
          },
          pricing: {
            type: 'object',
            properties: {
              currency: { type: 'string', example: 'USD' },
              originalPrice: { type: 'number', example: 99.99 },
              currentPrice: { type: 'number', example: 79.99 }
            }
          },
          status: { type: 'string', example: 'active' },
          isFeatured: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      
      // Course Create Request
      CourseCreateRequest: {
        type: 'object',
        required: ['title', 'description', 'category', 'instructor', 'pricing'],
        properties: {
          title: { 
            type: 'string', 
            minLength: 3, 
            maxLength: 200, 
            example: 'Complete React Development Course' 
          },
          description: { 
            type: 'string', 
            minLength: 50, 
            maxLength: 5000, 
            example: 'Learn React from basics to advanced concepts with hands-on projects and real-world examples' 
          },
          category: { 
            type: 'string', 
            enum: ['programming', 'design', 'business', 'marketing'], 
            example: 'programming' 
          },
          level: { 
            type: 'string', 
            enum: ['beginner', 'intermediate', 'advanced'], 
            example: 'beginner' 
          },
          instructor: {
            type: 'object',
            required: ['name', 'type'],
            properties: {
              name: { type: 'string', example: 'John Doe' },
              type: { type: 'string', enum: ['internal', 'external'], example: 'internal' }
            }
          },
          pricing: {
            type: 'object',
            required: ['originalPrice', 'currentPrice'],
            properties: {
              originalPrice: { type: 'number', minimum: 0, example: 99.99 },
              currentPrice: { type: 'number', minimum: 0, example: 79.99 },
              currency: { type: 'string', default: 'USD' }
            }
          }
        }
      }
    }
  },
  tags: [
    { name: 'Authentication', description: 'User authentication and authorization' },
    { name: 'User Profile', description: 'User profile management and updates' },
    { name: 'User Analytics', description: 'User statistics and performance data' },
    { name: 'Points System', description: 'User points balance and transactions' },
    { name: 'Focus Timer', description: 'Study focus timer sessions' },
    { name: 'Document Management', description: 'Document upload and management' },
    { name: 'AI Processing', description: 'AI-powered document processing' },
    { name: 'Document Analytics', description: 'Document usage analytics' },
    { name: 'AI Service', description: 'AI service status and health' },
    { name: 'Quiz Generation', description: 'AI-powered quiz generation and selection' },
    { name: 'Quiz Management', description: 'Quiz browsing and management' },
    { name: 'Quiz Attempts', description: 'Taking and submitting quizzes' },
    { name: 'Quiz Analytics', description: 'Quiz performance analytics' },
    { name: 'Transaction History', description: 'User transaction history and details' },
    { name: 'Transaction Analytics', description: 'Transaction statistics and insights' },
    { name: 'Admin Dashboard', description: 'Admin dashboard and system overview' },
    { name: 'Admin Management', description: 'Admin user creation and management' },
    { name: 'User Management', description: 'User administration and moderation' },
    { name: 'Admin Analytics', description: 'System analytics and reporting' },
    { name: 'Courses - Admin', description: 'Course management (Admin only)' },
    { name: 'Courses - Public', description: 'Public course browsing' },
    { name: 'Courses - Student', description: 'Student course interactions' }
  ]
};

// Options for swagger-jsdoc
const swaggerOptions = {
  swaggerDefinition,
  apis: [
    './src/controllers/*.js',
    './src/docs/swagger/*.js'
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerSpec, swaggerUi };