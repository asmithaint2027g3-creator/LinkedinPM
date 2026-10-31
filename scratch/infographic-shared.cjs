// Robust XML Sanitizer
function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    // First, normalize any existing named entities
    .replace(/&bull;/g, '&#8226;')
    .replace(/&plusmn;/g, '&#177;')
    .replace(/&rarr;/g, '&#8594;')
    .replace(/&larr;/g, '&#8592;')
    .replace(/&check;/g, '&#10003;')
    .replace(/&times;/g, '&#10005;')
    // Escape bare ampersands that are not already valid entity references (like &#123; or &amp;)
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    // Escape xml reserved characters
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Word wrapping helper for SVG text
function wrapSvgText(text, maxCharsPerLine = 45) {
  if (!text) return [];
  const words = String(text).split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Layout selector based on visualBrief framework
function getLayoutType(framework = '') {
  const fw = framework.toLowerCase();
  if (fw.includes('comparative') || fw.includes('scorecard') || fw.includes('contrasting') || fw.includes('two-column') || fw.includes('versus')) {
    return 'comparative-scorecard';
  }
  if (fw.includes('waterfall') || fw.includes('decay') || fw.includes('interval') || fw.includes('timeline') || fw.includes('velocity')) {
    return 'waterfall-timeline';
  }
  if (fw.includes('stack') || fw.includes('tier') || fw.includes('layer') || fw.includes('pillar') || fw.includes('bridge')) {
    return 'tiered-stack';
  }
  if (fw.includes('funnel') || fw.includes('leakage') || fw.includes('symptom')) {
    return 'funnel-diagnostic';
  }
  if (fw.includes('matrix') || fw.includes('quadrant')) {
    return 'matrix-2x2';
  }
  if (fw.includes('tree') || fw.includes('telemetry') || fw.includes('dashboard') || fw.includes('metric')) {
    return 'telemetry-dashboard';
  }
  return 'blueprint-modular';
}

// Parse structured items from exactGraphicText
function parseGraphicItems(topic) {
  const text = topic.visualBrief?.exactGraphicText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];

  for (const line of lines) {
    if (items.length >= 6) break;
    let label = '';
    let metric = '';
    let title = '';
    let desc = '';

    const arrowIdx = line.indexOf('->');
    const colonIdx = line.indexOf(':');

    if (colonIdx !== -1 && arrowIdx !== -1 && arrowIdx > colonIdx) {
      label = line.substring(0, colonIdx).trim();
      title = line.substring(colonIdx + 1, arrowIdx).trim();
      const rightPart = line.substring(arrowIdx + 2).trim();
      const pipeIdx = rightPart.indexOf('|');
      if (pipeIdx !== -1) {
        metric = rightPart.substring(0, pipeIdx).trim();
        desc = rightPart.substring(pipeIdx + 1).trim();
      } else {
        desc = rightPart;
      }
    } else if (colonIdx !== -1) {
      label = line.substring(0, colonIdx).trim();
      const rightPart = line.substring(colonIdx + 1).trim();
      const pipeIdx = rightPart.indexOf('|');
      if (pipeIdx !== -1) {
        title = rightPart.substring(0, pipeIdx).trim();
        desc = rightPart.substring(pipeIdx + 1).trim();
      } else {
        title = rightPart.substring(0, 36).trim();
        desc = rightPart.substring(36).trim();
      }
    } else if (arrowIdx !== -1) {
      title = line.substring(0, arrowIdx).trim();
      desc = line.substring(arrowIdx + 2).trim();
    } else {
      title = line.substring(0, 36);
      desc = line.substring(36).trim();
    }

    title = title.replace(/\([^)]*\)/g, '').trim();
    if (title.length > 34) title = title.substring(0, 34).trim() + '...';
    desc = desc.replace(/^Action:\s*/i, '').replace(/^Trigger:\s*/i, '').replace(/^Fix:\s*/i, '').trim();
    if (!desc) desc = 'Diagnostic analysis and operational mitigation control.';

    items.push({ label, metric, title, desc });
  }

  while (items.length < 4) {
    const idx = items.length + 1;
    items.push({
      label: `Vector 0${idx}`,
      metric: `KPI-0${idx}`,
      title: `Operational Dimension 0${idx}`,
      desc: 'Systematic revenue baseline diagnostic identifying hidden operational bottlenecks.'
    });
  }

  return items;
}

