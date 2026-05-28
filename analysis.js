/**
 * analysis.js — 詳細分析頁面渲染邏輯
 * 
 * 工作流程：
 * 1. 從 URL hash 讀取命盤資料 (例: #y=1990&m=6&d=15&h=13&g=male&t=solar)
 * 2. 用 lunar-javascript 重新計算四柱
 * 3. 呼叫 BAZI_ENGINE 產生分析資料
 * 4. 渲染五個報告卡片
 */
(function() {
'use strict';

const Solar = window.Solar;

function parseHash() {
  const hash = window.location.hash.replace(/^#/, '');
  const params = {};
  hash.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k && v !== undefined) params[k] = decodeURIComponent(v);
  });
  return params;
}

function calculatePillars(params) {
  const year   = +params.y;
  const month  = +params.m;
  const day    = +params.d;
  const hour   = +params.h;
  const minute = +params.mi || 0;
  const calendar = params.t || 'solar';

  if (!year || !month || !day) return null;

  let solar;
  try {
    if (calendar === 'lunar' && window.Lunar) {
      const lunar = window.Lunar.fromYmdHms(year, month, day, hour, minute, 0);
      solar = lunar.getSolar();
    } else {
      solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    }
    const ec = solar.getLunar().getEightChar();
    return {
      pillars: {
        year:  { stem: ec.getYearGan(),  branch: ec.getYearZhi()  },
        month: { stem: ec.getMonthGan(), branch: ec.getMonthZhi() },
        day:   { stem: ec.getDayGan(),   branch: ec.getDayZhi()   },
        hour:  { stem: ec.getTimeGan(),  branch: ec.getTimeZhi()  }
      },
      solarDate: solar.toYmd(),
      lunarDate: solar.getLunar().toString().split(' ')[0]
    };
  } catch (e) {
    return null;
  }
}

function showError() {
  document.getElementById('errBox').classList.add('show');
  document.getElementById('reportContent').style.display = 'none';
}

function renderDayMaster(dayStem, data) {
  const profile = window.DAY_MASTER_PROFILES[dayStem];
  if (!profile) return;
  const el = document.getElementById('dmContent');
  const keywordsHtml = profile.keywords.map(k => `<span>${k}</span>`).join('');
  el.innerHTML = `
    <div class="dm-imagery">
      <div class="stem-big el-${profile.element}-text">${profile.stem}</div>
      <div class="img-title">${profile.imagery}</div>
      <div class="img-sub">${profile.elementName} · 日柱日主</div>
    </div>
    <div class="dm-keywords">${keywordsHtml}</div>
    <div class="cat-block">
      <div class="cat-label">核 心 本 質</div>
      <div class="cat-item"><span class="cat-bullet b-info">·</span><span>${profile.coreIdentity}</span></div>
    </div>
    <div class="cat-block">
      <div class="cat-label">天 性 特 質</div>
      <div class="cat-item"><span class="cat-bullet b-info">·</span><span>${profile.nature}</span></div>
    </div>
    <div class="cat-block">
      <div class="cat-label">優 勢 面</div>
      <div class="cat-item"><span class="cat-bullet b-pos">+</span><span>${profile.strengths}</span></div>
    </div>
    <div class="cat-block">
      <div class="cat-label">需 留 意</div>
      <div class="cat-item"><span class="cat-bullet b-warn">!</span><span>${profile.challenges}</span></div>
    </div>
  `;
}

