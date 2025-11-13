# Deploy Frontend to Railway - Complete Guide

This guide shows how to deploy the Slotify frontend as a second service on Railway.

## 🏗️ Current Setup

Your Railway project currently has:
- ✅ **Backend Service**: Running at `apps/api/` (API endpoints)
- ⏳ **Frontend Service**: Needs to be added (Web interface)

## 🚀 Add Frontend Service to Railway

### Step 1: Create New Service in Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Open your **slotify** project
3. Click **"+ New"** button
4. Select **"GitHub Repo"**
5. Choose **`uma26madasu/slotify`** (same repo!)
6. Railway will create a new service

### Step 2: Configure Frontend Service

When Railway asks for configuration:

**Service Name:** `slotify-frontend` (or any name you prefer)

**Root Directory:** `apps/web` ⚠️ **Critical!**

**Build Command:** `pnpm install && pnpm build`

**Start Command:** `pnpm preview --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables to Frontend Service

In the **frontend service** (not backend!), add these variables:

#### Required Variables:

```bash
# Backend API URL (use your Railway backend service URL)
VITE_API_URL=https://your-backend-service.up.railway.app

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCYsr6oZ3j-R7nJe6xWaRO6Q5xi0Rk3IV8
VITE_FIREBASE_AUTH_DOMAIN=procalenderfrontend.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=procalenderfrontend
VITE_FIREBASE_STORAGE_BUCKET=procalenderfrontend.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=302768668350
VITE_FIREBASE_APP_ID=1:302768668350:web:b92f80489662289e28e8ef
VITE_FIREBASE_MEASUREMENT_ID=G-QJWKGJN76S
```

### Step 4: Get Your Backend URL

To fill in `VITE_API_URL`:

1. Go to your **backend service** in Railway
2. Click on **"Settings"** or **"Deployments"**
3. Find **"Domains"** section
4. Copy the Railway-provided domain (e.g., `https://slotify-production.up.railway.app`)
5. Use this URL for `VITE_API_URL`

### Step 5: Deploy

Click **"Deploy"** and wait 3-5 minutes.

Railway will give you a **frontend URL** like:
- `https://slotify-frontend-production.up.railway.app`

**This is your Slotify webpage!** 🎉

---

## 🔄 Alternative: Update Backend Service CORS

After deploying frontend, update backend environment variables to allow frontend domain:

In **backend service** variables, add:
```
FRONTEND_URL=https://your-frontend-service.up.railway.app
```

---

## 📋 Final Result

After setup, you'll have **2 Railway services**:

| Service | URL | Purpose |
|---------|-----|---------|
| Backend | `https://slotify-api-xxx.up.railway.app` | API endpoints, MongoDB |
| Frontend | `https://slotify-web-xxx.up.railway.app` | Web interface ← **This is what you access!** |

---

## 🎯 Quick Checklist

- [ ] Created new Railway service from same GitHub repo
- [ ] Set root directory to `apps/web`
- [ ] Added all VITE_* environment variables
- [ ] Updated VITE_API_URL with backend Railway URL
- [ ] Deployment successful
- [ ] Can access frontend URL in browser
- [ ] Updated backend FRONTEND_URL variable

---

## 🐛 Troubleshooting

### Build fails: "pnpm not found"
- Railway should auto-detect pnpm from `package.json`
- Try setting build command to: `npm install -g pnpm && pnpm install && pnpm build`

### "Cannot connect to API" errors
- Check `VITE_API_URL` is correct
- Make sure backend service is running
- Check CORS settings in backend

### Blank page
- Check browser console for errors
- Verify all Firebase variables are set
- Check deployment logs for build errors

---

**Once deployed, open your frontend Railway URL to see Slotify!** 🚀
