(function(){
'use strict';

function getTopElement(elementEnergy){
  if(!elementEnergy) return null;
  const sorted = Object.entries(elementEnergy)
    .filter(([, value]) => typeof value === 'number')
    .sort((a, b) => b[1] - a[1]);
  return sorted[0] ? sorted[0][0] : null;
}

function getElementEnergy(baziResult){
  if(baziResult.elementEnergy) return baziResult.elementEnergy;
  if(window.BAZI_ENGINE && window.BAZI_ENGINE.calculateElementEnergy && window.BRANCH_PROFILES && baziResult.pillars){
    return window.BAZI_ENGINE.calculateElementEnergy(baziResult.pillars, window.BRANCH_PROFILES);
  }
  return null;
}

function getMainTenGod(baziResult){
  if(window.BAZI_ENGINE && window.BAZI_ENGINE.calculateTenGodsDistribution && window.BRANCH_PROFILES && baziResult.pillars){
    const dist = window.BAZI_ENGINE.calculateTenGodsDistribution(baziResult.pillars, window.BRANCH_PROFILES);
    const sorted = Object.entries(dist).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : null;
  }
  const candidates = []
    .concat(Object.values(baziResult.stemTenGods || {}))
    .concat(Object.values(baziResult.branchTenGods || {}))
    .filter(name => name && name !== '日元');
  return candidates[0] || null;
}

function buildXianxiaProfile(input){
  const baziResult = input && input.baziResult;
  const normalizedGender = input && input.gender === 'female' ? 'female' : 'male';
  const map = window.XIANXIA_MAP;
  if(!baziResult || !map) return null;

  const dayStem = baziResult.dayStem || (baziResult.pillars && baziResult.pillars.day && baziResult.pillars.day.stem);
  const dayProfile = map.getDayStemXianxiaProfile(dayStem);
  if(!dayProfile) return null;
  const title = (dayProfile.genderTitles && dayProfile.genderTitles[normalizedGender]) || dayProfile.title || '';
  const shortTitle = (dayProfile.genderShortTitles && dayProfile.genderShortTitles[normalizedGender]) || dayProfile.shortTitle || title;

  const elementEnergy = getElementEnergy(baziResult);
  const mainElement = getTopElement(elementEnergy) || baziResult.dayElement;
  const elementAura = map.getElementAuraProfile(mainElement);
  const mainTenGod = getMainTenGod(baziResult);
  const tenGodProfile = mainTenGod && map.tenGodLabels ? map.tenGodLabels[mainTenGod] : null;

  const elementAuraSummary = elementAura
    ? elementAura.label + '較值得留意，' + elementAura.gift + elementAura.challenge
    : '五行靈氣可作為觀察自身節奏與資源配置的參考。';
  const tenGodSummary = tenGodProfile
    ? tenGodProfile.label + '（' + tenGodProfile.original + '）：' + tenGodProfile.phrase
    : '命格技能樹可搭配十神分布，作為理解行動模式與人際互動的參考。';

  return {
    spiritRoot: dayProfile.spiritRoot,
    yinYang: dayProfile.yinYang || '',
    essence: dayProfile.essence || '',
    title,
    shortTitle,
    gender: normalizedGender,
    keywords: dayProfile.keywords || [],
    summary: '你的本命靈獸是' + title + '，五行靈根為' + dayProfile.spiritRoot + '。' + dayProfile.phrase,
    gift: dayProfile.gift,
    challenge: dayProfile.challenge,
    elementAuraSummary,
    tenGodSummary,
    shareLine: dayProfile.shareLine,
    phrase: dayProfile.phrase,
    dayStem,
    dayElement: baziResult.dayElement || null,
    mainElement,
    mainTenGod
  };
}

window.BAZI_XIANXIA_PROFILE = {
  buildXianxiaProfile
};

})();
