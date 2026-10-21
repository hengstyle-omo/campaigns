# Dyson 聖誕收藏：GitHub Pages＋Google Sheet（獨立素材版）

## 表頭格式修正（保留既有資料）

如果畫面顯示「進度表欄位與程式版本不同」，但 37 個欄名與順序看起來都正確，請更新為新版 `DysonProgress.gs`。新版能識別被 Sheet 轉為日期的 `12/01` 等表頭，也能處理無補零日期、首尾空白及不可見字元。先驗證全部欄位順序一致，才將第一列表頭轉為固定文字；第 2 列以後的參加紀錄不會被清除或搬動。真正不同或順序錯置的表頭仍會停止寫入，並指出如 `H1` 的具體位置。

操作：在 Apps Script 貼上新版 `.gs` → 儲存 → 執行 `setup` →「部署 → 管理部署作業 → 編輯 → 新版本 → 部署」。沿用原部署，`/exec` 網址保持不變。完成後重新整理 HTTPS 活動頁，再填 Email 保存。

## 模擬進度跨瀏覽器同步（本次更新）

目前正式進度已能寫入 Sheet。本次將管理帳號 `hengstyle.data@gmail.com` 的測試收藏、球內擺放、物件位置，以及模擬日期／多日勾選，同步到同一份 Sheet 的 **`Preview_2026`** 分頁。

既有活動更新：

1. 在原 Sheet 的 Apps Script 貼上新版 `DysonProgress.gs`，儲存並執行 `setup`。會自動建立 `Preview_2026`；正式 `Participants_2026` 的欄位與資料保留。
2. **部署 → 管理部署作業 → 鉛筆 → 版本：新版本 → 部署**。沿用原部署，網址不變。
3. 解壓縮 `Dyson-preview-sync-update.zip`，將其中 `2026-dyson-christmas` 資料夾拖到既有 GitHub 儲存庫根目錄上傳，提交變更。只會更新 `index.html`、`assets/js/app.js` 和 `README.md`；圖片、音樂、設定無須重傳。也可使用完整網站 ZIP。
4. 在原本有模擬進度的瀏覽器重新整理，填相同管理 Email。若測試分頁尚無紀錄，舊瀏覽器的模擬收藏會自動匯入；原本未保存的多日勾選則以已收藏日期重建。
5. 操作後等待保存完成；在另一個瀏覽器開啟活動頁，按「保存進度」填相同 Email。會還原已同步的模擬畫面；曾按「結束模擬」則先顯示正式日期，測試收藏仍保留。

一般 Email 仍只同步正式進度。測試資料不會增加正式已領取數或正式禮遇，測試分頁也不收集或更新行銷意願。未收到成功回覆時會顯示「進度待同步」，可按重試；未送出的編輯保存在同一瀏覽器。

不同裝置的修改會依收到順序套用；同一物件同時編輯時，以後送到的修改為準。其他日期的收藏不會因為舊裝置送出單一物件修改而被清除。跨裝置切換前，請先等同步完成。

這版以自行填寫的 Email 識別，不需要密碼或驗證碼，也不寄確認信。

## 1. 建立 Sheet，貼上程式

1. 建立一份新的私人 Google Sheet。不用先建立欄位，也不要開啟「知道連結的人皆可編輯」。
2. 在 Sheet 選 **擴充功能 → Apps Script**。
3. 刪除原本的範例程式，將 `DysonProgress.gs` 的全部內容貼進去。
4. 修改程式最上面的這一行：

   ```javascript
   ALLOWED_ORIGINS: ['https://hengstyle-omo.github.io'],
   ```

   例如活動網址為 `https://waker-example.github.io/dyson/`，填入 `https://waker-example.github.io`，不含 `/dyson/`，也不加最後的 `/`。若用自訂網域，就填實際的 HTTPS 網域。
5. 儲存，選擇上方函式 **setup**，按 **執行**，由你自己的帳號完成授權。
6. Sheet 會自動建立 `Participants_2026` 和 `Preview_2026` 分頁及所有欄位；重跑 setup 不會清除紀錄。

## 2. 部署一次

1. Apps Script 右上角 **部署 → 新增部署作業**。
2. 類型選 **網頁應用程式**。
3. 執行身分選 **我**。
4. 誰可以存取選 **所有人**，讓參加者不用登入 Google 帳號。
5. 按部署，複製結尾為 **/exec** 的網頁應用程式網址。

若看不到「所有人」，先檢查該 Google 帳號或公司的部署政策。不要把 Google Sheet 改成公開可編輯來取代這一步。

## 3. 設定網站並上傳 GitHub

1. 解壓縮 `Dyson-GitHub-Sheets.zip`，取得 **`2026-dyson-christmas`** 資料夾。裡面只有網站檔案，沒有 `.gs`。
2. 用文字編輯器開啟 `assets/js/config.js`，在檔案最上方找到：

   ```javascript
   window.DYSON_CLOUD_CONFIG = {
     "endpoint": ""
   };
   ```

