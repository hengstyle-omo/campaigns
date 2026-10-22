/* Dyson 聖誕活動設定。先填入下方 endpoint，再上傳整包網站。
 * endpoint 是 Apps Script 的公開 /exec 服務網址；請勿放入密碼或私人金鑰。
 * 所有素材路徑以 index.html 所在位置為基準。
 */
window.DYSON_CLOUD_CONFIG = {
  "endpoint": "https://script.google.com/macros/s/AKfycbyNiw73qY4Q_jBwMO9J5KBxrJsWbLrm_aNJ53MBRXyNcxLq8WHcGHPPr4HLs-jA8DqvBg/exec"
};

window.DYSON_GAME_CONFIG = {
  "version": 21,
  "cardShareUrl": "https://hlh.tw/2026-dyson-christmas",
  "cardShareText": "我把一點雪、一點星光，還有想你的心意，都裝進這顆水晶球了。",
  "visualStyle": "paper-relief-v1",
  "scheduleRevision": "20261021-four-products-v2",
  "year": 2026,
  "timeZone": "Asia/Taipei",
  "items": [
    {
      "day": 1,
      "type": "雪境光效",
      "name": "第一場雪",
      "description": "放入後解鎖豐富的白雪飄落，遠近雪片以不同速度落下，球底仍保留薄雪。",
      "benefit": null,
      "assetNeed": "粒子效果，不需產品圖片",
      "effect": "snow",
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 1
    },
    {
      "day": 2,
      "type": "聖誕造景",
      "name": "積雪小冷杉",
      "description": "加入第一棵帶薄雪的綠色小樹。",
      "benefit": null,
      "assetNeed": "寫實積雪冷杉去背 PNG／WebP",
      "layout": {
        "x": 425,
        "y": 795,
        "h": 260
      },
      "atlas": 0,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 2
    },
    {
      "day": 3,
      "type": "角色小物",
      "name": "金色緞帶小禮物",
      "description": "加入一組深藍禮盒與金色緞帶。",
      "benefit": null,
      "assetNeed": "完整禮盒及緞帶去背圖",
      "layout": {
        "x": 395,
        "y": 861,
        "h": 135
      },
      "atlas": 1,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 3
    },
    {
      "day": 4,
      "type": "聖誕造景",
      "name": "暖光聖誕屋",
      "description": "加入窗戶透出暖光的小屋。",
      "benefit": null,
      "assetNeed": "暖光小屋去背圖，保留屋頂積雪",
      "layout": {
        "x": 874,
        "y": 800,
        "h": 210
      },
      "atlas": 2,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 5
    },
    {
      "day": 5,
      "type": "Dyson 產品",
      "name": "HD19 旅行吹風機",
      "description": "把普魯士藍的 Supersonic™ Travel HD19 放進雪境，收藏一份輕巧的旅行靈感。",
      "benefit": null,
      "assetNeed": "HD19 微立體透明 PNG，保留產品輪廓與配色",
      "layout": {
        "x": 830,
        "y": 858,
        "h": 227
      },
      "atlas": null,
      "hint": "今天有一款 Dyson 微縮科技，等待你親手放進雪境。",
      "product": {
        "model": "HD19 · Supersonic™ Travel",
        "color": "普魯士藍",
        "intro": "輕巧的隨行吹風機，搭配自動電壓調節設計，讓旅行途中也能輕鬆吹整秀髮。",
        "features": [
          "100–240V 自動電壓調節",
          "智慧溫控",
          "輕巧隨行設計"
        ],
        "url": "https://shop.hengstyle.com/site/dyson/index/hc_hd19",
        "tagline": "輕巧隨行，旅途中也能輕鬆吹整。"
      },
      "sourceDay": 4
    },
    {
      "day": 6,
      "type": "角色小物",
      "name": "金圍巾雪人",
      "description": "加入戴香檳金圍巾的小雪人。",
      "benefit": null,
      "assetNeed": "完整雪人去背圖，含雪地接觸面",
      "layout": {
        "x": 355,
        "y": 833,
        "h": 155
      },
      "atlas": 3,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 6
    },
    {
      "day": 7,
      "type": "角色小物",
      "name": "香檳金聖誕球",
      "description": "加入香檳金聖誕球，另解鎖輕快版《Jingle Bells》旋律。音樂需自行按播放。",
      "benefit": null,
      "assetNeed": "金色圓球小組去背圖",
      "layout": {
        "x": 360,
        "y": 877,
        "h": 85
      },
      "atlas": 4,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 7
    },
    {
      "day": 8,
      "type": "雪境光效",
      "name": "蓬鬆雪丘",
      "description": "球底增加局部雪丘與細緻積雪，不遮蔽產品主體。",
      "benefit": null,
      "assetNeed": "寫實雪丘透明疊圖，需配合球底弧度",
      "layout": {
        "x": 620,
        "y": 915,
        "h": 75
      },
      "atlas": 5,
      "fixed": false,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 8
    },
    {
      "day": 9,
      "type": "聖誕造景",
      "name": "暖金街燈",
      "description": "加入一盞微亮街燈，不依賴先前小屋。",
      "benefit": null,
      "assetNeed": "街燈去背圖，光暈另作效果",
      "layout": {
        "x": 925,
        "y": 822,
        "h": 230
      },
      "atlas": 6,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 9
    },
    {
      "day": 10,
      "type": "Dyson 產品",
      "name": "SV50 筆型吸塵器",
      "description": "纖細的 PencilVac™ Fluffycones SV50 加入雪境，完整保留長管與四錐吸頭。",
      "benefit": null,
      "assetNeed": "SV50 微立體透明 PNG，保留產品輪廓與配色",
      "layout": {
        "x": 505,
        "y": 866,
        "h": 405
      },
      "atlas": null,
      "hint": "今天有一款 Dyson 微縮科技，等待你親手放進雪境。",
      "product": {
        "model": "SV50 · PencilVac™ Fluffycones",
        "color": "",
        "intro": "纖細的筆型吸塵器搭配 Fluffycones™ 四錐全向吸頭，靈活穿梭居家空間，整理日常地面。",
        "features": [
          "纖細筆型機身",
          "Fluffycones™ 四錐全向吸頭",
          "靈活全向清潔"
        ],
        "url": "https://shop.hengstyle.com/site/dyson/index/fc_pencil",
        "tagline": "纖細筆型，靈活穿梭日常空間。"
      },
      "sourceDay": 10
    },
    {
      "day": 11,
      "type": "角色小物",
      "name": "雪地小麋鹿",
      "description": "加入一隻站立的小麋鹿。",
      "benefit": null,
      "assetNeed": "站立麋鹿去背圖，完整四肢",
      "layout": {
        "x": 862,
        "y": 850,
        "h": 140
      },
      "atlas": 7,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 11
    },
    {
      "day": 12,
      "type": "聖誕造景",
      "name": "金燈主聖誕樹",
      "description": "加入較高的主樹，雪枝間帶暖金燈光。",
      "benefit": null,
      "assetNeed": "主樹去背圖，不與其他物件合併",
      "layout": {
        "x": 646,
        "y": 793,
        "h": 455
      },
      "atlas": 8,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 12
    },
    {
      "day": 13,
      "type": "雪境光效",
      "name": "金色雪花",
      "description": "放入後出現密集金色雪花與閃耀亮點，可和第一場白雪同時展示。",
      "benefit": null,
      "assetNeed": "獨立金色雪花粒子，不需產品圖片",
      "effect": "goldSnow",
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 13
    },
    {
      "day": 14,
      "type": "角色小物",
      "name": "聖誕花環立飾",
      "description": "加入可獨立站立的花環，無須依附房屋。",
      "benefit": null,
      "assetNeed": "花環與小支架一體去背圖",
      "layout": {
        "x": 340,
        "y": 812,
        "h": 125
      },
      "atlas": 9,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 14
    },
    {
      "day": 15,
      "type": "Dyson 產品",
      "name": "HJ10 噴射氣流空氣清淨機",
      "description": "冰川藍的 HushJet™ HJ10，以星形噴嘴與精巧圓筒造型，為雪境添上一件清新科技收藏。",
      "benefit": null,
      "assetNeed": "HJ10 微立體透明 PNG，保留產品輪廓與配色",
      "layout": {
        "x": 725,
        "y": 866,
        "h": 228
      },
      "atlas": null,
      "hint": "今天有一款 Dyson 微縮科技，等待你親手放進雪境。",
      "product": {
        "model": "HJ10 · HushJet™ Purifier Compact",
        "color": "冰川藍",
        "intro": "靈感源自航空噴射引擎，以獨特星形噴嘴吹送集中的淨化氣流，搭配精巧的圓筒機身。",
        "features": [
          "HushJet™ 氣流噴射技術",
          "獨特星形噴嘴設計",
          "精巧圓筒機身"
        ],
        "url": "https://shop.hengstyle.com/site/dyson/index/ec_hj10",
        "tagline": "星形噴嘴與精巧機身，吹送淨化氣流。"
      },
      "sourceDay": 15
    },
    {
      "day": 16,
      "type": "聖誕造景",
      "name": "聖誕心意禮盒",
      "description": "把一份繫著金色緞帶的聖誕心意放進雪境，留下溫暖的小驚喜。",
      "benefit": null,
      "assetNeed": "沿用金色緞帶禮盒透明造景",
      "layout": {
        "x": 900,
        "y": 895,
        "h": 145
      },
      "atlas": 1,
      "hint": "今天有一份小小心意，等待你放進雪境。"
    },
    {
      "day": 17,
      "type": "角色小物",
      "name": "薑餅人朋友",
      "description": "加入一個帶糖霜細節的薑餅人。",
      "benefit": null,
      "assetNeed": "站立薑餅人去背圖",
      "layout": {
        "x": 760,
        "y": 867,
        "h": 110
      },
      "atlas": 11,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 17
    },
    {
      "day": 18,
      "type": "聖誕造景",
      "name": "聖誕鐘樓",
      "description": "加入一座小鐘樓，擴展村落輪廓。",
      "benefit": null,
      "assetNeed": "寫實鐘樓去背圖，窗光與小屋一致",
      "layout": {
        "x": 810,
        "y": 784,
        "h": 260
      },
      "atlas": 10,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 16
    },
    {
      "day": 19,
      "type": "雪境光效",
      "name": "星光暖暈",
      "description": "放入後點亮呼吸暖光與清晰星芒，獨立於街燈、樹木及產品運作。",
      "benefit": null,
      "assetNeed": "暖光與閃爍效果，不需產品圖片",
      "effect": "warmth",
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 19
    },
    {
      "day": 20,
      "type": "Dyson 產品",
      "name": "BP10 空氣清淨機",
      "description": "把深紫與銅色的 BP10 空氣清淨機放進聖誕雪境。",
      "benefit": null,
      "assetNeed": "BP10 微立體透明 PNG，保留產品輪廓與配色",
      "layout": {
        "x": 605,
        "y": 866,
        "h": 205
      },
      "atlas": 1,
      "hint": "今天有一款 Dyson 微縮科技，等待你親手放進雪境。",
      "product": {
        "model": "BP10",
        "color": "",
        "intro": "深紫色圓筒機身搭配銅色星形出風口，保留頂部網罩與細緻孔洞，為聖誕雪境增添一件科技收藏。",
        "features": [
          "圓筒造型機身",
          "銅色星形出風口",
          "深紫與銅色搭配"
        ],
        "url": "",
        "tagline": "深紫與銅色，收藏獨特星形設計。"
      },
      "sourceDay": 18
    },
    {
      "day": 21,
      "type": "聖誕造景",
      "name": "聖誕郵局",
      "description": "加入一間小型郵局，形成節慶街景。",
      "benefit": null,
      "assetNeed": "獨立郵局小屋去背圖",
      "layout": {
        "x": 370,
        "y": 785,
        "h": 178
      },
      "atlas": 12,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 21
    },
    {
      "day": 22,
      "type": "角色小物",
      "name": "金色雪橇",
      "description": "加入可獨立擺放的小雪橇。",
      "benefit": null,
      "assetNeed": "完整雪橇去背圖，不依賴麋鹿或聖誕老人",
      "layout": {
        "x": 807,
        "y": 889,
        "h": 140
      },
      "atlas": 13,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 22
    },
    {
      "day": 23,
      "type": "角色小物",
      "name": "聖誕老公公",
      "description": "加入提著小禮物的聖誕老人，迎接平安夜。",
      "benefit": null,
      "assetNeed": "全身聖誕老人去背圖，比例配合麋鹿",
      "layout": {
        "x": 440,
        "y": 870,
        "h": 200
      },
      "atlas": 14,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 23
    },
    {
      "day": 24,
      "type": "聖誕造景",
      "name": "平安夜金星",
      "description": "加入獨立懸掛金星，可吸附至已收藏的樹頂，另解鎖慢版《Jingle Bells》旋律。",
      "benefit": null,
      "assetNeed": "金星去背圖，光暈另作效果",
      "layout": {
        "x": 646,
        "y": 327,
        "h": 77
      },
      "atlas": 15,
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 24
    },
    {
      "day": 25,
      "type": "雪境光效",
      "name": "聖誕星光秀",
      "description": "放入後回到水晶球，大星芒與金銀星帶展開 20 秒演出；後半段光點依序描出 dyson 字樣，停留後接上「聖誕快樂」祝福。可隨時停止或重播。另解鎖《We Wish You a Merry Christmas》配樂，音樂預設關閉。",
      "benefit": null,
      "assetNeed": "獨立粒子及燈光演出，不需產品圖片",
      "effect": "finalShow",
      "hint": "一個冬日小驚喜，將為你的聖誕世界添上新的細節。",
      "sourceDay": 25
    }
  ],
  "rewards": [
    {
      "id": "product-hd19",
      "unlock": "product",
      "productDay": 5,
      "title": "髮品折抵 $1,000",
      "preview": "髮品專屬優惠",
      "conditions": "適用商品、使用門檻及期限以活動與結帳頁面說明為準。",
      "code": "HC999999",
      "approved": true,
      "validUntil": ""
    },
    {
      "id": "product-sv50",
      "unlock": "product",
      "productDay": 10,
      "title": "吸塵器折抵 $1,000",
      "preview": "吸塵器專屬優惠",
      "conditions": "適用商品、使用門檻及期限以活動與結帳頁面說明為準。",
      "code": "FC999999",
      "approved": true,
      "validUntil": ""
    },
    {
      "id": "product-hj10",
      "unlock": "product",
      "productDay": 15,
      "title": "清淨機折抵 $1,000",
      "preview": "清淨機專屬優惠",
      "conditions": "適用商品、使用門檻及期限以活動與結帳頁面說明為準。",
      "code": "EC999999",
      "approved": true,
      "validUntil": ""
    },
    {
      "id": "product-bp10",
      "unlock": "product",
      "productDay": 20,
      "title": "BP10 專屬優惠券",
      "preview": "BP10 專屬優惠",
      "conditions": "BP10 專屬優惠，折抵金額、序號與使用條件待公布。",
      "code": "",
      "approved": false,
      "validUntil": ""
    },
    {
      "id": "visits-10",
      "unlock": "visits",
      "required": 10,
      "title": "Dyson 全品項折抵 $1,000",
      "preview": "Dyson 全品項折抵 $1,000",
      "conditions": "活動期間累積參與 10 個不同台灣日期即可解鎖，不需連續。適用商品、使用門檻及期限以活動與結帳頁面說明為準。",
      "code": "All999999",
      "approved": true,
      "validUntil": ""
    }
  ],
  "productStyle": "miniature-relief-v1",
  "logoVariant": "white",
  "rulesVersion": 2,
  "claimPolicy": "through-today",
  "bp10RevealDate": "2026-12-16",
  "participationDaysRequired": 10,
  "bonusItems": [
    {
      "day": 101,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "金金舞王",
      "animal": "黃金獵犬",
      "description": "站起來扭腰、舉起前腳，開心跳舞。",
      "layout": {
        "x": 365,
        "y": 875,
        "h": 205
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 102,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "柴柴辦大事",
      "animal": "柴犬",
      "description": "蹲著回頭一看，身旁竟然多了一坨閃亮、金屬黃金色的大便捲形。",
      "layout": {
        "x": 800,
        "y": 880,
        "h": 155
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 103,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "白毛好朋友",
      "animal": "北極熊與薩摩耶",
      "description": "北極熊與毛茸茸的薩摩耶互相撲玩，一起分享冬日快樂。",
      "layout": {
        "x": 650,
        "y": 875,
        "h": 220
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 104,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "這盒裝得下",
      "animal": "橘貓",
      "description": "硬塞進太小的禮物盒，肚子和尾巴露在外面。",
      "layout": {
        "x": 475,
        "y": 895,
        "h": 155
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 105,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "冬日放空中",
      "animal": "水豚",
      "description": "泡在冒著薄薄熱氣的小木桶裡，頭頂雪球，一臉放空。",
      "layout": {
        "x": 820,
        "y": 875,
        "h": 175
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 106,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "煞車在哪裡",
      "animal": "皇帝企鵝幼鳥",
      "description": "灰絨毛的皇帝企鵝幼鳥，用肚皮開心滑行，小腳翹得高高。",
      "layout": {
        "x": 570,
        "y": 900,
        "h": 135
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 107,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "雪白小海獅",
      "animal": "白色小海獅",
      "description": "圓滾滾的雪白寶寶側躺著，蓬鬆白毛、小黑眼睛與圓圓黑鼻，像在雪地裡撒嬌。",
      "layout": {
        "x": 680,
        "y": 900,
        "h": 110
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 108,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "抱緊我的樹",
      "animal": "小熊貓",
      "description": "抱著小聖誕樹不肯放開，尾巴也跟著捲起來。",
      "layout": {
        "x": 405,
        "y": 870,
        "h": 210
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 109,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "今天吃大餐",
      "animal": "海獺",
      "description": "灰色毛茸茸的海獺，懷抱閃亮金幣，用小石頭開心地敲呀敲。",
      "layout": {
        "x": 755,
        "y": 900,
        "h": 170
      },
      "hint": "送給你的限定小驚喜。"
    },
    {
      "day": 110,
      "bonus": true,
      "type": "限定趣味收藏",
      "name": "找禮物翻車",
      "animal": "狐狸",
      "description": "撲進雪堆找禮物，頭埋進雪裡，只剩屁股和大尾巴翹起來。",
      "layout": {
        "x": 500,
        "y": 890,
        "h": 185
      },
      "hint": "送給你的限定小驚喜。"
    }
  ]
};

window.DYSON_ASSETS = {
  "atlas": "./assets/images/scene/transparent-atlas.png",
  "visualStyle": "paper-relief-v1",
  "custom": {},
  "sprites": {
    "5": "./assets/images/products/hd19-snowglobe.png",
    "20": "./assets/images/products/bp10-snowglobe.png",
    "15": "./assets/images/products/hj10-snowglobe.png",
    "16": "./assets/images/scene/day-03-ribbon-gift.webp",
    "10": "./assets/images/products/sv50-snowglobe.png",
    "2": "./assets/images/scene/day-02-fir-tree.webp",
    "3": "./assets/images/scene/day-03-ribbon-gift.webp",
    "4": "./assets/images/scene/day-04-christmas-house.webp",
    "6": "./assets/images/scene/day-06-snowman.webp",
    "7": "./assets/images/scene/day-07-christmas-bauble.webp",
    "8": "./assets/images/scene/day-08-snow-mound.webp",
    "9": "./assets/images/scene/day-09-street-lamp.webp",
    "11": "./assets/images/scene/day-11-reindeer.webp",
    "12": "./assets/images/scene/day-12-christmas-tree.webp",
    "14": "./assets/images/scene/day-14-christmas-wreath.webp",
    "17": "./assets/images/scene/day-17-gingerbread.webp",
    "18": "./assets/images/scene/day-18-clock-tower.webp",
    "21": "./assets/images/scene/day-21-christmas-post-office.webp",
    "22": "./assets/images/scene/day-22-golden-sleigh.webp",
    "23": "./assets/images/scene/day-23-santa-claus.webp",
    "24": "./assets/images/scene/day-24-christmas-star.webp"
  },
  "artDirection": {
    "mode": "Built-in image_gen",
    "style": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.",
    "backgroundPrompt": "Use case: style-transfer. Image 1 is the EDIT TARGET and GEOMETRY LOCK; image 2 is the STYLE REFERENCE. Restyle the EMPTY snow globe from image 1 using the refined layered paper diorama aesthetic, fine paper grain, midnight navy, ivory and champagne-gold/copper of image 2. Critical: preserve image 1's portrait aspect ratio, exact camera, sphere silhouette, sphere center and size, snow floor height, pedestal footprint and all geometry. Keep globe center at approx 53.5% canvas width and 41% canvas height, sphere top at 11.8%, sphere base at 68%, pedestal lower edge at 86%. Replace the brown candlelit room and table with a calm midnight navy textured-paper winter backdrop and a gently snow-dusted ivory foreground, no candles or metallic table ornaments. Outside globe, optional VERY subdued abstract dark paper trees only at far edges; the globe interior must remain completely EMPTY except a thin flat ivory paper snow floor around 61–68% height. NO product, NO central plinth, NO houses, NO Christmas trees, NO stars, NO snowflakes inside, NO characters, NO presents, NO falling particles baked in. Keep the glass subtle and translucent with fine cream-gold reflections at the rim; interior should read calm navy with very gentle texture so separately rendered game pieces stay legible. Pedestal midnight navy paper/leather texture with restrained copper top and bottom rings. On the pedestal retain the exact lower-case word 'dyson' in gold using the existing logo shape from image 1, never invent other text. Premium adult Christmas campaign, softly dimensional layered illustration, not photorealistic, not plastic. Clean opening-day empty game background, all collectible decorations will be added independently later.",
    "sprites": [
      {
        "day": 2,
        "name": "snow-fir",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One small snow-covered fir tree. Three to four geometric overlapping teal and navy paper tiers, ivory snow caps, delicate leaf and berry cutout patterns, a short cream/gold trunk. Complete tree without a star or ornaments."
      },
      {
        "day": 3,
        "name": "gold-ribbon-gift",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One small elegant cream/navy wrapped Christmas gift box with folded champagne-gold ribbon and a dimensional bow. A little view of the box top. Fine paper texture and layered edges."
      },
      {
        "day": 4,
        "name": "warm-house",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One charming Christmas cottage, steep ivory snow-covered navy roof, cream paper walls, small gold-lit windows and door, subtle teal botanical patterns. No trees or characters attached."
      },
      {
        "day": 6,
        "name": "snowman",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One complete small snowman cut-paper figurine, ivory rounded layered snow body, warm champagne-gold scarf, navy top hat, tiny carrot nose and navy buttons, two delicate twig arms. Sophisticated gentle expression, no scenery."
      },
      {
        "day": 7,
        "name": "champagne-bauble",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One champagne-gold Christmas bauble ornament sitting upright, small hanging cap and loop on top, softly faceted layered paper sphere with ivory botanical cutout patterns and subtle copper edges. No string extending outside the object."
      },
      {
        "day": 8,
        "name": "snow-mound",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One low broad fluffy snow mound, smooth overlapping ivory paper snowdrift curves in three layers, cool light-blue shadow edges and fine paper/snow grain. Width about 2.5 times height. No trees, no plants, no products."
      },
      {
        "day": 9,
        "name": "warm-lamppost",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One complete slender old-fashioned Christmas street lantern, navy paper post, champagne-gold trim and warm cream-lit lantern panes, a tiny ivory snow cap and a small stable pedestal. No wreath, no scenery."
      },
      {
        "day": 11,
        "name": "reindeer",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One standing small elegant reindeer paper figurine, complete antlers and four legs, muted cream and warm copper body with a navy patterned scarf, softly layered rounded planes, front three-quarter pose, friendly subtle expression, no scenery."
      },
      {
        "day": 12,
        "name": "main-christmas-tree",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One tall main Christmas tree inspired directly by the reference's geometric tree: alternating deep teal/navy and ivory folded paper tiers with refined gold leaf, berry and snowflake motifs, a tiny gold trunk and discreet warm golden pin lights. No top star, star will be a separate game object. Complete clear tree silhouette."
      },
      {
        "day": 14,
        "name": "standing-wreath",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One Christmas wreath ornament standing on a small elegant navy-and-gold pedestal. Circular layered teal paper leaves, cream snow tips, small gold berries and an ivory/gold bow at bottom. Actual transparent opening at the center of the wreath."
      },
      {
        "day": 17,
        "name": "gingerbread-friend",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One complete gingerbread person figurine, warm copper-brown textured paper, cream icing-like layered paper trim, navy bow tie and two little gold buttons. Arms slightly spread, both feet visible, restrained friendly face, no scenery."
      },
      {
        "day": 18,
        "name": "clock-tower",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One elegant small Christmas clock tower building, tall slender midnight navy structure, cream paper walls and layered snowy pitched roof, round gold-rimmed clock face with simple clock hands and no numerals, little warm-lit window and gold architectural trim. No trees or characters."
      },
      {
        "day": 21,
        "name": "christmas-post-office",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One small Christmas post office building, cream layered paper walls, dark navy snowy roof, warm gold windows and a small navy mailbox with a simple envelope symbol beside the front door. No readable text, no trees, no characters."
      },
      {
        "day": 22,
        "name": "gold-sleigh",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One complete EMPTY golden Christmas sleigh, side/front three-quarter view, width about 1.8 times height, delicate curved champagne-gold runners fully visible, navy upholstered interior, cream paper and copper side filigree. NO Santa, NO reindeer, NO presents. Every front and rear edge intact with transparent margin."
      },
      {
        "day": 23,
        "name": "santa",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One complete standing Santa Claus figurine, elegant layered cut-paper illustration, muted burgundy coat and hat with ivory trim, ivory beard, navy boots, champagne-gold belt buckle and small cream gift held in one hand. Full hat, hands and both feet visible. NO sleigh, NO reindeer."
      },
      {
        "day": 24,
        "name": "christmas-star",
        "prompt": "Use case: style-transfer. Reference image is a STYLE REFERENCE for a premium Christmas snow-globe game. Match its softly dimensional layered cut-paper diorama illustration: tactile fine ivory paper grain, delicate beveled paper edges, restrained layered relief, subtle shadows between layers, midnight navy #122437, muted dark teal, cream snow and champagne gold/copper accents. Elegant adult holiday campaign, not glossy plastic, not photorealistic, not flat clipart. Front view with a very slight view of the top surfaces, light from upper left, readable clean silhouette at small game size. A single complete independent object, centered with 12% clear margin on all sides, no cropping, no text, no logo, no frame, no ground rectangle, no surrounding scene. True transparent alpha background including openings; no checkerboard drawn into the image. Tiny integrated contact shadow only, no large cast shadow.\nSubject: One dimensional eight-point Christmas star tree topper, folded ivory and champagne-gold paper facets, subtle metallic copper edges and fine grain, symmetric clean silhouette, no pole, no tree, no halo, no background."
      }
    ],
    "products": {
      "5": {
        "model": "HD19",
        "mode": "built-in imagegen style-transfer",
        "prompt": "Use case: style-transfer. Asset type: one transparent miniature product sprite for a Christmas snow-globe game. Input image 1 is the exact product EDIT TARGET. Image 2 (paper-relief Christmas house) is a material and lighting STYLE REFERENCE ONLY; do not include it. Image 3 (HJ10 purifier) sets the finished product rendering style; do not include or merge that product. Change only the rendering finish to a refined subtly three-dimensional collectible: softly beveled silhouette, satin matte body, extremely fine paper-grain texture, clean embossed small details, soft warm ivory key light, a thin restrained champagne rim highlight, realistic sculpted volume. Preserve the EDIT TARGET's exact recognizable industrial design, outline, proportions, camera angle, original product colors and unique controls. Keep its real hardware structure; do not invent attachments. Single upright product centered, complete, with comfortable transparent margins and about 85% image-height occupancy. Truly TRANSPARENT alpha around and within all openings. No scenery, background, platform, pedestal, snow, Christmas ornaments, house, trees, labels, watermarks or extra products. No external glow cloud: contrast comes from softly lit product edges, not an opaque surrounding shape. Avoid flat vector/cartoon simplification and avoid changing all colors to gold. Subject-specific invariants: a Dyson HD19 travel hair dryer seen from the provided front view. Preserve the round dark navy head with a large EMPTY circular opening, the slender navy cylindrical handle, copper/gold filter sleeve and buttons, and short straight black cord segment at the bottom. The entire central aperture must remain transparent, never filled with a disk or invented fan. Keep the original head-to-handle ratio."
      },
      "15": {
        "model": "HJ10",
        "mode": "built-in imagegen style-transfer",
        "prompt": "Use case: style-transfer. Asset type: transparent product sprite for a Christmas snow-globe game. Image 1 is the exact EDIT TARGET: Dyson HJ10 HushJet compact purifier, black cylindrical body and glacier-teal top nozzle. Image 2 is a STYLE REFERENCE ONLY: a warm, subtly three-dimensional layered paper-relief Christmas house. Do not include the house. Transform ONLY the product rendering finish into a refined miniature collectible with softly beveled edges, satin matte surfaces, very fine paper-grain texture, delicate sculpted depth, soft warm ivory key light and restrained pale champagne edge highlights. Keep the exact HJ10 silhouette, proportions, camera angle, short broad cylindrical body, star-shaped radial nozzle with the same number of lobes, teal collar, black perforated lower filter, tiny front screen and buttons. Keep the distinct teal/black colors; do not recolor it navy and gold. The product must remain instantly recognizable as the supplied real appliance. Treat the perforations as clean simplified embossed details, not random texture. One complete upright product, centered, filling about 85% of image height, with clear padding on all sides. GENUINELY TRANSPARENT alpha background, including around the feet; remove source floor remnants and white artifacts. Crisp complete contour, no cropping, no pedestal, no scene, no snow, no stars, no bow, no extra props, no invented labels, no watermark. Slightly lighter silhouette edge for readability on a dark blue background; keep the center physically dimensional rather than a flat graphic. Return one single standalone transparent product, not a sheet or mockup."
      },
      "10": {
        "model": "SV50",
        "mode": "built-in imagegen style-transfer",
        "prompt": "Use case: style-transfer. Asset type: one transparent miniature product sprite for a Christmas snow-globe game. Input image 1 is the exact product EDIT TARGET. Image 2 (paper-relief Christmas house) is a material and lighting STYLE REFERENCE ONLY; do not include it. Image 3 (HJ10 purifier) sets the finished product rendering style; do not include or merge that product. Change only the rendering finish to a refined subtly three-dimensional collectible: softly beveled silhouette, satin matte body, extremely fine paper-grain texture, clean embossed small details, soft warm ivory key light, a thin restrained champagne rim highlight, realistic sculpted volume. Preserve the EDIT TARGET's exact recognizable industrial design, outline, proportions, camera angle, original product colors and unique controls. Keep its real hardware structure; do not invent attachments. Single upright product centered, complete, with comfortable transparent margins and about 85% image-height occupancy. Truly TRANSPARENT alpha around and within all openings. No scenery, background, platform, pedestal, snow, Christmas ornaments, house, trees, labels, watermarks or extra products. No external glow cloud: contrast comes from softly lit product edges, not an opaque surrounding shape. Avoid flat vector/cartoon simplification and avoid changing all colors to gold. Subject-specific invariants: Dyson SV50 PencilVac Fluffycones vacuum. Keep the EXTREMELY LONG SLENDER straight black pencil-like shaft and narrow rounded top, tiny red and blue front controls/display, lower transparent dust tube with red catch, and full wide low floor head containing the distinctive red and cobalt-blue conical rollers and small green light. Preserve source geometry and length-to-width ratio; do not add a conventional loop handle, bulky motor or change the floor head. Fit the WHOLE vacuum and floor head in the image, no cropping. Simplify only microscopic surface texture; retain enough red/blue roller detail to read at miniature size."
      },
      "20": {
        "model": "BP10",
        "mode": "built-in imagegen style-transfer",
        "prompt": "Use case: style-transfer. Asset type: one transparent miniature product sprite for a Christmas snow-globe game. Input image 1 is the exact product EDIT TARGET. Image 2 (paper-relief Christmas house) is a material and lighting STYLE REFERENCE ONLY; do not include it. Image 3 (HJ10 purifier) sets the finished product rendering style; do not include or merge that product. Change only the rendering finish to a refined subtly three-dimensional collectible: softly beveled silhouette, satin matte body, extremely fine paper-grain texture, clean embossed small details, soft warm ivory key light, a thin restrained champagne rim highlight, realistic sculpted volume. Preserve the EDIT TARGET's exact recognizable industrial design, outline, proportions, camera angle, original product colors and unique controls. Keep its real hardware structure; do not invent attachments. Single upright product centered, complete, with comfortable transparent margins and about 85% image-height occupancy. Truly TRANSPARENT alpha around and within all openings. No scenery, background, platform, pedestal, snow, Christmas ornaments, house, trees, labels, watermarks or extra products. No external glow cloud: contrast comes from softly lit product edges, not an opaque surrounding shape. Avoid flat vector/cartoon simplification and avoid changing all colors to gold. Subject-specific invariants: Dyson BP10 compact purifier. Preserve its broad purple cylindrical body, angled round copper/bronze radial star-shaped head with its central copper cone and black mesh spaces, small front display, horizontal body divisions, and lower perforated filter with vertical copper accent. Keep the same lobes and arrangement as the source. Retain the deep purple and copper colors, not teal."
      }
    }
  },
  "brandMark": {
    "viewBox": [
      0,
      0,
      74,
      28
    ],
    "source": "https://www.dyson.com/etc.clientlibs/dyson/clientlibs/clientlib-main/resources/images/dyson-logo.svg",
    "letters": [
      {
        "paths": [
          [
            [
              14.1,
              0.0
            ],
            [
              10.4,
              0.0
            ],
            [
              10.4,
              6.8
            ],
            [
              7.0,
              6.8
            ],
            [
              6.7161,
              6.8055
            ],
            [
              6.4352,
              6.8219
            ],
            [
              6.1577,
              6.8489
            ],
            [
              5.8835,
              6.8864
            ],
            [
              5.613,
              6.9341
            ],
            [
              5.3464,
              6.992
            ],
            [
              5.0838,
              7.0596
            ],
            [
              4.8255,
              7.137
            ],
            [
              4.5717,
              7.2238
            ],
            [
              4.3225,
              7.3199
            ],
            [
              4.0781,
              7.425
            ],
            [
              3.8389,
              7.539
            ],
            [
              3.6048,
              7.6617
            ],
            [
              3.3763,
              7.7928
            ],
            [
              3.1534,
              7.9322
            ],
            [
              2.9363,
              8.0796
            ],
            [
              2.7253,
              8.2349
            ],
            [
              2.5206,
              8.3979
            ],
            [
              2.3224,
              8.5683
            ],
            [
              2.1307,
              8.746
            ],
            [
              1.946,
              8.9307
            ],
            [
              1.7683,
              9.1224
            ],
            [
              1.5979,
              9.3206
            ],
            [
              1.4349,
              9.5253
            ],
            [
              1.2796,
              9.7363
            ],
            [
              1.1322,
              9.9534
            ],
            [
              0.9928,
              10.1763
            ],
            [
              0.8617,
              10.4048
            ],
            [
              0.739,
              10.6389
            ],
            [
              0.625,
              10.8781
            ],
            [
              0.5199,
              11.1225
            ],
            [
              0.4238,
              11.3717
            ],
            [
              0.337,
              11.6255
            ],
            [
              0.2596,
              11.8838
            ],
            [
              0.192,
              12.1464
            ],
            [
              0.1341,
              12.413
            ],
            [
              0.0864,
              12.6835
            ],
            [
              0.0489,
              12.9577
            ],
            [
              0.0219,
              13.2352
            ],
            [
              0.0055,
              13.5161
            ],
            [
              0.0,
              13.8
            ],
            [
              0.0055,
              14.0839
            ],
            [
              0.0219,
              14.3648
            ],
            [
              0.0489,
              14.6423
            ],
            [
              0.0864,
              14.9165
            ],
            [
              0.1341,
              15.187
            ],
            [
              0.192,
              15.4536
            ],
            [
              0.2596,
              15.7162
            ],
            [
              0.337,
              15.9745
            ],
            [
              0.4238,
              16.2283
            ],
            [
              0.5199,
              16.4775
            ],
            [
              0.625,
              16.7219
            ],
            [
              0.739,
              16.9611
            ],
            [
              0.8617,
              17.1952
            ],
            [
              0.9928,
              17.4237
            ],
            [
              1.1322,
              17.6466
            ],
            [
              1.2796,
              17.8637
            ],
            [
              1.4349,
              18.0747
            ],
            [
              1.5979,
              18.2794
            ],
            [
              1.7683,
              18.4776
            ],
            [
              1.946,
              18.6693
            ],
            [
              2.1307,
              18.854
            ],
            [
              2.3224,
              19.0317
            ],
            [
              2.5206,
              19.2021
            ],
            [
              2.7253,
              19.3651
            ],
            [
              2.9363,
              19.5204
            ],
            [
              3.1534,
              19.6678
            ],
            [
              3.3763,
              19.8072
            ],
            [
              3.6048,
              19.9383
            ],
            [
              3.8389,
              20.061
            ],
            [
              4.0781,
              20.175
            ],
            [
              4.3225,
              20.2801
            ],
            [
              4.5717,
              20.3762
            ],
            [
              4.8255,
              20.463
            ],
            [
              5.0838,
              20.5404
            ],
            [
              5.3464,
              20.608
            ],
            [
              5.613,
              20.6659
            ],
            [
              5.8835,
              20.7136
            ],
            [
              6.1577,
              20.7511
            ],
            [
              6.4352,
              20.7781
            ],
            [
              6.7161,
              20.7945
            ],
            [
              7.0,
              20.8
            ],
            [
              7.2839,
              20.7945
            ],
            [
              7.5648,
              20.7781
            ],
            [
              7.8423,
              20.7511
            ],
            [
              8.1165,
              20.7136
            ],
            [
              8.387,
              20.6659
            ],
            [
              8.6536,
              20.608
            ],
            [
              8.9162,
              20.5404
            ],
            [
              9.1745,
              20.463
            ],
            [
              9.4283,
              20.3762
            ],
            [
              9.6775,
              20.2801
            ],
            [
              9.9219,
              20.175
            ],
            [
              10.1611,
              20.061
            ],
            [
              10.3952,
              19.9383
            ],
            [
              10.6237,
              19.8072
            ],
            [
              10.8466,
              19.6678
            ],
            [
              11.0637,
              19.5204
            ],
            [
              11.2747,
              19.3651
            ],
            [
              11.4794,
              19.2021
            ],
            [
              11.6776,
              19.0317
            ],
            [
              11.8693,
              18.854
            ],
            [
              12.054,
              18.6693
            ],
            [
              12.2317,
              18.4776
            ],
            [
              12.4021,
              18.2794
            ],
            [
              12.5651,
              18.0747
            ],
            [
              12.7204,
              17.8637
            ],
            [
              12.8678,
              17.6466
            ],
            [
              13.0072,
              17.4237
            ],
            [
              13.1383,
              17.1952
            ],
            [
              13.261,
              16.9611
            ],
            [
              13.375,
              16.7219
            ],
            [
              13.4801,
              16.4775
            ],
            [
              13.5762,
              16.2283
            ],
            [
              13.663,
              15.9745
            ],
            [
              13.7404,
              15.7162
            ],
            [
              13.808,
              15.4536
            ],
            [
              13.8659,
              15.187
            ],
            [
              13.9136,
              14.9165
            ],
            [
              13.9511,
              14.6423
            ],
            [
              13.9781,
              14.3648
            ],
            [
              13.9945,
              14.0839
            ],
            [
              14.0,
              13.8
            ],
            [
              14.0,
              13.5464
            ],
            [
              14.0,
              13.2631
            ],
            [
              14.0,
              12.9537
            ],
            [
              14.0,
              12.6218
            ],
            [
              14.0,
              12.2709
            ],
            [
              14.0,
              11.9047
            ],
            [
              14.0,
              11.5268
            ],
            [
              14.0,
              11.1407
            ],
            [
              14.0,
              10.7502
            ],
            [
              14.0,
              10.3587
            ],
            [
              14.0,
              9.97
            ],
            [
              14.0,
              9.5875
            ],
            [
              14.0,
              9.2149
            ],
            [
              14.0,
              8.8558
            ],
            [
              14.0,
              8.5139
            ],
            [
              14.0,
              8.1926
            ],
            [
              14.0,
              7.8956
            ],
            [
              14.0,
              7.6266
            ],
            [
              14.0,
              7.389
            ],
            [
              14.0,
              7.1866
            ],
            [
              14.0,
              7.0229
            ],
            [
              14.0,
              6.9014
            ],
            [
              14.0,
              6.826
            ],
            [
              14.0,
              6.8
            ],
            [
              14.1,
              0.0
            ]
          ],
          [
            [
              10.4,
              13.9
            ],
            [
              10.3889,
              14.1676
            ],
            [
              10.3561,
              14.4298
            ],
            [
              10.3025,
              14.6857
            ],
            [
              10.2288,
              14.9344
            ],
            [
              10.1359,
              15.175
            ],
            [
              10.0247,
              15.4066
            ],
            [
              9.8959,
              15.6283
            ],
            [
              9.7504,
              15.8392
            ],
            [
              9.589,
              16.0384
            ],
            [
              9.4125,
              16.225
            ],
            [
              9.2218,
              16.3981
            ],
            [
              9.0176,
              16.5568
            ],
            [
              8.8008,
              16.7002
            ],
            [
              8.5723,
              16.8274
            ],
            [
              8.3328,
              16.9375
            ],
            [
              8.0832,
              17.0296
            ],
            [
              7.8243,
              17.1028
            ],
            [
              7.5569,
              17.1562
            ],
            [
              7.2819,
              17.1889
            ],
            [
              7.0,
              17.2
            ],
            [
              6.7324,
              17.1889
            ],
            [
              6.4702,
              17.1561
            ],
            [
              6.2143,
              17.1025
            ],
            [
              5.9656,
              17.0288
            ],
            [
              5.725,
              16.9359
            ],
            [
              5.4934,
              16.8247
            ],
            [
              5.2717,
              16.6959
            ],
            [
              5.0608,
              16.5504
            ],
            [
              4.8616,
              16.389
            ],
            [
              4.675,
              16.2125
            ],
            [
              4.5019,
              16.0218
            ],
            [
              4.3432,
              15.8176
            ],
            [
              4.1998,
              15.6008
            ],
            [
              4.0726,
              15.3723
            ],
            [
              3.9625,
              15.1328
            ],
            [
              3.8704,
              14.8832
            ],
            [
              3.7972,
              14.6243
            ],
            [
              3.7438,
              14.3569
            ],
            [
              3.7111,
              14.0819
            ],
            [
              3.7,
              13.8
            ],
            [
              3.7111,
              13.5324
            ],
            [
              3.7438,
              13.2702
            ],
            [
              3.7972,
              13.0143
            ],
            [
              3.8704,
              12.7656
            ],
            [
              3.9625,
              12.525
            ],
            [
              4.0726,
              12.2934
            ],
            [
              4.1998,
              12.0717
            ],
            [
              4.3432,
              11.8608
            ],
            [
              4.5019,
              11.6616
            ],
            [
              4.675,
              11.475
            ],
            [
              4.8616,
              11.3019
            ],
            [
              5.0608,
              11.1432
            ],
            [
              5.2717,
              10.9998
            ],
            [
              5.4934,
              10.8726
            ],
            [
              5.725,
              10.7625
            ],
            [
              5.9656,
              10.6704
            ],
            [
              6.2143,
              10.5972
            ],
            [
              6.4702,
              10.5438
            ],
            [
              6.7324,
              10.5111
            ],
            [
              7.0,
              10.5
            ],
            [
              10.3,
              10.5
            ],
            [
              10.4,
              13.9
            ]
          ]
        ],
        "letter": "d"
      },
      {
        "paths": [
          [
            [
              18.5,
              23.4
            ],
            [
              18.7556,
              23.5579
            ],
            [
              19.0144,
              23.7081
            ],
            [
              19.2763,
              23.8502
            ],
            [
              19.5409,
              23.9835
            ],
            [
              19.8079,
              24.1076
            ],
            [
              20.0772,
              24.2218
            ],
            [
              20.3483,
              24.3256
            ],
            [
              20.6211,
              24.4185
            ],
            [
              20.8952,
              24.4999
            ],
            [
              21.1705,
              24.5693
            ],
            [
              21.4465,
              24.6262
            ],
            [
              21.7231,
              24.6699
            ],
            [
              22.0,
              24.7
            ],
            [
              22.3757,
              24.6965
            ],
            [
              22.7289,
              24.6677
            ],
            [
              23.0604,
              24.615
            ],
            [
              23.3709,
              24.54
            ],
            [
              23.661,
              24.4443
            ],
            [
              23.9314,
              24.3292
            ],
            [
              24.1829,
              24.1963
            ],
            [
              24.416,
              24.0472
            ],
            [
              24.6315,
              23.8833
            ],
            [
              24.83,
              23.7062
            ],
            [
              25.0124,
              23.5173
            ],
            [
              25.1791,
              23.3182
            ],
            [
              25.331,
              23.1103
            ],
            [
              25.4686,
              22.8953
            ],
            [
              25.5928,
              22.6745
            ],
            [
              25.7041,
              22.4496
            ],
            [
              25.8033,
              22.222
            ],
            [
              25.891,
              21.9932
            ],
            [
              25.9679,
              21.7648
            ],
            [
              26.0348,
              21.5382
            ],
            [
              26.0922,
              21.3149
            ],
            [
              26.1409,
              21.0966
            ],
            [
              26.1816,
              20.8846
            ],
            [
              26.215,
              20.6806
            ],
            [
              26.2416,
              20.4859
            ],
            [
              26.2623,
              20.3021
            ],
            [
              26.2777,
              20.1308
            ],
            [
              26.2885,
              19.9734
            ],
            [
              26.2953,
              19.8315
            ],
            [
              26.2989,
              19.7065
            ],
            [
              26.3,
              19.6
            ],
            [
              26.0871,
              19.7792
            ],
            [
              25.8644,
              19.9472
            ],
            [
              25.6327,
              20.1035
            ],
            [
              25.3928,
              20.2474
            ],
            [
              25.1455,
              20.3786
            ],
            [
              24.8916,
              20.4963
            ],
            [
              24.632,
              20.6001
            ],
            [
              24.3675,
              20.6895
            ],
            [
              24.099,
              20.7638
            ],
            [
              23.8271,
              20.8226
            ],
            [
              23.5528,
              20.8652
            ],
            [
              23.2768,
              20.8912
            ],
            [
              23.0,
              20.9
            ],
            [
              22.7163,
              20.8944
            ],
            [
              22.4355,
              20.8778
            ],
            [
              22.1578,
              20.8503
            ],
            [
              21.8833,
              20.8122
            ],
            [
              21.6123,
              20.7637
            ],
            [
              21.345,
              20.7049
            ],
            [
              21.0816,
              20.6362
            ],
            [
              20.8224,
              20.5576
            ],
            [
              20.5675,
              20.4694
            ],
            [
              20.3172,
              20.3719
            ],
            [
              20.0716,
              20.2651
            ],
            [
              19.8311,
              20.1494
            ],
            [
              19.5958,
              20.0249
            ],
            [
              19.3659,
              19.8918
            ],
            [
              19.1416,
              19.7504
            ],
            [
              18.9232,
              19.6008
            ],
            [
              18.7109,
              19.4433
            ],
            [
              18.5048,
              19.278
            ],
            [
              18.3053,
              19.1052
            ],
            [
              18.1125,
              18.925
            ],
            [
              17.9266,
              18.7377
            ],
            [
              17.7479,
              18.5435
            ],
            [
              17.5766,
              18.3426
            ],
            [
              17.4128,
              18.1352
            ],
            [
              17.2568,
              17.9215
            ],
            [
              17.1089,
              17.7017
            ],
            [
              16.9692,
              17.476
            ],
            [
              16.8379,
              17.2446
            ],
            [
              16.7153,
              17.0077
            ],
            [
              16.6016,
              16.7656
            ],
            [
              16.4969,
              16.5184
            ],
            [
              16.4016,
              16.2664
            ],
            [
              16.3158,
              16.0097
            ],
            [
              16.2397,
              15.7486
            ],
            [
              16.1736,
              15.4832
            ],
            [
              16.1177,
              15.2138
            ],
            [
              16.0722,
              14.9406
            ],
            [
              16.0372,
              14.6637
            ],
            [
              16.0131,
              14.3835
            ],
            [
              16.0,
              14.1
            ],
            [
              16.0,
              14.0844
            ],
            [
              16.0,
              14.05
            ],
            [
              16.0,
              14.0156
            ],
            [
              16.0,
              14.0
            ],
            [
              16.0,
              13.7469
            ],
            [
              16.0,
              13.4651
            ],
            [
              16.0,
              13.158
            ],
            [
              16.0,
              12.8292
            ],
            [
              16.0,
              12.4821
            ],
            [
              16.0,
              12.1203
            ],
            [
              16.0,
              11.7473
            ],
            [
              16.0,
              11.3667
            ],
            [
              16.0,
              10.9818
            ],
            [
              16.0,
              10.5964
            ],
            [
              16.0,
              10.2137
            ],
            [
              16.0,
              9.8375
            ],
            [
              16.0,
              9.4712
            ],
            [
              16.0,
              9.1182
            ],
            [
              16.0,
              8.7822
            ],
            [
              16.0,
              8.4667
            ],
            [
              16.0,
              8.1751
            ],
            [
              16.0,
              7.9109
            ],
            [
              16.0,
              7.6778
            ],
            [
              16.0,
              7.4792
            ],
            [
              16.0,
              7.3186
            ],
            [
              16.0,
              7.1995
            ],
            [
              16.0,
              7.1255
            ],
            [
              16.0,
              7.1
            ],
            [
              19.7,
              7.1
            ],
            [
              19.7,
              7.1304
            ],
            [
              19.7,
              7.2186
            ],
            [
              19.7,
              7.3596
            ],
            [
              19.7,
              7.5486
            ],
            [
              19.7,
              7.7809
            ],
            [
              19.7,
              8.0516
            ],
            [
              19.7,
              8.3558
            ],
            [
              19.7,
              8.6889
            ],
            [
              19.7,
              9.0459
            ],
            [
              19.7,
              9.422
            ],
            [
              19.7,
              9.8125
            ],
            [
              19.7,
              10.2125
            ],
            [
              19.7,
              10.6172
            ],
            [
              19.7,
              11.0217
            ],
            [
              19.7,
              11.4213
            ],
            [
              19.7,
              11.8111
            ],
            [
              19.7,
              12.1863
            ],
            [
              19.7,
              12.5422
            ],
            [
              19.7,
              12.8738
            ],
            [
              19.7,
              13.1764
            ],
            [
              19.7,
              13.4451
            ],
            [
              19.7,
              13.6752
            ],
            [
              19.7,
              13.8617
            ],
            [
              19.7,
              14.0
            ],
            [
              19.7111,
              14.2676
            ],
            [
              19.7438,
              14.5298
            ],
            [
              19.7972,
              14.7857
            ],
            [
              19.8704,
              15.0344
            ],
            [
              19.9625,
              15.275
            ],
            [
              20.0726,
              15.5066
            ],
            [
              20.1998,
              15.7283
            ],
            [
              20.3432,
              15.9392
            ],
            [
              20.5019,
              16.1384
            ],
            [
              20.675,
              16.325
            ],
            [
              20.8616,
              16.4981
            ],
            [
              21.0608,
              16.6568
            ],
            [
              21.2717,
              16.8002
            ],
            [
              21.4934,
              16.9274
            ],
            [
              21.725,
              17.0375
            ],
            [
              21.9656,
              17.1296
            ],
            [
              22.2143,
              17.2028
            ],
            [
              22.4702,
              17.2562
            ],
            [
              22.7324,
              17.2889
            ],
            [
              23.0,
              17.3
            ],
            [
              23.2676,
              17.2889
            ],
            [
              23.5298,
              17.2562
            ],
            [
              23.7857,
              17.2028
            ],
            [
              24.0344,
              17.1296
            ],
            [
              24.275,
              17.0375
            ],
            [
              24.5066,
              16.9274
            ],
            [
              24.7283,
              16.8002
            ],
            [
              24.9392,
              16.6568
            ],
            [
              25.1384,
              16.4981
            ],
            [
              25.325,
              16.325
            ],
            [
              25.4981,
              16.1384
            ],
            [
              25.6568,
              15.9392
            ],
            [
              25.8002,
              15.7283
            ],
            [
              25.9274,
              15.5066
            ],
            [
              26.0375,
              15.275
            ],
            [
              26.1296,
              15.0344
            ],
            [
              26.2028,
              14.7857
            ],
            [
              26.2562,
              14.5298
            ],
            [
              26.2889,
              14.2676
            ],
            [
              26.3,
              14.0
            ],
            [
              26.3,
              14.0
            ],
            [
              26.3,
              14.0
            ],
            [
              26.3,
              14.0
            ],
            [
              26.3,
              14.0
            ],
            [
              26.3,
              13.8732
            ],
            [
              26.3,
              13.6962
            ],
            [
              26.3,
              13.4738
            ],
            [
              26.3,
              13.2111
            ],
            [
              26.3,
              12.913
            ],
            [
              26.3,
              12.5844
            ],
            [
              26.3,
              12.2303
            ],
            [
              26.3,
              11.8556
            ],
            [
              26.3,
              11.4652
            ],
            [
              26.3,
              11.0642
            ],
            [
              26.3,
              10.6575
            ],
            [
              26.3,
              10.25
            ],
            [
              26.3,
              9.8467
            ],
            [
              26.3,
              9.4524
            ],
            [
              26.3,
              9.0723
            ],
            [
              26.3,
              8.7111
            ],
            [
              26.3,
              8.3739
            ],
            [
              26.3,
              8.0656
            ],
            [
              26.3,
              7.7912
            ],
            [
              26.3,
              7.5556
            ],
            [
              26.3,
              7.3637
            ],
            [
              26.3,
              7.2205
            ],
            [
              26.3,
              7.1309
            ],
            [
              26.3,
              7.1
            ],
            [
              30.0,
              7.1
            ],
            [
              30.0,
              14.0
            ],
            [
              30.0002,
              14.2952
            ],
            [
              30.0007,
              14.5905
            ],
            [
              30.0014,
              14.8856
            ],
            [
              30.002,
              15.1806
            ],
            [
              30.0024,
              15.4752
            ],
            [
              30.0025,
              15.7694
            ],
            [
              30.0021,
              16.063
            ],
            [
              30.001,
              16.356
            ],
            [
              29.9991,
              16.6481
            ],
            [
              29.9961,
              16.9393
            ],
            [
              29.992,
              17.2294
            ],
            [
              29.9866,
              17.5184
            ],
            [
              29.9796,
              17.806
            ],
            [
              29.9711,
              18.0923
            ],
            [
              29.9606,
              18.377
            ],
            [
              29.9482,
              18.6601
            ],
            [
              29.9337,
              18.9413
            ],
            [
              29.9168,
              19.2207
            ],
            [
              29.8975,
              19.4981
            ],
            [
              29.8755,
              19.7733
            ],
            [
              29.8507,
              20.0463
            ],
            [
              29.8229,
              20.3169
            ],
            [
              29.792,
              20.5849
            ],
            [
              29.7578,
              20.8504
            ],
            [
              29.7202,
              21.1131
            ],
            [
              29.6789,
              21.373
            ],
            [
              29.6339,
              21.6298
            ],
            [
              29.5849,
              21.8836
            ],
            [
              29.5317,
              22.1341
            ],
            [
              29.4743,
              22.3813
            ],
            [
              29.4125,
              22.625
            ],
            [
              29.3461,
              22.8651
            ],
            [
              29.2748,
              23.1015
            ],
            [
              29.1987,
              23.3341
            ],
            [
              29.1175,
              23.5627
            ],
            [
              29.031,
              23.7873
            ],
            [
              28.939,
              24.0076
            ],
            [
              28.8415,
              24.2237
            ],
            [
              28.7383,
              24.4353
            ],
            [
              28.6291,
              24.6423
            ],
            [
              28.5139,
              24.8447
            ],
            [
              28.3924,
              25.0423
            ],
            [
              28.2645,
              25.2349
            ],
            [
              28.13,
              25.4226
            ],
            [
              27.9888,
              25.605
            ],
            [
              27.8407,
              25.7822
            ],
            [
              27.6856,
              25.954
            ],
            [
              27.5232,
              26.1202
            ],
            [
              27.3535,
              26.2808
            ],
            [
              27.1762,
              26.4356
            ],
            [
              26.9911,
              26.5846
            ],
            [
              26.7982,
              26.7275
            ],
            [
              26.5973,
              26.8643
            ],
            [
              26.3882,
              26.9949
            ],
            [
              26.1706,
              27.1191
            ],
            [
              25.9446,
              27.2368
            ],
            [
              25.7099,
              27.3479
            ],
            [
              25.4663,
              27.4523
            ],
            [
              25.2136,
              27.5498
            ],
            [
              24.9518,
              27.6403
            ],
            [
              24.6807,
              27.7238
            ],
            [
              24.4,
              27.8
            ],
            [
              24.12,
              27.8574
            ],
            [
              23.8388,
              27.9057
            ],
            [
              23.5566,
              27.9447
            ],
            [
              23.2737,
              27.9746
            ],
            [
              22.9902,
              27.9954
            ],
            [
              22.7064,
              28.0072
            ],
            [
              22.4225,
              28.0101
            ],
            [
              22.1388,
              28.004
            ],
            [
              21.8553,
              27.989
            ],
            [
              21.5725,
              27.9652
            ],
            [
              21.2904,
              27.9326
            ],
            [
              21.0093,
              27.8912
            ],
            [
              20.7295,
              27.8412
            ],
            [
              20.4511,
              27.7825
            ],
            [
              20.1744,
              27.7153
            ],
            [
              19.8995,
              27.6395
            ],
            [
              19.6268,
              27.5553
            ],
            [
              19.3565,
              27.4626
            ],
            [
              19.0887,
              27.3615
            ],
            [
              18.8236,
              27.252
            ],
            [
              18.5616,
              27.1343
            ],
            [
              18.3028,
              27.0084
            ],
            [
              18.0474,
              26.8742
            ],
            [
              17.7957,
              26.7319
            ],
            [
              17.5479,
              26.5815
            ],
            [
              17.3042,
              26.4231
            ],
            [
              17.0649,
              26.2567
            ],
            [
              16.83,
              26.0823
            ],
            [
              16.6,
              25.9
            ],
            [
              18.5,
              23.4
            ]
          ]
        ],
        "letter": "y"
      },
      {
        "paths": [
          [
            [
              35.8,
              11.4
            ],
            [
              35.641,
              11.2418
            ],
            [
              35.5406,
              11.0719
            ],
            [
              35.5012,
              10.8973
            ],
            [
              35.525,
              10.725
            ],
            [
              35.6145,
              10.5621
            ],
            [
              35.7719,
              10.4156
            ],
            [
              35.9996,
              10.2926
            ],
            [
              36.3,
              10.2
            ],
            [
              36.5833,
              10.1532
            ],
            [
              36.8682,
              10.1187
            ],
            [
              37.1542,
              10.0961
            ],
            [
              37.4408,
              10.0853
            ],
            [
              37.7275,
              10.0859
            ],
            [
              38.0139,
              10.0978
            ],
            [
              38.2994,
              10.1206
            ],
            [
              38.5836,
              10.1542
            ],
            [
              38.8659,
              10.1984
            ],
            [
              39.1459,
              10.2527
            ],
            [
              39.4231,
              10.3171
            ],
            [
              39.697,
              10.3912
            ],
            [
              39.9671,
              10.4749
            ],
            [
              40.233,
              10.5679
            ],
            [
              40.4941,
              10.6699
            ],
            [
              40.7499,
              10.7807
            ],
            [
              41.0,
              10.9
            ],
            [
              42.8,
              8.5
            ],
            [
              42.5639,
              8.3371
            ],
            [
              42.3226,
              8.1818
            ],
            [
              42.0764,
              8.0343
            ],
            [
              41.8255,
              7.8948
            ],
            [
              41.5703,
              7.7635
            ],
            [
              41.3111,
              7.6407
            ],
            [
              41.0482,
              7.5266
            ],
            [
              40.7819,
              7.4213
            ],
            [
              40.5125,
              7.325
            ],
            [
              40.2403,
              7.238
            ],
            [
              39.9657,
              7.1605
            ],
            [
              39.6889,
              7.0926
            ],
            [
              39.4102,
              7.0346
            ],
            [
              39.13,
              6.9867
            ],
            [
              38.8486,
              6.9491
            ],
            [
              38.5663,
              6.9219
            ],
            [
              38.2833,
              6.9055
            ],
            [
              38.0,
              6.9
            ],
            [
              37.9826,
              6.898
            ],
            [
              37.9319,
              6.893
            ],
            [
              37.8499,
              6.8863
            ],
            [
              37.7389,
              6.8794
            ],
            [
              37.601,
              6.8737
            ],
            [
              37.4384,
              6.8705
            ],
            [
              37.2531,
              6.8713
            ],
            [
              37.0474,
              6.8774
            ],
            [
              36.8234,
              6.8903
            ],
            [
              36.5833,
              6.9114
            ],
            [
              36.3292,
              6.942
            ],
            [
              36.0632,
              6.9836
            ],
            [
              35.7875,
              7.0375
            ],
            [
              35.5043,
              7.1052
            ],
            [
              35.2157,
              7.188
            ],
            [
              34.9238,
              7.2874
            ],
            [
              34.6309,
              7.4048
            ],
            [
              34.339,
              7.5415
            ],
            [
              34.0503,
              7.699
            ],
            [
              33.767,
              7.8786
            ],
            [
              33.4911,
              8.0818
            ],
            [
              33.225,
              8.3099
            ],
            [
              32.9706,
              8.5644
            ],
            [
              32.7303,
              8.8467
            ],
            [
              32.506,
              9.1581
            ],
            [
              32.3,
              9.5
            ],
            [
              32.1904,
              9.7571
            ],
            [
              32.1016,
              10.0177
            ],
            [
              32.0331,
              10.2809
            ],
            [
              31.9848,
              10.5456
            ],
            [
              31.9563,
              10.8109
            ],
            [
              31.9472,
              11.0759
            ],
            [
              31.9573,
              11.3395
            ],
            [
              31.9864,
              11.6008
            ],
            [
              32.0341,
              11.8588
            ],
            [
              32.1,
              12.1125
            ],
            [
              32.1839,
              12.361
            ],
            [
              32.2856,
              12.6032
            ],
            [
              32.4046,
              12.8382
            ],
            [
              32.5408,
              13.0651
            ],
            [
              32.6937,
              13.2828
            ],
            [
              32.8632,
              13.4904
            ],
            [
              33.0488,
              13.6869
            ],
            [
              33.2504,
              13.8713
            ],
            [
              33.4675,
              14.0427
            ],
            [
              33.7,
              14.2
            ],
            [
              33.952,
              14.3525
            ],
            [
              34.2207,
              14.4959
            ],
            [
              34.5038,
              14.6309
            ],
            [
              34.7989,
              14.7579
            ],
            [
              35.1038,
              14.8775
            ],
            [
              35.416,
              14.9901
            ],
            [
              35.7333,
              15.0963
            ],
            [
              36.0534,
              15.1966
            ],
            [
              36.3738,
              15.2915
            ],
            [
              36.6922,
              15.3816
            ],
            [
              37.0064,
              15.4674
            ],
            [
              37.314,
              15.5493
            ],
            [
              37.6126,
              15.6279
            ],
            [
              37.9,
              15.7037
            ],
            [
              38.1738,
              15.7773
            ],
            [
              38.4316,
              15.8491
            ],
            [
              38.6711,
              15.9196
            ],
            [
              38.8901,
              15.9895
            ],
            [
              39.0861,
              16.0592
            ],
            [
              39.2569,
              16.1292
            ],
            [
              39.4,
              16.2
            ],
            [
              39.6137,
              16.3431
            ],
            [
              39.7656,
              16.4971
            ],
            [
              39.8585,
              16.6578
            ],
            [
              39.895,
              16.8212
            ],
            [
              39.8778,
              16.9832
            ],
            [
              39.8098,
              17.1399
            ],
            [
              39.6935,
              17.2871
            ],
            [
              39.5316,
              17.4207
            ],
            [
              39.327,
              17.5368
            ],
            [
              39.0822,
              17.6313
            ],
            [
              38.8,
              17.7
            ],
            [
              38.5001,
              17.7258
            ],
            [
              38.2005,
              17.7401
            ],
            [
              37.9016,
              17.7432
            ],
            [
              37.6037,
              17.7351
            ],
            [
              37.3073,
              17.7161
            ],
            [
              37.0126,
              17.6864
            ],
            [
              36.72,
              17.646
            ],
            [
              36.4299,
              17.5953
            ],
            [
              36.1425,
              17.5343
            ],
            [
              35.8583,
              17.4632
            ],
            [
              35.5776,
              17.3823
            ],
            [
              35.3008,
              17.2917
            ],
            [
              35.0281,
              17.1915
            ],
            [
              34.76,
              17.082
            ],
            [
              34.4968,
              16.9632
            ],
            [
              34.2389,
              16.8355
            ],
            [
              33.9865,
              16.6989
            ],
            [
              33.7401,
              16.5537
            ],
            [
              33.5,
              16.4
            ],
            [
              31.7,
              18.8
            ],
            [
              31.9393,
              18.9711
            ],
            [
              32.1833,
              19.137
            ],
            [
              32.4318,
              19.2974
            ],
            [
              32.6845,
              19.452
            ],
            [
              32.9411,
              19.6006
            ],
            [
              33.2014,
              19.7429
            ],
            [
              33.4651,
              19.8786
            ],
            [
              33.7319,
              20.0075
            ],
            [
              34.0016,
              20.1293
            ],
            [
              34.274,
              20.2438
            ],
            [
              34.5487,
              20.3506
            ],
            [
              34.8255,
              20.4496
            ],
            [
              35.1042,
              20.5405
            ],
            [
              35.3844,
              20.6229
            ],
            [
              35.666,
              20.6967
            ],
            [
              35.9485,
              20.7616
            ],
            [
              36.2319,
              20.8172
            ],
            [
              36.5158,
              20.8635
            ],
            [
              36.8,
              20.9
            ],
            [
              36.8179,
              20.9031
            ],
            [
              36.8701,
              20.9113
            ],
            [
              36.9547,
              20.9232
            ],
            [
              37.0693,
              20.937
            ],
            [
              37.212,
              20.9512
            ],
            [
              37.3806,
              20.9643
            ],
            [
              37.573,
              20.9746
            ],
            [
              37.7871,
              20.9807
            ],
            [
              38.0208,
              20.9809
            ],
            [
              38.272,
              20.9736
            ],
            [
              38.5385,
              20.9573
            ],
            [
              38.8183,
              20.9304
            ],
            [
              39.1092,
              20.8913
            ],
            [
              39.4092,
              20.8385
            ],
            [
              39.716,
              20.7704
            ],
            [
              40.0276,
              20.6854
            ],
            [
              40.342,
              20.5819
            ],
            [
              40.6569,
              20.4583
            ],
            [
              40.9703,
              20.3132
            ],
            [
              41.28,
              20.1448
            ],
            [
              41.584,
              19.9517
            ],
            [
              41.8801,
              19.7322
            ],
            [
              42.1662,
              19.4848
            ],
            [
              42.4402,
              19.2079
            ],
            [
              42.7,
              18.9
            ],
            [
              42.855,
              18.6776
            ],
            [
              42.9926,
              18.4476
            ],
            [
              43.1128,
              18.211
            ],
            [
              43.2157,
              17.9687
            ],
            [
              43.3012,
              17.7218
            ],
            [
              43.3694,
              17.4712
            ],
            [
              43.4202,
              17.2181
            ],
            [
              43.4537,
              16.9634
            ],
            [
              43.4698,
              16.7082
            ],
            [
              43.4686,
              16.4533
            ],
            [
              43.45,
              16.2
            ],
            [
              43.414,
              15.9491
            ],
            [
              43.3607,
              15.7018
            ],
            [
              43.2901,
              15.4589
            ],
            [
              43.2021,
              15.2216
            ],
            [
              43.0967,
              14.9908
            ],
            [
              42.974,
              14.7675
            ],
            [
              42.8339,
              14.5528
            ],
            [
              42.6764,
              14.3477
            ],
            [
              42.5017,
              14.1532
            ],
            [
              42.3095,
              13.9703
            ],
            [
              42.1,
              13.8
            ],
            [
              41.9344,
              13.6672
            ],
            [
              41.75,
              13.5625
            ],
            [
              41.5656,
              13.4766
            ],
            [
              41.4,
              13.4
            ],
            [
              41.1228,
              13.2611
            ],
            [
              40.8351,
              13.1299
            ],
            [
              40.5388,
              13.0058
            ],
            [
              40.2357,
              12.8883
            ],
            [
              39.9276,
              12.777
            ],
            [
              39.6163,
              12.6711
            ],
            [
              39.3037,
              12.5704
            ],
            [
              38.9915,
              12.4741
            ],
            [
              38.6816,
              12.3819
            ],
            [
              38.3758,
              12.2932
            ],
            [
              38.0759,
              12.2075
            ],
            [
              37.7837,
              12.1242
            ],
            [
              37.501,
              12.0429
            ],
            [
              37.2296,
              11.963
            ],
            [
              36.9714,
              11.884
            ],
            [
              36.7282,
              11.8054
            ],
            [
              36.5017,
              11.7266
            ],
            [
              36.2939,
              11.6472
            ],
            [
              36.1064,
              11.5667
            ],
            [
              35.9412,
              11.4844
            ],
            [
              35.8,
              11.4
            ]
          ]
        ],
        "letter": "s"
      },
      {
        "paths": [
          [
            [
              44.4,
              13.9
            ],
            [
              44.4055,
              13.6161
            ],
            [
              44.4219,
              13.3352
            ],
            [
              44.4489,
              13.0577
            ],
            [
              44.4864,
              12.7835
            ],
            [
              44.5341,
              12.513
            ],
            [
              44.592,
              12.2464
            ],
            [
              44.6596,
              11.9838
            ],
            [
              44.737,
              11.7255
            ],
            [
              44.8238,
              11.4717
            ],
            [
              44.9199,
              11.2225
            ],
            [
              45.025,
              10.9781
            ],
            [
              45.139,
              10.7389
            ],
            [
              45.2617,
              10.5048
            ],
            [
              45.3928,
              10.2763
            ],
            [
              45.5322,
              10.0534
            ],
            [
              45.6796,
              9.8363
            ],
            [
              45.8349,
              9.6253
            ],
            [
              45.9979,
              9.4206
            ],
            [
              46.1683,
              9.2224
            ],
            [
              46.346,
              9.0307
            ],
            [
              46.5307,
              8.846
            ],
            [
              46.7224,
              8.6683
            ],
            [
              46.9206,
              8.4979
            ],
            [
              47.1253,
              8.3349
            ],
            [
              47.3363,
              8.1796
            ],
            [
              47.5534,
              8.0322
            ],
            [
              47.7763,
              7.8928
            ],
            [
              48.0048,
              7.7617
            ],
            [
              48.2389,
              7.639
            ],
            [
              48.4781,
              7.525
            ],
            [
              48.7225,
              7.4199
            ],
            [
              48.9717,
              7.3238
            ],
            [
              49.2255,
              7.237
            ],
            [
              49.4838,
              7.1596
            ],
            [
              49.7464,
              7.092
            ],
            [
              50.013,
              7.0341
            ],
            [
              50.2835,
              6.9864
            ],
            [
              50.5577,
              6.9489
            ],
            [
              50.8352,
              6.9219
            ],
            [
              51.1161,
              6.9055
            ],
            [
              51.4,
              6.9
            ],
            [
              51.6839,
              6.9055
            ],
            [
              51.9648,
              6.9219
            ],
            [
              52.2423,
              6.9489
            ],
            [
              52.5165,
              6.9864
            ],
            [
              52.787,
              7.0341
            ],
            [
              53.0536,
              7.092
            ],
            [
              53.3162,
              7.1596
            ],
            [
              53.5745,
              7.237
            ],
            [
              53.8283,
              7.3238
            ],
            [
              54.0775,
              7.4199
            ],
            [
              54.3219,
              7.525
            ],
            [
              54.5611,
              7.639
            ],
            [
              54.7952,
              7.7617
            ],
            [
              55.0237,
              7.8928
            ],
            [
              55.2466,
              8.0322
            ],
            [
              55.4637,
              8.1796
            ],
            [
              55.6747,
              8.3349
            ],
            [
              55.8794,
              8.4979
            ],
            [
              56.0776,
              8.6683
            ],
            [
              56.2693,
              8.846
            ],
            [
              56.454,
              9.0307
            ],
            [
              56.6317,
              9.2224
            ],
            [
              56.8021,
              9.4206
            ],
            [
              56.9651,
              9.6253
            ],
            [
              57.1204,
              9.8363
            ],
            [
              57.2678,
              10.0534
            ],
            [
              57.4072,
              10.2763
            ],
            [
              57.5383,
              10.5048
            ],
            [
              57.661,
              10.7389
            ],
            [
              57.775,
              10.9781
            ],
            [
              57.8801,
              11.2225
            ],
            [
              57.9762,
              11.4717
            ],
            [
              58.063,
              11.7255
            ],
            [
              58.1404,
              11.9838
            ],
            [
              58.208,
              12.2464
            ],
            [
              58.2659,
              12.513
            ],
            [
              58.3136,
              12.7835
            ],
            [
              58.3511,
              13.0577
            ],
            [
              58.3781,
              13.3352
            ],
            [
              58.3945,
              13.6161
            ],
            [
              58.4,
              13.9
            ],
            [
              58.3945,
              14.1839
            ],
            [
              58.3781,
              14.4648
            ],
            [
              58.3511,
              14.7423
            ],
            [
              58.3136,
              15.0165
            ],
            [
              58.2659,
              15.287
            ],
            [
              58.208,
              15.5536
            ],
            [
              58.1404,
              15.8162
            ],
            [
              58.063,
              16.0745
            ],
            [
              57.9762,
              16.3283
            ],
            [
              57.8801,
              16.5775
            ],
            [
              57.775,
              16.8219
            ],
            [
              57.661,
              17.0611
            ],
            [
              57.5383,
              17.2952
            ],
            [
              57.4072,
              17.5237
            ],
            [
              57.2678,
              17.7466
            ],
            [
              57.1204,
              17.9637
            ],
            [
              56.9651,
              18.1747
            ],
            [
              56.8021,
              18.3794
            ],
            [
              56.6317,
              18.5776
            ],
            [
              56.454,
              18.7693
            ],
            [
              56.2693,
              18.954
            ],
            [
              56.0776,
              19.1317
            ],
            [
              55.8794,
              19.3021
            ],
            [
              55.6747,
              19.4651
            ],
            [
              55.4637,
              19.6204
            ],
            [
              55.2466,
              19.7678
            ],
            [
              55.0237,
              19.9072
            ],
            [
              54.7952,
              20.0383
            ],
            [
              54.5611,
              20.161
            ],
            [
              54.3219,
              20.275
            ],
            [
              54.0775,
              20.3801
            ],
            [
              53.8283,
              20.4762
            ],
            [
              53.5745,
              20.563
            ],
            [
              53.3162,
              20.6404
            ],
            [
              53.0536,
              20.708
            ],
            [
              52.787,
              20.7659
            ],
            [
              52.5165,
              20.8136
            ],
            [
              52.2423,
              20.8511
            ],
            [
              51.9648,
              20.8781
            ],
            [
              51.6839,
              20.8945
            ],
            [
              51.4,
              20.9
            ],
            [
              51.4,
              20.9
            ],
            [
              51.1231,
              20.8945
            ],
            [
              50.8485,
              20.8781
            ],
            [
              50.5765,
              20.8511
            ],
            [
              50.3074,
              20.8136
            ],
            [
              50.0412,
              20.7659
            ],
            [
              49.7784,
              20.708
            ],
            [
              49.5191,
              20.6404
            ],
            [
              49.2635,
              20.563
            ],
            [
              49.0118,
              20.4762
            ],
            [
              48.7643,
              20.3801
            ],
            [
              48.5212,
              20.275
            ],
            [
              48.2828,
              20.161
            ],
            [
              48.0492,
              20.0383
            ],
            [
              47.8207,
              19.9072
            ],
            [
              47.5975,
              19.7678
            ],
            [
              47.3799,
              19.6204
            ],
            [
              47.168,
              19.4651
            ],
            [
              46.9621,
              19.3021
            ],
            [
              46.7624,
              19.1317
            ],
            [
              46.5691,
              18.954
            ],
            [
              46.3826,
              18.7693
            ],
            [
              46.2029,
              18.5776
            ],
            [
              46.0303,
              18.3794
            ],
            [
              45.8651,
              18.1747
            ],
            [
              45.7075,
              17.9637
            ],
            [
              45.5576,
              17.7466
            ],
            [
              45.4158,
              17.5237
            ],
            [
              45.2823,
              17.2952
            ],
            [
              45.1572,
              17.0611
            ],
            [
              45.0408,
              16.8219
            ],
            [
              44.9334,
              16.5775
            ],
            [
              44.8351,
              16.3283
            ],
            [
              44.7462,
              16.0745
            ],
            [
              44.6669,
              15.8162
            ],
            [
              44.5974,
              15.5536
            ],
            [
              44.5381,
              15.287
            ],
            [
              44.489,
              15.0165
            ],
            [
              44.4504,
              14.7423
            ],
            [
              44.4225,
              14.4648
            ],
            [
              44.4057,
              14.1839
            ],
            [
              44.4,
              13.9
            ]
          ],
          [
            [
              51.4,
              17.2
            ],
            [
              51.6819,
              17.1889
            ],
            [
              51.9569,
              17.1561
            ],
            [
              52.2243,
              17.1025
            ],
            [
              52.4832,
              17.0288
            ],
            [
              52.7328,
              16.9359
            ],
            [
              52.9723,
              16.8247
            ],
            [
              53.2008,
              16.6959
            ],
            [
              53.4176,
              16.5504
            ],
            [
              53.6218,
              16.389
            ],
            [
              53.8125,
              16.2125
            ],
            [
              53.989,
              16.0218
            ],
            [
              54.1504,
              15.8176
            ],
            [
              54.2959,
              15.6008
            ],
            [
              54.4247,
              15.3723
            ],
            [
              54.5359,
              15.1328
            ],
            [
              54.6288,
              14.8832
            ],
            [
              54.7025,
              14.6243
            ],
            [
              54.7561,
              14.3569
            ],
            [
              54.7889,
              14.0819
            ],
            [
              54.8,
              13.8
            ],
            [
              54.7889,
              13.5181
            ],
            [
              54.7561,
              13.2431
            ],
            [
              54.7025,
              12.9757
            ],
            [
              54.6288,
              12.7168
            ],
            [
              54.5359,
              12.4672
            ],
            [
              54.4247,
              12.2277
            ],
            [
              54.2959,
              11.9992
            ],
            [
              54.1504,
              11.7824
            ],
            [
              53.989,
              11.5782
            ],
            [
              53.8125,
              11.3875
            ],
            [
              53.6218,
              11.211
            ],
            [
              53.4176,
              11.0496
            ],
            [
              53.2008,
              10.9041
            ],
            [
              52.9723,
              10.7753
            ],
            [
              52.7328,
              10.6641
            ],
            [
              52.4832,
              10.5712
            ],
            [
              52.2243,
              10.4975
            ],
            [
              51.9569,
              10.4439
            ],
            [
              51.6819,
              10.4111
            ],
            [
              51.4,
              10.4
            ],
            [
              51.1181,
              10.4111
            ],
            [
              50.8431,
              10.4439
            ],
            [
              50.5757,
              10.4975
            ],
            [
              50.3168,
              10.5712
            ],
            [
              50.0672,
              10.6641
            ],
            [
              49.8277,
              10.7753
            ],
            [
              49.5992,
              10.9041
            ],
            [
              49.3824,
              11.0496
            ],
            [
              49.1782,
              11.211
            ],
            [
              48.9875,
              11.3875
            ],
            [
              48.811,
              11.5782
            ],
            [
              48.6496,
              11.7824
            ],
            [
              48.5041,
              11.9992
            ],
            [
              48.3753,
              12.2277
            ],
            [
              48.2641,
              12.4672
            ],
            [
              48.1712,
              12.7168
            ],
            [
              48.0975,
              12.9757
            ],
            [
              48.0439,
              13.2431
            ],
            [
              48.0111,
              13.5181
            ],
            [
              48.0,
              13.8
            ],
            [
              48.0254,
              14.0826
            ],
            [
              48.0709,
              14.3596
            ],
            [
              48.1358,
              14.63
            ],
            [
              48.2192,
              14.8928
            ],
            [
              48.3203,
              15.1469
            ],
            [
              48.4383,
              15.3912
            ],
            [
              48.5723,
              15.6247
            ],
            [
              48.7216,
              15.8464
            ],
            [
              48.8853,
              16.0552
            ],
            [
              49.0625,
              16.25
            ],
            [
              49.2525,
              16.4298
            ],
            [
              49.4544,
              16.5936
            ],
            [
              49.6674,
              16.7403
            ],
            [
              49.8907,
              16.8688
            ],
            [
              50.1234,
              16.9781
            ],
            [
              50.3648,
              17.0672
            ],
            [
              50.614,
              17.135
            ],
            [
              50.8701,
              17.1804
            ],
            [
              51.1324,
              17.2024
            ],
            [
              51.4,
              17.2
            ],
            [
              51.4,
              17.2563
            ],
            [
              51.4,
              17.275
            ],
            [
              51.4,
              17.2563
            ],
            [
              51.4,
              17.2
            ],
            [
              51.4,
              17.2
            ]
          ]
        ],
        "letter": "o"
      },
      {
        "paths": [
          [
            [
              70.3,
              13.9
            ],
            [
              70.2889,
              13.6324
            ],
            [
              70.2562,
              13.3702
            ],
            [
              70.2028,
              13.1143
            ],
            [
              70.1296,
              12.8656
            ],
            [
              70.0375,
              12.625
            ],
            [
              69.9274,
              12.3934
            ],
            [
              69.8002,
              12.1717
            ],
            [
              69.6568,
              11.9608
            ],
            [
              69.4981,
              11.7616
            ],
            [
              69.325,
              11.575
            ],
            [
              69.1384,
              11.4019
            ],
            [
              68.9392,
              11.2432
            ],
            [
              68.7283,
              11.0998
            ],
            [
              68.5066,
              10.9726
            ],
            [
              68.275,
              10.8625
            ],
            [
              68.0344,
              10.7704
            ],
            [
              67.7857,
              10.6972
            ],
            [
              67.5298,
              10.6438
            ],
            [
              67.2676,
              10.6111
            ],
            [
              67.0,
              10.6
            ],
            [
              66.7324,
              10.6111
            ],
            [
              66.4702,
              10.6438
            ],
            [
              66.2143,
              10.6972
            ],
            [
              65.9656,
              10.7704
            ],
            [
              65.725,
              10.8625
            ],
            [
              65.4934,
              10.9726
            ],
            [
              65.2717,
              11.0998
            ],
            [
              65.0608,
              11.2432
            ],
            [
              64.8616,
              11.4019
            ],
            [
              64.675,
              11.575
            ],
            [
              64.5019,
              11.7616
            ],
            [
              64.3432,
              11.9608
            ],
            [
              64.1998,
              12.1717
            ],
            [
              64.0726,
              12.3934
            ],
            [
              63.9625,
              12.625
            ],
            [
              63.8704,
              12.8656
            ],
            [
              63.7972,
              13.1143
            ],
            [
              63.7438,
              13.3702
            ],
            [
              63.7111,
              13.6324
            ],
            [
              63.7,
              13.9
            ],
            [
              63.7,
              13.9
            ],
            [
              63.7,
              13.9
            ],
            [
              63.7,
              13.9
            ],
            [
              63.7,
              13.9
            ],
            [
              63.7,
              14.0443
            ],
            [
              63.7,
              14.2389
            ],
            [
              63.7,
              14.4785
            ],
            [
              63.7,
              14.7579
            ],
            [
              63.7,
              15.0717
            ],
            [
              63.7,
              15.4148
            ],
            [
              63.7,
              15.7817
            ],
            [
              63.7,
              16.1673
            ],
            [
              63.7,
              16.5663
            ],
            [
              63.7,
              16.9733
            ],
            [
              63.7,
              17.3832
            ],
            [
              63.7,
              17.7906
            ],
            [
              63.7,
              18.1902
            ],
            [
              63.7,
              18.5768
            ],
            [
              63.7,
              18.9452
            ],
            [
              63.7,
              19.2899
            ],
            [
              63.7,
              19.6058
            ],
            [
              63.7,
              19.8876
            ],
            [
              63.7,
              20.13
            ],
            [
              63.7,
              20.3277
            ],
            [
              63.7,
              20.4755
            ],
            [
              63.7,
              20.568
            ],
            [
              63.7,
              20.6
            ],
            [
              60.0,
              20.6
            ],
            [
              60.0,
              20.5734
            ],
            [
              60.0,
              20.4962
            ],
            [
              60.0,
              20.3721
            ],
            [
              60.0,
              20.205
            ],
            [
              60.0,
              19.9986
            ],
            [
              60.0,
              19.7567
            ],
            [
              60.0,
              19.4832
            ],
            [
              60.0,
              19.1819
            ],
            [
              60.0,
              18.8564
            ],
            [
              60.0,
              18.5107
            ],
            [
              60.0,
              18.1486
            ],
            [
              60.0,
              17.7737
            ],
            [
              60.0,
              17.39
            ],
            [
              60.0,
              17.0012
            ],
            [
              60.0,
              16.6111
            ],
            [
              60.0,
              16.2236
            ],
            [
              60.0,
              15.8423
            ],
            [
              60.0,
              15.4712
            ],
            [
              60.0,
              15.1139
            ],
            [
              60.0,
              14.7744
            ],
            [
              60.0,
              14.4564
            ],
            [
              60.0,
              14.1636
            ],
            [
              60.0,
              13.9
            ],
            [
              60.0055,
              13.6161
            ],
            [
              60.0219,
              13.3352
            ],
            [
              60.0489,
              13.0577
            ],
            [
              60.0864,
              12.7835
            ],
            [
              60.1341,
              12.513
            ],
            [
              60.192,
              12.2464
            ],
            [
              60.2596,
              11.9838
            ],
            [
              60.337,
              11.7255
            ],
            [
              60.4238,
              11.4717
            ],
            [
              60.5199,
              11.2225
            ],
            [
              60.625,
              10.9781
            ],
            [
              60.739,
              10.7389
            ],
            [
              60.8617,
              10.5048
            ],
            [
              60.9928,
              10.2763
            ],
            [
              61.1322,
              10.0534
            ],
            [
              61.2796,
              9.8363
            ],
            [
              61.4349,
              9.6253
            ],
            [
              61.5979,
              9.4206
            ],
            [
              61.7683,
              9.2224
            ],
            [
              61.946,
              9.0307
            ],
            [
              62.1307,
              8.846
            ],
            [
              62.3224,
              8.6683
            ],
            [
              62.5206,
              8.4979
            ],
            [
              62.7253,
              8.3349
            ],
            [
              62.9363,
              8.1796
            ],
            [
              63.1534,
              8.0322
            ],
            [
              63.3763,
              7.8928
            ],
            [
              63.6048,
              7.7617
            ],
            [
              63.8389,
              7.639
            ],
            [
              64.0781,
              7.525
            ],
            [
              64.3225,
              7.4199
            ],
            [
              64.5717,
              7.3238
            ],
            [
              64.8255,
              7.237
            ],
            [
              65.0838,
              7.1596
            ],
            [
              65.3464,
              7.092
            ],
            [
              65.613,
              7.0341
            ],
            [
              65.8835,
              6.9864
            ],
            [
              66.1577,
              6.9489
            ],
            [
              66.4352,
              6.9219
            ],
            [
              66.7161,
              6.9055
            ],
            [
              67.0,
              6.9
            ],
            [
              67.2839,
              6.9055
            ],
            [
              67.5648,
              6.9219
            ],
            [
              67.8423,
              6.9489
            ],
            [
              68.1165,
              6.9864
            ],
            [
              68.387,
              7.0341
            ],
            [
              68.6536,
              7.092
            ],
            [
              68.9162,
              7.1596
            ],
            [
              69.1745,
              7.237
            ],
            [
              69.4283,
              7.3238
            ],
            [
              69.6775,
              7.4199
            ],
            [
              69.9219,
              7.525
            ],
            [
              70.1611,
              7.639
            ],
            [
              70.3952,
              7.7617
            ],
            [
              70.6237,
              7.8928
            ],
            [
              70.8466,
              8.0322
            ],
            [
              71.0637,
              8.1796
            ],
            [
              71.2747,
              8.3349
            ],
            [
              71.4794,
              8.4979
            ],
            [
              71.6776,
              8.6683
            ],
            [
              71.8693,
              8.846
            ],
            [
              72.054,
              9.0307
            ],
            [
              72.2317,
              9.2224
            ],
            [
              72.4021,
              9.4206
            ],
            [
              72.5651,
              9.6253
            ],
            [
              72.7204,
              9.8363
            ],
            [
              72.8678,
              10.0534
            ],
            [
              73.0072,
              10.2763
            ],
            [
              73.1383,
              10.5048
            ],
            [
              73.261,
              10.7389
            ],
            [
              73.375,
              10.9781
            ],
            [
              73.4801,
              11.2225
            ],
            [
              73.5762,
              11.4717
            ],
            [
              73.663,
              11.7255
            ],
            [
              73.7404,
              11.9838
            ],
            [
              73.808,
              12.2464
            ],
            [
              73.8659,
              12.513
            ],
            [
              73.9136,
              12.7835
            ],
            [
              73.9511,
              13.0577
            ],
            [
              73.9781,
              13.3352
            ],
            [
              73.9945,
              13.6161
            ],
            [
              74.0,
              13.9
            ],
            [
              74.0,
              13.9
            ],
            [
              74.0,
              13.9
            ],
            [
              74.0,
              13.9
            ],
            [
              74.0,
              13.9
            ],
            [
              74.0,
              14.1756
            ],
            [
              74.0,
              14.4781
            ],
            [
              74.0,
              14.804
            ],
            [
              74.0,
              15.1495
            ],
            [
              74.0,
              15.5111
            ],
            [
              74.0,
              15.8851
            ],
            [
              74.0,
              16.2678
            ],
            [
              74.0,
              16.6555
            ],
            [
              74.0,
              17.0447
            ],
            [
              74.0,
              17.4317
            ],
            [
              74.0,
              17.8128
            ],
            [
              74.0,
              18.1844
            ],
            [
              74.0,
              18.5428
            ],
            [
              74.0,
              18.8844
            ],
            [
              74.0,
              19.2055
            ],
            [
              74.0,
              19.5026
            ],
            [
              74.0,
              19.7718
            ],
            [
              74.0,
              20.0097
            ],
            [
              74.0,
              20.2125
            ],
            [
              74.0,
              20.3765
            ],
            [
              74.0,
              20.4982
            ],
            [
              74.0,
              20.574
            ],
            [
              74.0,
              20.6
            ],
            [
              70.4,
              20.6
            ],
            [
              70.3875,
              20.568
            ],
            [
              70.3761,
              20.4755
            ],
            [
              70.3658,
              20.3277
            ],
            [
              70.3564,
              20.13
            ],
            [
              70.3479,
              19.8876
            ],
            [
              70.3404,
              19.6058
            ],
            [
              70.3337,
              19.2899
            ],
            [
              70.3277,
              18.9452
            ],
            [
              70.3226,
              18.5768
            ],
            [
              70.3181,
              18.1902
            ],
            [
              70.3142,
              17.7906
            ],
            [
              70.3109,
              17.3832
            ],
            [
              70.3082,
              16.9733
            ],
            [
              70.306,
              16.5663
            ],
            [
              70.3042,
              16.1673
            ],
            [
              70.3028,
              15.7817
            ],
            [
              70.3018,
              15.4148
            ],
            [
              70.301,
              15.0717
            ],
            [
              70.3005,
              14.7579
            ],
            [
              70.3002,
              14.4785
            ],
            [
              70.3001,
              14.2389
            ],
            [
              70.3,
              14.0443
            ],
            [
              70.3,
              13.9
            ]
          ]
        ],
        "letter": "n"
      }
    ]
  },
  "music": [
    {
      "id": "jingle-bright",
      "day": 7,
      "label": "Jingle Bells · 輕快版",
      "title": "Jingle Bells",
      "isrc": "USUAN1100187",
      "showOffset": 0,
      "source": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100187",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "src": "./assets/audio/jingle-bright.m4a"
    },
    {
      "id": "jingle-calm",
      "day": 24,
      "label": "Jingle Bells · 冬日慢版",
      "title": "Jingle Bells (Calm)",
      "isrc": "USUAN1100188",
      "showOffset": 0,
      "source": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100188",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "src": "./assets/audio/jingle-calm.m4a"
    },
    {
      "id": "merry-christmas",
      "day": 25,
      "label": "We Wish You a Merry Christmas",
      "title": "We Wish you a Merry Christmas",
      "isrc": "USUAN1100369",
      "showOffset": 70,
      "source": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100369",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "src": "./assets/audio/merry-christmas.m4a"
    }
  ],
  "cardMusic": {
    "id": "jingle-bright",
    "duration": 5,
    "sourceOffset": 8,
    "src": "./assets/audio/card-jingle-bells-5s.m4a"
  },
  "productStyle": "miniature-relief-v1",
  "productRevision": "20261021-four-products-v2",
  "brandLogos": {
    "white": "./assets/images/brand/dyson-logo-white.png",
    "black": "./assets/images/brand/dyson-logo-black.png"
  },
  "bonusSprites": {
    "101": "./assets/images/bonus/bonus-golden-dance.png?v=20261022-v21",
    "102": "./assets/images/bonus/bonus-shiba-business.png?v=20261022-natural-v1",
    "103": "./assets/images/bonus/bonus-polar-bear-samoyed.png?v=20261022-natural-v1",
    "104": "./assets/images/bonus/bonus-cat-gift-box.png?v=20261022-natural-v1",
    "105": "./assets/images/bonus/bonus-capybara-bath.png?v=20261022-v21",
    "106": "./assets/images/bonus/bonus-penguin-slide.png?v=20261022-natural-v1",
    "107": "./assets/images/bonus/bonus-white-sea-lion.png?v=20261022-white-pup-v1",
    "108": "./assets/images/bonus/bonus-red-panda-tree.png?v=20261022-natural-v1",
    "109": "./assets/images/bonus/bonus-otter-shell.png?v=20261022-v21",
    "110": "./assets/images/bonus/bonus-fox-snow-dive.png?v=20261022-natural-v1"
  }
};
