# Dyson 聖誕活動 v84 測試差異包

1. 在測試 Google Sheet 的 Apps Script 貼上 `GS/DysonProgress.gs`。既有 v79 測試表可直接沿用。新測試表先執行 `setupSimpleNovemberTest`。
2. 到「部署 → 管理部署 → 編輯」，將測試站所用 Web App 更新為新版本。保留原 `/exec` 網址。測試期間，指令碼屬性 `DYSON_NOV_TEST_ENABLED` 留空或設為 `true`。
3. 在 v83 測試版之上，以包內同名路徑覆蓋 `index.html`、`assets/js/app.js`、`assets/js/config.js`。若站台使用不同的 Apps Script，請將它的 `/exec` 網址填回 `config.js` 的 `endpoint`。
4. 以台灣 11/01–11/25 對應 12 月同日驗收，資料寫入 `Participants_Test_2026`。商品券與護照夾只顯示測試結果。

「保存紀錄」維持原名。行銷同意獨立選填，初始未勾選。已保存的選擇會在同一 Email 載入後顯示。個人 Email 可直接填寫，無驗證流程。

商品券依開放日顯示，卡片可自由製作、下載或分享。每日簽到以後端當天的台灣日期為準。測試資料與正式資料各自保存。
