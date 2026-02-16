const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// In Vercel, the output directory is served. 
// If Vercel treats this as a Node.js project, it needs this file to run.
// We serve the static files from the same directory.

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
