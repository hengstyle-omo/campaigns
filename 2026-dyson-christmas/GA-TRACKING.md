# GA4 追蹤設定

## 可沿用的部分

沿用使用者提供的 `G-QF125DEKNR`，資料會進入同一個 GA4 資源。事件皆加上本活動的共用欄位：

```js
{
  page_type: 'campaign',
  activity_id: 'dyson_2026_christmas',
  activity_name: 'dyson 2026 聖誕收藏',
  brand_name: 'dyson'
}
```

原七夕活動的 activity_id／activity_name 不可原樣沿用，否則報表會混在一起。本版已放入 `assets/js/analytics.js`，由 index.html 載入，不需再另外貼第二份 gtag 基本碼。

## 事件與觸發時機

本活動是單頁網站，進站送一次 page_view；彈窗使用各自的互動事件，不製造額外頁面瀏覽。

| 事件名稱 | 觸發時機 | 主要參數 |
| --- | --- | --- |
| `page_view` | 每次文件載入一次 | 共用活動欄位、清理後的 page_location |
| `campaign_start` | 本次頁面第一次有效按下「開始收藏」 | 共用活動欄位 |
| `progress_save` | 使用者主動保存／找回 Email 進度，後端確認成功 | method=email |
| `gift_view` | 開啟已領取的物件介紹／回看收藏 | gift_day、gift_name、gift_type、product_model |
| `gift_collect` | 新增一份正式收藏成功；重開舊收藏不再計入 | gift_day、gift_name、gift_type、collected_count |
| `globe_item_change` | 正式放入／移除物件 | gift_day、action=add/remove、placed_count |
| `starlight_show` | 開始／重播正式星光秀 | action=play |
| `card_open` | 開啟製作卡片 | placed_count |
| `card_generate` | 實際編碼完成或失敗；取用已生成檔不重計 | card_format、status=success/failure、has_voice、has_bgm |
| `card_download` | 觸發卡片檔案下載 | card_format |
| `card_share` | 原生分享 API 成功返回 | card_format、method=native |
| `coupon_open` | 打開「我的禮遇」視窗；畫面重繪不重計 | unlocked_count |
| `coupon_copy` | 複製優惠序號成功 | coupon_id |
| `product_click` | 點「了解產品詳情」 | gift_day、product_model、清理後的 link_url |
| `globe_control` | 搖晃、氣流、動態、重設擺放按鈕 | action=按鈕固定 ID |

這些活動物件採用自訂事件，不將動物或造景當成電商商品送 view_item／purchase，以維持原有電商商品報表的意義。

## KPI 解讀

- gift_collect 的事件數是領取份數；參與人數請看使用者數，勿將 25 份收藏直接視為 25 人。
- progress_save 是保存／找回進度成功，包含回訪，不等同新增名單數。新名單與跨裝置 Email 進度仍以既有 Sheet 為準。
- card_generate 分析製作成功率時需使用 status；正式下載／分享可分別看 card_download／card_share。
- 下載事件代表已觸發瀏覽器下載，無法保證使用者最後真的保存在裝置。
- 分享取消不計 card_share；裝置不支援分享而改下載時只計 card_download。
- coupon_copy 代表複製序號，實際核銷／下單須由商城或訂單資料確認。
- collected_count、placed_count、unlocked_count 是當下狀態值，不應直接跨事件相加作總人數或總收藏。

## GA4 後台需確認

1. 確認這個 Measurement ID 就是你希望沿用的網站資料串流；若要分開 GA4 資源，改 analytics.js 的 measurementId。
2. 共用的 page_type、activity_id、activity_name、brand_name 若在前一活動已建立自訂維度，可直接共用。
3. 建議新增事件範圍自訂維度：gift_day、gift_name、gift_type、action、card_format、status、coupon_id；product_model、method、has_voice、has_bgm 可依報表需要補上。不要重建既有同名定義。
4. 部署後在「即時」報表確認 activity_id 與事件；一般探索報表的自訂維度需要時間開始出現資料。
5. 可依活動 KPI 將 card_download、card_share、coupon_copy 設為主要事件。本版沒有在 GA4 帳號內自動修改設定。

## 資料邊界與測試

本版自訂事件只允許固定參數，不讀取或送出 Email、收件人、留言、署名、錄音內容、實際優惠序號或自訂圖片。網址會移除非流量歸因參數與 hash，保留不含 Email 的 UTM／廣告歸因參數。

日期模擬與企劃預覽期間不送上述自訂活動事件。基本頁面瀏覽仍代表真正開啟網頁；管理者 IP／GA4 內部流量排除由既有 GA4 設定處理。

localhost、檔案直接開啟時不載入 Google tag。驗證使用本機測試旗標與攔截的假後端，沒有將測試 Email、事件或任何訊息送到真實 Google Analytics／Sheet，也沒有進行原生裝置分享。

## LINE 段落

使用者提供的 openExternalBrowser 段落是 LINE 外開瀏覽器行為，和 GA 追蹤分開。本版保留目前瀏覽器行為；如之後加入轉跳，應在 Google tag 初始化之前處理，讓轉跳前頁面不先計一次 page_view。

## 官方參考

- [Google tag 設定與事件](https://developers.google.com/tag-platform/gtagjs/configure)
- [GA4 事件埋設](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [避免蒐集個人識別資訊](https://support.google.com/analytics/answer/6366371)
- [事件範圍自訂維度](https://support.google.com/analytics/answer/14239696)
