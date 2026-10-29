# 新管理者日期模擬排查：已取得後端實測

2026/10/29以使用者指定的新管理者Email，對活動設定中的正式進度服務執行connect測試。只測試該帳號，未變更行銷同意、未領取禮物、未寫入模擬日期或修改Sheet權限；連線會更新服務既有的最近連線紀錄。

後端實際回傳：ok=true、serviceVersion=7、rulesVersion=3、permissionsVersion=2、year=2026；isAdmin=false、canPreview=false、hasExclusiveCollection=false。

可確認：不是前端在收到管理者true之後仍隱藏入口，也不是目前前端不接受服務版本。服務實際將此Email視為沒有管理者及專屬收藏權限。

尚無法確認：部署服務連到哪份試算表、Email是否匹配正確列、欄位如何解析、現用部署是否仍含較早的讀取邏輯。網站的/exec網址不提供Apps Script原始碼；現有獨立DysonProgress.gs是舊版，不能用來覆蓋現用服務。

下一步：從目前修改的Sheet開啟擴充功能→Apps Script，提供目前Code.gs完整內容。需比對其試算表選擇、Email查找與是否管理者／是否有專屬收藏欄位解析，再修正及更新原部署。未確認前不改Sheet表頭、不清空資料。

正常設計應每次連線讀取Sheet名單：後續新增Email或勾選管理者，只需重新載入進度，不應每次重部署。這次v65未包含GS修正，也未放寬前端權限判斷。
