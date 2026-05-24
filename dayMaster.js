/**
 * 日主特質庫 (Day Master Profiles)
 * 
 * 資料來源：
 * - A-1.pdf P.1-2 「外顯性格」表 (依日柱天干)
 * - A-2.pdf P.1 「四柱」表（日柱定義：天干＝本我，地支＝夫妻宮）
 * 
 * 用途：分析報告「命主特質」卡片
 * 
 * ⚠ 內容嚴禁修改 — 所有文案皆來自 PDF 原文，不可自行增刪
 */

const DAY_MASTER_PROFILES = {
  '甲': {
    stem: '甲',
    element: 'wood',
    yinYang: 'yang',
    elementName: '陽木',
    imagery: '參天大樹',
    keywords: ['直立', '堅強', '有原則'],
    nature: '剛正不阿、領導者、開創者，站姿挺拔、格局大、想做大事',
    strengths: '想當老大、幕前領導',
    challenges: '堅韌不拔、剛毅果敢、固執倔強，不輕易接受他人意見',
    coreIdentity: '日柱天干為本我，甲木日主代表挺拔向上、追求格局的本質個性'
  },

  '乙': {
    stem: '乙',
    element: 'wood',
    yinYang: 'yin',
    elementName: '陰木',
    imagery: '藤蔓花草',
    keywords: ['柔軟', '靈活', '韌度高'],
    nature: '善於變通、借力使力、協調者、設計者，適應力強、懂得迂迴前進',
    strengths: '默默付出、幕後領導',
    challenges: '過度依賴他人、比較死板、缺乏果斷、選擇困難症',
    coreIdentity: '日柱天干為本我，乙木日主代表柔韌靈活、善於協調的內在特質'
  },

  '丙': {
    stem: '丙',
    element: 'fire',
    yinYang: 'yang',
    elementName: '陽火',
    imagery: '太陽之火',
    keywords: ['熱情', '開朗', '直接'],
    nature: '照亮他人、喜歡照顧人，情緒鮮明、好勝、喜關注',
    strengths: '為了目標會很積極，但情緒轉換大，很明確的表達要或不要',
    challenges: '太直接、會馬上表達不喜歡 / 不開心，衝動、容易忽視細節',
    coreIdentity: '日柱天干為本我，丙火日主代表光明熱烈、樂於照亮他人的天性'
  },

  '丁': {
    stem: '丁',
    element: 'fire',
    yinYang: 'yin',
    elementName: '陰火',
    imagery: '燭光燈火',
    keywords: ['溫暖', '細膩', '專注'],
    nature: '溫柔體貼、持續穩定、照亮細節，內斂但持久、專注力強',
    strengths: '暖男、會默默關心',
    challenges: '會禮貌、稍微忍耐，但一發起火也不得了，容易惱羞成怒、過度多愁善感',
    coreIdentity: '日柱天干為本我，丁火日主代表細膩持久、專注內斂的本質'
  },

  '戊': {
    stem: '戊',
    element: 'earth',
    yinYang: 'yang',
    elementName: '陽土',
    imagery: '高山大地',
    keywords: ['穩重', '包容', '承載力強'],
    nature: '可靠、有擔當、厚實，堅守原則',
    strengths: '很能忍耐、務實',
    challenges: '相對保守、固執、堅持自己要的、很難放下、傳統',
    coreIdentity: '日柱天干為本我，戊土日主代表厚重穩固、可靠擔當的內在本質'
  },

  '己': {
    stem: '己',
    element: 'earth',
    yinYang: 'yin',
    elementName: '陰土',
    imagery: '田園濕土',
    keywords: ['滋養', '細膩', '靈活'],
    nature: '善於培育、適應力強、溫厚務實',
    strengths: '踏實、謹慎',
    challenges: '爛好人、難以拒絕、內心戲很多、過度憂慮、不敢冒險',
    coreIdentity: '日柱天干為本我，己土日主代表滋養包容、細膩務實的本質'
  },

  '庚': {
    stem: '庚',
    element: 'metal',
    yinYang: 'yang',
    elementName: '陽金',
    imagery: '刀劍鋼鐵',
    keywords: ['剛硬', '果決', '鋒利'],
    nature: '正義感強、執行力高、改革者',
    strengths: '堅定有力、直率、不害怕權威、硬碰硬、敢衝敢拚',
    challenges: '不夠靈活、容易在人際關係中產生摩擦',
    coreIdentity: '日柱天干為本我，庚金日主代表剛強果決、勇於改革的本質'
  },

  '辛': {
    stem: '辛',
    element: 'metal',
    yinYang: 'yin',
    elementName: '陰金',
    imagery: '珠寶首飾',
    keywords: ['敏銳', '品味高雅', '重視質感細節'],
    nature: '做事追求完美、處事靈巧有彈性',
    strengths: '細膩、優雅、注重內外在的品質',
    challenges: '挑惕、缺乏冒險精神、做事迂迴',
    coreIdentity: '日柱天干為本我，辛金日主代表精緻敏銳、追求完美的本質'
  },

  '壬': {
    stem: '壬',
    element: 'water',
    yinYang: 'yang',
    elementName: '陽水',
    imagery: '江河大海',
    keywords: ['心胸格局開闊', '流動', '包容'],
    nature: '智慧、適應力強、思維靈活、善於溝通',
    strengths: '有容乃大、靈活多變、冒險家、智多星',
    challenges: '容易被煽動、失去判斷力、缺乏穩定性',
    coreIdentity: '日柱天干為本我，壬水日主代表浩瀚包容、靈動智慧的本質'
  },

  '癸': {
    stem: '癸',
    element: 'water',
    yinYang: 'yin',
    elementName: '陰水',
    imagery: '雨露泉水',
    keywords: ['默默堅持', '長跑型選手', '敏感體貼'],
    nature: '細膩安靜、觀察入微、見解精闢',
    strengths: '善解人意、重視感情、默默做事',
    challenges: '失去自我價值、容易陷入憂慮',
    coreIdentity: '日柱天干為本我，癸水日主代表敏銳安靜、見解深刻的本質'
  }
};

if (typeof window !== 'undefined') {
  window.DAY_MASTER_PROFILES = DAY_MASTER_PROFILES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DAY_MASTER_PROFILES };
}
