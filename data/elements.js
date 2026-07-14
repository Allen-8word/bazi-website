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
        '你常常週末排太多事，到了週日晚上反而覺得「根本沒休息到」',
        '別人勸你「慢一點」，你嘴上答應，但其實還是停不下來',
        '你最受不了那種「沒進度」「沒在成長」的感覺'
      ],
      need: '你需要的不是更多事情做，而是「允許自己放空」。每週至少留半天什麼都不安排——這不是偷懶，是練習「沒事做也沒關係」。'
    },
    deficient: {
      feeling: '你常常感覺「沒衝勁」——明明知道該做什麼，但身體不想動。',
      scenes: [
        '你開始一件事之前，常常要花很多時間「醞釀心情」',
        '看到別人做事很果斷，你會默默羨慕',
        '你最容易卡在「想做，但一直還沒開始」的階段'
      ],
      need: '你需要的不是更多動力，而是「先動起來再說」。把開始的門檻降到最低——例如告訴自己「只做五分鐘就好」，動力往往是做著做著才出來的。'
    }
  },
  fire: {
    name: '火',
    excess: {
      feeling: '你常常感覺「熱得太用力」——熱情上來時什麼都想做，冷下來時又什麼都不想碰。',
      scenes: [
        '你可能這週密集約朋友，接下來兩週卻完全不想出門',
        '你講話比較急，說完才發現「剛剛好像太衝了」',
        '你最容易在「情緒上來」的當下，做出事後會後悔的決定'
      ],
      need: '你需要的不是壓抑熱情，而是「掌握節奏」。情緒上來時，先做件小事緩一下（喝口水、深呼吸、走兩分鐘），再決定要不要回應。'
    },
    deficient: {
      feeling: '你常常感覺「提不起勁」——別人的熱情打不動你，你也很少對什麼事興奮。',
      scenes: [
        '在熱鬧的場合裡，你常常不知不覺走到角落',
        '別人問你「最近開心嗎」，你多半回「還好」',
        '你獨處的時候，容易有種「平靜、但有點空」的感覺'
      ],
      need: '你需要的不是被別人推著走，而是「找回一點點熱情」。每天為自己做一件「沒什麼用但你喜歡」的小事——這不是浪費時間，是幫自己重新點火。'
    }
  },
  earth: {
    name: '土',
    excess: {
      feeling: '你常常感覺「想動但動不了」——卡在某個位置很久，明明可以走，但你會說「再撐一下」。',
      scenes: [
        '你可能在不滿意的工作待很久，因為總覺得「換工作太麻煩」',
        '你的衣櫃裡還留著很多舊東西——不是捨不得，是懶得整理',
        '朋友鼓勵你做點改變時，你最容易下意識回「再看看」'
      ],
      need: '你需要的不是更穩，而是「讓自己動一動」。每三個月做一個小改變——換家早餐店、換條上班路線、換個家具都好。這些小練習，會讓你在面對大決定時更敢跨出去。'
    },
    deficient: {
      feeling: '你常常感覺「沒安全感」——明明日子過得不錯，但總覺得「會出事」。',
      scenes: [
        '你做完決定後，常常反覆懷疑「這樣真的對嗎」',
        '別人覺得你日子過得很穩，但你心裡其實常常在焦慮',
        '你最容易在睡前想東想西，結果睡不著'
      ],
      need: '你需要的不是別人給你更多保證，而是「累積一些你能掌握的小事」。每天固定做幾件「一定做得到」的小事（摺棉被、走 20 分鐘）——這些會慢慢幫你長出安全感。'
    }
  },
  metal: {
    name: '金',
    excess: {
      feeling: '你常常感覺「對所有事都有意見」——看到什麼都想評論，看不慣的事一籮筐。',
      scenes: [
        '你看到不合理的事，會忍不住想說幾句',
        '別人跟你聊天，你很自然就想給建議——即使對方只是想抒發',
        '你在討論時容易「直接點出問題」，事後偶爾會想是不是太直接了'
      ],
      need: '你需要的不是更犀利，而是練習「收一收」。每天找一次機會，就算知道對方有錯也先不糾正——這不是放棄原則，是學會挑重要的戰場再出手。'
    },
    deficient: {
      feeling: '你常常感覺「立場不夠堅定」——別人說什麼你會覺得「好像也對」。',
      scenes: [
        '你做決定前容易問太多人，結果反而更亂',
        '別人對你提要求時，你常常說不出口那句「不行」',
        '你最容易被「比較強勢的人」牽著走'
      ],
      need: '你需要的不是更會做人，而是「練習拒絕」。每週至少拒絕一件「你其實不想做」的事，從小事開始（不續杯、不加點）——慢慢把說「不」的力氣練出來。'
    }
  },
  water: {
    name: '水',
    excess: {
      feeling: '你常常感覺「想太多」——一件小事可以被你延伸成八種劇本。',
      scenes: [
        '你收到訊息後，常常反覆解讀對方的語氣',
        '別人問你「在想什麼」，你會說「沒什麼」——但其實腦中同時跑著好幾條線',
        '你最容易在洗澡、走路、開車的時候，一頭栽進思緒裡'
      ],
      need: '你需要的不是更聰明，而是「把想法落地」。每天寫下三件具體要做的事（不是念頭，是行動）——這會把你四處流動的思緒，收攏成真正用得上的方向。'
    },
    deficient: {
      feeling: '你常常感覺「事情擺在面前我就反應」——比較少思考背後的層次。',
      scenes: [
        '你常常事後才反應過來「剛剛那個人是不是在暗示什麼」',
        '別人講話拐彎抹角時，你會乾脆直接問「你的意思是？」',
        '你最容易被那種「表面看起來不錯」的提案吸引'
      ],
      need: '你需要的不是把事情想得更複雜，而是「多問一個為什麼」。重要決定前，刻意連問自己三次「為什麼」——這會幫你補上原本沒看到的那一層。'
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