function renderElementRadar(energy) {
  const labels = ['木','火','土','金','水'];
  const keys = ['wood','fire','earth','土','metal','water'];
  const colorMap = { wood:'#5A7A4E', fire:'#B85454', earth:'#B89569', metal:'#6F7378', water:'#4A5868' };
  const order = ['wood','fire','earth','metal','water'];

  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;
  const cx = 150, cy = 130, maxR = 90;

  const maxVal = Math.max(...order.map(k => energy[k] || 0));
  const scale = maxVal > 0 ? maxR / Math.max(maxVal, 30) : 1;

  let polyPoints = '';
  let dots = '';
  order.forEach((key, i) => {
    const angle = startAngle + angleStep * i;
    const value = energy[key] || 0;
    const r = value * scale;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    polyPoints += `${x.toFixed(1)},${y.toFixed(1)} `;
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${colorMap[key]}"/>`;
  });

  let gridPolys = '';
  [1, 0.66, 0.33].forEach(scale => {
    let pts = '';
    for (let i = 0; i < 5; i++) {
      const angle = startAngle + angleStep * i;
      const x = cx + maxR * scale * Math.cos(angle);
      const y = cy + maxR * scale * Math.sin(angle);
      pts += `${x.toFixed(1)},${y.toFixed(1)} `;
    }
    gridPolys += `<polygon points="${pts.trim()}" fill="none" stroke="#E8E2D5" stroke-width="1"/>`;
  });

  let axisLines = '';
  let labelTexts = '';
  order.forEach((key, i) => {
    const angle = startAngle + angleStep * i;
    const x = cx + maxR * Math.cos(angle);
    const y = cy + maxR * Math.sin(angle);
    axisLines += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#E8E2D5" stroke-width="1"/>`;
    const labelX = cx + (maxR + 16) * Math.cos(angle);
    const labelY = cy + (maxR + 16) * Math.sin(angle) + 4;
    const label = { wood:'木', fire:'火', earth:'土', metal:'金', water:'水' }[key];
    labelTexts += `<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="13" fill="${colorMap[key]}" font-family="Noto Serif TC, serif">${label}</text>`;
  });

  const svg = `
    <svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" class="radar-svg" aria-label="五行能量雷達圖">
      ${gridPolys}
      ${axisLines}
      <polygon points="${polyPoints.trim()}" fill="rgba(139,157,131,0.25)" stroke="#8B9D83" stroke-width="2"/>
      ${dots}
      ${labelTexts}
    </svg>
  `;
  document.getElementById('elRadarWrap').innerHTML = svg;

  const summaryEl = document.getElementById('elSummary');
  const elNames = { wood:'木', fire:'火', earth:'土', metal:'金', water:'水' };
  let summaryHtml = '';
  order.forEach(key => {
    const value = energy[key] || 0;
    summaryHtml += `
      <div>
        <div class="el-label el-${key}-text">${elNames[key]}</div>
        <div class="el-value">${value.toFixed(1)}%</div>
      </div>
    `;
  });
  summaryEl.innerHTML = summaryHtml;
}

function renderBodyStrengthAndPersonality(bodyStrength, energy) {
  document.getElementById('bodyStrength').textContent = '命格 · ' + bodyStrength.type;

  const order = ['wood','fire','earth','metal','water'];
  const sorted = [...order].sort((a, b) => (energy[b] || 0) - (energy[a] || 0));
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const strongProfile = window.ELEMENT_PERSONALITY[strongest];
  const weakProfile = window.ELEMENT_PERSONALITY[weakest];

  if (!strongProfile || !weakProfile) return;
  
  const elPersonalityEl = document.getElementById('elPersonality');
  elPersonalityEl.innerHTML = `
    <div class="cat-block">
      <div class="cat-label">命 局 能 量 觀 察</div>
      <div class="cat-item"><span class="cat-bullet b-pos">+</span><span><b>${strongProfile.name}</b> 偏旺：${strongProfile.excess}</span></div>
      <div class="cat-item"><span class="cat-bullet b-warn">-</span><span><b>${weakProfile.name}</b> 偏弱：${weakProfile.deficient}</span></div>
    </div>
  `;
}

