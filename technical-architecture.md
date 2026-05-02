# TECHNICAL ARCHITECTURE & SYSTEM WORKFLOWS

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEEPFAKE DETECTION SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER (Frontend)                           │
│                                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐    │
│  │   React     │  │   Tailwind   │  │   Redux/    │  │   Socket.io   │    │
│  │   18.2      │  │    CSS 3     │  │   Zustand   │  │   WebSocket   │    │
│  └─────────────┘  └──────────────┘  └─────────────┘  └───────────────┘    │
│         │                  │               │                │                │
│         └──────────────────┼───────────────┼────────────────┘                │
│                            ▼                                                  │
│         ┌────────────────────────────────────────────┐                       │
│         │    Detection Upload Component             │                       │
│         │    - File drag & drop                     │                       │
│         │    - Progress tracking                    │                       │
│         │    - Real-time result display             │                       │
│         └────────────────────────────────────────────┘                       │
│                                                                               │
│         ┌─────────────────────────┬────────────────────────────────────┐    │
│         │   Dashboard             │   Field Operative Interface        │    │
│         │   - Statistics          │   - Offline detection              │    │
│         │   - Detection history   │   - Local data storage            │    │
│         │   - Admin controls      │   - Cloud sync                     │    │
│         └─────────────────────────┴────────────────────────────────────┘    │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/WSS
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY & MIDDLEWARE                               │
│                                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────────┐      │
│  │   CORS     │  │  Helmet    │  │   Morgan   │  │  Rate Limiting  │      │
│  │ Handler    │  │  (Security)│  │  (Logging) │  │  (Protection)   │      │
│  └────────────┘  └────────────┘  └────────────┘  └─────────────────┘      │
│         │              │               │                │                    │
│         └──────────────┴───────────────┴────────────────┘                    │
│                        ▼                                                      │
│         ┌────────────────────────────────────┐                               │
│         │    Authentication Middleware       │                               │
│         │    ┌──────────────────────────────┐│                              │
│         │    │ JWT Token Verification      ││                              │
│         │    │ RBAC Authorization Check    ││                              │
│         │    │ MFA Verification            ││                              │
│         │    │ Audit Logging               ││                              │
│         │    └──────────────────────────────┘│                              │
│         └────────────────────────────────────┘                               │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND API LAYER (Express.js)                         │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API Routes                                  │   │
│  │                                                                     │   │
│  │  /api/auth              /api/detect              /api/admin        │   │
│  │  ├─ register            ├─ POST /video           ├─ stats         │   │
│  │  ├─ login               ├─ POST /audio           ├─ users         │   │
│  │  ├─ verify-mfa          ├─ POST /multimodal      ├─ logs          │   │
│  │  ├─ setup-mfa           ├─ GET /results/:id      └─ threats       │   │
│  │  └─ logout              ├─ GET /history                            │   │
│  │                         └─ DELETE /history        /api/field       │   │
│  │                                                   ├─ sync          │   │
│  │                                                   ├─ model-updates │   │
│  │                                                   └─ report        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                  │                   │                │           │
│         └──────────────────┼───────────────────┼────────────────┘           │
│                            ▼                                                 │
│              ┌──────────────────────────────────┐                           │
│              │   Detection Engine Services     │                           │
│              │                                  │                           │
│              │  ┌────────────────────────────┐ │                           │
│              │  │ Video Detection            │ │                           │
│              │  │ - Frame extraction         │ │                           │
│              │  │ - Face detection (MTCNN)   │ │                           │
│              │  │ - Facial artifact analysis │ │                           │
│              │  │ - Xception neural network  │ │                           │
│              │  └────────────────────────────┘ │                           │
│              │                                  │                           │
│              │  ┌────────────────────────────┐ │                           │
│              │  │ Audio Detection            │ │                           │
│              │  │ - MFCC extraction          │ │                           │
│              │  │ - LFCC feature generation  │ │                           │
│              │  │ - Spectrogram analysis     │ │                           │
│              │  │ - RawNet2 backbone model   │ │                           │
│              │  └────────────────────────────┘ │                           │
│              │                                  │                           │
│              │  ┌────────────────────────────┐ │                           │
│              │  │ Multimodal Fusion          │ │                           │
│              │  │ - Audio-visual sync check  │ │                           │
│              │  │ - Weighted ensemble        │ │                           │
│              │  │ - Cross-modal analysis     │ │                           │
│              │  └────────────────────────────┘ │                           │
│              └──────────────────────────────────┘                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                    │               │               │
                    ▼               ▼               ▼
        ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
        │   MongoDB        │  │ PostgreSQL   │  │  File Storage   │
        │ (Documents)      │  │ (Relations)  │  │  (Media Files)  │
        │                  │  │              │  │                 │
        │ - Users          │  │ - Users      │  │ - Uploads       │
        │ - Detections     │  │ - Audit logs │  │ - Models        │
        │ - Reports        │  │ - Access log │  │ - Cache         │
        │ - Settings       │  │              │  │                 │
        └──────────────────┘  └──────────────┘  └─────────────────┘
                                                          │
                                                          ▼
                                                ┌─────────────────────┐
                                                │  ML Models Storage  │
                                                │                     │
                                                │ - video-detector    │
                                                │ - audio-detector    │
                                                │ - face-detector     │
                                                └─────────────────────┘
