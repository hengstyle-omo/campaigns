# 2026 Dyson 聖誕收藏 · v62 A 圖正式版 · 指定百貨與注意事項

17 個造景採用已確認的 A「原版北歐紋理」，包含飛躍馴鹿及橘貓聖誕老公公；Day 21 百貨依指定參考改為簡潔正面雪屋型。活動介紹新增完整五點「注意事項」，可展開閱讀。一般活動頁直接顯示 A 圖；本包不含 A/B 比較入口、按鈕、程式或 B 圖資料夾。

## 更新正式活動

完整包：將 `2026-dyson-christmas/` 內容放入原本 GitHub 的 `campaigns/2026-dyson-christmas/`。

本次 v62 差異包適用 v61：覆蓋同一活動資料夾內的同名檔案即可。尚未套用 v61 者請使用完整包。圖片、`assets/js/config.js`、`assets/js/app.js` 及 `index.html` 必須一起更新，才能同步更新瀏覽圖、詳情圖與球內圖片。

全部圖片沿用固定 WebP 檔名，不增加 vxxx 字尾。網址查詢參數更新瀏覽器快取，本次百貨的過期自訂圖片會自動略過，其他 A 圖延續 v61 的識別。已收藏項目、擺放位置、縮放、Email 與正式進度保留。新版之後上傳的自訂圖仍可正常保存。

四款 Dyson 產品、十款額外動物、三款效果縮圖、動態特效、水晶球背景、Logo、音樂、影片、字型、GA4 與雲端服務沿用正式版。Apps Script 不變，不需要執行 setup。

## 檢查與素材

- `SCENE-PREVIEW.webp`：17 個 A 圖、1 個指定百貨與 3 個既有效果縮圖。
- `PREVIEW.webp`：全部 35 個收藏的現用圖片。
- `ASSET-MANIFEST.json`：48 個現用媒體的大小及 SHA-256。
- `PROMPTS.json`：A 圖來源與可追溯提示詞。
- `node scripts/check-assets.mjs`：檢查缺圖、誤覆蓋與未登記媒體。
- `GA-TRACKING.md`：沿用 G-QF125DEKNR 與既有事件，不需另外貼 GA 基本碼。

此檔案已改為正式 A 圖程式，尚未代為上傳 GitHub。原本獨立的 `dyson-ab-preview/` 不影響本活動，可自行保留作比較紀錄。
