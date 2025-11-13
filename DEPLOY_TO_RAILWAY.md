# Deploy Slotify to Railway - Complete Guide

This guide will help you deploy the Slotify monorepo to Railway successfully.

## 🚀 Quick Deploy

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`uma26madasu/slotify`** repository
5. Railway will automatically detect the configuration

### 3. Add Environment Variables

**CRITICAL STEP**: Go to your Railway service → **Variables** tab and add these:

#### Required Variables (Must Add These):

```
MONGODB_URI
mongodb+srv://umamadasu:Impala%40007@cluster0.wxajvjb.mongodb.net/slotify?appName=Cluster0
```

```
JWT_SECRET
39111a93f1cb196ca4de31b0a4afebbb0af52d837236509c8ada2e3f4e6331fc
```

```
NODE_ENV
production
```

#### Optional but Recommended:

```
WEBHOOK_SECRET
9d38bb68b50be5d561c74a98f8f60d6e6b4f3063f2690cea75a5ae4f3b59de17
```

```
MAX_BOOKING_DAYS_AHEAD
365
```

```
DEFAULT_MEETING_LENGTH
60
```

### 4. Verify Deployment

After adding environment variables, Railway will automatically redeploy. Check the logs for:

```
✅ All required environment variables are set
✅ Connected to MongoDB successfully with Mongoose!
✅ Slotify Backend is ready!
```

### 5. Test Your Deployment

Once deployed, Railway will provide a URL like: `https://slotify-production.up.railway.app`

Test these endpoints:

- **Health Check**: `https://your-url.railway.app/`
- **API Test**: `https://your-url.railway.app/api/test`
- **MongoDB Test**: `https://your-url.railway.app/api/mongodb-test`

Expected response from MongoDB test:
```json
{
  "success": true,
  "message": "MongoDB connection successful",
  "collections": [],
  "connectionState": 1
}
```

---

## 🔧 Configuration Files

This monorepo includes the following Railway configuration:

- **`railway.json`**: Main Railway configuration
- **`railway.toml`**: Alternative configuration (Railway uses railway.json if both exist)
- **`nixpacks.toml`**: Build configuration for Nixpacks
- **`.env.railway.template`**: Template for environment variables

---

## 🐛 Troubleshooting

### Issue: "Missing required environment variables: MONGODB_URI, JWT_SECRET"

**Solution**:
1. Go to Railway dashboard
2. Click on your service
3. Go to **Variables** tab
4. Make sure `MONGODB_URI` and `JWT_SECRET` are added
5. Click the **"Redeploy"** button

### Issue: "MongooseError: The uri parameter to openUri() must be a string, got undefined"

**Solution**: Same as above - environment variables aren't set in Railway

### Issue: "Build failed" or "Start command failed"

**Solution**: Check the deployment logs for specific errors
- Make sure you pushed latest code
- Verify `pnpm-lock.yaml` is committed
- Check that `apps/api/server.js` exists

### Issue: Server starts but MongoDB connection fails

**Solution**:
1. Verify MongoDB cluster is running in MongoDB Atlas
2. Check Network Access in MongoDB Atlas has `0.0.0.0/0`
3. Verify the connection string password is correct (with `%40` instead of `@`)

---

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub (`uma26madasu/slotify`)
- [ ] MongoDB Atlas cluster is running
- [ ] MongoDB Network Access configured (0.0.0.0/0)
- [ ] Railway project created
- [ ] Connected to GitHub repository
- [ ] `MONGODB_URI` added to Railway Variables
- [ ] `JWT_SECRET` added to Railway Variables
- [ ] `NODE_ENV=production` added to Railway Variables
- [ ] Deployment successful (check logs)
- [ ] Health check endpoint responds
- [ ] MongoDB test endpoint succeeds

---

## 🔄 Update Deployment

When you make code changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway will **automatically redeploy** when you push to the connected branch.

---

## 🌐 Multiple Services (Optional)

If you want to deploy frontend and backend separately:

### Backend Service:
- Use existing configuration
- Add all environment variables listed above

### Frontend Service:
- Create a new Railway service
- Connect to same GitHub repo
- Set root directory: `apps/web`
- Add environment variables:
  ```
  VITE_API_URL=https://your-backend-url.up.railway.app
  VITE_FIREBASE_API_KEY=AIzaSyCYsr6oZ3j-R7nJe6xWaRO6Q5xi0Rk3IV8
  # ... other Firebase config
  ```

---

## 📞 Need Help?

1. Check Railway deployment logs for errors
2. Review this guide carefully
3. Verify all environment variables are set correctly
4. Check MongoDB Atlas is accessible

---

## 🎉 Success!

Once deployed successfully, you should see:

```
🚀 Starting Slotify Backend Server...
Environment: production
Node version: v18.x.x
✅ All required environment variables are set
✅ Connected to MongoDB successfully with Mongoose!
🚀 Server running on port 3000
✅ Slotify Backend is ready!
```

Your API is now live! 🎊

---

**Last Updated**: 2025-11-09
**Railway Deployment**: Ready ✅
