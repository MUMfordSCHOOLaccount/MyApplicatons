#!/usr/bin/env node
// create_placeholders.js
// Create zero-byte placeholder image files for any referenced asset paths that don't exist yet.

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const levelsPath = path.join(root, 'www', 'assets', 'levels.json');
const gameJs1 = path.join(root, 'www', 'game.js');
const gameJs2 = path.join(root, 'game.js');

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) { return null; }
}

function collectRefsFromLevels(levelsJson) {
  const refs = new Set();
  if (!levelsJson) return refs;
  function add(s){ if (s) refs.add(s); }
  for (const lvl of levelsJson.levels || []) {
    add(lvl.photo);
    for (const k of ['cutsceneBefore','cutsceneAfter']) {
      if (Array.isArray(lvl[k])) for (const sc of lvl[k]) add(sc.image);
    }
  }
  if (levelsJson.endings) {
    for (const e of Object.values(levelsJson.endings)) {
      if (Array.isArray(e.images)) for (const img of e.images) add(img);
    }
  }
  return refs;
}

function collectRefsFromGameJs(content) {
  const refs = new Set();
  if (!content) return refs;
  const re = /['\"](assets\/[^'\"]+)['\"]/g;
  let m;
  while ((m = re.exec(content)) !== null) refs.add(m[1]);
  return refs;
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function isImagePath(p) {
  return /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(p);
}

(async function main(){
  const levelsJson = readJSON(levelsPath);
  const refs = collectRefsFromLevels(levelsJson);

  let gameContent = '';
  if (fs.existsSync(gameJs1)) gameContent += fs.readFileSync(gameJs1, 'utf8') + '\n';
  if (fs.existsSync(gameJs2)) gameContent += fs.readFileSync(gameJs2, 'utf8') + '\n';
  for (const r of collectRefsFromGameJs(gameContent)) refs.add(r);

  const created = [];
  for (const ref of refs) {
    if (!isImagePath(ref)) continue;
    const dest = path.join(root, 'www', ref.replace(/^[.\/]+/, ''));
    if (!fs.existsSync(dest)) {
      ensureDirForFile(dest);
      // create zero-byte file
      fs.writeFileSync(dest, '');
      created.push(dest.replace(root + path.sep, '').replace(/\\/g, '/'));
      console.log('Created placeholder', dest);
    }
  }

  if (created.length === 0) console.log('No placeholders needed');
  else console.log('Placeholders created:', created.length);
})();
