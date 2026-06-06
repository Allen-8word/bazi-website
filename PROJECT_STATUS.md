# 八字命盤網站 · 專案進度中控文件

> **最後更新**：Phase 9-A 完成後
> **使用方式**：開新對話時，貼這份文件給 AI 作為背景，AI 即可快速進入狀態

---

## 一、給 AI 的開場指引（請先讀這段）

你好，我正在開發一個八字命盤網站。這是一份「中控文件」，記錄到目前為止所有重要決策、設計值、檔案結構與待辦事項。

請你做到以下幾件事：

1. **完整閱讀本文件**，理解專案的全貌
2. **嚴格遵守已決定的設計原則與技術約束**（特別是「26 個 ID 不能改」「零幻覺原則」「純前端零成本」）
3. **在動工前先盤點現況**，不要破壞既有功能
4. **每完成一個工作就打包 ZIP** 並列出需上傳的檔案
5. **使用 Mac 介面說明所有操作**（這位使用者用 Mac Pro）

---

## 二、專案核心定位

| 項目 | 說明 |
|---|---|
| **產品** | 八字命盤線上工具（傳統四柱排盤 + 五行分析 + 命格解讀） |
| **架構** | **純前端靜態網站**（HTML/CSS/JS） |
| **部署** | GitHub + Vercel（免費部署） |
| **成本** | 月費 NT$0（不接 LLM API、不要後端） |
| **目標使用者** | 對八字命理有興趣的一般用戶，行動裝置優先（手機 375-414px） |
| **設計風格** | Halo.Project Crystal Atelier 風格（暖米白底 + 香檳金重點 + 卡片化內容 + IG 友善） |

---

## 三、絕對不能違反的鐵則

### 🔴 鐵則 1：零幻覺原則

- **所有命理內容必須來自 PDF 知識庫**（A-1 ~ A-6.pdf、滴天髓.pdf）
- **不能憑空編造任何命理判斷、神煞、流月事件**
- 內容必須能追溯到 PDF 出處（建議在程式碼註解標註）
- **不接 LLM API 即時生成**（會幻覺、有成本）
- 採用「查表式」資料庫（data/*.js）

### 🔴 鐵則 2:不實宣稱禁令

以下文字**禁止出現**（之前已清理過）：
- ❌「10,000+ 已排命盤」「98% 使用者好評」（無依據統計）
- ❌「精準排盤」「精算」（絕對化用語）
- ❌ 任何「補運商品推銷」（符咒、改名、開光物、能量石）
- ❌「一定」「必須」「絕對」「會破財」（絕對語氣）

可以用的：
- ✅「依傳統四柱八字古法」「結合現代演算法」
- ✅「純前端」「本地運算」「即時生成」（事實陳述）
- ✅「僅供參考」「不構成決策建議」（免責聲明）

### 🔴 鐵則 3：26 個 ID 絕對不能改名

`app.js`（600 行）與 `analysis.js`（500 行）依賴這 26 個 ID。**改名 = 整個排盤功能壞掉**：

```
表單輸入：iName, iGender, iYear, iMonth, iDay, iHour, iLocation, iMinute, iEmail
按鈕：btnSubmit, btnBack, btnViewAnalysis
表單區：emailForm, emailSuccess, errMsg
頁面切換：page-home, page-result
結果區：rName, rDate, rPillars, rTags, rDyList, rFyGrid, rFyTitle
巴納姆卡：bnTitle, bnItems, bnBiz
```

**任何重構前都要驗證這 26 個 ID 是否完好。**

### 🔴 鐵則 4：CSS 必須引用 token 變數

- 所有顏色、字級、間距、圓角**必須使用 `var(--xxx)`**
- 禁止硬編碼 hex 值在元件 CSS 中（特殊情況如 rgba 覆蓋層除外）
- 每個 Phase 完成後檢查 `grep '#[0-9A-Fa-f]{3,6}' xxx.css` 應為 0

---

## 四、Mac 操作對照（給 AI 寫操作步驟用）

使用者用 **Mac Pro**，請以此為準：

| 通用操作 | Mac 鍵盤 |
|---|---|
| 開發者工具 | `Cmd + Option + I`（Chrome/Edge）/ `Cmd + Option + C`（Safari） |
| 強制刷新（清快取） | `Cmd + Shift + R` |
| 全選 | `Cmd + A` |
| 搜尋 | `Cmd + F` |
| 右鍵 | 二指點擊觸控板 / Control + 點擊 |

---

## 五、設計 Token 完整值（tokens.css）

### 5.1 品牌色

```css
--brand-primary: #CFAE85;          /* 柔和金（主要重點）*/
--brand-primary-dark: #A88555;     /* 中金（hover）*/
--brand-primary-light: #E2C8A2;    /* 淺金（漸層上緣）*/
```

> ⚠️ 注意：使用者**已要求調淡過一次**，舊值是 #B8956A / #8B6B3A / #D4B68A，**請勿改回**

### 5.2 背景表面

```css
--surface-page: #FAF6EF;           /* 頁面主背景（米色）*/
--surface-card: #FFFFFF;           /* 卡片背景（純白）*/
--surface-input: #F5EFE5;          /* 輸入框 / 內嵌資訊塊 */
--surface-muted: #F0E8D8;          /* 次要區塊 */
--surface-footer: #3D4258;         /* 頁尾柔藏青 */
```

> ⚠️ 頁尾色也調淡過，舊值是 #1A1F2E

### 5.3 文字色

```css
--text-primary: #2A2520;           /* 主文字（深棕黑）*/
--text-secondary: #5C544A;         /* 次文字（內文段落）*/
--text-muted: #8B7E6E;             /* 輔助文字（標籤、提示）*/
--text-on-brand: #FFFFFF;          /* 金色按鈕上的白字 */
--text-on-dark: #C9C4BC;           /* 深色頁尾上的文字 */
```

### 5.4 日主強調色（紫色系）

```css
--accent-daymaster: #6B4E8A;
--accent-daymaster-bg: #EFE6F5;
```

### 5.5 五行色彩系統

```css
--wood: #5C8A2F;   --wood-bg: #EAF3E5;
--fire: #B8612F;   --fire-bg: #FDF2E9;
--earth: #8B6B3A;  --earth-bg: #F5EFE5;
--metal: #5C544A;  --metal-bg: #F0EDE8;
--water: #4B6B9A;  --water-bg: #E9EFF5;
```

### 5.6 字體 / 字級 / 間距 / 圓角

```css
--font-sans:  "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
--font-serif: "Noto Serif TC", "Songti TC", "PMingLiU", serif;

