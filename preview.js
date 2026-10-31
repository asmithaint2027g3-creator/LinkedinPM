/**
 * ProfitMachines LinkedIn Templates - Interactive Browser Preview Gallery
 */

(function () {
  'use strict';

  const topics = window.PROFITMACHINES_TOPICS || [];

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const postGrid = document.getElementById('postGrid');
  const resultsCount = document.getElementById('resultsCount');
  const categoryFilters = document.getElementById('categoryFilters');
  const formatButtons = document.querySelectorAll('.format-btn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalContent = document.getElementById('modalContent');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');
  const toastBubble = document.getElementById('toastBubble');

  // Filter State
  let currentSearch = '';
  let currentFormat = 'all';
  let currentCategory = 'all';
  let activeTopicIndex = -1;

  // Categories list
  const categories = [
    'All Categories',
    'Pipeline Acceleration',
    'Conversion Optimization',
    'AI-Augmented Sales Teams',
    'Revenue Team Efficiency',
    'Gross Margin Improvement',
    'Cost Optimization',
    'Revenue Intelligence',
    'AI Sales Execution',
    'Executive Perspectives'
  ];

  function init() {
    renderCategoryChips();
    bindEvents();
    renderPosts();

    // Check hash for deep link (e.g. #topic-1)
    if (window.location.hash) {
      const match = window.location.hash.match(/#topic-(\d+)/);
      if (match) {
        const id = parseInt(match[1], 10);
        const idx = topics.findIndex(t => t.id === id);
        if (idx !== -1) {
          openModal(idx);
        }
      }
    }
  }

  function renderCategoryChips() {
    categoryFilters.innerHTML = '';
    categories.forEach(cat => {
      const isAll = cat === 'All Categories';
      const count = isAll ? topics.length : topics.filter(t => t.category === cat).length;
      const chip = document.createElement('button');
      chip.className = `cat-chip ${isAll ? 'active' : ''}`;
      chip.textContent = `${cat} (${count})`;
      chip.addEventListener('click', () => {
        document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentCategory = isAll ? 'all' : cat;
        renderPosts();
      });
      categoryFilters.appendChild(chip);
    });
  }

  function bindEvents() {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderPosts();
    });

    formatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        formatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFormat = btn.dataset.format;
        renderPosts();
      });
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
      if (modalBackdrop.classList.contains('open')) {
        if (e.key === 'ArrowLeft') navigateModal(-1);
        if (e.key === 'ArrowRight') navigateModal(1);
      }
    });

    modalPrevBtn.addEventListener('click', () => navigateModal(-1));
    modalNextBtn.addEventListener('click', () => navigateModal(1));
  }

  function getFilteredPosts() {
    return topics.filter(item => {
      // Format Filter
      if (currentFormat !== 'all' && item.format !== currentFormat) {
        return false;
      }
      // Category Filter
      if (currentCategory !== 'all' && item.category !== currentCategory) {
        return false;
      }
      // Search Filter
      if (currentSearch) {
        const matchesId = item.id.toString() === currentSearch || item.idFormatted === currentSearch;
        const matchesTitle = item.title.toLowerCase().includes(currentSearch);
        const matchesCategory = item.category.toLowerCase().includes(currentSearch);
        const matchesAudience = item.targetAudience.toLowerCase().includes(currentSearch);
        const matchesCopy = item.rawCopy.toLowerCase().includes(currentSearch);
        const matchesHashtags = item.hashtags.some(h => h.toLowerCase().includes(currentSearch));

        if (!matchesId && !matchesTitle && !matchesCategory && !matchesAudience && !matchesCopy && !matchesHashtags) {
          return false;
        }
      }
      return true;
    });
  }

  function renderPosts() {
    const filtered = getFilteredPosts();
    resultsCount.textContent = `Showing ${filtered.length} of ${topics.length} templates`;

    if (filtered.length === 0) {
      postGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 4rem 2rem; text-align: center; background: #FFFFFF; border-radius: var(--pm-radius-lg); border: 1px solid var(--pm-border);">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--pm-text-heading); margin-bottom: 0.5rem;">No LinkedIn templates found</h3>
          <p style="color: var(--pm-text-secondary); font-size: 0.95rem;">Try adjusting your search keywords or clearing your category filters.</p>
        </div>
      `;
      return;
    }

    postGrid.innerHTML = filtered.map(item => {
      const isImage = item.format === 'single-image';
      const globalIndex = topics.findIndex(t => t.id === item.id);

      let mediaSnippet = '';
      if (isImage) {
        mediaSnippet = `
          <div class="card-media-wrapper" onclick="window.previewApp.openModal(${globalIndex})">
            <img src="${item.imagePath}" alt="${escapeHtml(item.title)}" class="card-thumbnail" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\\'padding:2rem;color:#EF4444;font-size:0.8rem;text-align:center;\\\'>⚠️ Image file missing</div>';">
            <div class="card-media-overlay">
              <span class="overlay-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Inspect Visual Asset
              </span>
            </div>
          </div>
        `;
      } else {
        const quoteText = item.hook ? item.hook.openingHook : item.cleanCopy.substring(0, 140);
        mediaSnippet = `
          <div class="card-text-preview" onclick="window.previewApp.openModal(${globalIndex})">
            <div class="card-text-quote">&ldquo;${escapeHtml(quoteText)}&rdquo;</div>
          </div>
        `;
      }

      const snippetText = item.cleanCopy.split('\n').filter(l => l.trim()).slice(0, 3).join(' ');

      return `
        <article class="post-card" id="card-${item.id}">
          <div class="card-header">
            <div class="card-tags">
              <span class="tag-id">#${item.idFormatted}</span>
              <span class="tag-cat">${escapeHtml(item.category)}</span>
              <span class="${isImage ? 'tag-fmt-image' : 'tag-fmt-text'}">${isImage ? 'Single Image' : 'Text-Only'}</span>
            </div>
            <h3 class="card-title" onclick="window.previewApp.openModal(${globalIndex})">${escapeHtml(item.title)}</h3>
            <div class="card-audience">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>${escapeHtml(item.targetAudience)}</span>
            </div>
          </div>

          ${mediaSnippet}

          <div class="card-snippet">
            ${escapeHtml(snippetText)}...
          </div>

          <div class="card-actions">
            <div style="display:flex; gap:0.4rem; align-items:center;">
              <button class="card-btn-view" onclick="window.previewApp.openModal(${globalIndex})">Read Full Post</button>
              <a href="${item.htmlPath}" target="_blank" class="card-btn-template" title="Open individual formatted HTML file">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Template HTML
              </a>
            </div>
            <button class="card-btn-copy" onclick="window.previewApp.copyPostCopy(${globalIndex})" title="Copy LinkedIn Caption">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  function openModal(index) {
    if (index < 0 || index >= topics.length) return;
    activeTopicIndex = index;
    const item = topics[index];
    const isImage = item.format === 'single-image';

    window.location.hash = `topic-${item.id}`;

    let visualContent = '';
    if (isImage && item.visualBrief) {
      const vb = item.visualBrief;
      visualContent = `
        <div style="background:#FFFFFF; border:1px solid var(--pm-border); border-radius:var(--pm-radius-lg); overflow:hidden; margin-bottom:1.5rem;">
          <div style="padding:1rem 1.25rem; background:#FAFAFC; border-bottom:1px solid var(--pm-border); display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.9rem; color:var(--pm-text-heading); display:flex; align-items:center; gap:0.5rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--pm-blue-primary)"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Visual Asset (1200 &times; 1200)
            </strong>
            <a href="${item.imagePath}" target="_blank" class="pm-btn pm-btn-secondary pm-btn-sm" style="text-decoration:none;">
              Open Full PNG &rarr;
            </a>
          </div>
          <div style="background:#0B132B; padding:1.5rem; display:flex; justify-content:center;">
            <img src="${item.imagePath}" alt="${escapeHtml(vb.altText)}" style="max-width:100%; max-height:550px; border-radius:8px; box-shadow:var(--pm-shadow-lg);">
          </div>
          <div style="padding:1.25rem; font-size:0.85rem; background:#FAFAFC; border-top:1px solid var(--pm-border);">
            <div style="margin-bottom:0.5rem;"><strong>Headline:</strong> ${escapeHtml(vb.headline)}</div>
            ${vb.subtitle ? `<div style="margin-bottom:0.5rem;"><strong>Subtitle:</strong> ${escapeHtml(vb.subtitle)}</div>` : ''}
            ${vb.framework ? `<div style="margin-bottom:0.5rem;"><strong>Framework:</strong> ${escapeHtml(vb.framework)}</div>` : ''}
            ${vb.altText ? `<div style="margin-bottom:0.5rem;"><strong>Alt Text:</strong> ${escapeHtml(vb.altText)}</div>` : ''}
            ${vb.exactGraphicText ? `
              <div style="margin-top:0.75rem;">
                <strong>Exact Text on Graphic:</strong>
                <div style="margin-top:0.4rem; padding:0.6rem 0.8rem; background:#FFFFFF; border:1px solid var(--pm-border); border-left:3px solid var(--pm-blue-primary); border-radius:4px; font-family:monospace; font-size:0.8rem; white-space:pre-wrap;">${escapeHtml(vb.exactGraphicText)}</div>
              </div>` : ''}
          </div>
        </div>
      `;
    }

    let hookContent = '';
    if (!isImage && item.hook) {
      hookContent = `
        <div style="background:linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%); border:1px solid var(--pm-blue-border); border-left:4px solid var(--pm-blue-primary); border-radius:var(--pm-radius-md); padding:1.25rem 1.5rem; margin-bottom:1.5rem;">
          <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:var(--pm-blue-primary); margin-bottom:0.4rem;">Executive Hook &amp; Core Thesis</div>
          <div style="font-size:1.1rem; font-weight:700; color:var(--pm-text-heading); font-style:italic; margin-bottom:0.5rem;">&ldquo;${escapeHtml(item.hook.openingHook)}&rdquo;</div>
          <div style="font-size:0.875rem; color:var(--pm-text-secondary);"><strong>Takeaway:</strong> ${escapeHtml(item.hook.concreteTakeaway)}</div>
        </div>
      `;
    }

    const paragraphsHtml = item.cleanCopy.split(/\r?\n\s*\r?\n/).map(p => {
      p = p.trim();
      if (!p) return '';
      const lines = p.split(/\r?\n/);
      if (lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
        return `<ul style="margin:0 0 1rem 1.5rem;">${lines.map(l => `<li>${escapeHtml(l.trim().replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
      }
      if (lines.every(l => /^\d+\.\s+/.test(l.trim()))) {
        return `<ol style="margin:0 0 1rem 1.5rem;">${lines.map(l => `<li>${escapeHtml(l.trim().replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
      }
      return `<p style="margin-bottom:1rem; line-height:1.65;">${escapeHtml(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\r?\n/g, '<br>')}</p>`;
    }).join('');

    const hashtagsHtml = item.hashtags.map(h => `<span style="display:inline-block; font-size:0.8rem; font-weight:600; color:var(--pm-blue-primary); background:var(--pm-blue-light); padding:0.2rem 0.6rem; border-radius:9999px; margin-right:0.4rem; margin-bottom:0.4rem;">${escapeHtml(h)}</span>`).join('');

    modalContent.innerHTML = `
      <div>
        <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:1rem;">
          <span class="tag-id">Topic #${item.idFormatted}</span>
          <span class="tag-cat">${escapeHtml(item.category)}</span>
          <span class="${isImage ? 'tag-fmt-image' : 'tag-fmt-text'}">${isImage ? 'Single Image Post' : 'Text-Only Post'}</span>
        </div>

        <h2 style="font-size:1.5rem; font-weight:800; color:var(--pm-text-heading); margin-bottom:0.75rem; line-height:1.3;">
          ${escapeHtml(item.title)}
        </h2>

        <div style="font-size:0.85rem; color:var(--pm-text-secondary); margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--pm-border); display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem;">
          <div><strong style="color:var(--pm-text-heading);">Target Audience:</strong><br>${escapeHtml(item.targetAudience)}</div>
          <div><strong style="color:var(--pm-text-heading);">Subcategory:</strong><br>${escapeHtml(item.subcategory)}</div>
        </div>

        ${hookContent}

        ${visualContent}

        <!-- LinkedIn Post Copy Card -->
        <div style="background:#FFFFFF; border:1px solid var(--pm-border); border-radius:var(--pm-radius-lg); overflow:hidden; margin-bottom:1.5rem; box-shadow:var(--pm-shadow-sm);">
          <div style="padding:1rem 1.25rem; background:#FAFAFC; border-bottom:1px solid var(--pm-border); display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:36px; height:36px; border-radius:50%; background:#0F172A; color:#FFF; font-weight:800; font-size:0.9rem; display:flex; align-items:center; justify-content:center;">PM</div>
              <div>
                <strong style="font-size:0.9rem; color:var(--pm-text-heading); display:block;">ProfitMachines.work</strong>
                <span style="font-size:0.75rem; color:var(--pm-text-muted);">AI-Native Revenue Transformation Platform</span>
              </div>
            </div>
            <button class="pm-btn pm-btn-primary pm-btn-sm" onclick="window.previewApp.copyPostCopy(${index})">
              Copy Post Copy
            </button>
          </div>
          <div style="padding:1.5rem; font-size:1rem; color:#1E293B;">
            ${paragraphsHtml}
            <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--pm-border);">
              ${hashtagsHtml}
            </div>
          </div>
        </div>

        <!-- CTA Box -->
        <div style="background:linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color:#FFFFFF; border-radius:var(--pm-radius-md); padding:1.25rem 1.5rem; margin-bottom:1.5rem;">
          <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:#60A5FA; margin-bottom:0.25rem;">Commercial CTA Trigger</div>
          <div style="font-size:0.9rem; color:#E2E8F0;">${escapeHtml(item.cta)}</div>
        </div>

        <!-- Quick Links -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; padding-top:1rem; border-top:1px solid var(--pm-border);">
          <a href="${item.htmlPath}" target="_blank" class="pm-btn pm-btn-secondary pm-btn-sm" style="text-decoration:none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open Standalone Formatted HTML Template &rarr;
          </a>
          <a href="${item.mdPath}" target="_blank" class="pm-btn pm-btn-secondary pm-btn-sm" style="text-decoration:none;">
            View Source Markdown (.md)
          </a>
        </div>
      </div>
    `;

    modalPrevBtn.disabled = index === 0;
    modalNextBtn.disabled = index === topics.length - 1;

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigateModal(direction) {
    const newIndex = activeTopicIndex + direction;
    if (newIndex >= 0 && newIndex < topics.length) {
      openModal(newIndex);
    }
  }

  function copyPostCopy(index) {
    const item = topics[index];
    if (!item) return;
    const textToCopy = item.rawCopy;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(() => showToast('Post copy copied to clipboard!'));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Post copy copied to clipboard!');
    }
  }

  function showToast(message) {
    toastBubble.textContent = message;
    toastBubble.style.display = 'block';
    setTimeout(() => {
      toastBubble.style.display = 'none';
    }, 2500);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Export to window for inline onclick handlers
  window.previewApp = {
    openModal,
    closeModal,
    copyPostCopy
  };

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

