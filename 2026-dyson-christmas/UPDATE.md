# v58 雪屋百貨融合版

本次以 v57 為基準，只更新 Day 21 聖誕百貨：結合上傳參考的積雪斜屋頂、中央山牆與遮棚，保留目前寬大正面的三層百貨、展示櫥窗、玻璃入口及清楚的 dyson 招牌。材質維持簡潔微立體紙雕。

圖片仍覆蓋 day-21-department-store.webp，不新增帶版本號的圖片；同步更新 config.js、index.html 快取識別與百貨舊自訂圖片識別。鐘樓及其他圖片與程式保留。

這是完整替換包。請同步替換同一活動資料夾內的圖片與程式，收藏及位置保留，Apps Script 與 GA4 沿用。

## 延續 v57 的更新說明

本次以 v56 為基準，只修改 Day 18 鐘樓與 Day 21 百貨的圖片及相關快取識別。鐘樓為正面；百貨為正面三層店面，新增 dyson 招牌、展示櫥窗與玻璃入口。實體檔名不加版本號，仍是 day-18-clock-tower.webp 與 day-21-department-store.webp。

這是完整替換包，可直接完整替換相同活動資料夾；必須同時上傳圖片、config.js、app.js 與 index.html。兩張圖片的過期自訂快取將自動略過，收藏進度與擺放位置保留。Apps Script 與 GA4 沿用。

## 延續 v56 的部署與改名說明

1. 保留原活動資料夾備份。
2. 以本包 `2026-dyson-christmas/` 完整替換 `campaigns/2026-dyson-christmas/`，保留同一活動網址。讓 Git 同時記錄改名及舊檔刪除，避免合併後殘留舊圖片。
3. GitHub Pages 部署完成後重新整理，確認下方瀏覽圖與水晶球都呈現新紙雕圖，尤其 Day 4 聖誕帽與 Day 11 流星。

本次重製 20 張 scene 收藏圖，聖誕老公公僅改名。水晶球背景、四款產品、十款額外動物不重製。圖片本身不含任何版本字樣。

| 舊檔名 | 固定新檔名 |
| --- | --- |
| day-04-christmas-house.webp | day-04-santa-hat.webp |
| day-08-leaping-reindeer-paper-v28.webp | day-08-leaping-reindeer.webp |
| day-11-reindeer.webp | day-11-shooting-star.webp |
| day-21-department-store-dyson-v38.webp | day-21-department-store.webp |
| day-23-fat-cat-santa-tail-v34.webp | day-23-cat-santa.webp |

已同步 config.js、index.html 快取識別與舊造景素材快取遷移；下方縮圖及球內渲染共用新圖。不要只上傳程式而漏傳圖片，或只上傳圖片而漏傳設定檔。

不清空網站資料、不更換 Apps Script、不需執行 setup。既有收藏、擺放、Email 進度與 GA4 埋點沿用。
