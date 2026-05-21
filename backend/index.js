const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation Setup
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Blood Donation API',
    version: '1.0.0',
    description: 'API Documentation for Blood Donation Web Application'
  },
  servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
  paths: {
    '/api/auth/users': { get: { summary: 'Get all registered users', tags: ['Authentication'] } },
    '/api/auth/register': { 
      post: { 
        summary: 'Register a new donor', 
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  contactInfo: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                  location: { type: 'string', example: 'New York' },
                  bloodGroup: { type: 'string', example: 'O+' }
                }
              }
            }
          }
        }
      } 
    },
    '/api/auth/login': { 
      post: { 
        summary: 'Login donor', 
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  contactInfo: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        }
      } 
    },
    '/api/auth/me': { get: { summary: 'Get logged in user profile', tags: ['Authentication'] } },
    '/api/requests/upload': { 
      post: { 
        summary: 'Upload a blood request file', 
        tags: ['Requests'],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        }
      } 
    },
    '/api/requests/notifications': { get: { summary: 'Get notifications for user', tags: ['Requests'] } },
    '/api/requests/track/{id}': { 
      get: { 
        summary: 'Track a request by Tracking ID', 
        tags: ['Requests'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      } 
    },
    '/api/requests/{id}/accept': { 
      post: { 
        summary: 'Accept a blood request', 
        tags: ['Requests'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
      } 
    },
    '/api/requests/complete': { 
      post: { 
        summary: 'Complete donation with Matching ID', 
        tags: ['Requests'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  matchingId: { type: 'string', example: 'A1B2C3' }
                }
              }
            }
          }
        }
      } 
    }
  }
};

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood_donation';

// Start the server first so the localhost link is immediately visible
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('\n======================================');
    console.error('ERROR: Could not connect to MongoDB!');
    console.error('Please make sure MongoDB is installed and running on your computer.');
    console.error('======================================\n', err.message);
  });
