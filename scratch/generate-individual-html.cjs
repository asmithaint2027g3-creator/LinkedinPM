const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const templatesDir = rootDir;
const topicsJsonPath = path.join(templatesDir, 'source', 'linkedin-topics.json');

const topics = JSON.parse(fs.readFileSync(topicsJsonPath, 'utf8'));

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let currentHeading = 'header';
  const sections = { header: [] };

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      currentHeading = trimmed.replace('## ', '').trim();
      sections[currentHeading] = [];
    } else {
      sections[currentHeading].push(line);
    }
  }

  // Helper to get raw section text
  const getSectionText = (name) => {
    if (!sections[name]) return '';
    return sections[name].join('\n').trim();
  };

  // Helper to extract key-values from bullet lists
  const extractListDict = (name) => {
    const text = getSectionText(name);
    const dict = {};
    const regex = /-\s+\*\*([^*]+)\*\*:\s*(.+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      dict[match[1].trim()] = match[2].trim();
    }
    return dict;
  };

  return {
    raw: content,
    sections,
    getSectionText,
    extractListDict
  };
}

function formatPostCopyHtml(copyText) {
  if (!copyText) return '';
  // Clean trailing divider or hashtags if already separated
  let cleanText = copyText.replace(/\n---\s*$/g, '').trim();

  // Split into paragraphs by blank lines
  const rawParagraphs = cleanText.split(/\n\s*\n/);
  const htmlParts = [];

  for (let para of rawParagraphs) {
    para = para.trim();
    if (!para) continue;

    // Check if it's a list of bullets or numbered list
    const lines = para.split('\n');
    const isBulletList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* '));
    const isNumberedList = lines.every(l => /^\d+\.\s+/.test(l.trim()));

    if (isBulletList) {
      const items = lines.map(l => `<li>${escapeHtml(l.trim().replace(/^[-*]\s+/, ''))}</li>`).join('\n');
      htmlParts.push(`<ul>\n${items}\n</ul>`);
    } else if (isNumberedList) {
      const items = lines.map(l => `<li>${escapeHtml(l.trim().replace(/^\d+\.\s+/, ''))}</li>`).join('\n');
      htmlParts.push(`<ol>\n${items}\n</ol>`);
    } else {
      // Regular paragraph
      // Convert bold **text** to <strong>text</strong>
      let formatted = escapeHtml(para)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      htmlParts.push(`<p>${formatted}</p>`);
    }
  }

  return htmlParts.join('\n');
}

