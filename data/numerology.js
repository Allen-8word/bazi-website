/**
 * 生命靈數資料庫 (Numerology Profiles) — 蝴蝶九階段 × 卓越數昆蟲原型
 *
 * 資料來源：「生命靈數_蝴蝶九階段與卓越數昆蟲原型_整合版.md」（使用者提供之知識庫文件）
 * 遵守鐵則 1（零幻覺原則）：本檔所有文案均逐字或忠實改寫自來源文件，不得憑空新增命理判斷。
 *
 * ============================================================
 * 卓越數計算規則（Phase A 定案，2026-07）
 * ============================================================
 * 1. 取西元生日 YYYY / MM / DD 全部數字相加（共 8 位數）
 * 2. 若總和 ∈ {11, 22, 33, 44} → 判定為卓越數（Master Number），
 *    同時保留基礎數：11／2、22／4、33／6、44／8
 * 3. 若不是，總和逐位再相加；「每一層縮減」都要檢查是否為卓越數
 *    （例：總和 29 → 2+9=11 → 卓越數 11／2）
 * 4. 縮減到 1–9 為止，即為核心生命靈數
 * 5. 顯示邏輯（依來源文件第六章）：
 *    - 一般靈數 → 顯示蝴蝶階段角色
 *    - 卓越數  → 優先顯示昆蟲原型角色，並標示「11／2」格式
 *    - 解讀順序：先講基礎數課題，再講卓越數使命，避免過度神化
 *
 * 本檔為獨立模組，不依賴其他 data 檔案，未接入 index.html 前不影響任何既有功能。
 */

