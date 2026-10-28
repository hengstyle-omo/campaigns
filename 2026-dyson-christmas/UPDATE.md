# v54 同名覆蓋更新

基準為 v52 或 v53。將本包 `2026-dyson-christmas/` 內全部檔案依原路徑合併至 GitHub 的 `campaigns/2026-dyson-christmas/`，覆蓋同名檔。不要刪除整個活動資料夾。

## 圖片檔必須一起上傳

- `assets/images/scene/day-12-christmas-tree.webp`：本次上傳的主聖誕樹原檔。
- `assets/images/scene/day-19-candy-cane.webp`：紅、綠、米白條紋拐杖糖。
- `assets/images/scene/day-04-christmas-house.webp`：沿舊檔名的聖誕帽，延續 v53 補正。
- `assets/images/scene/day-11-reindeer.webp`：沿舊檔名的流星，延續 v53 補正。

一併覆蓋本包 index.html、app.js、config.js，讓圖片快取與縮圖同步更新。圖檔不加版本後綴，無須手動改名。

部署完成後重新整理，確認 Day 12 主樹與上傳圖一致、Day 19 有紅綠條紋，Day 4／11 仍為聖誕帽／流星。主樹與拐杖糖的舊自訂圖片快取會更新；從 v52 更新者也會一併套用 v53 聖誕帽與流星的素材補正，其他自訂素材保留。原收藏與已保存位置不變，不需清除網站資料，Apps Script 無需更新。
