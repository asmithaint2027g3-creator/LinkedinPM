const fs = require('fs');
const path = require('path');

const templatesDir = path.resolve(__dirname, '..');
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
  const lines = content.split(/\r?\n/);

  const sections = {};
  let currentSection = 'header';
  sections[currentSection] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      currentSection = trimmed.replace('## ', '').trim();
      sections[currentSection] = [];
    } else {
      sections[currentSection].push(line);
    }
  }

  // Extract key-value pairs from lines like: - **Key:** Value or - **Key**: Value
  const extractDict = (sectionName) => {
    const secLines = sections[sectionName] || [];
    const dict = {};
    for (const l of secLines) {
      const match = l.match(/^-\s+\*\*([^*:]+):?\*\*:?\s*(.*)$/);
      if (match) {
        dict[match[1].trim()] = match[2].trim();
      }
    }
    return dict;
  };

  const getSectionLines = (sectionName) => sections[sectionName] || [];

  return {
    raw: content,
    sections,
    extractDict,
    getSectionLines
  };
}

function extractHashtags(text) {
  const matches = text.match(/#\w+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

function formatParagraphs(text) {
  if (!text) return '';
  // Split on double newlines
  const paras = text.split(/\r?\n\s*\r?\n/);
  const result = [];

  for (let p of paras) {
    p = p.trim();
    if (!p) continue;
    if (p === '---') continue;

    const lines = p.split(/\r?\n/);
    const isBulletList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* '));
    const isNumberedList = lines.every(l => /^\d+\.\s+/.test(l.trim()));

    if (isBulletList) {
      const lis = lines.map(l => `<li>${escapeHtml(l.trim().replace(/^[-*]\s+/, ''))}</li>`).join('\n');
      result.push(`<ul>\n${lis}\n</ul>`);
    } else if (isNumberedList) {
      const lis = lines.map(l => `<li>${escapeHtml(l.trim().replace(/^\d+\.\s+/, ''))}</li>`).join('\n');
      result.push(`<ol>\n${lis}\n</ol>`);
    } else {
      let formatted = escapeHtml(p)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\r?\n/g, '<br>');
      result.push(`<p>${formatted}</p>`);
    }
  }

  return result.join('\n');
}

// Prepare comprehensive dataset for both individual HTML files and preview.html
const allPostsData = [];

for (let i = 0; i < topics.length; i++) {
  const topic = topics[i];
  const mdRelativePath = topic.outputFile;
  const mdFullPath = path.join(templatesDir, mdRelativePath);
  const baseSlug = path.basename(mdRelativePath, '.md');
  const isImagePost = topic.format === 'single-image';

  const parsed = parseMarkdownFile(mdFullPath);

  const metaDict = parsed.extractDict('Metadata & Classification');
  const complianceDict = parsed.extractDict('Editorial Verification & Compliance');
  const ctaDict = parsed.extractDict('Call to Action & Commercial Conversion');

  let rawPostCopy = '';
  let visualBriefDict = {};
  let exactTextInGraphic = '';
  let hookDict = {};

  if (isImagePost) {
    rawPostCopy = parsed.getSectionLines('Complete LinkedIn Post & Caption').join('\n').trim();
    visualBriefDict = parsed.extractDict('Image Specification & Visual Brief');
    const visualText = parsed.getSectionLines('Image Specification & Visual Brief').join('\n');
    const codeMatch = visualText.match(/```text([\s\S]*?)```/);
    if (codeMatch) {
      exactTextInGraphic = codeMatch[1].trim();
    }
  } else {
    rawPostCopy = parsed.getSectionLines('Complete LinkedIn Post Copy').join('\n').trim();
    hookDict = parsed.extractDict('Executive Hook & Core Thesis');
  }

  // Remove trailing horizontal rules
  rawPostCopy = rawPostCopy.replace(/\n---\s*$/g, '').trim();

  // Extract hashtags
  const hashtags = extractHashtags(rawPostCopy + ' ' + (ctaDict['Hashtags'] || ''));

  // Separate hashtags from body copy for clean presentation
  const lines = rawPostCopy.split(/\r?\n/);
  const cleanBodyLines = [];
  for (let line of lines) {
    const trimmed = line.trim();
    // If the line consists only of hashtags, skip it from the main body
    if (/^(#\w+\s*)+$/.test(trimmed)) {
      continue;
    }
    cleanBodyLines.push(line);
  }
  const cleanPostCopy = cleanBodyLines.join('\n').trim();

  const imageFilename = isImagePost ? `${baseSlug}.png` : null;
  const imageRelativePathFromRoot = isImagePost ? `assets/post-images/${imageFilename}` : null;
  const htmlRelativePathFromRoot = mdRelativePath.replace(/\.md$/, '.html');

  // Verify file existence
  const imageExists = isImagePost ? fs.existsSync(path.join(templatesDir, imageRelativePathFromRoot)) : true;
  const mdExists = fs.existsSync(mdFullPath);

  const postObj = {
    id: topic.id,
    idFormatted: String(topic.id).padStart(3, '0'),
    title: topic.title,
    category: topic.category,
    subcategory: topic.subcategory,
    format: topic.format,
    targetAudience: topic.targetAudience,
    contentBrief: topic.contentBrief,
    mdPath: mdRelativePath,
    htmlPath: htmlRelativePathFromRoot,
    imagePath: imageRelativePathFromRoot,
    imageFilename,
    imageExists,
    mdExists,
    rawCopy: rawPostCopy,
    cleanCopy: cleanPostCopy,
    hashtags,
    cta: ctaDict['CTA'] || 'Learn how ProfitMachines delivers AI-Native Revenue Transformation at profitmachines.work',
    meta: {
      contentObjective: metaDict['Content Objective'] || topic.contentBrief,
      formatDesc: metaDict['Format'] || (isImagePost ? 'Single Image Post' : 'Text-Only Post')
    },
    visualBrief: isImagePost ? {
      headline: visualBriefDict['Image Headline'] || topic.title,
      subtitle: visualBriefDict['Image Subtitle'] || '',
      framework: visualBriefDict['Visual Framework'] || '',
      hierarchy: visualBriefDict['Visual Hierarchy'] || '',
      designBrief: visualBriefDict['Design Brief'] || '',
      altText: visualBriefDict['Accessibility Alt Text'] || topic.title,
      exactGraphicText: exactTextInGraphic
    } : null,
    hook: !isImagePost ? {
      openingHook: hookDict['Opening Hook'] || topic.title,
      concreteTakeaway: hookDict['Concrete Takeaway'] || topic.contentBrief
    } : null,
    compliance: {
      alignment: complianceDict['Positioning Alignment'] || 'ProfitMachines delivers Revenue Acceleration, Sales Acceleration, and Margin Expansion.',
      verification: complianceDict['Verification Note'] || 'Aligned with enterprise GTM standards.',
      claimCheck: complianceDict['Claim Check'] || 'Verified factual commercial principles.'
    }
  };

  allPostsData.push(postObj);
}

// 1. Generate Individual HTML files
for (let i = 0; i < allPostsData.length; i++) {
  const p = allPostsData[i];
  const prevP = i > 0 ? allPostsData[i - 1] : null;
  const nextP = i < allPostsData.length - 1 ? allPostsData[i + 1] : null;

  const htmlFullPath = path.join(templatesDir, p.htmlPath);
  const isImagePost = p.format === 'single-image';

  // Navigation Links
  const prevLinkHtml = prevP
    ? `<a href="../../${prevP.htmlPath}" class="pm-btn pm-btn-secondary pm-btn-sm">&larr; Topic ${prevP.idFormatted}: ${escapeHtml(prevP.title.length > 25 ? prevP.title.substring(0, 25) + '...' : prevP.title)}</a>`
    : `<span class="pm-btn pm-btn-secondary pm-btn-sm" style="opacity:0.4;cursor:default;">&larr; Start</span>`;

  const nextLinkHtml = nextP
    ? `<a href="../../${nextP.htmlPath}" class="pm-btn pm-btn-secondary pm-btn-sm">Topic ${nextP.idFormatted}: ${escapeHtml(nextP.title.length > 25 ? nextP.title.substring(0, 25) + '...' : nextP.title)} &rarr;</a>`
    : `<span class="pm-btn pm-btn-secondary pm-btn-sm" style="opacity:0.4;cursor:default;">End &rarr;</span>`;

  let visualHtml = '';
  if (isImagePost) {
    const vb = p.visualBrief;
    visualHtml = `
    <!-- Visual Framework Image Asset -->
    <section class="pm-visual-section">
      <div class="pm-visual-header">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--pm-blue-primary)"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Visual Asset &amp; Framework Architecture (1200 &times; 1200)
        </h3>
        <a href="../../${p.imagePath}" target="_blank" class="pm-btn pm-btn-secondary pm-btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open High-Res PNG
        </a>
      </div>
      <div class="pm-image-wrapper">
        <img src="../../${p.imagePath}" alt="${escapeHtml(vb.altText)}" class="pm-post-image" loading="lazy">
      </div>
      <div class="pm-visual-specs">
        <div class="pm-spec-row"><strong>Headline:</strong> ${escapeHtml(vb.headline)}</div>
        ${vb.subtitle ? `<div class="pm-spec-row"><strong>Subtitle:</strong> ${escapeHtml(vb.subtitle)}</div>` : ''}
        ${vb.framework ? `<div class="pm-spec-row"><strong>Framework:</strong> ${escapeHtml(vb.framework)}</div>` : ''}
        ${vb.altText ? `<div class="pm-spec-row"><strong>Alt Text:</strong> ${escapeHtml(vb.altText)}</div>` : ''}
        ${vb.exactGraphicText ? `
          <div class="pm-spec-row" style="margin-top:1rem;">
            <strong>Exact Text on Graphic:</strong>
            <div class="pm-text-graphic-box">${escapeHtml(vb.exactGraphicText)}</div>
          </div>` : ''}
      </div>
    </section>`;
  }

  let hookHtml = '';
  if (!isImagePost) {
    const hk = p.hook;
    hookHtml = `
    <!-- Executive Hook Card -->
    <div class="pm-hook-card">
      <div class="pm-hook-label">Executive Hook &amp; Core Thesis</div>
      <div class="pm-hook-quote">&ldquo;${escapeHtml(hk.openingHook)}&rdquo;</div>
      <div class="pm-hook-takeaway"><strong>Concrete Takeaway:</strong> ${escapeHtml(hk.concreteTakeaway)}</div>
    </div>`;
  }

  const hashtagsHtml = p.hashtags.map(h => `<span class="pm-hashtag-pill">${escapeHtml(h)}</span>`).join(' ');
  const formattedBodyHtml = formatParagraphs(p.cleanCopy);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Topic ${p.idFormatted} — ${escapeHtml(p.title)} | ProfitMachines</title>
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
        <a href="../../preview.html#topic-${p.id}" class="pm-btn pm-btn-secondary pm-btn-sm">
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
        <span class="pm-pill pm-pill-id">Topic ${p.idFormatted}</span>
        <span class="pm-pill pm-pill-category">${escapeHtml(p.category)}</span>
        <span class="pm-pill ${isImagePost ? 'pm-pill-format' : 'pm-pill-text'}">${isImagePost ? 'Single Image Post' : 'Text-Only Post'}</span>
      </div>
      <h1 class="pm-post-title">${escapeHtml(p.title)}</h1>
      
      <div class="pm-meta-grid">
        <div class="pm-meta-item">
          <strong>Category</strong>
          <span>${escapeHtml(p.category)}</span>
        </div>
        <div class="pm-meta-item">
          <strong>Subcategory</strong>
          <span>${escapeHtml(p.subcategory)}</span>
        </div>
        <div class="pm-meta-item">
          <strong>Target Audience</strong>
          <span>${escapeHtml(p.targetAudience)}</span>
        </div>
        <div class="pm-meta-item">
          <strong>Content Objective</strong>
          <span>${escapeHtml(p.meta.contentObjective)}</span>
        </div>
      </div>
    </header>

    ${hookHtml}

    ${visualHtml}

    <!-- LinkedIn Post Simulation Frame -->
    <article class="pm-post-sim">
      <div class="pm-sim-header">
        <div class="pm-sim-author">
          <div class="pm-sim-avatar">PM</div>
          <div class="pm-sim-meta">
            <h4>ProfitMachines.work</h4>
            <p>AI-Native Revenue Transformation Platform &bull; Production Ready</p>
          </div>
        </div>
        <span style="font-size:0.75rem;color:var(--pm-text-muted);font-weight:600;">Verified LinkedIn Copy</span>
      </div>

      <div class="pm-post-body">
        ${formattedBodyHtml}

        ${hashtagsHtml ? `<div class="pm-hashtags">${hashtagsHtml}</div>` : ''}
      </div>
    </article>

    <!-- Call to Action Banner -->
    <div class="pm-cta-card">
      <div class="pm-cta-content">
        <h4>Commercial Conversion Trigger</h4>
        <p>${escapeHtml(p.cta)}</p>
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
        <strong>Positioning Alignment:</strong> ${escapeHtml(p.compliance.alignment)}
      </div>
      <div class="pm-compliance-item">
        <strong>Verification Note:</strong> ${escapeHtml(p.compliance.verification)}
      </div>
      <div class="pm-compliance-item">
        <strong>Claim Check:</strong> ${escapeHtml(p.compliance.claimCheck)}
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
  <textarea id="rawCaptionData" style="display:none;">${escapeHtml(p.rawCopy)}</textarea>

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

  fs.writeFileSync(htmlFullPath, htmlContent, 'utf8');
}

console.log(`Generated 100 high-fidelity individual HTML templates.`);

// Write the dataset to preview-data.js so preview.html works via local file:// protocol with zero CORS issues!
const dataJsContent = `// ProfitMachines 100 LinkedIn Templates - Generated Local Dataset
window.PROFITMACHINES_TOPICS = ${JSON.stringify(allPostsData, null, 2)};
`;
fs.writeFileSync(path.join(templatesDir, 'preview-data.js'), dataJsContent, 'utf8');
console.log(`Wrote preview-data.js successfully.`);
