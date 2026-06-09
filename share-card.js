/* ============================================
   IG 限動分享卡 · ShareCard 模組
   ============================================
   Phase 10
   功能：
     - 從 state.result 讀取命盤資料
     - 渲染 3 種卡（人格 / 命局 / 能量）
     - 點下載 → html2canvas 截圖 1080×1920 PNG → 觸發瀏覽器下載

   暴露：window.ShareCard.init(data)、window.ShareCard.open()
   依賴：tokens.css、share-card.css、html2canvas、qrcode-generator
   ============================================ */

(function(){
'use strict';

// ============================================
// 模組狀態
// ============================================
const state = {
  initialized: false,
  data: null,           // { pillars, dayStem, dayElement, name, gender, solarDate, lunarDate }
  currentTab: 0,        // 0 = persona, 1 = chart, 2 = energy, 3 = quote
  rendering: false,     // 截圖中（避免重複觸發）
  featuredQuote: '',    // 單句金句（persona 卡用，每次 init 隨機抽）
  featuredQuotes3: []   // 三句金句（quote 卡用，每次 init 隨機抽 3 個）
};

const TABS = [
  { id: 'persona', label: '日 主', filename: 'persona' },
  { id: 'chart',   label: '命 局', filename: 'chart' },
  { id: 'energy',  label: '能 量', filename: 'energy' },
  { id: 'quote',   label: '金 句', filename: 'quote' }
];

const ELEMENT_NAMES = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
};

// 取得品牌網址 + tagline
function getShareUrl() {
  // 使用當前頁的 origin（生產為 vercel 網域，本地為 file://）
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    return window.location.origin;
  }
  return 'https://bazi.atelier';
}

function getDisplayUrl() {
  const url = getShareUrl();
  return url.replace(/^https?:\/\//, '');
}


// ============================================
// 載入外部 lib（html2canvas + qrcode-generator）
// 採延遲載入策略：只在第一次開啟 modal 時才下載 ~55KB
// ============================================
let libsPromise = null;
function loadLibs() {
  if (libsPromise) return libsPromise;

  libsPromise = Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js')
  ]);

  return libsPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load: ' + src));
    document.head.appendChild(s);
  });
}


