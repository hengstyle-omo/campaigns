# v48 更新方式

本包以已上傳的 **v47** 為基準。這包是 v48。

1. 將 `2026-dyson-christmas/` 內檔案依原路徑合併至 GitHub 的 `campaigns/2026-dyson-christmas/`。覆蓋同名檔，新增另外的檔案；不要先刪除整個活動資料夾。
2. 本次務必一起上傳新增的 `assets/js/media-mp4.js`、`assets/audio/card-jingle-bells-5s-aac-v48.m4a`、`assets/images/bonus/bonus-otter-gray-face-v48.png`。
3. 提交並等 GitHub Pages 部署完成，重新整理。新資源標記為 `20261024-show-otter-v48`，若仍見舊畫面可強制重新整理。
4. 管理者模擬 12/25，放入星光秀：暖光與單條星光先播放 2.5 秒、dyson 在第 5 秒完整畫完，停留至第 6 秒，接祝福，9.5 秒收尾。
5. 製作 GIF／MP4，確認各 5 秒，dyson 完整畫完並停留，最後有 MERRY CHRISTMAS。建議先用預設配樂驗收，再試自己錄音。製作較慢時可等候或取消；未完成的錄製不會標示成功。
6. 有專屬收藏權限的帳號查看海獺：臉改為自然灰白、短寬口鼻、微微笑，耳朵略大。原本擺放資料沿用，不用移除再收藏。

**不需更新 Apps Script、重新部署後端或執行 setup。** Google Sheet 欄位、管理與專屬收藏權限、收藏及優惠進度均沿用。

## 演出節奏

| 階段 | 網頁 | GIF／MP4 |
| --- | --- | --- |
| 暖光與單條星光 | 0–2.5 秒 | 0–1 秒 |
| 完整描繪 dyson | 2.5–5 秒 | 1–2.8 秒 |
| 完整標誌停留 | 5–6 秒 | 2.8–3.4 秒 |
| MERRY CHRISTMAS 淡入、停留、收尾 | 6–9.5 秒 | 3.4–5 秒 |

## 檔案

更新原有 `index.html`、`assets/css/style.css`、`assets/js/app.js`、`assets/js/config.js`、`README.md`、`VERSION.txt`；新增本說明、`ASSET-NOTES-v48.md` 以及上面列出的三個資源，共 11 個檔案。原 `UPDATE-v47.md` 可保留當歷程，不影響活動。

## 驗證與使用限制

實際輸出已核對：GIF 5 秒／40 格；MP4 影像 5 秒／60 格、12 fps，AAC 音訊 5 秒；完成的 dyson 與最後祝福都在成品內。原影像僅約 0.71 秒／8 格但音訊約 5 秒的問題檔，會被完整性檢查拒絕。

MP4 優先逐格編碼。沒有 AAC 編碼能力且未錄音時，使用同一首歌曲的預編碼版本。錄音仍須瀏覽器支援 AAC 編碼或 MP4 錄製；相容模式在錄製期間請保持此頁可見。無法完成時，文字、錄音與擺設會保留，可重試或選 GIF／PNG。其他手機與 Safari 的錄音／相容模式仍需實機驗收。

這次沒有直接上傳 GitHub 或寫入正式 Google Sheet。素材仍為公開前端內容；包內不含管理者 Email、帳密或參加者名單。
