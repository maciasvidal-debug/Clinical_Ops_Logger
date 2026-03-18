const fs = require('fs');
// Create a minimal valid ICO file with a 1x1 transparent pixel
const icoBuffer = Buffer.from('000001000100010100000100180030000000160000002800000001000000020000000100180000000000000000000000000000000000000000000000000000000000FF0000000000', 'hex');

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}
fs.writeFileSync('public/favicon.ico', icoBuffer);