/* 字級 */
--text-xs: 10px;   --text-sm: 11px;   --text-base: 12px;
--text-md: 13px;   --text-lg: 15px;   --text-xl: 18px;
--text-2xl: 22px;  --text-3xl: 28px;  --text-display: 44px;

/* 字重（只用 400/500，禁止 600/700/bold） */
--weight-regular: 400;
--weight-medium: 500;

/* 間距（8 階） */
--space-xs: 4px;   --space-sm: 8px;   --space-md: 12px;
--space-lg: 16px;  --space-xl: 20px;  --space-2xl: 24px;
--space-3xl: 32px; --space-4xl: 48px;

/* 圓角 */
--radius-sm: 6px;  --radius-md: 8px;  --radius-lg: 12px;
--radius-xl: 14px; --radius-2xl: 20px; --radius-pill: 999px;

/* 容器寬度 */
--container-desktop: 560px;
```

---

## 六、檔案結構（截至 Phase 9-A）

```
bazi-website/
├── index.html              首頁（含排盤表單 + 結果頁，page-home/page-result 切換）
├── app.js                  首頁邏輯（排盤、結果頁渲染、Phase 5-8 渲染函式）
├── analysis.html           詳細分析頁（姊姊感 6 段式報告）
├── analysis.js             分析頁邏輯（含 PDF 下載功能）
├── tokens.css              ⭐ Phase 1 設計 token
├── components.css          ⭐ Phase 2-9A 元件庫
├── layout.css              ⭐ Phase 3 Header + Footer
├── sections.css            ⭐ Phase 4 內容區塊（input-section + modal）
├── privacy.html / terms.html / robots.txt / sitemap.xml / README.md
│
├── data/                   命理知識庫（核心資產）
│   ├── dayMaster.js        10 日主特質（姊姊感版含 openingMetaphor/misunderstoodPoints/nodScenarios/shadowSide/lifeScript/tagline/keywords/imagery）
│   ├── branches.js         12 地支特質 + 藏干權重百分比
│   ├── tenGods.js          10 十神特質
│   ├── elements.js         五行旺弱 + 喜用神 FAVORABLE_ELEMENTS + 2000-2030 流年五行
│   └── engine.js           計算引擎 BAZI_ENGINE（window 全域）
│
└── dev/                    開發驗收頁（給 phase 視覺驗證用）
    ├── tokens-demo.html
    ├── components-demo.html
    ├── layout-demo.html
    ├── input-section-demo.html
    ├── daymaster-card-demo.html
    ├── bazi-chart-demo.html
    ├── five-elements-demo.html
    ├── energy-profile-demo.html
    └── dayun-timeline-demo.html
