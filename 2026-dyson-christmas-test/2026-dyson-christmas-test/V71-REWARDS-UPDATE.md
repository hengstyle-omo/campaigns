# v71 我的禮遇獨立 JPG 圖片更新（測試版）

基準：v70 測試完整包。僅圖片讀取、對應 CSS 與前端快取版本調整。未部署線上，未變更 GS、Google Sheet、解鎖規則、日期或折價券內容。

## 上傳方式

將 `2026-dyson-christmas-test/` 中檔案合併覆蓋至 GitHub campaigns 同名資料夾；本包已含你上傳的五張 JPG，檔名大小寫完整保留。更新完成若仍看到舊圖，請強制重新整理。

- HD19：`assets/images/rewards/dyson-HD19.jpg`
- SV50：`assets/images/rewards/dyson-SV50.jpg`
- HJ10：`assets/images/rewards/dyson-HJ10.jpg`
- BP10：`assets/images/rewards/dyson-BP10.jpg`
- 護照：`assets/images/rewards/dyson-passport.jpg`

「我的禮遇」商品圖改為一般 img，各自讀取 rewards 的 JPG；水晶球及收藏瀏覽仍使用原本 products 圖片。圖片完整等比例顯示，不裁切。BP10 沿用 12/16 才公開圖片的規則，此前仍為新品預告。護照禮不再讀取已刪除的 WEBP。

本包是差異包，請合併覆蓋，不要先刪除網站其他檔案。不用更新 GS 或重新部署 Apps Script。保留 v70 的 11 月測試、參與紀錄、當次頁面擺放及新分享文案；測試圖片也已隨本包附上。

往後只換圖時，使用相同檔名與 JPG 格式即可；不需要改檔名或副檔名。圖片快取修訂標記位於 config.js 的 rewardImages。
