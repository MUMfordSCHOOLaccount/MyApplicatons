#!/usr/bin/env node
// validate_assets.js
// Scans www/assets for image files and compares them to references in levels.json and game.js/www/game.js
// Usage: node tools/validate_assets.js

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const assetsDir = path.join(root, 'www', 'assets');
const reportPath = path.join(root, 'tools', 'asset-report.json');

function walk(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  });
  return results;
}

function rel(p) {
  return p.replace(root + path.sep, '').replace(/\\/g, '/');
}

function collectImages(fileList) {
  const exts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
  return fileList.filter(f => exts.includes(path.extname(f).toLowerCase()));
}

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function extractPathsFromLevels(levelsJson) {
  const refs = new Set();
  if (!levelsJson) return refs;
  function addIfString(s) { if (typeof s === 'string') refs.add(s); }

  if (Array.isArray(levelsJson.levels)) {
    for (const lvl of levelsJson.levels) {
      if (lvl.photo) addIfString(lvl.photo);
      ['cutsceneBefore','cutsceneAfter'].forEach(k => {
        if (Array.isArray(lvl[k])) {
          for (const sc of lvl[k]) addIfString(sc.image);
        }
      });
    }
  }

  if (levelsJson.endings) {
    for (const endKey of Object.keys(levelsJson.endings)) {
      const end = levelsJson.endings[endKey];
      if (Array.isArray(end.images)) for (const img of end.images) addIfString(img);
    }
  }

  return refs;
}

function extractIconPathsFromGameJs(jsContent) {
  const refs = new Set();
  if (!jsContent) return refs;
  // crude regex to find "assets/..." paths inside quotes
  const re = /['\"](assets\/[^'\"]+)['\"]/g;
  let m;
  while ((m = re.exec(jsContent)) !== null) {
    refs.add(m[1]);
  }
  return refs;
}

async function main() {
  console.log('Scanning assets...');
  const allFiles = walk(assetsDir);
  const imageFiles = collectImages(allFiles);
  const imageRel = imageFiles.map(f => rel(f));

  const levelsPath = path.join(root, 'www', 'assets', 'levels.json');
  const levelsJson = readJSON(levelsPath);
  const levelRefs = extractPathsFromLevels(levelsJson);

  const gameJsPath1 = path.join(root, 'www', 'game.js');
  const gameJsPath2 = path.join(root, 'game.js');
  let gameJsContent = '';
  if (fs.existsSync(gameJsPath1)) gameJsContent += fs.readFileSync(gameJsPath1, 'utf8') + '\n';
  if (fs.existsSync(gameJsPath2)) gameJsContent += fs.readFileSync(gameJsPath2, 'utf8') + '\n';
  const iconRefs = extractIconPathsFromGameJs(gameJsContent);

  const allRefs = new Set([...levelRefs, ...iconRefs]);

  const refList = Array.from(allRefs).sort();

  const missing = [];
  const matched = [];

  for (const ref of refList) {
    // normalize ref: remove leading './' or '/'
    const norm = ref.replace(/^\.?\//, '');
    // check if any file in imageRel endsWith norm or equals norm
    const found = imageRel.find(p => p.endsWith(norm));
    if (found) matched.push({ ref, file: found });
    else {
      // try basename match ignoring extension
      const base = norm.replace(/\.[^.]+$/, '');
      const alt = imageRel.find(p => p.replace(/\.[^.]+$/, '').endsWith(base));
      if (alt) matched.push({ ref, file: alt, note: 'matched by basename ignoring extension' });
      else missing.push(ref);
    }
  }

  const unused = imageRel.filter(p => {
    // image not referenced
    return !matched.some(m => m.file === p) && !refList.some(r => p.endsWith(r.replace(/^\.?\//, '')));
  });

  const report = {
    generatedAt: new Date().toISOString(),
    assetDir: rel(assetsDir),
    imageCount: imageRel.length,
    referencedPathsCount: refList.length,
    matched,
    missing,
    unused
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('Report written to', reportPath);
  console.log('Summary: images=%d, references=%d, matched=%d, missing=%d, unused=%d', imageRel.length, refList.length, matched.length, missing.length, unused.length);
  if (missing.length) {
    console.log('\nMissing referenced files:');
    for (const m of missing) console.log(' -', m);
  }
  console.log('\nUnused image files: %d (see report)', unused.length);
}

main().catch(err => { console.error(err); process.exit(1); });
opt