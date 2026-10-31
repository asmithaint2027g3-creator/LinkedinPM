const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Escape helper for SVG XML
function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/&bull;/g, '&#8226;');
}

// Word wrapping helper for SVG text
function wrapSvgText(text, maxCharsPerLine = 45) {
  if (!text) return [];
  const words = text.split(/\s+/);
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

// Category mapping to controls & models
const CATEGORY_CONTROLS = {
  'Pipeline Acceleration': [
    { title: 'Multi-Signal Intent Interception', desc: 'Real-time telemetry tracking category research, hiring surges, and tech stack adoption.' },
    { title: 'Automated Account Signal Cadence', desc: 'Automated notification engine alerting sales directors when dormant champions shift roles.' },
    { title: 'Cross-Tier Expansion Mapping', desc: 'Algorithmic identification of parent-subsidiary account structures and cross-sell headroom.' },
    { title: 'Vertical Micro-Niche Campaigns', desc: 'Hyper-personalized narrative assets deployed across high-intent vertical sub-segments.' },
    { title: 'Pipeline Velocity Telemetry', desc: 'Rigorous stage-by-stage cycle measurement isolating sales stall points before quarter end.' },
    { title: 'Continuous Revenue Advisory', desc: 'Monthly executive audit substantiating conversion baselines, CAC efficiency, and deal health.' }
  ],
  'Conversion Optimization': [
    { title: 'Buying Committee Friction Audit', desc: 'Isolating multi-stakeholder consensus stall points across enterprise procurement flows.' },
    { title: 'Value Hypothesis Alignment', desc: 'Reframing technical deliverables into validated CFO-defensible commercial business cases.' },
    { title: 'Micro-Commitment Engineering', desc: 'Structuring low-friction incremental milestones between discovery and commercial contract.' },
    { title: 'Competitive Moat Substantiation', desc: 'Direct empirical differentiation matrices eliminating deal stalls to status-quo indecision.' },
    { title: 'Dynamic Commercial Packaging', desc: 'Modular tiered offerings allowing enterprise buyers to initiate land-and-expand adoption.' },
    { title: 'Post-Proposal Momentum Cadence', desc: 'Real-time engagement telemetry alerting executive sponsors to dormant proposal review.' }
  ],
  'AI-Augmented Sales Teams': [
    { title: 'Autonomous Account Research Dossiers', desc: 'Pre-meeting synthesis of target company 10-K filings, earnings calls, and tech stack.' },
    { title: 'Real-Time Objection Guidance', desc: 'Context-aware intelligence surfacing battlecard counters and customer ROI proof points.' },
    { title: 'Automated CRM Hygiene & Capture', desc: 'Zero-touch extraction of conversation transcripts, agreed milestones, and next actions.' },
    { title: 'Buying Committee Persona Mapping', desc: 'Graph-based relationship maps revealing hidden gatekeepers and technical evaluators.' },
    { title: 'Dynamic Follow-Up Generation', desc: 'Tailored executive recap narratives delivered to stakeholders within minutes of call end.' },
    { title: 'Sales Performance Telemetry', desc: 'Rep-by-rep diagnostic benchmarking talk-to-listen ratios and discovery question depth.' }
  ],
  'Revenue Team Efficiency': [
    { title: 'Workflow Handoff Automation', desc: 'Frictionless data transfer between marketing lead capture, SDR discovery, and AE closing.' },
    { title: 'Single-Source Commercial Truth', desc: 'Unified revenue database reconciling CRM pipelines, ERP invoices, and billing actuals.' },
    { title: 'Administrative Drag Reduction', desc: 'Eliminating manual spreadsheet updates, CRM duplication, and fragmented sales reporting.' },
    { title: 'Predictable Capacity Planning', desc: 'Headcount-to-revenue models validating exact rep quota capacity before hiring ramp.' },
    { title: 'Incentive & Territory Alignment', desc: 'Algorithmic account distribution balancing pipeline potential across enterprise sales reps.' },
    { title: 'Executive Operations Telemetry', desc: 'Automated board reporting packs tracking pipeline health, CAC payback, and sales cycle.' }
  ],
  'Gross Margin Improvement': [
    { title: 'Value-Based Pricing Architectures', desc: 'Decoupling contract pricing from cost-plus hours into outcome-driven business impact.' },
    { title: 'Discount Governance Frameworks', desc: 'Rigorous approval thresholds preventing unnecessary rep discounting during quarter close.' },
    { title: 'High-Margin Segment Prioritization', desc: 'Focusing outbound sales capacity exclusively on customer profiles with >80% retention.' },
    { title: 'Scope-Creep Containment Controls', desc: 'Standardized implementation boundaries protecting professional services delivery margin.' },
    { title: 'Expansion Packaging Modularization', desc: 'Monetizing proprietary features and advanced integrations through modular add-ons.' },
    { title: 'Unit Economics Telemetry', desc: 'Continuous gross margin visibility by account tier, sales channel, and product line.' }
  ],
  'Cost Optimization': [
    { title: 'CAC Payback Compression Engine', desc: 'Eliminating bloated ad channels to focus commercial budget on high-yield intent pools.' },
    { title: 'Tech Stack Consolidation Audit', desc: 'Retiring redundant point solutions into integrated, enterprise revenue platforms.' },
    { title: 'Autonomous Inbound Qualification', desc: 'Filtering low-fit inquiries with intelligent intake before burning senior sales capacity.' },
    { title: 'Customer Acquisition Precision', desc: 'Concentrating GTM spend on accounts with proven 12-month net expansion velocity.' },
    { title: 'Sales Enablement Asset Hygiene', desc: 'Auditing high-impact sales enablement content and eliminating unused collateral.' },
    { title: 'GTM Cost-Per-Opportunity Telemetry', desc: 'Rigorous cost accounting tracing customer acquisition expense down to qualified stage.' }
  ],
  'Revenue Intelligence': [
    { title: 'Empirical Forecast Modeling', desc: 'Replacing subjective sales rep sentiment with mathematical pipeline progression weights.' },
    { title: 'Leading vs. Lagging Telemetry', desc: 'Tracking early-stage engagement signals 60 days before revenue realization or drop-off.' },
    { title: 'Churn Risk Early Warning Systems', desc: 'Algorithmic detection of declining usage telemetry and executive sponsor departures.' },
    { title: 'Cross-Sell Opportunity Discovery', desc: 'Automated surfacing of white-space account potential across enterprise customer base.' },
    { title: 'Deal Slippage Pattern Analysis', desc: 'Historical regression models isolating common root causes of pushed quarterly deals.' },
    { title: 'Board-Level Telemetry Dashboards', desc: 'Instant executive reporting packs tracking ARR, NRR, CAC payback, and Magic Number.' }
  ],
  'AI Sales Execution': [
    { title: 'Multi-Modal Inbound Engagement', desc: 'Immediate sub-60-second autonomous engagement and context-rich discovery intake.' },
    { title: 'Dynamic Outreach Personalization', desc: 'Account-specific value propositions derived from real-time corporate business pain.' },
    { title: 'Automated Pipeline Nurture Workflows', desc: 'Persistent multi-channel touchpoint cadences maintaining front-of-mind relevance.' },
    { title: 'Meeting Preparation Intelligence', desc: 'Instant briefing memos synthesizing participant LinkedIn backgrounds and mutual fit.' },
    { title: 'Continuous Deal Health Scoring', desc: 'Algorithmic win-probability indices updating dynamically after every commercial interaction.' },
    { title: 'Executive Orchestration Advisory', desc: 'Guiding commercial directors on optimal timing for executive sponsor intervention.' }
  ],
  'Executive Perspectives': [
    { title: 'Strategic Revenue System Architecture', desc: 'Designing connected commercial systems that scale predictably independent of headcount.' },
    { title: 'Capital Allocation Efficiency', desc: 'Prioritizing GTM investments across proven customer segments with high lifetime yield.' },
    { title: 'Commercial Governance Frameworks', desc: 'Establishing transparent accountability, pipeline standards, and revenue governance.' },
    { title: 'Market Positioning Defense', desc: 'Securing defensible differentiation against commoditized category competitors.' },
    { title: 'Enterprise Agility Controls', desc: 'Empowering commercial leaders to reallocate sales capacity rapidly as markets shift.' },
    { title: 'Enterprise Valuation Optimization', desc: 'Maximizing corporate valuation multiples through predictable, high-margin ARR growth.' }
  ]
};

// Parse 4 matrix cards from exactGraphicText or cleanCopy
function extractMatrixCards(topic) {
  const cards = [];
  const text = topic.visualBrief?.exactGraphicText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (cards.length >= 4) break;
    // Check patterns like "QUADRANT 1: Name (desc) -> Action: xyz" or "Stage 1: Name -> desc"
    let title = '';
    let desc = '';

    const colonIdx = line.indexOf(':');
    const arrowIdx = line.indexOf('->');

    if (colonIdx !== -1 && arrowIdx !== -1 && arrowIdx > colonIdx) {
      title = line.substring(colonIdx + 1, arrowIdx).trim();
      desc = line.substring(arrowIdx + 2).trim();
    } else if (colonIdx !== -1) {
      title = line.substring(0, colonIdx).trim();
      desc = line.substring(colonIdx + 1).trim();
    } else if (arrowIdx !== -1) {
      title = line.substring(0, arrowIdx).trim();
      desc = line.substring(arrowIdx + 2).trim();
    } else {
      title = line.substring(0, 35);
      desc = line.substring(35).trim() || 'Key operational diagnostic lever.';
    }

    // Clean up title (remove brackets, parentheticals if too long)
    title = title.replace(/\([^)]*\)/g, '').trim();
    if (title.length > 32) title = title.substring(0, 32).trim() + '...';

    // Clean up desc
    desc = desc.replace(/^Action:\s*/i, '').replace(/^Trigger:\s*/i, '').trim();
    if (!desc) desc = 'Diagnostic analysis and operational mitigation control.';

    cards.push({ title, desc });
  }

  // Fallback if less than 4 cards were parsed
  while (cards.length < 4) {
    const idx = cards.length + 1;
    cards.push({
      title: `Diagnostic Vector 0${idx}`,
      desc: 'Systematic revenue baseline diagnostic identifying hidden operational bottlenecks.'
    });
  }

  return cards;
}