```

## Data Flow Diagram - Video Detection

```
┌─────────────────┐
│  User Uploads   │
│   Video File    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   File Validation & Storage         │
│   - Check file type                 │
│   - Verify file size                │
│   - Store in temp directory         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Frame Extraction                  │
│   - Extract frames at 5 FPS         │
│   - Resize to 224x224 pixels        │
│   - Normalize pixel values          │
└────────┬────────────────────────────┘
         │
         ├────────────────┬────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌─────────┐   ┌──────────────┐  ┌──────────────┐
    │  Face   │   │  Facial      │  │  Temporal    │
    │Detection│   │  Artifacts   │  │  Consistency │
    │(MTCNN)  │   │  Analysis    │  │  Check       │
    └────┬────┘   └──────┬───────┘  └──────┬───────┘
         │                │                │
         ├────────────────┼────────────────┤
         │                │                │
         ▼                ▼                ▼
    ┌──────────────────────────────────────┐
    │   Score Aggregation & Fusion         │
    │   Weight: Video (40%) + Facial (35%) │
    │           + Temporal (25%)           │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │   Confidence Score Calculation   │
    │   Range: 0.0 to 1.0              │
    │   Threshold: 0.65 = DEEPFAKE     │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │   Generate Report                │
    │   - Confidence %                 │
    │   - Detection type               │
    │   - Component scores             │
    │   - Heatmap visualization        │
    │   - Forensic details             │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │   Store in Database              │
    │   - MongoDB (metadata)           │
    │   - PostgreSQL (audit log)       │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │   Return to Client (Real-time)   │
    │   Via WebSocket for live updates │
    └──────────────────────────────────┘
```

## Audio Detection Pipeline

```
┌────────────────┐
│  Audio File    │
│   (MP3/WAV)    │
└────────┬───────┘
         │
         ▼
┌────────────────────────────┐
│   Audio Preprocessing      │
│   - Load audio stream       │
│   - Normalize to 16kHz      │
│   - Apply windowing         │
└────────┬───────────────────┘
         │
         ├──────────┬──────────┬──────────┐
         │          │          │          │
         ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
    │ MFCC   │ │ LFCC   │ │Spectro-│ │ Cepstral │
    │Feature │ │Feature │ │gram    │ │ Features │
    │(13 coef)│ │(13 coef)│ │Analysis│ │          │
    └────┬───┘ └───┬────┘ └───┬────┘ └────┬─────┘
         │         │          │           │
         └────┬────┴──────────┼───────────┘
              │               │
              ▼               ▼
        ┌──────────┐    ┌────────────┐
        │RawNet2   │    │ Frequency  │
        │Backbone  │    │ Domain     │
        │Model     │    │ Artifacts  │
        └────┬─────┘    └─────┬──────┘
             │                │
             └────────┬───────┘
                      │
                      ▼
            ┌─────────────────────┐
            │ Audio Confidence    │
            │ Score Generation    │
            │ Fake: 0.0 - 1.0     │
            └────────┬────────────┘
                     │
                     ▼
            ┌─────────────────────┐
            │ Audio Report        │
            │ - Distortion level  │
            │ - Voice artifacts   │
            │ - Synthesis traces  │
            └─────────────────────┘
