# Complete Setup Guide - Deepfake Detection System

## Prerequisites
- Node.js v16+
- npm or yarn
- MongoDB (local or Atlas)
- PostgreSQL (optional, for relational data)
- Git

## Installation & Setup Instructions

### 1. BACKEND SETUP

```bash
# Clone project
mkdir deepfake-detection-system && cd deepfake-detection-system

# Backend directory
mkdir backend && cd backend

# Initialize package.json (use the provided backend-package.json)
npm init -y
npm install express express-jwt jsonwebtoken bcryptjs dotenv mongoose pg sequelize \
  cors multer axios tensorflow onnxruntime-node @tensorflow/tfjs \
  @tensorflow/tfjs-core express-rate-limit helmet morgan \
  swagger-ui-express swagger-jsdoc socket.io node-cache uuid joi winston \
  speakeasy qrcode

# Create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
CLIENT_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/deepfake-detection
POSTGRESQL_URL=postgresql://user:password@localhost:5432/deepfake_db

# Model Configuration
MODEL_PATH=./models
MAX_FILE_SIZE=500000000

# Security
BCRYPT_ROUNDS=10
TOKEN_EXPIRY=24h
MFA_WINDOW=2

# Email (Optional)
SMTP_HOST=your-email-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
EOF

# Create directory structure
mkdir -p routes middleware services models utils config

# Copy the backend files
# server.js → ./server.js
# backend-auth-middleware.js → ./middleware/auth.js
# backend-detection-engine.js → ./services/detectionEngine.js

npm start
```

### 2. FRONTEND SETUP

```bash
# In a new terminal, navigate back and create frontend
cd ..
mkdir frontend && cd frontend

# Initialize React app
npx create-react-app .

# Install dependencies
npm install react-router-dom axios redux react-redux @reduxjs/toolkit \
  tailwindcss socket.io-client recharts react-dropzone react-hot-toast \
  crypto-js date-fns clsx uuid zustand framer-motion react-icons headlessui \
  postcss autoprefixer

# Configure Tailwind CSS
npx tailwindcss init -p

# Create .env file
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
EOF

# Create directory structure
mkdir -p src/components src/pages src/services src/store src/utils src/styles

# Copy frontend files
# frontend-App.jsx → ./src/App.jsx
# frontend-DetectionUpload.jsx → ./src/components/DetectionUpload.jsx
# frontend-stores.js → ./src/store/authStore.js

# Update tailwind.config.js
cat > tailwind.config.js << 'EOF'
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
      }
    },
  },
  plugins: [],
}
EOF

npm start
```

### 3. EDGE AGENT SETUP

```bash
# Create edge agent
cd ..
mkdir edge-agent && cd edge-agent

npm init -y
npm install axios zustand qrcode-reader --save

# For mobile/React Native
npm install react-native-tflite react-native-fs react-native-vision-camera

# Copy edge agent files
# edge-agent-offline-engine.js → ./src/offlineDetectionEngine.js

npm start
```

### 4. DATABASE SETUP

#### MongoDB (Local)
```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install -y mongodb-org

# Start MongoDB
mongod

# Create database and collections
mongo
> use deepfake-detection
> db.createCollection("users")
> db.createCollection("detections")
> db.createCollection("audit_logs")
> db.users.createIndex({ "email": 1 }, { unique: true })
```

