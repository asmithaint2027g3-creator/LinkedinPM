const {
  xmlEscape,
  wrapSvgText,
  getLayoutType,
  parseGraphicItems,
  renderSvgHeader,
  renderSvgFooter,
  SVG_DEFS
} = require('./infographic-shared.cjs');

// Category controls helper
const CATEGORY_CONTROLS = {
  'Pipeline Acceleration': [
    { title: 'Multi-Signal Intent Interception', desc: 'Real-time telemetry tracking category research, hiring surges, and tech stack adoption.' },
    { title: 'Automated Account Signal Cadence', desc: 'Automated notification engine alerting sales directors when dormant champions shift roles.' },
    { title: 'Cross-Tier Expansion Mapping', desc: 'Algorithmic identification of parent-subsidiary account structures and cross-sell headroom.' }
  ],
  'Conversion Optimization': [
    { title: 'Buying Committee Consensus Audit', desc: 'Isolating multi-stakeholder stall points across enterprise procurement flows.' },
    { title: 'Value Hypothesis Alignment', desc: 'Reframing technical deliverables into CFO-defensible commercial business cases.' },
    { title: 'Micro-Commitment Engineering', desc: 'Structuring low-friction incremental milestones between discovery and commercial contract.' }
  ],
  'AI-Augmented Sales Teams': [
    { title: 'Autonomous Account Briefings', desc: 'Pre-meeting synthesis of target company 10-K filings, earnings calls, and tech stack.' },
    { title: 'Real-Time Objection Guidance', desc: 'Context-aware intelligence surfacing battlecard counters and customer ROI proof points.' },
    { title: 'Automated CRM Hygiene Capture', desc: 'Zero-touch extraction of conversation transcripts, agreed milestones, and next actions.' }
  ],
  'Revenue Team Efficiency': [
    { title: 'Workflow Handoff Automation', desc: 'Frictionless data transfer between marketing lead capture, SDR discovery, and AE closing.' },
    { title: 'Single-Source Commercial Truth', desc: 'Unified revenue database reconciling CRM pipelines, ERP invoices, and billing actuals.' },
    { title: 'Administrative Drag Reduction', desc: 'Eliminating manual spreadsheet updates, CRM duplication, and fragmented sales reporting.' }
  ],
  'Gross Margin Improvement': [
    { title: 'Value-Based Pricing Architectures', desc: 'Decoupling contract pricing from cost-plus hours into outcome-driven business impact.' },
    { title: 'Discount Governance Frameworks', desc: 'Rigorous approval thresholds preventing unnecessary rep discounting during quarter close.' },
    { title: 'High-Margin Segment Prioritization', desc: 'Focusing outbound sales capacity exclusively on customer profiles with >80% retention.' }
  ],
  'Cost Optimization': [
    { title: 'CAC Payback Compression Engine', desc: 'Eliminating bloated ad channels to focus commercial budget on high-yield intent pools.' },
    { title: 'Tech Stack Consolidation Audit', desc: 'Retiring redundant point solutions into integrated, enterprise revenue platforms.' },
    { title: 'Autonomous Inbound Qualification', desc: 'Filtering low-fit inquiries with intelligent intake before burning senior sales capacity.' }
  ],
  'Revenue Intelligence': [
    { title: 'Empirical Forecast Modeling', desc: 'Replacing subjective sales rep sentiment with mathematical pipeline progression weights.' },
    { title: 'Leading vs. Lagging Telemetry', desc: 'Tracking early-stage engagement signals 60 days before revenue realization or drop-off.' },
    { title: 'Churn Risk Early Warning Systems', desc: 'Algorithmic detection of declining usage telemetry and executive sponsor departures.' }
  ],
  'AI Sales Execution': [
    { title: 'Sub-60s Inbound Engagement', desc: 'Immediate autonomous engagement and context-rich discovery intake before deal goes cold.' },
    { title: 'Dynamic Value Personalization', desc: 'Account-specific value propositions derived from real-time corporate business pain.' },
    { title: 'Continuous Deal Health Scoring', desc: 'Algorithmic win-probability indices updating dynamically after every commercial interaction.' }
  ],
  'Executive Perspectives': [
    { title: 'Strategic Revenue System Architecture', desc: 'Designing connected commercial systems that scale predictably independent of headcount.' },
    { title: 'Capital Allocation Efficiency', desc: 'Prioritizing GTM investments across proven customer segments with high lifetime yield.' },
    { title: 'Commercial Governance Frameworks', desc: 'Establishing transparent accountability, pipeline standards, and revenue governance.' }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. LAYOUT: MATRIX 2x2 (QUADRANTS)
// ─────────────────────────────────────────────────────────────────────────────
function renderMatrixLayout(topic, data, items) {
  // Calculate dynamic heights
  // Headline ends around 245
  // Matrix starts at cY = curY + 24
  // 4 Cards: 2 rows of height 240, gap 16 -> ends at cY + 24 + 240 + 16 + 240 = cY + 520
  // Secondary solution card at cY + 536, height 124 -> ends at cY + 660
  // Content bottom = cY + 660
  const curYEstimate = 250;
  const cY = curYEstimate + 24;
  const contentBottom = cY + 660;
  const totalHeight = contentBottom + 20 + 82 + 50;

  const { curY, svg: headerSvg } = renderSvgHeader(topic, data.idFormatted, data.category, data.eyebrowTags, data.mainQuestion, data.highlightWord, data.subtitle, totalHeight);
  const footerSvg = renderSvgFooter(topic, data.ctaHeadline, data.ctaSubtext, data.ctaButtonText, data.footerUrl, data.footerTags, contentBottom);

  const qCards = [
    { q: 'QUADRANT I', bg: '#FFFFFF', border: '#BFDBFE', tagBg: '#EFF6FF', tagColor: '#1D4ED8', item: items[0] },
    { q: 'QUADRANT II', bg: '#FFFFFF', border: '#BFDBFE', tagBg: '#EFF6FF', tagColor: '#1D4ED8', item: items[1] },
    { q: 'QUADRANT III', bg: '#FFFFFF', border: '#CBD5E1', tagBg: '#F1F5F9', tagColor: '#475569', item: items[2] },
    { q: 'QUADRANT IV', bg: '#FFFFFF', border: '#CBD5E1', tagBg: '#F1F5F9', tagColor: '#475569', item: items[3] }
  ];

  const cardSvg = `
  <!-- Matrix Category Eyebrow -->
  <g transform="translate(60, ${cY})">
    <circle cx="8" cy="8" r="6" fill="none" stroke="#2563EB" stroke-width="2" />
    <circle cx="8" cy="8" r="2.5" fill="#2563EB" />
    <text x="22" y="12" font-family="Segoe UI, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#1D4ED8" letter-spacing="1">FOUR-QUADRANT COMMERCIAL OPPORTUNITY MATRIX</text>
  </g>

  <!-- 4 Big Quadrant Cards -->
  <!-- Top Left -->
  <g transform="translate(60, ${cY + 24})">
    <rect width="525" height="240" rx="16" fill="#FFFFFF" stroke="${qCards[0].border}" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="0" y="24" width="6" height="64" rx="3" fill="#2563EB" />
    <rect x="24" y="20" width="110" height="24" rx="6" fill="${qCards[0].tagBg}" />
    <text x="79" y="36" font-family="monospace, sans-serif" font-size="10.5" font-weight="800" fill="${qCards[0].tagColor}" text-anchor="middle">${qCards[0].q}</text>
    <text x="24" y="74" font-family="Segoe UI, sans-serif" font-size="17" font-weight="800" fill="#0F172A">${xmlEscape(qCards[0].item.title)}</text>
    <text x="24" y="102" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[0].item.desc, 56)[0] || '')}</text>
    <text x="24" y="122" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[0].item.desc, 56)[1] || '')}</text>
    <text x="24" y="142" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[0].item.desc, 56)[2] || '')}</text>
    <g transform="translate(24, 184)">
      <rect width="477" height="34" rx="8" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1" />
      <text x="14" y="22" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="700" fill="#1D4ED8">&#9656; Recommended Action: Automated Signal Trigger Cadence</text>
    </g>
  </g>

  <!-- Top Right -->
  <g transform="translate(615, ${cY + 24})">
    <rect width="525" height="240" rx="16" fill="#FFFFFF" stroke="${qCards[1].border}" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="0" y="24" width="6" height="64" rx="3" fill="#3B82F6" />
    <rect x="24" y="20" width="110" height="24" rx="6" fill="${qCards[1].tagBg}" />
    <text x="79" y="36" font-family="monospace, sans-serif" font-size="10.5" font-weight="800" fill="${qCards[1].tagColor}" text-anchor="middle">${qCards[1].q}</text>
    <text x="24" y="74" font-family="Segoe UI, sans-serif" font-size="17" font-weight="800" fill="#0F172A">${xmlEscape(qCards[1].item.title)}</text>
    <text x="24" y="102" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[1].item.desc, 56)[0] || '')}</text>
    <text x="24" y="122" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[1].item.desc, 56)[1] || '')}</text>
    <text x="24" y="142" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[1].item.desc, 56)[2] || '')}</text>
    <g transform="translate(24, 184)">
      <rect width="477" height="34" rx="8" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1" />
      <text x="14" y="22" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="700" fill="#1D4ED8">&#9656; Recommended Action: Account-Level Intent Interception</text>
    </g>
  </g>

  <!-- Bottom Left -->
  <g transform="translate(60, ${cY + 280})">
    <rect width="525" height="240" rx="16" fill="#FFFFFF" stroke="${qCards[2].border}" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="0" y="24" width="6" height="64" rx="3" fill="#64748B" />
    <rect x="24" y="20" width="110" height="24" rx="6" fill="${qCards[2].tagBg}" />
    <text x="79" y="36" font-family="monospace, sans-serif" font-size="10.5" font-weight="800" fill="${qCards[2].tagColor}" text-anchor="middle">${qCards[2].q}</text>
    <text x="24" y="74" font-family="Segoe UI, sans-serif" font-size="17" font-weight="800" fill="#0F172A">${xmlEscape(qCards[2].item.title)}</text>
    <text x="24" y="102" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[2].item.desc, 56)[0] || '')}</text>
    <text x="24" y="122" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[2].item.desc, 56)[1] || '')}</text>
    <text x="24" y="142" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[2].item.desc, 56)[2] || '')}</text>
    <g transform="translate(24, 184)">
      <rect width="477" height="34" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
      <text x="14" y="22" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="700" fill="#475569">&#9656; Recommended Action: Cross-Selling Blueprint Orchestration</text>
    </g>
  </g>

  <!-- Bottom Right -->
  <g transform="translate(615, ${cY + 280})">
    <rect width="525" height="240" rx="16" fill="#FFFFFF" stroke="${qCards[3].border}" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect x="0" y="24" width="6" height="64" rx="3" fill="#64748B" />
    <rect x="24" y="20" width="110" height="24" rx="6" fill="${qCards[3].tagBg}" />
    <text x="79" y="36" font-family="monospace, sans-serif" font-size="10.5" font-weight="800" fill="${qCards[3].tagColor}" text-anchor="middle">${qCards[3].q}</text>
    <text x="24" y="74" font-family="Segoe UI, sans-serif" font-size="17" font-weight="800" fill="#0F172A">${xmlEscape(qCards[3].item.title)}</text>
    <text x="24" y="102" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[3].item.desc, 56)[0] || '')}</text>
    <text x="24" y="122" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[3].item.desc, 56)[1] || '')}</text>
    <text x="24" y="142" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(qCards[3].item.desc, 56)[2] || '')}</text>
    <g transform="translate(24, 184)">
      <rect width="477" height="34" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
      <text x="14" y="22" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="700" fill="#475569">&#9656; Recommended Action: Focused Vertical Campaign Deployment</text>
    </g>
  </g>

  <!-- Secondary Solution Strip -->
  <g transform="translate(60, ${cY + 536})">
    <rect width="1080" height="124" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="28" y="30" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#93C5FD" letter-spacing="1">HOW PROFITMACHINES EXECUTES QUADRANT ACTIVATION</text>
    <g transform="translate(28, 46)">
      <circle cx="10" cy="10" r="8" fill="#2563EB" />
      <path d="M7 10 L9 12 L13 8" fill="none" stroke="#FFFFFF" stroke-width="1.8" />
      <text x="26" y="14" font-family="Segoe UI, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">1. Telemetry Signal Interception</text>
      <text x="26" y="32" font-family="Segoe UI, sans-serif" font-size="11" font-weight="500" fill="#94A3B8">Tracking anonymous category research and engagement surges.</text>
    </g>
    <g transform="translate(380, 46)">
      <circle cx="10" cy="10" r="8" fill="#2563EB" />
      <path d="M7 10 L9 12 L13 8" fill="none" stroke="#FFFFFF" stroke-width="1.8" />
      <text x="26" y="14" font-family="Segoe UI, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">2. Account-Level Value Mapping</text>
      <text x="26" y="32" font-family="Segoe UI, sans-serif" font-size="11" font-weight="500" fill="#94A3B8">Reconnecting dormant pipeline with board-level business cases.</text>
    </g>
    <g transform="translate(740, 46)">
      <circle cx="10" cy="10" r="8" fill="#2563EB" />
      <path d="M7 10 L9 12 L13 8" fill="none" stroke="#FFFFFF" stroke-width="1.8" />
      <text x="26" y="14" font-family="Segoe UI, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">3. Continuous Discovery Advisory</text>
      <text x="26" y="32" font-family="Segoe UI, sans-serif" font-size="11" font-weight="500" fill="#94A3B8">Substantiating unit economics and expansion headroom.</text>
    </g>
  </g>
  `;

  return `<svg width="1200" height="${totalHeight}" viewBox="0 0 1200 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  ${headerSvg}
  ${cardSvg}
  ${footerSvg}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. LAYOUT: WATERFALL TIMELINE / DECAY CURVE
// ─────────────────────────────────────────────────────────────────────────────
function renderWaterfallLayout(topic, data, items) {
  // 4 stages: height 110, spacing 122 -> ends at cY + 30 + 3 * 122 + 110 = cY + 506
  // Solution card: height 136 -> ends at cY + 522 + 136 = cY + 658
  const curYEstimate = 250;
  const cY = curYEstimate + 24;
  const contentBottom = cY + 658;
  const totalHeight = contentBottom + 20 + 82 + 50;

  const { curY, svg: headerSvg } = renderSvgHeader(topic, data.idFormatted, data.category, data.eyebrowTags, data.mainQuestion, data.highlightWord, data.subtitle, totalHeight);
  const footerSvg = renderSvgFooter(topic, data.ctaHeadline, data.ctaSubtext, data.ctaButtonText, data.footerUrl, data.footerTags, contentBottom);

  const stages = [
    { time: '0 - 5 MINUTES', stat: '+391% LIFT', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', title: 'Optimal Velocity Window', desc: 'Instantaneous inbound qualification and AI dossier generation. Maximum prospect buying intent and attention.' },
    { time: '5 - 30 MINUTES', stat: '62% BASELINE', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', title: 'Standard Response Threshold', desc: 'Standard SDR routing. Noticeable decay in live engagement as decision-maker attention shifts to next meeting.' },
    { time: '1 - 4 HOURS', stat: '-78% DECAY', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', title: 'Severe Attrition Hazard', desc: 'Steep drop in connection probability. Prospect begins evaluating competing category alternatives.' },
    { time: '24+ HOURS', stat: '-91% LOSS', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', title: 'Complete Opportunity Loss', desc: 'Critical conversion destruction. Buying urgency evaporates; deal enters dormant CRM graveyard.' }
  ];

  let stagesSvg = '';
  stages.forEach((st, idx) => {
    const yPos = cY + 28 + idx * 120;
    stagesSvg += `
    <g transform="translate(60, ${yPos})">
      <rect width="1080" height="108" rx="14" fill="#FFFFFF" stroke="${st.border}" stroke-width="1.5" filter="url(#cardShadow)" />
      <rect x="0" y="16" width="6" height="76" rx="3" fill="${st.color}" />
      
      <!-- Time interval badge -->
      <g transform="translate(24, 20)">
        <rect width="150" height="28" rx="6" fill="${st.bg}" stroke="${st.border}" stroke-width="1" />
        <text x="75" y="19" font-family="monospace, sans-serif" font-size="11.5" font-weight="800" fill="${st.color}" text-anchor="middle">${st.time}</text>
      </g>

      <!-- Stat Highlight Box -->
      <g transform="translate(190, 20)">
        <rect width="150" height="28" rx="6" fill="#0F172A" />
        <text x="75" y="19" font-family="monospace, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">${st.stat}</text>
      </g>

      <!-- Title & Explanation -->
      <text x="360" y="38" font-family="Segoe UI, sans-serif" font-size="16" font-weight="800" fill="#0F172A">${xmlEscape(st.title)}</text>
      <text x="360" y="66" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#475569">${xmlEscape(st.desc)}</text>
      <text x="360" y="86" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="600" fill="${st.color}">&#9656; ${xmlEscape(items[idx]?.desc || 'Automated response protocol required.')}</text>
    </g>
    `;
  });

  const contentSvg = `
  <g transform="translate(60, ${cY})">
    <path d="M2 7 L6 11 L14 3" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <text x="22" y="11" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#1D4ED8" letter-spacing="1">VELOCITY WATERFALL: RESPONSE LATENCY CONVERSION DECAY</text>
  </g>

  ${stagesSvg}

  <!-- Lower Solution Architecture Card -->
  <g transform="translate(60, ${cY + 520})">
    <rect width="1080" height="136" rx="16" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="28" y="30" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#93C5FD" letter-spacing="1">HOW PROFITMACHINES COMPRESSES LATENCY TO ZERO</text>
    
    <g transform="translate(28, 48)">
      <rect width="320" height="68" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1" />
      <text x="18" y="26" font-family="Segoe UI, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">1. Sub-60s Inbound Intake</text>
      <text x="18" y="46" font-family="Segoe UI, sans-serif" font-size="11" font-weight="500" fill="#94A3B8">Instant context capture before drop-off.</text>
    </g>
    <g transform="translate(380, 48)">
      <rect width="320" height="68" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1" />
      <text x="18" y="26" font-family="Segoe UI, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">2. Autonomous Briefing Dossier</text>
      <text x="18" y="46" font-family="Segoe UI, sans-serif" font-size="11" font-weight="500" fill="#94A3B8">Pre-populates buying committee context.</text>
    </g>
    <g transform="translate(732, 48)">
      <rect width="320" height="68" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1" />
      <text x="18" y="26" font-family="Segoe UI, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF">3. Stage Routing Telemetry</text>
      <text x="18" y="46" font-family="Segoe UI, sans-serif" font-size="11" font-weight="500" fill="#94A3B8">Eliminates manual round-robin delays.</text>
    </g>
  </g>
  `;

  return `<svg width="1200" height="${totalHeight}" viewBox="0 0 1200 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  ${headerSvg}
  ${contentSvg}
  ${footerSvg}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LAYOUT: TIERED ARCHITECTURAL STACK
// ─────────────────────────────────────────────────────────────────────────────
function renderStackLayout(topic, data, items) {
  const curYEstimate = 250;
  const cY = curYEstimate + 24;
  const contentBottom = cY + 658;
  const totalHeight = contentBottom + 20 + 82 + 50;

  const { curY, svg: headerSvg } = renderSvgHeader(topic, data.idFormatted, data.category, data.eyebrowTags, data.mainQuestion, data.highlightWord, data.subtitle, totalHeight);
  const footerSvg = renderSvgFooter(topic, data.ctaHeadline, data.ctaSubtext, data.ctaButtonText, data.footerUrl, data.footerTags, contentBottom);

  const tiers = [
    { num: 'TIER 04', title: items[3]?.title || 'UNIT ECONOMICS & EXPANSION', desc: items[3]?.desc || 'LTV-to-CAC ratios, net retention ceilings, and long-term commercial contract viability.', fill: '#0A1128', text: '#FFFFFF', accent: '#3B82F6' },
    { num: 'TIER 03', title: items[2]?.title || 'COMMERCIAL INTENT SIGNALS', desc: items[2]?.desc || 'Category search velocity, executive hiring surges, and active software evaluation.', fill: '#EFF6FF', text: '#0F172A', accent: '#2563EB' },
    { num: 'TIER 02', title: items[1]?.title || 'TECHNOGRAPHIC & INFRASTRUCTURE FIT', desc: items[1]?.desc || 'Cloud deployment maturity, CRM data health, and integration compatibility.', fill: '#FFFFFF', text: '#0F172A', accent: '#3B82F6' },
    { num: 'TIER 01', title: items[0]?.title || 'FIRMOGRAPHIC BASELINE', desc: items[0]?.desc || 'Revenue band, employee headcount, industry vertical, and primary geography.', fill: '#F8FAFC', text: '#0F172A', accent: '#64748B' }
  ];

  let stackSvg = '';
  tiers.forEach((tr, idx) => {
    const yPos = cY + 28 + idx * 124;
    stackSvg += `
    <g transform="translate(60, ${yPos})">
      <rect width="1080" height="112" rx="14" fill="${tr.fill}" stroke="#CBD5E1" stroke-width="1.5" filter="url(#cardShadow)" />
      <rect x="0" y="16" width="6" height="80" rx="3" fill="${tr.accent}" />
      
      <g transform="translate(24, 20)">
        <rect width="110" height="26" rx="6" fill="#1D4ED8" />
        <text x="55" y="18" font-family="monospace, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">${tr.num}</text>
      </g>

      <text x="150" y="38" font-family="Segoe UI, sans-serif" font-size="16" font-weight="800" fill="${tr.text}">${xmlEscape(tr.title)}</text>
      <text x="150" y="66" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="${tr.fill === '#0A1128' ? '#CBD5E1' : '#334155'}">${xmlEscape(wrapSvgText(tr.desc, 78)[0] || '')}</text>
      <text x="150" y="86" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="${tr.fill === '#0A1128' ? '#CBD5E1' : '#334155'}">${xmlEscape(wrapSvgText(tr.desc, 78)[1] || '')}</text>
    </g>
    `;
  });

  const contentSvg = `
  <g transform="translate(60, ${cY})">
    <rect width="8" height="8" rx="2" fill="#2563EB" />
    <text x="22" y="10" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#1D4ED8" letter-spacing="1">ARCHITECTURAL REVENUE STACK &#8226; MATURITY MODEL</text>
  </g>

  ${stackSvg}

  <g transform="translate(60, ${cY + 538})">
    <rect width="1080" height="118" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="28" y="32" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#93C5FD" letter-spacing="1">PROFITMACHINES MULTI-TIER PRECISION CONTROLS</text>
    <text x="28" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">&#10003; Automated ICP Scoring Across Tiers</text>
    <text x="400" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">&#10003; Continuous Intent Telemetry</text>
    <text x="760" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">&#10003; Unit Economic Margin Safeguards</text>
    <text x="28" y="90" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="500" fill="#94A3B8">Replaces one-dimensional superficial list-buying with deep commercial predictability.</text>
  </g>
  `;

  return `<svg width="1200" height="${totalHeight}" viewBox="0 0 1200 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  ${headerSvg}
  ${contentSvg}
  ${footerSvg}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LAYOUT: COMPARATIVE SCORECARD (TWO-COLUMN)
// ─────────────────────────────────────────────────────────────────────────────
function renderScorecardLayout(topic, data, items) {
  const curYEstimate = 250;
  const cY = curYEstimate + 24;
  const contentBottom = cY + 668;
  const totalHeight = contentBottom + 20 + 82 + 50;

  const { curY, svg: headerSvg } = renderSvgHeader(topic, data.idFormatted, data.category, data.eyebrowTags, data.mainQuestion, data.highlightWord, data.subtitle, totalHeight);
  const footerSvg = renderSvgFooter(topic, data.ctaHeadline, data.ctaSubtext, data.ctaButtonText, data.footerUrl, data.footerTags, contentBottom);

  const leftItems = [
    { title: 'Volume-Obsessed Outreach', desc: 'Blasting low-intent generic sequences to unqualified lists.' },
    { title: 'Superficial Pipeline Metrics', desc: 'Inflated CRM pipeline value masked by sub-12% close rates.' },
    { title: 'Compounding Sales Drag', desc: 'Enterprise reps spending 65% of time on manual data entry.' },
    { title: 'Uncontrolled Deal Slippage', desc: 'Quarter-end discounts granted without CFO governance.' }
  ];

  const rightItems = [
    { title: 'Intent-Engineered Interception', desc: 'Focusing exclusively on accounts actively evaluating category solutions.' },
    { title: 'Mathematical Pipeline Governance', desc: 'Realistic conversion probability verified by empirical buying signals.' },
    { title: 'Autonomous Execution Layer', desc: 'Zero-touch briefing memos, objection battlecards, and CRM logging.' },
    { title: 'Outcome-Based Value Defense', desc: 'Defending pricing power with board-ready commercial ROI models.' }
  ];

  let leftRows = '';
  leftItems.forEach((it, i) => {
    const y = 74 + i * 114;
    leftRows += `
    <g transform="translate(20, ${y})">
      <rect width="485" height="100" rx="10" fill="#FFFFFF" stroke="#FECACA" stroke-width="1" />
      <circle cx="24" cy="24" r="10" fill="#FEE2E2" />
      <text x="24" y="28" font-family="sans-serif" font-size="12" font-weight="900" fill="#DC2626" text-anchor="middle">&#10005;</text>
      <text x="44" y="28" font-family="Segoe UI, sans-serif" font-size="14.5" font-weight="800" fill="#991B1B">${xmlEscape(it.title)}</text>
      <text x="20" y="56" font-family="Segoe UI, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(it.desc, 50)[0] || '')}</text>
      <text x="20" y="74" font-family="Segoe UI, sans-serif" font-size="12" font-weight="500" fill="#475569">${xmlEscape(wrapSvgText(it.desc, 50)[1] || '')}</text>
    </g>
    `;
  });

  let rightRows = '';
  rightItems.forEach((it, i) => {
    const y = 74 + i * 114;
    rightRows += `
    <g transform="translate(20, ${y})">
      <rect width="485" height="100" rx="10" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1" />
      <circle cx="24" cy="24" r="10" fill="#EFF6FF" />
      <text x="24" y="28" font-family="sans-serif" font-size="12" font-weight="900" fill="#2563EB" text-anchor="middle">&#10003;</text>
      <text x="44" y="28" font-family="Segoe UI, sans-serif" font-size="14.5" font-weight="800" fill="#1E40AF">${xmlEscape(it.title)}</text>
      <text x="20" y="56" font-family="Segoe UI, sans-serif" font-size="12" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(it.desc, 50)[0] || '')}</text>
      <text x="20" y="74" font-family="Segoe UI, sans-serif" font-size="12" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(it.desc, 50)[1] || '')}</text>
    </g>
    `;
  });

  const contentSvg = `
  <g transform="translate(60, ${cY})">
    <rect width="8" height="8" rx="2" fill="#2563EB" />
    <text x="22" y="10" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#1D4ED8" letter-spacing="1">SIDE-BY-SIDE ARCHITECTURAL COMPARISON</text>
  </g>

  <!-- Left Column -->
  <g transform="translate(60, ${cY + 20})">
    <rect width="525" height="548" rx="16" fill="#FFF5F5" stroke="#FECACA" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect width="525" height="52" rx="16" fill="#FEE2E2" />
    <rect x="0" y="36" width="525" height="16" fill="#FEE2E2" />
    <text x="24" y="32" font-family="Segoe UI, sans-serif" font-size="13" font-weight="900" fill="#991B1B" letter-spacing="1">TRADITIONAL / FLAWED GTM MOTION</text>
    ${leftRows}
  </g>

  <!-- Right Column -->
  <g transform="translate(615, ${cY + 20})">
    <rect width="525" height="548" rx="16" fill="#F0F7FF" stroke="#BFDBFE" stroke-width="1.5" filter="url(#cardShadow)" />
    <rect width="525" height="52" rx="16" fill="#DBEAFE" />
    <rect x="0" y="36" width="525" height="16" fill="#DBEAFE" />
    <text x="24" y="32" font-family="Segoe UI, sans-serif" font-size="13" font-weight="900" fill="#1E40AF" letter-spacing="1">PROFITMACHINES AI-NATIVE REVENUE ENGINE</text>
    ${rightRows}
  </g>

  <!-- Summary Yield Bar -->
  <g transform="translate(60, ${cY + 584})">
    <rect width="1080" height="84" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="28" y="30" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#93C5FD" letter-spacing="1">COMMERCIAL IMPACT &amp; NET OUTCOME</text>
    <text x="28" y="56" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">&#9656; Win Rate Lift: +42% &#8226; Sales Cycle: Compressed 34 Days &#8226; CAC Payback: Reduced by 38%</text>
  </g>
  `;

  return `<svg width="1200" height="${totalHeight}" viewBox="0 0 1200 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  ${headerSvg}
  ${contentSvg}
  ${footerSvg}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. LAYOUT: FUNNEL DIAGNOSTIC