3. 本次已填入你提供的 Apps Script `/exec` 部署網址，可直接上傳，不必再填。上方空白範例僅說明欄位格式；日後換部署時再修改 `endpoint`。**不要填 Google Sheet 的試算表網址。**
4. 在既有的 **hengstyle-omo / campaigns** 儲存庫根目錄選 **Add file → Upload files**，將整個 **`2026-dyson-christmas`** 資料夾拖進上傳區，等候檔案上傳完成後按 **Commit changes**。它會與既有的其他活動資料夾並列。
5. 至 GitHub 儲存庫 **Settings → Pages**，選擇 **Deploy from a branch**，選 `main`、`/(root)`，儲存。若沿用既有 Pages 設定，放入它指定的發布資料夾即可。
6. 等候部署完成，以 GitHub 提供的 HTTPS 網址開啟。

上傳完成後應看到 `2026-dyson-christmas/index.html`、`2026-dyson-christmas/assets/` 及 `2026-dyson-christmas/README.md`。請保留這一層活動資料夾，並避免重複包成 `2026-dyson-christmas/2026-dyson-christmas/`。

使用預設 GitHub Pages 網域時，活動網址為 **https://hengstyle-omo.github.io/campaigns/2026-dyson-christmas/**。素材均使用相對路徑，會跟隨活動資料夾載入。Apps Script 的 `ALLOWED_ORIGINS` 填 **`https://hengstyle-omo.github.io`**，不包含活動路徑。

`DysonProgress.gs` 另外提供，請貼在 Sheet 的 Apps Script；GitHub 不會執行 `.gs`，網站包也不需要它。Google Sheet 維持私人，參加者透過部署服務保存進度。

管理者也可在 HTTPS 活動頁的「企劃預覽與 25 天內容管理 → 管理設定：連接 Google Sheet」輸入網址，按「套用並下載 config.js」，再用下載檔取代 GitHub 的 `assets/js/config.js`。此按鈕只下載檔案，不會自動更新 GitHub。

## 4. 第一次測試

請以 GitHub Pages 的 **HTTPS 活動網址** 開啟。正式同步不能在 `file://` 本機檔案中完成。

- 填一般 Email：可保存進度；看不到日期模擬或內容管理。
- 填 `hengstyle.data@gmail.com`：顯示多日日期模擬與內容管理。
- 日期模擬可在活動開始前測試 25 天；測試收藏寫入 `Preview_2026`，不會變成正式領取紀錄。
- 換 Email：原本球內物件與收藏會切換到新 Email 的紀錄。
- 另一台裝置填相同 Email：載入該 Email 已保存的領取與擺放；管理 Email 也會載入測試收藏與模擬日期。
- 正式活動為 **2026/12/1～12/25、Asia/Taipei**；每天僅能新領取當日禮物，過期不能補開。
- 累計成功領取 5、10、15、20、25 個日期，依序解鎖五份禮遇。放入／移除物件不影響累計數。
- 每件物品仍要自行按「放入水晶球內」，不會自動放入。

活動開始前，一般 Email 無法正式開禮物，這是正常的日期規則。若要確認正式領取的端到端結果，須在活動當日測試；請不要修改正式服務日期來補寫歷史進度。

## Sheet 會看到什麼

`Participants_2026` 每個 Email 一列：Email_Key、Email、首次及最近參加台灣時間、行銷意願與更新時間、同意文字版本、12/1～12/25 的領取時間、已領取數、已解鎖禮遇數、球內擺放、物件位置及資料版本。

`Preview_2026` 只記錄指定管理 Email 的測試資料，另有「模擬日期」「模擬勾選日期_JSON」。日期欄是實際進行測試的台灣時間，並非偽造正式領取時間；行銷相關欄位留空。結束模擬會清空「模擬日期」，保留收藏。清空測試收藏則會同步清除測試分頁中的收藏與擺放。

- 「同意行銷」預設不勾選；不勾選也能參加。
- 之後再行銷，可篩選「同意行銷」為 TRUE 的紀錄。
- 日期欄位、統計與 JSON 由程式維護，請勿手動改欄位名稱或排序。
- 同步失敗時會顯示「進度待同步」，可開啟「我的進度」重試。未成功同步的擺放會在同一瀏覽器保留，重新載入後再次嘗試；正式領取要收到後端確認才會計入。

## 這版的身分方式

Email 是參加者自行填寫的識別資料，未驗證信箱持有人。因此指定 Email 的模擬入口是顯示限制；知道該 Email 的人也能填寫使用。正式服務無論哪個 Email 都不接受以模擬日期補開，且不提供查詢全部名單的介面。