// Common Shared Header Generator with dynamic totalHeight
function renderSvgHeader(topic, idFormatted, category, eyebrowTags, mainQuestion, highlightWord, subtitle, totalHeight) {
  const headlineLines = wrapSvgText(mainQuestion, 38);
  let headlineSvg = '';
  let curY = 205;

  headlineLines.forEach(line => {
    if (highlightWord && line.includes(highlightWord)) {
      const parts = line.split(highlightWord);
      headlineSvg += `
        <text x="60" y="${curY}" font-family="Segoe UI, -apple-system, sans-serif" font-size="33" font-weight="900" fill="#0F172A">
          ${xmlEscape(parts[0])}<tspan fill="#2563EB" text-decoration="underline">${xmlEscape(highlightWord)}</tspan>${xmlEscape(parts[1] || '')}
        </text>`;
    } else {
      headlineSvg += `
        <text x="60" y="${curY}" font-family="Segoe UI, -apple-system, sans-serif" font-size="33" font-weight="900" fill="#0F172A">
          ${xmlEscape(line)}
        </text>`;
    }
    curY += 40;
  });

  return {
    curY: curY + 6,
    svg: `
  <!-- Background with Rich Radial Lighting and Enterprise Grid -->
  <rect width="1200" height="${totalHeight}" fill="#F8FAFC" />
  <rect width="1200" height="${totalHeight}" fill="url(#dotGrid)" />
  <circle cx="1000" cy="200" r="350" fill="url(#ambientGlowBlue)" />
  <circle cx="200" cy="${totalHeight - 300}" r="400" fill="url(#ambientGlowIndigo)" />
  <rect x="20" y="20" width="1160" height="${totalHeight - 40}" rx="20" fill="none" stroke="#CBD5E1" stroke-width="1.5" />

  <!-- Top Header Bar -->
  <g transform="translate(60, 44)">
    <rect width="44" height="44" rx="10" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5" />
    <path d="M22 10 L33 16 V27 L22 34 L11 27 V16 Z" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M17 22 L20 25 L27 18" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <text x="116" y="64" font-family="Segoe UI, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#0F172A" letter-spacing="1.5">PROFIT<tspan fill="#2563EB">MACHINES</tspan></text>
  <text x="116" y="81" font-family="Segoe UI, -apple-system, sans-serif" font-size="10.5" font-weight="700" fill="#64748B" letter-spacing="1">AI-NATIVE REVENUE ACCELERATION PLATFORM</text>
  <text x="440" y="72" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#94A3B8">ESTABLISHED REVENUE SCIENCE &#8226; TOPIC #${idFormatted}</text>

  <g transform="translate(820, 48)">
    <rect width="320" height="38" rx="19" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5" />
    <text x="160" y="24" font-family="Segoe UI, -apple-system, sans-serif" font-size="11.5" font-weight="800" fill="#1D4ED8" text-anchor="middle" letter-spacing="1">${xmlEscape(category)}</text>
  </g>

  <line x1="60" y1="104" x2="1140" y2="104" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Eyebrow Tag -->
  <g transform="translate(60, 124)">
    <rect width="${Math.min(eyebrowTags.length * 9.2 + 30, 640)}" height="26" rx="13" fill="#DBEAFE" />
    <text x="16" y="17" font-family="monospace, Segoe UI, sans-serif" font-size="10.5" font-weight="800" fill="#1E40AF" letter-spacing="0.5">${xmlEscape(eyebrowTags)}</text>
  </g>

  <!-- Headline -->
  ${headlineSvg}

  <!-- Subtitle -->
  <g transform="translate(60, ${curY})">
    <rect width="4" height="22" rx="2" fill="#2563EB" />
    <text x="16" y="16" font-family="Segoe UI, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#475569">${xmlEscape(subtitle)}</text>
  </g>
    `
  };
}

// Common Footer & CTA Bar placed dynamically immediately after content (no empty gap)
function renderSvgFooter(topic, ctaHeadline, ctaSubtext, ctaButtonText, footerUrl, footerTags, contentBottom) {
  const ctaY = contentBottom + 20;
  const footerY = ctaY + 82 + 28;

  return `
  <!-- Bottom Call-To-Action Bar -->
  <g transform="translate(60, ${ctaY})">
    <rect width="1080" height="82" rx="16" fill="url(#ctaGradient)" filter="url(#ctaShadow)" />
    <text x="28" y="36" font-family="Segoe UI, -apple-system, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF">${xmlEscape(ctaHeadline)}</text>
    <text x="28" y="58" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#93C5FD">${xmlEscape(ctaSubtext)}</text>
    <g transform="translate(770, 18)">
      <rect width="280" height="46" rx="23" fill="#FFFFFF" />
      <text x="140" y="28" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0A1128" text-anchor="middle" letter-spacing="0.5">${xmlEscape(ctaButtonText)}</text>
    </g>
  </g>

  <!-- Footer Info -->
  <text x="60" y="${footerY}" font-family="monospace, Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#0F172A" letter-spacing="1">${xmlEscape(footerUrl)}</text>
  <text x="1140" y="${footerY}" font-family="monospace, Segoe UI, sans-serif" font-size="11" font-weight="700" fill="#2563EB" text-anchor="end" letter-spacing="1">${xmlEscape(footerTags)}</text>
  `;
}

// Common Shared Defs
const SVG_DEFS = `
  <defs>
    <pattern id="dotGrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#CBD5E1" />
    </pattern>
    <radialGradient id="ambientGlowBlue" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="ambientGlowIndigo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#6366F1" stop-opacity="0" />
    </radialGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.06" />
    </filter>
    <filter id="ctaShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#1E3A8A" flood-opacity="0.3" />
    </filter>
    <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A1128" />
      <stop offset="100%" stop-color="#1E40AF" />
    </linearGradient>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="iconBoxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
  </defs>
`;

module.exports = {
  xmlEscape,
  wrapSvgText,
  getLayoutType,
  parseGraphicItems,
  renderSvgHeader,
  renderSvgFooter,
  SVG_DEFS
};
