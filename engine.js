/**
 * 命理分析引擎 (Analysis Engine)
 * 
 * 從命盤資料計算分析報告所需的各項數據
 * 所有邏輯基於 PDF 文件，無 AI 生成內容
 * 
 * 演算規則來源：
 * - 身強身弱計算：A-3.pdf P.1 「強、弱、從強格、從弱格計算」
 *   幫扶日主能量 > 45% → 身強
 *   幫扶日主能量 < 45% → 身弱
 *   幫扶日主能量 >= 80% → 從強格
 *   幫扶日主能量 <= 20% → 從弱格
 * - 十神綜合畫像：A-2.pdf P.9 註解
 *   「取命盤中前兩個最多的十神來作為判斷個性、特質的依據」
 * - 五行能量統計：A-1.pdf P.3 地支藏干權重
 */

const STEM_ELEMENT_MAP = {
  甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',
  己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water'
};

const STEM_YIN_YANG_MAP = {
  甲:'yang',乙:'yin',丙:'yang',丁:'yin',戊:'yang',
  己:'yin',庚:'yang',辛:'yin',壬:'yang',癸:'yin'
};

const ELEMENT_CYCLE_MAP = {
  wood:  { generates: 'fire',  controls: 'earth' },
  fire:  { generates: 'earth', controls: 'metal' },
  earth: { generates: 'metal', controls: 'water' },
  metal: { generates: 'water', controls: 'wood'  },
  water: { generates: 'wood',  controls: 'fire'  }
};

/**
 * 計算十神 (依日主與另一天干的五行陰陽關係)
 */
function calculateTenGod(dayStem, otherStem) {
  if (!otherStem) return '';
  const dayEl = STEM_ELEMENT_MAP[dayStem];
  const otherEl = STEM_ELEMENT_MAP[otherStem];
  const sameYY = STEM_YIN_YANG_MAP[dayStem] === STEM_YIN_YANG_MAP[otherStem];
  if (dayEl === otherEl) return sameYY ? '比肩' : '劫財';
  if (ELEMENT_CYCLE_MAP[dayEl].generates === otherEl) return sameYY ? '食神' : '傷官';
  if (ELEMENT_CYCLE_MAP[dayEl].controls === otherEl) return sameYY ? '偏財' : '正財';
  if (ELEMENT_CYCLE_MAP[otherEl].controls === dayEl) return sameYY ? '七殺' : '正官';
  if (ELEMENT_CYCLE_MAP[otherEl].generates === dayEl) return sameYY ? '偏印' : '正印';
  return '';
}

/**
 * 計算五行能量分布（含天干與地支藏干權重）
 * 依據 A-1.pdf P.3 藏干權重表
 * 
 * @param {Object} pillars - { year:{stem,branch}, month:..., day:..., hour:... }
 * @param {Object} branchProfiles - 來自 data/branches.js 的 BRANCH_PROFILES
 * @returns {Object} - { wood, fire, earth, metal, water }（百分比，總和 100）
 */
function calculateElementEnergy(pillars, branchProfiles) {
  const energy = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const TIAN_GAN_WEIGHT = 100;
  const DI_ZHI_WEIGHT = 100;

  ['year', 'month', 'day', 'hour'].forEach(key => {
    const stem = pillars[key].stem;
    const branch = pillars[key].branch;
    const stemElement = STEM_ELEMENT_MAP[stem];
    if (stemElement) energy[stemElement] += TIAN_GAN_WEIGHT;
    const branchData = branchProfiles[branch];
    if (branchData && branchData.hiddenStems) {
      branchData.hiddenStems.forEach(hidden => {
        const portion = (DI_ZHI_WEIGHT * hidden.weight) / 100;
        energy[hidden.element] += portion;
      });
    }
  });

  const total = Object.values(energy).reduce((s, v) => s + v, 0);
  if (total === 0) return energy;
  const percent = {};
  Object.keys(energy).forEach(k => {
    percent[k] = Math.round((energy[k] / total) * 1000) / 10;
  });
  return percent;
}

/**
 * 計算十神數量分布（統計四柱中各十神出現次數）
 * 依據 A-2.pdf P.9 註解：取命盤中最多的十神作為判斷個性的依據
 */
function calculateTenGodsDistribution(pillars, branchProfiles) {
  const dayStem = pillars.day.stem;
  const counter = {
    '比肩': 0, '劫財': 0, '食神': 0, '傷官': 0,
    '偏財': 0, '正財': 0, '七殺': 0, '正官': 0,
    '偏印': 0, '正印': 0
  };

  ['year', 'month', 'hour'].forEach(key => {
    const tg = calculateTenGod(dayStem, pillars[key].stem);
    if (tg && counter[tg] !== undefined) counter[tg] += 1;
  });

  ['year', 'month', 'day', 'hour'].forEach(key => {
    const branch = pillars[key].branch;
    const branchData = branchProfiles[branch];
    if (branchData && branchData.hiddenStems) {
      branchData.hiddenStems.forEach(hidden => {
        const tg = calculateTenGod(dayStem, hidden.stem);
        if (tg && counter[tg] !== undefined) counter[tg] += 1;
      });
    }
  });

  return counter;
}