function generateSvgForTopic(topic) {
  const category = (topic.category || 'PIPELINE ACCELERATION').toUpperCase();
  const subcategory = (topic.subcategory || 'REVENUE OPERATIONS').toUpperCase();
  const idFormatted = topic.idFormatted || String(topic.id).padStart(3, '0');

  // Eyebrow tags
  let eyebrowTags = `${subcategory} • ENTERPRISE REVENUE GOVERNANCE • AI TELEMETRY`;
  if (eyebrowTags.length > 65) eyebrowTags = eyebrowTags.substring(0, 62) + '...';

  // Headline
  const rawHeadline = topic.visualBrief?.headline || topic.title || 'Revenue Acceleration Architecture';
  let mainQuestion = '';
  let highlightWord = '';

  if (rawHeadline.toLowerCase().startsWith('the ')) {
    mainQuestion = `${rawHeadline.toUpperCase()}: IS YOUR REVENUE ENGINE FULLY OPTIMIZED?`;
    highlightWord = 'REVENUE ENGINE';
  } else {
    mainQuestion = `THE ${rawHeadline.toUpperCase()}: ARCHITECTING SYSTEMIC GROWTH`;
    highlightWord = 'SYSTEMIC GROWTH';
  }

  const subtitle = topic.visualBrief?.subtitle
    ? `| ${topic.visualBrief.subtitle}`
    : `| Strategic Enterprise Revenue Framework for Commercial Decision-Makers`;

  const anchorTitle = topic.visualBrief?.headline || topic.title;
  const anchorDesc = topic.meta?.contentObjective || topic.contentBrief || 'Equip commercial leaders with empirical frameworks to diagnose revenue drag and accelerate velocity.';
  const anchorSource = `Source: ProfitMachines ${topic.category} Systems | profitmachines.com`;

  const modelTitle = `${category.replace(/[^A-Z ]/g, '')} MODEL`.substring(0, 26);
  const matrixEyebrow = `CRITICAL ${category.substring(0, 24)} EXPOSURES (4-POINT MATRIX)`;
  const matrixCards = extractMatrixCards(topic);

  const controlsEyebrow = `✓ HOW PROFITMACHINES ACCELERATES ${category.substring(0, 24)} (6 CONTROLS)`;
  const controls = CATEGORY_CONTROLS[topic.category] || CATEGORY_CONTROLS['Pipeline Acceleration'];

  const ctaHeadline = `Schedule an Executive ${topic.category} Diagnostic`;
  const keyword = category.split(' ')[0] || 'REVENUE';
  const ctaSubtext = `DM '${keyword}-DIAGNOSTIC' to benchmark your revenue readiness.`;
  const ctaButtonText = `REQUEST ${keyword} AUDIT →`;
  const footerUrl = 'WWW.PROFITMACHINES.COM';
  const footerTags = `${category} • DEMAND ENGINEERING • REVOPS • GTM STRATEGY`;

  // Headline wrapping
  let headlineSvg = '';
  const headlineLines = wrapSvgText(mainQuestion, 38);
  let curY = 220;
  headlineLines.forEach((line) => {
    if (highlightWord && line.includes(highlightWord)) {
      const parts = line.split(highlightWord);
      headlineSvg += `
        <text x="60" y="${curY}" font-family="Segoe UI, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#0F172A">
          ${xmlEscape(parts[0])}<tspan fill="#2563EB" text-decoration="underline">${xmlEscape(highlightWord)}</tspan>${xmlEscape(parts[1] || '')}
        </text>`;
    } else {
      headlineSvg += `
        <text x="60" y="${curY}" font-family="Segoe UI, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#0F172A">
          ${xmlEscape(line)}
        </text>`;
    }
    curY += 42;
  });

  return `
<svg width="1200" height="1500" viewBox="0 0 1200 1500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="dotGrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#E2E8F0" />
    </pattern>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.04" />
    </filter>
    <filter id="ctaShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#1E3A8A" flood-opacity="0.25" />
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

  <!-- 1. Background -->
  <rect width="1200" height="1500" fill="#F8FAFC" />
  <rect width="1200" height="1500" fill="url(#dotGrid)" />
  <rect x="24" y="24" width="1152" height="1452" rx="20" fill="none" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- 2. Header Bar -->
  <g transform="translate(60, 48)">
    <rect width="44" height="44" rx="10" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5" />
    <path d="M22 10 L33 16 V27 L22 34 L11 27 V16 Z" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M17 22 L20 25 L27 18" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <text x="116" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#0F172A" letter-spacing="1.5">PROFIT<tspan fill="#2563EB">MACHINES</tspan></text>
  <text x="116" y="85" font-family="Segoe UI, -apple-system, sans-serif" font-size="10.5" font-weight="700" fill="#64748B" letter-spacing="1">AI-NATIVE REVENUE ACCELERATION PLATFORM</text>
  <text x="440" y="76" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#94A3B8">ESTABLISHED REVENUE SCIENCE &#8226; TOPIC #${idFormatted}</text>

  <g transform="translate(820, 52)">
    <rect width="320" height="38" rx="19" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5" />
    <text x="160" y="24" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#1D4ED8" text-anchor="middle" letter-spacing="1">${xmlEscape(category)}</text>
  </g>

  <line x1="60" y1="110" x2="1140" y2="110" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- 3. Eyebrow Tags -->
  <g transform="translate(60, 134)">
    <rect width="${Math.min(eyebrowTags.length * 9.5 + 32, 600)}" height="28" rx="14" fill="#DBEAFE" />
    <text x="16" y="18" font-family="monospace, Segoe UI, sans-serif" font-size="11" font-weight="800" fill="#1E40AF" letter-spacing="0.5">${xmlEscape(eyebrowTags)}</text>
  </g>

  <!-- 4. Headline & Subtitle -->
  ${headlineSvg}

  <g transform="translate(60, ${curY + 4})">
    <rect width="4" height="24" rx="2" fill="#2563EB" />
    <text x="16" y="17" font-family="Segoe UI, -apple-system, sans-serif" font-size="15.5" font-weight="600" fill="#475569">${xmlEscape(subtitle)}</text>
  </g>

  <!-- 5. Split Anchor Cards -->
  <g transform="translate(60, ${curY + 46})">
    <rect width="660" height="160" rx="16" fill="#FFFFFF" stroke="#93C5FD" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="24" y="20" width="180" height="24" rx="6" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1" />
    <text x="114" y="36" font-family="monospace, Segoe UI, sans-serif" font-size="10" font-weight="800" fill="#1D4ED8" text-anchor="middle">VERIFIED REVENUE INTEL</text>
    <text x="24" y="74" font-family="Segoe UI, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#1E40AF">${xmlEscape(anchorTitle)}</text>
    <text x="24" y="100" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(anchorDesc, 64)[0] || '')}</text>
    <text x="24" y="118" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(anchorDesc, 64)[1] || '')}</text>
    <g transform="translate(24, 134)">
      <circle cx="6" cy="6" r="4" fill="none" stroke="#2563EB" stroke-width="1.5" />
      <text x="16" y="9" font-family="monospace, Segoe UI, sans-serif" font-size="10" font-weight="600" fill="#64748B">${xmlEscape(anchorSource)}</text>
    </g>
  </g>

  <g transform="translate(740, ${curY + 46})">
    <rect width="400" height="160" rx="16" fill="url(#iconBoxGradient)" stroke="#334155" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="24" y="32" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#94A3B8" letter-spacing="1">${xmlEscape(modelTitle)}</text>
    <g transform="translate(200, 92)">
      <circle cx="0" cy="0" r="44" fill="none" stroke="#3B82F6" stroke-width="1" stroke-dasharray="4 3" opacity="0.4" />
      <circle cx="0" cy="0" r="36" fill="#1E3A8A" opacity="0.6" />
      <path d="M0 -22 L18 -10 V10 L0 22 L-18 10 V-10 Z" fill="url(#shieldGradient)" stroke="#60A5FA" stroke-width="1.5" />
      <path d="M-6 0 L-2 4 L7 -5" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>

  <!-- 6. 4-Point Exposures & Bottleneck Matrix -->
  <g transform="translate(60, ${curY + 230})">
    <circle cx="7" cy="7" r="5" fill="none" stroke="#EF4444" stroke-width="2" />
    <circle cx="7" cy="7" r="2" fill="#EF4444" />
    <text x="22" y="11" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#DC2626" letter-spacing="1">${xmlEscape(matrixEyebrow)}</text>
  </g>

  <g transform="translate(60, ${curY + 252})">
    <rect width="525" height="92" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="0" y="16" width="5" height="60" rx="2.5" fill="#EF4444" />
    <text x="24" y="32" font-family="Segoe UI, -apple-system, sans-serif" font-size="14.5" font-weight="800" fill="#0F172A">${xmlEscape(matrixCards[0]?.title || 'Bottleneck 1')}</text>
    <text x="24" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(matrixCards[0]?.desc, 58)[0] || '')}</text>
    <text x="24" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(matrixCards[0]?.desc, 58)[1] || '')}</text>
  </g>

  <g transform="translate(615, ${curY + 252})">
    <rect width="525" height="92" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="0" y="16" width="5" height="60" rx="2.5" fill="#EF4444" />
    <text x="24" y="32" font-family="Segoe UI, -apple-system, sans-serif" font-size="14.5" font-weight="800" fill="#0F172A">${xmlEscape(matrixCards[1]?.title || 'Bottleneck 2')}</text>
    <text x="24" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(matrixCards[1]?.desc, 58)[0] || '')}</text>
    <text x="24" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(matrixCards[1]?.desc, 58)[1] || '')}</text>
  </g>

  <g transform="translate(60, ${curY + 356})">
    <rect width="525" height="92" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="0" y="16" width="5" height="60" rx="2.5" fill="#EF4444" />
    <text x="24" y="32" font-family="Segoe UI, -apple-system, sans-serif" font-size="14.5" font-weight="800" fill="#0F172A">${xmlEscape(matrixCards[2]?.title || 'Bottleneck 3')}</text>
    <text x="24" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(matrixCards[2]?.desc, 58)[0] || '')}</text>
    <text x="24" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(matrixCards[2]?.desc, 58)[1] || '')}</text>
  </g>

  <g transform="translate(615, ${curY + 356})">
    <rect width="525" height="92" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="0" y="16" width="5" height="60" rx="2.5" fill="#EF4444" />
    <text x="24" y="32" font-family="Segoe UI, -apple-system, sans-serif" font-size="14.5" font-weight="800" fill="#0F172A">${xmlEscape(matrixCards[3]?.title || 'Bottleneck 4')}</text>
    <text x="24" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(matrixCards[3]?.desc, 58)[0] || '')}</text>
    <text x="24" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(matrixCards[3]?.desc, 58)[1] || '')}</text>
  </g>

  <!-- 7. 6-Point Controls Framework -->
  <g transform="translate(60, ${curY + 472})">
    <path d="M2 7 L6 11 L14 3" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <text x="22" y="11" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#1D4ED8" letter-spacing="1">${xmlEscape(controlsEyebrow)}</text>
  </g>

  <g transform="translate(60, ${curY + 494})">
    <rect width="346" height="110" rx="12" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1.2" />
    <circle cx="24" cy="24" r="9" fill="#2563EB" />
    <path d="M20 24 L23 27 L28 21" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <text x="40" y="28" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0F172A">${xmlEscape(controls[0]?.title || '')}</text>
    <text x="20" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[0]?.desc, 38)[0] || '')}</text>
    <text x="20" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[0]?.desc, 38)[1] || '')}</text>
    <text x="20" y="84" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[0]?.desc, 38)[2] || '')}</text>
  </g>

  <g transform="translate(426, ${curY + 494})">
    <rect width="346" height="110" rx="12" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1.2" />
    <circle cx="24" cy="24" r="9" fill="#2563EB" />
    <path d="M20 24 L23 27 L28 21" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <text x="40" y="28" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0F172A">${xmlEscape(controls[1]?.title || '')}</text>
    <text x="20" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[1]?.desc, 38)[0] || '')}</text>
    <text x="20" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[1]?.desc, 38)[1] || '')}</text>
    <text x="20" y="84" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[1]?.desc, 38)[2] || '')}</text>
  </g>

  <g transform="translate(794, ${curY + 494})">
    <rect width="346" height="110" rx="12" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1.2" />
    <circle cx="24" cy="24" r="9" fill="#2563EB" />
    <path d="M20 24 L23 27 L28 21" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <text x="40" y="28" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0F172A">${xmlEscape(controls[2]?.title || '')}</text>
    <text x="20" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[2]?.desc, 38)[0] || '')}</text>
    <text x="20" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[2]?.desc, 38)[1] || '')}</text>
    <text x="20" y="84" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[2]?.desc, 38)[2] || '')}</text>
  </g>

  <g transform="translate(60, ${curY + 616})">
    <rect width="346" height="110" rx="12" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1.2" />
    <circle cx="24" cy="24" r="9" fill="#2563EB" />
    <path d="M20 24 L23 27 L28 21" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <text x="40" y="28" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0F172A">${xmlEscape(controls[3]?.title || '')}</text>
    <text x="20" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[3]?.desc, 38)[0] || '')}</text>
    <text x="20" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[3]?.desc, 38)[1] || '')}</text>
    <text x="20" y="84" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[3]?.desc, 38)[2] || '')}</text>
  </g>

  <g transform="translate(426, ${curY + 616})">
    <rect width="346" height="110" rx="12" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1.2" />
    <circle cx="24" cy="24" r="9" fill="#2563EB" />
    <path d="M20 24 L23 27 L28 21" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <text x="40" y="28" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0F172A">${xmlEscape(controls[4]?.title || '')}</text>
    <text x="20" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[4]?.desc, 38)[0] || '')}</text>
    <text x="20" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[4]?.desc, 38)[1] || '')}</text>
    <text x="20" y="84" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[4]?.desc, 38)[2] || '')}</text>
  </g>

  <g transform="translate(794, ${curY + 616})">
    <rect width="346" height="110" rx="12" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1.2" />
    <circle cx="24" cy="24" r="9" fill="#2563EB" />
    <path d="M20 24 L23 27 L28 21" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
    <text x="40" y="28" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0F172A">${xmlEscape(controls[5]?.title || '')}</text>
    <text x="20" y="52" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[5]?.desc, 38)[0] || '')}</text>
    <text x="20" y="68" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[5]?.desc, 38)[1] || '')}</text>
    <text x="20" y="84" font-family="Segoe UI, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(controls[5]?.desc, 38)[2] || '')}</text>
  </g>

  <!-- 8. Bottom Call-To-Action Bar -->
  <g transform="translate(60, 1346)">
    <rect width="1080" height="80" rx="16" fill="url(#ctaGradient)" filter="url(#ctaShadow)" />
    <text x="28" y="36" font-family="Segoe UI, -apple-system, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF">${xmlEscape(ctaHeadline)}</text>
    <text x="28" y="58" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#93C5FD">${xmlEscape(ctaSubtext)}</text>
    <g transform="translate(770, 18)">
      <rect width="280" height="44" rx="22" fill="#FFFFFF" />
      <text x="140" y="27" font-family="Segoe UI, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0A1128" text-anchor="middle" letter-spacing="0.5">${xmlEscape(ctaButtonText)}</text>
    </g>
  </g>

  <!-- 9. Footer Bar -->
  <text x="60" y="1458" font-family="monospace, Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#0F172A" letter-spacing="1">${xmlEscape(footerUrl)}</text>
  <text x="1140" y="1458" font-family="monospace, Segoe UI, sans-serif" font-size="11" font-weight="700" fill="#2563EB" text-anchor="end" letter-spacing="1">${xmlEscape(footerTags)}</text>
</svg>
  `.trim();
}

module.exports = {
  generateSvgForTopic
};