function extractHashtags(text) {
  const matches = text.match(/#\w+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

// Generate for all 100 topics
let generatedCount = 0;

for (let i = 0; i < topics.length; i++) {
  const topic = topics[i];
  const mdRelativePath = topic.outputFile;
  const mdFullPath = path.join(templatesDir, mdRelativePath);
  const htmlFullPath = mdFullPath.replace(/\.md$/, '.html');
  const baseSlug = path.basename(mdRelativePath, '.md');

  const prevTopic = i > 0 ? topics[i - 1] : null;
  const nextTopic = i < topics.length - 1 ? topics[i + 1] : null;

  const parsed = parseMarkdownFile(mdFullPath);

  // Determine section contents
  const isImagePost = topic.format === 'single-image';
  const metaDict = parsed.extractListDict('Metadata & Classification');
  const complianceDict = parsed.extractListDict('Editorial Verification & Compliance');
  const ctaDict = parsed.extractListDict('Call to Action & Commercial Conversion');

  // Post copy
  let postCopyRaw = isImagePost
    ? parsed.getSectionText('Complete LinkedIn Post & Caption')
    : parsed.getSectionText('Complete LinkedIn Post Copy');

  // Extract hashtags from post copy or CTA dict
  const hashtags = extractHashtags(postCopyRaw + ' ' + (ctaDict['Hashtags'] || ''));

  // Clean hashtags out from end of post body if displayed separately
  let cleanCopyRaw = postCopyRaw.replace(/#\w+(\s+#\w+)*\s*$/g, '').trim();
  cleanCopyRaw = cleanCopyRaw.replace(/\n---\s*$/g, '').trim();

  // For copy button payload (plain text for clipboard)
  const fullClipboardText = postCopyRaw.replace(/\n---\s*$/g, '').trim();

  // Image section details if single-image
  let imageVisualBriefHtml = '';
  if (isImagePost) {
    const visualBriefDict = parsed.extractListDict('Image Specification & Visual Brief');
    const visualText = parsed.getSectionText('Image Specification & Visual Brief');

    // Extract exact text in graphic
    let exactTextInGraphic = '';
    const codeBlockMatch = visualText.match(/```text([\s\S]*?)```/);
    if (codeBlockMatch) {
      exactTextInGraphic = codeBlockMatch[1].trim();
    }

    const imageFilename = `${baseSlug}.png`;
    const imageRelativePath = `../../assets/post-images/${imageFilename}`;

    imageVisualBriefHtml = `
    <!-- Visual Framework Image Asset -->
    <section class="pm-visual-section">
      <div class="pm-visual-header">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--pm-blue-primary)"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Visual Asset &amp; Framework Architecture (1200 &times; 1200)
        </h3>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <a href="../../single-image-generator.html" class="pm-btn pm-btn-primary pm-btn-sm">
            🎨 Customize in Studio
          </a>
          <a href="${imageRelativePath}" target="_blank" class="pm-btn pm-btn-secondary pm-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Full Image
          </a>
        </div>
      </div>
      <div class="pm-image-wrapper">
        <img src="${imageRelativePath}" alt="${escapeHtml(visualBriefDict['Accessibility Alt Text'] || topic.title)}" class="pm-post-image" loading="lazy">
      </div>
      <div class="pm-visual-specs">
        <div class="pm-spec-row"><strong>Headline:</strong> ${escapeHtml(visualBriefDict['Image Headline'] || topic.title)}</div>
        <div class="pm-spec-row"><strong>Subtitle:</strong> ${escapeHtml(visualBriefDict['Image Subtitle'] || '')}</div>
        <div class="pm-spec-row"><strong>Framework:</strong> ${escapeHtml(visualBriefDict['Visual Framework'] || '')}</div>
        <div class="pm-spec-row"><strong>Alt Text:</strong> ${escapeHtml(visualBriefDict['Accessibility Alt Text'] || '')}</div>
        ${exactTextInGraphic ? `<div class="pm-spec-row" style="margin-top:1rem;"><strong>Graphic Content:</strong><div class="pm-text-graphic-box">${escapeHtml(exactTextInGraphic)}</div></div>` : ''}
      </div>
    </section>
    `;
  }

  // Hook details if text-only
  let hookHtml = '';
  if (!isImagePost) {
    const hookDict = parsed.extractListDict('Executive Hook & Core Thesis');
    hookHtml = `
    <!-- Executive Hook Card -->
    <div class="pm-hook-card">
      <div class="pm-hook-label">Executive Hook &amp; Core Thesis</div>
      <div class="pm-hook-quote">&ldquo;${escapeHtml(hookDict['Opening Hook'] || topic.title)}&rdquo;</div>
      <div class="pm-hook-takeaway"><strong>Concrete Takeaway:</strong> ${escapeHtml(hookDict['Concrete Takeaway'] || topic.contentBrief)}</div>
    </div>
    `;
  }

  // Post Body HTML
  const formattedBodyHtml = formatPostCopyHtml(cleanCopyRaw);

  // Hashtag HTML
  const hashtagsHtml = hashtags.map(h => `<span class="pm-hashtag-pill">${escapeHtml(h)}</span>`).join(' ');

  // CTA Text & Link
  const ctaText = ctaDict['CTA'] || 'Learn how ProfitMachines delivers AI-Native Revenue Transformation at profitmachines.work';

  // Navigation Links
  const prevLinkHtml = prevTopic
    ? `<a href="../${prevTopic.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${path.basename(prevTopic.outputFile, '.md')}.html" class="pm-btn pm-btn-secondary pm-btn-sm">&larr; Topic ${String(prevTopic.id).padStart(3, '0')}</a>`
    : `<span class="pm-btn pm-btn-secondary pm-btn-sm" style="opacity:0.4;cursor:default;">&larr; Start</span>`;

  const nextLinkHtml = nextTopic
    ? `<a href="../${nextTopic.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${path.basename(nextTopic.outputFile, '.md')}.html" class="pm-btn pm-btn-secondary pm-btn-sm">Topic ${String(nextTopic.id).padStart(3, '0')} &rarr;</a>`
    : `<span class="pm-btn pm-btn-secondary pm-btn-sm" style="opacity:0.4;cursor:default;">End &rarr;</span>`;

  // HTML Page Template
  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Topic ${String(topic.id).padStart(3, '0')} — ${escapeHtml(topic.title)} | ProfitMachines</title>
  <link rel="stylesheet" href="../../assets/brand/template.css">
</head>
<body>

  <div class="pm-container">

    <!-- Top Navigation Bar -->
    <header class="pm-topbar">
      <a href="../../preview.html" class="pm-brand-badge" title="Back to All 100 Templates">
        <img src="../../assets/brand/brand-icon.png" alt="PM" class="pm-brand-logo" onerror="this.style.display='none'">
        <div class="pm-brand-title">Profit<span>Machines</span> <small style="font-size:0.75rem;font-weight:400;color:var(--pm-text-muted);">Content Library</small></div>
      </a>
      <div class="pm-topbar-actions">
        <a href="../../preview.html#topic-${topic.id}" class="pm-btn pm-btn-secondary pm-btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Gallery View
        </a>
        <button id="copyCaptionBtn" class="pm-btn pm-btn-primary pm-btn-sm" onclick="copyCaptionToClipboard()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy Caption
        </button>
      </div>
    </header>

    <!-- Header Card -->
    <header class="pm-header-card">
      <div class="pm-meta-pills">
        <span class="pm-pill pm-pill-id">Topic ${String(topic.id).padStart(3, '0')}</span>
        <span class="pm-pill pm-pill-category">${escapeHtml(topic.category)}</span>
        <span class="pm-pill ${isImagePost ? 'pm-pill-format' : 'pm-pill-text'}">${isImagePost ? 'Single Image Post' : 'Text-Only Post'}</span>
      </div>
      <h1 class="pm-post-title">${escapeHtml(topic.title)}</h1>
      
      <div class="pm-meta-grid">
        <div class="pm-meta-item">
          <strong>Category</strong>
          <span>${escapeHtml(topic.category)}</span>
        </div>
        <div class="pm-meta-item">
          <strong>Subcategory</strong>
          <span>${escapeHtml(topic.subcategory)}</span>
        </div>
        <div class="pm-meta-item">
          <strong>Target Audience</strong>
          <span>${escapeHtml(topic.targetAudience)}</span>
        </div>
        <div class="pm-meta-item">
          <strong>Content Objective</strong>
          <span>${escapeHtml(metaDict['Content Objective'] || topic.contentBrief)}</span>
        </div>
      </div>
    </header>

    ${hookHtml}

    ${imageVisualBriefHtml}

    <!-- LinkedIn Post Simulation Frame -->
    <article class="pm-post-sim">
      <div class="pm-sim-header">
        <div class="pm-sim-author">
          <div class="pm-sim-avatar">PM</div>
          <div class="pm-sim-meta">
            <h4>ProfitMachines.work</h4>
            <p>AI-Native Revenue Transformation Platform &bull; Follow</p>
          </div>
        </div>
        <span style="font-size:0.75rem;color:var(--pm-text-muted);font-weight:600;">Production-Ready Copy</span>
      </div>

      <div class="pm-post-body">
        ${formattedBodyHtml}

        <div class="pm-hashtags">
          ${hashtagsHtml}
        </div>
      </div>
    </article>

    <!-- Call to Action Banner -->
    <div class="pm-cta-card">
      <div class="pm-cta-content">
        <h4>Commercial Conversion Trigger</h4>
        <p>${escapeHtml(ctaText)}</p>
      </div>
      <a href="https://profitmachines.work" target="_blank" class="pm-btn pm-btn-primary" style="background:#2563EB;white-space:nowrap;">
        Visit Platform &rarr;
      </a>
    </div>

    <!-- Compliance & Verification Box -->
    <div class="pm-compliance-card">
      <h4>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--pm-emerald-primary)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Editorial Verification &amp; Positioning Compliance
      </h4>
      <div class="pm-compliance-item">
        <strong>Positioning Alignment:</strong> ${escapeHtml(complianceDict['Positioning Alignment'] || 'ProfitMachines.work delivers Revenue Acceleration, Sales Acceleration, and Margin Expansion.')}
      </div>
      <div class="pm-compliance-item">
        <strong>Verification Note:</strong> ${escapeHtml(complianceDict['Verification Note'] || 'Aligned with enterprise GTM standards.')}
      </div>
      <div class="pm-compliance-item">
        <strong>Claim Check:</strong> ${escapeHtml(complianceDict['Claim Check'] || 'Verified factual commercial principles without unverified claims.')}
      </div>
    </div>

    <!-- Navigation Footer -->
    <footer class="pm-nav-footer">
      ${prevLinkHtml}
      <a href="../../preview.html" class="pm-btn pm-btn-secondary pm-btn-sm">
        All 100 Templates Index
      </a>
      ${nextLinkHtml}
    </footer>

  </div>

  <!-- Toast Notification -->
  <div id="pmToast" class="pm-toast">Caption copied to clipboard!</div>

  <!-- Hidden payload for clipboard copying -->
  <textarea id="rawCaptionData" style="display:none;">${escapeHtml(fullClipboardText)}</textarea>

  <script>
    function copyCaptionToClipboard() {
      const copyText = document.getElementById('rawCaptionData').value;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(copyText).then(showToast);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = copyText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast();
      }
    }

    function showToast() {
      const toast = document.getElementById('pmToast');
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 2500);
    }
  </script>

</body>
</html>
`;

  fs.writeFileSync(htmlFullPath, htmlDoc, 'utf8');
  generatedCount++;
}

console.log(`Successfully generated ${generatedCount} individual HTML files!`);
