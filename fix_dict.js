const fs = require('fs');
let d = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// The replacement created duplicate settings object in PT probably, or I messed it up.
// Let's re-read the file and check line 58.

let lines = d.split('\n');
console.log(lines.slice(50, 65).join('\n'));
