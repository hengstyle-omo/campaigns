# 正式版 v133 r1

將 2026-dyson-christmas 資料夾放入 campaigns/，網址為 https://hengstyle-omo.github.io/campaigns/2026-dyson-christmas/ 。採完整取代資料夾，以移除舊的多餘素材；請保留其他活動。

已啟用 GA4：G-QF125DEKNR，包含頁面瀏覽與現有互動事件。使用 HTTPS 正式網址測試；localhost 不送 GA。管理員日期模擬與設定對話框操作不送互動事件。未傳送 Email、卡片內容或錄音。

使用台灣實際日期；12/01–12/25 開放活動，11 月不會自動模擬 12 月。正式收藏、圖片、抽獎紀錄與測試版分開保存。公開拆禮物模擬日期、指定抽中、模擬完成及重設控制已停用。

保留既有 Apps Script endpoint；未部署或修改後端。正式前請驗證後端 environment=production、clockMode=real、campaignUpdateVersion=85、environmentVersion=1、passportDaysRequired=5。若出現「活動與進度服務版本不一致」，必須更新為正式環境後端設定。

拆禮物仍沿用既有前端隨機及瀏覽器紀錄，並非後端防重抽系統，不代表已完成正式抽獎防作弊驗證。

上傳後請確認 GA 即時報表或 DebugView 收到 page_view 與 card_open 等事件；此打包僅驗證程式送出邏輯，尚未確認 GA 實際收件。另測試 Email 保存、重新整理讀回、五天簽到、實際領券、PNG/GIF/MP4 匯出、手機分享與桌面複製。測試打卡及抽獎日期需由管理員模擬驗收。

分享仍使用既有 https://hlh.tw/2026-dyson-christmas 短網址，請確認重新導向正式活動。OG 圖片與 canonical 已改為正式 GitHub Pages 路徑。

保留 v133 減重、偶發粉色極光與 v133 r1 圖片底部填滿修正。未實際上傳或部署網站。
