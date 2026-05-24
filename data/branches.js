/**
 * 地支特質庫 (Branch Profiles)
 * 
 * 資料來源：
 * - A-1.pdf P.2 「內在性格」表 (依月柱地支)
 * - A-1.pdf P.3 「地支的支藏干」表 (含主氣/中氣/餘氣的精確權重百分比)
 * - A-2.pdf P.2 「十二地支對照表1」(時辰所代表的時間段)
 * - A-2.pdf P.3 「十二地支對照表2」(對應月份與節氣)
 * 
 * ⚠ 藏干權重數值來自 PDF 原始表格，計算五行能量時必須使用此精確權重
 */

const BRANCH_PROFILES = {
  '子': {
    branch: '子',
    element: 'water',
    yinYang: 'yang',
    timeRange: '23:00-00:59',
    season: '冬',
    lunarMonth: 11,
    solarTerm: '大雪、冬至',
    timeNote: '新的一天開始，陰氣最重（在命盤推算時，23:00 開始就算是隔天）',
    nature: '聰明靈巧、思維敏捷、多才多藝、喜歡思考、同情心、直覺謹慎、有自己的想法、桃花運佳',
    hiddenStems: [
      { stem: '癸', element: 'water', type: 'main', weight: 100 }
    ]
  },

  '丑': {
    branch: '丑',
    element: 'earth',
    yinYang: 'yin',
    timeRange: '01:00-02:59',
    season: '冬',
    lunarMonth: 12,
    solarTerm: '小寒、大寒',
    timeNote: '深夜時段',
    nature: '心地善良、容易心軟、有同情心、想像力豐富、創造力多、天馬行空、過於理想、容易自我矛盾、口才好、扮豬吃老虎',
    hiddenStems: [
      { stem: '己', element: 'earth', type: 'main',     weight: 33 },
      { stem: '癸', element: 'water', type: 'middle',   weight: 33 },
      { stem: '辛', element: 'metal', type: 'residual', weight: 33 }
    ]
  },

  '寅': {
    branch: '寅',
    element: 'wood',
    yinYang: 'yang',
    timeRange: '03:00-04:59',
    season: '春',
    lunarMonth: 1,
    solarTerm: '立春、雨水（立春是新年分界線，要過了立春才算下一年）',
    timeNote: '黎明前夕',
    nature: '可靠、固執、誠信、堅定、道德感重、知恩圖報按部就班、喜歡掌握生活、好惡分明、戒心重、跟宗教有緣分、一旦喜歡可接受重複性',
    hiddenStems: [
      { stem: '甲', element: 'wood',  type: 'main',     weight: 50 },
      { stem: '丙', element: 'fire',  type: 'middle',   weight: 40 },
      { stem: '戊', element: 'earth', type: 'residual', weight: 10 }
    ]
  },

  '卯': {
    branch: '卯',
    element: 'wood',
    yinYang: 'yin',
    timeRange: '05:00-06:59',
    season: '春',
    lunarMonth: 2,
    solarTerm: '驚蟄、春分',
    timeNote: '日出時段',
    nature: '重視優雅、有品味、美感、追求完美、龜毛、悲觀、外貌協會居多、喜歡跟自己興趣相投的人相處，不然會覺得無趣',
    hiddenStems: [
      { stem: '乙', element: 'wood', type: 'main', weight: 100 }
    ]
  },

  '辰': {
    branch: '辰',
    element: 'earth',
    yinYang: 'yang',
    timeRange: '07:00-08:59',
    season: '春',
    lunarMonth: 3,
    solarTerm: '清明、穀雨',
    timeNote: '早晨時段',
    nature: '吃軟不吃硬、強勢、怕輸、重義氣、衝動、不能被打破自己制定的規則、穩定性較低',
    hiddenStems: [
      { stem: '戊', element: 'earth', type: 'main',     weight: 33 },
      { stem: '乙', element: 'wood',  type: 'middle',   weight: 33 },
      { stem: '癸', element: 'water', type: 'residual', weight: 33 }
    ]
  },

  '巳': {
    branch: '巳',
    element: 'fire',
    yinYang: 'yin',
    timeRange: '09:00-10:59',
    season: '夏',
    lunarMonth: 4,
    solarTerm: '立夏、小滿',
    timeNote: '上午時段',
    nature: '內斂、怕尷尬、擔心顧慮較多、在意別人的看法包容力強、和平、溫和、不太會表達，需要被引導、好奇心重、會記仇',
    hiddenStems: [
      { stem: '丙', element: 'fire',  type: 'main',     weight: 50 },
      { stem: '戊', element: 'earth', type: 'middle',   weight: 40 },
      { stem: '庚', element: 'metal', type: 'residual', weight: 10 }
    ]
  },

  '午': {
    branch: '午',
    element: 'fire',
    yinYang: 'yang',
    timeRange: '11:00-12:59',
    season: '夏',
    lunarMonth: 5,
    solarTerm: '芒種、夏至',
    timeNote: '太陽正中央，火能量最強',
    nature: '活力、熱情、有表現力、喜歡成為焦點、會活絡環境（怕尷尬）、好勝心強、喜好分明、喜歡自由、很怕嘮叨、不喜歡被限制',
    hiddenStems: [
      { stem: '丁', element: 'fire',  type: 'main',   weight: 50 },
      { stem: '己', element: 'earth', type: 'middle', weight: 50 }
    ]
  },

  '未': {
    branch: '未',
    element: 'earth',
    yinYang: 'yin',
    timeRange: '13:00-14:59',
    season: '夏',
    lunarMonth: 6,
    solarTerm: '小暑、大暑',
    timeNote: '下午時段',
    nature: '反應很快、行動力強、勞碌命、適合快節奏工作比較急躁、赴湯蹈火、外冷內熱、話比較多容易不經大腦',
    hiddenStems: [
      { stem: '己', element: 'earth', type: 'main',     weight: 40 },
      { stem: '丁', element: 'fire',  type: 'middle',   weight: 40 },
      { stem: '乙', element: 'wood',  type: 'residual', weight: 20 }
    ]
  },

  '申': {
    branch: '申',
    element: 'metal',
    yinYang: 'yang',
    timeRange: '15:00-16:59',
    season: '秋',
    lunarMonth: 7,
    solarTerm: '立秋、處暑',
    timeNote: '午後時段',
    nature: '學習能力、創造力、自尊心強、逞強、自我突破有點固執、別人的要求會完美做到、好面子',
    hiddenStems: [
      { stem: '庚', element: 'metal', type: 'main',     weight: 50 },
      { stem: '壬', element: 'water', type: 'middle',   weight: 40 },
      { stem: '戊', element: 'earth', type: 'residual', weight: 10 }
    ]
  },

  '酉': {
    branch: '酉',
    element: 'metal',
    yinYang: 'yin',
    timeRange: '17:00-18:59',
    season: '秋',
    lunarMonth: 8,
    solarTerm: '白露、秋分',
    timeNote: '傍晚時段',
    nature: '溫和、善於協調、注重合作、心思細膩、有藝術特質、審美獨特性、心思敏感、敏感、有點固執龜毛、心軟、濫好人',
    hiddenStems: [
      { stem: '辛', element: 'metal', type: 'main', weight: 100 }
    ]
  },

  '戌': {
    branch: '戌',
    element: 'earth',
    yinYang: 'yang',
    timeRange: '19:00-20:59',
    season: '秋',
    lunarMonth: 9,
    solarTerm: '寒露、霜降',
    timeNote: '黃昏時段',
    nature: '活力、進取心、行動力強、敢冒險、衝動了點、缺少耐心、過度勞祿、容易走冤枉路',
    hiddenStems: [
      { stem: '戊', element: 'earth', type: 'main',     weight: 45 },
      { stem: '辛', element: 'metal', type: 'middle',   weight: 45 },
      { stem: '丁', element: 'fire',  type: 'residual', weight: 10 }
    ]
  },

  '亥': {
    branch: '亥',
    element: 'water',
    yinYang: 'yin',
    timeRange: '21:00-22:59',
    season: '冬',
    lunarMonth: 10,
    solarTerm: '立冬、小雪',
    timeNote: '夜間時段',
    nature: '穩重踏實、相對保守、講究現實、有耐心、執行力、責任感強、過於固執、缺乏靈活性、要花比較多的時間，循循善誘',
    hiddenStems: [
      { stem: '壬', element: 'water', type: 'main',   weight: 60 },
      { stem: '甲', element: 'wood',  type: 'middle', weight: 40 }
    ]
  }
};

if (typeof window !== 'undefined') {
  window.BRANCH_PROFILES = BRANCH_PROFILES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BRANCH_PROFILES };
}