function renderTenGodsBars(distribution) {
  const sortedEntries = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  if (sortedEntries.length === 0) {
    document.getElementById('tgBars').innerHTML = '<p style="text-align:center;color:#7A756D;font-size:13px">命盤十神統計中</p>';
    return;
  }
  const maxCount = sortedEntries[0][1];
  let html = '';
  sortedEntries.forEach(([name, count]) => {
    const pct = (count / maxCount) * 100;
    html += `
      <div class="tg-bar-row">
        <span class="tg-name">${name}</span>
        <div class="tg-bar"><div class="tg-bar-fill" style="width:${pct}%"></div></div>
        <span class="tg-count">${count}</span>
      </div>
    `;
  });
  document.getElementById('tgBars').innerHTML = html;
}

function renderPersona(topTwo) {
  if (!topTwo || topTwo.length === 0) {
    document.getElementById('personaContent').innerHTML = '<p style="font-size:13px;color:#7A756D">命局十神分布平均，未呈現明顯主導十神</p>';
    return;
  }

  const mainProfile = window.TEN_GODS_PROFILES[topTwo[0]];
  const subProfile = topTwo[1] ? window.TEN_GODS_PROFILES[topTwo[1]] : null;

  let dualCardHtml = '<div class="persona-dual">';
  if (mainProfile) {
    dualCardHtml += `
      <div class="persona-side main">
        <div class="ps-role">主 導</div>
        <div class="ps-name">${mainProfile.name}</div>
        <div class="ps-cat">${mainProfile.category}</div>
      </div>
    `;
  }
  if (subProfile) {
    dualCardHtml += `
      <div class="persona-side sub">
        <div class="ps-role">輔 助</div>
        <div class="ps-name">${subProfile.name}</div>
        <div class="ps-cat">${subProfile.category}</div>
      </div>
    `;
  } else {
    dualCardHtml += `
      <div class="persona-side sub">
        <div class="ps-role">輔 助</div>
        <div class="ps-name" style="font-size:14px;color:#7A756D">無顯著</div>
        <div class="ps-cat">命局十神結構偏單一</div>
      </div>
    `;
  }
  dualCardHtml += '</div>';

  let blocksHtml = '';
  topTwo.forEach((tgName, idx) => {
    const profile = window.TEN_GODS_PROFILES[tgName];
    if (!profile) return;

    const strengthsHtml = profile.strengths.map(s =>
      `<div class="cat-item"><span class="cat-bullet b-pos">+</span><span>${s}</span></div>`
    ).join('');
    const weaknessesHtml = profile.weaknesses.map(w =>
      `<div class="cat-item"><span class="cat-bullet b-warn">!</span><span>${w}</span></div>`
    ).join('');
    const remindersHtml = profile.reminder.map(r =>
      `<div class="cat-item"><span class="cat-bullet b-think">→</span><span>${r}</span></div>`
    ).join('');

    blocksHtml += `
      <div class="cat-block">
        <div class="cat-label">${idx === 0 ? '主 導 十 神' : '輔 助 十 神'} · ${tgName}（${profile.category}）</div>
        <div class="cat-item"><span class="cat-bullet b-info">·</span><span>${profile.summary}</span></div>
      </div>
      <div class="cat-block">
        <div class="cat-label">優 點</div>
        ${strengthsHtml}
      </div>
      <div class="cat-block">
        <div class="cat-label">缺 點</div>
        ${weaknessesHtml}
      </div>
      <div class="cat-block">
        <div class="cat-label">提 醒</div>
        ${remindersHtml}
      </div>
    `;
  });

  document.getElementById('personaContent').innerHTML = `
    ${dualCardHtml}
    <div class="persona-summary">
      綜合畫像取自命盤中前兩個出現最多的十神，作為判斷個性特質的依據
    </div>
    ${blocksHtml}
  `;
}

