# Slotify Monorepo - Railway Deployment Guide

This monorepo contains both **frontend** and **backend** applications. This guide shows how to deploy both to Railway.

## 📦 Monorepo Structure

```
slotify/
├── apps/
│   ├── api/              # Backend (Node.js + Express + MongoDB)
│   │   ├── server.js
│   │   ├── package.json
│   │   └── railway.json  ← Backend config (when root = /)
│   └── web/              # Frontend (React + Vite)
│       ├── src/
│       ├── package.json
│       ├── railway.json  ← Frontend config (when root = apps/web)
│       └── nixpacks.toml
├── railway.json          # Backend config at root
├── nixpacks.toml         # Backend config at root
└── package.json          # Root workspace config
```

## 🎯 Railway Deployment Strategy

You need **TWO separate services** in Railway:

| Service | Root Directory | Purpose | Config Files |
|---------|---------------|---------|--------------|
| **Backend** | `/` (root) | API + MongoDB | `/railway.json`, `/nixpacks.toml` |
| **Frontend** | `apps/web` | React UI | `apps/web/railway.json`, `apps/web/nixpacks.toml` |

---

## 🚀 Step-by-Step Deployment

### Part 1: Deploy Backend (Already Done ✅)

Your backend is already deployed! It uses the root configuration:
- **Start Command**: `node apps/api/server.js`
- **URL**: `https://your-backend.up.railway.app`

### Part 2: Deploy Frontend (New Service)

#### Step 1: Create New Service

1. Go to [Railway Dashboard](https://railway.app)
2. Open your **slotify** project
3. Click **"+ New"** → **"GitHub Repo"**
4. Select **`uma26madasu/slotify`** (same repository!)

#### Step 2: Configure Root Directory

**This is the most important step!**

1. Click on the new service
2. Go to **"Settings"** tab
3. Find **"Service"** section
4. Look for **"Root Directory"**
5. Click **"/"** (the current value)
6. **Type**: `apps/web` ⚠️ **Critical!**
7. Click outside or press Enter to save

#### Step 3: Verify Build Configuration

Railway should auto-detect from `apps/web/railway.json`:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm preview --host 0.0.0.0 --port $PORT`

If not auto-detected, set them manually in Settings → Build/Deploy sections.

#### Step 4: Add Environment Variables

In the **frontend service** Variables tab, add:

```bash
# Backend API URL (from your backend service)
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

**To get your backend URL:**
1. Go to **backend service** in Railway
2. Look at **Settings** → **Networking** → **Public Networking**
3. Copy the domain (e.g., `slotify-production-abc123.up.railway.app`)
4. Use `https://that-domain` for `VITE_API_URL`

#### Step 5: Deploy

1. After adding variables, Railway auto-deploys
2. Wait 3-5 minutes for build
3. Check **Deployments** tab for progress

#### Step 6: Get Your Frontend URL

1. Go to **Settings** → **Networking** → **Public Networking**
2. You'll see: `https://slotify-frontend-production-xxx.up.railway.app`
3. **This is your Slotify webpage!** 🎉

---

## 🔄 Update Backend CORS

After frontend deploys, update backend to allow frontend requests:

1. Go to **backend service**
2. Go to **Variables** tab
3. Add or update:
   ```bash
   FRONTEND_URL=https://your-frontend-service.up.railway.app
   ```
4. Backend will auto-redeploy

---

## 📋 Complete Environment Variables

### Backend Service (`/` root directory)

```bash
# Required
MONGODB_URI=mongodb+srv://umamadasu:Impala%40007@cluster0.wxajvjb.mongodb.net/slotify?appName=Cluster0
JWT_SECRET=39111a93f1cb196ca4de31b0a4afebbb0af52d837236509c8ada2e3f4e6331fc
NODE_ENV=production

# Optional
WEBHOOK_SECRET=9d38bb68b50be5d561c74a98f8f60d6e6b4f3063f2690cea75a5ae4f3b59de17
MAX_BOOKING_DAYS_AHEAD=365
DEFAULT_MEETING_LENGTH=60
FRONTEND_URL=https://your-frontend.up.railway.app
```

### Frontend Service (`apps/web` root directory)

```bash
# Required
VITE_API_URL=https://your-backend.up.railway.app
VITE_FIREBASE_API_KEY=AIzaSyCYsr6oZ3j-R7nJe6xWaRO6Q5xi0Rk3IV8
VITE_FIREBASE_AUTH_DOMAIN=procalenderfrontend.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=procalenderfrontend
VITE_FIREBASE_STORAGE_BUCKET=procalenderfrontend.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=302768668350
VITE_FIREBASE_APP_ID=1:302768668350:web:b92f80489662289e28e8ef
VITE_FIREBASE_MEASUREMENT_ID=G-QJWKGJN76S
```

---

## 🎉 Final Result

After both services are deployed:

```
Railway Project: slotify
├── Backend Service (root /)
│   ├── URL: https://slotify-backend-xxx.up.railway.app
│   └── Purpose: API endpoints, MongoDB, authentication
└── Frontend Service (apps/web)
    ├── URL: https://slotify-frontend-xxx.up.railway.app  ← Open this!
    └── Purpose: React web interface
```

**Open the Frontend URL in your browser to use Slotify!**

---

## 🐛 Troubleshooting

### Frontend shows "Cannot connect to API"
- Check `VITE_API_URL` is correct
- Verify backend service is running
- Check backend has `FRONTEND_URL` set
- Check browser console for CORS errors

### Frontend build fails
- Verify root directory is `apps/web`
- Check pnpm is being used (should auto-detect)
- Look at deployment logs for specific errors

### Backend service already exists
- You already have the backend deployed!
- Just create the **frontend** service
- Use the same repository, different root directory

### "pnpm not found" error
- Railway should auto-detect from `packageManager` field
- If not, set build command to: `npm install -g pnpm && pnpm install && pnpm build`

---

## 📚 Configuration Files Explained

### Root Level (for Backend)
- `railway.json` - Backend service config
- `nixpacks.toml` - Backend build config
- `package.json` - Workspace root, defines start script

### apps/web/ (for Frontend)
- `railway.json` - Frontend service config
- `nixpacks.toml` - Frontend build config
- `package.json` - Frontend dependencies and scripts

**Key Point**: Railway uses the appropriate config based on the **Root Directory** setting:
- Root directory `/` → uses root `railway.json`
- Root directory `apps/web` → uses `apps/web/railway.json`

---

## ✅ Deployment Checklist

**Backend Service:**
- [x] Deployed and running
- [x] Environment variables set
- [x] MongoDB connected
- [ ] `FRONTEND_URL` added (after frontend deploys)

**Frontend Service:**
- [ ] New service created in Railway
- [ ] Root directory set to `apps/web`
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Can access web interface
- [ ] Connected to backend API

---

## 🔗 Useful Links

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Docs - Monorepos](https://docs.railway.app/guides/monorepo)
- [Nixpacks Documentation](https://nixpacks.com/)

---

**Last Updated**: 2025-11-14
**Status**: Backend ✅ | Frontend ⏳
**Next**: Deploy frontend service with root directory = `apps/web`
