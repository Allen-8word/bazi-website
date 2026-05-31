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

// 五行偏旺與偏弱對人格的影響 — 姊姊感版本
// 骨幹依據：A-2.pdf P.2「五行旺弱影響性格」表
// 風格：從「日常感受」切入，提供具體場景與「真正需要的補充」
const ELEMENT_PERSONALITY = {
  wood: {
    name: '木',
    excess: {
      feeling: '你常常感覺「停不下來」——一件事做完馬上想下一件，腦中永遠有清單。',
      scenes: [
        '你會在週末安排太多事，然後週日晚上覺得「沒休息到」',
        '別人勸你「慢一點」的時候，你會嘴上答應，行動上根本停不下來',
        '你最受不了「沒進度」「沒成長」的感覺'
      ],
      need: '你真正需要的不是更多事做，是「允許自己無聊」。每週至少留半天「沒安排」，不是放鬆，是練習「沒事也沒關係」。'
    },
    deficient: {
      feeling: '你常常感覺「沒衝勁」——明明知道該做什麼，但身體不想動。',
      scenes: [
        '你會在開始一件事前花很多時間「準備心情」',
        '別人在你面前展現果斷時，你會默默羨慕',
        '你最容易卡在「想做但還沒開始」的階段'
      ],
      need: '你真正需要的不是更多動力，是「先做了再說」。把行動門檻降到最低——例如「我只打開檔案五分鐘就好」。能量會在動作中自然生出來。'
    }
  },
  fire: {
    name: '火',
    excess: {
      feeling: '你常常感覺「熱得太用力」——熱情上來時什麼都想做，冷下來時又什麼都不想碰。',
      scenes: [
        '你會在某一週密集邀約朋友，然後接下來兩週都不想出門',
        '你說話比較急，講完才發現「剛才好像太快了」',
        '你最容易因為「情緒上來」而做出後悔的決定'
      ],
      need: '你真正需要的不是降溫，是「節奏感」。情緒上來時先做一件小事（喝水、深呼吸、走兩分鐘），再決定是否反應。'
    },
    deficient: {
      feeling: '你常常感覺「提不起勁」——別人的熱情打不動你，你也很少對什麼事興奮。',
      scenes: [
        '你會在熱鬧的場合中默默走到角落',
        '別人問你「你最近開心嗎」，你會說「還好」',
        '你最容易在獨處時感到「平靜但有點空」'
      ],
      need: '你真正需要的不是被推著動，是「找回小小的熱」。每天為自己做一件「沒生產力但喜歡」的小事——這不是浪費，是補火的方式。'
    }
  },
  earth: {
    name: '土',
    excess: {
      feeling: '你常常感覺「想動但動不了」——卡在某個位置很久，明明可以走，但你會說「再撐一下」。',
      scenes: [
        '你會在不滿意的工作待很久，因為「換工作很麻煩」',
        '你的衣櫃裡有十年前的衣服——不是節儉，是懶得整理',
        '你最容易在朋友推你做改變時，下意識說「再看看」'
      ],
      need: '你真正需要的不是更穩，是「鬆動」。每三個月做一次「小改變」——換早餐店、換上班路線、換一件家具。這些練習會讓你在大決定時敢動。'
    },
    deficient: {
      feeling: '你常常感覺「沒安全感」——明明日子過得不錯，但總覺得「會出事」。',
      scenes: [
        '你會在做決定後反覆懷疑「這樣對嗎」',
        '別人覺得你過得很穩，但你內心常常焦慮',
        '你最容易在睡前想很多事，導致失眠'
      ],
      need: '你真正需要的不是更多保證，是「建立可控的小事」。每天固定做幾件「百分百能完成」的小事（疊棉被、走 20 分鐘）——這些會給你的神經系統累積安全感。'
    }
  },
  metal: {
    name: '金',
    excess: {
      feeling: '你常常感覺「對所有事都有意見」——看到什麼都想評論，看不慣的事一籮筐。',
      scenes: [
        '你會在新聞、社群上忍不住留言批評',
        '別人來找你聊天，你會很自然地給建議——即使他沒問',
        '你最容易在會議上「直接指出問題」，事後想想是不是太硬'
      ],
      need: '你真正需要的不是更鋒利，是「鈍化的練習」。每天有一次「明知道對方錯但不糾正」的機會——這不是放棄原則，是練習選戰場。'
    },
    deficient: {
      feeling: '你常常感覺「立場不夠堅定」——別人說什麼你會覺得「好像也對」。',
      scenes: [
        '你會在決定前問太多人，結果更亂',
        '別人對你提要求時，你說不出口的「不行」',
        '你最容易被「強勢的人」帶著走'
      ],
      need: '你真正需要的不是更圓融，是「練習說不」。每週至少一次拒絕一件「你其實不想做」的事——從小事開始（不續杯、不加菜），慢慢建立你的「邊界肌肉」。'
    }
  },
  water: {
    name: '水',
    excess: {
      feeling: '你常常感覺「想太多」——一件小事可以被你延伸成八種劇本。',
      scenes: [
        '你會在收到訊息後反覆解讀對方的語氣',
        '別人問你「在想什麼」，你會說「沒什麼」——但其實腦子裡有十條線',
        '你最容易在洗澡、走路、開車時陷入思考漩渦'
      ],
      need: '你真正需要的不是更聰明，是「把思緒落地」。每天寫下三件具體的事（不是想法、是行動）——這會把你的水從「無邊際的流動」聚成「能用的水池」。'
    },
    deficient: {
      feeling: '你常常感覺「事情擺在面前我就反應」——比較少思考背後的層次。',
      scenes: [
        '你會在事後才意識到「剛才那個人是不是在暗示什麼」',
        '別人說話拐彎抹角的時候，你會直接問「你的意思是？」',
        '你最容易被「表面看起來不錯的提案」吸引'
      ],
      need: '你真正需要的不是變複雜，是「多問一個為什麼」。重大決定前，刻意問三次「為什麼」——這會幫你補上看不到的那一層。'
    }
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
