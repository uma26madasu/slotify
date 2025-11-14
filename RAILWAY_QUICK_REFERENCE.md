# Railway Deployment - Quick Reference

## 📊 Current Status

| Component | Status | Location |
|-----------|--------|----------|
| Backend | ✅ Deployed | Railway |
| Frontend | ⏳ Pending | Needs deployment |
| MongoDB | ✅ Connected | MongoDB Atlas |

---

## 🎯 What You Need to Do

### Create Frontend Service

1. Railway Dashboard → Your Project → **"+ New"**
2. Select: **GitHub Repo** → **`uma26madasu/slotify`**
3. **Settings** → **Root Directory** → Set to: `apps/web` ⚠️
4. Add environment variables (see below)
5. Deploy!

---

## 📝 Environment Variables

### Backend Service (Already Set ✅)

```bash
MONGODB_URI = mongodb+srv://umamadasu:Impala%40007@cluster0.wxajvjb.mongodb.net/slotify?appName=Cluster0
JWT_SECRET = 39111a93f1cb196ca4de31b0a4afebbb0af52d837236509c8ada2e3f4e6331fc
NODE_ENV = production
WEBHOOK_SECRET = 9d38bb68b50be5d561c74a98f8f60d6e6b4f3063f2690cea75a5ae4f3b59de17
```

**After frontend deploys, add:**
```bash
FRONTEND_URL = https://your-frontend.up.railway.app
```

### Frontend Service (New - Need to Add)

```bash
VITE_API_URL = https://your-backend.up.railway.app
VITE_FIREBASE_API_KEY = AIzaSyCYsr6oZ3j-R7nJe6xWaRO6Q5xi0Rk3IV8
VITE_FIREBASE_AUTH_DOMAIN = procalenderfrontend.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = procalenderfrontend
VITE_FIREBASE_STORAGE_BUCKET = procalenderfrontend.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 302768668350
VITE_FIREBASE_APP_ID = 1:302768668350:web:b92f80489662289e28e8ef
VITE_FIREBASE_MEASUREMENT_ID = G-QJWKGJN76S
```

---

## 🌐 Your URLs (After Deployment)

| Service | URL | Purpose |
|---------|-----|---------|
| Backend | `https://slotify-backend-xxx.up.railway.app` | API (JSON) |
| Frontend | `https://slotify-frontend-xxx.up.railway.app` | **← Open this to use Slotify!** |

---

## ⚡ Quick Commands Reference

### Root Package.json Scripts
```bash
pnpm dev          # Run both apps in dev mode
pnpm build        # Build both apps
pnpm start        # Start backend only
pnpm web:dev      # Run frontend only
pnpm api:dev      # Run backend only
```

### Backend (apps/api)
```bash
cd apps/api
pnpm dev          # Development with nodemon
pnpm start        # Production start
```

### Frontend (apps/web)
```bash
cd apps/web
pnpm dev          # Development server (port 5173)
pnpm build        # Build for production
pnpm preview      # Preview production build
```

---

## 📁 Important Files

```
Root Level (Backend Config):
├── railway.json           # Backend Railway config
├── nixpacks.toml         # Backend Nixpacks config
├── Procfile              # Fallback process definition
└── package.json          # Root workspace, start = backend

Frontend Config:
└── apps/web/
    ├── railway.json      # Frontend Railway config
    ├── nixpacks.toml     # Frontend Nixpacks config
    └── package.json      # Frontend dependencies
```

---

## 🔧 Configuration Details

### Backend Service Configuration
- **Root Directory**: `/` (project root)
- **Start Command**: `node apps/api/server.js`
- **Build Command**: `pnpm install --frozen-lockfile`
- **Port**: Auto-assigned by Railway

### Frontend Service Configuration
- **Root Directory**: `apps/web` ⚠️ **Must be set!**
- **Start Command**: `pnpm preview --host 0.0.0.0 --port $PORT`
- **Build Command**: `pnpm install && pnpm build`
- **Port**: Auto-assigned by Railway

---

## ✅ Deployment Verification

After both services deploy, test:

**Backend:**
```bash
curl https://your-backend.up.railway.app/
curl https://your-backend.up.railway.app/api/test
curl https://your-backend.up.railway.app/api/mongodb-test
```

**Frontend:**
- Open `https://your-frontend.up.railway.app` in browser
- Should show Slotify login/home page
- Check browser console for errors

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Frontend shows "Cannot connect" | Update `VITE_API_URL` with correct backend URL |
| Build fails on frontend | Verify root directory is `apps/web` |
| CORS errors | Add `FRONTEND_URL` to backend service |
| Blank page | Check browser console, verify Firebase vars |

---

## 📚 Full Documentation

- **Complete Guide**: See `RAILWAY_MONOREPO_DEPLOYMENT.md`
- **Backend Setup**: See `DEPLOY_TO_RAILWAY.md`
- **Frontend Setup**: See `DEPLOY_FRONTEND_RAILWAY.md`

---

**Ready to deploy?** Follow the steps above to get your Slotify webpage live! 🚀
