(function(){
'use strict';

const dayStemTitles = {
  甲: {
    spiritRoot: '甲木靈根',
    title: '青木開山者',
    shortTitle: '青木修士',
    genderTitles: { male: '蒼木開山君', female: '扶桑青華女君' },
    genderShortTitles: { male: '蒼木君', female: '青華女君' },
    keywords: ['開創', '成長', '方向感', '突破'],
    gift: '有向上生長與開創道路的力量，適合在新的局面中帶頭前進。',
    challenge: '容易急著突破，忽略節奏、資源整合與身邊人的感受。',
    phrase: '向上生長，適合開創自己的道路。',
    shareLine: '你的本命靈根帶著開山拓路的氣息。'
  },
  乙: {
    spiritRoot: '乙木靈根',
    title: '靈藤療癒者',
    shortTitle: '靈藤修士',
    genderTitles: { male: '靈藤問道客', female: '青蘿靈姬' },
    genderShortTitles: { male: '靈藤客', female: '青蘿姬' },
    keywords: ['柔韌', '適應', '關係', '修復'],
    gift: '擅長在環境變化中找到生長縫隙，也容易察覺人與人之間的細膩變化。',
    challenge: '容易過度配合環境或他人，忘記自己的主軸與界線。',
    phrase: '柔中帶韌，擅長在關係與環境中生長。',
    shareLine: '你的本命靈根像靈藤，柔韌卻不輕易折斷。'
  },
  丙: {
    spiritRoot: '丙火靈根',
    title: '烈陽傳道者',
    shortTitle: '烈陽修士',
    genderTitles: { male: '赤陽傳道君', female: '朱陽扶光仙姬' },
    genderShortTitles: { male: '赤陽君', female: '扶光姬' },
    keywords: ['熱情', '照亮', '表達', '影響力'],
    gift: '容易用熱情、行動與存在感帶動他人，適合站到光裡傳遞理念。',
    challenge: '能量太強時，容易急躁、過度外放，或忽略自己的消耗。',
    phrase: '光明外放，適合用熱情照亮他人。',
    shareLine: '你的本命靈根像烈陽，天生帶著照亮場域的力量。'
  },
  丁: {
    spiritRoot: '丁火靈根',
    title: '星燈策士',
    shortTitle: '星燈修士',
    genderTitles: { male: '星燈策命師', female: '明燈玄女' },
    genderShortTitles: { male: '星燈師', female: '明燈玄女' },
    keywords: ['敏銳', '細膩', '靈感', '洞察'],
    gift: '擅長在細節中看見方向，適合用溫度、靈感與策略陪伴他人。',
    challenge: '容易想太多、情緒受環境影響，需要穩定自己的內在火光。',
    phrase: '細膩敏銳，擅長在暗處點亮方向。',
    shareLine: '你的本命靈根像星燈，在細微處照出答案。'
  },
  戊: {
    spiritRoot: '戊土靈根',
    title: '山岳守護者',
    shortTitle: '山岳修士',
    genderTitles: { male: '崑崙鎮岳尊者', female: '厚土玄山女君' },
    genderShortTitles: { male: '鎮岳尊者', female: '玄山女君' },
    keywords: ['穩定', '承擔', '整合', '守護'],
    gift: '具備承擔與整合資源的力量，適合成為團隊或關係中的穩定支點。',
    challenge: '容易背太多責任，也可能因為固執而不容易調整方向。',
    phrase: '厚重穩定，適合承擔與整合資源。',
    shareLine: '你的本命靈根像山岳，穩定而有承載力。'
  },
  己: {
    spiritRoot: '己土靈根',
    title: '靈田培育者',
    shortTitle: '靈田修士',
    genderTitles: { male: '靈田養道師', female: '息壤靈華仙子' },
    genderShortTitles: { male: '養道師', female: '靈華仙子' },
    keywords: ['滋養', '細緻', '照顧', '養成'],
    gift: '擅長培育、照顧與修復，能把混亂的事物慢慢整理成可成長的狀態。',
    challenge: '容易操心過度，或把別人的課題背到自己身上。',
    phrase: '溫厚細緻，擅長滋養、培育與修復。',
    shareLine: '你的本命靈根像靈田，懂得讓事物慢慢長成。'
  },
  庚: {
    spiritRoot: '庚金靈根',
    title: '天刃破局者',
    shortTitle: '天刃修士',
    genderTitles: { male: '天刃破軍君', female: '霜刃裁月女君' },
    genderShortTitles: { male: '天刃君', female: '霜刃女君' },
    keywords: ['決斷', '規則', '破局', '行動'],
    gift: '具備切開混亂、建立秩序與做出決斷的力量。',
    challenge: '容易太直接或過度剛硬，需要練習柔軟與彈性。',
    phrase: '剛毅果斷，適合斬斷混亂、建立秩序。',
    shareLine: '你的本命靈根像天刃，適合為混亂劃出清楚邊界。'
  },
  辛: {
    spiritRoot: '辛金靈根',
    title: '靈玉鑄器師',
    shortTitle: '靈玉修士',
    genderTitles: { male: '玉衡煉器君', female: '凝玉照雪仙姬' },
    genderShortTitles: { male: '玉衡君', female: '凝玉姬' },
    keywords: ['精緻', '審美', '品質', '打磨'],
    gift: '擅長看見細節、提升質感，能把粗糙的事物打磨出價值。',
    challenge: '容易過度挑剔自己或他人，需要允許過程中的不完美。',
    phrase: '精緻敏銳，擅長打磨價值與提升質感。',
    shareLine: '你的本命靈根像靈玉，越打磨越能顯出光芒。'
  },
  壬: {
    spiritRoot: '壬水靈根',
    title: '滄海行者',
    shortTitle: '滄海修士',
    genderTitles: { male: '滄海行道君', female: '瀾月觀潮女君' },
    genderShortTitles: { male: '滄海道君', female: '觀潮女君' },
    keywords: ['流動', '智慧', '視野', '策略'],
    gift: '擁有廣闊視野與流動智慧，適合跨界、策略、探索與資源連結。',
    challenge: '容易想得太廣、行動分散，需要聚焦與收束。',
    phrase: '視野廣闊，適合流動、策略與跨界探索。',
    shareLine: '你的本命靈根像滄海，能容納變化，也能看見遠方。'
  },
  癸: {
    spiritRoot: '癸水靈根',
    title: '靈泉洞察者',
    shortTitle: '靈泉修士',
    genderTitles: { male: '玄泉觀心者', female: '靈泉映月仙子' },
    genderShortTitles: { male: '玄泉者', female: '映月仙子' },
    keywords: ['感知', '洞察', '細膩', '內在'],
    gift: '具備細膩感知與深層洞察力，能察覺他人忽略的訊息。',
    challenge: '容易受情緒或環境影響，需要建立穩定的內在邊界。',
    phrase: '細膩深邃，擅長感知細節與洞察人心。',
    shareLine: '你的本命靈根像靈泉，安靜卻能映照真相。'
  }
};

const elementAuraNames = {
  wood: {
    label: '木系靈氣',
    keywords: ['成長', '開創', '方向', '彈性'],
    gift: '帶來生長、規劃、開創與適應環境的力量。',
    challenge: '過旺時容易急躁、拉扯或過度想掌控方向；不足時容易缺乏生長感與推進力。'
  },
  fire: {
    label: '火系靈氣',
    keywords: ['熱情', '表達', '顯化', '影響力'],
    gift: '帶來表達、熱情、可見度與感染力。',
    challenge: '過旺時容易急躁、消耗過快；不足時容易缺少動力與外顯能量。'
  },
  earth: {
    label: '土系靈氣',
    keywords: ['穩定', '承擔', '滋養', '整合'],
    gift: '帶來穩定、承載、信任與資源整合的能力。',
    challenge: '過旺時容易停滯或固執；不足時容易缺乏安全感與落地感。'
  },
  metal: {
    label: '金系靈氣',
    keywords: ['規則', '決斷', '品質', '界線'],
    gift: '帶來判斷、秩序、品質感與清楚界線。',
    challenge: '過旺時容易過度批判或剛硬；不足時容易缺少決斷與標準。'
  },
  water: {
    label: '水系靈氣',
    keywords: ['智慧', '流動', '洞察', '策略'],
    gift: '帶來思考、洞察、流動與策略能力。',
    challenge: '過旺時容易想太多或漂移；不足時容易缺少彈性與深度思考。'
  }
};

const tenGodLabels = {
  比肩: {
    label: '同道之力',
    original: '比肩',
    phrase: '代表自我、同伴與並肩前進的力量。',
    gift: '有機會展現主見、耐力與自我支撐。',
    challenge: '需要練習合作與彈性，避免只用自己的節奏推進。'
  },
  劫財: {
    label: '破局競合',
    original: '劫財',
    phrase: '代表競爭、資源流動與突破既有局面的力量。',
    gift: '適合在變動中尋找新機會，帶動團隊突圍。',
    challenge: '需要留意衝動與資源分配，避免過度消耗。'
  },
  食神: {
    label: '福氣輸出',
    original: '食神',
    phrase: '代表表達、創作、享受與穩定輸出的能力。',
    gift: '容易用溫和方式累積成果，也能讓人感到舒服。',
    challenge: '需要避免過度安逸，讓想法能真正落地。'
  },
  傷官: {
    label: '破格表達',
    original: '傷官',
    phrase: '代表創意、表達、質疑與突破規格的力量。',
    gift: '有機會用獨特觀點開出新路，讓個人風格被看見。',
    challenge: '需要練習表達分寸，避免鋒芒讓溝通成本變高。'
  },
  偏財: {
    label: '機緣財氣',
    original: '偏財',
    phrase: '代表機會、資源、人脈與靈活掌握外部條件。',
    gift: '較容易看見資源流動與合作可能。',
    challenge: '需要篩選機會品質，避免分散或貪多。'
  },
  正財: {
    label: '穩定財庫',
    original: '正財',
    phrase: '代表穩定累積、務實安排與可管理的資源。',
    gift: '擅長把事情做穩，讓資源一步步累積。',
    challenge: '需要保留彈性，避免因過度求穩而錯過調整時機。'
  },
  七殺: {
    label: '試煉壓力',
    original: '七殺',
    phrase: '代表壓力、挑戰、行動力與面對試煉的膽識。',
    gift: '在高壓環境中有機會展現魄力與決斷。',
    challenge: '需要練習穩住節奏，避免長期緊繃或硬扛。'
  },
  正官: {
    label: '秩序責任',
    original: '正官',
    phrase: '代表規範、責任、名聲與穩定的行事框架。',
    gift: '適合建立秩序、承擔角色，讓人感到可信任。',
    challenge: '需要避免過度壓抑自己，讓責任與彈性並存。'
  },
  偏印: {
    label: '玄思靈感',
    original: '偏印',
    phrase: '代表靈感、洞察、非典型學習與內在探索。',
    gift: '擅長從不同角度理解事物，容易有獨特想法。',
    challenge: '需要把靈感整理成可執行步驟，避免停在腦內推演。'
  },
  正印: {
    label: '護身資糧',
    original: '正印',
    phrase: '代表學習、支持、保護與穩定吸收知識的能力。',
    gift: '容易累積知識與信任，也能從支持系統中恢復力量。',
    challenge: '需要避免過度依賴安全感，練習主動做出選擇。'
  }
};

const luckLabels = {
  dayun: '境界轉換期',
  flowYear: '年度機緣'
};

const uiLabels = {
  siteName: '本命仙盤',
  mainTitle: '測出你的本命靈根與修仙命格',
  subtitle: '輸入出生資料，查看你的本命靈根、五行靈氣、命格技能樹與年度機緣。',
  submitCTA: '啟動我的本命仙盤',
  resultTitle: '本命仙途總覽',
  dayMaster: '本命靈根',
  fiveElements: '五行靈氣',
  tenGods: '命格技能樹',
  dayun: '境界轉換期',
  flowYear: '年度機緣',
  fullReport: '完整仙途報告',
  viewAnalysisCTA: '解鎖完整仙途報告',
  shareCardTitle: '我的本命仙途卡',
  lineCTA: '加入 LINE 領取完整仙途報告'
};

function getDayStemXianxiaProfile(dayStem){
  return dayStemTitles[dayStem] || null;
}

function getElementAuraProfile(element){
  return elementAuraNames[element] || null;
}

window.XIANXIA_MAP = {
  dayStemTitles,
  elementAuraNames,
  tenGodLabels,
  luckLabels,
  uiLabels,
  getDayStemXianxiaProfile,
  getElementAuraProfile
};

})();
