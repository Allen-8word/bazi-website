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
  { id: 'xianxia', label: '靈 獸', filename: 'benming-lingshou' },
  { id: 'beastnum', label: '靈 獸 × 靈 數', filename: 'lingshou-lingshu' }
];

// 生命靈數整合 Phase E：日主拼音（圖檔命名用）
const STEM_PINYIN = {
  '甲': 'jia', '乙': 'yi', '丙': 'bing', '丁': 'ding', '戊': 'wu',
  '己': 'ji', '庚': 'geng', '辛': 'xin', '壬': 'ren', '癸': 'gui'
};

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
    if (titleEl) titleEl.textContent = '下 載 本 命 靈 獸 卡';

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
    // 切卡後必須重新生成 PNG blob，否則分享/下載會拿到上一張卡
    if (window.html2canvas) pregenerateBlob();
  },

  // 生命靈數整合 Phase E：靈獸圖檔備援鏈（主檔 → 卓越數共用圖 → 基礎數圖 → 隱藏）
  _imgNext(img) {
    try {
      const list = JSON.parse(img.getAttribute('data-srcs') || '[]');
      let i = parseInt(img.getAttribute('data-i') || '0', 10) + 1;
      if (i < list.length) {
        img.setAttribute('data-i', String(i));
        img.src = list[i];
      } else {
        const wrap = img.closest('.sc2-illustration, .sc-portrait-wrap');
        if (wrap) wrap.style.display = 'none';
      }
    } catch (e) {
      const wrap = img.closest('.sc2-illustration, .sc-portrait-wrap');
      if (wrap) wrap.style.display = 'none';
    }
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

  // 等卡內所有圖片載入（或失敗備援）完成，避免截圖截到半載入狀態
  const imagesReady = Promise.all(
    Array.from(frame.querySelectorAll('img')).map(img =>
      (img.complete) ? Promise.resolve() : new Promise(res => {
        img.addEventListener('load', res, { once: true });
        img.addEventListener('error', res, { once: true });
        setTimeout(res, 3000); // 保險絲：最多等 3 秒
      })
    )
  );

  return Promise.all([fontReady, imagesReady]).then(() => {
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
  const lp = (tab.id === 'beastnum' && state.beastNumCalc) ? '-' + state.beastNumCalc.lifePath : '';
  return `bazi-${tab.filename}-${stem}${lp}.png`;
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

  const tab = TABS[state.currentTab] || TABS[0];
  frame.innerHTML = (tab.id === 'beastnum') ? renderBeastNumHTML() : renderPersonaHTML();

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
      baziResult: state.data,
      gender: state.data && state.data.gender
    });
  } catch (e) {
    console.warn('[ShareCard] Xianxia profile build failed:', e);
    return null;
  }
}

// 靈獸卡插圖：改用新靈獸圖系（assets/beast-numerology/），與第二張卡共用備援鏈
// 有生日 → 顯示使用者自己的 {日主}×{靈數} 圖；無生日 → 回退該日主的靈數 1 代表圖
function getBeastPortraitSrcs() {
  const d = state.data || {};
  const py = STEM_PINYIN[d.dayStem];
  if (!py) return null;
  const dir = './assets/beast-numerology/';
  if (window.NUMEROLOGY && d.birthYear && d.birthMonth && d.birthDay) {
    const calc = window.NUMEROLOGY.calcLifePathNumber(d.birthYear, d.birthMonth, d.birthDay);
    if (calc) {
      const srcs = [`${dir}${py}_${calc.lifePath}.png`];
      if (calc.isMaster) {
        srcs.push(`${dir}master_${calc.lifePath}.png`);
        srcs.push(`${dir}${py}_${calc.baseNumber}.png`);
      }
      if (srcs.indexOf(`${dir}${py}_1.png`) === -1) srcs.push(`${dir}${py}_1.png`);
      return srcs;
    }
  }
  return [`${dir}${py}_1.png`];
}

