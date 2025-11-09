# MongoDB Atlas Configuration Guide

## ✅ What's Been Configured

Your MongoDB Atlas connection string has been set up in `apps/api/.env`:

```
mongodb+srv://umamadasu:<db_password>@cluster0.h4opqie.mongodb.net/slotify?retryWrites=true&w=majority&appName=Cluster0
```

## 🔧 Next Steps

### 1. Add Your MongoDB Password to `.env` File

Open `apps/api/.env` and replace `<db_password>` with your actual MongoDB password.

**Important:** If your password contains special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `:` → `%3A`
- `/` → `%2F`

**Example:**
```bash
# If password is: MyP@ss#123
# Encode it as: MyP%40ss%23123
MONGODB_URI=mongodb+srv://umamadasu:MyP%40ss%23123@cluster0.h4opqie.mongodb.net/slotify?retryWrites=true&w=majority&appName=Cluster0
```

### 2. Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and replace `your_jwt_secret_here_replace_with_strong_random_string` in `.env`

### 3. Configure Google OAuth (Optional - if using Google Calendar features)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - Your production URL callback (e.g., `https://your-app.railway.app/auth/google/callback`)
6. Copy Client ID and Client Secret to `.env`

---

## 🚀 Railway Deployment - Environment Variables

When deploying to Railway, add these environment variables:

### Required Variables:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://umamadasu:YOUR_ACTUAL_PASSWORD@cluster0.h4opqie.mongodb.net/slotify?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret (use the one you generated)
JWT_SECRET=your_generated_jwt_secret_here

# Node Environment
NODE_ENV=production

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-railway-app.up.railway.app/auth/google/callback

# Frontend URL (your Railway frontend URL)
FRONTEND_URL=https://your-frontend.up.railway.app
```

### How to Add Variables in Railway:

1. Go to your Railway project dashboard
2. Select your **API service**
3. Click on **"Variables"** tab
4. Click **"New Variable"**
5. Add each variable one by one
6. Railway will automatically redeploy after adding variables

---

## 🧪 Testing MongoDB Connection

### Test Locally:

1. Make sure your `.env` file has the correct password
2. Navigate to the API directory:
   ```bash
   cd apps/api
   ```

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Test the connection:
   ```bash
   curl http://localhost:3001/api/mongodb-test
   ```

   Or open in browser: `http://localhost:3001/api/mongodb-test`

### Expected Response:

```json
{
  "success": true,
  "message": "MongoDB connection successful",
  "collections": ["users", "bookings", "windows", "links"],
  "connectionState": 1
}
```

---

## 📋 MongoDB Atlas Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created Free Tier (M0) cluster
- [ ] Created database user with password
- [ ] Whitelisted IP address `0.0.0.0/0` (Network Access)
- [ ] Got connection string
- [ ] Replaced `<db_password>` in `apps/api/.env`
- [ ] Generated JWT_SECRET
- [ ] Tested connection locally
- [ ] Added environment variables to Railway
- [ ] Tested connection in production

---

## 🔍 Troubleshooting

### "Authentication failed" error:
- Check that password is correctly URL encoded
- Verify database user exists in MongoDB Atlas
- Ensure user has "Read and write" privileges

### "IP not whitelisted" error:
- Go to Network Access in MongoDB Atlas
- Add IP address `0.0.0.0/0` to allow all IPs

### Connection timeout:
- Check if MongoDB Atlas cluster is active (not paused)
- Verify network connectivity
- Check firewall settings

### "Database name not found":
- The database `slotify` will be created automatically on first write
- You can verify in MongoDB Atlas → Database → Browse Collections

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

**Created:** 2025-11-09
**MongoDB Cluster:** cluster0.h4opqie.mongodb.net
**Database:** slotify
**Username:** umamadasu
