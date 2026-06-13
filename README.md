# 八字命盤網站 · 上線完整指南

> 給沒有任何程式背景的你看的版本

這份文件帶你從零開始，在 **1.5 到 2 小時內**，把網站部署到網路上，讓全世界都能訪問。

整個流程不需要寫任何一行程式碼。

---

## 你會擁有什麼

完成本指南後，你將擁有：

- 一個可以公開訪問的網址（例如 `your-bazi.vercel.app`）
- 完整的八字排盤功能
- 自動追蹤訪客行為（Google Analytics）
- Email 訂閱名單收集功能
- 隱私權政策與服務條款頁面
- 自動部署：日後改檔案後上傳，網站自動更新

**總費用：NT$0**（不買網域的話）

---

## 檔案清單

打開資料夾，你會看到以下檔案：

```
bazi-website/
├── index.html       主網頁（含完整排盤功能）
├── app.js           核心程式（八字計算、互動）
├── privacy.html     隱私權政策
├── terms.html       服務條款
├── robots.txt       搜尋引擎索引規則
├── sitemap.xml      網站地圖
└── README.md        本檔案
```

這些檔案就是你的整個網站。後面我們要做的，是把這些檔案放到網路上。

---

## 上線流程總覽

```
步驟 1: 註冊 GitHub（5 分鐘）
   ↓
步驟 2: 上傳檔案到 GitHub（10 分鐘）
   ↓
步驟 3: 註冊 Vercel 並部署（10 分鐘）
   ↓
步驟 4: 設定 Google Analytics（15 分鐘）
   ↓
步驟 5: 設定 Email 收集（Formspree）（10 分鐘）
   ↓
步驟 6: 把網址貼進檔案、再上傳一次（5 分鐘）
   ↓
完成 · 網站正式上線
```

---

## 步驟 1：註冊 GitHub

GitHub 是專門存放網站檔案的免費服務，全世界工程師都用它。

1. 前往 https://github.com
2. 點右上角 `Sign up`
3. 輸入 Email、密碼、使用者名稱（建議用英文，例如 `your-name-bazi`）
4. 信箱會收到驗證碼，填入即可完成註冊

完成後請保留你的「使用者名稱」，後面會用到。

---

## 步驟 2：建立專案並上傳檔案

### 2-1 建立新的儲存庫（Repository）

1. 登入 GitHub 後，點右上角 `+` 號 → `New repository`
2. 在 `Repository name` 輸入：`bazi-website`
3. 選擇 `Public`（公開，免費方案才能用）
4. 不要勾選任何選項（保持空白）
5. 點 `Create repository`

### 2-2 上傳檔案

1. 進入剛建立的儲存庫頁面
2. 點 `uploading an existing file` 連結（或 `Add file` → `Upload files`）
3. 把資料夾內所有檔案（`index.html`、`app.js`、`privacy.html`、`terms.html`、`robots.txt`、`sitemap.xml`）一次拖曳進去
4. 在下方 `Commit changes` 輸入：`Initial upload`
5. 點綠色按鈕 `Commit changes`

上傳完成後，你會看到所有檔案出現在儲存庫頁面。

---

## 步驟 3：用 Vercel 把網站部署到網路上

Vercel 是免費的網站部署平台，幾乎所有靜態網站都用它。

### 3-1 註冊 Vercel

1. 前往 https://vercel.com
2. 點 `Sign Up`
3. 選擇 `Continue with GitHub`（用 GitHub 帳號登入）
4. 授權 Vercel 存取你的 GitHub

### 3-2 部署網站

1. 登入後，點 `Add New...` → `Project`
2. 在列表中找到 `bazi-website`，點 `Import`
3. 看到部署設定畫面，全部不用改，直接點 `Deploy`
4. 等待約 30-60 秒，看到「Congratulations」就完成了
5. 點 `Visit` 或 `Continue to Dashboard`

**此刻你已經有一個可以公開訪問的網址了**，例如：

```
https://bazi-website-abc123.vercel.app
```

把這個網址在手機或其他電腦打開，你會看到完整的網站。

---

## 步驟 4：設定 Google Analytics（追蹤訪客）

這一步讓你能看到「每天有多少人來」「他們從哪裡來」「停留多久」。

### 4-1 建立 GA4 帳號

1. 前往 https://analytics.google.com
2. 用 Google 帳號登入
3. 點 `開始測量`
4. 帳戶名稱：`八字命盤`
5. 資源名稱：`八字命盤網站`
6. 報表時區選擇 `台灣`，貨幣選 `新台幣`
7. 選擇 `網站`
8. 網站網址：貼上你剛才從 Vercel 拿到的網址
9. 串流名稱：`八字命盤`
10. 點 `建立串流`

### 4-2 取得追蹤 ID

設定完成後會看到一組類似 `G-XXXXXXXXXX` 的編號，這是你的「評估 ID」。**複製這組 ID 備用**。

### 4-3 把 ID 貼進網站

1. 回到 GitHub 的 `bazi-website` 儲存庫
2. 點 `index.html`
3. 點右上角鉛筆圖示（編輯）
4. 用 Ctrl+F（Mac 是 Cmd+F）搜尋 `GA_MEASUREMENT_ID`
5. 把 `const GA_MEASUREMENT_ID = '';` 改成你的實際 ID，例如 `const GA_MEASUREMENT_ID = 'G-ABC1234567';`
6. 拉到頁面最下方，點 `Commit changes`

如果你暫時不設定 GA，保持空字串即可；網站不會載入追蹤碼，也不會出現錯誤。

Vercel 會自動偵測到變更並重新部署，大約 30 秒後新版上線。

---

