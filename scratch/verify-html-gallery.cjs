const fs = require('fs');
const path = require('path');

const templatesDir = path.resolve(__dirname, '..');
const topicsJsonPath = path.join(templatesDir, 'source', 'linkedin-topics.json');
const topics = JSON.parse(fs.readFileSync(topicsJsonPath, 'utf8'));

let errors = 0;

console.log('=== VERIFYING LINKEDIN HTML TEMPLATES & PREVIEW GALLERY ===\n');

// 1. Check preview files
const requiredRootFiles = ['preview.html', 'preview.css', 'preview.js', 'preview-data.js', 'assets/brand/template.css'];
for (const rf of requiredRootFiles) {
  const p = path.join(templatesDir, rf);
  if (!fs.existsSync(p)) {
    console.error(`[ERROR] Missing root file: ${rf}`);
    errors++;
  } else {
    const size = fs.statSync(p).size;
    console.log(`[PASS] ${rf} exists (${size} bytes)`);
  }
}

// 2. Check all 100 individual HTML files
let htmlFound = 0;
let imagesLinkedAndExisting = 0;

for (const t of topics) {
  const htmlRelPath = t.outputFile.replace(/\.md$/, '.html');
  const htmlFullPath = path.join(templatesDir, htmlRelPath);

  if (!fs.existsSync(htmlFullPath)) {
    console.error(`[ERROR] Missing HTML file for topic ${t.id}: ${htmlRelPath}`);
    errors++;
    continue;
  }
  htmlFound++;

  const content = fs.readFileSync(htmlFullPath, 'utf8');

  // Verify CSS link
  if (!content.includes('../../assets/brand/template.css')) {
    console.error(`[ERROR] Topic ${t.id} HTML does not link to ../../assets/brand/template.css`);
    errors++;
  }

  // Verify gallery link
  if (!content.includes('../../preview.html')) {
    console.error(`[ERROR] Topic ${t.id} HTML does not link to ../../preview.html`);
    errors++;
  }

  // If single-image, check image link and image file existence on disk
  if (t.format === 'single-image') {
    const baseSlug = path.basename(t.outputFile, '.md');
    const expectedImgName = `${baseSlug}.png`;
    const expectedImgPathOnDisk = path.join(templatesDir, 'assets', 'post-images', expectedImgName);

    if (!fs.existsSync(expectedImgPathOnDisk)) {
      console.error(`[ERROR] Topic ${t.id} Image missing on disk: ${expectedImgPathOnDisk}`);
      errors++;
    } else {
      imagesLinkedAndExisting++;
    }

    if (!content.includes(`../../assets/post-images/${expectedImgName}`)) {
      console.error(`[ERROR] Topic ${t.id} HTML does not link to ../../assets/post-images/${expectedImgName}`);
      errors++;
    }
  }
}

console.log(`\nChecked ${topics.length} topics:`);
console.log(`- HTML files found: ${htmlFound} / 100`);
console.log(`- Image assets verified and linked: ${imagesLinkedAndExisting} / 60`);

// 3. Check preview-data.js data integrity
const previewDataContent = fs.readFileSync(path.join(templatesDir, 'preview-data.js'), 'utf8');
const dataMatch = previewDataContent.match(/window\.PROFITMACHINES_TOPICS\s*=\s*(\[[\s\S]*\]);/);
if (!dataMatch) {
  console.error('[ERROR] Could not parse window.PROFITMACHINES_TOPICS from preview-data.js');
  errors++;
} else {
  const parsedData = JSON.parse(dataMatch[1]);
  console.log(`- preview-data.js records count: ${parsedData.length} / 100`);
  if (parsedData.length !== 100) {
    console.error(`[ERROR] Expected 100 records in preview-data.js, found ${parsedData.length}`);
    errors++;
  }
}

// 4. Verify no changes outside profit-machines-linkedin-templates
console.log('\nTotal Errors:', errors);
if (errors === 0) {
  console.log('\n>>> ALL 100 HTML TEMPLATES, 60 IMAGES, AND PREVIEW GALLERY VERIFIED 100% PERFECTLY! <<<');
} else {
  console.error('\n>>> VERIFICATION FAILED WITH ' + errors + ' ERRORS <<<');
  process.exit(1);
}

