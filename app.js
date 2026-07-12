(function(){
'use strict';

const Solar = window.Solar;
const Lunar = window.Lunar;

const SITE_CONFIG = {
  LINE_OFFICIAL_URL: 'https://lin.ee/TPJlzkZ',
  FORMSPREE_URL: ''
};

const LINE_OFFICIAL_URL = SITE_CONFIG.LINE_OFFICIAL_URL.trim();
const FORMSPREE_URL = SITE_CONFIG.FORMSPREE_URL.trim();

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

const HOURS = [
  {v:23,label:'子時 23:00-00:59'},
  {v:1, label:'丑時 01:00-02:59'},
  {v:3, label:'寅時 03:00-04:59'},
  {v:5, label:'卯時 05:00-06:59'},
  {v:7, label:'辰時 07:00-08:59'},
  {v:9, label:'巳時 09:00-10:59'},
  {v:11,label:'午時 11:00-12:59'},
  {v:13,label:'未時 13:00-14:59'},
  {v:15,label:'申時 15:00-16:59'},
  {v:17,label:'酉時 17:00-18:59'},
  {v:19,label:'戌時 19:00-20:59'},
  {v:21,label:'亥時 21:00-22:59'}
];

const STEM_ELEMENT = {
  甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',
  己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water'
};
const STEM_YIN_YANG = {
  甲:'yang',乙:'yin',丙:'yang',丁:'yin',戊:'yang',
  己:'yin',庚:'yang',辛:'yin',壬:'yang',癸:'yin'
};

const BRANCH_HIDDEN_STRUCTURED = {
  子: [{stem:'癸', type:'main'}],
  丑: [{stem:'己', type:'main'}, {stem:'癸', type:'middle'}, {stem:'辛', type:'residual'}],
  寅: [{stem:'甲', type:'main'}, {stem:'丙', type:'middle'}, {stem:'戊', type:'residual'}],
  卯: [{stem:'乙', type:'main'}],
  辰: [{stem:'戊', type:'main'}, {stem:'乙', type:'middle'}, {stem:'癸', type:'residual'}],
  巳: [{stem:'丙', type:'main'}, {stem:'戊', type:'middle'}, {stem:'庚', type:'residual'}],
  午: [{stem:'丁', type:'main'}, {stem:'己', type:'middle'}],
  未: [{stem:'己', type:'main'}, {stem:'丁', type:'middle'}, {stem:'乙', type:'residual'}],
  申: [{stem:'庚', type:'main'}, {stem:'壬', type:'middle'}, {stem:'戊', type:'residual'}],
  酉: [{stem:'辛', type:'main'}],
  戌: [{stem:'戊', type:'main'}, {stem:'辛', type:'middle'}, {stem:'丁', type:'residual'}],
  亥: [{stem:'壬', type:'main'}, {stem:'甲', type:'middle'}]
};

const ELEMENT_CYCLE = {
  wood:  {generates:'fire', controls:'earth'},
  fire:  {generates:'earth',controls:'metal'},
  earth: {generates:'metal',controls:'water'},
  metal: {generates:'water',controls:'wood'},
  water: {generates:'wood', controls:'fire'}
};

function getTenGod(dayStem, otherStem){
  if(!otherStem) return '';
  const dayEl = STEM_ELEMENT[dayStem];
  const otherEl = STEM_ELEMENT[otherStem];
  const sameYY = STEM_YIN_YANG[dayStem] === STEM_YIN_YANG[otherStem];
  if(dayEl === otherEl) return sameYY ? '比肩' : '劫財';
  if(ELEMENT_CYCLE[dayEl].generates === otherEl) return sameYY ? '食神' : '傷官';
  if(ELEMENT_CYCLE[dayEl].controls === otherEl) return sameYY ? '偏財' : '正財';
  if(ELEMENT_CYCLE[otherEl].controls === dayEl) return sameYY ? '七殺' : '正官';
  if(ELEMENT_CYCLE[otherEl].generates === dayEl) return sameYY ? '偏印' : '正印';
  return '';
}

function getBranchHiddenWithTenGods(branch, dayStem){
  const hiddenList = BRANCH_HIDDEN_STRUCTURED[branch] || [];
  return hiddenList.map(item => ({
    stem: item.stem,
    type: item.type,
    tenGod: getTenGod(dayStem, item.stem),
    element: STEM_ELEMENT[item.stem]
  }));
}

function getBranchMainStem(branch){
  const list = BRANCH_HIDDEN_STRUCTURED[branch];
  return list && list[0] ? list[0].stem : '';
}

const BARNUM = {
  fire: {
    title: '你的命局藏著一個矛盾',
    items: [
      '你內心有強烈的方向感與熱情，但旁人有時看不見你真正的計畫。',
      '你渴望被理解，卻在關鍵時刻選擇獨自承擔。',
      '你的判斷其實很準，但過度依賴直覺，讓你錯失驗證的機會。'
    ],
    biz: '在合夥關係中，你容易遇到「看似互補、實則消耗」的對象——對方借用你的火光，卻不願承擔光的代價。'
  },
  metal: {
    title: '你比你以為的更需要被肯定',
    items: [
      '你的決斷力讓你看起來很強，但內心其實在等待一個值得信任的指引。',
      '你的標準很高，這讓你在合作中常常獨自背負。',
      '你不缺機會，缺的是區分「真機會」與「漂亮陷阱」的工具。'
    ],
    biz: '你的命格適合「掌握資源分配權」的位置，但目前你可能正卡在「執行者」與「決策者」的尷尬交界。'
  },
  wood: {
    title: '你的成長需要一片自己的土壤',
    items: [
      '你看似配合度高，但內心有一條不能被觸碰的底線。',
      '你願意給予，卻常在付出後感到莫名疲倦。',
      '你比你想像中更需要「自己說了算」的空間。'
    ],
    biz: '你適合的合夥模式，不是並肩作戰，而是「分區治理」——共識先於協作。'
  },
  water: {
    title: '你的智慧常常被自己懷疑',
    items: [
      '你能看穿人心，卻也容易因為看得太透而動彈不得。',
      '你的彈性是優勢，但有時被誤讀為立場不堅定。',
      '你習慣同時思考五種可能，這讓你決策很慢，卻通常很準。'
    ],
    biz: '你需要的合夥人，不是執行者，而是「能替你按下確認鍵」的人。'
  },
  earth: {
    title: '你的穩定其實是一種高度自律',
    items: [
      '你看似隨和，但對「被理解」這件事比誰都在意。',
      '你的責任感是團隊的支柱，但也成了你最大的負擔。',
      '你常擔心讓人失望，卻很少有人真正擔心過讓你失望。'
    ],
    biz: '你的命格適合「整合型」合夥位置，但必須避免成為所有風險的最終承擔者。'
  }
};

const state = {
  calendarType: 'solar',
  gender: 'male',
  name: '',
  year: 1990,
  month: 6,
  day: 15,
  hour: 13,
  minute: 0,
  location: 'taipei',
  result: null,
  xianxiaProfile: null,
  selectedDyIdx: 0,
  selectedYear: new Date().getFullYear()
};

function track(eventName, props){
  const safeProps = props || {};
  if(typeof window.gtag === 'function'){
    try { window.gtag('event', eventName, safeProps); } catch(e) {}
  }
  if(typeof window.fbq === 'function'){
    try { window.fbq('trackCustom', eventName, safeProps); } catch(e) {}
  }
}

function escapeHtml(str){
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildXianxiaProfile(result){
  if(!window.XIANXIA_MAP || !window.BAZI_XIANXIA_PROFILE || typeof window.BAZI_XIANXIA_PROFILE.buildXianxiaProfile !== 'function'){
    console.warn('XIANXIA module not loaded');
    return null;
  }
  try {
    const profile = window.BAZI_XIANXIA_PROFILE.buildXianxiaProfile({
      baziResult: result,
      gender: state.gender
    });
    if(!profile) console.warn('XIANXIA profile not available');
    return profile;
  } catch(e) {
    console.warn('XIANXIA profile build failed', e);
    return null;
  }
}

function fillSelect(el, from, to, current){
  el.innerHTML = '';
  for(let i = from; i <= to; i++){
    const o = document.createElement('option');
    o.value = i;
    o.textContent = i;
    if(i === current) o.selected = true;
    el.appendChild(o);
  }
}

function fillHourSelect(el, current){
  el.innerHTML = '';
  HOURS.forEach(h => {
    const o = document.createElement('option');
    o.value = h.v;
    o.textContent = h.label;
    if(h.v === current) o.selected = true;
    el.appendChild(o);
  });
}

function getDaysInMonth(y, m){
  if(state.calendarType === 'lunar' && Lunar){
    try {
      const lm = Lunar.fromYmd(y, m, 1);
      return typeof lm.getMonthDays === 'function' ? lm.getMonthDays() : 30;
    } catch(e) { return 30; }
  }
  return new Date(y, m, 0).getDate();
}

function refreshDaySelect(){
  const y = +document.getElementById('iYear').value;
  const m = +document.getElementById('iMonth').value;
  const days = getDaysInMonth(y, m);
  const cur = +document.getElementById('iDay').value || 1;
  fillSelect(document.getElementById('iDay'), 1, days, Math.min(cur, days));
}

function calculate(){
  const errEl = document.getElementById('errMsg');
  errEl.textContent = '';

  state.name = document.getElementById('iName').value.trim();
  state.year = +document.getElementById('iYear').value;
  state.month = +document.getElementById('iMonth').value;
  state.day = +document.getElementById('iDay').value;
  state.hour = +document.getElementById('iHour').value;
  state.minute = +document.getElementById('iMinute').value || 0;
  state.location = document.getElementById('iLocation').value;

  if(!state.year || !state.month || !state.day){
    errEl.textContent = '請完整填寫出生年月日';
    return null;
  }
  if(state.day > getDaysInMonth(state.year, state.month)){
    errEl.textContent = '日期不存在，請重新選擇';
    return null;
  }

  try {
    let solar;
    if(state.calendarType === 'lunar'){
      const lunar = Lunar.fromYmdHms(state.year, state.month, state.day, state.hour, state.minute, 0);
      solar = lunar.getSolar();
    } else {
      solar = Solar.fromYmdHms(state.year, state.month, state.day, state.hour, state.minute, 0);
    }

    const ec = solar.getLunar().getEightChar();

    const pillars = {
      year:  { stem: ec.getYearGan(),  branch: ec.getYearZhi()  },
      month: { stem: ec.getMonthGan(), branch: ec.getMonthZhi() },
      day:   { stem: ec.getDayGan(),   branch: ec.getDayZhi()   },
      hour:  { stem: ec.getTimeGan(),  branch: ec.getTimeZhi()  }
    };

    const dayStem = pillars.day.stem;

    const stemTenGods = {
      year:  getTenGod(dayStem, pillars.year.stem),
      month: getTenGod(dayStem, pillars.month.stem),
      day:   '日元',
      hour:  getTenGod(dayStem, pillars.hour.stem)
    };

    const branchTenGods = {
      year:  getTenGod(dayStem, getBranchMainStem(pillars.year.branch)),
      month: getTenGod(dayStem, getBranchMainStem(pillars.month.branch)),
      day:   getTenGod(dayStem, getBranchMainStem(pillars.day.branch)),
      hour:  getTenGod(dayStem, getBranchMainStem(pillars.hour.branch))
    };

    const hiddenStems = {
      year:  getBranchHiddenWithTenGods(pillars.year.branch,  dayStem),
      month: getBranchHiddenWithTenGods(pillars.month.branch, dayStem),
      day:   getBranchHiddenWithTenGods(pillars.day.branch,   dayStem),
      hour:  getBranchHiddenWithTenGods(pillars.hour.branch,  dayStem)
    };

    const yun = ec.getYun(state.gender === 'male' ? 1 : 0);
    const daYun = yun.getDaYun().slice(0, 8).map(dy => ({
      startAge:  dy.getStartAge(),
      startYear: dy.getStartYear(),
      ganZhi:    dy.getGanZhi()
    }));

    return {
      pillars,
      stemTenGods,
      branchTenGods,
      hiddenStems,
      daYun,
      dayStem,
      dayElement: STEM_ELEMENT[dayStem],
      solarDate: solar.toYmd(),
      lunarDate: solar.getLunar().toString().split(' ')[0]
    };
  } catch(e){
    errEl.textContent = '計算錯誤：' + e.message;
    return null;
  }
}

function findCurrentDyIndex(daYun){
  const nowY = new Date().getFullYear();
  let idx = 0;
  for(let i = daYun.length - 1; i >= 0; i--){
    if(daYun[i].startYear <= nowY){ idx = i; break; }
  }
  return idx;
}

function findDyIndexForYear(daYun, year){
  return daYun.findIndex(dy => year >= dy.startYear && year <= dy.startYear + 9);
}

function getClosestDisplayYear(daYun, year){
  if(!daYun || daYun.length === 0) return year;
  const firstYear = daYun[0].startYear;
  const lastYear = daYun[daYun.length - 1].startYear + 9;
  return Math.min(lastYear, Math.max(firstYear, year));
}

function getDefaultFlowSelection(daYun){
  const currentYear = new Date().getFullYear();
  const currentDyIdx = findDyIndexForYear(daYun, currentYear);
  if(currentDyIdx >= 0){
    return { dyIdx: currentDyIdx, year: currentYear };
  }
  const fallbackYear = getClosestDisplayYear(daYun, currentYear);
  const fallbackDyIdx = findDyIndexForYear(daYun, fallbackYear);
  return {
    dyIdx: fallbackDyIdx >= 0 ? fallbackDyIdx : findCurrentDyIndex(daYun),
    year: fallbackYear
  };
}

function getDefaultYearForDaYun(dy){
  const currentYear = new Date().getFullYear();
  return currentYear >= dy.startYear && currentYear <= dy.startYear + 9
    ? currentYear
    : dy.startYear;
}

function getElementClass(element){
  return 'el-' + element;
}

/**
 * Phase 8: 渲染能量輪廓（人格精簡卡）
 * 結果頁的「有人味的概覽」，引導使用者點 CTA 進分析頁看完整版
 *
 * 內容：
 *   - 代表色：日主五行色 + 用神色
 *   - 你是誰?：日主 tagline（一句話）
 *   - 你的天賦：日主 openingMetaphor（畫面感隱喻）
 *   - 需要注意：日主 shadowSide 第一句
 *
 * @param {Object} pillars - 四柱資料
 * @param {string} dayStem - 日主天干
 */
function renderEnergyProfile(pillars, dayStem){
  if (!window.BAZI_ENGINE || !window.DAY_MASTER_PROFILES) return;
  const cardEl = document.getElementById('rEnergyProfile');
  const contentEl = document.getElementById('rEpContent');
  if (!cardEl || !contentEl) return;

  const profile = window.DAY_MASTER_PROFILES[dayStem];
  if (!profile) return;
  const dayElement = profile.element;

  // 1) 代表色：日主五行 + 用神（取第一個）
  const energy = window.BAZI_ENGINE.calculateElementEnergy(pillars, window.BRANCH_PROFILES);
  const bodyStrength = window.BAZI_ENGINE.determineBodyStrength(energy, dayElement);
  let favorable = [];
  if (window.FAVORABLE_ELEMENTS && window.FAVORABLE_ELEMENTS[dayElement]) {
    const favData = window.FAVORABLE_ELEMENTS[dayElement][bodyStrength.type];
    favorable = favData ? favData.favorable : [];
  }
  const elNames = { wood:'木', fire:'火', earth:'土', metal:'金', water:'水' };
  const elNameLong = {
    wood:'青綠', fire:'暖橘', earth:'大地棕', metal:'沉灰', water:'海藍'
  };

  // 代表色清單：日主色 + 用神（去重）
  const colorList = [dayElement, ...favorable].filter((el, i, arr) => arr.indexOf(el) === i).slice(0, 3);
  const colorListHtml = colorList.map(el => `
    <div class="dot-label">
      <span class="dot dot--${el}"></span>${elNames[el]} · ${elNameLong[el]}
    </div>
  `).join('');

  // 2) 取 shadowSide 第一句（用「。」切）
  const shadowFirst = profile.shadowSide ? profile.shadowSide.split('。')[0] + '。' : '';

  contentEl.innerHTML = `
    <div class="ep-block">
      <div class="ep-label">代 表 色</div>
      <div class="ep-color-list">${colorListHtml}</div>
    </div>

    <div class="ep-block ep-block--who">
      <div class="ep-label">你 是 誰?</div>
      <p class="ep-text">${profile.tagline}。</p>
    </div>

    <div class="ep-block ep-block--talent">
      <div class="ep-label">你 的 天 賦</div>
      <p class="ep-text">${profile.openingMetaphor}</p>
    </div>

    <div class="ep-block ep-block--warning">
      <div class="ep-label">⚠ 需 要 注 意</div>
      <p class="ep-text">${shadowFirst}</p>
    </div>
  `;

  cardEl.style.display = '';
}


/**
 * Phase 7: 渲染五行分布
 * 使用 engine.calculateElementEnergy 計算百分比
 * 用神對應的格子加金色邊框 + 右上「用」字徽章
 *
 * @param {Object} pillars - 四柱資料
 * @param {string} dayStem - 日主天干
 */
function renderFiveElements(pillars, dayStem){
  if (!window.BAZI_ENGINE || !window.BRANCH_PROFILES || !window.DAY_MASTER_PROFILES) return;
  const cardEl = document.getElementById('rFiveElementsCard');
  const gridEl = document.getElementById('rFiveElements');
  const hintEl = document.getElementById('rElementsHint');
  if (!cardEl || !gridEl || !hintEl) return;

  const profile = window.DAY_MASTER_PROFILES[dayStem];
  const dayElement = profile ? profile.element : null;
  if (!dayElement) return;

  // 1) 五行能量百分比
  const energy = window.BAZI_ENGINE.calculateElementEnergy(pillars, window.BRANCH_PROFILES);

  // 2) 命格 & 用神
  const bodyStrength = window.BAZI_ENGINE.determineBodyStrength(energy, dayElement);
  let favorable = [];
  if (window.FAVORABLE_ELEMENTS && window.FAVORABLE_ELEMENTS[dayElement]) {
    const favData = window.FAVORABLE_ELEMENTS[dayElement][bodyStrength.type];
    favorable = favData ? favData.favorable : [];
  }

  // 3) 渲染五格（依木火土金水順序）
  const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
  const elNames = { wood:'木', fire:'火', earth:'土', metal:'金', water:'水' };

  gridEl.innerHTML = elementOrder.map(el => {
    const isYongShen = favorable.includes(el);
    const pct = (energy[el] || 0).toFixed(0);
    return `
      <div class="element-cell ${isYongShen ? 'element-cell--yongshen' : ''}">
        <span class="dot dot--${el}"></span>
        <span class="element-name element-name--${el}">${elNames[el]}</span>
        <span class="element-count">${pct}%</span>
      </div>
    `;
  }).join('');

  // 4) 提示行
  const favText = favorable.length > 0
    ? favorable.map(el => elNames[el]).join(' · ')
    : '無顯著';
  hintEl.innerHTML = `用神為 <strong>${favText}</strong>，建議生活中多接觸對應五行的色彩、方位與環境。`;

  cardEl.style.display = '';
}


/**
 * Phase 6: 渲染八字摘要列表
 * 在四柱八字卡片下方顯示「日主 / 命格 / 主要五行 / 用神」
 *
 * 使用 engine.js 的 calculateElementEnergy 與 determineBodyStrength
 * 資料骨幹：A-1.pdf 喜用神統整表 + A-3.pdf 身強身弱判斷
 *
 * @param {Object} pillars - 四柱資料 { year, month, day, hour }
 * @param {string} dayStem - 日主天干（如 '甲'）
 */
function renderBaziSummary(pillars, dayStem){
  if (!window.BAZI_ENGINE || !window.BRANCH_PROFILES || !window.DAY_MASTER_PROFILES) return;
  const summaryEl = document.getElementById('rBaziSummary');
  if (!summaryEl) return;

  const profile = window.DAY_MASTER_PROFILES[dayStem];
  const dayElement = profile ? profile.element : null;
  if (!dayElement) return;

  // 1) 計算五行能量分布
  const energy = window.BAZI_ENGINE.calculateElementEnergy(pillars, window.BRANCH_PROFILES);

  // 2) 判斷命格（身強/身弱/從強格/從弱格）
  const bodyStrength = window.BAZI_ENGINE.determineBodyStrength(energy, dayElement);

  // 3) 取喜用神（從 elements.js 的 FAVORABLE_ELEMENTS）
  let favorableHtml = '—';
  if (window.FAVORABLE_ELEMENTS && window.FAVORABLE_ELEMENTS[dayElement]) {
    const favData = window.FAVORABLE_ELEMENTS[dayElement][bodyStrength.type];
    if (favData && favData.favorable) {
      const elNames = { wood:'木', fire:'火', earth:'土', metal:'金', water:'水' };
      favorableHtml = favData.favorable.map(el =>
        `<span class="el-${el}">${elNames[el]}</span>`
      ).join('、');
    }
  }

  // 4) 主要五行（取能量最強的兩個）
  const elNames = { wood:'木', fire:'火', earth:'土', metal:'金', water:'水' };
  const sortedEls = Object.entries(energy).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const mainElsHtml = sortedEls.map(([el, val]) =>
    `<span class="el-${el}">${elNames[el]}</span> ${val.toFixed(0)}%`
  ).join('　');

  // 5) 日主全名（如「丁火」）
  const dayMasterFull = profile.stem + profile.elementName.slice(1);

  summaryEl.innerHTML = `
    <div class="bazi-summary-row">
      <dt>日主</dt>
      <dd><span class="accent">${dayMasterFull}</span></dd>
    </div>
    <div class="bazi-summary-row">
      <dt>命格</dt>
      <dd>${bodyStrength.type}（幫扶能量 ${bodyStrength.supportRatio.toFixed(0)}%）</dd>
    </div>
    <div class="bazi-summary-row">
      <dt>主要五行</dt>
      <dd>${mainElsHtml}</dd>
    </div>
    <div class="bazi-summary-row">
      <dt>用神</dt>
      <dd>${favorableHtml}</dd>
    </div>
  `;
}


/**
 * Phase 5: 渲染日主展示卡
 * 從 data/dayMaster.js 取資料，依日主天干填入大字、副標、意象、tagline 等
 *
 * @param {string} dayStem - 日主天干（如：'甲'、'丁'、'庚'）
 */
function renderDayMasterCard(dayStem){
  if (!window.DAY_MASTER_PROFILES) return;
  const profile = window.DAY_MASTER_PROFILES[dayStem];
  const cardEl = document.getElementById('rDayMasterCard');
  if (!profile || !cardEl) return;

  // 五行對應的代表特質標籤（每個元素挑 3-4 個）
  const elementTags = {
    wood:  ['#成長動能', '#開創', '#策略思考'],
    fire:  ['#熱情', '#感染力', '#行動力'],
    earth: ['#穩定', '#包容', '#責任感'],
    metal: ['#原則', '#果決', '#改革'],
    water: ['#流動', '#智慧', '#洞察']
  };
  const baseTags = elementTags[profile.element] || [];
  const allTags = [...baseTags, '#' + (profile.keywords[0] || '日主')];

  const tagsHtml = allTags.map(t => {
    // 第一個用 tag--daymaster（紫），其他用對應五行色
    if (t.includes(profile.keywords[0])) {
      return `<span class="tag tag--daymaster">${t}</span>`;
    }
    return `<span class="tag tag--${profile.element}">${t}</span>`;
  }).join('');

  cardEl.innerHTML = `
    <span class="tag tag--daymaster">你的日主</span>

    <div class="daymaster-display" style="margin-top:16px">
      <h2 class="daymaster-name">${profile.stem}${profile.elementName.slice(1)}</h2>
      <p class="daymaster-subtitle">${profile.elementName} · ${profile.imagery}</p>
    </div>

    <div class="daymaster-illustration">
      <span class="daymaster-glyph">${profile.stem}</span>
    </div>

    <h3 class="daymaster-tagline">${profile.tagline}</h3>

    <div class="tag-group tag-group--center">
      ${tagsHtml}
    </div>
  `;
  cardEl.style.display = '';
}

function renderXianxiaProfile(profile){
  const sectionEl = document.getElementById('xianxiaProfileSection');
  const contentEl = document.getElementById('rXianxiaProfile');
  if(!sectionEl || !contentEl) return;
  if(!profile){
    sectionEl.hidden = true;
    contentEl.innerHTML = '';
    return;
  }

  const keywordsHtml = (profile.keywords || []).slice(0, 4).map(keyword =>
    `<span>${escapeHtml(keyword)}</span>`
  ).join('');
  const tenGodSummary = profile.tenGodSummary || '命格技能樹可搭配十神分布，作為理解行動模式與人際互動的參考。';

  contentEl.innerHTML = `
    <div class="xianxia-kicker">本 命 靈 獸 總 覽</div>
    <h2 class="xianxia-title">${escapeHtml(profile.title)}</h2>
    <span class="spirit-root-badge">本命靈根：${escapeHtml(profile.spiritRoot)}${profile.yinYang ? ' · ' + escapeHtml(profile.yinYang) : ''}</span>
    <div class="xianxia-keywords">${keywordsHtml}</div>
    <p class="xianxia-summary">${escapeHtml(profile.summary)}</p>
    <div class="xianxia-points">
      ${profile.essence ? `
      <div class="xianxia-point">
        <strong>本象與性格</strong>
        <p>${escapeHtml(profile.essence)}</p>
      </div>
      ` : ''}
      <div class="xianxia-point">
        <strong>命格天賦</strong>
        <p>${escapeHtml(profile.gift)}</p>
      </div>
      <div class="xianxia-point">
        <strong>成長課題</strong>
        <p>${escapeHtml(profile.challenge)}</p>
      </div>
      <div class="xianxia-point">
        <strong>五行靈氣提醒</strong>
        <p>${escapeHtml(profile.elementAuraSummary)}</p>
      </div>
      <div class="xianxia-point">
        <strong>命格技能樹提醒</strong>
        <p>${escapeHtml(tenGodSummary)}</p>
      </div>
      <div class="xianxia-point">
        <strong>一句提醒</strong>
        <p>${escapeHtml(profile.shareLine || profile.phrase)}</p>
      </div>
    </div>
  `;
  sectionEl.hidden = false;
  track('xianxia_profile_viewed', {
    day_stem: profile.dayStem || '',
    title: profile.title || ''
  });
}


/**
 * 生命靈數整合 Phase B：渲染生命靈數卡
 * - 依賴 data/numerology.js（window.NUMEROLOGY）；若未載入則安靜隱藏，不影響排盤主流程
 * - 卓越數依知識庫顯示邏輯：優先顯示昆蟲原型角色，標示「11／2」格式，先講基礎數課題再講卓越數使命
 */
function renderNumerology(year, month, day){
  const sectionEl = document.getElementById('rNumerologySection');
  const contentEl = document.getElementById('rNumerologyContent');
  if(!sectionEl || !contentEl) return;

  if(!window.NUMEROLOGY || !year || !month || !day){
    sectionEl.hidden = true;
    contentEl.innerHTML = '';
    return;
  }

  const p = window.NUMEROLOGY.getProfileByBirthday(year, month, day);
  if(!p){
    sectionEl.hidden = true;
    contentEl.innerHTML = '';
    return;
  }

  const keywordsHtml = (p.keywords || []).slice(0, 6).map(k =>
    `<span>${escapeHtml(k)}</span>`
  ).join('');

  const strengthsText = (p.strengths || []).slice(0, 3).join('、');
  const lessonsText = (p.lessons || []).slice(0, 3).join('、');

  if(p.isMaster){
    // 卓越數：昆蟲原型角色 + 基礎數課題層次
    const base = p.baseProfile;
    contentEl.innerHTML = `
      <div class="xianxia-kicker">生 命 靈 數</div>
      <div class="numerology-number">${escapeHtml(p.displayLabel)}</div>
      <h2 class="xianxia-title">${escapeHtml(p.stageName)}</h2>
      <span class="numerology-master-badge">卓越數 · ${escapeHtml(p.insectName)} · ${escapeHtml(p.masterTitle)}</span>
      <div class="xianxia-keywords">${keywordsHtml}</div>
      <p class="xianxia-summary">${escapeHtml(p.matchReason)}</p>
      <div class="xianxia-points">
        <div class="xianxia-point">
          <strong>核心標語</strong>
          <p>${escapeHtml(p.slogan)}</p>
        </div>
        ${base ? `
        <div class="xianxia-point">
          <strong>先修的基礎數課題（${escapeHtml(String(p.baseNumber))} · ${escapeHtml(base.stageName)}）</strong>
          <p>${escapeHtml(p.earlyChallenge)}。卓越數持有者常先經歷基礎數的課題，內在整合後，較能展現高階能量。</p>
        </div>
        ` : ''}
        <div class="xianxia-point">
          <strong>成熟後的高階展現</strong>
          <p>${escapeHtml(p.matureExpression)}</p>
        </div>
        <div class="xianxia-point">
          <strong>天賦亮點</strong>
          <p>${escapeHtml(strengthsText)}</p>
        </div>
        <div class="xianxia-point">
          <strong>成長課題</strong>
          <p>${escapeHtml(lessonsText)}</p>
        </div>
      </div>
    `;
  } else {
    // 一般靈數：蝴蝶階段角色
    contentEl.innerHTML = `
      <div class="xianxia-kicker">生 命 靈 數</div>
      <div class="numerology-number">${escapeHtml(p.displayLabel || String(p.number))}</div>
      <h2 class="xianxia-title">${escapeHtml(p.stageName)}</h2>
      <span class="spirit-root-badge">蝴蝶階段：${escapeHtml(p.butterflyStage)} · ${escapeHtml(p.archetype)}</span>
      <div class="xianxia-keywords">${keywordsHtml}</div>
      <p class="xianxia-summary">${escapeHtml(p.symbolism)}</p>
      <div class="xianxia-points">
        <div class="xianxia-point">
          <strong>核心標語</strong>
          <p>${escapeHtml(p.slogan)}</p>
        </div>
        <div class="xianxia-point">
          <strong>天賦亮點</strong>
          <p>${escapeHtml(strengthsText)}</p>
        </div>
        <div class="xianxia-point">
          <strong>成長課題</strong>
          <p>${escapeHtml(lessonsText)}</p>
        </div>
      </div>
    `;
  }

  sectionEl.hidden = false;
  track('numerology_viewed', {
    life_path: p.calc ? String(p.calc.lifePath) : '',
    is_master: p.isMaster ? '1' : '0'
  });
}

function renderResult(){
  const r = state.result;
  if(!r) return;

  const displayName = state.name || '命主';
  document.getElementById('rName').textContent = displayName + ' · ' + (state.gender === 'male' ? '男命' : '女命');
  document.getElementById('rDate').textContent = '國曆 ' + r.solarDate + ' · 農曆 ' + r.lunarDate;

  renderXianxiaProfile(r.xianxiaProfile || state.xianxiaProfile);

  // 生命靈數整合 Phase B: 渲染生命靈數卡（獨立區塊，資料來源 data/numerology.js）
  renderNumerology(state.year, state.month, state.day);

  // Phase 5: 渲染日主展示卡
  renderDayMasterCard(r.pillars.day.stem);

  // Phase 6: 渲染八字摘要列表
  renderBaziSummary(r.pillars, r.pillars.day.stem);

  // Phase 7: 渲染五行分布
  renderFiveElements(r.pillars, r.pillars.day.stem);

  // Phase 8: 渲染能量輪廓（人格精簡卡）
  renderEnergyProfile(r.pillars, r.pillars.day.stem);

  const pEl = document.getElementById('rPillars');
  const order = ['year', 'month', 'day', 'hour'];
  const labels = { year:'年柱', month:'月柱', day:'日柱', hour:'時柱' };

  pEl.innerHTML = '';
  order.forEach(k => {
    const isDay = k === 'day';
    const stem = r.pillars[k].stem;
    const branch = r.pillars[k].branch;
    const stemTenGod = r.stemTenGods[k];
    const branchTenGod = r.branchTenGods[k];
    const hidden = r.hiddenStems[k];

    const stemElClass = getElementClass(STEM_ELEMENT[stem]);
    const branchMainStem = getBranchMainStem(branch);
    const branchElClass = getElementClass(STEM_ELEMENT[branchMainStem]);

    const hiddenHtml = hidden.map(h => {
      const typeLabel = h.type === 'main' ? '本' : (h.type === 'middle' ? '中' : '餘');
      const elCls = getElementClass(h.element);
      return `
        <div class="hidden-row">
          <span class="hidden-type">${typeLabel}</span>
          <span class="hidden-stem ${elCls}">${h.stem}</span>
          <span class="hidden-tg">${h.tenGod}</span>
        </div>
      `;
    }).join('');

    pEl.insertAdjacentHTML('beforeend', `
      <div class="pillar ${isDay ? 'day' : ''}">
        <div class="pillar-label ${isDay ? 'day' : ''}">${labels[k]}${isDay ? '（日主）' : ''}</div>
        <div class="pillar-box">
          <div class="ten-god ${isDay ? 'day-elem' : ''}">${stemTenGod}</div>
          <div class="stem-char ${stemElClass}">${stem}</div>
          <div class="branch-char ${branchElClass}">${branch}</div>
          <div class="branch-tg">${branchTenGod}</div>
          <div class="hidden-divider"></div>
          <div class="hidden-block">
            <div class="hidden-title">藏 干</div>
            ${hiddenHtml}
          </div>
        </div>
      </div>
    `);
  });

  const defaultFlow = getDefaultFlowSelection(r.daYun);
  state.selectedDyIdx = defaultFlow.dyIdx;
  state.selectedYear = defaultFlow.year;
  renderDaYun();
  renderBarnum(r.dayElement);

  // Phase 10: 初始化分享卡資料
  if (window.ShareCard) {
    window.ShareCard.init({
      pillars: r.pillars,
      dayStem: r.pillars.day.stem,
      birthYear: state.year,
      birthMonth: state.month,
      birthDay: state.day,
      dayElement: r.dayElement,
      name: state.name,
      gender: state.gender,
      solarDate: r.solarDate,
      lunarDate: r.lunarDate,
      xianxiaProfile: r.xianxiaProfile || state.xianxiaProfile
    });
  }
}

function renderDaYun(){
  const r = state.result;
  const dyEl = document.getElementById('rDyList');
  dyEl.innerHTML = '';

  r.daYun.forEach((dy, idx) => {
    const isCurrent = idx === findCurrentDyIndex(r.daYun);
    const isSelected = idx === state.selectedDyIdx;
    dyEl.insertAdjacentHTML('beforeend', `
      <div class="dayun-item ${isSelected ? 'active' : ''}" data-idx="${idx}">
        <div class="age">${dy.startAge} 歲</div>
        <div class="gz">${dy.ganZhi}</div>
        ${isCurrent ? '<div class="current-mark">當前</div>' : ''}
      </div>
    `);
  });

  dyEl.querySelectorAll('.dayun-item').forEach(el => {
    el.addEventListener('click', () => {
      state.selectedDyIdx = +el.dataset.idx;
      const dy = state.result.daYun[state.selectedDyIdx];
      state.selectedYear = getDefaultYearForDaYun(dy);
      track('dayun_switch', { age: dy.startAge, ganzhi: dy.ganZhi });
      renderDaYun();
      renderFlowYears();
    });
  });

  renderFlowYears();
}

function renderFlowYears(){
  const r = state.result;
  const dy = r.daYun[state.selectedDyIdx];
  document.getElementById('rFyTitle').textContent =
    dy.startAge + '-' + (dy.startAge + 9) + ' 歲 · ' + dy.ganZhi + ' 境界轉換期 · 年度機緣';

  const grid = document.getElementById('rFyGrid');
  grid.innerHTML = '';

  for(let i = 0; i < 10; i++){
    const year = dy.startYear + i;
    try {
      const lunar = Solar.fromYmd(year, 6, 15).getLunar();
      const yearGz = lunar.getYearInGanZhi();
      const sel = year === state.selectedYear ? 'active' : '';
      grid.insertAdjacentHTML('beforeend', `
        <div class="flowyear-cell ${sel}" data-year="${year}">
          <div class="year">${year}</div>
          <div class="gz">${yearGz}</div>
        </div>
      `);
    } catch(e) {}
  }

  grid.querySelectorAll('.flowyear-cell').forEach(el => {
    el.addEventListener('click', () => {
      state.selectedYear = +el.dataset.year;
      track('year_switch', { year: state.selectedYear });
      renderFlowYears();
    });
  });

  const activeCell = grid.querySelector('.flowyear-cell.active');
  if(activeCell && typeof activeCell.scrollIntoView === 'function'){
    activeCell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  renderFlowYearTags();
}

function renderFlowYearTags(){
  const r = state.result;
  if(!r) return;
  const tagsEl = document.getElementById('rTags');
  try {
    const lunar = Solar.fromYmd(state.selectedYear, 6, 15).getLunar();
    const yearGz = lunar.getYearInGanZhi();
    const yearStem = yearGz.charAt(0);
    const yearBranch = yearGz.charAt(1);
    const stemTg = getTenGod(r.dayStem, yearStem);
    const branchMainStem = getBranchMainStem(yearBranch);
    const branchTg = getTenGod(r.dayStem, branchMainStem);
    const tags = [
      { text: yearGz + '年', cls: 'gold' },
      { text: '流年天干 · ' + stemTg, cls: 'green' },
      { text: '流年地支 · ' + branchTg, cls: 'blue' }
    ];
    tagsEl.innerHTML = tags.map(t => `<span class="tag ${t.cls}">${t.text}</span>`).join('');
  } catch(e){
    tagsEl.innerHTML = '';
  }
}

function renderBarnum(el){
  const data = BARNUM[el] || BARNUM.fire;
  document.getElementById('bnTitle').textContent = data.title;
  document.getElementById('bnItems').innerHTML =
    data.items.map(t => `<div class="barnum-item">${t}</div>`).join('');
  document.getElementById('bnBiz').textContent = data.biz;
}

function handleShare(type){
  const url = window.location.href;
  const title = '我剛剛排了我的八字命盤，你也來試試？';
  const shareText = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);

  track('share_click', { platform: type });

  switch(type){
    case 'copy':
      navigator.clipboard.writeText(url).then(() => {
        alert('連結已複製');
      }).catch(() => {
        prompt('請複製此連結', url);
      });
      break;
    case 'line':
      window.open(`https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareText}`, '_blank');
      break;
    case 'fb':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
      break;
    case 'x':
      window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
      break;
  }
}

function buildAnalysisHash(){
  if(!state.result) return '';

  const params = [
    ['t', state.calendarType],
    ['y', state.year],
    ['m', state.month],
    ['d', state.day],
    ['h', state.hour],
    ['mi', state.minute || 0],
    ['g', state.gender],
    ['loc', state.location],
    ['n', state.name || '命主'],
    ['fy', state.selectedYear || new Date().getFullYear()]
  ];

  return params
    .map(([key, value]) => key + '=' + encodeURIComponent(String(value)))
    .join('&');
}

function openAnalysisPage(){
  const hash = buildAnalysisHash();
  if(!hash){
    console.warn('Cannot open analysis page: missing result state');
    return;
  }

  track('analysis_open', {
    source: 'line_cta',
    year: state.selectedYear,
    day_stem: state.result && state.result.dayStem
  });
  window.location.href = './analysis.html#' + hash;
}

function handleEmailSubmit(e){
  e.preventDefault();
  const email = document.getElementById('iEmail').value.trim();
  if(!email || !email.includes('@')) return;

  track('email_subscribe', {
    day_stem: state.result && state.result.dayStem,
    day_element: state.result && state.result.dayElement
  });

  if(!FORMSPREE_URL){
    const successEl = document.getElementById('emailSuccess');
    if(successEl){
      successEl.textContent = '名單功能設定中';
      successEl.classList.add('show');
    }
    console.warn('FORMSPREE_URL not configured');
    return;
  }

  fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      email: email,
      day_stem: (state.result && state.result.dayStem) || '',
      day_element: (state.result && state.result.dayElement) || '',
      name: state.name || '',
      gender: state.gender,
      source: 'bazi_result_page'
    })
  }).then(response => {
    if(!response.ok) throw new Error('Formspree request failed');
    document.getElementById('emailForm').style.display = 'none';
    document.getElementById('emailSuccess').classList.add('show');
  }).catch(err => {
    console.warn('Email subscribe failed', err);
  });
}

