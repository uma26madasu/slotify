import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

// Create a function to generate env-config.js with environment variables
function createEnvConfigFile(env) {
  const envConfig = `
    window.__ENV__ = {
      // API URL
      VITE_API_URL: '${env.VITE_API_URL || 'https://slotify-backend.onrender.com'}',
      
      // Firebase configuration
      VITE_FIREBASE_API_KEY: '${env.VITE_FIREBASE_API_KEY || 'AIzaSyCYsr6oZ3j-R7nJe6xWaRO6Q5xi0Rk3IV8'}',
      VITE_FIREBASE_AUTH_DOMAIN: '${env.VITE_FIREBASE_AUTH_DOMAIN || 'procalenderfrontend.firebaseapp.com'}',
      VITE_FIREBASE_PROJECT_ID: '${env.VITE_FIREBASE_PROJECT_ID || 'procalenderfrontend'}',
      VITE_FIREBASE_STORAGE_BUCKET: '${env.VITE_FIREBASE_STORAGE_BUCKET || 'procalenderfrontend.firebasestorage.app'}',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '${env.VITE_FIREBASE_MESSAGING_SENDER_ID || '302768668350'}',
      VITE_FIREBASE_APP_ID: '${env.VITE_FIREBASE_APP_ID || '1:302768668350:web:b92f80489662289e28e8ef'}',
      VITE_FIREBASE_MEASUREMENT_ID: '${env.VITE_FIREBASE_MEASUREMENT_ID || 'G-QJWKGJN76S'}',
      
      // Feature flags
      VITE_USE_FIREBASE_EMULATORS: '${env.VITE_USE_FIREBASE_EMULATORS || 'false'}',
      VITE_ENABLE_ANALYTICS: '${env.VITE_ENABLE_ANALYTICS || 'true'}',
      
      // Version info (useful for debugging)
      VITE_APP_VERSION: '${env.VITE_APP_VERSION || '1.0.0'}',
      VITE_APP_BUILD_DATE: '${new Date().toISOString()}'
    };
  `;

  // Ensure public directory exists
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  // Write the file
  fs.writeFileSync('./public/env-config.js', envConfig);
  console.log('Created env-config.js with environment variables');
}

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd());
  
  // Create env-config.js file with the loaded environment variables
  createEnvConfigFile(env);

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@assets': resolve(__dirname, 'src/assets')
      },
      extensions: ['.js', '.jsx', '.svg']
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://slotify-backend.onrender.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true
        }
      },
      port: 3000,
      open: false,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: false, // Keep console logs for debugging
          drop_debugger: true
        },
        format: {
          comments: false
        }
      },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'vendor_firebase';
              if (id.includes('react')) return 'vendor_react';
              if (id.includes('zod')) return 'vendor_validation';
              return 'vendor';
            }
          },
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    define: {
      // Make environment variables available globally
      '__ENV__': JSON.stringify({
        VITE_API_URL: env.VITE_API_URL || 'https://slotify-backend.onrender.com',
        VITE_FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY || 'AIzaSyCYsr6oZ3j-R7nJe6xWaRO6Q5xi0Rk3IV8',
        VITE_FIREBASE_AUTH_DOMAIN: env.VITE_FIREBASE_AUTH_DOMAIN || 'procalenderfrontend.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID || 'procalenderfrontend',
        VITE_FIREBASE_STORAGE_BUCKET: env.VITE_FIREBASE_STORAGE_BUCKET || 'procalenderfrontend.firebasestorage.app',
        VITE_FIREBASE_MESSAGING_SENDER_ID: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '302768668350',
        VITE_FIREBASE_APP_ID: env.VITE_FIREBASE_APP_ID || '1:302768668350:web:b92f80489662289e28e8ef',
        VITE_FIREBASE_MEASUREMENT_ID: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-QJWKGJN76S',
        VITE_USE_FIREBASE_EMULATORS: env.VITE_USE_FIREBASE_EMULATORS || 'false',
        VITE_ENABLE_ANALYTICS: env.VITE_ENABLE_ANALYTICS || 'true',
        VITE_APP_VERSION: env.VITE_APP_VERSION || '1.0.0',
        VITE_APP_BUILD_DATE: new Date().toISOString()
      })
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer()
        ]
      }
    }
  };
});