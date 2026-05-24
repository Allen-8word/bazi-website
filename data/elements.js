/**
 * 五行與流年資料庫 (Elements & Flow Year)
 * 
 * 資料來源：
 * - A-2.pdf P.2  「五行旺弱影響性格」表
 * - A-1.pdf P.3  「喜用神、忌神統整表」
 * - A-1.pdf P.9  「2000~2030 流年五行對照表」
 * 
 * 用途：
 * - 五行能量雷達圖的解讀
 * - 流年運勢卡片（依流年五行與日主互動）
 */

const ELEMENT_NAMES = {
  wood:  '木',
  fire:  '火',
  earth: '土',
  metal: '金',
  water: '水'
};

const ELEMENT_COLORS = {
  wood:  '#5A7A4E',
  fire:  '#B85454',
  earth: '#B89569',
  metal: '#6F7378',
  water: '#4A5868'
};

// 五行偏旺與偏弱對人格的影響 — 來源：A-2.pdf P.2
const ELEMENT_PERSONALITY = {
  wood: {
    name: '木',
    excess: '直率主觀，喜歡表達，希望成長突破，較固執衝動，欠缺周全性',
    deficient: '缺乏自信與主見，容易猶豫不決，成長動力不足'
  },
  fire: {
    name: '火',
    excess: '熱情直接、喜歡表現、行事急躁，欠缺深思熟慮',
    deficient: '過於注重和諧、怕衝突，性格溫和，缺少行動力與熱情'
  },
  earth: {
    name: '土',
    excess: '穩重實在、注重承諾、保守固執、思考僵化，原則性太強',
    deficient: '善變靈活、隨機應變，缺乏安全感，難以堅持，責任感較弱'
  },
  metal: {
    name: '金',
    excess: '果斷有行動力、敢衝敢拚，過於強硬、得理不饒人、嫉惡如仇',
    deficient: '注重圓融、待人客氣，缺乏魄力、猶豫不決、是非不明'
  },
  water: {
    name: '水',
    excess: '聰明靈活、適應力強，過於善變、容易想太多、行動力低',
    deficient: '直接單純、心思不複雜，不夠靈活變通，容易被表象欺騙'
  }
};

// 喜用神、忌神統整表 — 來源：A-1.pdf P.3
// key: 日主五行
// value: { [命格]: { favorable, unfavorable, note } }
const FAVORABLE_ELEMENTS = {
  wood: {
    身強:  { favorable: ['fire','earth','metal'], unfavorable: ['water','wood'] },
    身弱:  { favorable: ['water','wood'],          unfavorable: ['fire','earth','metal'] },
    從強格: { favorable: ['water','wood'],          unfavorable: ['fire','earth','metal'] },
    從弱格: { favorable: ['fire','earth','metal'], unfavorable: ['water','wood'] }
  },
  fire: {
    身強:  { favorable: ['metal','water','earth'], unfavorable: ['wood','fire'] },
    身弱:  { favorable: ['wood','fire'],            unfavorable: ['metal','water','earth'] },
    從強格: { favorable: ['wood','fire'],            unfavorable: ['metal','water','earth'] },
    從弱格: { favorable: ['metal','water','earth'], unfavorable: ['wood','fire'] }
  },
  earth: {
    身強:  { favorable: ['metal','water','wood'],   unfavorable: ['fire','earth'] },
    身弱:  { favorable: ['fire','earth'],            unfavorable: ['metal','water','wood'] },
    從強格: { favorable: ['fire','earth'],            unfavorable: ['metal','water','wood'] },
    從弱格: { favorable: ['metal','water','wood'],   unfavorable: ['fire','earth'] }
  },
  metal: {
    身強:  { favorable: ['fire','water','wood'],    unfavorable: ['earth','metal'], note: '土為濕土：辰、丑' },
    身弱:  { favorable: ['earth','metal'],           unfavorable: ['fire','water','wood'], note: '土為濕土：辰、丑' },
    從強格: { favorable: ['earth','metal'],           unfavorable: ['fire','water','wood'] },
    從弱格: { favorable: ['fire','water','wood'],    unfavorable: ['earth','metal'] }
  },
  water: {
    身強:  { favorable: ['wood','earth','fire'],    unfavorable: ['metal','water'] },
    身弱:  { favorable: ['metal','water'],           unfavorable: ['wood','earth','fire'] },
    從強格: { favorable: ['metal','water'],           unfavorable: ['wood','earth','fire'] },
    從弱格: { favorable: ['wood','earth','fire'],    unfavorable: ['metal','water'] }
  }
};