function renderLineCTA(){
  const btn = document.getElementById('btnLineCta');
  const analysisBtn = document.getElementById('btnOpenAnalysisFromLineCta');
  const statusEl = document.getElementById('lineCtaStatus');

  if(btn) btn.addEventListener('click', () => {
    track('line_cta_click', {
      configured: !!LINE_OFFICIAL_URL
    });

    if(!LINE_OFFICIAL_URL){
      if(statusEl) statusEl.textContent = 'LINE 官方帳號設定中';
      console.warn('LINE_OFFICIAL_URL not configured');
      return;
    }

    if(statusEl) statusEl.textContent = '';
    window.open(LINE_OFFICIAL_URL, '_blank', 'noopener');
  });

  if(analysisBtn) analysisBtn.addEventListener('click', openAnalysisPage);
}

function init(){
  document.getElementById('iName').value = '';
  fillSelect(document.getElementById('iYear'), 1930, new Date().getFullYear(), 1990);
  fillSelect(document.getElementById('iMonth'), 1, 12, 6);
  fillSelect(document.getElementById('iDay'), 1, 31, 15);
  fillHourSelect(document.getElementById('iHour'), 13);

  document.querySelectorAll('.tab button').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab button').forEach(x => {
        x.classList.remove('active');
        x.setAttribute('aria-pressed', 'false');
      });
      b.classList.add('active');
      b.setAttribute('aria-pressed', 'true');
      state.calendarType = b.dataset.cal;
      refreshDaySelect();
    });
  });

  document.querySelectorAll('#iGender > div').forEach(d => {
    d.addEventListener('click', () => {
      document.querySelectorAll('#iGender > div').forEach(x => x.classList.remove('active'));
      d.classList.add('active');
      state.gender = d.dataset.g;
    });
  });

  document.getElementById('iYear').addEventListener('change', refreshDaySelect);
  document.getElementById('iMonth').addEventListener('change', refreshDaySelect);

  document.getElementById('btnSubmit').addEventListener('click', () => {
    track('form_submit', { calendar: state.calendarType, gender: state.gender });

    // Phase 11: 先做一次表單驗證（calculate 內部會回 null + 顯示 errMsg）
    // 驗證失敗就不顯示 loading，避免出現「閃一下」的怪現象
    const r = calculate();
    if(!r) return;
    state.result = r;
    state.xianxiaProfile = buildXianxiaProfile(r);
    state.result.xianxiaProfile = state.xianxiaProfile;
    track('chart_generated', { day_stem: r.dayStem, day_element: r.dayElement });
    if(state.xianxiaProfile){
      track('xianxia_profile_generated', {
        day_stem: r.dayStem,
        title: state.xianxiaProfile.title
      });
    }

    // Phase 11: 顯示 loading 遮罩 → 300ms 後切換頁面
    // 雖然計算是同步的、其實不需要等待，但給使用者一個「正在排盤」的感受
    // 同時也讓字體渲染 / 圖檔下載有時間完成，避免進結果頁時還在閃爍
    showLoading();
    setTimeout(() => {
      renderResult();
      document.getElementById('page-home').classList.remove('active');
      document.getElementById('page-result').classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      hideLoading();
    }, 450);
  });

  document.getElementById('btnBack').addEventListener('click', () => {
    track('back_to_home', {});
    document.getElementById('page-result').classList.remove('active');
    document.getElementById('page-home').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.querySelectorAll('.share-btn').forEach(b => {
    b.addEventListener('click', () => handleShare(b.dataset.share));
  });

  document.getElementById('emailForm').addEventListener('submit', handleEmailSubmit);
  renderLineCTA();

  // Phase 10: 下載 IG 分享卡按鈕
  const btnShareCard = document.getElementById('btnShareCard');
  if (btnShareCard) {
    btnShareCard.addEventListener('click', () => {
      track('share_card_open', {
        day_stem: state.result && state.result.dayStem
      });
      track('xianxia_share_card_open', {
        day_stem: state.result && state.result.dayStem,
        title: state.xianxiaProfile && state.xianxiaProfile.title
      });
      if (window.ShareCard) {
        window.ShareCard.open();
      }
    });
  }
}


/* ============================================
   Phase 11 · 行動裝置打磨 · 幫手函式
   ============================================ */

// --- Loading 遮罩 ---
function showLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) el.classList.add('show');
}

function hideLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) el.classList.remove('show');
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