function renderXianxiaHTML(xianxiaProfile, dayMasterProfile) {
  const d = state.data;
  const keywordsHTML = (xianxiaProfile.keywords || []).slice(0, 4).map(k =>
    `<span class="sc-keyword">${escapeHtml(k)}</span>`
  ).join('');
  const reminder = xianxiaProfile.shareLine || xianxiaProfile.phrase || xianxiaProfile.challenge || '';
  const portraitSrcs = getBeastPortraitSrcs();
  const portraitHTML = portraitSrcs
    ? `
      <div class="sc-portrait-wrap">
        <img class="sc-portrait-img"
             src="${escapeHtml(portraitSrcs[0])}"
             data-srcs='${escapeHtml(JSON.stringify(portraitSrcs))}'
             data-i="0"
             alt="${escapeHtml(xianxiaProfile.title || '')}"
             onerror="window.ShareCard._imgNext(this)">
      </div>
    `
    : '';

  return `
    <div class="sc-brand">
      <span class="sc-brand-mark">本 命 仙 盤</span>
      <span class="sc-brand-tag">LINGSHOU</span>
    </div>

    <div class="sc-xiantu-content">
      <div class="sc-xiantu-kicker">我 的 本 命 靈 獸 卡</div>

      <div class="sc-persona-circle sc-xiantu-circle">
        <span class="sc-persona-stem">${escapeHtml(d.dayStem)}</span>
      </div>

      <div class="sc-xiantu-root">${escapeHtml(xianxiaProfile.spiritRoot)}</div>
      <div class="sc-xiantu-title">${escapeHtml(xianxiaProfile.title)}</div>
      <div class="sc-xiantu-subtitle">${escapeHtml(xianxiaProfile.yinYang || (dayMasterProfile && dayMasterProfile.elementName) || '')} · ${escapeHtml(xianxiaProfile.essence || '本命靈獸')}</div>

      <div class="sc-keywords sc-xiantu-keywords">${keywordsHTML}</div>

      ${portraitHTML}

      <div class="sc-xiantu-panel">
        <div class="sc-xiantu-label">靈 獸 提 醒</div>
        <p>${escapeHtml(reminder)}</p>
      </div>
    </div>

    ${renderFooterHTML('掃 我 啟 動 本 命 仙 盤')}
  `;
}