```

---

## 七、12 階段執行進度

### ✅ 已完成的 9 個階段

#### Phase 1 · 設計 Token 基礎建設
- 建立 `tokens.css`（56 個 CSS 變數）
- 載入 Google Fonts（Noto Sans TC + Noto Serif TC，只用 400/500 字重）
- 4 個 HTML 頁面引用 `/tokens.css`（**絕對路徑**，不是 `./` 或 `../`）

#### Phase 2 · 基礎元件庫
- 建立 `components.css`
- 5 種按鈕（btn-primary 金色漸層、btn-secondary、btn-dark、btn-pill 含 disabled）
- 輸入框（含 select 自訂金色箭頭、focus 金色描邊、input-group--date）
- 卡片（card、card--center、card-divider、card-title）
- 五行標籤（tag--wood/fire/earth/metal/water/daymaster + tag-group）
- 色點（dot + dot-label）
- 表單輔助（form-field、form-label、form-hint）

#### Phase 3 · 頁面框架
- 建立 `layout.css`
- Header 三層結構（brand-mark "BAZI · ATELIER" + page-title + page-subtitle）
- 漢堡選單按鈕（純 CSS 繪製，無 icon library）
- Footer 柔藏青 + 米白文字 + footer-nav

#### Phase 4 · 輸入區塊
- 建立 `sections.css`
- input-section 容器 + stat-line（金色數字強調）
- quick-links（10 個日主膠囊，目前 disabled）
- Modal 系統（modal-overlay + modal + modal-actions）含「不知道時辰」彈窗
- **同時重構 index.html**：移除「98% 好評」「10,000+」等不實宣稱，把舊變數值改為引用新 token

#### Phase 5 · 日主展示卡
- **為 `data/dayMaster.js` 10 個天干補一句話 tagline**
  - 甲：不向命運低頭的棟樑 / 乙：柔韌而不可忽視的存在
  - 丙：為他人照亮道路的太陽 / 丁：在暗處持續發光的燭火
  - 戊：讓人安心依靠的大地 / 己：默默滋養萬物的田園
  - 庚：鋒利而正直的劍 / 辛：細緻而珍貴的珠寶
  - 壬：奔流不息的大江 / 癸：潤物無聲的雨露
- 結果頁新增 `#rDayMasterCard` 容器
- index.html 載入 `data/dayMaster.js`
- app.js 新增 `renderDayMasterCard(dayStem)` 函式
  - 大字日主（紫色宋體 44px）
  - 圓形插畫（80x80 紫色背景 + 天干字）
  - 一句話定位、五行特質標籤、分享按鈕（disabled）

#### Phase 6 · 八字命盤
- index.html 載入 `branches.js` / `elements.js` / `engine.js`
- 結果頁四柱卡片下方新增 `#rBaziSummary` 容器
- app.js 新增 `renderBaziSummary(pillars, dayStem)` 函式
- 顯示：日主 / 命格 / 主要五行 / 用神（自動從 engine 計算）
- 日主柱視覺升級：`#page-result .pillar.day .pillar-box` 改紫色強調

#### Phase 7 · 五行分布
- components.css 新增 `.five-elements` / `.elements-grid` / `.element-cell` / `.element-cell--yongshen` 樣式
- 5 格等寬色點 + 用神金色邊框 + 右上「用」字圓徽章
- 結果頁新增 `#rFiveElementsCard` 容器
- app.js 新增 `renderFiveElements(pillars, dayStem)` 函式
- 顯示百分比（不是數量）