// 2000~2030 流年五行對照表 — 來源：A-1.pdf P.9
// 「上半年主要看天干能量，下半年看地支能量，以主氣為主」
// elements: 該年「值得留意」的主要五行（注意：是流年帶給命局的影響元素）
const FLOW_YEAR_ELEMENTS = {
  2000: { ganZhi: '庚辰', elements: ['metal','earth','water'], note: '金最大' },
  2001: { ganZhi: '辛巳', elements: ['metal','fire','earth'] },
  2002: { ganZhi: '壬午', elements: ['water','fire','earth'] },
  2003: { ganZhi: '癸未', elements: ['water','fire','earth'], note: '火土大' },
  2004: { ganZhi: '甲申', elements: ['wood','metal','water'] },
  2005: { ganZhi: '乙酉', elements: ['wood','metal'] },
  2006: { ganZhi: '丙戌', elements: ['fire','earth'] },
  2007: { ganZhi: '丁亥', elements: ['fire','water'] },
  2008: { ganZhi: '戊子', elements: ['earth','water'] },
  2009: { ganZhi: '己丑', elements: ['earth','metal'] },
  2010: { ganZhi: '庚寅', elements: ['metal','wood','fire'] },
  2011: { ganZhi: '辛卯', elements: ['metal','wood'] },
  2012: { ganZhi: '壬辰', elements: ['water','earth'], note: '水稍大' },
  2013: { ganZhi: '癸巳', elements: ['water','fire','earth'] },
  2014: { ganZhi: '甲午', elements: ['wood','fire','earth'] },
  2015: { ganZhi: '乙未', elements: ['wood','fire','earth'] },
  2016: { ganZhi: '丙申', elements: ['fire','metal','water'] },
  2017: { ganZhi: '丁酉', elements: ['fire','metal'] },
  2018: { ganZhi: '戊戌', elements: ['earth','fire'] },
  2019: { ganZhi: '己亥', elements: ['earth','water','wood'] },
  2020: { ganZhi: '庚子', elements: ['metal','water'] },
  2021: { ganZhi: '辛丑', elements: ['metal','water'] },
  2022: { ganZhi: '壬寅', elements: ['water','wood','fire'] },
  2023: { ganZhi: '癸卯', elements: ['water','wood'] },
  2024: { ganZhi: '甲辰', elements: ['wood','earth','water'], note: '木水大' },
  2025: { ganZhi: '乙巳', elements: ['wood','fire','earth'] },
  2026: { ganZhi: '丙午', elements: ['fire','earth'] },
  2027: { ganZhi: '丁未', elements: ['fire','earth'] },
  2028: { ganZhi: '戊申', elements: ['earth','metal','water'] },
  2029: { ganZhi: '己酉', elements: ['earth','metal'] },
  2030: { ganZhi: '庚戌', elements: ['metal','fire','earth'], note: '火稍大' }
};

if (typeof window !== 'undefined') {
  window.ELEMENT_NAMES = ELEMENT_NAMES;
  window.ELEMENT_COLORS = ELEMENT_COLORS;
  window.ELEMENT_PERSONALITY = ELEMENT_PERSONALITY;
  window.FAVORABLE_ELEMENTS = FAVORABLE_ELEMENTS;
  window.FLOW_YEAR_ELEMENTS = FLOW_YEAR_ELEMENTS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ELEMENT_NAMES,
    ELEMENT_COLORS,
    ELEMENT_PERSONALITY,
    FAVORABLE_ELEMENTS,
    FLOW_YEAR_ELEMENTS
  };
}