function renderFlowYear(analysisData, currentYearParam) {
  const stripEl = document.getElementById('fyYearStrip');
  const contentEl = document.getElementById('fyContent');
  const years = Object.keys(window.FLOW_YEAR_ELEMENTS).map(Number).sort();
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const nowYear = new Date().getFullYear();
  const selectedYear = Math.min(maxYear, Math.max(minYear, currentYearParam || nowYear));

  let stripHtml = '';
  years.forEach(y => {
    const d = window.FLOW_YEAR_ELEMENTS[y];
    const isActive = y === selectedYear;
    stripHtml += `
      <div class="fy-year-cell ${isActive ? 'active' : ''}" data-year="${y}">
        <div class="y-label">${y}</div>
        <div class="gz">${d.ganZhi}</div>
      </div>
    `;
  });
  stripEl.innerHTML = stripHtml;

  function renderFyContent(year) {
    const fy = window.BAZI_ENGINE.calculateFlowYearAnalysis(
      year,
      analysisData.dayStem,
      window.BRANCH_PROFILES,
      window.FLOW_YEAR_ELEMENTS
    );
    if (!fy) {
      contentEl.innerHTML = `<p style="font-size:13px;color:#7A756D;text-align:center">${year} 年資料尚未收錄</p>`;
      return;
    }

    const stemTgProfile = window.TEN_GODS_PROFILES[fy.stemTenGod];
    const branchTgProfile = window.TEN_GODS_PROFILES[fy.branchTenGod];

    let html = `
      <div class="fy-highlight">
        <div class="fy-big">${fy.ganZhi}</div>
        <div class="fy-info">
          <div class="fy-y">${year} 年</div>
          <div class="fy-tg">${fy.stemTenGod}${fy.branchTenGod && fy.branchTenGod !== fy.stemTenGod ? ' · ' + fy.branchTenGod : ''}</div>
        </div>
      </div>
      <div class="cat-block">
        <div class="cat-label">該 年 五 行</div>
        <div class="cat-item"><span class="cat-bullet b-info">·</span><span>${fy.elements.map(e => window.ELEMENT_NAMES[e]).join('、')}${fy.note ? '（' + fy.note + '）' : ''}</span></div>
      </div>
    `;
    if (stemTgProfile) {
      html += `
        <div class="cat-block">
          <div class="cat-label">流 年 天 干 · ${fy.flowStem}（對日主：${fy.stemTenGod}）</div>
          <div class="cat-item"><span class="cat-bullet b-info">·</span><span>${stemTgProfile.summary}</span></div>
          <div class="cat-item"><span class="cat-bullet b-pos">+</span><span>本年運勢面：${stemTgProfile.briefMeaning}</span></div>
        </div>
      `;
    }
    if (branchTgProfile && fy.branchTenGod !== fy.stemTenGod) {
      html += `
        <div class="cat-block">
          <div class="cat-label">流 年 地 支 · ${fy.flowBranch}（對日主：${fy.branchTenGod}）</div>
          <div class="cat-item"><span class="cat-bullet b-info">·</span><span>${branchTgProfile.summary}</span></div>
          <div class="cat-item"><span class="cat-bullet b-pos">+</span><span>本年運勢面：${branchTgProfile.briefMeaning}</span></div>
        </div>
      `;
    }
    if (stemTgProfile && stemTgProfile.reminder.length > 0) {
      html += `
        <div class="cat-block">
          <div class="cat-label">本 年 宜 留 意</div>
          ${stemTgProfile.reminder.slice(0, 2).map(r =>
            `<div class="cat-item"><span class="cat-bullet b-warn">!</span><span>${r}</span></div>`
          ).join('')}
        </div>
      `;
    }
    contentEl.innerHTML = html;
  }
  renderFyContent(selectedYear);

  stripEl.querySelectorAll('.fy-year-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      stripEl.querySelectorAll('.fy-year-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      renderFyContent(+cell.dataset.year);
    });
  });
}

