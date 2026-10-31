const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { generateSvgForTopic } = require('./infographic-engine.cjs');

const rootDir = path.resolve(__dirname, '..');
const previewDataPath = path.join(rootDir, 'preview-data.js');
const previewDataContent = fs.readFileSync(previewDataPath, 'utf8');

// Load topics
eval(previewDataContent.replace('window.', 'global.'));
const singleImageTopics = global.PROFITMACHINES_TOPICS.filter(t => t.format === 'single-image');

console.log(`Starting batch generation of ${singleImageTopics.length} single-image infographics...`);

const outputDir = path.join(rootDir, 'assets', 'post-images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function runBatch() {
  let successCount = 0;
  let errorCount = 0;

  for (const topic of singleImageTopics) {
    try {
      const svg = generateSvgForTopic(topic);
      const filename = topic.imageFilename || `${topic.idFormatted}-${topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      const outPath = path.join(outputDir, filename);

      await sharp(Buffer.from(svg))
        .png({ quality: 95, compressionLevel: 8 })
        .toFile(outPath);

      successCount++;
      if (successCount % 10 === 0 || successCount === singleImageTopics.length) {
        console.log(`Progress: [${successCount}/${singleImageTopics.length}] generated...`);
      }
    } catch (err) {
      console.error(`Error generating Topic ${topic.id} (${topic.title}):`, err.message);
      errorCount++;
    }
  }

  console.log(`\nBatch generation complete!`);
  console.log(`Successfully generated: ${successCount} images`);
  console.log(`Errors: ${errorCount}`);
}

runBatch();

