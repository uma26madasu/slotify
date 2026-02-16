# Vercel Deployment Configuration

## Project Settings

Configure these settings in your Vercel Dashboard:

### Build & Development Settings

1. **Framework Preset**: Other
2. **Root Directory**: `.` (leave empty or use root)
3. **Build Command**: `npm run vercel-build`
4. **Output Directory**: `public`
5. **Install Command**: `npm install`

### Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:
- Copy from `.env.example` in the web app
- Add any API keys (Firebase, Google Calendar, etc.)

## How the Build Works

1. Vercel runs `npm install` at the root (installs all workspace dependencies)
2. Vercel runs `npm run vercel-build` which:
   - Uses Turbo to build only the web app: `turbo run build --filter=web --force`
   - Copies the built files from `apps/web/dist` to `public/`
   - Creates a dummy `public/index.js` to satisfy Vercel's entrypoint check
3. Vercel serves the `public/` directory

## Monorepo Structure

```
slotify/
├── apps/
│   ├── web/          # React frontend (deployed to Vercel)
│   └── api/          # Node.js backend (deploy separately)
├── packages/
│   ├── shared/       # Shared utilities
│   └── eslint-config/
├── public/           # Build output (generated)
└── vercel.json       # Vercel routing config
```

## Troubleshooting

If build fails:
1. Check that Node.js version is >=18.0.0
2. Verify all dependencies install correctly
3. Make sure `turbo` is in devDependencies
4. Check build logs for specific errors

## Notes

- The API is NOT deployed to Vercel (it's ignored via `.vercelignore`)
- Only the web frontend is deployed
- The `vercel.json` file handles SPA routing (all routes → index.html)
