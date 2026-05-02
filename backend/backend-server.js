// backend/server.js - Main Express Server Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const http = require('http');
const socketIo = require('socket.io');

// Import routes and middleware
const authRoutes = require('./routes/auth');
const detectionRoutes = require('./routes/detection');
const adminRoutes = require('./routes/admin');
const fieldRoutes = require('./routes/field');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000' }
});

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Deepfake Detection API',
      version: '1.0.0',
      description: 'Agentic AI for Deepfake Detection and Authenticity Verification'
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development Server' }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ACTIVE', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/detect', authMiddleware, detectionRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/field', authMiddleware, fieldRoutes);

// WebSocket Events for Real-time Detection
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('start-detection', (data) => {
    // Handle real-time detection stream
    console.log('Detection stream started:', data);
    socket.emit('status', { message: 'Detection started', timestamp: Date.now() });
  });

  socket.on('detection-progress', (data) => {
    socket.emit('progress', { ...data, timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler (Must be last middleware)
app.use(errorHandler);

// Server Startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║  Deepfake Detection Server Active        ║
  ║  Port: ${PORT}                        ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}       ║
  ║  API Docs: http://localhost:${PORT}/api-docs   ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, io };
