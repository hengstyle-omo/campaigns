# v72 測試版差異更新

僅供 `campaigns/2026-dyson-christmas-test/`，尚未部署線上，正式版不變。本包累積 v70、v71 的前端調整，適用現有 v69～v71 測試網站。

## 更新內容

1. 在物件卡片按「移除水晶球內」後，自動關閉該卡片；放入後同樣關閉。從收藏清單操作時不會關閉其他物件的卡片。
2. 日期圖例只有三種：鎖頭「日期未到」、金勾「已領取・未放入」、金邊＋金勾「已領取・已放入」。移除「可領取」圖例；當天及過去尚未領取日期仍可正常領取。格內符號15px、說明圖例18px。
3. 首頁「累積收藏，解鎖聖誕禮遇」補上獨立商品 JPG，並與「我的禮遇」視窗使用相同的 rewards 圖片；球內商品仍使用 products 去背圖。護照讀取 dyson-passport.jpg。
4. BP10 沿用12/16才公開商品圖片的規則，此前顯示新品預告；本包已附圖片。
5. 測試頁上方標示 v72，並更新首頁引用的 JS／CSS 版本，方便確認實際更新成功。

保留v70：左樹、中間放大的小屋、右雪橇；場景只在當次頁面有效；Email記錄實際參與日期及10天護照資格；同日只算一次且不需連續；使用已確認的5行分享文案。每日收藏及卡片任務規則維持。

## 請在正確層級上傳

本包解壓後直接有 `index.html`、`assets/`、`VERSION.txt` 與本說明，沒有外層同名網站資料夾。

1. 在GitHub開啟 `campaigns/2026-dyson-christmas-test/`。
2. 選「Add file → Upload files」，拖入解壓後的 `index.html`、`assets/` 和 `VERSION.txt`，再 Commit changes。
3. 請勿把下載後的外層資料夾一起拖入，避免變成 `2026-dyson-christmas-test/2026-dyson-christmas-test/`。
4. 等 Pages 部署成功，重新開啟原測試網址，上方必須出現「11 月一般使用者測試版 · v72」。如還是舊四種圖例，代表首頁或app.js仍未覆蓋到正確層級。

不需要刪除網站其他檔案，也不需要清空或改動Sheet。此次沒有新的GS程式修改：若GS已更新並部署v70，這次不用再部署；尚未更新者須先使用v70/v71完整包附的GS並更新原部署，否則新版的帳號同步會提示服務尚未更新。

## 圖片固定檔名

- assets/images/rewards/dyson-HD19.jpg
- assets/images/rewards/dyson-SV50.jpg
- assets/images/rewards/dyson-HJ10.jpg
- assets/images/rewards/dyson-BP10.jpg
- assets/images/rewards/dyson-passport.jpg

手機與電腦已用本機預覽確認圖檔載入；未提交真實Email或寫入真實Sheet。