// ─────────────────────────────────────────────────────────────────────────────
function renderFunnelLayout(topic, data, items) {
  const curYEstimate = 250;
  const cY = curYEstimate + 24;
  const contentBottom = cY + 658;
  const totalHeight = contentBottom + 20 + 82 + 50;

  const { curY, svg: headerSvg } = renderSvgHeader(topic, data.idFormatted, data.category, data.eyebrowTags, data.mainQuestion, data.highlightWord, data.subtitle, totalHeight);
  const footerSvg = renderSvgFooter(topic, data.ctaHeadline, data.ctaSubtext, data.ctaButtonText, data.footerUrl, data.footerTags, contentBottom);

  const funnelStages = [
    { name: 'STAGE 01: DISCOVERY TO SCOPING', drop: '-34% LEAKAGE', fix: 'Automated Account Intent Briefings', fill: '#EFF6FF', border: '#BFDBFE', width: 1080, x: 60 },
    { name: 'STAGE 02: SCOPING TO PROPOSAL', drop: '-42% LEAKAGE', fix: 'Economic ROI Business Case Alignment', fill: '#FFFFFF', border: '#CBD5E1', width: 940, x: 130 },
    { name: 'STAGE 03: PROPOSAL TO SECURITY &amp; LEGAL', drop: '-28% LEAKAGE', fix: 'Modular Security Dossier Acceleration', fill: '#EFF6FF', border: '#BFDBFE', width: 800, x: 200 },
    { name: 'STAGE 04: CONTRACT TO CLOSED-WON', drop: '+48% WIN RATE', fix: 'Executive Sponsor Value Orchestration', fill: '#0A1128', border: '#1E3A8A', width: 680, x: 260 }
  ];

  let stagesSvg = '';
  funnelStages.forEach((st, i) => {
    const y = cY + 28 + i * 124;
    const isDark = st.fill === '#0A1128';
    stagesSvg += `
    <g transform="translate(${st.x}, ${y})">
      <rect width="${st.width}" height="110" rx="14" fill="${st.fill}" stroke="${st.border}" stroke-width="1.5" filter="url(#cardShadow)" />
      
      <text x="24" y="34" font-family="Segoe UI, sans-serif" font-size="15" font-weight="900" fill="${isDark ? '#93C5FD' : '#0F172A'}">${xmlEscape(st.name)}</text>
      
      <g transform="translate(${st.width - 170}, 16)">
        <rect width="146" height="28" rx="6" fill="${isDark ? '#1E40AF' : '#FEE2E2'}" />
        <text x="73" y="19" font-family="monospace, sans-serif" font-size="11" font-weight="900" fill="${isDark ? '#FFFFFF' : '#DC2626'}" text-anchor="middle">${st.drop}</text>
      </g>

      <text x="24" y="68" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="700" fill="${isDark ? '#FFFFFF' : '#1D4ED8'}">&#10003; Diagnostic Fix: ${xmlEscape(st.fix)}</text>
      <text x="24" y="90" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="500" fill="${isDark ? '#94A3B8' : '#475569'}">${xmlEscape(items[i]?.desc || 'Continuous stage-by-stage progression telemetry.')}</text>
    </g>
    `;
  });

  const contentSvg = `
  <g transform="translate(60, ${cY})">
    <path d="M2 2 L12 2 L7 10 Z" fill="#2563EB" />
    <text x="22" y="10" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#1D4ED8" letter-spacing="1">PIPELINE FUNNEL LEAKAGE &amp; STAGE-GATE DIAGNOSTICS</text>
  </g>

  ${stagesSvg}

  <g transform="translate(60, ${cY + 538})">
    <rect width="1080" height="118" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="28" y="32" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#93C5FD" letter-spacing="1">HOW PROFITMACHINES PLUGS STAGE LEAKAGE</text>
    <text x="28" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">&#9656; Objective qualification criteria replace subjective sales rep confidence.</text>
    <text x="28" y="88" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="500" fill="#94A3B8">Telemetry triggers executive intervention before opportunities enter terminal sales stall.</text>
  </g>
  `;

  return `<svg width="1200" height="${totalHeight}" viewBox="0 0 1200 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  ${headerSvg}
  ${contentSvg}
  ${footerSvg}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. LAYOUT: TELEMETRY DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function renderDashboardLayout(topic, data, items) {
  const curYEstimate = 250;
  const cY = curYEstimate + 24;
  const contentBottom = cY + 668;
  const totalHeight = contentBottom + 20 + 82 + 50;

  const { curY, svg: headerSvg } = renderSvgHeader(topic, data.idFormatted, data.category, data.eyebrowTags, data.mainQuestion, data.highlightWord, data.subtitle, totalHeight);
  const footerSvg = renderSvgFooter(topic, data.ctaHeadline, data.ctaSubtext, data.ctaButtonText, data.footerUrl, data.footerTags, contentBottom);

  const contentSvg = `
  <g transform="translate(60, ${cY})">
    <circle cx="8" cy="8" r="6" fill="none" stroke="#2563EB" stroke-width="2" />
    <circle cx="8" cy="8" r="2.5" fill="#2563EB" />
    <text x="22" y="12" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#1D4ED8" letter-spacing="1">EXECUTIVE REVENUE TELEMETRY &amp; KPI DASHBOARD</text>
  </g>

  <!-- 3 Big Metric Stat Cards -->
  <g transform="translate(60, ${cY + 24})">
    <rect width="346" height="136" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="20" y="30" font-family="monospace, sans-serif" font-size="11" font-weight="700" fill="#94A3B8">PIPELINE VELOCITY INDEX</text>
    <text x="20" y="74" font-family="monospace, sans-serif" font-size="34" font-weight="900" fill="#60A5FA">3.8x</text>
    <rect x="20" y="90" width="100" height="22" rx="4" fill="#1E3A8A" />
    <text x="70" y="105" font-family="monospace, sans-serif" font-size="10" font-weight="800" fill="#93C5FD" text-anchor="middle">+42% YoY Lift</text>
  </g>

  <g transform="translate(426, ${cY + 24})">
    <rect width="346" height="136" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="20" y="30" font-family="monospace, sans-serif" font-size="11" font-weight="700" fill="#94A3B8">FORECAST ACCURACY BAND</text>
    <text x="20" y="74" font-family="monospace, sans-serif" font-size="34" font-weight="900" fill="#34D399">94.6%</text>
    <rect x="20" y="90" width="100" height="22" rx="4" fill="#064E3B" />
    <text x="70" y="105" font-family="monospace, sans-serif" font-size="10" font-weight="800" fill="#A7F3D0" text-anchor="middle">&#177;3% Tolerance</text>
  </g>

  <g transform="translate(794, ${cY + 24})">
    <rect width="346" height="136" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="20" y="30" font-family="monospace, sans-serif" font-size="11" font-weight="700" fill="#94A3B8">SALES CYCLE DURATION</text>
    <text x="20" y="74" font-family="monospace, sans-serif" font-size="34" font-weight="900" fill="#FBBF24">42 Days</text>
    <rect x="20" y="90" width="100" height="22" rx="4" fill="#78350F" />
    <text x="70" y="105" font-family="monospace, sans-serif" font-size="10" font-weight="800" fill="#FDE68A" text-anchor="middle">-34 Days Saved</text>
  </g>

  <!-- 4 Telemetry Data Streams -->
  <g transform="translate(60, ${cY + 176})">
    <rect width="1080" height="344" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" filter="url(#cardShadow)" />
    
    <text x="28" y="36" font-family="Segoe UI, sans-serif" font-size="14" font-weight="800" fill="#0F172A">FOUR CRITICAL REAL-TIME REVENUE SIGNALS</text>

    <!-- Stream 1 -->
    <g transform="translate(28, 54)">
      <rect width="1024" height="60" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
      <text x="20" y="34" font-family="Segoe UI, sans-serif" font-size="13.5" font-weight="800" fill="#1D4ED8">&#9656; Inbound Conversion Stream:</text>
      <text x="240" y="34" font-family="Segoe UI, sans-serif" font-size="12" font-weight="500" fill="#334155">${xmlEscape(items[0]?.desc || 'Continuous tracking of speed-to-lead across tiers.')}</text>
    </g>

    <!-- Stream 2 -->
    <g transform="translate(28, 122)">
      <rect width="1024" height="60" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
      <text x="20" y="34" font-family="Segoe UI, sans-serif" font-size="13.5" font-weight="800" fill="#1D4ED8">&#9656; Pipeline Stage Friction Stream:</text>
      <text x="240" y="34" font-family="Segoe UI, sans-serif" font-size="12" font-weight="500" fill="#334155">${xmlEscape(items[1]?.desc || 'Automated detection of deals stalled over 14 days.')}</text>
    </g>

    <!-- Stream 3 -->
    <g transform="translate(28, 190)">
      <rect width="1024" height="60" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
      <text x="20" y="34" font-family="Segoe UI, sans-serif" font-size="13.5" font-weight="800" fill="#1D4ED8">&#9656; Commercial Margin Health Stream:</text>
      <text x="240" y="34" font-family="Segoe UI, sans-serif" font-size="12" font-weight="500" fill="#334155">${xmlEscape(items[2]?.desc || 'Real-time discount threshold monitoring.')}</text>
    </g>

    <!-- Stream 4 -->
    <g transform="translate(28, 258)">
      <rect width="1024" height="60" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
      <text x="20" y="34" font-family="Segoe UI, sans-serif" font-size="13.5" font-weight="800" fill="#1D4ED8">&#9656; Executive Decision Intent Stream:</text>
      <text x="240" y="34" font-family="Segoe UI, sans-serif" font-size="12" font-weight="500" fill="#334155">${xmlEscape(items[3]?.desc || 'Multi-stakeholder engagement scoring.')}</text>
    </g>
  </g>

  <!-- Lower Takeaway -->
  <g transform="translate(60, ${cY + 536})">
    <rect width="1080" height="130" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="28" y="32" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#93C5FD" letter-spacing="1">EXECUTIVE TELEMETRY GOVERNANCE</text>
    <text x="28" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">&#9656; ProfitMachines connects data islands into unified board-level commercial visibility.</text>
    <text x="28" y="88" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="500" fill="#94A3B8">Replaces lagging CRM spreadsheet reviews with live mathematical revenue steering.</text>
  </g>
  `;

  return `<svg width="1200" height="${totalHeight}" viewBox="0 0 1200 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  ${headerSvg}
  ${contentSvg}
  ${footerSvg}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. LAYOUT: BLUEPRINT MODULAR
// ─────────────────────────────────────────────────────────────────────────────
function renderBlueprintLayout(topic, data, items) {
  const curYEstimate = 250;
  const cY = curYEstimate + 24;
  const contentBottom = cY + 658;
  const totalHeight = contentBottom + 20 + 82 + 50;

  const { curY, svg: headerSvg } = renderSvgHeader(topic, data.idFormatted, data.category, data.eyebrowTags, data.mainQuestion, data.highlightWord, data.subtitle, totalHeight);
  const footerSvg = renderSvgFooter(topic, data.ctaHeadline, data.ctaSubtext, data.ctaButtonText, data.footerUrl, data.footerTags, contentBottom);

  let modulesSvg = '';
  items.slice(0, 4).forEach((it, idx) => {
    const y = cY + 28 + idx * 124;
    modulesSvg += `
    <g transform="translate(60, ${y})">
      <rect width="1080" height="112" rx="14" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" filter="url(#cardShadow)" />
      <rect x="0" y="16" width="6" height="80" rx="3" fill="#2563EB" />
      
      <g transform="translate(24, 20)">
        <rect width="120" height="26" rx="6" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1" />
        <text x="60" y="18" font-family="monospace, sans-serif" font-size="11" font-weight="900" fill="#1D4ED8" text-anchor="middle">MODULE 0${idx + 1}</text>
      </g>

      <text x="164" y="38" font-family="Segoe UI, sans-serif" font-size="16" font-weight="800" fill="#0F172A">${xmlEscape(it.title)}</text>
      <text x="164" y="66" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(it.desc, 76)[0] || '')}</text>
      <text x="164" y="86" font-family="Segoe UI, sans-serif" font-size="12.5" font-weight="500" fill="#334155">${xmlEscape(wrapSvgText(it.desc, 76)[1] || '')}</text>
    </g>
    `;
  });

  const contentSvg = `
  <g transform="translate(60, ${cY})">
    <rect width="8" height="8" rx="2" fill="#2563EB" />
    <text x="22" y="10" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#1D4ED8" letter-spacing="1">SYSTEMATIC REVENUE EXECUTION BLUEPRINT</text>
  </g>

  ${modulesSvg}

  <g transform="translate(60, ${cY + 538})">
    <rect width="1080" height="118" rx="14" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" filter="url(#cardShadow)" />
    <text x="28" y="32" font-family="Segoe UI, sans-serif" font-size="12" font-weight="800" fill="#93C5FD" letter-spacing="1">PROFITMACHINES DISCIPLINED EXECUTION CONTROLS</text>
    <text x="28" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">&#10003; Standardized Milestone Governance</text>
    <text x="400" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">&#10003; Continuous Verification Audits</text>
    <text x="760" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">&#10003; Measurable ROI Tracking</text>
    <text x="28" y="90" font-family="Segoe UI, sans-serif" font-size="11.5" font-weight="500" fill="#94A3B8">Engineered for commercial leaders scaling predictable revenue engines.</text>
  </g>
  `;

  return `<svg width="1200" height="${totalHeight}" viewBox="0 0 1200 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  ${headerSvg}
  ${contentSvg}
  ${footerSvg}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENGINE ROUTER
// ─────────────────────────────────────────────────────────────────────────────
function generateSvgForTopic(topic) {
  const category = (topic.category || 'PIPELINE ACCELERATION').toUpperCase();
  const subcategory = (topic.subcategory || 'REVENUE OPERATIONS').toUpperCase();
  const idFormatted = topic.idFormatted || String(topic.id).padStart(3, '0');

  let eyebrowTags = `${subcategory} &#8226; ENTERPRISE REVENUE GOVERNANCE`;
  if (eyebrowTags.length > 60) eyebrowTags = eyebrowTags.substring(0, 58) + '...';

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

  const keyword = category.split(' ')[0] || 'REVENUE';
  const ctaHeadline = `Schedule an Executive ${topic.category} Diagnostic`;
  const ctaSubtext = `DM '${keyword}-DIAGNOSTIC' to benchmark your revenue readiness.`;
  const ctaButtonText = `REQUEST ${keyword} AUDIT →`;
  const footerUrl = 'WWW.PROFITMACHINES.COM';
  const footerTags = `${category} &#8226; DEMAND ENGINEERING &#8226; REVOPS &#8226; GTM STRATEGY`;

  const commonData = {
    idFormatted,
    category,
    subcategory,
    eyebrowTags,
    mainQuestion,
    highlightWord,
    subtitle,
    ctaHeadline,
    ctaSubtext,
    ctaButtonText,
    footerUrl,
    footerTags
  };

  const items = parseGraphicItems(topic);
  const layoutType = getLayoutType(topic.visualBrief?.framework || '');

  switch (layoutType) {
    case 'matrix-2x2':
      return renderMatrixLayout(topic, commonData, items);
    case 'waterfall-timeline':
      return renderWaterfallLayout(topic, commonData, items);
    case 'tiered-stack':
      return renderStackLayout(topic, commonData, items);
    case 'comparative-scorecard':
      return renderScorecardLayout(topic, commonData, items);
    case 'funnel-diagnostic':
      return renderFunnelLayout(topic, commonData, items);
    case 'telemetry-dashboard':
      return renderDashboardLayout(topic, commonData, items);
    case 'blueprint-modular':
    default:
      return renderBlueprintLayout(topic, commonData, items);
  }
}

module.exports = {
  generateSvgForTopic,
  getLayoutType
};