// ============================================
// 對外 API
// ============================================
const ShareCard = {
  init(data) {
    state.data = data;
    state.initialized = true;

    // 每次 init 隨機抽選金句（鼓勵用戶多次造訪以拿到不同卡片）
    const profile = (window.DAY_MASTER_PROFILES || {})[data.dayStem];
    const scenarios = (profile && profile.nodScenarios) || [];
    if (scenarios.length > 0) {
      // persona 卡：抽 1 個當主視覺金句
      state.featuredQuote = scenarios[Math.floor(Math.random() * scenarios.length)];
      // quote 卡：抽 3 個不重複的
      state.featuredQuotes3 = shuffleArray([...scenarios]).slice(0, 3);
    } else {
      state.featuredQuote = '';
      state.featuredQuotes3 = [];
    }
    // 觸發第一次 modal 開啟時才會 render
  },

  open() {
    if (!state.data) {
      console.warn('[ShareCard] No data; call init() first.');
      return;
    }
    const modal = document.getElementById('shareCardModal');
    if (!modal) return;

    // 動畫先把 modal 顯示出來，lib 在背景載入
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // 載入 lib + 渲染當前 tab
    loadLibs().then(() => {
      renderCurrentCard();
      adjustPreviewScale();
    }).catch(err => {
      console.error('[ShareCard] Failed to load libs:', err);
      showToast('載入失敗，請稍後再試');
    });
  },

  close() {
    const modal = document.getElementById('shareCardModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  },

  switchTab(idx) {
    if (idx < 0 || idx >= TABS.length) return;
    state.currentTab = idx;
    document.querySelectorAll('.share-tab').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });
    renderCurrentCard();
  },

  download() {
    if (state.rendering) return;
    if (!window.html2canvas) {
      showToast('正在載入工具…');
      return;
    }

    const frame = document.getElementById('shareCardFrame');
    if (!frame) return;

    state.rendering = true;
    const btn = document.getElementById('shareCardDownload');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '生 成 中…'; }

    // 截圖前需要：
    // 1) 確認字體已 loaded（避免 fallback 字體被截到）
    // 2) onclone 內把 transform: scale 移除 → 截圖能拿到完整 540×960
    const fontReady = (document.fonts && document.fonts.ready)
      ? document.fonts.ready
      : Promise.resolve();

    fontReady.then(() => {
      return window.html2canvas(frame, {
        scale: 2,                       // 540×960 → 1080×1920
        useCORS: true,
        backgroundColor: null,
        logging: false,
        // 把 wrapper 的 transform 移除（讓 html2canvas 拿到原尺寸）
        onclone: (clonedDoc) => {
          const clonedFrame = clonedDoc.getElementById('shareCardFrame');
          if (clonedFrame) {
            clonedFrame.style.transform = 'none';
            clonedFrame.style.boxShadow = 'none';
            clonedFrame.style.borderRadius = '0';
          }
        }
      });
    }).then(canvas => {
      return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png', 1);
      });
    }).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const tab = TABS[state.currentTab];
      const stem = state.data.dayStem || 'bazi';
      a.download = `bazi-${tab.filename}-${stem}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast('已下載 · 可上傳到 IG 限時動態');
      trackEvent('share_card_download', { tab: tab.id, day_stem: stem });
    }).catch(err => {
      console.error('[ShareCard] Download failed:', err);
      showToast('下載失敗，請稍後再試');
    }).finally(() => {
      state.rendering = false;
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    });
  }
};

// 暴露到 window
window.ShareCard = ShareCard;


// ============================================
// 渲染卡片內容（共用 frame，內部插不同 template）
// ============================================
function renderCurrentCard() {
  const frame = document.getElementById('shareCardFrame');
  if (!frame || !state.data) return;

  const tab = TABS[state.currentTab];
  if (tab.id === 'persona')  frame.innerHTML = renderPersonaHTML();
  if (tab.id === 'chart')    frame.innerHTML = renderChartHTML();
  if (tab.id === 'energy')   frame.innerHTML = renderEnergyHTML();
  if (tab.id === 'quote')    frame.innerHTML = renderQuoteHTML();

  // 渲染 QR code 到該卡的 .sc-qr 內
  renderQRCode();
}

function renderQRCode() {
  if (!window.qrcode) return;
  const qrEl = document.querySelector('#shareCardFrame .sc-qr');
  if (!qrEl) return;

  try {
    // qrcode-generator: qrcode(typeNumber, errorCorrectionLevel)
    // typeNumber=0 = auto, errorCorrectionLevel='M' = medium
    const qr = window.qrcode(0, 'M');
    qr.addData(getShareUrl());
    qr.make();

    // 不同版本的 createSvgTag API：
    //   v1.4+: createSvgTag({ scalable, margin })
    //   v1.0~: createSvgTag(cellSize, margin)
    // 用 try-catch 兜底
    let svgHtml;
    try {
      svgHtml = qr.createSvgTag({ scalable: true, margin: 0 });
    } catch (e) {
      svgHtml = qr.createSvgTag(4, 0);
    }
    qrEl.innerHTML = svgHtml;

    // 確保 SVG 撐滿容器（不同版本預設輸出大小不同）
    const svg = qrEl.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.display = 'block';
    }
  } catch (err) {
    console.warn('[ShareCard] QR generation failed:', err);
    // 失敗時用文字代替，避免空白
    qrEl.innerHTML = '<div style="font-size:8px;color:#888;text-align:center;line-height:1.3">QR<br>code</div>';
  }
}


// ============================================
// Template 1: 日主人格卡（VIRAL 優化版）
// ============================================
function renderPersonaHTML() {
  const d = state.data;
  const profile = (window.DAY_MASTER_PROFILES || {})[d.dayStem];
  if (!profile) return '<div style="padding:40px">資料不足</div>';

  const keywordsHTML = (profile.keywords || []).slice(0, 3).map(k =>
    `<span class="sc-keyword">${escapeHtml(k)}</span>`
  ).join('');

  // 金句（從 nodScenarios 抽選，在 init 時已決定）
  const quoteHTML = state.featuredQuote
    ? `
      <div class="sc-persona-quote">
        <div class="sc-persona-quote-mark">你 會 ——</div>
        <p class="sc-persona-quote-text">「${escapeHtml(state.featuredQuote)}」</p>
      </div>
    `
    : '';

  return `
    <div class="sc-brand">
      <span class="sc-brand-mark">BAZI · ATELIER</span>
      <span class="sc-brand-tag">PERSONA</span>
    </div>

    <div class="sc-persona-content">
      <div class="sc-persona-element">${escapeHtml(profile.elementName || '')}</div>

      <div class="sc-persona-circle">
        <span class="sc-persona-stem">${escapeHtml(d.dayStem)}</span>
      </div>

      <div class="sc-persona-name">${escapeHtml(profile.personaName || '')}</div>

      <div class="sc-persona-imagery">${escapeHtml(profile.imagery || '')}</div>

      ${quoteHTML}

      <div class="sc-divider"></div>

      <div class="sc-persona-tagline">${escapeHtml(profile.tagline || '')}</div>

      <div class="sc-keywords">${keywordsHTML}</div>
    </div>

    ${renderFooterHTML('掃 我 也 算 一 個')}
  `;
}


// ============================================
// Template 2: 命局速覽卡
// ============================================
function renderChartHTML() {
  const d = state.data;
  const pillars = d.pillars || {};
  const profile = (window.DAY_MASTER_PROFILES || {})[d.dayStem] || {};

  const pillarOrder = ['year', 'month', 'day', 'hour'];
  const labels = { year: '年', month: '月', day: '日', hour: '時' };

  const pillarsHTML = pillarOrder.map(k => {
    const p = pillars[k];
    if (!p) return '';
    const isDay = (k === 'day');
    return `
      <div class="sc-pillar ${isDay ? 'sc-pillar--day' : ''}">
        <div class="sc-pillar-label">${labels[k]} 柱</div>
        <div class="sc-pillar-stem">${escapeHtml(p.stem || '')}</div>
        <div class="sc-pillar-branch">${escapeHtml(p.branch || '')}</div>
      </div>
    `;
  }).join('');

  // 計算五行能量
  let energy = { wood:0, fire:0, earth:0, metal:0, water:0 };
  let formulaText = '';
  if (window.BAZI_ENGINE && window.BRANCH_PROFILES) {
    try {
      energy = window.BAZI_ENGINE.calculateElementEnergy(pillars, window.BRANCH_PROFILES);
      const bodyStrength = window.BAZI_ENGINE.determineBodyStrength(energy, d.dayElement);
      formulaText = bodyStrength.type || '';
    } catch (e) {
      console.warn('[ShareCard] Energy calc failed:', e);
    }
  }

  const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
  const elementsHTML = elementOrder.map(el => {
    const pct = Math.round(energy[el] || 0);
    return `
      <div class="sc-element-row">
        <span class="sc-element-name">${ELEMENT_NAMES[el]}</span>
        <div class="sc-element-bar">
          <div class="sc-element-bar-fill sc-element-bar-fill--${el}" style="width:${pct}%"></div>
        </div>
        <span class="sc-element-pct">${pct}%</span>
      </div>
    `;
  }).join('');

  const formula = formulaText
    ? `<div class="sc-chart-formula">日主 <strong>${escapeHtml(profile.elementName || '')}</strong> · 命格 <strong>${escapeHtml(formulaText)}</strong></div>`
    : `<div class="sc-chart-formula">日主 <strong>${escapeHtml(profile.elementName || '')}</strong></div>`;

  return `
    <div class="sc-brand">
      <span class="sc-brand-mark">BAZI · ATELIER</span>
      <span class="sc-brand-tag">CHART</span>
    </div>

    <div class="sc-chart-content">
      <div class="sc-section-title">四 柱 八 字</div>

      <div class="sc-pillars">${pillarsHTML}</div>

      <div class="sc-section-subtitle">五 行 分 布</div>

      <div class="sc-elements-list">${elementsHTML}</div>

      ${formula}
    </div>

    ${renderFooterHTML('排 你 的 命 盤')}
  `;
}


// ============================================
// Template 3: 能量輪廓卡
// ============================================
function renderEnergyHTML() {
  const d = state.data;
  const pillars = d.pillars || {};
  const profile = (window.DAY_MASTER_PROFILES || {})[d.dayStem] || {};

  // 計算五行能量 + 用神
  let energy = { wood:0, fire:0, earth:0, metal:0, water:0 };
  let favorable = [];
  if (window.BAZI_ENGINE && window.BRANCH_PROFILES && window.FAVORABLE_ELEMENTS) {
    try {
      energy = window.BAZI_ENGINE.calculateElementEnergy(pillars, window.BRANCH_PROFILES);
      const bodyStrength = window.BAZI_ENGINE.determineBodyStrength(energy, d.dayElement);
      const favData = window.FAVORABLE_ELEMENTS[d.dayElement] &&
                      window.FAVORABLE_ELEMENTS[d.dayElement][bodyStrength.type];
      favorable = favData ? favData.favorable : [];
    } catch (e) {
      console.warn('[ShareCard] Energy calc failed:', e);
    }
  }

  const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
  const circlesHTML = elementOrder.map(el => {
    const pct = Math.round(energy[el] || 0);
    const isYong = favorable.includes(el);
    return `
      <div class="sc-energy-cell">
        <div class="sc-energy-circle sc-energy-circle--${el} ${isYong ? 'sc-energy-circle--yongshen' : ''}">
          <span class="sc-energy-name sc-energy-name--${el}">${ELEMENT_NAMES[el]}</span>
        </div>
        <div class="sc-energy-pct">${pct}%</div>
      </div>
    `;
  }).join('');

  // 引用 dayMaster.js 的 openingMetaphor（如果沒有，退回 tagline + imagery）
  const energyText = profile.openingMetaphor
    || (profile.imagery + '。' + profile.tagline)
    || '能量充沛而獨特';

  const yongText = favorable.length > 0
    ? favorable.map(el => ELEMENT_NAMES[el]).join(' · ')
    : '無顯著';

  return `
    <div class="sc-brand">
      <span class="sc-brand-mark">BAZI · ATELIER</span>
      <span class="sc-brand-tag">ENERGY</span>
    </div>

    <div class="sc-energy-content">
      <div class="sc-section-title">能 量 輪 廓</div>

      <div class="sc-energy-grid">${circlesHTML}</div>

      <div class="sc-energy-quote">
        <div class="sc-energy-quote-label">— 你 的 能 量 —</div>
        <div class="sc-energy-quote-text">${escapeHtml(energyText)}</div>
      </div>

      <div class="sc-energy-formula">
        用神 · <strong>${escapeHtml(yongText)}</strong>
      </div>
    </div>

    ${renderFooterHTML('看 你 的 能 量')}
  `;
}


// ============================================
// Template 4: 金句卡（Threads 友善 / VIRAL 優化）
// ============================================
function renderQuoteHTML() {
  const d = state.data;
  const profile = (window.DAY_MASTER_PROFILES || {})[d.dayStem] || {};
  const quotes = state.featuredQuotes3 || [];

  // 取日主對應的五行 class（套用 element-bg 作為主視覺強調）
  const elClass = d.dayElement || 'metal';

  const quotesHTML = quotes.length > 0
    ? quotes.map((q, i) => `
      <div class="sc-quote-item">
        <span class="sc-quote-num">0${i + 1}</span>
        <p class="sc-quote-text">${escapeHtml(q)}</p>
      </div>
    `).join('')
    : '<div class="sc-quote-empty">資料載入中…</div>';

  return `
    <div class="sc-brand">
      <span class="sc-brand-mark">BAZI · ATELIER</span>
      <span class="sc-brand-tag">QUOTES</span>
    </div>

    <div class="sc-quote-content sc-quote-content--${elClass}">

      <div class="sc-quote-header">
        <div class="sc-quote-eyebrow">如 果 你 是 ${escapeHtml(d.dayStem)} 日 主</div>
        <h2 class="sc-quote-title">你 會 ——</h2>
      </div>

      <div class="sc-quote-list">
        ${quotesHTML}
      </div>

      <div class="sc-quote-identity">
        <span class="sc-quote-identity-stem">${escapeHtml(d.dayStem)}</span>
        <span class="sc-quote-identity-name">${escapeHtml(profile.personaName || '')}</span>
      </div>

    </div>

    ${renderFooterHTML('找 你 的 日 主')}
  `;
}


// ============================================
// 共用：卡片底部（QR + 網址）
// ============================================
function renderFooterHTML(ctaText) {
  return `
    <div class="sc-footer">
      <div class="sc-qr"></div>
      <div class="sc-footer-text">
        <div class="sc-footer-url">${escapeHtml(getDisplayUrl())}</div>
        <div class="sc-footer-cta">${escapeHtml(ctaText)}</div>
      </div>
    </div>
  `;
}


// ============================================
// 工具函式
// ============================================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fisher-Yates 洗牌（用於從 nodScenarios 隨機抽 N 個不重複）
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showToast(msg) {
  let toast = document.getElementById('shareCardToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'shareCardToast';
    toast.className = 'share-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function trackEvent(name, props) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, props || {});
  }
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', name, props || {});
  }
}


// ============================================
// 預覽尺寸自適應
// ============================================
function adjustPreviewScale() {
  const wrapper = document.getElementById('shareCardWrapper');
  if (!wrapper) return;

  const previewArea = wrapper.parentElement; // .share-modal-preview
  if (!previewArea) return;

  // 預覽區可用寬度（減 padding）
  const availW = previewArea.clientWidth - 32;
  const availH = previewArea.clientHeight - 32;

  // 卡片邏輯尺寸 540×960
  const scaleW = availW / 540;
  const scaleH = availH / 960;
  const scale = Math.min(scaleW, scaleH, 0.7); // 上限 0.7

  wrapper.style.setProperty('--preview-scale', scale);
}


// ============================================
// DOM 事件綁定（在 share modal HTML 存在後執行）
// ============================================
function setupEvents() {
  // 關閉按鈕
  const closeBtn = document.getElementById('shareCardClose');
  if (closeBtn) closeBtn.addEventListener('click', () => ShareCard.close());

  // 背景點擊關閉
  const modal = document.getElementById('shareCardModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) ShareCard.close();
    });
  }

  // Tab 切換
  document.querySelectorAll('.share-tab').forEach((btn, i) => {
    btn.addEventListener('click', () => ShareCard.switchTab(i));
  });

  // 下載按鈕
  const dl = document.getElementById('shareCardDownload');
  if (dl) dl.addEventListener('click', () => ShareCard.download());

  // 視窗大小變動 → 重算預覽尺寸
  window.addEventListener('resize', adjustPreviewScale);

  // Esc 鍵關閉
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('shareCardModal');
      if (modal && modal.classList.contains('show')) {
        ShareCard.close();
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEvents);
} else {
  setupEvents();
}

})();