過去純本機版的測試收藏只會在測試分頁尚無紀錄時匯入 `Preview_2026`，不會匯入正式名單。若其他瀏覽器已先建立測試紀錄，以 Sheet 為準，不會用另一份舊本機收藏覆蓋。

## 更新程式與常見問題

- 改了 `.gs`：儲存後至 **部署 → 管理部署作業 → 編輯 → 版本選「新版本」→ 部署**。沿用原部署即可保留 `/exec` 網址。
- 改了 GitHub 帳號或自訂網域：更新 `ALLOWED_ORIGINS` 後重新部署。
- 30 秒沒有回覆：確認 `/exec` 網址正確、存取權為「所有人」、已執行 setup、GitHub 網域在允許名單，以及目前使用最新部署版本。
- 模擬按鈕沒有出現：先確認目前填寫的 Email 是 `hengstyle.data@gmail.com`；其他 Email 原本就不顯示。
- 用 Email 找不到舊進度：檢查拼寫與連接的部署是否相同。大小寫與前後空白會統一處理，但不會自動合併 Gmail 的加號別名或不同拼寫。

本次已完成程式測試與兩個獨立瀏覽器環境的同步測試。這次的新程式尚待你更新 Apps Script 部署與 GitHub；完成後仍需以實際活動網址確認新測試分頁寫入。

## 網站檔案與維護

| 路徑 | 放什麼 | 如何維護 |
| --- | --- | --- |
| `index.html` | 活動頁面與各功能視窗 | 網頁入口，保留在活動資料夾最上層 |
| `assets/images/brand/` | 你提供的白色、黑色 Dyson 原始透明 Logo | 頁首預設白色；兩款原圖均原樣保留 |
| `assets/images/products/` | 五款 Dyson 透明產品 PNG | 可同名替換，保留透明背景與產品完整輪廓 |
| `assets/images/scene/` | 水晶球底圖、聖誕樹、老人、雪橇等 | 同名替換或同步修改 config.js 路徑 |
| `assets/audio/` | 三首聖誕音樂、5 秒卡片配樂及授權說明 | 保留 CREDITS.md 與頁面作者標示 |
| `assets/fonts/` | 思源黑體繁體台灣版 400／700 WOFF2、OFL 授權 | 已附實際字型檔，不必另找下載 |
| `assets/css/style.css` | 頁面樣式 | 調整版面、字型、色彩 |
| `assets/js/app.js` | 遊戲、收藏、進度同步與卡片功能 | 行為程式 |
| `assets/js/config.js` | 活動設定、素材清單、Apps Script `/exec` 網址 | 通常只需要先修改頂端 endpoint |
| `assets/js/media-codecs.js` | GIF、MP4 製作程式 | 已保留第三方 MIT 授權標示 |
| `README.md` | 設定與維護說明 | 一併放 GitHub 方便查閱 |

- 五款產品為 HD19、PF01、HJ10、BP10、SV50。第 15 天為 HJ10，介紹與連結已更新。
- 圖片、音樂、字型已從原本單一 HTML 中拆出，均以實際檔案隨包附上。網站不依賴額外的圖片或字型 CDN，也不需要 npm 或建置指令。
- 目前為繁體中文介面；文字位於 HTML、app.js 與 config.js，沒有額外的多語言包。
- 管理者改了日程介紹、優惠或自訂圖片後，可按「下載活動設定 config.js」，將下載檔取代 GitHub 的 `assets/js/config.js`。自訂上傳圖會隨設定檔保存；原有內建圖仍保留為獨立圖片檔。
- 設定匯出不包含參加者 Email、收藏、模擬進度、卡片留言或錄音。個人資料不需要上傳 GitHub。
- 單獨雙擊 index.html 可檢視部分畫面，但雲端同步、錄音與媒體製作請用 HTTPS 活動網址測試；不要只移動 index.html 而漏帶 assets。
- 字型使用 Adobe 思源黑體，授權全文在 `assets/fonts/OFL.txt`；音樂來源與修改說明在 `assets/audio/CREDITS.md`。卡片與頁面的音樂授權標示請保留。
- 舊瀏覽器的 HP12 介紹與舊產品自訂圖不會蓋回新版。已領取日期、累積進度及個人儲存的位置仍保留。

## 2026 活動命名與 Logo

- 活動資料夾固定為 `2026-dyson-christmas`。主標題為「把聖誕 一點一點收藏」，沒有逗號或句號。
- 頁首使用你提供的白色透明 PNG Logo，保留原始比例；黑色版本也在 `assets/images/brand/`。
- `assets/js/config.js` 的 `DYSON_GAME_CONFIG.logoVariant` 預設為 `"white"`。若未來改成淺色頁首，可設為 `"black"` 使用附上的黑色 Logo。圖片路徑集中在 `DYSON_ASSETS.brandLogos`。
