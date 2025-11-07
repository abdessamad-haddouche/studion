/**
 * Express App Swagger Integration
 * @description Setup Swagger/OpenAPI documentation in your Express app
 * @location src/docs/swagger/setup.js
 */

import { swaggerSpec, swaggerUi } from './config.js';

// ==========================================
// SWAGGER MIDDLEWARE SETUP
// ==========================================

/**
 * Setup Swagger documentation middleware
 * @param {Express} app - Express application instance
 */
export const setupSwaggerDocs = (app) => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { 
        background-color: #2c3e50; 
      }
      .swagger-ui .info .title {
        color: #2c3e50;
      }
      .swagger-ui .btn.authorize {
        background-color: #27ae60;
        border-color: #27ae60;
      }
    `,
    customSiteTitle: "Studion API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true
    }
  };

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  console.log('📚 Swagger documentation available at:');
  console.log(`   🌐 UI: http://localhost:5000/api-docs`);
  console.log(`   📄 JSON: http://localhost:5000/api-docs.json`);
};

export default setupSwaggerDocs;