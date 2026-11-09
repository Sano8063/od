// Od-u tək bir HTML faylına yığır: node scripts/build.js  →  index.html
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('src/template.html')
  .replace('/*ENGINE*/', () => read('src/engine.js'))
  .replace('/*EXAMPLES*/', () => read('src/examples.js'))
  .replace('/*LESSONS*/', () => read('src/lessons.js'));
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('✓ index.html yaradıldı (' + Math.round(html.length / 1024) + ' KB)');