#### Phase 8 · 能量輪廓（精簡人格卡）
- **策略決定**：避開分析頁深度版的重複，做「速覽 + 引導 CTA」
- components.css 新增 `.energy-profile` / `.ep-block` / `.ep-block--talent`（淡紫）/ `.ep-block--warning`（淡橘）
- 結果頁新增 `#rEnergyProfile` 容器
- app.js 新增 `renderEnergyProfile(pillars, dayStem)` 函式
- 4 個小區塊：代表色 / 你是誰? / 你的天賦 / 需要注意
- 底部引導句：「想看完整的請點查看詳細分析」

#### Phase 9-A · 大運 Timeline
- **策略**：保留現有 `.dayun-list / .dayun-item` HTML 與 JS 邏輯，純 CSS 升級
- components.css 新增 15 個 `#page-result .dayun-*` 選擇器
- 視覺從「卡片式」升級為「時間軸節點式」（圓點 + 漸層線）
- 當前柱：放大圓點 + 金色光暈 + 金色文字
- 點擊切換邏輯不變

### ⏸️ 待完成的 2.5 個階段

#### Phase 9-B · 流年運勢預警（四面向評分）⏸️
**為何拆出來**：需要設計新的命理邏輯（流年十神 vs 四面向評分），是高複雜度的命理判斷。

**需要做的**：
- 規格書要的 ★★★★ ★★★ 四面向（事業/財運/感情/健康）評分
- **必須有命理依據，不能憑空打分**
- 思路：依「流年天干十神 vs 命主」對應到四個面向
  - 例：流年天干「正官」→ 事業 ★★★★、感情 ★★★（女命）/ ★★★（男命）
  - 例：流年天干「正財」→ 財運 ★★★★、感情 ★★★（男命）
- 需要新增資料表：`data/yearScoring.js`（十神 → 四面向評分映射）
- 來源依據：A-2.pdf P.1「十神基本含義」+ A-4.pdf 婚姻分析 + A-5.pdf 健康警訊

#### Phase 10 · 分享儲存區塊（IG 限動分享卡）⏸️
**重點**：純前端動態生成 9:16 PNG 圖片（用 `html2canvas`）
- 三種分享卡模板：日主人格卡 / 本月運勢卡 / 合盤卡
- 含品牌名 + QR code

#### Phase 11 · 行動裝置打磨 ⏸️
- 觸控目標最小 44x44px
- sticky CTA（捲到結果頁時分享按鈕固定底部）
- iOS notch 安全區域（`env(safe-area-inset-bottom)`）
- Loading 狀態（金色圓圈 spinner）