```

## Multimodal Fusion Architecture

```
┌──────────────────────────────────┐
│      Video + Audio Input         │
└──────────┬───────────────────────┘
           │
    ┌──────┴───────┐
    │              │
    ▼              ▼
┌──────────┐  ┌───────────┐
│  Video   │  │   Audio   │
│Detection │  │ Detection │
│ Score    │  │  Score    │
└────┬─────┘  └─────┬─────┘
     │              │
     └──────┬───────┘
            │
            ▼
   ┌─────────────────────────┐
   │ Audio-Visual Alignment  │
   │                         │
   │ - Lip-sync analysis     │
   │ - Mouth movement check  │
   │ - Temporal synchronity  │
   │                         │
   │ Sync Score: 0.0 - 1.0   │
   └────────┬────────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │  Weighted Ensemble Fusion       │
   │                                 │
   │  Final Score =                  │
   │  (Video × 0.45) +               │
   │  (Audio × 0.45) +               │
   │  ((1-SyncScore) × 0.10)         │
   │                                 │
   │  Agreement Boost:               │
   │  If |V_score - A_score| < 0.2:  │
   │  Multiply by (0.5 + agreement)  │
   └────────┬────────────────────────┘
            │
            ▼
   ┌─────────────────────────────┐
   │ Final Confidence Score      │
   │ + Component Breakdown       │
   │ + Forensic Report           │
   │ + Visualization Heatmaps    │
   └─────────────────────────────┘
```

## Authentication & Authorization Flow

```
┌──────────────────┐
│  User Input      │
│ (Email/Password) │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│   Login Endpoint             │
│   POST /api/auth/login       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Validate Credentials        │
│  - Check email exists        │
│  - Verify password (bcrypt)  │
└────────┬─────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
  Valid     Invalid
    │          │
    ▼          ▼
   YES    ┌──────────────┐
    │     │ Return Error │
    │     │ (401)        │
    │     └──────────────┘
    │
    ▼
┌──────────────────────────────┐
│  Check MFA Status            │
│  - MFA enabled?              │
└────────┬─────────────────────┘
         │
    ┌────┴────┐
    │          │
  Yes         No
    │          │
    ▼          ▼
┌──────────┐  ┌─────────────────────────┐
│ Generate │  │ Generate JWT Token      │
│ MFA Code │  │ - Include user ID       │
│  (TOTP)  │  │ - Include roles/perms   │
└────┬─────┘  │ - Set expiry (24h)      │
     │        └────────┬────────────────┘
     │                 │
     ▼                 ▼
┌──────────────────────────────────┐
│  Request MFA Code from User      │
│  (Send to authenticator app)     │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Verify MFA Code (TOTP)          │
│  - Using speakeasy library       │
│  - Time window: ±2 minutes       │
└────────┬───────────────────────┘
         │
    ┌────┴────┐
    │          │
  Valid     Invalid
    │          │
    ▼          ▼
 Token    ┌──────────────┐
    │     │ Return Error │
    │     │ (401)        │
    │     └──────────────┘
    │
    ▼
┌──────────────────────────────────┐
│  Return JWT Token                │
│  - Token stored in localStorage  │
│  - Sent in Authorization header  │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Verify Token on Each Request    │
│  - Check signature               │
│  - Verify expiry                 │
│  - Extract user info             │
└────────┬───────────────────────┘
         │
    ┌────┴────┐
    │          │
  Valid     Invalid
    │          │
    ▼          ▼
Continue  Return 401
Request   Redirect to
   │      login
   │          │
   ▼          ▼
┌──────────────────────────────────┐
│  Check RBAC Permissions          │
│  - Get user roles from token     │
│  - Check endpoint requirements   │
│  - Verify role permissions       │
└────────┬───────────────────────┘
         │
    ┌────┴────┐
    │          │
 Authorized  Denied
    │          │
    ▼          ▼
