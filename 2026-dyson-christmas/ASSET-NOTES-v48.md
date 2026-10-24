# v48 素材說明

## 海獺

檔案：`assets/images/bonus/bonus-otter-gray-face-v48.png`。
以內建 ImageGen 編輯既有海獺，參考使用者提供的實拍臉型，再依確認補上微笑與稍大的耳朵。保留原躺姿、金色星星金幣、小石頭與毛絨插畫風格。真正透明背景；未使用程式重畫臉部或耳朵。

最終編輯提示詞：

 > Use case: precise-object-edit, tiny expression edit. IMAGE 1 is the exact sea otter sprite to preserve, IMAGE 2 is the real SEA OTTER facial anatomy reference. User prefers image 1's natural real-sea-otter appearance. Keep image 1's head proportions, head outline, relatively small natural dark eyes, short wide muzzle and black nose, natural gray-white face fur, pose, body, paws, tail, coin, stone and soft furry style IDENTICAL. Do not beautify or redesign the face. ONLY add an almost imperceptible gentle closed-mouth smile by slightly softening/lifting the mouth corners; no curved cartoon grin, no inflated cheeks, no tongue, no teeth. Ears should remain small flat sea-otter ears close to the head, at most 3–5 percent more visible than image 1, with no enlarged round bear ears. This is a sea otter, not a teddy bear or river otter. Match image 2's anatomy while keeping the exact image 1 face. Genuinely transparent PNG background with zero alpha outside the fine furry silhouette, no haze, no halo, no shadow, no ground. Entire animal and held items within frame, no text.

## 五秒 AAC 配樂

檔案：`assets/audio/card-jingle-bells-5s-aac-v48.m4a`。
由既有 `card-jingle-bells-5s-pcm-v38.wav` 轉為 AAC 44.1 kHz、單聲道、64 kbps，套用原本 0.43 音量、0.25 秒淡入與最後 0.45 秒淡出。僅供無 AAC 編碼能力、使用預設配樂且沒有自錄聲音的逐格 MP4 使用。音樂來源與授權沿用既有 `assets/audio/CREDITS.md`，輸出仍附作者與 CC BY 4.0 署名。

## 程式參考

MP4 使用既有 `media-codecs.js` 的 mp4-muxer，新增 `media-mp4.js` 用於檢查自產檔案與讀取預編碼 AAC，不引入 CDN 或外部服務。逐格編碼的時間戳與完成 flush 依 WebCodecs 規格；相容模式的手動影格請求依 Media Capture from DOM Elements。

- https://www.w3.org/TR/webcodecs/
- https://www.w3.org/TR/mediacapture-fromelement/
