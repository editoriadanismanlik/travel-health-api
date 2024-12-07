import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel Health Brand Ambassador API',
      version: '1.0.0',
      description: 'API documentation for Travel Health Brand Ambassador Platform',
      contact: {
        name: 'API Support',
        email: 'support@travelhealthapi.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/**/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options); 