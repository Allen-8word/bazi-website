(function(){
'use strict';

const Solar = window.Solar;
const Lunar = window.Lunar;

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

function getElementClass(element){
  return 'el-' + element;
}

function renderResult(){
  const r = state.result;
  if(!r) return;

  const displayName = state.name || '命主';
  document.getElementById('rName').textContent = displayName + ' · ' + (state.gender === 'male' ? '男命' : '女命');
  document.getElementById('rDate').textContent = '國曆 ' + r.solarDate + ' · 農曆 ' + r.lunarDate;

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

  state.selectedDyIdx = findCurrentDyIndex(r.daYun);
  state.selectedYear = r.daYun[state.selectedDyIdx]
    ? r.daYun[state.selectedDyIdx].startYear
    : new Date().getFullYear();
  renderDaYun();
  renderBarnum(r.dayElement);
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
      state.selectedYear = dy.startYear;
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
    dy.startAge + '-' + (dy.startAge + 9) + ' 歲 · ' + dy.ganZhi + ' 大運流年';

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

function handleEmailSubmit(e){
  e.preventDefault();
  const email = document.getElementById('iEmail').value.trim();
  if(!email || !email.includes('@')) return;

  track('email_subscribe', {
    day_stem: state.result && state.result.dayStem,
    day_element: state.result && state.result.dayElement
  });

  const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';

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
  }).catch(() => {});

  document.getElementById('emailForm').style.display = 'none';
  document.getElementById('emailSuccess').classList.add('show');
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
    const r = calculate();
    if(!r) return;
    state.result = r;
    track('chart_generated', { day_stem: r.dayStem, day_element: r.dayElement });
    renderResult();
    document.getElementById('page-home').classList.remove('active');
    document.getElementById('page-result').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const btnViewAnalysis = document.getElementById('btnViewAnalysis');
  if (btnViewAnalysis) {
    btnViewAnalysis.addEventListener('click', () => {
      track('view_analysis_click', {
        day_stem: state.result && state.result.dayStem,
        day_element: state.result && state.result.dayElement
      });
      const hashParams = [
        'y=' + state.year,
        'm=' + state.month,
        'd=' + state.day,
        'h=' + state.hour,
        'mi=' + state.minute,
        'g=' + state.gender,
        't=' + state.calendarType,
        'fy=' + state.selectedYear,
        state.name ? 'n=' + encodeURIComponent(state.name) : null
      ].filter(Boolean).join('&');
      window.location.href = './analysis.html#' + hashParams;
    });
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
