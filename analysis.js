/**
 * analysis.js — 姊姊感版分析報告渲染邏輯
 *
 * 6 段式報告骨架：
 *   一、命主特質（開場隱喻 + 三個誤解 + 點頭場景 + 陰影面）
 *   二、五行能量觀察（雷達圖 + 為什麼你感覺累/旺盛 + 真正需要的補充）
 *   三、人格畫像（主導/輔助 + 外在 vs 內在 + 人生劇本 + 核心張力 + 十神結構圖）
 *   四、流年運勢預警（為什麼這年重要 + 事件類型 + 最容易卡的地方）
 *   五、姊姊贈言（總結性的一句話）
 *   六、付費鉤子（具體到月份/面向，引導升級）
 *
 * 所有內容皆來自 data/*.js 的查表資料，零 AI 生成、零幻覺。
 */
(function() {
'use strict';

const Solar = window.Solar;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

function buildXianxiaProfile(result, analysisData, gender) {
  if (!window.XIANXIA_MAP || !window.BAZI_XIANXIA_PROFILE || typeof window.BAZI_XIANXIA_PROFILE.buildXianxiaProfile !== 'function') {
    console.warn('XIANXIA module not loaded');
    return null;
  }

  try {
    return window.BAZI_XIANXIA_PROFILE.buildXianxiaProfile({
      baziResult: {
        pillars: result.pillars,
        dayStem: analysisData.dayStem,
        dayElement: analysisData.dayElement,
        elementEnergy: analysisData.elementEnergy
      },
      gender: gender === 'female' ? 'female' : 'male'
    });
  } catch (e) {
    console.warn('XIANXIA profile build failed', e);
    return null;
  }
}

function renderXianxiaSummary(profile) {
  const cardEl = document.getElementById('cardXianxiaSummary');
  const contentEl = document.getElementById('xianxiaSummaryContent');
  if (!cardEl || !contentEl) return;

  if (!profile) {
    cardEl.hidden = true;
    contentEl.innerHTML = '';
    return;
  }

  const keywordsHtml = (profile.keywords || []).slice(0, 4).map(keyword =>
    `<span>${escapeHtml(keyword)}</span>`
  ).join('');

  contentEl.innerHTML = `
    <div class="xianxia-report-head">
      <div class="xianxia-report-kicker">本 命 靈 獸 摘 要</div>
      <div class="xianxia-report-title">${escapeHtml(profile.title)}</div>
      <div class="xianxia-report-root">本命靈根：${escapeHtml(profile.spiritRoot)}${profile.yinYang ? ' · ' + escapeHtml(profile.yinYang) : ''}</div>
    </div>
    <div class="xianxia-report-keywords">${keywordsHtml}</div>
    <div class="xianxia-report-grid">
      ${profile.essence ? `
      <div class="xianxia-report-item">
        <strong>本象與性格</strong>
        <p>${escapeHtml(profile.essence)}</p>
      </div>
      ` : ''}
      <div class="xianxia-report-item">
        <strong>命格天賦</strong>
        <p>${escapeHtml(profile.gift)}</p>
      </div>
      <div class="xianxia-report-item">
        <strong>成長課題</strong>
        <p>${escapeHtml(profile.challenge)}</p>
      </div>
      <div class="xianxia-report-item">
        <strong>五行靈氣提醒</strong>
        <p>${escapeHtml(profile.elementAuraSummary)}</p>
      </div>
    </div>
  `;
  cardEl.hidden = false;
}

function getFlowYearList() {
  return Object.keys(window.FLOW_YEAR_ELEMENTS || {}).map(Number).sort((a, b) => a - b);
}

function getClosestFlowYear(years, year) {
  if (!years.length) return year;
  if (year <= years[0]) return years[0];
  if (year >= years[years.length - 1]) return years[years.length - 1];
  return years.reduce((closest, candidate) =>
    Math.abs(candidate - year) < Math.abs(closest - year) ? candidate : closest
  , years[0]);
}

function getInitialFlowYear(params) {
  const years = getFlowYearList();
  const requestedYear = +params.fy;
  if (requestedYear && years.includes(requestedYear)) return requestedYear;

  const currentYear = new Date().getFullYear();
  if (years.includes(currentYear)) return currentYear;

  return getClosestFlowYear(years, currentYear);
}

/* ========= 段落 1：命主特質 ========= */
function renderDayMaster(dayStem) {
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

    <div class="dm-opening-metaphor">${profile.openingMetaphor}</div>

    <div class="dm-section">
      <div class="dm-section-title">這 份 特 質 的 另 一 面</div>
      <div class="shadow-block">
        <div class="shadow-label">⚠ 你需要看見的</div>
        ${profile.shadowSide}
      </div>
    </div>
  `;
}

/* ========= 段落 2：五行能量觀察 ========= */
function renderElementRadar(energy) {
  const order = ['wood','fire','earth','metal','water'];
  const colorMap = { wood:'#5A7A4E', fire:'#B85454', earth:'#B89569', metal:'#6F7378', water:'#4A5868' };
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
  [1, 0.66, 0.33].forEach(sc => {
    let pts = '';
    for (let i = 0; i < 5; i++) {
      const angle = startAngle + angleStep * i;
      const x = cx + maxR * sc * Math.cos(angle);
      const y = cy + maxR * sc * Math.sin(angle);
      pts += `${x.toFixed(1)},${y.toFixed(1)} `;
    }
    gridPolys += `<polygon points="${pts.trim()}" fill="none" stroke="#E8E2D5" stroke-width="1"/>`;
  });

  let axisLines = '';
  let labelTexts = '';
  const labelMap = { wood:'木', fire:'火', earth:'土', metal:'金', water:'水' };
  order.forEach((key, i) => {
    const angle = startAngle + angleStep * i;
    const x = cx + maxR * Math.cos(angle);
    const y = cy + maxR * Math.sin(angle);
    axisLines += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#E8E2D5" stroke-width="1"/>`;
    const labelX = cx + (maxR + 16) * Math.cos(angle);
    const labelY = cy + (maxR + 16) * Math.sin(angle) + 4;
    labelTexts += `<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="13" fill="${colorMap[key]}" font-family="Noto Serif TC, serif">${labelMap[key]}</text>`;
  });

  document.getElementById('elRadarWrap').innerHTML = `
    <svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" class="radar-svg" aria-label="五行能量雷達圖">
      ${gridPolys}${axisLines}
      <polygon points="${polyPoints.trim()}" fill="rgba(139,157,131,0.25)" stroke="#8B9D83" stroke-width="2"/>
      ${dots}${labelTexts}
    </svg>
  `;

  // 五行百分比摘要
  let summaryHtml = '';
  order.forEach(key => {
    const value = energy[key] || 0;
    summaryHtml += `
      <div>
        <div class="el-label el-${key}-text">${labelMap[key]}</div>
        <div class="el-value">${value.toFixed(1)}%</div>
      </div>
    `;
  });
  document.getElementById('elSummary').innerHTML = summaryHtml;
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

  const renderFeelingBlock = (profile, mode) => {
    const data = mode === 'excess' ? profile.excess : profile.deficient;
    const scenesHtml = data.scenes.map(s => `<div class="ef-scene">${s}</div>`).join('');
    return `
      <div class="element-feeling">
        <div class="ef-title">${profile.name}${mode === 'excess' ? '偏旺' : '偏弱'} · 你的日常感受</div>
        <div class="ef-feeling">${data.feeling}</div>
        <div class="ef-scenes">${scenesHtml}</div>
        <div class="ef-need">
          <div class="ef-need-label">→ 你真正需要的補充</div>
          ${data.need}
        </div>
      </div>
    `;
  };

  document.getElementById('elPersonality').innerHTML =
    renderFeelingBlock(strongProfile, 'excess') +
    renderFeelingBlock(weakProfile, 'deficient');
}

