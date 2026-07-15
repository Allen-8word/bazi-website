/**
 * analysis.js — 姊姊感版分析報告渲染邏輯（v12.0，2026-07 改版）
 *
 * 報告骨架：
 *   開場、本命靈獸摘要（含靈獸主圖 + 五行靈氣日常感受，原「五行能量觀察」描述已併入）
 *   一、人格畫像（主導/輔助 + 外在 vs 內在 + 核心張力）
 *   二、流年天劫與機緣（為什麼這年重要 + 事件類型 + 最容易卡的地方）
 *   三、生命靈數（data/numerology-report.js 查表 + 靈獸×靈數合成文案）
 *   四、給你的一句話（姊姊贈言，折衷版語氣）
 *   尾、LINE 社群導流卡（原付費鉤子改造；LINE_COMMUNITY_URL 留空時整卡不渲染）
 *
 * v12.0 移除：命主特質區塊、五行雷達圖與百分比、付費鉤子（含 renderPaywallSync 流年連動）。
 * 所有內容皆來自 data/*.js 的查表資料，零 AI 生成、零幻覺。
 */
(function() {
'use strict';

const Solar = window.Solar;

/* 🔗 LINE 社群邀請連結：拿到連結後填入這裡並重新部署即可上線導流卡。
 *    留空字串 = 導流卡完全不渲染，報告結束在「給你的一句話」。 */
const LINE_COMMUNITY_URL = '';

/* 靈獸圖檔拼音對照（與 share-card.js 一致） */
const STEM_PINYIN = {
  '甲': 'jia', '乙': 'yi', '丙': 'bing', '丁': 'ding', '戊': 'wu',
  '己': 'ji', '庚': 'geng', '辛': 'xin', '壬': 'ren', '癸': 'gui'
};

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

function buildBeastPortraitHtml(dayStem, numProfile) {
  const py = STEM_PINYIN[dayStem];
  if (!py || !numProfile || !numProfile.number) return '';
  const base = `/assets/beast-numerology/${py}_${numProfile.number}`;
  /* webp 優先、png 備援、都失敗則整張圖移除（與分享卡取圖鏈一致的降級精神） */
  return `<img class="xianxia-report-portrait" src="${base}.webp" alt="本命靈獸圖"
    onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src='${base}.png';}else{this.remove();}">`;
}

/* 原「五行能量觀察」的日常感受描述，改以靈獸靈氣敘事併入摘要卡（2026-07 改版） */
function buildElementAuraHtml(bodyStrength, energy) {
  if (!bodyStrength || !energy || !window.ELEMENT_PERSONALITY) return '';

  const order = ['wood','fire','earth','metal','water'];
  const sorted = [...order].sort((a, b) => (energy[b] || 0) - (energy[a] || 0));
  const strongProfile = window.ELEMENT_PERSONALITY[sorted[0]];
  const weakProfile = window.ELEMENT_PERSONALITY[sorted[sorted.length - 1]];
  if (!strongProfile || !weakProfile) return '';

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

  return `
    <div class="xianxia-aura-title">靈 獸 的 靈 氣 底 色</div>
    <div class="xianxia-aura-lead">你的靈獸帶著「${escapeHtml(strongProfile.name)}偏旺、${escapeHtml(weakProfile.name)}偏弱」的靈氣底色（命格 · ${escapeHtml(bodyStrength.type)}）。這份底色會直接反映在你的日常感受裡：</div>
    ${renderFeelingBlock(strongProfile, 'excess')}
    ${renderFeelingBlock(weakProfile, 'deficient')}
  `;
}

function renderXianxiaSummary(profile, numProfile, bodyStrength, energy) {
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
      ${buildBeastPortraitHtml(profile.dayStem, numProfile)}
      <div class="xianxia-report-title">${escapeHtml(profile.title)}</div>
      <div class="xianxia-report-root">五行靈根：${escapeHtml(profile.spiritRoot)}${profile.yinYang ? ' · ' + escapeHtml(profile.yinYang) : ''}</div>
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
    ${buildElementAuraHtml(bodyStrength, energy)}
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

/* ========= （2026-07 移除）段落「命主特質」與「五行能量觀察」 =========
 * 命主特質：整塊刪除（DAY_MASTER_PROFILES 仍供姊姊贈言使用，資料檔保留）。
 * 五行能量觀察：雷達圖與百分比刪除；日常感受描述改由 buildElementAuraHtml 併入靈獸摘要卡。
 */

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
    // （2026-07 移除）原付費鉤子的流年連動已隨區塊改造拆除，LINE 導流卡為靜態內容
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

  // 用日主隱喻 + 主導十神的特質，組合一段「姊姊贈言」（折衷版語氣：短句、去說教、可引用）
  const sentences = [];

  // 第一句：日主天性的肯定
  sentences.push(`你是「${dmProfile.imagery}」。這個樣子，本來就很好。`);

  // 第二句：呼應主導十神的核心矛盾
  if (mainTg) {
    const tensionShort = mainTg.coreTension.split('練習：')[0].trim();
    sentences.push(`有件事想跟你說：${tensionShort.replace(/。$/, '。')}`);
  }

  // 第三句：陰影面的接納
  const shadowFirst = dmProfile.shadowSide.split('。')[0];
  sentences.push(`${shadowFirst}。這不是缺點，是你的一部分。`);

  // 第四句：給予方向感
  sentences.push(`接下來，不用急著變好。把自己活得更完整，就夠了。`);

  document.getElementById('sisterContent').innerHTML = sentences.map(s => `<p style="margin-bottom:12px">${s}</p>`).join('');
}

/* ========= 段落 3：生命靈數（2026-07 新增章節） ========= */
function renderNumerology(numProfile, dayStem) {
  const cardEl = document.getElementById('cardNumerology');
  const contentEl = document.getElementById('numerologyContent');
  if (!cardEl || !contentEl) return;

  const R = window.NUMEROLOGY_REPORT;
  const entry = (numProfile && R && R.ENTRIES) ? R.ENTRIES[numProfile.number] : null;
  if (!entry) { cardEl.hidden = true; contentEl.innerHTML = ''; return; }

  const listHtml = (items) => (items || []).map(t =>
    `<div class="num-list-item">${escapeHtml(t)}</div>`
  ).join('');

  const block = (title, inner) => `
    <div class="num-block">
      <div class="num-block-title">${title}</div>
      ${inner}
    </div>
  `;

  let html = `
    <div class="num-head">
      <div class="num-label">${escapeHtml(entry.displayLabel)}</div>
      <div class="num-name">${escapeHtml(entry.name)}</div>
      <div class="num-role">${escapeHtml(entry.role)}</div>
    </div>
  `;

  if (entry.isMaster) {
    /* 卓越數呈現順序（依知識庫顯示邏輯）：先基礎數功課 → 內在拉扯 → 天賦/盲點/課題 → 高階使命，避免神化 */
    html += block(`先 從 ${entry.baseNumber} 的 功 課 說 起`, `<div class="num-positioning">${escapeHtml(entry.baseIntro)}</div>`);
    html += block('你 的 內 在 拉 扯', `<div class="num-positioning">${escapeHtml(entry.innerConflict)}</div>`);
  } else {
    html += block('原 型 定 位', `<div class="num-positioning">${escapeHtml(entry.positioning)}</div>`);
  }

  html += block('你 的 天 賦', listHtml(entry.strengths));
  html += block('容 易 卡 住 的 地 方', listHtml(entry.blindspots));
  html += block('給 你 的 課 題', listHtml(entry.lessons));

  if (entry.isMaster) {
    html += block('高 階 使 命', `<div class="num-positioning">${escapeHtml(entry.mission)}</div>`);
  }

  html += `<div class="num-slogan">「${escapeHtml(entry.slogan.replace(/。$/, ''))}」</div>`;

  /* 靈獸 × 靈數合成文案（查表帶入既有 130 組，與分享卡同源） */
  const syn = (window.BEAST_NUMEROLOGY && dayStem)
    ? window.BEAST_NUMEROLOGY.getSynthesis(dayStem, numProfile.number)
    : null;
  if (syn) {
    html += `
      <div class="num-synthesis">
        <div class="ns-kicker">你 的 靈 獸 × 你 的 靈 數</div>
        <div class="ns-title">${escapeHtml(syn.beastName)} × ${escapeHtml(entry.displayLabel)}｜${escapeHtml(syn.subtitle)}</div>
        <p>${escapeHtml(syn.coreTrait)}</p>
        <p>${escapeHtml(syn.lifeMission)}</p>
        <p>${escapeHtml(syn.reminder)}</p>
      </div>
    `;
  }

  const footnoteHtml = (R.FOOTNOTE || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
  html += `<div class="num-footnote">${footnoteHtml}</div>`;
  html += `<div class="rpt-source">${escapeHtml(R.SOURCE_LABEL)}</div>`;

  contentEl.innerHTML = html;
  cardEl.hidden = false;
}

/* ========= 尾段：LINE 社群導流卡（2026-07，原付費鉤子改造） ========= */
function renderLineCommunity() {
  const cardEl = document.getElementById('cardPaywall');
  const contentEl = document.getElementById('paywallContent');
  if (!cardEl || !contentEl) return;

  /* 連結未填時整卡不渲染，避免死按鈕傷害信任 */
  if (!LINE_COMMUNITY_URL) {
    cardEl.hidden = true;
    contentEl.innerHTML = '';
    return;
  }

  contentEl.innerHTML = `
    <div class="paywall-intro">
      這份報告能告訴你性格的形狀、能量的走向。<br>
      但有些問題，光看報告不會有答案——
    </div>
    <div class="line-questions">
      <div class="line-question">「這份工作，該不該換？」</div>
      <div class="line-question">「這段關係，還要不要繼續？」</div>
      <div class="line-question">「今年，適合開始新的東西嗎？」</div>
    </div>
    <div class="paywall-intro">
      這種沒有標準答案的題目，適合慢慢聊。<br>
      我開了一個 LINE 社群，每週分享靈獸視角的能量提醒；<br>
      想深入看自己的盤，社群裡也能預約一對一。
    </div>
    <a class="paywall-cta" id="btnLineCommunity" href="${LINE_COMMUNITY_URL}" target="_blank" rel="noopener">
      免 費 加 入 LINE 社 群
    </a>
    <div class="line-cta-note">一對一採預約制，細節在社群置頂</div>
  `;
  cardEl.hidden = false;

  /* 點擊追蹤：GA / Meta Pixel 有裝就送事件，沒裝就靜默（對應年度目標的數據迴圈） */
  const btn = document.getElementById('btnLineCommunity');
  if (btn) {
    btn.addEventListener('click', () => {
      if (typeof window.gtag === 'function') {
        try { window.gtag('event', 'line_community_click', { placement: 'report_end' }); } catch (e) {}
      }
      if (typeof window.fbq === 'function') {
        try { window.fbq('trackCustom', 'line_community_click', { placement: 'report_end' }); } catch (e) {}
      }
    });
  }
}

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

  /* 生命靈數：與 app.js/分享卡使用同一組輸入生日值，確保三處數字與靈獸圖一致 */
  const numProfile = (window.NUMEROLOGY && params.y && params.m && params.d)
    ? window.NUMEROLOGY.getProfileByBirthday(+params.y, +params.m, +params.d)
    : null;

  const xianxiaProfile = buildXianxiaProfile(result, analysisData, params.g);
  renderXianxiaSummary(xianxiaProfile, numProfile, analysisData.bodyStrength, analysisData.elementEnergy);

  // 渲染報告段落（v12.0 結構）
  renderPersona(analysisData.topTwoTenGods);
  renderFlowYear(analysisData, initialFlowYear);
  renderNumerology(numProfile, analysisData.dayStem);
  renderSisterWord(analysisData.dayStem, analysisData.topTwoTenGods);
  renderLineCommunity();

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
