const fs = require('fs');

const bundleContent = fs.readFileSync('bundle.js');

const base64Content = bundleContent.toString('base64');

fs.writeFileSync('bundle_base64.txt', base64Content);

console.log('Base64 content has been written to bundle_base64.txt');