(function () {
  'use strict';

  // ============================================================
  // 核心生命靈數 1–9：蝴蝶的九段生命旅程
  // ============================================================

  const CORE_NUMBERS = {
    1: {
      number: 1,
      isMaster: false,
      stageName: '生命之卵',
      butterflyStage: '卵',
      archetype: '開創者／領導者',
      keywords: ['誕生', '自我', '開始', '意志', '潛能', '獨立'],
      strengths: [
        '獨立果斷',
        '具有創造力與行動力',
        '自信且勇於開創',
        '能夠率先跨出第一步',
        '具備領導與決策能力'
      ],
      blindspots: [
        '容易自我中心',
        '主觀意識過強',
        '缺乏耐性',
        '難以接受不同意見',
        '可能把獨立活成孤立'
      ],
      symbolism: '蝴蝶的一生從一顆小小的卵開始。外表雖然安靜而脆弱，內部卻已攜帶完整的生命藍圖。生命靈數 1 象徵從無到有的第一道意志，也代表一個人開始意識到：我是誰？我要成為什麼樣的人？這是一個尚未被世界定義、擁有無限可能性的階段。',
      lessons: [
        '建立清楚的自我認同',
        '相信自己的能力',
        '勇敢開始',
        '學習從心領導，而非強勢控制',
        '保有獨立，也願意聆聽他人'
      ],
      coreQuestion: null,
      slogan: '我誕生，因此我存在。'
    },

    2: {
      number: 2,
      isMaster: false,
      stageName: '初生幼蟲',
      butterflyStage: '剛孵化的幼蟲',
      archetype: '合作者／協調者',
      keywords: ['關係', '依靠', '合作', '安全感', '感受', '連結'],
      strengths: [
        '溫柔體貼',
        '心思細密',
        '擅長合作與協調',
        '直覺敏銳',
        '具有良好的聆聽能力',
        '能感受到他人的情緒與需求'
      ],
      blindspots: [
        '容易依賴他人',
        '優柔寡斷',
        '過度討好',
        '情緒敏感',
        '害怕衝突與拒絕',
        '容易失去個人界線'
      ],
      symbolism: '剛孵化的小毛毛蟲十分脆弱，需要依附植物、吸收養分，才能逐漸存活與成長。生命靈數 2 並不代表弱小，而是象徵生命開始學會與外界建立關係。這個階段的重點不是獨自衝刺，而是學習信任、合作、接受照顧，以及在關係中保有自己。',
      lessons: [
        '建立健康的個人界線',
        '學會獨立做決定',
        '勇敢表達不同意見',
        '接受幫助，但不過度依附',
        '在合作與自我之間取得平衡'
      ],
      coreQuestion: '我能不能相信別人，同時不失去自己？',
      slogan: '我連結，因此我成長。'
    },

    3: {
      number: 3,
      isMaster: false,
      stageName: '探索幼蟲',
      butterflyStage: '成長與探索中的幼蟲',
      archetype: '表達者／創意家',
      keywords: ['好奇', '表達', '創造', '探索', '快樂', '分享'],
      strengths: [
        '樂觀開朗',
        '富有幽默感',
        '想像力豐富',
        '擅長溝通與表達',
        '多才多藝',
        '能將感受轉化為創作'
      ],
      blindspots: [
        '容易三分鐘熱度',
        '缺乏深度與持續力',
        '說話可能浮誇',
        '容易逃避沉重問題',
        '情緒與注意力較分散',
        '創意多，落實少'
      ],
      symbolism: '毛毛蟲開始大量進食、移動與探索。牠不斷嘗試不同的葉片與路徑，在好奇心中快速成長。生命靈數 3 代表生命開始向外展現自己。它透過語言、藝術、幽默、創意與分享，讓內在世界被看見。',
      lessons: [
        '將創意落實為具體成果',
        '培養專注與自律',
        '誠實面對內在焦慮',
        '不以玩笑掩飾真實感受',
        '允許自己透過表達而發光'
      ],
      coreQuestion: null,
      slogan: '我表達，因此我發光。'
    },

    4: {
      number: 4,
      isMaster: false,
      stageName: '成熟幼蟲',
      butterflyStage: '成熟毛毛蟲',
      archetype: '建造者／務實派',
      keywords: ['紀律', '基礎', '穩定', '累積', '責任', '結構'],
      strengths: [
        '穩重可靠',
        '做事有條理',
        '重視規則與秩序',
        '具備組織能力',
        '能長期累積實力',
        '具有責任感與執行力'
      ],
      blindspots: [
        '固執而不易變通',
        '害怕未知與冒險',
        '過度追求安全',
        '容易墨守成規',
        '對自己與他人過於嚴格',
        '可能因焦慮而過度控制細節'
      ],
      symbolism: '成熟毛毛蟲即將面對巨大的轉變。在蛻變之前，牠必須先累積足夠的養分與能量。生命靈數 4 象徵人生地基。工作、技能、責任、家庭與生活秩序，看似平凡，卻是未來完成蛻變不可缺少的基礎。',
      lessons: [
        '建立穩定且可持續的生活節奏',
        '累積專業能力',
        '學習承擔責任',
        '接受計畫之外的變化',
        '明白真正的安全感來自內在，而非完全控制外界'
      ],
      coreQuestion: null,
      slogan: '我扎根，因此我穩定。'
    },

    5: {
      number: 5,
      isMaster: false,
      stageName: '結蛹瞬間',
      butterflyStage: '開始結蛹',
      archetype: '自由者／冒險家',
      keywords: ['改變', '冒險', '突破', '轉折', '自由', '適應'],
      strengths: [
        '熱愛自由',
        '適應力強',
        '勇於嘗試',
        '口才與傳播能力佳',
        '富有魅力與幽默感',
        '能迅速因應環境變化'
      ],
      blindspots: [
        '容易放縱與散漫',
        '缺乏自制力',
        '害怕長期承諾',
        '容易因無聊而頻繁更換方向',
        '追求刺激，卻缺乏深度',
        '可能將逃避誤認為自由'
      ],
      symbolism: '毛毛蟲停止原本的生活方式，準備進入蛹的狀態。牠必須放下熟悉的身分，進入未知而混亂的轉換期。生命靈數 5 象徵變動、冒險與突破。換工作、搬家、旅行、戀愛、離開舒適圈，都可能成為重新選擇人生方向的契機。',
      lessons: [
        '在自由中建立自律',
        '學習承擔選擇的後果',
        '不用逃離來解決問題',
        '將豐富經驗轉化為智慧',
        '接受改變，同時保有核心方向'
      ],
      coreQuestion: '我是在追求真正的自由，還是在逃避限制？',
      slogan: '我改變，因此我突破。'
    },

    6: {
      number: 6,
      isMaster: false,
      stageName: '療癒之蛹',
      butterflyStage: '蛹的內在重組期',
      archetype: '奉獻者／療癒師',
      keywords: ['愛', '照顧', '療癒', '修復', '家庭', '責任'],
      strengths: [
        '富有愛心與同理心',
        '樂於照顧他人',
        '重視家庭與關係',
        '具有正義感',
        '追求和諧與美感',
        '擅長修復關係與承接責任'
      ],
      blindspots: [
        '過度犧牲自己',
        '容易產生救世主情結',
        '可能以關心之名控制他人',
        '完美主義',
        '容易情緒勒索',
        '把他人的責任背在自己身上'
      ],
      symbolism: '蛹的外表看似安靜，內部卻正在進行深層分解與重組。舊有結構被重新整理，新的生命形態逐漸成形。生命靈數 6 象徵愛、照顧、家庭與療癒。這個階段的重要課題，不只是照顧別人，更是重新學會照顧自己。',
      lessons: [
        '先愛自己，再照顧他人',
        '建立健康的付出界線',
        '放下過度掌控',
        '尊重每個人的選擇與成長速度',
        '理解真正的愛並不等於犧牲'
      ],
      coreQuestion: null,
      slogan: '我療癒，因此我完整。'
    },

    7: {
      number: 7,
      isMaster: false,
      stageName: '破蛹覺醒',
      butterflyStage: '破蛹而出',
      archetype: '探求者／分析家',
      keywords: ['智慧', '覺察', '真理', '靈性', '分析', '內在答案'],
      strengths: [
        '邏輯與分析能力強',
        '喜歡深入研究',
        '洞察力敏銳',
        '追求真相與本質',
        '具有批判思考',
        '能進行深層的心理與精神探索'
      ],
      blindspots: [
        '容易猜疑',
        '過度理性',
        '冷漠或孤僻',
        '習慣與世界保持距離',
        '容易陷入精神焦慮',
        '知道很多，卻不一定願意實踐'
      ],
      symbolism: '蝴蝶必須靠自己的力量破蛹而出，沒有人能替牠完成。掙扎的過程會強化身體與翅膀，使牠真正具備迎接新世界的能力。生命靈數 7 代表智慧、覺察、哲學、心理、命理與靈性探索。這個階段會開始追問生命的意義，以及內在真正相信的答案。',
      lessons: [
        '將知識轉化為實踐',
        '學習信任自己的直覺',
        '打開心房與人建立連結',
        '接受有些答案無法只靠理性獲得',
        '在獨處與參與世界之間取得平衡'
      ],
      coreQuestion: null,
      slogan: '我覺醒，因此我自由。'
    },

    8: {
      number: 8,
      isMaster: false,
      stageName: '力量展翅',
      butterflyStage: '剛展開翅膀的蝴蝶',
      archetype: '實踐者／企業家',
      keywords: ['力量', '成果', '豐盛', '資源', '權力', '實踐'],
      strengths: [
        '商業與資源整合能力強',
        '執行效率高',
        '目標明確',
        '具備管理與決策能力',
        '能將能力轉化為成果',
        '擅長掌握局勢'
      ],
      blindspots: [
        '控制欲強',
        '過度重視成就與物質',
        '害怕展現脆弱',
        '容易以結果衡量自我價值',
        '可能變得強勢或好面子',
        '忽略精神與情感需求'
      ],
      symbolism: '蝴蝶雖然已經展開翅膀，卻不能立刻飛翔。牠必須等待翅膀充滿力量，並學會在正確的時機起飛。生命靈數 8 代表權力、資源、金錢、成就與實踐。真正的力量不只是掌控，而是知道如何正確使用能力與資源。',
      lessons: [
        '掌握力量，但不濫用力量',
        '平衡物質與精神生活',
        '將財富與權力轉化為服務世界的工具',
        '接納自己的脆弱',
        '建立成果，也保有人性與溫度'
      ],
      coreQuestion: null,
      slogan: '我實踐，因此我豐盛。'
    },

    9: {
      number: 9,
      isMaster: false,
      stageName: '飛舞圓滿',
      butterflyStage: '飛翔、授粉與孕育下一個循環',
      archetype: '人道主義者／夢想家',
      keywords: ['奉獻', '智慧', '慈悲', '圓滿', '分享', '循環'],
      strengths: [
        '富有慈悲心',
        '具備大愛精神',
        '包容力強',
        '想像力豐富',
        '樂於助人',
        '能將生命經驗轉化為智慧'
      ],
      blindspots: [
        '容易脫離現實',
        '缺乏界線與原則',
        '空有理想而缺乏行動',
        '可能憤世嫉俗',
        '難以放下已經結束的人事物',
        '容易為眾人付出而忽略自己'
      ],
      symbolism: '蝴蝶開始飛翔、採蜜與授粉，也為下一代生命循環播下種子。這時的牠已不再只為自己的生存而活，而是成為整個生態系統的一部分。生命靈數 9 代表完成、慈悲、奉獻與智慧。9 不是終點，而是一個階段的圓滿；當新的卵誕生，生命又會回到 1。',
      lessons: [
        '將理想化為具體行動',
        '分享生命智慧',
        '學會拒絕與斷捨離',
        '在奉獻中保有界線',
        '接納結束，迎接下一個循環'
      ],
      coreQuestion: null,
      slogan: '我奉獻，因此我圓滿。'
    }
  };

  // ============================================================
  // 卓越數 11、22、33、44：四種高階昆蟲原型
  // ============================================================

  const MASTER_NUMBERS = {
    11: {
      number: 11,
      isMaster: true,
      baseNumber: 2,
      displayLabel: '11／2',
      insectName: '螢火蟲',
      masterTitle: '星光信使',
      stageName: '星光螢火蟲',
      archetype: '神聖的信使／靈感的傳遞者',
      keywords: ['直覺', '啟示', '傳訊', '靈感', '感染力'],
      matchReason: '螢火蟲以自身發出的微光，在黑暗中傳遞訊號。牠的力量不是巨大的外在聲勢，而是敏銳、細緻且能穿透黑暗的光。直覺像黑暗中的光點，能感受到他人忽略的訊息，外在柔和，內在卻承載強烈能量。',
      strengths: [
        '高度直覺',
        '靈感豐富',
        '同理心強',
        '精神感染力高',
        '擅長接收與傳遞抽象訊息',
        '容易在藝術、哲學、心理或靈性領域展現天賦'
      ],
      blindspots: [
        '容易能量過載',
        '對外界情緒過度敏感',
        '焦慮與自我懷疑',
        '在獨立與配合之間拉扯',
        '靈感很多，但缺乏落地能力',
        '可能把敏感誤認為脆弱'
      ],
      lessons: [
        '信任自己的直覺',
        '建立情緒與能量界線',
        '將靈感轉化為具體作品或服務',
        '不因外界質疑而熄滅自己的光',
        '學會穩定發光，而不是燃燒自己'
      ],
      earlyChallenge: '敏感、依賴、猶豫、自我懷疑',
      matureExpression: '直覺啟發、精神傳訊、藝術感染力',
      slogan: '我點亮黑暗，因此我傳遞啟示。',
      visualNotes: '柔和發光的腹部或尾端；深藍、紫黑、月光金與星光色；細長觸角；周圍光點、星塵與能量波紋；氣質神秘、安靜、敏銳而具有引導感。'
    },

    22: {
      number: 22,
      isMaster: true,
      baseNumber: 4,
      displayLabel: '22／4',
      insectName: '白蟻',
      masterTitle: '築城大師',
      stageName: '築城白蟻',
      archetype: '大師級建造者／願景實現者',
      keywords: ['建造', '組織', '願景落地', '結構', '長期建設'],
      matchReason: '白蟻能透過群體分工、長期累積與精密結構，建造規模遠超個體身形的巢穴。牠象徵的不是個人英雄主義，而是把龐大願景拆解成可執行的系統，透過團隊讓個人無法完成的願景落地。',
      strengths: [
        '宏觀願景',
        '組織與規劃能力',
        '務實執行',
        '長期建設',
        '資源整合',
        '能把抽象理想轉化為具體制度、事業或平台'
      ],
      blindspots: [
        '完美主義',
        '壓力過大',
        '好大喜功',
        '過度控制',
        '害怕失敗而不敢開始',
        '為了完成大局而忽略個人情感'
      ],
      lessons: [
        '將宏大目標拆成可執行步驟',
        '接受大型成果需要長期累積',
        '學會授權與團隊合作',
        '平衡成就、操守與生活',
        '不因理想巨大而否定微小進度'
      ],
      earlyChallenge: '僵化、害怕失敗、過度重視安全',
      matureExpression: '建立大型事業、制度或長期社會價值',
      slogan: '我建造願景，因此我讓理想成形。',
      visualNotes: '拱形巢穴、層疊通道或城堡式結構；土金、岩灰、琥珀與暖棕色系；幾何藍圖、結構光紋與建築節點；姿態沉穩、專注、具統籌全局感；主體為單一具領袖辨識度的角色。'
    },

    33: {
      number: 33,
      isMaster: true,
      baseNumber: 6,
      displayLabel: '33／6',
      insectName: '蜜蜂',
      masterTitle: '聖蜜導師',
      stageName: '聖蜜導師',
      archetype: '大愛與療癒的大師／神聖導師',
      keywords: ['大愛', '療癒', '教導', '服務', '滋養'],
      matchReason: '蜜蜂在花朵之間傳遞花粉，讓植物延續生命；同時透過群體合作，將採集而來的資源轉化為蜂蜜。牠象徵把個人天賦轉化為集體養分，對應療癒、教導、表達與無條件之愛。',
      strengths: [
        '慈悲與大愛',
        '療癒能力',
        '創造與表達',
        '教導與陪伴',
        '服務群體',
        '能將痛苦轉化為理解，再將理解分享給他人'
      ],
      blindspots: [
        '救世主情結',
        '過度犧牲',
        '背負不屬於自己的責任',
        '容易情緒耗竭',
        '對自己與他人要求過高',
        '當善意未被接受時，可能轉為失望或批判'
      ],
      lessons: [
        '先療癒自己，再陪伴他人',
        '建立健康的付出界線',
        '尊重每個人的因果與步調',
        '以榜樣啟發，而非強迫改變',
        '讓愛成為滋養，而不是控制'
      ],
      earlyChallenge: '過度付出、控制、救世主情結',
      matureExpression: '療癒、教導、傳遞大愛與智慧',
      slogan: '我傳遞愛，因此我讓生命再次盛開。',
      visualNotes: '金黃、奶油白、蜜糖琥珀與柔和花色；翅膀帶花瓣或療癒光紋；花粉光點、蜂蜜晶體與盛開花朵；神情慈愛、溫暖、安定；呈現照顧與引導，而非忙碌勞動感。'
    },

    44: {
      number: 44,
      isMaster: true,
      baseNumber: 8,
      displayLabel: '44／8',
      insectName: '獨角仙',
      masterTitle: '玄甲架構師',
      stageName: '玄甲獨角仙',
      archetype: '命運的架構師／大型系統顯化者',
      keywords: ['紀律', '權力', '系統顯化', '秩序', '承載'],
      matchReason: '獨角仙具有厚實甲殼、穩固身形與鮮明力量感，象徵承載壓力、守住結構並推動現實成果。甲殼代表防護與紀律，巨角則象徵方向、意志與開路能力，對應進入權力、資源、秩序與大型系統的操盤層級。',
      strengths: [
        '極強的紀律',
        '穩固的結構力',
        '資源整合與管理',
        '危機處理',
        '大型系統操盤',
        '能在混亂中重建秩序',
        '具有高度物質顯化能力'
      ],
      blindspots: [
        '工作狂',
        '過度壓抑情感',
        '權力與控制欲過強',
        '容易變得冷酷或集權',
        '只重視效率與成果',
        '把脆弱視為失敗',
        '可能被責任與成就綁架'
      ],
      lessons: [
        '在紀律中保有人性',
        '學習授權，而非掌控一切',
        '平衡權力、責任與慈悲',
        '接受休息與脆弱也是力量的一部分',
        '讓制度服務生命，而不是讓生命被制度吞噬'
      ],
      earlyChallenge: '權力焦慮、工作狂、物質執著',
      matureExpression: '操盤大型系統、重建秩序、創造長期影響',
      slogan: '我承載力量，因此我重建秩序。',
      visualNotes: '黑曜石、深金、鐵灰與暗紅色系；厚實甲殼帶幾何、城牆或機械結構紋路；巨角形成向前開路的視覺主軸；腳下秩序方陣或穩固基座；氣質強大而沉穩，避免攻擊性或邪惡感。'
    }
  };

  // ============================================================
  // 計算函式（純函式，無副作用，無 DOM 依賴）
  // ============================================================

  const MASTER_SET = [11, 22, 33, 44];

  function sumDigits(n) {
    let s = 0;
    n = Math.abs(Math.floor(n));
    while (n > 0) {
      s += n % 10;
      n = Math.floor(n / 10);
    }
    return s;
  }

  /**
   * 計算生命靈數
   * @param {number} year  西元年（4 位數）
   * @param {number} month 月（1-12）
   * @param {number} day   日（1-31）
   * @returns {{
   *   lifePath: number,        // 最終呈現的靈數（1-9 或 11/22/33/44）
   *   baseNumber: number,      // 基礎數（1-9；非卓越數時等於 lifePath）
   *   isMaster: boolean,       // 是否為卓越數
   *   displayLabel: string,    // '3' 或 '11／2'
   *   total: number,           // 生日數字總和（第一層）
   *   steps: number[]          // 縮減過程，方便除錯與教學展示
   * } | null}
   */
  function calcLifePathNumber(year, month, day) {
    if (!year || !month || !day) return null;
    const digits = String(year).padStart(4, '0') + String(month).padStart(2, '0') + String(day).padStart(2, '0');
    if (!/^\d{8}$/.test(digits)) return null;

    let current = 0;
    for (let i = 0; i < digits.length; i++) current += Number(digits[i]);

    const total = current;
    const steps = [current];

    // 每一層縮減都檢查卓越數
    while (current > 9 && MASTER_SET.indexOf(current) === -1) {
      current = sumDigits(current);
      steps.push(current);
    }

    const isMaster = MASTER_SET.indexOf(current) !== -1;
    const baseNumber = isMaster ? MASTER_NUMBERS[current].baseNumber : current;

    return {
      lifePath: current,
      baseNumber: baseNumber,
      isMaster: isMaster,
      displayLabel: isMaster ? MASTER_NUMBERS[current].displayLabel : String(current),
      total: total,
      steps: steps
    };
  }

  /**
   * 取得靈數完整資料
   * @param {number} lifePath 1-9 或 11/22/33/44
   * @returns {object|null} 查表資料；卓越數會額外附上 baseProfile（基礎數資料）
   */
  function getNumerologyProfile(lifePath) {
    if (MASTER_NUMBERS[lifePath]) {
      const master = MASTER_NUMBERS[lifePath];
      return Object.assign({}, master, {
        baseProfile: CORE_NUMBERS[master.baseNumber] || null
      });
    }
    return CORE_NUMBERS[lifePath] || null;
  }

  /**
   * 一步到位：生日 → 完整靈數解讀資料
   */
  function getProfileByBirthday(year, month, day) {
    const calc = calcLifePathNumber(year, month, day);
    if (!calc) return null;
    const profile = getNumerologyProfile(calc.lifePath);
    if (!profile) return null;
    return Object.assign({}, profile, { calc: calc });
  }

  // ============================================================
  // 對外介面
  // ============================================================

  window.NUMEROLOGY = {
    CORE_NUMBERS: CORE_NUMBERS,
    MASTER_NUMBERS: MASTER_NUMBERS,
    calcLifePathNumber: calcLifePathNumber,
    getNumerologyProfile: getNumerologyProfile,
    getProfileByBirthday: getProfileByBirthday
  };

})();
