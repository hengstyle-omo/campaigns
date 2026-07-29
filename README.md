# Dyson Campaign Pages

Dyson 品牌短期活動頁與互動工具專案。每個活動各自放在獨立資料夾中，可分別維護、測試與透過 GitHub Pages 發布。

## 專案網址

- GitHub Pages 根目錄：<https://hengstyle-omo.github.io/dyson/>

各活動網址依資料夾名稱組成：

```text
https://hengstyle-omo.github.io/dyson/{campaign-folder}/
```

## 專案結構

```text
dyson/
├── README.md
├── hd19-boarding-pass/
│   ├── index.html
│   └── assets/
│       ├── audio/
│       └── images/
├── future-campaign/
│   ├── index.html
│   └── assets/
│       ├── audio/
│       └── images/
└── future-tool/
    ├── index.html
    └── assets/
        └── images/
```

每個資料夾應視為一個可獨立運作的活動頁或小工具，避免不同活動共用同名素材後互相影響。

## 活動清單

| 資料夾 | 專案名稱 | 類型 | 狀態 | 網址 |
| --- | --- | --- | --- | --- |
| `hd19-boarding-pass` | Dyson Supersonic™ Travel HD19 七夕登機證 | Campaign | 開發中 | [開啟活動頁](https://hengstyle-omo.github.io/dyson/hd19-boarding-pass/) |

新增活動時，請同步更新此表格。

## 資料夾命名原則

建議使用小寫英文、數字與連字號：

```text
{product-or-topic}-{campaign-or-tool}
```

例如：

```text
hd19-boarding-pass
hj10-air-purifier
product-comparison-tool
```

命名原則：

- 使用小寫英文。
- 單字之間使用 `-`。
- 名稱需能辨識產品與活動用途。
- 活動發布後盡量不要重新命名，以免原網址失效。
- 不要在資料夾名稱使用空格、中文或特殊符號。

## 單一活動建議結構

```text
campaign-folder/
├── index.html
└── assets/
    ├── audio/
    ├── fonts/
    └── images/
```

短期單頁活動可維持單一 `index.html`，將 HTML、CSS 與 JavaScript 放在同一份檔案中，方便快速發布與封存。

符合以下情況時，再考慮拆分成 `style.css`、`app.js` 或共用模組：

- 活動會長期維護。
- 多個活動需要共用相同功能。
- 多人同時開發。
- 單一 HTML 已難以閱讀或測試。
- 功能將發展為正式內部工具。

## 本機測試

此 Repository 目前以純前端頁面為主，不需要後端服務。建議使用本機靜態伺服器測試，避免瀏覽器對本機檔案的安全限制。

在 `dyson/` 根目錄執行：

```bash
python3 -m http.server 8000
```

例如開啟 HD19 活動：

```text
http://localhost:8000/hd19-boarding-pass/
```

## GitHub Pages

活動合併至 GitHub Pages 使用的分支後，可透過資料夾路徑直接瀏覽。

部署前請確認：

- 活動資料夾內有 `index.html`。
- HTML 內的相對路徑正確。
- 素材檔名與大小寫完全一致。
- 正式網址、分享網址與 QR Code 已同步。
- 優惠按鈕連結正確。
- 手機版與桌機版皆已測試。
- GA4 即時報表可收到 `page_view` 與互動事件。
- 不應上傳密碼、API Key 或其他機密資料。

## 共用開發原則

### 活動獨立

每個活動的圖片、音效與其他素材預設放在自己的 `assets/` 中。即使不同活動使用相同品牌 Logo，也建議先各自保留，確保單一活動資料夾可獨立封存與搬移。

若未來累積多個活動且共用素材維護成本明顯增加，再評估建立：

```text
shared/
├── images/
├── scripts/
└── styles/
```

在尚未形成穩定共用規格前，不建議過早抽成共用檔案。

### 素材命名

建議格式：

```text
{brand}_{campaign}_{purpose}.{extension}
```

例如：

```text
dyson_campaign_coupon_qrcode.png
dyson_hd19_product.png
dyson_hd19_boarding_final_call.mp3
```

### RWD

每個活動至少確認以下環境：

- iOS Safari
- Android Chrome
- Windows Chrome／Edge
- macOS Chrome／Safari
- 13 吋筆電常見視窗尺寸

### 圖片下載與分享

- 圖片輸出功能需確認跨網域素材的 CORS 設定。
- Web Share API 通常需要 HTTPS。
- 分享功能必須由使用者點擊觸發。
- 不同瀏覽器及接收 App 可能只接受圖片、文字或網址中的部分內容。
- 若分享文案另外複製至剪貼簿，介面需清楚提醒使用者貼上。

## GA4 追蹤規範

多個活動可以使用同一個 GA4 Property，再透過活動識別參數比較不同頁面的成效。

建議所有活動至少設定：

| 參數 | 說明 | 範例 |
| --- | --- | --- |
| `page_type` | 頁面類型 | `campaign`、`internal_tool` |
| `campaign_id` | 活動唯一識別碼 | `dyson_hd19_2026_valentine` |
| `campaign_name` | 活動名稱 | `dyson hd19 七夕情人節` |
| `brand_name` | 品牌名稱 | `dyson` |

常用事件命名：

| 事件名稱 | 說明 |
| --- | --- |
| `select_theme` | 選擇配色主題 |
| `select_vibe` | 選擇活動情境 |
| `select_card_format` | 選擇圖片或卡片版型 |
| `randomize_message` | 使用隨機文案 |
| `flip_card` | 翻轉卡片 |
| `play_audio` | 播放音效 |
| `download_image` | 下載圖片 |
| `share_image` | 分享圖片 |
| `click_offer` | 點擊優惠或導購連結 |

各活動可以使用更明確的事件名稱，但同類操作應盡量維持一致，方便跨活動比較。

若需要在 GA4 報表查看自訂事件參數值，須至 GA4 建立對應的自訂維度。

## 隱私與資料蒐集

活動頁如使用 GA4 或蒐集使用者輸入內容，應提供清楚的隱私權說明，包括：

- 蒐集哪些資料。
- 資料使用目的。
- 使用的第三方分析服務。
- 資料保存與管理方式。
- 是否蒐集可直接識別個人的資料。

非必要時，不應要求使用者輸入姓名、電話、電子郵件或其他個人資料。

## HD19 七夕登機證

資料夾：

```text
hd19-boarding-pass/
```

正式活動網址：

<https://hlh.tw/dyson-hd19-boarding-pass>

主要功能：

- 粉霧玫瑰與普魯士藍主題
- 橫式與直式登機證
- 卡片正反面
- 圖片下載與分享
- 分享文案複製
- 優惠按鈕與 QR Code
- 機場廣播
- GA4 互動事件追蹤
- 隱私權聲明

HD19 QR Code 素材：

```text
hd19-boarding-pass/assets/images/dyson_campaign_coupon_qrcode.png
```

## 維護方式

新增或修改活動時：

1. 在獨立分支完成開發。
2. 本機確認頁面、圖片、分享與追蹤功能。
3. 檢查不同裝置與視窗尺寸。
4. 合併至 GitHub Pages 發布分支。
5. 確認正式網址可正常開啟。
6. 更新 README 活動清單與狀態。
