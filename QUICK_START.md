# 🚀 DEEPFAKE DETECTION SYSTEM - QUICK START GUIDE

## ✅ SERVERS ARE NOW RUNNING

### Access the Application

#### Frontend Dashboard
- **URL**: http://localhost:3000
- **Status**: ✅ Running on Port 3000
- **Technology**: React + Vite

#### Backend API
- **URL**: http://localhost:5000
- **Status**: ✅ Running on Port 5000  
- **API Docs**: http://localhost:5000/api-docs

---

## 🎯 What To Do Now

### Step 1: Open Website
Go to **http://localhost:3000** in your browser

### Step 2: You'll See
- Loading page with server status
- React application initializing
- Authentication interface

### Step 3: Register Account
- Click "Register" button
- Enter any email address (e.g., test@example.com)
- Enter password (any password)
- Enter name
- Click "Register"

### Step 4: Login
- Use the email and password you just created
- System may ask for MFA (optional)
- You'll be taken to Dashboard

### Step 5: Explore Features
Once logged in, you can:
- **Dashboard**: View statistics and detection history
- **Detection**: Upload video/audio files to analyze
- **Admin Panel**: View system logs and user management (if admin)
- **Field Ops**: Field operative tools for offline detection

---

## 🔧 If Still Having Issues

### Issue: Page shows "Cannot reach this page"

**Solution 1: Check Servers are Running**
```
Go to Terminal and you should see:
✅ Backend running on :5000
✅ Frontend running on :3000
```

**Solution 2: Hard Refresh Browser**
```
Press: Ctrl + Shift + R (Windows)
or: Cmd + Shift + R (Mac)
```

**Solution 3: Clear Browser Cache**
```
Press F12 → Storage → Clear All
Then refresh page (F5)
```

**Solution 4: Try Direct Backend Test**
```
Open in browser:
http://localhost:5000/health

Should show:
{"status":"ACTIVE","timestamp":"...","version":"1.0.0"}
```

### Issue: Get Connection Refused Errors

**Solution: Restart Servers**

Kill all Node processes:
```bash
Stop-Process -Name node -Force
```

Then in SEPARATE terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Wait 5 seconds for it to start.

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Wait for "VITE v5..." to appear.

Then go to: http://localhost:3000

---

## 📝 Test Account Information

After registering, use any of these test credentials:

| Email | Password | Name |
|-------|----------|------|
| test@example.com | password123 | Test User |
| admin@system.com | admin123 | Admin |
| demo@test.com | demo | Demo |

---

## 🔑 Key Features to Try

1. **Register & Login**
   - Test user authentication
   - Test MFA setup (optional)

2. **Dashboard**
   - View detection statistics
   - See detection history

3. **Upload Files**
   - Go to Detection page
   - Try uploading a sample video or audio
   - Watch real-time processing

4. **Admin Panel** 
   - View system statistics
   - See audit logs
   - Manage users (if admin)

5. **Field Operations**
   - Offline detection tools
   - Field operative interface

---

## 🌐 Important URLs

| Purpose | URL |
|---------|-----|
| Main Application | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Documentation | http://localhost:5000/api-docs |
| Health Check | http://localhost:5000/health |
| Network Access | http://192.168.1.9:3000/ |

---

## 💾 System Architecture

```
Your Browser
     ↓
http://localhost:3000
     ↓
React Application (Vite)
     ↓
API Calls
     ↓
http://localhost:5000
     ↓
Express.js Backend
     ↓
Routes (Auth, Detection, Admin, Field)
```

---

## 📱 Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 🎬 Full System is Ready!

Both servers are running and accessible. 

**Just go to http://localhost:3000 and start using the system!**

If you see the page loading, wait a few seconds for React to initialize.

---

**Need Help?**
- Check terminal output for error messages
- Try restarting the servers
- Clear browser cache
- Check firewall isn't blocking ports 3000/5000

**Enjoy your Deepfake Detection System! 🚀**
