#!/usr/bin/env node
// auto_fix_levels.js
// Read tools/asset-report.json and automatically update www/assets/levels.json
// by replacing referenced paths with existing file paths where a clear match exists.

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const reportPath = path.join(root, 'tools', 'asset-report.json');
const levelsPath = path.join(root, 'www', 'assets', 'levels.json');

function rel(p) {
  return p.replace(/\\/g, '/').replace(/^www\//, '');
}

if (!fs.existsSync(reportPath)) {
  console.error('Missing report:', reportPath);
  process.exit(1);
}
if (!fs.existsSync(levelsPath)) {
  console.error('Missing levels.json:', levelsPath);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const levelsText = fs.readFileSync(levelsPath, 'utf8');
let out = levelsText;

// Apply matched replacements where ref != file
for (const m of report.matched || []) {
  const ref = m.ref;
  const file = m.file;
  const fileRel = rel(file);
  if (ref !== fileRel) {
    const escapedRef = ref.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const re = new RegExp(escapedRef, 'g');
    out = out.replace(re, fileRel);
    console.log(`Replaced matched ref ${ref} -> ${fileRel}`);
  }
}

// For missing refs, try to find an unused file with same basename
for (const ref of report.missing || []) {
  const base = path.basename(ref);
  const candidate = (report.unused || []).find(u => path.basename(u) === base);
  if (candidate) {
    const candidateRel = rel(candidate);
    const escapedRef = ref.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const re = new RegExp(escapedRef, 'g');
    out = out.replace(re, candidateRel);
    console.log(`Mapped missing ${ref} -> ${candidateRel}`);
  } else {
    console.warn('No candidate for missing ref', ref);
  }
}

if (out === levelsText) {
  console.log('No changes to apply.');
  process.exit(0);
}

fs.writeFileSync(levelsPath, out, 'utf8');
console.log('Updated', levelsPath);
