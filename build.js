const fs = require('fs');
const path = require('path');

const root = __dirname;
const outPath = path.join(root, 'pages.js');

function findMdFiles(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const rel = base ? base + '/' + file : file;
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(findMdFiles(full, rel));
    } else if (file.endsWith('.md') && file !== 'README.md') {
      const key = rel.slice(0, -3).replace(/\\/g, '/');
      results.push({ key, full });
    }
  }
  return results;
}

const files = findMdFiles(root);
const lines = ['const PAGES = {'];

for (const { key, full } of files) {
  const content = fs.readFileSync(full, 'utf8').replace(/\r\n?/g, '\n');
  lines.push('  "' + key.replace(/\\/g, '/').replace(/"/g, '\\"') + '": ' + JSON.stringify(content) + ',');
}

lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1);
lines.push('};');
if (typeof window === 'undefined') lines.push('if (typeof module !== "undefined" && module.exports) module.exports = PAGES;');

fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('Generated pages.js with', files.length, 'pages.');