function init() {
  const params = parseHash();
  const result = calculatePillars(params);
  if (!result) { showError(); return; }

  const analysisData = window.BAZI_ENGINE.buildAnalysisData(
    result.pillars,
    params.g || 'male',
    +params.fy || new Date().getFullYear(),
    {
      BRANCH_PROFILES: window.BRANCH_PROFILES,
      FLOW_YEAR_ELEMENTS: window.FLOW_YEAR_ELEMENTS
    }
  );

  document.getElementById('reportContent').style.display = 'block';
  const displayName = params.n ? decodeURIComponent(params.n) : '命主';
  document.getElementById('rptName').textContent = displayName + ' · ' + (params.g === 'female' ? '女命' : '男命');
  document.getElementById('rptMeta').textContent = '國曆 ' + result.solarDate + ' · 農曆 ' + result.lunarDate;

  renderDayMaster(analysisData.dayStem, analysisData);
  renderElementRadar(analysisData.elementEnergy);
  renderBodyStrengthAndPersonality(analysisData.bodyStrength, analysisData.elementEnergy);
  renderTenGodsBars(analysisData.tenGodsDistribution);
  renderPersona(analysisData.topTwoTenGods);
  renderFlowYear(analysisData, +params.fy || new Date().getFullYear());

  document.getElementById('btnBack').addEventListener('click', () => {
    if (document.referrer && document.referrer.indexOf(window.location.host) >= 0) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  });

  // PDF 下載按鈕（使用瀏覽器原生列印功能）
  const btnDownload = document.getElementById('btnDownload');
  if (btnDownload) {
    btnDownload.addEventListener('click', () => downloadPDF(displayName));
  }

  // 把報告生成日期寫入 PDF 頁尾
  const today = new Date();
  const dateStr = today.getFullYear() + '/' +
    String(today.getMonth() + 1).padStart(2, '0') + '/' +
    String(today.getDate()).padStart(2, '0');
  const pdfDateEl = document.getElementById('pdfGenDate');
  if (pdfDateEl) pdfDateEl.textContent = dateStr;
}

/**
 * 下載 PDF 報告（使用瀏覽器原生列印 → 另存為 PDF）
 * 
 * 優點：
 * - 完美支援中文字型（使用使用者系統字型）
 * - SVG 圖表向量繪製，無損
 * - 分頁由瀏覽器智慧處理
 * - 檔案小（200-500KB）
 * - 零外部依賴
 * 
 * 流程：
 * 1. 自動設定瀏覽器列印標題（會成為預設檔名）
 * 2. 觸發 window.print()
 * 3. 使用者在列印對話框選「另存為 PDF」即可
 */
function downloadPDF(displayName) {
  // 1. 設定瀏覽器列印標題（會作為預設 PDF 檔名）
  const today = new Date();
  const dateStamp = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  const safeName = (displayName || '命主').replace(/[\\/:*?"<>|]/g, '_');
  
  const originalTitle = document.title;
  document.title = `八字命盤_${safeName}_${dateStamp}`;

  // 2. 顯示提示遮罩 0.4 秒（讓使用者知道在做什麼）
  showPrintGuide(() => {
    // 3. 觸發列印
    window.print();
    
    // 4. 列印對話框關閉後還原標題
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);

    // GA4 追蹤
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', 'download_pdf', { method: 'browser_print' }); } catch (e) {}
    }
  });
}

/**
 * 顯示「列印 PDF 操作引導」提示
 * 讓使用者知道：在列印對話框中選「另存為 PDF」
 */
function showPrintGuide(callback) {
  const overlay = document.getElementById('pdfOverlay');
  const inner = overlay.querySelector('.pdf-overlay-inner');
  
  // 替換內容為引導訊息
  inner.innerHTML = `
    <div style="font-family:'Noto Serif TC',serif;font-size:18px;color:#3D3A36;letter-spacing:2px;margin-bottom:12px">
      準 備 開 啟 列 印 視 窗
    </div>
    <div style="font-size:13px;color:#7A756D;line-height:1.9;margin-bottom:14px">
      請在列印對話框中：<br>
      <b style="color:#C9A87C">「目的地」選擇「另存為 PDF」</b>，<br>
      然後點「儲存」即可下載
    </div>
    <div style="font-size:11px;color:#8A857F;letter-spacing:1px">
      3 秒後自動開啟…
    </div>
  `;
  
  overlay.classList.add('show');

  setTimeout(() => {
    overlay.classList.remove('show');
    callback();
  }, 2500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
