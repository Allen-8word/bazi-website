/* ============================================
   IG 限動分享卡 · ShareCard 模組
   ============================================
   Phase 10
   功能：
     - 從 state.result 讀取命盤資料
     - 渲染日主人格卡
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
  data: null,           // { pillars, dayStem, dayElement, name, gender, solarDate, lunarDate, xianxiaProfile }
  currentTab: 0,        // 0 = xianxia/persona（僅保留一張主分享卡）
  rendering: false,     // 截圖中（避免重複觸發）
  featuredQuote: '',    // 單句金句（persona 卡用，每次 init 隨機抽）
  cardBlob: null,       // 預先生成的 PNG blob（讓「分享」能在點擊當下立即觸發）
  blobPromise: null     // 生成中的 Promise（避免重複生成）
};

const TABS = [
  { id: 'xianxia', label: '仙 途', filename: 'benming-xiantu' }
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
    } else {
      state.featuredQuote = '';
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
    const titleEl = document.getElementById('shareCardTitle');
    if (titleEl) titleEl.textContent = '下 載 本 命 仙 途 卡';

    // 動畫先把 modal 顯示出來，lib 在背景載入
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // 載入 lib + 渲染當前 tab
    loadLibs().then(() => {
      renderCurrentCard();
      adjustPreviewScale();
      // 背景預先生成 PNG：讓「分享」按鈕點下去能立即帶圖開啟系統分享面板
      pregenerateBlob();
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

    state.rendering = true;
    const btn = document.getElementById('shareCardDownload');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '生 成 中…'; }

    getCardBlob().then(blob => {
      if (!blob) throw new Error('Blob generation failed');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast('已下載 · 可上傳到 IG 限時動態');
      trackEvent('share_card_download', { tab: TABS[state.currentTab].id, day_stem: state.data.dayStem || '' });
      trackEvent('xianxia_share_card_download', { tab: TABS[state.currentTab].id, day_stem: state.data.dayStem || '' });
    }).catch(err => {
      console.error('[ShareCard] Download failed:', err);
      showToast('下載失敗，請稍後再試');
    }).finally(() => {
      state.rendering = false;
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    });
  },

  // 路線一：Web Share API 直接分享圖檔
  // 手機點「分享」→ 系統分享面板（IG 限動 / Threads / FB / LINE…）
  // 不支援的環境（多數電腦瀏覽器）→ 自動退回下載
  share() {
    if (state.rendering) return;

    if (!canNativeShareFiles()) {
      showToast('此裝置不支援直接分享 · 已改為下載');
      this.download();
      return;
    }

    // iOS 要求 navigator.share 必須在點擊手勢內呼叫，
    // 所以只用「已預先生成」的 blob；還沒生成完就提示再點一次
    if (!state.cardBlob) {
      showToast('卡片生成中，請稍候再點一次');
      getCardBlob();
      return;
    }

    const file = new File([state.cardBlob], getFileName(), { type: 'image/png' });
    if (!navigator.canShare({ files: [file] })) {
      showToast('此裝置不支援直接分享 · 已改為下載');
      this.download();
      return;
    }

    navigator.share({ files: [file] }).then(() => {
      showToast('已分享');
      trackEvent('share_card_share', { tab: TABS[state.currentTab].id, day_stem: state.data.dayStem || '' });
    }).catch(err => {
      if (err && err.name === 'AbortError') return; // 使用者自己取消，不視為錯誤
      console.error('[ShareCard] Share failed:', err);
      showToast('分享失敗，請改用下載');
    });
  }
};

// 暴露到 window
window.ShareCard = ShareCard;


// ============================================
// PNG 生成（download / share 共用）
// ============================================
function generateCardBlob() {
  const frame = document.getElementById('shareCardFrame');
  if (!frame || !window.html2canvas) {
    return Promise.reject(new Error('Frame or html2canvas not ready'));
  }

  // 截圖前需要：
  // 1) 確認字體已 loaded（避免 fallback 字體被截到）
  // 2) onclone 內把 transform: scale 移除 → 截圖能拿到完整 540×960
  const fontReady = (document.fonts && document.fonts.ready)
    ? document.fonts.ready
    : Promise.resolve();

  return fontReady.then(() => {
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
  });
}

function pregenerateBlob() {
  state.cardBlob = null;
  state.blobPromise = generateCardBlob()
    .then(blob => { state.cardBlob = blob; return blob; })
    .catch(err => {
      console.warn('[ShareCard] Pre-generate failed:', err);
      state.blobPromise = null;
      return null;
    });
  return state.blobPromise;
}

function getCardBlob() {
  if (state.cardBlob) return Promise.resolve(state.cardBlob);
  if (state.blobPromise) return state.blobPromise;
  return pregenerateBlob();
}

function getFileName() {
  const tab = TABS[state.currentTab];
  const stem = (state.data && state.data.dayStem) || 'bazi';
  return `bazi-${tab.filename}-${stem}.png`;
}

// 是否支援「分享檔案」（手機 Safari / Chrome 大多支援；電腦多半不支援）
function canNativeShareFiles() {
  if (!navigator.share || !navigator.canShare) return false;
  try {
    const testFile = new File([new Blob([''], { type: 'image/png' })], 't.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch (e) {
    return false;
  }
}


// ============================================
// 渲染卡片內容（共用 frame，內部插不同 template）
// ============================================
function renderCurrentCard() {
  const frame = document.getElementById('shareCardFrame');
  if (!frame || !state.data) return;

  frame.innerHTML = renderPersonaHTML();

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
  const xianxiaProfile = getXianxiaProfile();
  if (xianxiaProfile) return renderXianxiaHTML(xianxiaProfile, profile);

  const keywordsHTML = (profile.keywords || []).slice(0, 3).map(k =>
    `<span class="sc-keyword">${escapeHtml(k)}</span>`
  ).join('');

  // 修仙稱號區塊（Phase 11：稱號 + 職業徽章 + 稱號特色）
  const xianxiaHTML = profile.xianxiaTitle
    ? `
      <div class="sc-xianxia">
        <div class="sc-xianxia-title-row">
          <span class="sc-xianxia-title">${escapeHtml(profile.xianxiaTitle)}</span>
          <span class="sc-xianxia-archetype">${escapeHtml(profile.xianxiaArchetype || '')}</span>
        </div>
        <div class="sc-xianxia-tagline">「${escapeHtml(profile.xianxiaTagline || '')}」</div>
      </div>
    `
    : '';

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

      ${xianxiaHTML}

      ${quoteHTML}

      <div class="sc-divider"></div>

      <div class="sc-persona-tagline">${escapeHtml(profile.tagline || '')}</div>

      <div class="sc-keywords">${keywordsHTML}</div>
    </div>

    ${renderFooterHTML('掃 我 也 算 一 個')}
  `;
}

function getXianxiaProfile() {
  if (state.data && state.data.xianxiaProfile) return state.data.xianxiaProfile;
  if (!window.XIANXIA_MAP || !window.BAZI_XIANXIA_PROFILE || typeof window.BAZI_XIANXIA_PROFILE.buildXianxiaProfile !== 'function') {
    return null;
  }
  try {
    return window.BAZI_XIANXIA_PROFILE.buildXianxiaProfile({
      baziResult: state.data
    });
  } catch (e) {
    console.warn('[ShareCard] Xianxia profile build failed:', e);
    return null;
  }
}

function renderXianxiaHTML(xianxiaProfile, dayMasterProfile) {
  const d = state.data;
  const keywordsHTML = (xianxiaProfile.keywords || []).slice(0, 4).map(k =>
    `<span class="sc-keyword">${escapeHtml(k)}</span>`
  ).join('');
  const reminder = xianxiaProfile.shareLine || xianxiaProfile.phrase || xianxiaProfile.challenge || '';

  return `
    <div class="sc-brand">
      <span class="sc-brand-mark">本 命 仙 盤</span>
      <span class="sc-brand-tag">XIANTU</span>
    </div>

    <div class="sc-xiantu-content">
      <div class="sc-xiantu-kicker">我 的 本 命 仙 途 卡</div>

      <div class="sc-persona-circle sc-xiantu-circle">
        <span class="sc-persona-stem">${escapeHtml(d.dayStem)}</span>
      </div>

      <div class="sc-xiantu-root">${escapeHtml(xianxiaProfile.spiritRoot)}</div>
      <div class="sc-xiantu-title">${escapeHtml(xianxiaProfile.title)}</div>
      <div class="sc-xiantu-subtitle">${escapeHtml((dayMasterProfile && dayMasterProfile.elementName) || '')} · 本命靈根</div>

      <div class="sc-keywords sc-xiantu-keywords">${keywordsHTML}</div>

      <div class="sc-xiantu-panel">
        <div class="sc-xiantu-label">修 行 提 醒</div>
        <p>${escapeHtml(reminder)}</p>
      </div>

      <div class="sc-xiantu-panel sc-xiantu-panel-soft">
        <div class="sc-xiantu-label">命 格 天 賦</div>
        <p>${escapeHtml(xianxiaProfile.gift)}</p>
      </div>
    </div>

    ${renderFooterHTML('掃 我 啟 動 本 命 仙 盤')}
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

  // 分享按鈕（Web Share API）
  // 不支援檔案分享的環境（多數電腦瀏覽器）→ 隱藏分享鈕、下載鈕升回主按鈕樣式
  const shareBtn = document.getElementById('shareCardShare');
  if (shareBtn) {
    if (canNativeShareFiles()) {
      shareBtn.addEventListener('click', () => ShareCard.share());
    } else {
      shareBtn.style.display = 'none';
      if (dl) dl.classList.add('share-modal-download--primary');
    }
  }

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
