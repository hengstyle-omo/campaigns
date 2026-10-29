# 2026 Dyson 聖誕收藏 · v59 白藍金主樹與花環點綴版

本次更新 Day 2 積雪小冷杉（稍減厚度與陰影）、Day 12 金燈主聖誕樹（白藍金）及 Day 14 聖誕花環（少量金葉、紅莓），固定檔名直接覆蓋。其他素材維持 v58。

v58 僅更新 Day 21：融合提供的積雪斜屋頂、中央山牆、窗棚與既有三層百貨立面、大櫥窗及 dyson 招牌，保留正面視角與微立體紙雕。其他素材維持 v57。

v57 調整 Day 18 聖誕鐘樓與 Day 21 聖誕百貨為正面視角；百貨改為三層商業立面，加入 dyson 招牌、大型展示櫥窗及玻璃入口。兩張圖片沿用固定檔名覆蓋，其他素材維持 v56。

延續 v55 完整清理與 GA4 版，重製 scene 中除 Day 23 聖誕老公公以外的 20 件收藏圖，包含飛躍馴鹿及 3 張效果縮圖。統一為簡潔、有厚度的微立體紙雕，減少表面裝飾。

四款 Dyson 產品、十款額外動物、聖誕老公公、水晶球背景、Logo、音樂與影片保留原始內容。活動規則、雲端服務、權限及 GA4 埋點沿用。

## 部署

請以本包 `2026-dyson-christmas/` 完整替換 GitHub 的 `campaigns/2026-dyson-christmas/`，包含新增及刪除檔案。保留同一活動網址，不需更新 Apps Script 或執行 setup。

scene 圖檔全部使用固定名稱，無 vxxx 字尾。Day 4 改名為 santa-hat、Day 11 改名為 shooting-star；其他改名見 UPDATE.md。後續覆蓋固定檔名，透過 URL 查詢參數更新快取，不再建立版本圖檔。

曾在素材工具中保存的本次 17 件造景圖片會改用新圖；收藏紀錄、擺放位置與其餘自訂圖片保留。

## 文件

- `SCENE-PREVIEW.webp`：21 件 scene 收藏圖總覽（含保留的聖誕老公公）。
- `PREVIEW.webp`：全部 35 件收藏總覽。
- `PROMPTS.json`：本次內建圖片生成功能的逐張提示詞與固定輸出檔名。
- `REVIEW.md`：架構清理說明及驗證結果。
- `ASSET-MANIFEST.json`：48 個現用媒體 SHA-256。
- `CLEANUP.json`：原有 37 個舊檔刪除紀錄及本次 5 個改名對照。
- `node scripts/check-assets.mjs`：檢查缺圖、誤覆蓋及未登記舊素材。
- `GA-TRACKING.md`：GA4 的 15 種事件（含 page_view）及後台設定。

GA4 沿用 G-QF125DEKNR、activity_id=dyson_2026_christmas，請勿重貼其他活動的基本碼。正式 GA4 接收需於部署後確認即時報表。