Process    Return 403
Request    Forbidden

    │
    ▼
┌──────────────────────────────────┐
│  Execute Request                 │
│  - Process action                │
│  - Log to audit trail            │
└──────────────────────────────────┘
```

## Edge Agent Offline Workflow

```
┌────────────────────────────────┐
│  Field Operative Device        │
│  (Mobile/Tablet/Body-cam)      │
└────────────┬───────────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Local ML Models      │
    │ (Lightweight)        │
    │ - Video (12MB)       │
    │ - Audio (8MB)        │
    │ - Face (5MB)         │
    │ Total: ~25MB         │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────────────┐
    │  File Received               │
    │  (Video/Audio)               │
    │  - Check permissions         │
    │  - Validate file integrity   │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Offline Detection Engine    │
    │  - Extract frames/features   │
    │  - Run lightweight models    │
    │  - Generate confidence score │
    │  - Duration: 2-5 seconds     │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Local Storage (IndexedDB)   │
    │  - Save detection result     │
    │  - Timestamp                 │
    │  - File hash                 │
    │  - Confidence & verdict      │
    │  - Geolocation (if enabled)  │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Display Result to Operative │
    │  - Confidence % on screen    │
    │  - FAKE / AUTHENTIC badge    │
    │  - Detailed analysis         │
    └──────────┬───────────────────┘
               │
               ├─────────────┬──────────┐
               │             │          │
      Network  │          No     Internet
        Online │        Network  Available
               │             │          │
               ▼             ▼          ▼
         ┌────────┐    ┌────────┐  ┌─────────┐
         │ Queue  │    │ Store  │  │  Sync   │
         │ Sync   │    │ Local  │  │ Results │
         └───┬────┘    └────────┘  └────┬────┘
             │                           │
             └───────────────┬───────────┘
                             │
                             ▼
                    ┌──────────────────────────┐
                    │  Background Sync Service │
                    │  (When Network Available)│
                    │  - Detect network change│
                    │  - Queue stored results │
                    │  - Send to Cloud API    │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │  Cloud Server            │
                    │  POST /api/field/sync    │
                    │                          │
                    │  - Validate data        │
                    │  - Update master DB     │
                    │  - Cross-validate      │
                    │  - Mark as synced      │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │  Update Device           │
                    │  - Confirm sync success  │
                    │  - Clear local queue     │
                    │  - Check for model      │
                    │    updates              │
                    │  - Download new models  │
                    │    if available         │
                    └──────────────────────────┘
```

## Security Architecture

```
┌────────────────────────────────────────────────────┐
│            SECURITY LAYERS                         │
└────────────────────────────────────────────────────┘

LAYER 1: TRANSPORT SECURITY
┌────────────────────────────────────────────────────┐
│  HTTPS/TLS 1.3                                     │
│  - End-to-end encryption                          │
│  - Certificate pinning                            │
│  - Perfect forward secrecy                        │
└────────────────────────────────────────────────────┘

LAYER 2: API SECURITY
┌────────────────────────────────────────────────────┐
│  Helmet.js Headers                                │
│  - X-Content-Type-Options                         │
│  - X-Frame-Options                                │
│  - Content-Security-Policy                        │
│  - X-XSS-Protection                              │
└────────────────────────────────────────────────────┘

LAYER 3: AUTHENTICATION
┌────────────────────────────────────────────────────┐
│  JWT Tokens                                        │
│  - Signed with HS256/RS256                        │
│  - 24-hour expiry                                 │
│  - Refresh token mechanism                        │
│                                                    │
│  Multi-Factor Authentication (MFA)                │
│  - Time-based OTP (TOTP)                         │
│  - QR code generation                             │
│  - Backup codes                                   │
└────────────────────────────────────────────────────┘

LAYER 4: AUTHORIZATION
┌────────────────────────────────────────────────────┐
│  Role-Based Access Control (RBAC)                 │
│                                                    │
│  Roles:                                            │
│  - admin: Full system access                      │
│  - analyst: Detection & report access             │
│  - field_op: Mobile device operations             │
│  - viewer: Read-only access                       │
│  - user: Personal detection only                  │
└────────────────────────────────────────────────────┘

