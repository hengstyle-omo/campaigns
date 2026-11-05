# 起始雪境：僅加入 11 月測試版

已完成測試程式與新素材；尚未部署 GitHub Pages 或 Apps Script，未修改或清除任何線上資料。正式網站仍維持原 v66。

## 這次新增

- 每位初次進站者預設放入暖窗小屋、雪地小樹、兒童木雪橇；任何加入日期都能看到。
- 三件小物預設位於球底：左邊小樹、中間小屋、右邊木雪橇；高度比初版增加 20%，採現行 A 款的深藍、米白、暖金插畫風格，裝飾減量。
- 「你的起始雪境」可移除、重新放入、拖曳及縮放；Email 保存後可在相同 Email 讀回。
- 三件不計入 25 天收藏數、參與天數或禮遇資格。0／25 時仍有三件基礎物件。
- Day1 保留「第一場雪」，領取並按放入後才飄雪。
- 已有測試進度會補上尚無紀錄的基礎小物；明確移除的狀態不會在重新登入時恢復。
- 卡片預覽及 PNG、GIF、MP4 共用相同場景物件來源。
- 修正編輯模式方向鍵攔截大小滑桿的問題；輸入欄位仍使用原本鍵盤行為。

## 更新方式

1. 已有 11 月測試版者，覆蓋 `2026-dyson-christmas-test/`。只更新這個資料夾，不覆蓋正式 `2026-dyson-christmas/`。
2. 以包內 `GS/DysonProgress.gs` 取代原 Apps Script，儲存後在「管理部署作業」將原部署更新到「新版本」，沿用相同 `/exec` 網址。
3. **若已執行過 `setupNovemberTest` 且測試正常，不必再執行設定函式，也不用調整或清空 Sheet 欄位。**尚未建立測試分頁者才執行一次 `setupNovemberTest`。詳細初次設定見 SETUP.md。

GS 沿用同一份程式，但基礎小物只在 `november-test-2026` 環境啟用。正式環境不回傳預設小物，並拒絕擺放其 ID。測試前端會檢查新版服務能力；尚未更新 GS 時會要求更新，不會把測試進度寫進正式表。

## 下載包

- `Dyson-Christmas-November-Test.zip`：完整測試版，適合第一次安裝。
- `Dyson-Christmas-November-Test-Update.zip`：相對上一版 11 月測試包的差異檔，適合已安裝者。

兩包擇一使用；均包含同一份新版 GS 與更新說明。

## 素材與驗證

三張新圖以內建圖片生成工具製作，沿用目前 A 款小冷杉作為畫風參考，另轉存透明 WebP 並逐張核對 alpha 完全保留。提示詞記錄在 STARTER-PROMPTS.json。

固定檔名：
- `assets/images/scene/starter-cabin.webp`
- `assets/images/scene/starter-fir-tree.webp`
- `assets/images/scene/starter-wooden-sled.webp`

36 項程式檢查通過，包括新舊測試帳號預設、移除與位置保存、訪客匯入、正式資料相容性、兌換條件與管理權限。瀏覽器以本機假後端驗證零收藏、Email 保存後重整、大小滑桿、Day1 放入飄雪及 PNG 卡片製作。GIF／MP4 沿用既有共用渲染器，本次未另外重新轉出影片。未測試你的公開部署或真實 Google Sheet。
