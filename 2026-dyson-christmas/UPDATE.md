# v49 更新方式

基準為 v48。請先保留目前網站，再將本包 `2026-dyson-christmas/` 內檔案按相同路徑合併至 GitHub 的 `campaigns/2026-dyson-christmas/`，覆蓋同名檔並新增效果代表圖；不需刪除舊素材或整個活動資料夾。

## 需上傳

- `index.html`
- `assets/js/app.js`、`assets/js/config.js`
- 本包 `assets/images/scene/` 內的 19 張 WebP；原有造景及背景使用原本檔名直接覆蓋，3 張效果代表圖為新增檔案
- `assets/video/welcome.mp4`、`assets/video/welcome-poster.webp`
- `README.md`、`VERSION.txt`、`UPDATE.md`、`ASSET-NOTES.md`、`PREVIEW.webp`

GitHub Pages 部署完成後重新整理，新資源標記為 `20261027-quiet-paper-overwrite`。若快取仍顯示舊圖，可強制重新整理。新版會略過舊造景的自訂圖片快取，保留原收藏與位置。

**本次不需更新 Apps Script、重新部署後端或執行 setup。** 四款產品及所有動物不在差異包內，直接沿用目前網站的原檔；不要刪除 `assets/images/products/`、`assets/images/bonus/` 或原本兩款馴鹿、貓咪聖誕老人圖片。

## 驗收

1. 開啟活動介紹，影片與封面應使用簡化紙雕雪境。
2. 收藏列表中，新造景應為素面與少量紙層，沒有舊版密集葉紋；第一場雪、金色雪花及星光秀都有同風格代表圖。
3. 放入原產品、動物與新造景，確認可以繼續拖曳、縮放及保存位置。
4. 製作 PNG／GIF／MP4，確認皆使用同一新背景與素材。GIF／MP4 仍為五秒；星光秀網頁仍為 9.5 秒。

`PREVIEW.webp` 是新素材總覽；詳細範圍、保留項目與生成提示詞見 `ASSET-NOTES.md`。本包僅做視覺更新，原有音樂解鎖與音訊行為沿用 v48。

## 同名覆蓋版

更新素材不再使用 `paper-v49` 資料夾或 `-v49` 檔名。15 件造景、空球背景與介紹影片沿用 v48 的原路徑與檔名，三款效果代表圖使用固定名稱。程式以網址查詢參數更新快取，不改圖片實際檔名。若已上傳前一包，仍直接覆蓋本包即可；網站不再引用舊的 `paper-v49` 目錄。