## 步驟 5：設定 Email 收集（Formspree）

當訪客在結果頁填寫 Email，這一步讓你能收到通知並收集名單。

### 5-1 註冊 Formspree

1. 前往 https://formspree.io
2. 用 Email 註冊（免費方案每月 50 筆，初期足夠）
3. 完成 Email 驗證

### 5-2 建立表單

1. 登入後點 `+ New Form`
2. 表單名稱：`八字命盤訂閱`
3. 你的 Email：填入要收訂閱通知的 Email
4. 點 `Create Form`
5. 在表單詳細頁面，會看到一組類似 `https://formspree.io/f/abcd1234` 的網址
6. **複製這個網址備用**

### 5-3 把網址貼進網站

1. 回到 GitHub 的 `bazi-website` 儲存庫
2. 點 `app.js`
3. 點右上角鉛筆圖示
4. 用 Ctrl+F 搜尋 `FORMSPREE_URL`
5. 把 `const FORMSPREE_URL = '';` 改成你的實際網址，例如 `const FORMSPREE_URL = 'https://formspree.io/f/abcd1234';`
6. 拉到底，點 `Commit changes`

如果你暫時不設定 Formspree，訂閱表單會顯示「訂閱功能設定中」，不會假裝已成功送出。

---

## 步驟 6：（選配）設定 Meta Pixel

如果你之後想投放 Facebook 廣告，現在先設定好。

1. 前往 https://www.facebook.com/business/tools/meta-pixel
2. 建立 Pixel，取一個名字（如「八字命盤 Pixel」）
3. 取得 Pixel ID（一組 15 位數字）
4. 在 GitHub 編輯 `index.html`，搜尋 `META_PIXEL_ID`
5. 把 `const META_PIXEL_ID = '';` 改成你的實際 ID
6. 儲存

**如果你還沒有 FB 廣告帳號，這步可以跳過，保持空字串即可。**

---

## 上線後該做的 5 件事

### 1. 將網站提交給 Google

前往 https://search.google.com/search-console

- 新增資源 → 網址前置字元
- 輸入你的網址（例如 `https://bazi-website-abc123.vercel.app/`）
- 用 HTML 標籤驗證所有權
- 把 sitemap 提交：`https://你的網址/sitemap.xml`

通常 3-7 天內你的網站會開始出現在 Google 搜尋結果中。

### 2. 在社群分享你的網站

把你的網址在以下管道發布：

- Facebook 個人頁、相關社團（命理、人生規劃類）
- Threads
- Line 群組（朋友、家人）
- Dcard 命理板

每次發布記得搭配一段共鳴文案，例如：

> 「最近做了一個免費的八字排盤工具，介面比傳統的清爽很多。
> 如果你最近在思考換工作、合夥或關係的問題，可以試試看自己的命局。」

### 3. 寫第一篇部落格文章（SEO 起步）

之後想擴增 SEO 流量，可以加一個 `articles/` 資料夾，放命理相關文章。例如：

- 〈八字日主是「丁火」的人，為什麼總是被誤解？〉
- 〈合夥前必看：用八字看誰是真正的夥伴〉
- 〈大運是什麼？怎麼看自己這 10 年的關鍵走勢？〉

這類文章在 Google 搜尋有穩定流量，且能不斷導流到排盤工具。

### 4. 觀察 GA4 數據

每週看一次 GA4，重點觀察：

- 每日訪客數
- 排盤完成率（觸發 `chart_generated` 事件的人比例）
- Email 訂閱率（觸發 `email_subscribe` 事件的人比例）
- 最熱門的流量來源

### 5. 累積 Email 名單

3 個月後，當你準備開放付費諮詢時，這份名單就是你的第一波客戶。

**寫一封誠懇的開放通知信**：

> 「謝謝你 3 個月前留下 Email。
> 經過數千份命盤的觀察，我整理了一套針對你日主特質的深度解析方法。
> 本月將開放 8 位深度諮詢名額，訂閱者享有 8 折優惠。」

---

## 升級網域（選配）

`bazi-website-abc123.vercel.app` 這種網址雖然能用，但不夠專業。如果預算允許：

1. 前往 Cloudflare Registrar（https://www.cloudflare.com/products/registrar/）或 GoDaddy 購買網域
2. 推薦命名方向：`bazi-light.com`、`mingpan.tw`、`zhiming.life`
3. 費用：約 NT$300-500/年
4. 購買後，回到 Vercel → Settings → Domains，把網域加入並照指示設定 DNS

整個過程約 30 分鐘，網站馬上會用新網址。

---

## 常見問題

**Q: 改了檔案，網站什麼時候會更新？**
A: 在 GitHub `Commit changes` 後，Vercel 通常 30-60 秒內自動部署完成。

**Q: 我不小心刪錯檔案怎麼辦？**
A: GitHub 會保留所有歷史版本，可以隨時回復。點選 `Commits` 找到要回復的版本即可。

**Q: 網站速度很慢？**
A: Vercel 在全球有 CDN 節點，速度通常極快。如果慢，可能是圖片或字型問題，可以告訴我，我幫你優化。

**Q: 想新增功能怎麼辦？**
A: 直接告訴我你想加什麼（例如：紫微斗數、流月查詢、會員系統），我可以再產出新的程式碼給你替換。

**Q: 安全嗎？個資會外洩嗎？**
A: 排盤計算完全在使用者的瀏覽器內進行，沒有任何資料傳到伺服器。Email 訂閱資料儲存在 Formspree，使用 HTTPS 加密。

---

## 需要幫忙時

任何步驟卡住，把錯誤訊息或截圖告訴我，我會引導你解決。

祝上線順利。
