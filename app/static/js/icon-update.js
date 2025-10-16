const path = require('path');
const fs = require('fs');

const { getHolidayEmoji, getActiveHolidayDetails } = require('./holiday-shared');

function generateSVG(emoji) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <text y="28" font-size="28">${emoji}</text>
</svg>`;
}

// Path to favicon
const faviconPath = path.join(__dirname, '..', 'images', 'favicon.svg');
const dataDir = path.join(__dirname, '..', 'data');
const detailsPath = path.join(dataDir, 'holiday-details.json');

// Main
const emoji = getHolidayEmoji(new Date());
const svgContent = generateSVG(emoji);
const details = getActiveHolidayDetails(new Date());

try {
  fs.writeFileSync(faviconPath, svgContent, 'utf8');
} catch (err) {
  console.error('Error writing favicon SVG:', err);
}

try {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2), 'utf8');
} catch (err) {
  console.error('Error writing holiday details JSON:', err);
}
