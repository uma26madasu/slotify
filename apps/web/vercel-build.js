// vercel-build.js
import { createRequire } from 'module';
import { existsSync, mkdirSync, cpSync } from 'fs';
const require = createRequire(import.meta.url);
const path = require('path');

async function build() {
  console.log('Starting custom build process...');

  try {
    // Dynamically import Vite
    const { build } = await import('vite');

    console.log('Building the application with Vite...');
    await build({
      root: process.cwd(),
      mode: 'production',
      configFile: path.resolve(process.cwd(), 'vite.config.js')
    });

    console.log('Build completed successfully!');

    // Copy dist to public for Vercel
    console.log('Copying build output to public directory...');
    const publicDir = path.resolve(process.cwd(), '..', '..', 'public');
    const distDir = path.resolve(process.cwd(), 'dist');

    // Ensure public directory exists
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    // Copy dist contents to public
    cpSync(distDir, publicDir, { recursive: true });
    console.log('Successfully copied build output to public directory!');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();