/**
 * 取得命盤中最多的兩個十神（用於綜合人格畫像）
 */
function getTopTwoTenGods(distribution) {
  const sorted = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 2).map(([name]) => name);
}

/**
 * 判斷命格：身強 / 身弱 / 從強格 / 從弱格
 * 依據 A-3.pdf P.1 規則
 * 
 * 「與日主的關係是生我、同我為加分；
 *  與日主的關係是剋我、我剋、我生則為減分」
 * 幫扶能量 = (生我 + 同我) / 總能量
 * - 幫扶 > 45%   → 身強
 * - 幫扶 < 45%   → 身弱
 * - 幫扶 >= 80% → 從強格
 * - 幫扶 <= 20% → 從弱格
 */
function determineBodyStrength(elementEnergy, dayStemElement) {
  const dayEl = dayStemElement;
  const reverseGenerator = Object.keys(ELEMENT_CYCLE_MAP).find(
    k => ELEMENT_CYCLE_MAP[k].generates === dayEl
  );
  const supportEnergy = (elementEnergy[dayEl] || 0) + (elementEnergy[reverseGenerator] || 0);
  
  if (supportEnergy >= 80) return { type: '從強格', supportRatio: supportEnergy };
  if (supportEnergy <= 20) return { type: '從弱格', supportRatio: supportEnergy };
  if (supportEnergy >  45) return { type: '身強',    supportRatio: supportEnergy };
  return { type: '身弱', supportRatio: supportEnergy };
}

/**
 * 計算流年互動分析
 * 流年天干 / 地支對日主的十神
 * 依據 A-1.pdf P.9 流年五行對照表
 */
function calculateFlowYearAnalysis(year, dayStem, branchProfiles, flowYearTable) {
  const flowYearData = flowYearTable[year];
  if (!flowYearData) return null;

  const ganZhi = flowYearData.ganZhi;
  const flowStem = ganZhi.charAt(0);
  const flowBranch = ganZhi.charAt(1);

  const stemTenGod = calculateTenGod(dayStem, flowStem);
  
  const branchData = branchProfiles[flowBranch];
  const branchMainStem = branchData && branchData.hiddenStems[0]
    ? branchData.hiddenStems[0].stem
    : null;
  const branchTenGod = calculateTenGod(dayStem, branchMainStem);

  return {
    year,
    ganZhi,
    flowStem,
    flowBranch,
    stemTenGod,
    branchTenGod,
    elements: flowYearData.elements,
    note: flowYearData.note || ''
  };
}

/**
 * 統一封裝：產出完整分析資料物件
 * 此物件直接餵給 analysis.html 渲染
 */
function buildAnalysisData(pillars, gender, selectedYear, dataRefs) {
  const { BRANCH_PROFILES, FLOW_YEAR_ELEMENTS } = dataRefs;
  const dayStem = pillars.day.stem;
  const dayElement = STEM_ELEMENT_MAP[dayStem];

  const elementEnergy = calculateElementEnergy(pillars, BRANCH_PROFILES);
  const tenGodsDist = calculateTenGodsDistribution(pillars, BRANCH_PROFILES);
  const topTwoTenGods = getTopTwoTenGods(tenGodsDist);
  const bodyStrength = determineBodyStrength(elementEnergy, dayElement);
  const flowYear = calculateFlowYearAnalysis(selectedYear, dayStem, BRANCH_PROFILES, FLOW_YEAR_ELEMENTS);

  return {
    pillars,
    gender,
    dayStem,
    dayElement,
    elementEnergy,
    tenGodsDistribution: tenGodsDist,
    topTwoTenGods,
    bodyStrength,
    flowYear,
    selectedYear
  };
}

if (typeof window !== 'undefined') {
  window.BAZI_ENGINE = {
    calculateTenGod,
    calculateElementEnergy,
    calculateTenGodsDistribution,
    getTopTwoTenGods,
    determineBodyStrength,
    calculateFlowYearAnalysis,
    buildAnalysisData,
    STEM_ELEMENT_MAP,
    STEM_YIN_YANG_MAP
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateTenGod,
    calculateElementEnergy,
    calculateTenGodsDistribution,
    getTopTwoTenGods,
    determineBodyStrength,
    calculateFlowYearAnalysis,
    buildAnalysisData,
    STEM_ELEMENT_MAP
  };
}
