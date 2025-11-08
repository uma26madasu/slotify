# Slotify - Intelligent Scheduling Platform

> AI-powered contextual scheduling platform with seamless calendar integration

Slotify is a modern scheduling application that helps advisors and clients manage appointments efficiently. Built with React, Node.js, and Firebase, it features intelligent availability detection, multi-calendar support, and AI-powered contextual augmentation.

## 🏗️ Monorepo Structure

This is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turbo.build/repo).

```
slotify/
├── apps/
│   ├── web/              # React frontend (Vite + TailwindCSS)
│   └── api/              # Express.js backend API
├── packages/
│   ├── shared/           # Shared utilities and types
│   └── eslint-config/    # Shared ESLint configuration
└── package.json          # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies
pnpm install

# Run both frontend and backend in development mode
pnpm dev

# Or run them separately:
pnpm web:dev    # Frontend only
pnpm api:dev    # Backend only
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm web:build
pnpm api:build
```

## 📦 Apps & Packages

### Frontend (`apps/web`)

- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **State**: React Context API
- **Auth**: Firebase Authentication
- **Database**: Firebase Firestore
- **Calendar**: React Big Calendar + Google Calendar API
- **Forms**: React Hook Form + Zod

**Key Features**:
- Create scheduling windows and shareable links
- Google Calendar integration with conflict detection
- Custom booking questions and approval workflows
- Analytics dashboard
- Public scheduler for clients

### Backend (`apps/api`)

- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + OAuth 2.0
- **Integrations**: Google Calendar, HubSpot, LinkedIn scraping
- **Email**: Nodemailer

**Key Features**:
- RESTful API endpoints
- OAuth integrations (Google, GitHub, LinkedIn)
- Email notifications
- AI contextual augmentation
- Meeting management and approvals

### Shared Packages

- **`shared`**: Common utilities, types, and constants
- **eslint-config`**: Shared ESLint configuration (WIP)

## 🔧 Development

### Available Scripts

From the root directory:

```bash
pnpm dev          # Run all apps in development mode
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm clean        # Clean all node_modules and build artifacts

pnpm web:dev      # Run frontend only
pnpm api:dev      # Run backend only
pnpm web:build    # Build frontend only
pnpm api:build    # Build backend only
```

### Environment Variables

Each app has its own `.env` file:

**Frontend (`apps/web/.env`)**:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... other Firebase config
```

**Backend (`apps/api/.env`)**:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
# ... other API keys
```

## 🌐 Deployment

### Frontend (Vercel)

The frontend is configured for Vercel deployment:

```bash
cd apps/web
vercel deploy
```

### Backend (Render/Railway/Fly.io)

The backend can be deployed to any Node.js hosting platform:

```bash
cd apps/api
# Follow platform-specific deployment instructions
```

## 🧪 Testing

Testing infrastructure is currently being set up. Stay tuned!

## 📝 Contributing

This is a private project. For questions or contributions, please contact the project maintainer.

## 🔗 Integration with Chainsync

Slotify is designed to work as a scheduling agent within the Chainsync ecosystem. The modular monorepo structure allows for:

- Standalone web application deployment
- Integration as a Chainsync agent
- Shared core logic between both use cases

## 📄 License

Private project - All rights reserved

## 🙏 Acknowledgments

Built with modern tools and frameworks:
- React, Vite, TailwindCSS
- Express.js, MongoDB
- Firebase
- Turborepo, pnpm
