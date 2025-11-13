# Railway Environment Variables Setup

## 🚂 Railway Deployment Configuration

Copy and paste these environment variables into your Railway project.

### For API Service (Backend)

```bash
# Node Environment
NODE_ENV=production

# MongoDB Atlas Connection
# Password already included and URL-encoded
MONGODB_URI=mongodb+srv://umamadasu:Impala%40007@cluster0.wxajvjb.mongodb.net/slotify?appName=Cluster0

# JWT Secret (Already Generated)
JWT_SECRET=39111a93f1cb196ca4de31b0a4afebbb0af52d837236509c8ada2e3f4e6331fc

# Webhook Secret (Already Generated)
WEBHOOK_SECRET=9d38bb68b50be5d561c74a98f8f60d6e6b4f3063f2690cea75a5ae4f3b59de17

# Frontend URL (Update with your Railway frontend URL)
FRONTEND_URL=https://your-frontend-app.up.railway.app

# Google OAuth (Optional - Add when ready)
# GOOGLE_CLIENT_ID=your_google_client_id_here
# GOOGLE_CLIENT_SECRET=your_google_client_secret_here
# GOOGLE_REDIRECT_URI=https://your-api-app.up.railway.app/auth/google/callback

# Email Service (Optional - Add when ready)
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password_here

# App Settings
MAX_BOOKING_DAYS_AHEAD=365
DEFAULT_MEETING_LENGTH=60
```

---

## 📋 How to Add Variables in Railway

### Method 1: Using Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on your **API service**
4. Click **"Variables"** tab
5. Click **"New Variable"**
6. Add each variable one by one:
   - Variable name (e.g., `MONGODB_URI`)
   - Variable value (the actual value)
7. Click **"Add"**
8. Railway will automatically redeploy

### Method 2: Using Railway CLI (Faster)

Install Railway CLI:
```bash
npm i -g @railway/cli
```

Login:
```bash
railway login
```

Set variables:
```bash
railway variables set MONGODB_URI="mongodb+srv://umamadasu:YOUR_PASSWORD@cluster0.h4opqie.mongodb.net/slotify?retryWrites=true&w=majority&appName=Cluster0"
railway variables set JWT_SECRET="39111a93f1cb196ca4de31b0a4afebbb0af52d837236509c8ada2e3f4e6331fc"
railway variables set WEBHOOK_SECRET="9d38bb68b50be5d561c74a98f8f60d6e6b4f3063f2690cea75a5ae4f3b59de17"
railway variables set NODE_ENV="production"
railway variables set MAX_BOOKING_DAYS_AHEAD="365"
railway variables set DEFAULT_MEETING_LENGTH="60"
```

---

## ✅ Verification Checklist

After adding variables to Railway:

- [ ] `MONGODB_URI` - Added with actual password
- [ ] `JWT_SECRET` - Added (already generated)
- [ ] `WEBHOOK_SECRET` - Added (already generated)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `FRONTEND_URL` - Updated with actual Railway frontend URL
- [ ] App deployed successfully
- [ ] Test endpoint: `https://your-api.up.railway.app/api/test`
- [ ] Test MongoDB: `https://your-api.up.railway.app/api/mongodb-test`

---

## 🔗 Get Your Railway URLs

After deployment, Railway will provide URLs like:

- **API**: `https://your-api-name.up.railway.app`
- **Frontend**: `https://your-frontend-name.up.railway.app`

Update the `FRONTEND_URL` variable with your actual frontend URL.

---

## 🧪 Testing Your Deployment

Once deployed, test these endpoints:

1. **Health Check:**
   ```bash
   curl https://your-api.up.railway.app/
   ```

2. **API Test:**
   ```bash
   curl https://your-api.up.railway.app/api/test
   ```

3. **MongoDB Connection Test:**
   ```bash
   curl https://your-api.up.railway.app/api/mongodb-test
   ```

4. **Config Test:**
   ```bash
   curl https://your-api.up.railway.app/api/test-config
   ```

---

## 🔒 Security Notes

1. **Never commit** environment variables to Git
2. **Rotate secrets** if they are accidentally exposed
3. **Use Railway's secrets** for sensitive data
4. **Enable** Railway's built-in security features

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Support: Check Railway community or Discord

---

**Last Updated:** 2025-11-09
**Secrets Generated:** JWT_SECRET, WEBHOOK_SECRET
**Status:** Ready for deployment