LAYER 5: DATA PROTECTION
┌────────────────────────────────────────────────────┐
│  At Rest:                                          │
│  - AES-256 encryption for sensitive data          │
│  - Hashed passwords (bcrypt 10 rounds)            │
│  - Field-level encryption in DB                   │
│                                                    │
│  In Transit:                                       │
│  - HTTPS/TLS for all connections                  │
│  - HMAC-SHA256 for data integrity                 │
└────────────────────────────────────────────────────┘

LAYER 6: INPUT VALIDATION
┌────────────────────────────────────────────────────┐
│  Joi Schema Validation                             │
│  - Type checking                                   │
│  - Length/size limits                              │
│  - Format validation (email, phone)               │
│  - File upload restrictions                       │
└────────────────────────────────────────────────────┘

LAYER 7: RATE LIMITING
┌────────────────────────────────────────────────────┐
│  Per-User Rate Limiting                           │
│  - 100 requests/minute per user                   │
│  - 1000 requests/hour per IP                      │
│  - Sliding window algorithm                       │
│  - Redis-backed (for production)                  │
└────────────────────────────────────────────────────┘

LAYER 8: AUDIT LOGGING
┌────────────────────────────────────────────────────┐
│  Comprehensive Audit Trail                        │
│  - User actions logged                            │
│  - API access logged                              │
│  - Error events logged                            │
│  - Admin actions logged                           │
│  - Immutable log storage                          │
└────────────────────────────────────────────────────┘

LAYER 9: FIRMWARE SECURITY (Edge)
┌────────────────────────────────────────────────────┐
│  Device Protection                                │
│  - Secure boot                                    │
│  - Code signing                                   │
│  - Integrity verification                        │
│  - Anti-tampering measures                        │
└────────────────────────────────────────────────────┘
```

## Real-time Detection Flow with WebSocket

```
┌─────────────┐
│   User      │
│   Uploads   │
│   File      │
└──────┬──────┘
       │
       ▼
    HTTP POST
    /api/detect/video
       │
       ▼
┌─────────────────────┐
│  Server Receives    │
│  - Validates file   │
│  - Stores on disk   │
│  - Returns job ID   │
└──────┬──────────────┘
       │
       ├──────────────────────────────┐
       │                              │
    HTTP 202               WebSocket Established
   (Accepted)                  │
       │                       │
       │                       ▼
       │          ┌──────────────────────────┐
       │          │  Server Processing       │
       │          │  Step 1: Extract frames  │
       │          └──────┬───────────────────┘
       │                 │
       │                 ├──WebSocket→  {progress: 10%}
       │                 │
       │          ┌──────┴───────────────────┐
       │          │  Step 2: Face Detection  │
       │          └──────┬───────────────────┘
       │                 │
       │                 ├──WebSocket→  {progress: 30%}
       │                 │
       │          ┌──────┴───────────────────────┐
       │          │  Step 3: Artifact Analysis   │
       │          └──────┬──────────────────────┘
       │                 │
       │                 ├──WebSocket→  {progress: 60%}
       │                 │
       │          ┌──────┴───────────────────┐
       │          │  Step 4: Model Inference │
       │          └──────┬───────────────────┘
       │                 │
       │                 ├──WebSocket→  {progress: 90%}
       │                 │
       │          ┌──────┴───────────────────┐
       │          │  Step 5: Report Gen      │
       │          └──────┬───────────────────┘
       │                 │
       │                 └──WebSocket→  {
       │                                 progress: 100%,
       │                                 status: "completed",
       │                                 confidence: 0.82,
       │                                 isFake: true,
       │                                 details: {...}
       │                               }
       │
       └────────────────┬─────────────────────┐
                        │                     │
                        ▼                     ▼
                   Save to DB            Display Results
                   - MongoDB              - Chart
                   - PostgreSQL           - Heatmap
                   - Audit log           - Forensic Report
```

---

This comprehensive technical documentation covers all critical aspects of system architecture, data flows, security implementation, and real-time processing pipelines for the Deepfake Detection & Authenticity Verification System.
