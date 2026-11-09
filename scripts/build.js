// Od-u tək bir HTML faylına yığır: node scripts/build.js  →  index.html
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const parts = {
  STYLES: 'src/styles.css', ENGINE: 'src/engine.js', EXAMPLES: 'src/examples.js', LESSONS: 'src/lessons.js',
  FIREBASE_CONFIG: 'src/firebase-config.js', CLOUD: 'src/cloud.js', APP: 'src/app.js', CLASSROOM: 'src/classroom.js'
};
let html = read('src/template.html');
for (const [k, f] of Object.entries(parts)) {
  const tag = '/*' + k + '*/';
  if (!html.includes(tag)) throw new Error('Şablonda yer tapılmadı: ' + tag);
  html = html.replace(tag, () => read(f));
}
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('✓ index.html yaradıldı (' + Math.round(html.length / 1024) + ' KB)');
