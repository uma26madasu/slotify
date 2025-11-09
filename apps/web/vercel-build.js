// vercel-build.js
import { createRequire } from 'module';
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
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();