// ============================================
// Template 2: 靈獸 × 生命靈數 合成卡（生命靈數整合 Phase E）
// 資料來源：window.NUMEROLOGY（Phase A）+ window.BEAST_NUMEROLOGY（Phase C）
// 圖檔備援鏈：{拼音}_{靈數}.png → master_{靈數}.png（卓越數）→ {拼音}_{基礎數}.png → 隱藏圖區
// ============================================
function renderBeastNumHTML() {
  const d = state.data || {};
  state.beastNumCalc = null;

  // 依賴與資料防禦：缺模組或缺生日時給出可讀的說明卡，不讓畫面空白
  if (!window.NUMEROLOGY || !window.BEAST_NUMEROLOGY || !d.birthYear || !d.birthMonth || !d.birthDay || !d.dayStem) {
    return `
      <div class="sc-brand">
        <span class="sc-brand-mark">本 命 仙 盤</span>
        <span class="sc-brand-tag">LINGSHOU</span>
      </div>
      <div class="sc2-content sc2-empty">
        <div class="sc2-kicker">靈 獸 × 靈 數</div>
        <p class="sc2-empty-text">缺少出生日期資料，請回到首頁重新排盤一次，即可生成這張卡。</p>
      </div>
      ${renderFooterHTML('掃 我 啟 動 本 命 仙 盤')}
    `;
  }

  const calc = window.NUMEROLOGY.calcLifePathNumber(d.birthYear, d.birthMonth, d.birthDay);
  if (!calc) {
    return `
      <div class="sc-brand">
        <span class="sc-brand-mark">本 命 仙 盤</span>
        <span class="sc-brand-tag">LINGSHOU</span>
      </div>
      <div class="sc2-content sc2-empty">
        <div class="sc2-kicker">靈 獸 × 靈 數</div>
        <p class="sc2-empty-text">生日資料異常，請回到首頁重新排盤。</p>
      </div>
      ${renderFooterHTML('掃 我 啟 動 本 命 仙 盤')}
    `;
  }
  state.beastNumCalc = calc;

  const syn = window.BEAST_NUMEROLOGY.getSynthesis(d.dayStem, calc.lifePath);
  const numProfile = window.NUMEROLOGY.getNumerologyProfile(calc.lifePath) || {};
  if (!syn) {
    return `
      <div class="sc-brand">
        <span class="sc-brand-mark">本 命 仙 盤</span>
        <span class="sc-brand-tag">LINGSHOU</span>
      </div>
      <div class="sc2-content sc2-empty">
        <div class="sc2-kicker">靈 獸 × 靈 數</div>
        <p class="sc2-empty-text">資料載入中，請關閉視窗後再試一次。</p>
      </div>
      ${renderFooterHTML('掃 我 啟 動 本 命 仙 盤')}
    `;
  }

  // 標籤列：一般靈數「甲木 × 生命靈數 3」；卓越數「甲木 × 卓越數 11／2」
  const labelText = calc.isMaster
    ? `${window.BEAST_NUMEROLOGY.DAY_MASTER_LABELS[d.dayStem]} × 卓越數 ${calc.displayLabel}`
    : `${window.BEAST_NUMEROLOGY.DAY_MASTER_LABELS[d.dayStem]} × 生命靈數 ${calc.lifePath}`;

  // 名稱列：一般「青木麟龍 · 探索幼蟲」；卓越「青木麟龍 × 螢火蟲 · 星光信使」
  const namesText = calc.isMaster
    ? `${syn.beastName} × ${numProfile.insectName || ''} · ${numProfile.masterTitle || ''}`
    : `${syn.beastName} · ${numProfile.stageName || ''}`;

  // 圖檔備援鏈
  const py = STEM_PINYIN[d.dayStem] || 'x';
  const dir = './assets/beast-numerology/';
  const srcs = [`${dir}${py}_${calc.lifePath}.png`];
  if (calc.isMaster) {
    srcs.push(`${dir}master_${calc.lifePath}.png`);
    srcs.push(`${dir}${py}_${calc.baseNumber}.png`);
  }
  const illustrationHTML = `
    <div class="sc2-illustration">
      <img src="${escapeHtml(srcs[0])}"
           data-srcs='${escapeHtml(JSON.stringify(srcs))}'
           data-i="0"
           alt="${escapeHtml(namesText)}"
           onerror="window.ShareCard._imgNext(this)">
    </div>
  `;

  const fieldsHTML = (syn.fields || []).map(f => `<span class="sc2-chip">${escapeHtml(f)}</span>`).join('');
  const luckyHTML = (syn.luckyElements || []).map(f => `<span class="sc2-chip sc2-chip-gold">${escapeHtml(f)}</span>`).join('');

  return `
    <div class="sc-brand">
      <span class="sc-brand-mark">本 命 仙 盤</span>
      <span class="sc-brand-tag">LINGSHOU</span>
    </div>

    <div class="sc2-content">
      <div class="sc2-kicker">我 的 靈 獸 × 靈 數</div>
      <div class="sc2-label">${escapeHtml(labelText)}</div>
      <div class="sc2-names">${escapeHtml(namesText)}</div>

      ${illustrationHTML}

      <div class="sc2-subtitle">${escapeHtml(syn.subtitle)}</div>

      <div class="sc-xiantu-panel sc2-panel">
        <div class="sc-xiantu-label">核 心 特 質</div>
        <p>${escapeHtml(syn.coreTrait)}</p>
      </div>

      <div class="sc-xiantu-panel sc2-panel">
        <div class="sc-xiantu-label">生 命 任 務</div>
        <p>${escapeHtml(syn.lifeMission)}</p>
      </div>

      <div class="sc2-chip-group">
        <div class="sc-xiantu-label">適 合 發 展 領 域</div>
        <div class="sc2-chips">${fieldsHTML}</div>
      </div>

      <div class="sc2-chip-group">
        <div class="sc-xiantu-label">幸 運 元 素</div>
        <div class="sc2-chips">${luckyHTML}</div>
      </div>

      <div class="sc-xiantu-panel sc-xiantu-panel-soft sc2-panel">
        <div class="sc-xiantu-label">給 你 的 提 醒</div>
        <p>${escapeHtml(syn.reminder)}</p>
      </div>
    </div>

    ${renderFooterHTML('掃 我 測 你 的 靈 獸 × 靈 數')}
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
