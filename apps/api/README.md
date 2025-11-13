# Slotify Backend API

A full-featured advisor-client scheduling platform backend built with Node.js and Express.

## 📦 Repository

**Monorepo**: [slotify](https://github.com/uma26madasu/slotify)

This is the backend API service located at `apps/api/` in the Slotify monorepo.

---

## 🔐 Authentication

- Google OAuth for user authentication
- JWT-based session management
- Support for multiple Google Calendar accounts per user

---

## 🗓 Features Overview

### Advisor Capabilities
- Create **scheduling windows** (e.g., Mon 9am–12pm)
- Create **scheduling links** with:
  - Custom usage limits
  - Expiration dates
  - Custom questions
  - Meeting duration settings
  - Maximum days in advance for bookings

### Client Scheduling Flow
- Access scheduling via unique links (no authentication required)
- Select from available time slots
- Provide booking information:
  - Email address
  - LinkedIn URL
  - Custom question responses

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Google OAuth 2.0, JWT
- **Calendar Integration**: Google Calendar API
- **Email**: Nodemailer
- **Environment**: dotenv for configuration

---

## 🚀 Local Development

### Prerequisites
- Node.js >= 14.0.0
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials

### Setup

1. Install dependencies (from monorepo root):
```bash
pnpm install
```

2. Configure environment variables in `apps/api/.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/slotify

# JWT
JWT_SECRET=your_jwt_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000

# Optional: Email notifications
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

3. Start the development server:
```bash
cd apps/api
npm run dev
```

The API will be available at `http://localhost:3001`

---

## 📚 API Endpoints

### Health Check
- `GET /` - API status check
- `GET /api/test` - Test endpoint
- `GET /api/test-config` - Configuration verification
- `GET /api/mongodb-test` - MongoDB connection test

### Authentication
- `POST /api/auth/google/url` - Get Google OAuth URL
- `POST /api/auth/google/callback` - Handle OAuth callback
- `GET /api/auth/google/status` - Check OAuth status
- `POST /api/auth/google/disconnect` - Disconnect Google account

### Calendar
- `GET /api/calendar/events` - Fetch calendar events
- `POST /api/calendar/events` - Create calendar event

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details

### Scheduling Windows
- `GET /api/windows` - List scheduling windows
- `POST /api/windows` - Create scheduling window
- `PUT /api/windows/:id` - Update scheduling window
- `DELETE /api/windows/:id` - Delete scheduling window

### Scheduling Links
- `GET /api/links` - List scheduling links
- `POST /api/links` - Create scheduling link
- `GET /api/links/:id` - Get link details
- `PUT /api/links/:id` - Update scheduling link
- `DELETE /api/links/:id` - Delete scheduling link

---

## 🗂 Project Structure

```
apps/api/
├── controllers/      # Request handlers
├── models/          # Mongoose schemas
├── routes/          # Express routes
├── middleware/      # Auth & validation middleware
├── services/        # Business logic
├── utils/           # Helper functions
├── server.js        # Application entry point
├── package.json     # Dependencies
└── .env            # Environment variables (gitignored)
```

---

## 🔒 Security

- All sensitive data in `.env` (never committed)
- JWT tokens for session management
- CORS configured for trusted origins
- Input validation with express-validator
- MongoDB connection with authentication

---

## 🚀 Deployment

This API is designed to be deployed on Railway as part of the Slotify monorepo.

### Environment Variables for Production

See `RAILWAY_ENV_SETUP.md` in the repository root for the complete list of required environment variables.

---

## 📧 Contact

- **Developer**: Uma Madasu
- **Email**: umamadasu@gmail.com
- **GitHub**: [@uma26madasu](https://github.com/uma26madasu)

---

## 📄 License

MIT License - see repository root for details