#### Phase 12 · 桌機版自適應 ✅ 已完成
- 在 `layout.css` 結尾新增 `@media (min-width: 768px)` 與 `@media (min-width: 1200px)` 區塊
- 三個視覺斷點：
  - 手機（&lt;768px）：背景 `--surface-page` (#FAF6EF)，內容貼齊頁面
  - 平板/桌機（768-1199px）：背景變深 `--surface-muted` (#F0E8D8)，內容區浮出陰影
  - 大桌機（1200px+）：背景再加深（#E8E0CE），對比更明顯
- 內容區永遠保持 560px max-width 居中
- 加入 `@media print` 規則：列印時自動關閉陰影與背景對比
- demo: `dev/desktop-responsive-demo.html`（含即時 viewport 寬度顯示）

### ⏸️ 待完成的 2.5 個階段

---

## 八、重要修補記錄

### 🐛 修補 1：付費鉤子年份同步 bug
- 問題：分析頁切換流年時，付費鉤子的年份不會跟著更新
- 解法：把 `renderPaywall` 暴露為 `window.renderPaywallSync`，並在 `renderFyContent` 結尾呼叫
- 同時修：初始年份保護（fy 不在 2000-2030 fallback 到當前年）

### 🐛 修補 2：PDF 下載方式改良
- 舊：用 `html2pdf.js`（中文斷字、SVG 跑版）
- 新：瀏覽器原生 `window.print()` + `@media print` + `@page A4` CSS
- 流程：點下載 → 引導視窗 → 列印對話框 → 使用者選「另存為 PDF」

### 🐛 修補 3：tokens.css 路徑問題
- 之前 demo 頁面用 `../tokens.css` 在 Vercel 偶爾載入失敗
- 統一改用**絕對路徑 `/tokens.css`**

### 🎨 修補 4：色彩調淡
- 香檳金 #B8956A → #CFAE85（提高 9% 亮度）
- 深金 #8B6B3A → #A88555（提高 18%）
- 深藏青 #1A1F2E → #3D4258（提高 35%）

---

## 九、現有功能完整列表（必須保留）

### 首頁（index.html / page-home）
- 國曆/農曆切換 tab
- 姓名（選填）、性別選擇
- 出生年月日時 select 4 個下拉
- 出生地（8 個城市）、分鐘（選填）
- 「立即排盤·免費」按鈕
- 同理問題區塊（你是否也在這些選擇前停留過？）
- 信任區（純前端 / 古法 / 即時）
- 快速連結（10 個日主膠囊，disabled）

### 結果頁（index.html / page-result）
- 姓名 · 男命/女命 + 國曆/農曆日期
- **日主展示卡（Phase 5）**
- **四柱八字 + 摘要（Phase 6）**
- **五行分布（Phase 7）**
- **能量輪廓（Phase 8）**
- **大運 Timeline（Phase 9-A）+ 流年（待 Phase 9-B 升級）**
- 巴納姆卡片（你的命局藏著一個矛盾）
- 查看詳細分析 CTA → 跳轉 analysis.html
- Email 訂閱表單

### 詳細分析頁（analysis.html）
- 命理分析報告（姊姊感 6 段式）
  1. 命主特質（含 3 個誤解 / 點頭場景 / 陰影面）
  2. 五行能量觀察
  3. 人格畫像（含主導/輔助十神 + 外在 vs 內在 + 人生劇本 + 核心張力）
  4. 流年運勢預警
  5. 給你的一句話（姊姊贈言）
  6. 更深的問題（付費鉤子）
- PDF 下載功能（瀏覽器原生列印）

---

## 十、給未來 AI 的工作 SOP

每次要做任何改動，請依序執行：

### 1. 動工前的盤點（必做）
```bash
# 查看現況
cd /home/claude/bazi-v3
ls -la                          # 確認所有檔案存在
grep -n "id=\"xxx\"" index.html # 確認要改的 ID 還在
```

### 2. 規劃變更影響
- 列出：哪些檔案會動？哪些 ID 會用到？是否影響 app.js?
- 用「影響範圍」清單給使用者確認

### 3. 漸進式修改
- 一次一個 str_replace，不要一次重寫整個檔案
- 修完一處立刻驗證（`node -c xxx.js` 檢查語法）

### 4. 完成後的安全驗證
```bash
# 必跑的檢查
node -c app.js && echo "✓ app.js"
node -c analysis.js && echo "✓ analysis.js"

# 26 個 ID 完整性檢查
MISSING=0
for id in iName iGender iYear iMonth iDay iHour iLocation iMinute iEmail \
          btnSubmit btnBack btnViewAnalysis emailForm emailSuccess errMsg \
          page-home page-result \
          rName rDate rPillars rTags rDyList rFyGrid rFyTitle \
          bnTitle bnItems bnBiz; do
  if ! grep -q "id=\"$id\"" index.html; then
    MISSING=$((MISSING+1))
    echo "✗ 缺失: $id"
  fi
done
if [ $MISSING -eq 0 ]; then echo "✅ 26 個 ID 完好"; fi
```

### 5. 打包並交付
```bash
rm -rf /mnt/user-data/outputs/bazi-website /mnt/user-data/outputs/bazi-website.zip
cp -r /home/claude/bazi-v3 /mnt/user-data/outputs/bazi-website
cd /mnt/user-data/outputs && zip -r bazi-website.zip bazi-website/ -x "*.DS_Store" > /dev/null
```

### 6. 給使用者明確的上傳清單
- 需要新增的檔案（哪些）
- 需要覆蓋的檔案（哪些）
- 驗收網址（demo 頁面與實際頁面）
- 預期看到什麼

---

## 十一、姊姊感寫作風格（給未來擴充內容用）

如果未來需要新增任何命理文案，請遵守這 8 條鐵則：

1. **動詞優先**：用「你會...」「你常常...」而非「你是一個...」
2. **具體場景優先於抽象形容詞**：
   - ❌「你重視細節」
   - ✅「你會在 LINE 訊息送出前檢查標點符號」
3. **內外落差**：寫出「別人眼中的你 vs 你自己知道的你」
4. **點頭場景**：4-6 個極具體生活畫面（用戶會截圖分享的金句）
5. **翻譯命理術語**：「七殺主導」要立刻翻譯成「天生的開路者，遇到困難會衝上去」
6. **大運寫成人生劇本**：用「20-28 歲 / 28-35 歲 / 35 歲後」時間軸敘事
7. **流年要具體到月份**（依命理資料）
8. **姊姊感不是大師感**：略帶幽默、略帶銳利、略帶溫柔；不說教、不俯視、不神秘化

### 禁止項目
- ❌ 補運商品推銷
- ❌ 死亡、絕症、重大災難預測
- ❌「一定」「必須」「絕對」絕對語氣
- ❌ 中途插入「以下僅供參考」
- ❌ 批評其他流派或命理師
- ❌ 對重大人生決策下定論（該不該結婚、離婚、辭職）
- ❌ ChatGPT 口吻（條列式分析、過度客觀、缺乏溫度）
- ❌ 編造命盤資料中沒有的細節（神煞、大運、流月特定事件）

---

## 十二、PDF 知識庫對照表

| PDF | 內容 | 用途 |
|---|---|---|
| A-1.pdf（9 頁） | 天干外顯性格、地支內在性格、藏干權重、喜用神忌神、十神對照、流年五行 | `data/dayMaster.js` `data/branches.js` `data/elements.js` |
| A-2.pdf（10 頁） | 四柱含意、十神基本含義、五行旺弱影響性格、十神屬性詳表 | `data/tenGods.js` |
| A-3.pdf（18 頁） | 五行生剋、論命步驟、身強身弱判斷 | `data/engine.js` 計算邏輯 |
| A-4.pdf | 婚姻分析 | Phase 2 擴充用（未實作） |
| A-5.pdf | 健康警訊 | Phase 2 擴充用（未實作） |
| A-6.pdf | 十神相處 | Phase 2 擴充用（未實作） |
| 滴天髓.pdf（118 頁） | 經典命理典籍 | Phase 2 擴充用（未實作） |

---

## 十三、使用者偏好（重要）

- 偏好保留**零成本架構**
- 偏好**不在畫面顯示「PDF 來源章節」**，但要在程式碼註解中標註
- 重視「**不幻覺、嚴謹**」高於「客製化深度」
- 部署平台：**GitHub + Vercel**
- 作業系統：**Mac Pro**（操作指引一律用 Mac 介面）
- 慣用流程：解壓 ZIP → 拖曳上傳 GitHub → 等 Vercel 部署 → `Cmd + Shift + R` 強制刷新
- 溝通風格：每個 Phase 開始前先盤點，列出影響範圍

---

## 十四、新對話接續的「3 個快速問題」

開新對話時，使用者只需貼上本文件 + 說出以下任一句子，AI 即可立刻動工：

| 你要做的事 | 對 AI 說 |
|---|---|
| 繼續 Phase 9-B | 「請繼續 Phase 9-B：流年運勢四面向評分」 |
| 跳到 Phase 10 | 「請開始 Phase 10：IG 限動分享卡」 |
| 跳到 Phase 11 | 「請開始 Phase 11：行動裝置打磨」 |
| 跳到 Phase 12 | 「請開始 Phase 12：桌機自適應」 |
| 修補既有 bug | 「請看截圖，幫我修這個問題」+ 上傳截圖 |
| 微調文案 | 「請把某某日主的 tagline 改成 XXX」 |

---

## 十五、最終提醒（給未來 AI）

1. 這是**已上線運作的網站**，每次改動都會直接影響使用者
2. **永遠先盤點再動工**
3. **每個 Phase 完成都要打包 ZIP** + 驗證 26 個 ID
4. **不要過度承諾**：誠實告知這次改動的範圍與風險
5. **保持「姊姊感」溝通**：略帶溫暖、略帶務實，不囉嗦

—— 文件結束 ——

> **產出日期**：Phase 9-A 完成後
> **下一步建議**：開新對話做 Phase 9-B（流年四面向評分）
