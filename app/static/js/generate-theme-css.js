#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const themeConfig = require('./theme-config.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'css', 'generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'theme-accents.css');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function buildAccentCss(palette) {
  if (!palette || typeof palette !== 'object') return '';
  let css = '';
  Object.entries(palette).forEach(([name, def]) => {
    if (!def || !def.color) return;
    css += `.accent-${name} {\n`;
    css += `  --accent: ${def.color};\n`;
    if (def.mixDark) css += `  --mix-dark: ${def.mixDark};\n`;
    if (def.mixLight) css += `  --mix-light: ${def.mixLight};\n`;
    css += `}\n\n`;
  });
  return css.trimEnd();
}

function main() {
  const css = buildAccentCss(themeConfig.accentPalette);
  ensureDir(OUTPUT_DIR);
  fs.writeFileSync(OUTPUT_FILE, css ? css + '\n' : '', 'utf8');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Failed to generate accent CSS:', err);
    process.exit(1);
  }
}

module.exports = main;
