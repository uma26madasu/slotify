/**
 * Vercel Build Output API v3 build script.
 * Creates .vercel/output/ structure directly, bypassing turbo/framework detection.
 * https://vercel.com/docs/build-output-api/v3
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd(); // apps/api/
const OUT = path.join(ROOT, '.vercel', 'output');
const FUNC = path.join(OUT, 'functions', 'index.func');

console.log('Building Vercel output at:', OUT);

// 1. Create directory structure
fs.mkdirSync(path.join(OUT, 'static'), { recursive: true });
fs.mkdirSync(FUNC, { recursive: true });

// 2. Vercel routing config — route everything to the Express function
fs.writeFileSync(path.join(OUT, 'config.json'), JSON.stringify({
  version: 3,
  routes: [{ src: '/(.*)', dest: '/index' }]
}, null, 2));

// 3. Static placeholder so /index.json exists
fs.writeFileSync(path.join(OUT, 'static', 'index.json'), '{"status":"ok"}');

// 4. Function runtime config
fs.writeFileSync(path.join(FUNC, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs18.x',
  handler: 'index.js',
  launcherType: 'Nodejs'
}, null, 2));

// 5. Copy all source files into the function directory
const filesToCopy = ['server.js', 'package.json', 'package-lock.json',
                     'Link.js', 'User.js', 'Window.js'];
const dirsToCopy  = ['routes', 'controllers', 'middleware', 'models', 'services', 'utils'];

for (const f of filesToCopy) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(FUNC, f));
    console.log('  copied:', f);
  }
}

for (const d of dirsToCopy) {
  const src = path.join(ROOT, d);
  if (fs.existsSync(src)) {
    execSync(`cp -r "${src}" "${path.join(FUNC, d)}"`);
    console.log('  copied dir:', d);
  }
}

// 6. Install production dependencies inside the function directory
console.log('Installing production dependencies...');
execSync('npm install --omit=dev --no-audit --no-fund', {
  cwd: FUNC,
  stdio: 'inherit'
});

// 7. Write the function entry point (must be AFTER copying server.js)
fs.writeFileSync(path.join(FUNC, 'index.js'),
  '// Vercel serverless entry point\nmodule.exports = require("./server.js");\n'
);

console.log('✅ Vercel build output ready');