/* ========= 段落 3：人格畫像 ========= */
function renderPersona(topTwo) {
  const el = document.getElementById('personaContent');
  if (!topTwo || topTwo.length === 0) {
    el.innerHTML = '<p style="font-size: 15px;color:#7A756D">命局十神分布平均，未呈現明顯主導十神</p>';
    return;
  }

  const mainProfile = window.TEN_GODS_PROFILES[topTwo[0]];
  const subProfile = topTwo[1] ? window.TEN_GODS_PROFILES[topTwo[1]] : null;
  if (!mainProfile) return;

  // 主導/輔助 雙欄圖卡
  let dualCardHtml = '<div class="persona-dual">';
  dualCardHtml += `
    <div class="persona-side main">
      <div class="ps-role">主 導</div>
      <div class="ps-name">${mainProfile.name}</div>
      <div class="ps-cat">${mainProfile.category}</div>
    </div>
  `;
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
        <div class="ps-name" style="font-size: 16px;color:#7A756D">無顯著</div>
        <div class="ps-cat">命局十神結構偏單一</div>
      </div>
    `;
  }
  dualCardHtml += '</div>';

  // 主導十神的開場句
  const summaryHtml = `
    <div class="persona-summary">
      ${mainProfile.summary}
    </div>
  `;

  // 外在 vs 內在 雙欄
  const outerHtml = mainProfile.outerView.map(v => `<div class="pv-item">${v}</div>`).join('');
  const innerHtml = mainProfile.innerView.map(v => `<div class="pv-item">${v}</div>`).join('');
  const viewsHtml = `
    <div class="persona-views">
      <div class="persona-view-side outer">
        <div class="pv-label">別 人 眼 中 的 你</div>
        ${outerHtml}
      </div>
      <div class="persona-view-side inner">
        <div class="pv-label">你 自 己 知 道 的 你</div>
        ${innerHtml}
      </div>
    </div>
  `;

  // 核心張力
  const tensionHtml = `
    <div class="core-tension">
      <div class="ct-label">⚡ 你 最 該 注 意 的 內 在 矛 盾</div>
      ${mainProfile.coreTension}
    </div>
  `;

  el.innerHTML = dualCardHtml + summaryHtml + viewsHtml + tensionHtml;
}

/* ========= 段落 4：流年運勢預警 ========= */
function renderFlowYear(analysisData, currentYearParam) {
  const stripEl = document.getElementById('fyYearStrip');
  const contentEl = document.getElementById('fyContent');
  const years = getFlowYearList();
  const nowYear = new Date().getFullYear();
  const selectedYear = years.includes(currentYearParam)
    ? currentYearParam
    : getClosestFlowYear(years, currentYearParam || nowYear);

  // 流年快選列
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
  const activeYearCell = stripEl.querySelector('.fy-year-cell.active');
  if (activeYearCell && typeof activeYearCell.scrollIntoView === 'function') {
    activeYearCell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function renderFyContent(year) {
    const fy = window.BAZI_ENGINE.calculateFlowYearAnalysis(
      year, analysisData.dayStem, window.BRANCH_PROFILES, window.FLOW_YEAR_ELEMENTS
    );
    if (!fy) {
      contentEl.innerHTML = `<p style="font-size: 15px;color:#7A756D;text-align:center">${year} 年資料尚未收錄</p>`;
      return;
    }

    const stemTg = window.TEN_GODS_PROFILES[fy.stemTenGod];
    const branchTg = window.TEN_GODS_PROFILES[fy.branchTenGod];

    // 大字流年圖卡
    let html = `
      <div class="fy-highlight">
        <div class="fy-big">${fy.ganZhi}</div>
        <div class="fy-info">
          <div class="fy-y">${year} 年</div>
          <div class="fy-tg">${fy.stemTenGod}${fy.branchTenGod && fy.branchTenGod !== fy.stemTenGod ? ' · ' + fy.branchTenGod : ''}</div>
        </div>
      </div>
    `;

    // 為什麼這年對你重要
    const sameTg = (fy.stemTenGod === fy.branchTenGod);
    let whyText = '';
    if (sameTg && stemTg) {
      whyText = `${year} 年的能量單純而強烈——天干地支都偏向「${fy.stemTenGod}」的劇本。意思是：你會在這一年特別感受到「${stemTg.briefMeaning}」這個主題反覆出現。`;
    } else if (stemTg && branchTg) {
      whyText = `${year} 年的能量結構是「${fy.stemTenGod} + ${fy.branchTenGod}」的雙線並進——你會在「${stemTg.briefMeaning}」和「${branchTg.briefMeaning}」兩種劇本之間切換，這讓這一年比一般年份更複雜，但也更值得認真經營。`;
    } else if (stemTg) {
      whyText = `${year} 年主要的能量是「${fy.stemTenGod}」——${stemTg.summary}`;
    }

    if (whyText) {
      html += `
        <div class="fy-why">
          <div class="fy-why-label">${year} 年 · 你 的 劫 與 機 緣 從 何 而 來</div>
          ${whyText}
        </div>
      `;
    }

    // 具體會發生什麼（事件類型）— 從十神 outerView 抽取
    html += `<div class="fy-events"><div class="fy-why-label" style="margin-bottom:10px">劫 與 機 緣 · 具 體 場 景</div>`;
    if (stemTg) {
      html += `
        <div class="fy-event-item">
          <div class="fy-event-title">天機一 · 流年天干「${fy.stemTenGod}」帶來的場景</div>
          <div class="fy-event-desc">${stemTg.outerView[0]}；${stemTg.outerView[1]}。</div>
        </div>
      `;
    }
    if (branchTg && fy.branchTenGod !== fy.stemTenGod) {
      html += `
        <div class="fy-event-item">
          <div class="fy-event-title">天機二 · 流年地支「${fy.branchTenGod}」觸發的場景</div>
          <div class="fy-event-desc">${branchTg.outerView[0]}；${branchTg.outerView[1]}。</div>
        </div>
      `;
    }
    if (stemTg && stemTg.outerView[2]) {
      html += `
        <div class="fy-event-item">
          <div class="fy-event-title">天機三 · 整體感受</div>
          <div class="fy-event-desc">${stemTg.outerView[2]}${stemTg.outerView[3] ? '；' + stemTg.outerView[3] : ''}。</div>
        </div>
      `;
    }
    html += `</div>`;

    // 最容易卡住的地方
    if (stemTg && stemTg.coreTension) {
      html += `
        <div class="fy-blocks">
          <div class="fy-block-label">心 魔 劫 · 最 容 易 卡 住 的 地 方</div>
          <div class="fy-block-item">${stemTg.coreTension.split('。')[0]}。</div>
          ${stemTg.coreTension.split('。')[1] ? `<div class="fy-block-item">${stemTg.coreTension.split('。')[1]}。</div>` : ''}
          ${stemTg.coreTension.split('練習：')[1] ? `<div class="fy-block-item">本年練習方向：${stemTg.coreTension.split('練習：')[1]}</div>` : ''}
        </div>
      `;
    }

    contentEl.innerHTML = html;

    // 🔄 同步更新付費鉤子區塊（讓年份跟著流年切換）
    if (typeof window.renderPaywallSync === 'function') {
      window.renderPaywallSync(
        year,
        analysisData.dayStem,
        analysisData.topTwoTenGods,
        fy.ganZhi,
        fy.stemTenGod,
        fy.branchTenGod
      );
    }
  }

  renderFyContent(selectedYear);
  stripEl.querySelectorAll('.fy-year-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      stripEl.querySelectorAll('.fy-year-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      if (typeof cell.scrollIntoView === 'function') {
        cell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
      const newYear = +cell.dataset.year;
      renderFyContent(newYear);

      // GA4 追蹤年份切換
      if (typeof window.gtag === 'function') {
        try { window.gtag('event', 'flow_year_switch', { year: newYear }); } catch (e) {}
      }
    });
  });
}

/* ========= 段落 5：姊姊贈言 ========= */
function renderSisterWord(dayStem, topTwo) {
  const dmProfile = window.DAY_MASTER_PROFILES[dayStem];
  const mainTg = topTwo && topTwo[0] ? window.TEN_GODS_PROFILES[topTwo[0]] : null;
  if (!dmProfile) return;

  // 用日主隱喻 + 主導十神的特質，組合一段「姊姊贈言」
  const sentences = [];

  // 第一句：日主天性的肯定
  sentences.push(`你的存在本身就是「${dmProfile.imagery}」這種樣子——不需要變成別人，因為你已經是你。`);

  // 第二句：呼應主導十神的核心矛盾
  if (mainTg) {
    const tensionShort = mainTg.coreTension.split('練習：')[0].trim();
    sentences.push(`你最該知道的是：${tensionShort.replace(/。$/, '。')}`);
  }

  // 第三句：陰影面的接納
  const shadowFirst = dmProfile.shadowSide.split('。')[0];
  sentences.push(`${shadowFirst}。不是你的錯，是你的天性如此——但你已經夠好了。`);

  // 第四句：給予方向感
  sentences.push(`接下來的日子，記得：你不需要成為「更好的版本」，你只需要成為「更完整的自己」。`);

  document.getElementById('sisterContent').innerHTML = sentences.map(s => `<p style="margin-bottom:12px">${s}</p>`).join('');
}

/* ========= 段落 6：付費鉤子 ========= */
function renderPaywall(year, dayStem, topTwo, ganZhi, stemTenGod, branchTenGod) {
  const features = [];

  // 條目 1：流年三個關鍵月份
  features.push({
    icon: '01',
    text: `${year} 年三個關鍵月份的具體事件預測（${stemTenGod || '主要十神'}結構會在哪些月份特別活躍）`
  });

  // 條目 2：流月對應的決策建議
  features.push({
    icon: '02',
    text: `每個關鍵月份「該做什麼、該避開什麼」——具體到工作、合作、感情、健康四個面向`
  });

  // 條目 3：主導十神的深度解讀
  if (topTwo && topTwo[0]) {
    features.push({
      icon: '03',
      text: `「${topTwo[0]} + ${topTwo[1] || '單一'}」組合的完整人生劇本——包括 40 歲、50 歲、60 歲後的命運走向`
    });
  }

  // 條目 4：合夥與感情運的分析
  features.push({
    icon: '04',
    text: `${year} 年合夥契合度、感情關係的具體建議（哪些月份適合啟動、哪些月份要保留）`
  });

  // 條目 5：補運與化解
  features.push({
    icon: '05',
    text: `命局五行偏頗的化解方向——具體可執行的生活調整建議（不是補運品推銷）`
  });

  const featuresHtml = features.map(f => `
    <div class="paywall-feature">
      <span class="pf-icon">${f.icon}</span>
      <span>${f.text}</span>
    </div>
  `).join('');

  const paywallEl = document.getElementById('paywallContent');
  if (!paywallEl) return;

  paywallEl.innerHTML = `
    <div class="paywall-intro">
      免費版幫你看見了「你是什麼樣的人」<br>
      但 ${year} 年具體會發生什麼、什麼時候會發生<br>
      還沒講完
    </div>
    ${featuresHtml}
    <button class="paywall-cta" id="btnPaywall" disabled>
      解 鎖 ${year} 完 整 渡 劫 指 南
      <span class="pc-price">（即將開放 · 訂閱 Email 搶先通知）</span>
    </button>
  `;
}

// 暴露為全域函式，讓流年切換時可以同步呼叫
window.renderPaywallSync = renderPaywall;

function buildBaziAIChartData(params, result, analysisData, xianxiaProfile) {
  const flowYear = analysisData.flowYear || {};
  const flowThemes = [flowYear.stemTenGod, flowYear.branchTenGod].filter(Boolean);

  return {
    name: params.n || '命主',
    gender: params.g === 'female' ? 'female' : 'male',
    birth: {
      calendar: params.t || 'solar',
      year: +params.y || null,
      month: +params.m || null,
      day: +params.d || null,
      hour: +params.h || null,
      minute: +params.mi || 0,
      location: params.loc || null,
      solarDate: result.solarDate,
      lunarDate: result.lunarDate
    },
    pillars: result.pillars,
    bazi: {
      dayMaster: analysisData.dayStem,
      dayElement: analysisData.dayElement,
      selfStrength: analysisData.bodyStrength && analysisData.bodyStrength.type,
      supportRatio: analysisData.bodyStrength && analysisData.bodyStrength.supportRatio,
      fiveElements: analysisData.elementEnergy,
      tenGodsDistribution: analysisData.tenGodsDistribution,
      mainTenGod: analysisData.topTwoTenGods && analysisData.topTwoTenGods[0],
      supportTenGod: analysisData.topTwoTenGods && analysisData.topTwoTenGods[1]
    },
    annualFortune: flowYear.year
      ? {
          year: flowYear.year,
          ganZhi: flowYear.ganZhi,
          themes: flowThemes,
          elements: flowYear.elements,
          note: flowYear.note
        }
      : null,
    reportSummary: xianxiaProfile
      ? {
          title: xianxiaProfile.title,
          spiritRoot: xianxiaProfile.spiritRoot,
          talent: xianxiaProfile.gift,
          lesson: xianxiaProfile.challenge,
          reminder: xianxiaProfile.elementAuraSummary,
          keywords: xianxiaProfile.keywords
        }
      : null,
    analysisData: {
      selectedYear: analysisData.selectedYear,
      topTwoTenGods: analysisData.topTwoTenGods,
      bodyStrength: analysisData.bodyStrength,
      flowYear: analysisData.flowYear
    }
  };
}

async function askBaziAI({ chartData, question, mode }) {
  const res = await fetch('/api/bazi-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chartData,
      question,
      mode
    })
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok || !data || !data.success) {
    throw new Error((data && data.error) || '分析失敗，請稍後再試。');
  }

  return data.answer;
}

function initBaziAIChat(chartData, isPaid) {
  const cardEl = document.getElementById('cardBaziAIChat');
  const questionEl = document.getElementById('baziAIQuestion');
  const buttonEl = document.getElementById('baziAISubmit');
  const errorEl = document.getElementById('baziAIError');
  const answerEl = document.getElementById('baziAIAnswer');
  const answerBodyEl = document.getElementById('baziAIAnswerBody');
  const modeEl = document.getElementById('baziAIMode');

  if (!cardEl || !questionEl || !buttonEl || !errorEl || !answerEl || !answerBodyEl) return;

  // TODO: 串接付款狀態後，將 mode 改為 isPaid ? "paid" : "free"
  const mode = isPaid ? 'paid' : 'free';
  if (modeEl) modeEl.textContent = mode === 'paid' ? '目前為完整付費分析' : '目前為免費概要分析';

  const setError = message => {
    errorEl.textContent = message || '';
    errorEl.classList.toggle('show', Boolean(message));
  };

  const setAnswer = message => {
    answerBodyEl.textContent = message || '';
    answerEl.classList.toggle('show', Boolean(message));
  };

  const setLoading = loading => {
    questionEl.disabled = loading;
    buttonEl.disabled = loading;
    buttonEl.textContent = loading ? '正在解析你的命盤機緣...' : '開始分析';
  };

  buttonEl.addEventListener('click', async () => {
    const question = questionEl.value.trim();

    if (!question) {
      setError('請先輸入你想詢問的問題。');
      setAnswer('');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const answer = await askBaziAI({ chartData, question, mode });
      setAnswer(answer);
      if (typeof window.gtag === 'function') {
        try { window.gtag('event', 'bazi_ai_chat_success', { mode }); } catch (e) {}
      }
    } catch (err) {
      setError((err && err.message) || '分析失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  });
}

/* ========= 主初始化 ========= */
function init() {
  const params = parseHash();
  const result = calculatePillars(params);
  if (!result) { showError(); return; }
  const initialFlowYear = getInitialFlowYear(params);

  const analysisData = window.BAZI_ENGINE.buildAnalysisData(
    result.pillars,
    params.g || 'male',
    initialFlowYear,
    {
      BRANCH_PROFILES: window.BRANCH_PROFILES,
      FLOW_YEAR_ELEMENTS: window.FLOW_YEAR_ELEMENTS
    }
  );

  document.getElementById('reportContent').style.display = 'block';
  const displayName = params.n ? decodeURIComponent(params.n) : '命主';
  document.getElementById('rptName').textContent = displayName + ' · ' + (params.g === 'female' ? '女命' : '男命');
  document.getElementById('rptMeta').textContent = '國曆 ' + result.solarDate + ' · 農曆 ' + result.lunarDate;

  const xianxiaProfile = buildXianxiaProfile(result, analysisData, params.g);
  renderXianxiaSummary(xianxiaProfile);

  // 渲染六個段落
  renderDayMaster(analysisData.dayStem);
  renderElementRadar(analysisData.elementEnergy);
  renderBodyStrengthAndPersonality(analysisData.bodyStrength, analysisData.elementEnergy);
  renderPersona(analysisData.topTwoTenGods);

  renderFlowYear(analysisData, initialFlowYear);
  renderSisterWord(analysisData.dayStem, analysisData.topTwoTenGods);

  const fyForPaywall = window.BAZI_ENGINE.calculateFlowYearAnalysis(
    initialFlowYear, analysisData.dayStem, window.BRANCH_PROFILES, window.FLOW_YEAR_ELEMENTS
  );
  renderPaywall(
    initialFlowYear,
    analysisData.dayStem,
    analysisData.topTwoTenGods,
    fyForPaywall ? fyForPaywall.ganZhi : '',
    fyForPaywall ? fyForPaywall.stemTenGod : '',
    fyForPaywall ? fyForPaywall.branchTenGod : ''
  );

  const aiChartData = buildBaziAIChartData(params, result, analysisData, xianxiaProfile);
  initBaziAIChat(aiChartData, false);

  document.getElementById('btnBack').addEventListener('click', () => {
    if (document.referrer && document.referrer.indexOf(window.location.host) >= 0) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  });

  // PDF 下載
  const btnDownload = document.getElementById('btnDownload');
  if (btnDownload) {
    btnDownload.addEventListener('click', () => downloadPDF(displayName));
  }

  // PDF 頁尾日期
  const today = new Date();
  const dateStr = today.getFullYear() + '/' +
    String(today.getMonth() + 1).padStart(2, '0') + '/' +
    String(today.getDate()).padStart(2, '0');
  const pdfDateEl = document.getElementById('pdfGenDate');
  if (pdfDateEl) pdfDateEl.textContent = dateStr;
}

/**
 * 下載 PDF（瀏覽器原生列印）
 */
function downloadPDF(displayName) {
  const today = new Date();
  const dateStamp = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  const safeName = (displayName || '命主').replace(/[\\/:*?"<>|]/g, '_');

  const originalTitle = document.title;
  document.title = `八字命盤_${safeName}_${dateStamp}`;

  showPrintGuide(() => {
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', 'download_pdf', { method: 'browser_print' }); } catch (e) {}
    }
  });
}

function showPrintGuide(callback) {
  const overlay = document.getElementById('pdfOverlay');
  if (!overlay) { callback(); return; }
  const inner = overlay.querySelector('.pdf-overlay-inner');
  inner.innerHTML = `
    <div style="font-family:'Noto Serif TC',serif;font-size: 21px;color:#3D3A36;letter-spacing:2px;margin-bottom:12px">
      準 備 開 啟 列 印 視 窗
    </div>
    <div style="font-size: 15px;color:#7A756D;line-height:1.9;margin-bottom:14px">
      請在列印對話框中：<br>
      <b style="color:#C9A87C">「目的地」選擇「另存為 PDF」</b>，<br>
      然後點「儲存」即可下載
    </div>
    <div style="font-size: 13px;color:#8A857F;letter-spacing:1px">3 秒後自動開啟…</div>
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