#### PostgreSQL (Optional)
```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database and tables
psql -U postgres
> CREATE DATABASE deepfake_db;
> \c deepfake_db

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create detections table
CREATE TABLE detections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  file_name VARCHAR(255),
  media_type VARCHAR(50),
  confidence DECIMAL(3,2),
  is_fake BOOLEAN,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit logs table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255),
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing the System

### 1. Test Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

### 2. Test Detection

```bash
# Upload and detect video
curl -X POST http://localhost:5000/api/detect/video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample-video.mp4"
```

### 3. Test Edge Agent Offline Detection

```bash
# In edge-agent directory
node -e "
const OfflineDetectionEngine = require('./src/offlineDetectionEngine');
const engine = new OfflineDetectionEngine();
engine.initialize().then(() => {
  console.log('Edge agent initialized and ready for offline detection');
});
"
```

## Project Structure Summary

```
deepfake-detection-system/
├── backend/
│   ├── server.js                    # Main entry point
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   ├── detection.js            # Detection API routes
│   │   ├── admin.js                # Admin routes
│   │   └── field.js                # Field operative routes
│   ├── middleware/
│   │   ├── auth.js                 # JWT & RBAC
│   │   ├── errorHandler.js         # Error handling
│   │   └── validation.js           # Input validation
│   ├── services/
│   │   ├── detectionEngine.js      # ML inference service
│   │   ├── authService.js          # Auth logic
│   │   └── dbService.js            # Database service
│   ├── models/
│   │   ├── userModel.js            # User schema
│   │   ├── detectionModel.js       # Detection schema
│   │   └── logModel.js             # Audit log schema
│   ├── utils/
│   │   ├── logger.js               # Logging
│   │   └── validators.js           # Validation schemas
│   └── config/
│       └── database.js             # DB connection
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── DetectionPage.jsx   # Detection interface
│   │   │   ├── AuthPage.jsx        # Login/Register
│   │   │   ├── AdminPanel.jsx      # Admin controls
│   │   │   └── FieldOpsPage.jsx    # Field operative tools
│   │   ├── components/
│   │   │   ├── DetectionUpload.jsx # File upload component
│   │   │   ├── Navbar.jsx          # Navigation
│   │   │   ├── ResultsDisplay.jsx  # Results visualization
│   │   │   └── Charts.jsx          # Statistics charts
│   │   ├── store/
│   │   │   ├── authStore.js        # Authentication state
│   │   │   ├── detectionStore.js   # Detection state
│   │   │   └── adminStore.js       # Admin state
│   │   ├── services/
│   │   │   ├── api.js              # API client
│   │   │   └── socketService.js    # WebSocket service
│   │   └── styles/
│   │       ├── tailwind.config.js
│   │       └── globals.css
│   ├── package.json
│   └── .env
│
├── edge-agent/
│   ├── src/
│   │   ├── offlineDetectionEngine.js    # Offline detection
│   │   ├── syncManager.js               # Cloud sync
│   │   ├── ui.js                        # Mobile UI
│   │   └── firmware.js                  # Device firmware
│   ├── package.json
│   └── .env
│
├── ml-models/
│   ├── video-detector/
│   │   ├── model.json
│   │   └── model_weights.bin
│   ├── audio-detector/
│   │   ├── model.json
│   │   └── model_weights.bin
│   └── face-detector/
│       ├── model.json
│       └── model_weights.bin
│
└── README.md

```

## Running the Complete System

### Terminal 1 - Backend
```bash
cd backend
npm start
# Output: Server running on port 5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
# Output: App running on http://localhost:3000
```

### Terminal 3 - Edge Agent (Optional)
```bash
cd edge-agent
npm start
```

## Access Points

- **Web Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:5000/api-docs
- **API Base URL**: http://localhost:5000/api

## Key Features Demonstration

### 1. Real-time Detection
- Upload video/audio
- Watch progress bar
- Get instant confidence scores

### 2. Multi-Modal Analysis
- Joint audio-visual analysis
- Lip-sync verification
- Facial artifact detection

### 3. Security & Access Control
- JWT token authentication
- Multi-Factor Authentication (MFA)
- Role-Based Access Control (RBAC)
- Audit logging

### 4. Field Operations
- Offline detection capability
- Local data storage
- Cloud sync when online
- Secure firmware

### 5. Admin Dashboard
- System statistics
- Audit logs
- User management
- Threat monitoring

## Performance Optimization Tips

### Backend
- Enable gzip compression
- Use connection pooling for databases
- Implement model caching
- Rate limiting on all endpoints

### Frontend
- Code splitting with React Router
- Image optimization
- Lazy loading of components
- Service Workers for offline mode

### Edge Agent
- Use TFLite models (< 5MB each)
- Implement frame sampling (5 FPS)
- Compress audio (8kHz, 8-bit)
- Local IndexedDB storage

## Troubleshooting

### Backend Issues
```bash
# Check if port 5000 is in use
lsof -i :5000
kill -9 <PID>

# Test MongoDB connection
mongo -u admin -p password localhost:27017/deepfake-detection

# View logs
tail -f logs/app.log
```

### Frontend Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# Chrome: DevTools → Application → Clear storage
```

### Model Loading Issues
```bash
# Verify model files exist
ls -la backend/models/*/model.json

# Check file permissions
chmod 644 backend/models/*/model*
```

## Production Deployment

### Docker Containerization
```dockerfile
# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend .
EXPOSE 5000
CMD ["npm", "start"]

# Dockerfile.frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/deepfake-detection
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Support & Resources

- **TensorFlow.js Docs**: https://js.tensorflow.org/
- **Express.js Guide**: https://expressjs.com/
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Zustand Store**: https://github.com/pmndrs/zustand

## Competition Submission Checklist

✅ System Architecture & Design
✅ Backend Implementation (Express + ML)
✅ Frontend Implementation (React + Tailwind)
✅ Edge Agent Implementation (Offline Detection)
✅ Database Design (MongoDB/PostgreSQL)
✅ Security Features (JWT, RBAC, MFA)
✅ Real-time Detection Capability
✅ Comprehensive Documentation
✅ Installation & Setup Instructions
✅ Working Prototype on Localhost
✅ API Documentation (Swagger)
✅ Performance Optimization
✅ Visual Diagrams & Flowcharts
✅ Code Comments & Explanations
✅ Test Cases & Examples

---

**Estimated Development Time**: 40-60 hours
**Estimated Memory Usage**: 500MB (with models)
**Estimated Storage**: 2GB (for models and data)

For questions or clarifications, refer to the complete project documentation.
