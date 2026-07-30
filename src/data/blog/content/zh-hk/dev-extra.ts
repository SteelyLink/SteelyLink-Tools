import type { BlogPostContent } from '@/types/blog';

const content: Record<string, BlogPostContent> = {
  // ========== 1. UUID 產生器 ==========
  'how-to-use-uuid-generator': {
    title: 'UUID 產生器：點樣喺網上產生通用唯一識別碼',
    metaTitle: 'UUID 產生器 – 免費網上產生 UUID v1、v4、v7',
    metaDescription:
      '免費網上產生 UUID。支援 UUID v1、v4 同 v7。了解碰撞機率、GUID 同 UUID 分別、資料庫主鍵取捨，同埋最佳實踐。',
    keywords: [
      'uuid 產生器',
      '網上產生 uuid',
      'uuid v4 產生器',
      'uuid v7',
      'guid 產生器',
      '免費產生 uuid',
      'uuid vs guid',
      'uuid 碰撞機率',
      '通用唯一識別碼',
    ],
    intro:
      'UUID（通用唯一識別碼）係一個 128 位元嘅數字，用 36 個十六進位字元顯示，格式係 8-4-4-4-12 — 例如 550e8400-e29b-41d4-a716-446655440000。當你個應用程式要喺冇中央權威嘅情況下產生識別碼，UUID 就係最佳方案。我哋嘅網上產生器可以一 click 產生多個版本嘅 UUID — v1（時間加埋 MAC 位址）、v4（隨機）同 v7（時間排序）。同自動遞增整數唔同，後者會洩露紀錄數量同埋喺分散式節點間碰撞，UUID 可以喺任何伺服器、任何瀏覽器、任何裝置上獨立產生，碰撞機率極低 — 就算每秒產生 10 億個 UUID 持續 85 年，都只係得 50% 機會出現一次重複（v4，用 2^122 隨機位元）。咁令 UUID 好適合分散式系統、多租戶資料庫同用戶端 ID 產生。我哋個工具完全喺你個瀏覽器度行，用 Web Crypto API 攞加密安全嘅隨機數 — 冇任何資料會離開你部機。',
    steps: [
      {
        heading: '揀你嘅 UUID 版本',
        body: '喺 UUID v1（時間戳加 MAC 位址，啱需要時間排序嘅時候用）、v4（完全隨機，最廣泛使用嘅版本）同 v7（時間排序加隨機後綴，RFC 9562，喺資料庫度因為索引友好嘅順序排序而愈嚟愈普及）之間揀。每個版本都有簡單說明佢嘅取捨，等你揀到最啱你用途嘅版本。',
      },
      {
        heading: '產生一個或者多個 UUID',
        body: 'Click「產生」就可以即刻產生一個 UUID。要更多？設定批次數量可以一次過產生最多 100 個 UUID — 輸出結果會用項目符號清單、逗號分隔值或者 JSON 陣列顯示。每個 UUID 都係用瀏覽器嘅 crypto.getRandomValues() API 以加密安全隨機數獨立產生。',
      },
      {
        heading: '複製、匯出或者批次下載',
        body: 'Click 任何 UUID 旁邊嘅複製圖示就可以抄去剪貼簿，或者用「全部複製」做批次輸出。批次產生嘅話，可以將結果下載做 .txt 檔案或者 JSON 陣列。呢個工具同時用標準格式同原始十六進位（冇連字號）顯示 UUID，某啲資料庫鍾意用後者嚟儲存。',
      },
    ],
    tips: [
      'UUID v4 用 122 位元嘅隨機性，提供 5.3 x 10^36 種可能值 — 大約等如 2^122。發生單次碰撞嘅機會仲低過地球喺嚟緊五秒內俾流浪小行星撞擊嘅機會。',
      'UUID v7（RFC 9562）係推薦畀資料庫主鍵嘅新標準。佢喺頭 6 位元組度編碼 48 位元毫秒時間戳，令佢自然可以排序 — 避開咗困擾隨機 UUID v4 嘅 B-tree 索引碎片化問題。',
      '唔好喺 MySQL/InnoDB 或 SQL Server 呢類資料庫度用 UUID v4 做叢集主鍵：隨機性會搞到頁面分割同 B-tree 碎片化。可以改用 v7，或者將 UUID 配搭自動遞增整數主鍵，再將 UUID 加做次要唯一欄位。',
      'GUID 同 UUID 係同一樣嘢。Microsoft 叫佢做 GUID（全域唯一識別碼），而 IETF 標準（RFC 9562）叫佢 UUID。兩者共享相同嘅 128 位元結構同格式。',
      '36 字元嘅 UUID 字串比 8 位元組 bigint 大 4 倍，比原始 16 位元組二進位表示大 2.25 倍。對於生產資料庫，將 UUID 儲存做 BINARY(16) 而唔係 CHAR(36)，可以慳位同改善索引效能。',
      'ULID（通用唯一字典排序識別碼）係一個 26 字元嘅替代方案，頭 10 個字元編碼時間戳，剩低 16 個字元係隨機數。佢用 Crockford 嘅 Base32，令佢 URL 安全兼且比 UUID 短。當你需要可排序性同人類可讀性嗰陣，建議用 ULID。我哋個工具可以同時產生 ULID 同 UUID。',
      '如果你要保護產生電腦嘅 MAC 位址私隱，千祈唔好用 UUID v1 — v1 UUID 嘅最後 48 位元編碼咗網路卡嘅 MAC 位址。對於私隱敏感嘅應用，請改用 v4 或者 v7。',
      '喺 JavaScript 度用 UUID 嗰陣，crypto.randomUUID() 喺所有現代瀏覽器同 Node.js 19+ 都有原生支援。佢永遠產生 UUID v4。要 v7 嘅話，用 uuid.js 呢類 library 或者支援版本參數嘅 crypto.randomUUID() polyfill。',
    ],
    faqs: [
      {
        q: 'UUID v1、v4 同 v7 之間有咩分別？',
        a: 'UUID v1 用產生電腦嘅 MAC 位址同當前時間戳 — 佢係唯一嘅，但會洩露幾時同邊度產生。UUID v4 用 122 位元隨機資料，唔會洩露任何來源資訊，係最受歡迎嘅版本。UUID v7 將 48 位元毫秒精度時間戳（頭 6 位元組）同 74 位元隨機數結合 — 佢既可排序又保護私隱，根據 RFC 9562（2024）推薦畀資料庫主鍵用。',
      },
      {
        q: 'UUID v4 嘅碰撞機率係幾多？',
        a: '喺 2^122（約 5.3 x 10^36）種可能值之下，碰撞機率極低。按照生日悖論，你要產生大約 2.7 x 10^18 個 UUID（27 億兆）先至有 50% 機會出現單次碰撞。每秒產生 10 億個 UUID 持續 85 年，先至大約有 50% 機會出現一次重複 — 喺所有實際應用嚟講，UUID v4 碰撞可以當做唔可能。',
      },
      {
        q: '我可唔可以用 UUID 做資料庫主鍵？',
        a: '可以，不過有個好重要嘅注意事項。隨機 UUID（v4）會喺 MySQL InnoDB 呢類資料庫度造成 B-tree 索引碎片化，因為新資料列會插入索引入面嘅隨機位置，而唔係附加喺尾尾。咁會搞到頁面分割、快取效率降低，同埋隨住表格增長查詢變慢。UUID v7 透過將可排序時間戳放喺開頭嚟解決呢個問題，令插入差唔多係順序嘅。一係就用自動遞增整數做叢集鍵，再用 UUID 做次要唯一欄位畀外部參考。',
      },
      {
        q: 'UUID 永遠都係 36 個字元咁長？',
        a: '字串表示永遠係 36 個字元（32 個十六進位數字加 4 個連字號，格式係 8-4-4-4-12）。不過，原始二進位表示只得 16 位元組（128 位元）。拎走連字號就係 32 個字元。某啲系統用 Base64 編碼將 UUID 壓縮到 22 個字元，用人類可讀性換取緊湊性。',
      },
      {
        q: '咩時候唔應該用 UUID？',
        a: '以下情況唔好用 UUID：(1) 你得單節點資料庫，自動遞增整數已經夠用 — 佢哋細 4 倍而且 join 得快啲；(2) 需要人類可讀嘅識別碼（考慮用短碼或者 slug）；(3) 儲存空間好關鍵（UUID 每列 16 位元組，喺數十億列嘅表度會好快累積）；(4) 你要保證排序又用唔到 v7 — 考慮改用 ULID 或者 Snowflake ID。',
      },
      {
        q: 'ULID 係咩？同 UUID 比較有咩唔同？',
        a: 'ULID 代表通用唯一字典排序識別碼。長度 26 個字元（對比 UUID 嘅 36 個字元），包咗一個 48 位元毫秒時間戳，後面跟住 80 位元隨機數，全部用 Crockford 嘅 Base32 編碼。ULID 係 URL 安全、唔分大小寫，而且可以按時間順序排序 — 令佢好適合資料庫同日誌系統。主要取捨係 ULID 嘅標準化程度較低，同 UUID 比起嚟可用嘅 implementation library 少啲。',
      },
    ],
    conclusion:
      'UUID 優雅咁解決咗分散式 ID 問題 — 128 位元、唔使中央協調、碰撞機率以天文數字計。無論你揀 v4 保護私隱、v7 攞資料庫索引效能，定係 ULID 攞緊湊嘅可排序性，我哋嘅免費產生器都可以用你個 project 需要嘅任何格式同數量產生你要嘅嘢。即刻產生你嘅 UUID，唔使帳戶。',
  },

  // ========== 2. JSON 驗證器 ==========
  'how-to-use-json-validator': {
    title: 'JSON 驗證器網上版：即時驗證、除錯同檢查 JSON',
    metaTitle: 'JSON 驗證器 – 包錯誤標記嘅 JSON 驗證',
    metaDescription:
      '網上驗證 JSON，提供行級錯誤偵測、RFC 8259 合規檢查同 JSON Schema 驗證。捉到結尾逗號、冇引號嘅鍵、同埋結構問題。',
    keywords: [
      'json 驗證器',
      '網上驗證 json',
      'json 語法檢查器',
      'json 錯誤搵出器',
      'rfc 8259 驗證',
      'json schema 驗證器',
      'json lint 工具',
      '檢查 json 格式',
    ],
    intro:
      '一個結尾逗號或者冇引號嘅鍵就可以令成個 API 回應崩潰。JSON 睇落好簡單 — 大括號包住嘅鍵值對 — 但佢嘅規範（RFC 8259）出奇咁嚴格。我哋嘅 JSON 驗證器可以捉到語法錯誤、精確指出邊行邊欄出錯，同埋用簡單易明嘅文字解釋錯咗咩。除咗基本語法檢查之外，呢個工具仲支援 JSON Schema 驗證 — 俾個 schema 佢，佢就會驗證你啲資料嘅結構、類型、必填欄位同值限制係咪全部符合規範。呢個係同 API 閘道、CI/CD 管線同後端框架用嘅驗證邏輯一樣，全部喺你個瀏覽器度執行。對於處理組態檔案（package.json、tsconfig.json、docker-compose.json）、API 酬載或者資料交換嘅開發人員嚟講，一個快速嘅本機驗證器可以慳返唔使逐次試錯咁除錯。唔使上傳、唔使伺服器來回、唔使註冊 — 貼你個 JSON 落去，細過 100 KB 嘅檔案唔使 10 毫秒就出結果。',
    steps: [
      {
        heading: '貼上、輸入或者上傳你嘅 JSON',
        body: '直接將 JSON 貼落編輯器度、手動輸入，或者由檔案系統拖放 .json 檔案。驗證器接受任何 JSON 結構 — 物件、陣列、字串、數字、布林值或者 null。有行號嘅編輯器用等寬字型顯示你嘅內容，方便視覺掃描深層巢狀結構。',
      },
      {
        heading: '驗證同檢查錯誤',
        body: 'Click「驗證」執行解析器。如果有錯誤，每個錯誤都會列明行號、欄位位置同人類睇得明嘅說明。例如：「第 14 行，第 3 欄：物件最後一個屬性之後唔應該有結尾逗號。」Click 任何錯誤就可以直接跳去編輯器嗰個位。如果驗證通過，會出綠色成功指示器同埋統計資料 — 鍵嘅數量、巢狀深度同總位元組大細。',
      },
      {
        heading: '選擇性根據 JSON Schema 驗證',
        body: '將 JSON Schema（draft-04、draft-06、draft-07 或 2020-12）貼上或者上傳到 schema 面板。然後工具會根據 schema 嘅限制驗證你嘅 JSON：必填屬性、資料類型、最細/最大值、字串模式（regex）、陣列長度範圍同條件邏輯（if/then/else）。Schema 錯誤會以同語法錯誤一樣嘅行級精度回報。',
      },
    ],
    tips: [
      '三個最常見嘅 JSON 語法錯誤係：(1) 物件或陣列最後一個元素之後嘅結尾逗號 — JSON 唔俾咁做，同 JavaScript 唔同；(2) 冇引號嘅物件鍵 — 所有鍵一定要係雙引號字串，冇例外；(3) 單引號字串 — 只有雙引號先係有效嘅 JSON，單引號係 JavaScript 語法，唔係 JSON。',
      'JSON 唔支援註解。如果你個組態檔案用 // 或 /* */ 註解，佢實際上係 JSONC（包註解嘅 JSON）或 JSON5，而唔係標準 JSON。驗證前拎走註解，或者用支援 JSONC 嘅工具。VS Code 嘅 JSON 檔案要 set 檔案模式做「包註解的 JSON」先支援註解。',
      '大型 JSON 檔案（>1 MB）應該喺開發過程中逐步驗證，而唔係等編輯累積之後先做。用 JSON 驗證器（好似 ajv-cli 或 jsonlint）喺你個 project 度 set 個 watch script：`ajv validate -s schema.json -d data.json`。我哋嘅網上工具可以喺瀏覽器度高效處理高達 10 MB 嘅檔案。',
      'JSON Schema draft 2020-12 係最新版本（2022 年 6 月發布），加咗動態引用、unevaluatedProperties 同改進嘅註解收集。大部分主流 API 框架（FastAPI、Express.js、.NET）最少支援 draft-07。',
      'NDJSON（換行分隔 JSON），又叫 JSON Lines，每行儲存一個 JSON 物件，用 .ndjson 或 .jsonl 副檔名。佢好適合串流同日誌處理，但需要逐行驗證器 — 標準 JSON 解析器會拒絕多行 NDJSON 檔案。我哋嘅驗證器可以偵測 NDJSON 格式同獨立驗證每一行。',
      '永遠喺 CI/CD 管線度驗證 API 回應。簡單一句 `curl -s https://api.example.com/endpoint | python -m json.tool` 就可以喺格式錯誤嘅 JSON 到達生產消費者之前捉到佢。我哋工具嘅檔案上傳功能都係一樣原理 — 貼個原始 API 回應落去驗證。',
      'JSON5（為人類設計嘅 JSON）透過結尾逗號、冇引號嘅鍵、單引號字串、註解同十六進位數字擴展咗 JSON。佢畀 Babel、Webpack 同 TypeScript 編譯器用嚟做組態檔案。如果你手寫組態，JSON5 比嚴格 JSON 更加就手 — 只要記住期望標準 JSON 嘅消費者會拒絕佢。',
      '為咗最高效能，透過網絡傳送 JSON 之前先將佢最小化。我哋嘅格式化/驗證器組合俾你喺一個工作流程度驗證然後最小化 — 最小化輸出會拎走晒所有空白（對於高度縮排嘅 JSON 可以慳到 30-40% 嘅檔案大細），同時保持結構完整性。',
    ],
    faqs: [
      {
        q: '邊個 RFC 標準規範 JSON？',
        a: 'JSON 由 RFC 8259（2017 年 12 月發布）定義，佢廢棄咗 RFC 7159 同 RFC 4627。RFC 8259 規定 JSON 文字必須用 UTF-8 編碼，同埋澄清 JSON 必須係一個有效嘅 JavaScript 值 — 但佢係 JavaScript 嘅子集，唔係完全一樣。值得留意嘅係，RFC 8259 允許物件同陣列以外嘅頂層 JSON 值（例如齋字串或數字），而早期嘅 RFC 唔俾。',
      },
      {
        q: '點解我個 JSON 睇落有效但驗證器拒絕佢？',
        a: '最大可能嘅原因係：(1) 睇唔到嘅 Unicode 字元，尤其係由文書處理器貼上嘅零寬度空格（U+200B）或不間斷空格（U+00A0）；(2) 檔案頭嘅 BOM（位元組順序標記，U+FEFF）— 驗證器應該處理到但某啲舊版解析器會拒絕；(3) 行尾符號 — 單獨嘅回車符（\r，嚟自舊 Mac 系統）無效，要用 \n 或 \r\n；(4) 控制字元 — U+0000 至 U+001F 嘅字元一定要轉義。',
      },
      {
        q: '驗證器處唔處理到串流 JSON 或 NDJSON？',
        a: '處理到。當你貼 NDJSON（每行係一個獨立嘅 JSON 值），工具會偵測格式同獨立驗證每一行，逐行報錯誤。呢個對於驗證用 JSON Lines 格式嘅日誌檔案、串流 API 回應同大量資料匯出好有用。',
      },
      {
        q: 'JSON Schema 係咩？我使唔使用佢？',
        a: 'JSON Schema 係一個定義 JSON 文件結構同限制嘅詞彙表。如果你喺度建立或者用緊 API，schema 就係一份合約：佢指定邊啲欄位係必填、佢哋嘅資料類型、值範圍、regex 模式等等。Schema 驗證可以喺 API 回傳或接收錯形狀嘅資料嗰陣捉到 bug — 喺呢啲 bug 去到生產環境之前。主要 schema 版本有 draft-04、draft-06、draft-07 同 2020-12。',
      },
      {
        q: '驗證器會唔會將我嘅 JSON 傳去伺服器？',
        a: '唔會。所有驗證邏輯全部喺你個瀏覽器度用 JavaScript 執行。你嘅 JSON 資料 — 無論包咗 API 密鑰、憑證、用戶資料定係專有組態 — 永遠唔會離開你部機。呢個設計亦都表示驗證器喺頁面載入後可以離線運作。',
      },
      {
        q: '點樣驗證超深層巢狀嘅 JSON？',
        a: '我哋嘅驗證器可以處理高達 1000 層嘅巢狀，超過大部分 JSON 解析器嘅限制（Node.js 預設 512，瀏覽器通常容許 512-1024）。如果你個 JSON 超過呢個深度，請考慮重構 — 深層巢狀結構更難睇、更難驗證同更難查詢。JSONPath 或 jq 可以幫手提取深層巢狀嘅值，唔使手動遍歷。',
      },
    ],
    conclusion:
      '一個快而準嘅 JSON 驗證器可以喺語法錯誤一發生嗰陣即刻捉到佢，慳返幾個鐘嘅除錯時間。無論你係寫組態檔案、建立 API 定係 set CI 檢查，我哋免費嘅瀏覽器驗證器畀到你 RFC 8259 合規、JSON Schema 支援同 NDJSON 處理 — 全部都唔使將你啲資料送去任何地方。即刻貼你個 JSON 落去驗證。',
  },

  // ========== 3. Regex 測試器 ==========
  'how-to-use-regex-tester': {
    title: '正則表達式測試器：網上建立、測試同除錯正則表達式',
    metaTitle: 'Regex 測試器 – 免費網上測試正則表達式',
    metaDescription:
      '網上建立同測試正則表達式，提供即時比對、highlight 咗嘅擷取群組，同多種 regex 風格支援（PCRE、JavaScript、Python、Java）。',
    keywords: [
      'regex 測試器',
      '網上正則表達式測試器',
      'regex 工具',
      '測試 regex',
      'regex 除錯器',
      'regex 視覺化器',
      'regex 旗標',
      'regex 模式',
      '正則表達式',
    ],
    intro:
      '正則表達式係一種模式比對語言，可以用任何手動字串操作都做唔到嘅精確度去搵、提取、驗證同取代文字。但寫 regex 好難 — 一個放錯位嘅量詞就可以將精確嘅模式變成效能炸彈或者靜默嘅唔匹配。我哋嘅 regex 測試器俾你寫個模式、貼上或輸入測試資料，同埋喺你打字嗰陣即時睇到 highlight 咗嘅比對結果。佢預設支援 JavaScript（ECMAScript 2024）語法，仲可以切換做 PCRE2（PHP）、Python 3、Java 同 .NET 風格 — 每種風格對 lookbehind、Unicode 屬性跳脫同回溯控制嘅處理都唔同。呢個工具用唔同顏色視覺化擷取群組、標記第一個比對嘅準確字元位置，同埋喺你個模式有災難性回溯風險嗰陣警告你（例如，(a+)+b 比對 "aaaaaaaaac" — 喺 25 個字元嗰陣可以 freeze 個 thread，去到 30 個字元所需時間可能仲長過宇宙年齡）。無論你係為緊表單寫驗證規則、解析日誌檔案，定係透過尋找取代重構程式碼，互動式測試你嘅 regex 可以慳時間同防止好大鑊嘅錯誤。',
    steps: [
      {
        heading: '寫你嘅 Regex 模式',
        body: '喺模式欄位度輸入你嘅正則表達式。工具接受字面 regex（喺正斜線之間，例如 /pattern/g）或者齋模式字串。快速參考側欄列出常用標記 — 字元類別（\d、\w、\s）、量詞（*、+、?、{n,m}）、錨點（^、$、\b）同群組（擷取、非擷取、命名）。Mouse over 任何標記會出 tooltip 顯示佢嘅意思同例子。',
      },
      {
        heading: '貼上測試資料同睇比對',
        body: '將你嘅測試文字 — 例子 API 回應、日誌輸出、用戶輸入或者程式碼 — 貼落測試資料區。當你輸入或修改模式嗰陣，比對會即時 highlight 顯示。每個擷取群組用唔同顏色編碼：群組 0（完整比對）藍色、群組 1 綠色、群組 2 橙色，命名群組就喺圖例度顯示佢個名。比對位置（開始/結束索引）喺下面顯示。',
      },
      {
        heading: '切換旗標同 Regex 風格',
        body: '用 checkbox 啟用旗標：g（全域 — 搵晒所有比對，唔止第一個）、i（唔分大小寫）、m（多行 — ^ 同 $ 喺行邊界比對，唔止係成個字串嘅開始/結束）、s（dotall — . 比對換行字元）、u（Unicode — 啟用 \\u{...} 同 Unicode 屬性跳脫）同 y（黏著）。透過下拉式選單切換 regex 引擎風格，確保你個模式喺目標環境度正確運作。',
      },
    ],
    tips: [
      '最常見嘅 regex 效能殺手係災難性回溯 — 當一個有巢狀量詞嘅模式（例如 (a+)+b）喺失敗之前試晒所有可能嘅方式去分割輸入。對於 25 個 "a" 字元嘅輸入，咁樣可以需要超過 3300 萬次回溯步驟。透過喺引擎支援嗰陣用所有格量詞（a++b）或者原子群組（(?&gt;a+)b）嚟修復，或者重寫個模式令佢更具體。',
      '懶惰量詞（*?、+?、??、{n,m}?）比對盡量少嘅字元，而唔係盡量多。佢哋喺比對分隔內容嗰陣好緊要 — 例如，/&lt;p&gt;.*?&lt;\/p&gt;/ 正確咁單獨比對每個段落標籤 pair，而唔係由第一個 &lt;p&gt; 比對到最後一個 &lt;/p&gt;（貪婪嘅 .* 會咁做）。',
      '前瞻同後顧斷言俾你根據文字前後嘅內容嚟比對文字，而唔使包埋嗰啲上下文喺比對入面。正向前瞻：/foo(?=bar)/ 淨係喺 "foo" 後面跟住 "bar" 嗰陣先比對 "foo"。負向後顧：/(?&lt;!\\\\)\$/ 淨係喺美元符號前面冇反斜線嗰陣先比對佢。JavaScript 喺 ES2018 加咗後顧支援。',
      '命名擷取群組令 regex 大大增加可讀性。唔好用有數字群組引用嘅 /(\d{4})-(\d{2})-(\d{2})/，改用 /(?&lt;year&gt;\d{4})-(?&lt;month&gt;\d{2})-(?&lt;day&gt;\d{2})/ 同埋按名引用群組：match.groups.year。Python、JavaScript、PCRE 同 .NET 都支援呢個語法。',
      'Unicode 屬性跳脫（\p{...}）俾你比對成個字元類別，而唔使逐個字元列出嚟。例如，\p{Script=Han} 比對任何中文字元，\p{Emoji} 比對 emoji，\p{Lu} 比對任何文字系統嘅大寫字母。呢個比嘗試手動列出 Unicode 範圍穩健得多。',
      '對於電郵驗證，根據 RFC 5322 唯一正確嘅 regex 超過 200 個字元長，仲要唔完美。對於實際表單驗證，用簡單模式如 /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 做第一關，然後寄封確認電郵。唔好試圖用 regex 驗證電郵規範嘅每個 edge case — regex 唔係做呢樣嘢嘅啱工具。',
      '旗標會明顯改變 regex 行為。g 旗標執行全域搜尋（多個比對）。冇咗佢，只會回傳第一個比對。u 旗標啟用完整嘅 Unicode 支援 — 冇咗佢，/\w{2,}/ 呢類模式可能對非 ASCII 字元有奇怪行為。對於現代 JavaScript regex，永遠 set u 旗標，除非你好肯定唔使 Unicode。',
      '針對 edge case 測試你個 regex，唔止係 happy path 輸入。空字串、得特殊字元嘅字串、最長嘅字串同 Unicode 文字全部都可能暴露缺陷。regex 測試器俾你儲存測試案例集，一次過對住一個模式行晒佢哋。',
    ],
    faqs: [
      {
        q: '唔同 regex 風格之間有咩分別？',
        a: '雖然核心 regex 語法（\d、+、*、^、$、群組）係通用嘅，但每個引擎都有獨特功能同怪癖。PCRE2（PHP 同好多 CLI 工具用）支援遞迴模式、所有格量詞同 callout。JavaScript（ECMAScript）冇所有格量詞同 \Q...\E 引用，但支援後顧（ES2018）。Python 支援用 (?P&lt;name&gt;...) 命名嘅群組 — 同 JavaScript 嘅 (?&lt;name&gt;...) 唔同。Java 要喺字串字面度雙重轉義反斜線（\d 喺程式碼度變成 \\\\d）。.NET 支援用嚟比對巢狀結構嘅平衡群組。',
      },
      {
        q: '災難性回溯係咩？點樣避免？',
        a: '災難性回溯發生喺 regex 引擎用指數級咁多種方式去試一個永遠唔會成功嘅模式。經典例子：模式 (a+)+b 對住字串 "aaaaaaaaac"。引擎試每一種可能嘅方式喺內部和外部量詞之間分配啲 "a" — O(2^n) 步驟 — 然後先至最終放棄。修復方法：(1) 如果你個引擎支援，用所有格量詞（a++b）；(2) 用原子群組（(?&gt;a+)b）；(3) 重寫模式避免巢狀量詞；(4) 喺支援嘅引擎度 set 回溯限制（PCRE、有 timeout 嘅 Python regex）。',
      },
      {
        q: '擷取群組點運作？',
        a: 'Regex 入面嘅括號既用嚟分組模式，又用嚟擷取比對文字。群組 0 永遠係完整比對。之後嘅群組按左括號出現嘅次序編號，左到右。非擷取群組 (?:...) 淨係分組唔擷取。命名群組 (?&lt;name&gt;...) 用描述性鍵擷取。比對完之後，你可以按編號或者名去 access 群組 — 喺 JavaScript 度，match[1] 係群組 1，match.groups.name 係命名群組。',
      },
      {
        q: '貪婪量詞同懶惰量詞有咩分別？',
        a: '貪婪量詞（*、+、?、{n,m}）比對盡量多嘅字元，同時仍然俾整體模式成功比對。喺量詞後面加 ? 令佢變懶惰（*?、+?、??、{n,m}?）— 佢比對盡量少嘅字元。例如，對住字串 "&lt;div&gt;hello&lt;/div&gt;&lt;div&gt;world&lt;/div&gt;"，模式 &lt;div&gt;.*&lt;/div&gt;（貪婪）喺一個比對度食晒成個字串，而 &lt;div&gt;.*?&lt;/div&gt;（懶惰）就正確咁單獨比對每個 div pair。',
      },
      {
        q: 'Regex 解唔解析到 HTML？',
        a: '唔得 — 或者講得準確啲，regex 冇辦法可靠咁解析任意 HTML。HTML 唔係正則語言；佢係上下文無關嘅（或者根據某啲解釋係上下文敏感）。巢狀標籤、屬性變體、CDATA 區段同 HTML 註解全部都可以打敗即使係最複雜嘅 regex 模式。用 HTML 解析器（好似瀏覽器度嘅 DOMParser 或者 Python 度嘅 BeautifulSoup）做可靠嘅 HTML 解析。Regex 啱用嚟由已知、受控嘅 HTML 片段度做簡單提取，但唔應該做解析網頁嘅主要工具。',
      },
      {
        q: '點樣針對 regex101.com 測試套件測試我個 regex？',
        a: '雖然 regex101.com 係最受歡迎嘅網上 regex 測試器，有社群貢獻嘅模式，但我哋嘅內建測試器提供相同嘅核心功能 — 即時 highlight、擷取群組視覺化同多風格支援 — 仲有多個好處就係保持你嘅測試資料私密（冇伺服器上傳）同提供同我哋其他開發者工具嘅直接整合。你可以由 regex101 export 你已儲存嘅模式，再 import 落我哋嘅測試器度做離線或者私密使用。',
      },
    ],
    conclusion:
      'Regex 係開發者工具箱入面最強大嘅工具之一 — 亦都係最易出錯嘅工具之一。互動式測試可以捉到靜默嘅唔匹配、回溯炸彈同跨引擎唔相容問題，喺佢哋去到生產環境之前。我哋嘅免費 regex 測試器支援四種主要引擎風格，仲要全部喺你個瀏覽器度執行。即刻開始測試你嘅模式。',
  },

  // ========== 4. 文字大小寫轉換器 ==========
  'how-to-use-text-case': {
    title: '文字大小寫轉換器：喺 camelCase、snake_case、PascalCase 等之間轉換',
    metaTitle: '大小寫轉換器 – 免費網上文字大小寫轉換',
    metaDescription:
      '喺 camelCase、PascalCase、snake_case、kebab-case、大寫、細寫、標題大小寫、句子大小寫同 CONSTANT_CASE 之間轉換文字。',
    keywords: [
      '文字大小寫轉換器',
      '網上大小寫轉換器',
      'camelCase 轉換器',
      'snake_case 轉換器',
      '轉換大小寫',
      'kebab-case 產生器',
      'PascalCase 轉換器',
      '標題大小寫轉換器',
      '變更文字大細寫',
    ],
    intro:
      '程式語言同框架對命名慣例有好強烈嘅意見 — JavaScript 預期變數用 camelCase，Python 要求 snake_case，CSS 用 kebab-case 做屬性名，而 Java 對 class 名強制用 PascalCase。撈亂呢啲慣例會產生技術上啱但專業上唔可以接受嘅程式碼，而全個 codebase 手動重新格式化識別碼既麻煩又易出錯。我哋嘅文字大小寫轉換器可以即刻將任何輸入字串喺八種常見大小寫風格之間轉換。貼一個句子、一個變數名，甚至成個 block 嘅識別碼，將佢哋轉換做你個 project 要求嘅確切慣例。呢個工具正確處理 edge case：連續大寫字母（例如 "XMLParser" 轉 snake_case 會變成 "xml_parser"，而唔係 "x_m_l_parser"）、數字-單詞邊界（例如 "file2Name" 轉 kebab-case 變成 "file-2-name"），同多單詞轉換。除咗個人開發者之外，呢個轉換器對於要喺跨語言 codebase 度標準化命名慣例、產生有統一命名嘅 API 文件，同埋將 SQL 表嘅欄位名（通常用 snake_case）轉換做應用層 model（可能用 camelCase）嘅團隊嚟講，都係一個好有價值嘅工具。',
    steps: [
      {
        heading: '貼上你嘅文字',
        body: '輸入或者貼上任何文字 — 變數名、檔案名、標題、資料庫欄位或者完整段落 — 落輸入欄位度。工具會自動偵測原始大小寫風格同顯示喺輸入上面做提示（例如「已偵測：camelCase」）。多行文字會逐行處理同喺輸出度顯示。',
      },
      {
        heading: '揀目標大小寫風格',
        body: '用按鈕 grid 由八種大小寫風格度揀：camelCase（例如 myVariableName）、PascalCase（MyVariableName）、snake_case（my_variable_name）、kebab-case（my-variable-name）、大寫（MY VARIABLE NAME）、細寫（my variable name）、標題大小寫（My Variable Name）、句子大小寫（My variable name）同 CONSTANT_CASE（MY_VARIABLE_NAME）。切換風格嗰陣，轉換文字嘅預覽會即時更新。',
      },
      {
        heading: '複製、下載或者批次轉換',
        body: 'Click「複製」將轉換咗嘅文字抄去剪貼簿。批次操作嘅話，貼個識別碼清單（每行一個），揀目標大小寫，然後將結果下載做 .txt 檔案。批次模式一次過處理幾百個識別碼 — 啱晒逐欄重構成個 codebase。',
      },
    ],
    tips: [
      'JavaScript 同 TypeScript 慣例：對變數、函數同物件屬性用 camelCase（myFunction、userName）；對 class 同 interface 用 PascalCase（UserController、ApiResponse）；對真正嘅常數用 UPPER_SNAKE_CASE（MAX_RETRY_COUNT）。ESLint 同 Prettier 可以自動強制執行呢啲 — 喺 project 度 set 好佢哋，再用大小寫轉換器執返啲 legacy code。',
      'Python（PEP 8）強制要求對變數、函數同 method 名用 snake_case（calculate_total、database_url）；對 class 名用 PascalCase（HttpClient）；對常數用 UPPER_CASE（API_VERSION）。Python 唔會阻止你用 camelCase，但你個 code 喺任何認真嘅 project 度會過唔到 code review。',
      'CSS 對 class 名同屬性用 kebab-case（.main-header、background-color）。JavaScript 冇得直接用 kebab-case 因為連字號係減法運算子，所以好似 React 呢類 CSS-in-JS library 對 style 物件用 camelCase（backgroundColor 而唔係 background-color）。我哋個轉換器即刻 bridge 到呢個 gap。',
      'Java 慣例：對 class 同 interface 用 PascalCase（CustomerRepository、OrderService）；對 method 同變數用 camelCase（findById、customerName）；對常數用 UPPER_SNAKE_CASE（static final 欄位）。Java 嚴格型別同好多慣例 — 偏離呢啲規範會令你個 code 令人困惑，就算 compile 到都係咁話。',
      '資料庫（SQL）傳統上對表名同欄位名用 snake_case（order_items、created_at），因為好多資料庫系統唔分大小寫而 snake_case 喺嗰個 context 最易睇。將 ORM 實體 mapping 去應用程式碼嗰陣，轉換器可以批次將你所有欄位名轉換做目標語言慣例。',
      'API 命名根據 protocol 用多種慣例。REST API JSON 回應通常用 camelCase（JavaScript 慣例，因為 JSON 源自 JavaScript）。GraphQL 欄位跟 schema 定義嘅慣例。gRPC 對 service 同 method 名用 PascalCase。gRPC-Gateway JSON 回應會自動轉換做 camelCase。',
      '標題大小寫（用喺標題）有競爭嘅標準 — APA、Chicago、AP 同 MLA 各定義咗唔同嘅規則決定邊啲字要大寫。我哋個轉換器跟 APA 風格（大寫第一個同最後一個字、所有名詞、代名詞、形容詞、動詞、副詞同從屬連接詞；唔大寫冠詞、對等連接詞同短介詞，除非佢哋係第一個或最後一個字）。',
      '由一種大小寫風格轉去另一種嗰陣，轉換器會聰明咁保留數字同特殊字元。例如，"user2profile" 轉 snake_case 變成 "user_2_profile" — 數字當做單詞邊界。首字母縮寫都有處理："parseXMLFile" 轉 snake_case 變成 "parse_xml_file"，正確偵測到 "XML" 係一個邏輯單詞。',
    ],
    faqs: [
      {
        q: '標題大小寫同句子大小寫有咩分別？',
        a: '標題大小寫將每個主要單詞嘅第一個字母大寫 — 例如「The Quick Brown Fox Jumps Over the Lazy Dog」。句子大小寫只係將第一個單詞嘅第一個字母大寫 — 「The quick brown fox jumps over the lazy dog」。標題大小寫用喺標題、書名同 UI 標籤；句子大小寫係內文、描述同 API 錯誤訊息嘅標準。我哋個轉換器用 APA 風格嘅標題大小寫規則。',
      },
      {
        q: '我嘅 API 回應應該用邊種大小寫？',
        a: 'camelCase 係 REST API JSON 回應嘅事實標準，因為 JavaScript（所以 Web 前端）原生用 camelCase。即係話前端開發者可以直接 access response.userName 而唔使 mapping。不過，如果你個 API 主要 serve Python 或 Ruby clients，snake_case 可能更自然。最安全嘅做法：揀一種慣例然後喺成個 API surface 一致咁用。',
      },
      {
        q: '轉換器識唔識正確處理首字母縮寫？',
        a: '識。轉換器將連續大寫字母偵測做可能嘅首字母縮寫，當做單一邏輯單詞。例如，"parseXMLFile" 轉 snake_case 變成 "parse_xml_file"（而唔係 "parse_x_m_l_file"），轉 kebab-case 變成 "parse-xml-file"。如果縮寫橫跨成個識別碼（例如 "HTTPResponse"），轉換器會根據目標大小寫產生 "http_response" 或 "HTTPResponse"。',
      },
      {
        q: '我可唔可以轉換檔案名？',
        a: '可以。檔案名對於 Web project 應該用 kebab-case（my-photo.jpg、user-profile.tsx），因為佢 URL 安全同易睇。Windows 檔案路徑唔分大小寫，但 Linux/macOS 分大小寫，所以 kebab-case 避開跨平台問題。貼個檔案名清單然後批次轉換做任何大小寫風格。',
      },
      {
        q: 'CONSTANT_CASE 用嚟做咩？',
        a: 'CONSTANT_CASE（又叫 SCREAMING_SNAKE_CASE 或 UPPER_SNAKE_CASE）係幾乎所有語言度編譯時期常數嘅慣例：JavaScript（const MAX_RETRIES = 3）、Python（MAX_RETRIES = 3）、Java（static final int MAX_RETRIES = 3）、C（const int MAX_RETRIES = 3）。佢視覺上區分 set 一次永不改變嘅值同普通變數。',
      },
      {
        q: '轉換器點處理空格同特殊字元？',
        a: '空格、連字號、底線同點當做單詞分隔符號。特殊字元如 @、#、$ 同 % 喺程式設計大小寫輸出（camelCase、PascalCase、snake_case）度會被拎走，但喺文字大小寫輸出（標題大小寫、句子大小寫、細寫、大寫）度會保留。同字母相鄰嘅數字當做單詞邊界。',
      },
    ],
    conclusion:
      '一致嘅命名慣例減少 cognitive load、加快 code review 速度，同防止跨語言 stack 度因大小寫唔匹配而產生嘅 subtle bug。我哋嘅大小寫轉換器處理晒所有八種標準慣例、批次處理同 edge case 如首字母縮寫同數字 — 免費，喺你個瀏覽器度。即刻開始轉換。',
  },

  // ========== 5. Lorem Ipsum 產生器 ==========
  'how-to-use-lorem-ipsum': {
    title: 'Lorem Ipsum 產生器：幫 mockup 同 wireframe 產生佔位文字',
    metaTitle: 'Lorem Ipsum 產生器 – 免費網上佔位文字工具',
    metaDescription:
      '網上產生 Lorem Ipsum 佔位文字。指定段落、單詞、句子或者位元組數。學下公元前 45 年嘅起源故事、點解設計師揀佢而唔揀真實文字。',
    keywords: [
      'lorem ipsum 產生器',
      '產生佔位文字',
      'lorem ipsum',
      '假字產生器',
      '佔位文字',
      '填充文字',
      'lorem ipsum 意思',
      'mockup 文字產生器',
      'wireframe 佔位',
    ],
    intro:
      'Lorem Ipsum 係有五百年歷史嘅佔位文字，佢長命過任何佢曾經用嚟 mock up 嘅設計趨勢、工具同技術。佢源自西塞羅（Cicero）喺公元前 45 年寫嘅「De Finibus Bonorum et Malorum」（論善惡嘅極限），嗰段文字喺 1500 年代俾一個唔知邊個嘅排版師搞亂咗，用嚟做字體樣本冊 — 設計師就由嗰時開始一直用緊佢。Lorem Ipsum 喺隨機英文字會失敗嘅地方都能夠持續存在，原因好簡單：佢嘅字母分佈同真正嘅英文同羅曼語系文字好接近。字元頻率、單詞長度（平均每個單詞 5.2 個字元），同自然嘅外觀節奏令佢一望之下同真實內容冇分別 — 呢樣就正係當你想 reviewer 專注喺 layout 而唔係文字嗰陣需要嘅嘢。我哋嘅 Lorem Ipsum 產生器產生你需要嘅確切數量嘅佔位文字 — 以段落、句子、單詞或位元組計 — 用經典嘅西塞羅衍生拉丁文字。佢喺你個瀏覽器度行，唔使註冊，畀到你同 Apple、Google 同每個主要設計 agency 嘅設計師每日用緊嘅一模一樣嘅佔位文字。',
    steps: [
      {
        heading: '揀你嘅輸出測量單位',
        body: '揀輸出單位：段落（1-50）、句子（1-200）、單詞（1-10,000）或位元組（啱用嚟測試儲存或傳輸限制）。經典 Lorem Ipsum 段落約 450 個字元 / 80 個單詞 — 大約係一段中等英文段落嘅大細。產生器由傳統嘅 "Lorem ipsum dolor sit amet, consectetur adipiscing elit..." 開頭開始。',
      },
      {
        heading: '自訂選項',
        body: '開關選項：「以 Lorem ipsum 開始」（用傳統開頭開始）或者產生完整隨機西塞羅文字；「加換行」（喺段落之間插入 HTML &lt;br&gt; 標籤）；「用 &lt;p&gt; 標籤包住」（輸出即用 HTML 畀網頁線框圖）；包埋/唔包英文翻譯做註解。字元/單詞計數器即時顯示確切輸出大細。',
      },
      {
        heading: '複製、下載或者貼去你嘅設計工具',
        body: 'Click「複製」將所有產生咗嘅文字抄去剪貼簿，然後直接貼落 Figma、Sketch、Adobe XD 或者你嘅 HTML/CMS 範本度。將文字下載做 .txt 檔案畀離線用。對於 CMS 範本開發者，HTML 包住嘅輸出可以直接放落你嘅範本 markup 度。',
      },
    ],
    tips: [
      '嚟自西塞羅嘅原始 Lorem Ipsum 段落係："Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..." — 意思係「冇人鍾意痛苦本身，冇人追求痛苦同想擁有佢，只係因為佢係痛苦...」我哋今日用緊嘅 Lorem Ipsum 係呢段文字嘅 subset，俾 16 世紀嘅排版師大幅搞亂咗，佢哋可能根本唔識拉丁文。',
      'Lorem Ipsum 之所以 work 係因為佢嘅字母頻率分佈比隨機亂咁嚟更接近真正嘅英文文字。拉丁文字有同英文相似嘅母音同子音比例、平均單詞長度同常見字母（e、t、a、i、o、n、s）嘅頻率。咁令文字喺排版嗰陣流暢自然，而 "asdf asdf asdf asdf" 會產生明顯重複嘅視覺 pattern。',
      '對於 responsive web design mockup，用固定數量嘅單詞而唔係段落。咁俾你測試文字喺唔同 breakpoint 度點樣 reflow，用一致嘅數量 — 320px 用 50 個單詞，768px 用 120 個，1200px 用 200 個。',
      '如果你需要明確標記做佔位文字嘅文字（防止唔小心 publish 咗），用「喺度插入有意思嘅佔位文字」或者將 Lorem Ipsum 包喺一個清楚標記佢做 draft 內容嘅 CMS component 度。Implement 一個 pre-commit hook 擋住有 "lorem ipsum" 嘅 commit merge 去 main。',
      'Accessibility 注意：螢幕閱讀器會用拉丁文發音讀 Lorem Ipsum 出嚟，喺 accessibility 測試期間可能會好混亂。對於 accessibility audit，用有清晰「[佔位]」標記嘅英文佔位文字，等 tester 知道內容唔係 final。某啲 accessibility-focused 嘅 Lorem Ipsum 替代方案包埋明確嘅「呢個係一個佔位符」註解。',
      '有特定 tone 嘅 Lorem Ipsum 替代方案：Corporate Ipsum（商業術語，如「leverage core competencies to drive synergy」）、Hipster Ipsum（craft beer 同 artisanal reference）、Bacon Ipsum（肉類主題）、Pirate Ipsum（海盜話）、同 Cupcake Ipsum（甜品主題）。用呢啲嚟做 themed presentation 或者 inject 個性去內部 mockup 度，但唔好喺 client-facing 嘅 deliverable 度用。',
      '為字型測試產生佔位文字嗰陣，要求最少 200 個單詞，混合常用單詞同包晒成個 character set 嘅單詞（包埋連字、數字同標點符號）。特定 pangram 如「The quick brown fox jumps over the lazy dog」測試到每個字母，但 Lorem Ipsum 提供更真實嘅閱讀流暢度測試。',
      '對於 CMS 範本開發（WordPress、Webflow、Drupal），用 HTML 包住輸出嘅選項。呢個畀到你 semantic markup — &lt;p&gt; 標籤、&lt;h2&gt; 標題、&lt;ul&gt; 無序清單 — 模擬真實內容會有嘅結構，俾你喺內容作者填真正文字之前就可以 style 晒成個 element set。',
    ],
    faqs: [
      {
        q: 'Lorem Ipsum 邊度嚟㗎？',
        a: 'Lorem Ipsum 源自西塞羅嘅「De Finibus Bonorum et Malorum」（論善惡嘅極限）第 1.10.32 同 1.10.33 節，呢篇係公元前 45 年寫嘅倫理學哲學論文。嗰段文字討論快樂同痛苦之間嘅關係。喺 1500 年代，一個唔知邊個嘅印刷商拎咗一盤活字同搞亂咗西塞羅嘅文字，用嚟整字體樣本冊 — 就係 Lorem Ipsum 作為設計工具嘅誕生。由 1960 年代嘅 Letraset 轉印紙開始，呢段文字就一直係排版嘅標準佔位符，之後喺 1980 年代嘅 desktop publishing 熱潮（Aldus PageMaker 包埋 Lorem Ipsum 做內建佔位文字）。',
      },
      {
        q: '點解唔用隨機英文文字？',
        a: '用隨機英文文字會分散注意力 — reviewer 會讀啲字同俾文字內容吸走咗，而唔係專注喺 layout、typography 同視覺層次。Lorem Ipsum 搞亂咗嘅拉丁文睇落似真實文字（字母分佈、單詞長度、標點節奏）但語義上冇意思，令注意力留喺設計度。佢係視覺上嘅灰色方格 — 暗示「呢度有文字」而唔提供可讀內容。',
      },
      {
        q: '一個典型網頁 mockup 要幾多段 Lorem Ipsum？',
        a: '一個 landing page hero section 通常要 1-2 段。一個 blog 文章 mockup 要 5-8 段。一個完整產品頁 mockup（功能、推薦、footer）可能要分佈喺唔同 section 嘅 10-15 段。由 5 段開始，再按需要產生更多 — 我哋個產生器俾你逐步加段落。',
      },
      {
        q: 'Lorem Ipsum 對螢幕閱讀器測試係咪 accessible？',
        a: '唔係 — 呢個係已知限制。螢幕閱讀器會用拉丁文發音讀出嚟，聽落似胡言亂語。如果你同螢幕閱讀器使用者做 accessibility audit，將 Lorem Ipsum 換做有清晰「[佔位]」或「[草稿內容]」註解嘅英文佔位文字，等 tester 明白 context。永遠唔好 ship Lorem Ipsum 去 production 嘅 live website — 咁樣浪費螢幕閱讀器使用者嘅時間同埋顯示唔專業嘅質素。',
      },
      {
        q: '我可唔可以產生物定數量位元組嘅 Lorem Ipsum？',
        a: '可以。指定位元組數（例如 1024 位元組 = 1 KB），產生器會產生喺 UTF-8 編碼下啱啱等於或多少少過所求位元組數嘅文字。呢個對測試儲存限制、API 回應大細檢查、資料庫 VARCHAR 欄位限制（例如 MySQL 度嘅 VARCHAR(255)）或者 low-level programming 度嘅 buffer 大細測試好有用。',
      },
      {
        q: '現代 project 最好嘅 Lorem Ipsum 替代方案係咩？',
        a: '受歡迎嘅替代方案有：(1) Corporate Ipsum — 商業術語，啱 enterprise app mockup；(2) Hipster Ipsum — 手工藝同 craft 主題，啱 lifestyle brand；(3) Bacon Ipsum — 肉類主題，開發者鍾意佢嘅荒謬；(4) Office Ipsum — 企業開會用語；(5) 偽拉丁產生器，產生新嘅搞亂拉丁文而唔係重複同一段西塞羅文字，畀長文件更多變化。',
      },
    ],
    conclusion:
      'Lorem Ipsum 做咗設計界嘅無聲主力超過 500 年 — 呢個係有原因嘅。佢俾你專注喺 typography、layout 同視覺層次，而唔使俾可讀內容分心。我哋嘅免費產生器以你 workflow 需要嘅任何格式產生你需要嘅確切數量。即刻產生你嘅佔位文字。',
  },

  // ========== 6. Hash 產生器 ==========
  'how-to-use-hash-generator': {
    title: '網上 Hash 產生器：MD5、SHA-1、SHA-256、SHA-512、BLAKE2 同更多',
    metaTitle: 'Hash 產生器 – SHA-256、MD5、SHA-512、BLAKE2 免費網上',
    metaDescription:
      '免費網上產生加密雜湊。支援 MD5、SHA-1、SHA-256、SHA-512、SHA-3、BLAKE2 同 BLAKE3。',
    keywords: [
      'hash 產生器',
      'md5 hash 產生器',
      'sha256 hash 網上',
      'sha-256 產生器',
      'blake2 hash',
      '產生 hash',
      '檔案 checksum',
      'hmac 產生器',
      '加密雜湊',
    ],
    intro:
      '加密雜湊函數接受任何輸入 — 一個密碼、一個檔案，或者成個 hard disk image — 同產生一個叫雜湊或摘要嘅固定大細輸出。定義屬性係：(1) 確定性 — 相同輸入永遠產生相同雜湊；(2) 單向性 — 你冇得由雜湊 reverse 返原始輸入；(3) 雪崩效應 — 改輸入嘅一個位元會改到大約 50% 嘅雜湊位元；(4) 抗碰撞性 — 喺計算上一定要冇可能搵到兩個唔同輸入產生相同雜湊。唔同 algorithm 喺速度、安全性同輸出大細之間有唔同取捨。MD5（128 位元輸出）幾微秒就計到但密碼學上已被破解 — 喺 laptop 度幾秒鐘就可以 generate 到碰撞。SHA-256（256 位元）對所有實際用途仍然安全，用喺 TLS 憑證、Bitcoin 挖礦同 Git commit 識別碼。我哋嘅雜湊產生器用七種 algorithm 為文字輸入同檔案上傳計算雜湊 — MD5、SHA-1、SHA-256、SHA-384、SHA-512、SHA-3-256、BLAKE2b 同 BLAKE3 — 全部喺你個瀏覽器度做。呢個工具仲提供 HMAC（雜湊訊息驗證碼）模式，將秘密金鑰同雜湊函數結合嚟產生 authenticated 摘要，同埋一個檔案完整性 checker 去 verify 下載咗嘅檔案係咪同佢 published checksum 吻合。',
    steps: [
      {
        heading: '揀你嘅輸入類型同 Algorithm',
        body: '揀文字模式（輸入或貼上任何字串）或檔案模式（上傳高達 100 MB 嘅檔案 — 本機處理，唔上傳去任何伺服器）。由下拉式選單揀你嘅雜湊 algorithm：MD5（128 位元、快、已破解 — 只用喺非安全 checksum）、SHA-1（160 位元、已棄用）、SHA-256（256 位元、安全、NIST 標準）、SHA-512（512 位元、更安全但慢啲）、SHA-3-256（最新 NIST 標準、sponge construction）、BLAKE2b（快過 MD5、安全過 SHA-256）、或 BLAKE3（最快、parallel、2020 年發布）。',
      },
      {
        heading: '產生同比較雜湊',
        body: 'Click「產生」去計個雜湊。輸出用十六進位（細寫，標準表示）顯示，仲可揀用 Base64。對於檔案驗證，將 expected checksum（例如由下載頁面）貼落「預期雜湊」欄位 — 工具會 highlight 綠色 match 或紅色 mismatch。HMAC toggle 俾你入秘密金鑰做 keyed-hash 驗證。',
      },
      {
        heading: '複製或下載雜湊結果',
        body: 'Click 複製 icon 將雜湊抄去剪貼簿。批次驗證嘅話，上傳多個檔案，工具會出一個 manifest 檔案（hashes.json）列晒每個檔案名同佢嘅雜湊，兼容常見驗證工具。下載 sha256sum 或 md5sum 格式嘅 checksum 檔案畀 command-line verification 用。',
      },
    ],
    tips: [
      'MD5（128 位元，RFC 1321）安全性上已被破解，但對非安全 checksum 仲有用。喺現代 hardware 度，唔使 1 秒就可以 engineered 兩個唔同檔案 produce 相同 MD5 雜湊（chosen-prefix collision attack）。MD5 只用嚟偵測檔案傳輸期間嘅意外損壞，千祈唔好用嚟 verify 對抗 attacker 嘅完整性。',
      'SHA-1（160 位元）喺 2011 年被 NIST 棄用，2017 年完全由 TLS 憑證 retired。SHAttered 攻擊（2017，Google/CWI）用咗 9,223,372,036,854,775,808 次 SHA-1 計算去 produce 兩個有相同 SHA-1 雜湊嘅唔同 PDF 檔案 — 當時等如 110 GPU-年，但而家喺現代 hardware 度幾星期就做到。將任何剩低嘅 SHA-1 使用 migrate 去 SHA-256。',
      'SHA-256 係而家加密雜湊嘅主力。佢 produce 一個 256 位元（32 位元組、64 個十六進位字元）嘅 digest。Bitcoin 用 double SHA-256 做 proof-of-work。Git 用 SHA-1 雜湊去識別每個 commit、tree 同 blob（截至 2025 年 migrate 緊去 SHA-256）。TLS 憑證同 code signing 用 SHA-256 做最低 acceptable 雜湊。',
      'BLAKE3 喺 2020 年由整 BLAKE2 同 SHA-3 finalist BLAKE 嘅同一團隊發布，喺 x86-64 CPU 度快過 SHA-256 5 倍（多得 SIMD parallelization），快過 SHA-3 10 倍，仲設計畀跨任何數量 cores 嘅 parallel 處理。佢係 content-addressable storage 同 file deduplication 系統嘅絕佳選擇。截至 2026 年，BLAKE3 冇已知嘅實際攻擊。',
      '千祈唔好儲存 raw password hash。如果 attacker 攞到你個 database，佢哋會行 rainbow table 攻擊 — 一個 precomputed table mapping 雜湊值去佢哋嘅原始密碼。相反，用 purpose-built algorithm 去做密碼雜湊：bcrypt（1999，adjustable cost factor）、scrypt（2009，memory-hard，設計嚟抵抗 ASIC 攻擊）或 Argon2id（2015，Password Hashing Competition 贏家，截至 2024 年由 OWASP 推薦）。呢啲 algorithm 被故意設計到好慢（configurable 到每次雜湊 100-500ms），令 brute-force 攻擊不可行。我哋嘅產生器支援 HMAC 模式做 keyed authentication，但對密碼儲存，請用 dedicated password-hashing library。',
      'HMAC（雜湊訊息驗證碼，RFC 2104）將秘密金鑰同雜湊函數結合：HMAC-SHA-256(key, message) = SHA-256((key XOR outer_pad) + SHA-256((key XOR inner_pad) + message))。佢同時提供完整性（訊息冇被 tamper）同真實性（只有知道秘密金鑰嘅人先可以 produce 嗰個特定 HMAC）。HMAC 用喺 JWT signing、API request authentication 同 TLS record integrity。',
      '當根據 published checksum 去 verify 一個下載咗嘅檔案嗰陣，永遠由同下載唔同嘅 source 攞個 checksum。如果檔案同 checksum 都喺同一個 compromised 頁面，attacker 可以 replace 晒兩樣。好多 open-source project 喺佢哋 official website 度 publish checksum，同時喺 mirrors 或 CDN 度 host 下載。',
      '對於大型檔案雜湊（1 GB+），用 BLAKE3 或 SHA-256 配合 chunked reading。我哋嘅檔案上傳模式 incremental 咁處理檔案，可以喺瀏覽器度處理高達 100 MB 嘅檔案。適合更大檔案嘅 command-line 替代方案：`sha256sum largefile.iso`（Linux）、`shasum -a 256 largefile.iso`（macOS）或 `Get-FileHash largefile.iso -Algorithm SHA256`（PowerShell）。',
    ],
    faqs: [
      {
        q: 'MD5、SHA-1 同 SHA-256 之間有咩分別？',
        a: '三個關鍵分別係輸出大細、安全等級同速度。MD5 produce 128 位元雜湊，最快但密碼學上已被破解 — 碰撞可以喺唔使一秒內 generate。SHA-1 produce 160 位元雜湊，速度中等，但已棄用因為碰撞攻擊而家係 practical（2017 年 SHAttered 攻擊成本約 $110,000 美元雲端運算）。SHA-256 produce 256 位元雜湊，慢過 MD5 同 SHA-1，但仲安全 — 截至 2026 年冇已知嘅 practical collision attack 對抗 SHA-256。',
      },
      {
        q: '我應該用 SHA-256 定係 SHA-512？',
        a: '對大部分應用嚟講，SHA-256 夠晒 — 256 位元安全性超出任何 classical computer 嘅運算能力。SHA-512 produce 512 位元雜湊，設計畀 64 位元 CPU（佢 operate 喺 64 位元 words 而 SHA-256 係 32 位元 words）。喺 64 位元 hardware 度，SHA-512 對大型輸入通常快過 SHA-256，因為每 round 處理雙倍咁多資料。揀 SHA-256 為 compatibility；揀 SHA-512 當你需要額外安全 margin 為 compliance（例如某啲政府或金融系統 mandate SHA-512）同喺 64 位元 infrastructure 度行。',
      },
      {
        q: 'Rainbow table 攻擊係咩？',
        a: 'Rainbow table 係一個 precomputed database，有數百萬常見密碼嘅 hash-to-plaintext mapping。如果你個 database 儲存 unsalted SHA-256 雜湊，attacker 可以 lookup 每個雜湊喺 rainbow table 度同即刻 recover 你系統入面所有常用密碼嘅原始密碼。防禦：(1) 加 random salt — 每個 user 一個 unique random string — 令相同密碼對唔同 user produce 唔同雜湊（rainbow table 變得冇用因為佢哋要為每一個 possible salt 重新計過）；(2) 用慢、memory-hard 嘅密碼雜湊 algorithm（bcrypt、scrypt、Argon2id）而唔係 general-purpose 雜湊函數。',
      },
      {
        q: 'HMAC 係咩？幾時用佢？',
        a: 'HMAC（雜湊訊息驗證碼）係一個 construction 將雜湊函數同秘密金鑰變成一個 message authentication code。佢答嘅問題係：「呢個訊息係咪嚟自知道秘密金鑰嘅人？佢喺傳送過程中有冇被改過？」HMAC 用喺 JWT tokens（HMAC-SHA256 signing）、AWS Signature v4 API authentication、OAuth 1.0 同 TLS。當 sender 同 receiver 共享一個秘密金鑰而你 needs to verify 每個訊息嘅完整性同真實性嗰陣，就用 HMAC。',
      },
      {
        q: '雜湊函數可唔可以 reverse？',
        a: '唔可以。加密雜湊函數被設計做單向 — 喺計算上冇可能由佢嘅雜湊 recover 返原始輸入。不過，對細輸入空間（例如短密碼），attacker 可以雜湊每個 possible 輸入（brute-force 攻擊）同同 target 雜湊比較。呢個唔係「reverse」個雜湊；而係一個因為有限輸入空間而變得 practical 嘅 brute-force preimage search。強密碼雜湊 algorithm（bcrypt、Argon2id）透過故意慢令 brute-force 攻擊不可行。',
      },
      {
        q: '雪崩效應係咩？',
        a: '雪崩效應意思係改輸入嘅一個位元會改到大約 50% 嘅輸出位元。例如，SHA-256("hello") 同 SHA-256("Hello") produce 完全唔同嘅雜湊 — 唔止係單一字元差別。呢個屬性確保相似輸入唔會 produce 相似雜湊，防止 attacker 由 partial hash matches 推斷輸入資訊。所有現代雜湊函數（SHA-256、SHA-3、BLAKE3）都表現出強烈嘅雪崩效應。',
      },
    ],
    conclusion:
      '雜湊函數係數位安全嘅隱形 backbone — 每日保護密碼、verify 檔案完整性同 authenticate 訊息數十億次。無論你要一個快嘅 MD5 checksum 畀檔案下載定係 SHA-256 畀安全 audit，我哋嘅免費雜湊產生器喺你個瀏覽器度即時計到 — 冇檔案離開你部機。即刻產生你嘅雜湊。',
  },

  // ========== 7. QR 碼讀取器 ==========
  'how-to-use-qr-reader': {
    title: 'QR 碼讀取器：網上掃描同解碼 QR 碼（相機同檔案上傳）',
    metaTitle: 'QR 碼讀取器 – 用相機或上傳網上掃描 QR 碼',
    metaDescription:
      '用你個相機或者上傳圖片網上解碼 QR 碼。支援 URL、文字、WiFi、vCard、電郵、SMS、地理位置同日曆事件。',
    keywords: [
      'qr 碼讀取器',
      '網上掃描 qr 碼',
      'qr 碼解碼器',
      '網上 qr 掃描器',
      '解碼 qr 碼',
      '免費 qr 碼讀取器',
      '由圖片掃描 qr',
      'qr 碼相機讀取器',
    ],
    intro:
      '一個 QR 碼（Quick Response code）將高達 7,089 個數字字元或 2,953 位元組嘅 binary 資料 pack 入一個黑白 module 嘅方陣 — 你每日喺產品包裝、餐廳 menu、支付 terminal、活動門飛同行銷材料度撞到佢哋幾十次。我哋嘅 QR 碼讀取器用你部 device 嘅相機（real-time 掃描）或者透過解碼上傳嘅圖片檔案，即刻解碼任何 QR 碼。同好多將你掃描嘅資料送去 remote server 處理嘅網上 QR 讀取器唔同，我哋個工具用 compile 做 WebAssembly 嘅 jsQR 同 ZXing library，全部喺你個瀏覽器度執行解碼引擎 — 你掃描嘅 URLs、WiFi 密碼或者聯絡資料永遠唔會離開你部 device。讀取器支援 QR 碼可以 encode 嘅所有資料類型：普通 URLs 同文字、WiFi 網絡 credentials（SSID、密碼、加密類型）、vCard 聯絡資訊、預填 subject 同 body 嘅電郵地址、預填 recipient 同 body 嘅 SMS 訊息、地理座標（geo: URI）、日曆事件（iCalendar 格式）同電話號碼。解碼之後，工具會顯示 extracted 資料同埋畀你一 click 動作 — 喺新 tab 開 URL、connect WiFi 網絡、add contact 或者複製 raw 解碼字串。',
    steps: [
      {
        heading: '揀你嘅掃描方法',
        body: '揀「相機」用你 device 嘅 webcam real-time 掃描 QR 碼 — 將相機 point 去任何 QR 碼，工具會喺 200-500 毫秒內自動解碼。或者揀「檔案上傳」由已儲存嘅圖片（screenshot、相、PDF page 或 document 入面 embedded 嘅 QR）解碼 QR 碼。檔案上傳模式支援 PNG、JPEG、WebP、GIF、BMP 同 TIFF 格式。',
      },
      {
        heading: '睇解碼資料同做動作',
        body: '解碼內容即刻顯示，自動 detect 資料類型。對 URL，有個「Visit」掣喺安全 preview 之後喺新 tab 安全咁開佢。對 WiFi credentials，SSID 同密碼會顯示同畀你一 click「Connect」動作。對 vCard 聯絡人，所有欄位（名、電話、電郵、組織、地址）會被 parse 做一張可以 save 嘅 contact card。Raw 解碼字串永遠喺底部顯示供 verification。',
      },
      {
        heading: '處理多個碼同 Export 結果',
        body: '對於包咗多個 QR 碼嘅圖片（例如一頁 product labels），讀取器會同時 detect 同解碼晒所有 QR 碼，喺有編號嘅 list 度顯示結果。Export 解碼資料做 JSON 畀你嘅 application integration 或者 CSV 畀 spreadsheet 分析。掃描 history（儲存喺瀏覽器嘅 localStorage 度）俾你唔使 rescan 就可以 revisit 最近掃過嘅碼。',
      },
    ],
    tips: [
      'QR 碼 version 範圍由 1（21x21 modules，hold 到 25 個字元）到 40（177x177 modules，hold 到 7,089 個數字字元）。大部分 consumer QR 碼係 version 2-10（25x25 到 57x57）。對於 sub-optimal 掃描條件，揀低 version 配高 error correction。',
      'QR 碼 error correction 用 Reed-Solomon codes 分四個 levels：L（Low，7% recovery — 最大資料容量，用喺乾淨嘅 digital displays）、M（Medium，15% — 大部分 QR 碼嘅 default，最佳平衡）、Q（Quartile，25% — 用喺有輕微損壞風險嘅 printed materials）同 H（High，30% — 用喺 outdoor posters、product packaging 或任何可能會 dirty 或 partially obscured 嘅碼）。一個有 H-level correction 嘅碼就算高達 30% modules 損壞都仲讀到。',
      '每個 QR 碼角落嗰三個大方格係 finder patterns — 掃描器最先 locate 呢啲嚟 determine 個碼嘅 orientation 同 perspective distortion。佢哋之間嗰個細啲嘅方格（或多個方格，喺 version 2+）係 alignment pattern，幫掃描器 correct 個碼 print 喺 curved surface 上嘅彎曲。',
      'QR 碼按類型嘅資料容量：純數字 — 7,089 個字元（version 40，error correction L）。Alphanumeric（0-9、A-Z、空格、$%*+-./:）— 4,296 個字元。Binary/byte（ISO 8859-1）— 2,953 位元組。Kanji（Shift JIS）— 1,817 個字元。對大部分 real-world use，QR 碼儲存 50-150 個字元嘅資料。',
      '由 screen 掃描嗰陣（例如顯示喺另一部電話或 monitor 度嘅 QR 碼），稍微 lower 個 source device 嘅 screen brightness 去 improve 掃描器嘅 contrast。Camera-based QR 讀取器可能會 struggle with screen glare — 將掃描 device 揸喺一個 slight angle（15-20 度）幫到手 eliminate reflections。',
      'Mobile devices 上嘅 dark mode 可能 interfere with QR 碼掃描。如果一個 website display 一個 QR 碼做黑底白字 image 喺 dark-themed page 入面，surrounding dark pixels 可以 confuse 掃描器嘅 finder pattern detection。確保 QR 碼 display 喺白色 background 同 adequate quiet zone（四邊 4 modules 嘅白色空間），不論 page theme。',
      '對於掃描損壞或低 quality 嘅 QR 碼，檔案上傳方法通常 reliable 過相機掃描。先影張相，然後上傳個檔案 — 解碼 algorithm 可以花比 real-time 相機 mode 更多 processing time 去做 image analysis（apply contrast enhancement、sharpening 同 perspective correction）。',
      'Security：永遠 preview QR 碼嘅解碼內容先至開 link 或 take action。QR 碼可以 encode malicious URLs、phishing pages 或 payment redirects。我哋個讀取器喺提供任何 action button 之前 show 晒成個解碼內容畀你睇，對 URLs 仲會 display domain 同做 safety check against known phishing databases。',
    ],
    faqs: [
      {
        q: '一個 QR 碼可以儲存幾多資料？',
        a: '最大資料容量 depends on QR 碼 version（1-40）同 error correction level。喺 version 40 配 error correction L（7%）下，一個 QR 碼可以儲存：7,089 個數字字元、4,296 個 alphanumeric 字元、2,953 位元組 binary 資料（ISO 8859-1）或 1,817 個 Kanji 字元。畀個 concept 你：一個有 name、phone、email 同 URL 嘅 vCard 通常 150-250 個字元 — 遠遠喺一個 version 5 QR 碼（配 error correction M 有 106 位元組）嘅能力之內。',
      },
      {
        q: 'QR 碼可以 encode 咩類型嘅資料？',
        a: 'QR 碼透過 URI scheme 支援所有主要資料類型：URL（https://example.com）、普通文字（freeform）、WiFi（WIFI:S:MyNetwork;T:WPA;P:mypassword;;）、vCard contact（BEGIN:VCARD...）、電郵（mailto:user@example.com?subject=Hello）、SMS（sms:+1234567890?body=Hi）、geo-location（geo:37.7749,-122.4194）、日曆 events（BEGIN:VEVENT...）、電話 calls（tel:+1234567890）同 cryptocurrency wallet addresses（bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa）。',
      },
      {
        q: 'QR 讀取器點處理損壞或 partially obscured 嘅碼？',
        a: 'QR 碼用 Reed-Solomon error correction，加咗 redundant data 令個碼就算 partially damaged 都讀到。喺 error correction level H（30%）下，接近三分之一嘅碼可以被 destroy、cover 或 smudge 而資料仍然 recoverable。掃描器透過由 undamaged modules solve Reed-Solomon equations 去 reconstruct 資料。Finder patterns（三個角落方格）一定要 intact 做 initial detection；alignment patterns 幫手做 curved-surface correction。',
      },
      {
        q: '我可唔可以由 screenshot 或已儲存圖片掃描 QR 碼？',
        a: '可以。用我哋讀取器嘅「檔案上傳」模式。上傳任何包咗 QR 碼嘅圖片 — screenshots、相、PDF exports 或 larger graphics 入面 embedded 嘅碼 — 解碼器會 locate 同解碼圖片入面所有 QR 碼。對細碼或 complex images 入面嘅碼，檔案上傳模式通常 reliable 過相機掃描，因為 algorithm 可以 apply 更 intensive 嘅 image preprocessing。',
      },
      {
        q: 'QR 讀取器喺唔喺所有 devices 度都 work？',
        a: 'Work。相機掃描器喺任何有相機同 modern browser（Chrome、Firefox、Safari、Edge — 全部支援 getUserMedia API 畀相機 access）嘅 device 度都 work。檔案上傳模式喺所有有 browser 嘅 device 度都 work。喺 mobile 度，相機掃描器第一次用會 request 相機 permission；video stream 永遠唔會離開你部 device 同全部喺 browser 度處理。',
      },
      {
        q: '我掃描嘅 QR 資料會唔會上傳去 server？',
        a: '唔會。所有 QR 碼解碼全部喺你個 browser 度發生。相機 feed、上傳圖片同解碼資料永遠唔會離開你部 device。呢樣喺掃描包咗 WiFi credentials、個人聯絡資訊或私密 URLs 嘅 QR 碼嗰陣特別重要 — 你嘅資料喺成個掃描同解碼過程期間 stay 喺你部機度。',
      },
    ],
    conclusion:
      'QR 碼周圍都係 — 我哋嘅免費掃描器解碼晒佢哋。無論你用相機 real-time 掃描定係上傳圖片檔案，解碼資料即刻顯示，連埋 smart action buttons 畀 URLs、WiFi、contacts 同更多。所有處理都喺你個 browser 度 locally 發生。即刻掃描一個 QR 碼。',
  },

  // ========== 8. CSV 格式化器 ==========
  'how-to-use-csv-formatter': {
    title: 'CSV 格式化器：網上格式化、驗證同美化 CSV 資料',
    metaTitle: 'CSV 格式化器 – 免費網上格式化同驗證 CSV 檔案',
    metaDescription:
      '網上格式化、驗證同美化 CSV 資料。支援自訂分隔符號（逗號、Tab、分號、pipe）、RFC 4180 合規、Excel UTF-8 BOM，同埋更多。',
    keywords: [
      'csv 格式化器',
      '網上格式化 csv',
      'csv 美化器',
      'csv 驗證器',
      'csv 轉表',
      'csv 分隔符號',
      'rfc 4180',
      'excel csv 格式化器',
      'csv 檔案格式化器',
    ],
    intro:
      'CSV（逗號分隔值）係最古老同最 universal 嘅資料交換格式 — 佢早過 JSON 幾十年，冇 official governing body（RFC 4180 係最接近 standard 嘅嘢，而佢係一份 informational memo，唔係 strict specification），每個工具由 Excel 到 pandas 到 PostgreSQL 都用稍微唔同嘅方式 implement 佢。結果：CSV 檔案睇落冇問題但因為錯嘅 delimiter、inconsistent quoting、missing headers 或者睇唔到嘅 encoding issues 而 parse 唔到。我哋嘅 CSV 格式化器透過 parse 你嘅 CSV 資料 — 無論佢用邊種 variant — 同 present 佢喺一個乾淨、aligned 嘅 table view 度，有 properly escaped 嘅 fields。佢 auto-detect delimiters（逗號、Tab、分號、pipe）、identify header rows、normalize quoting 同 validate against RFC 4180 conventions。呢個工具全部喺你個 browser 度行同 comfortably 處理到高達 50 MB 同 500,000 rows 嘅檔案。對於 Excel users，佢 add 或 remove Excel 要嚟 correctly interpret 非 ASCII 字元嘅 UTF-8 BOM（Byte Order Mark），防止冇 BOM 嘅情況下喺 Excel 度開 UTF-8 CSV 嗰陣出現嘅恐怖「Mojibake」亂碼文字。',
    steps: [
      {
        heading: '貼上、上傳或 Drag-and-Drop 你嘅 CSV',
        body: '直接貼 CSV 資料落 text area、上傳 .csv 或 .tsv 檔案，或者 drag and drop 一個檔案由你部電腦。Parser auto-detect delimiter 透過 analyze 頭幾行 — 佢搵一個 produce 跨行 consistent 欄位數量嘅字元（逗號、Tab、分號或 pipe）。Detected delimiter 顯示喺 output 頂部，有個 dropdown 俾你 manually override 如果 detection 錯咗。',
      },
      {
        heading: 'Review 同 Configure Formatting Options',
        body: '用 settings panel 去：(1) toggle「第一行係 header」detection — 工具將 header row highlight 做藍色；(2) select output delimiter 如果你想 convert between formats（例如 comma to tab-separated）；(3) enable「Add UTF-8 BOM」for Excel compatibility；(4) set quoting strategy — quote all fields、quote only fields containing delimiter 或 minimal quoting；(5) align columns for readability 喺 table view。',
      },
      {
        heading: '複製、下載或 Export 格式化結果',
        body: 'Click「Download CSV」export 格式化咗嘅資料做乾淨嘅 .csv 檔案（跟你揀嘅 delimiter 同 quoting options）。Click「Copy」將 raw CSV text 抄去 clipboard。Table view 支援 click 任何 column header 去 sort 同用 Ctrl+F search within data。對大檔案，「Download as JSON」option convert CSV 去一個 JSON array of objects，通常 easier to process programmatically。',
      },
    ],
    tips: [
      'RFC 4180 define 呢啲 CSV 規則：(1) 每個 record 喺 separate line 度，delimited by CRLF（\r\n）；(2) 最後一個 record 可能有或冇 trailing line break；(3) 第一行可能係 header line 有同 records 一樣數量嘅 fields；(4) 每行應該包相同數量嘅 fields；(5) 包 commas、double-quotes 或 line breaks 嘅 fields 一定要 enclosed in double-quotes；(6) 一個 double-quote 喺 quoted field 入面要 escaped by doubling it（""）。',
      'UTF-8 BOM 問題：Windows 上嘅 Excel requires BOM（Byte Order Mark，檔案頭嘅 bytes EF BB BF）先 correctly display UTF-8 字元如 accented letters、中文或 emoji。冇 BOM，Excel assumes 檔案 encoded in 系統嘅 default code page（e.g.，Windows-1252），非 ASCII 字元 display 做亂碼。我哋嘅格式化器當你 enable「Excel compatibility mode」嗰陣 add BOM。',
      'European CSV 檔案 commonly 用分號（;）做 delimiters 而唔係 commas，因為好多 European locales 用 comma 做 decimal separator（e.g.，3,14 for pi rather than 3.14）。一個 comma-delimited 數字 "3,14" 喺 semicolon-delimited 檔案入面係 unambiguous。如果你啲資料同時包 commas 做 decimal separators 同 commas 做 delimiters，switch 去 semicolon 或 tab delimiters。',
      'Browser 入面嘅大 CSV 檔案（>100 MB）：我哋個工具用 FileReader API 配合 streaming parsing 以 chunks 處理檔案。對於接近 50 MB 嘅檔案，喺 modern hardware 度預 processing time 1-3 秒。對於 truly massive datasets（500 MB+），用 command-line tools：`csvkit`（Python）、`xsv`（Rust，handle GB-scale CSVs with sub-second queries）或 `q`（SQL queries directly on CSV）。',
      'CSV field values 可以包 newlines — 一個 quoted field 可以 span multiple lines。呢個係 valid RFC 4180 但 confuses 好多 CSV parsers 同 makes line-by-line processing impossible。我哋嘅格式化器 correctly handle multi-line quoted fields 同 display 佢哋喺 table 度用 visual indicator show 返個 newline character。',
      '永遠 validate 每一 row 有同 header 一樣數量嘅 fields。An off-by-one error（e.g.，一個 trailing delimiter 喺每行尾 create 一個 empty field）係 import CSV 落 database 嗰陣 silent data corruption 嘅 common cause。我哋嘅 validator flags rows with inconsistent field counts 同 highlights 受影響嘅 cells。',
      'For TSV（Tab-Separated Values），rules are simpler：tabs separate fields，冇 standard quoting mechanism 因為 tabs almost never appear in data values（unlike commas）。TSV 喺 bioinformatics、log processing 同任何 data values frequently contain commas 嘅 context 度 preferred。我哋嘅格式化器 convert seamlessly between CSV and TSV。',
      'When preparing CSV data for database import（MySQL、PostgreSQL、SQLite），ensure：(1) NULL values 係 consistently represented（empty fields without quotes typically interpreted as NULL，while empty quoted fields "" interpreted as empty strings）；(2) date formats match 資料庫嘅 expected format（ISO 8601 YYYY-MM-DD is safest）；(3) boolean values are standardized（true/false、1/0 或 t/f depending on database）。',
    ],
    faqs: [
      {
        q: 'RFC 4180 係咩？係咪所有 CSV 都 RFC 4180 compliant？',
        a: 'RFC 4180（2005）係一份 informational memo document 咗最 common CSV conventions，但佢唔係 official IETF standard — 冇 formal CSV standard。大部分 CSV implementations follow RFC 4180 嘅 rules（commas as delimiters、double-quote escaping、CRLF line endings），但好多 deviate：European systems often use semicolons、some implementations allow backslash escaping instead of double-quote doubling、同 line endings vary between LF（Unix）、CRLF（Windows）同 CR（legacy Mac）。我哋嘅格式化器 flexible enough to handle 所有 common variants。',
      },
      {
        q: '點樣喺 Excel 度開 CSV 檔案唔出亂碼？',
        a: '用 Excel 嘅「資料 > 從文字/CSV」import wizard（唔係檔案 > 開啟），佢俾你 specify file encoding（揀 UTF-8）同 delimiter before loading。Alternatively，add UTF-8 BOM 去你個 CSV 檔案 — 我哋嘅格式化器用「Excel compatibility」toggle 做呢樣。For Google Sheets，simply use 檔案 > Import，佢 correctly auto-detect UTF-8 唔使 BOM。',
      },
      {
        q: '我可唔可以將 CSV 轉換做 JSON 或其他格式？',
        a: '可以。用「Download as JSON」button 將 parsed CSV convert 去一個 JSON array of objects（每行變成一個 object 用 header fields as keys）。For SQL，用「Copy as INSERT」去 generate INSERT statements。For Markdown，用「Copy as Markdown Table」去 generate GitHub-Flavored-Markdown-compatible table。Each export format respects parsed header row 同 delimiter settings。',
      },
      {
        q: 'CSV 同 TSV 有咩分別？',
        a: 'CSV 用 commas separate fields；TSV 用 tab characters。Practical difference：commas frequently appear in natural text（addresses、descriptions、names with suffixes like "Doe, Jr."）同 require quoting。Tab characters almost never appear in data values，所以 TSV rarely needs quoting，making it simpler to parse 同 less error-prone。TSV 係 preferred format for data that contains text-heavy fields。DSV（Delimiter-Separated Values）係 generic term 包咗 CSV、TSV、semicolon-delimited、pipe-delimited 同任何其他 character-delimited format。',
      },
      {
        q: '格式化器點處理非常大嘅 CSV 檔案？',
        a: 'Files up to 50 MB are processed entirely in browser with streaming parsing — file is read in chunks using FileReader API，同 table view uses virtualized rendering to efficiently display only visible rows。Beyond 50 MB，用「Preview」mode which reads only first 1,000 rows for formatting preview while preserving ability to validate full file structure（row count、header consistency）。For production-scale CSV processing，pair 我哋嘅格式化器 with command-line tools like csvkit or xsv。',
      },
      {
        q: '點樣 detect 同 fix 一個 incorrectly parsed CSV 嘅 delimiter？',
        a: '我哋嘅格式化器 auto-detect delimiter by analyzing consistency of field counts across first 20 lines with each candidate delimiter（comma、semicolon、tab、pipe）。If auto-detection guesses wrong，manually select correct delimiter from dropdown 同 table re-parses immediately。A quick manual check：scan raw text for the delimiter character — if commas appear inside field values without accompanying double-quotes，file likely uses non-comma delimiter。',
      },
    ],
    conclusion:
      'CSV 可能 concept 好簡單，但冇 formal standard 表示每個 CSV 檔案都係一個 potential parsing puzzle。我哋嘅格式化器 handle 晒所有 variants — delimiters、quoting、encoding 同 BOM — 令你嘅資料第一次就 load 啱。貼你個 CSV 落嚟，喺幾秒內睇到佢格式化做乾淨、readable 嘅 table。',
  },

  // ========== 9. XML 格式化器 ==========
  'how-to-use-xml-formatter': {
    title: 'XML 格式化器：網上美化、驗證同除錯 XML',
    metaTitle: 'XML 格式化器 – 免費網上格式化同驗證 XML',
    metaDescription:
      '網上格式化、美化同驗證 XML 資料。支援 indent、DTD/XSD validation、XPath evaluation 同 syntax error highlighting。',
    keywords: [
      'xml 格式化器',
      '網上格式化 xml',
      'xml 美化器',
      'xml 驗證器',
      'xml pretty print',
      'xpath evaluator',
      '免費 xml 格式化器',
      'soap 格式化器',
      'rss feed 格式化器',
    ],
    intro:
      'XML（可擴展標記語言）仲係 enterprise systems、SOAP APIs、document formats（DOCX、ODS、SVG）同 configuration files 嘅 backbone — 就算佢 1998 年 W3C recommendation 到而家已經三十年。但 raw XML 出晒名難讀：一個冇 line breaks 嘅 deeply nested document、mixed namespaces 同 CDATA sections 係 developer 嘅 readability nightmare。我哋嘅 XML 格式化器 beautify 任何 XML document 配合 configurable indentation（2 或 4 spaces）、syntax highlighting 同 collapsible tree navigation。Validator checks well-formedness（proper tag matching、attribute quoting、character escaping）同 optionally validates against DTD 或 XSD schema。唔似 JSON，XML 有 formal concept of「well-formed vs valid」— 一個 document 可以係 well-formed（parseable XML syntax）但仍然 invalid（fails schema constraints）。呢個工具仲包一個 XPath 1.0 evaluator 畀 query elements and attributes from large XML documents 唔使寫 code，同一個 SOAP envelope formatter 處理 enterprise API debugging 常見嘅 SOAP-specific namespaces 同 structure。All processing happens in your browser — your XML configuration files、API responses 同 schema documents 永遠唔會離開你部機。',
    steps: [
      {
        heading: '貼上或上傳你嘅 XML',
        body: '直接貼 XML 落 editor 度，或上傳 .xml 檔案。Formatter accepts any XML variant — SOAP envelopes（soapenv:Envelope）、RSS/Atom feeds、XHTML、SVG 或 custom application XML。Editor includes line numbers 同 highlights syntax errors in red as you type，with error description shown in panel below。',
      },
      {
        heading: '格式化同 Optionally 驗證',
        body: 'Click「Format」去 beautify XML 用你揀嘅 indentation（2 或 4 spaces）。Tree view on right shows document structure with expandable/collapsible nodes — clicking any node scrolls editor to that element。For validation，enable「Validate against schema」同上傳 DTD 或 XSD file；schema violations are reported with line-level precision 同 explanation of what schema requires。',
      },
      {
        heading: '用 XPath Query 同 Export Results',
        body: 'Enter XPath 1.0 expression（e.g.，/catalog/book[price<30]/title）去 query document。Matching nodes are highlighted in tree view 同 listed in results panel。Copy formatted XML、download as .xml file 或 export XPath query results as JSON for further processing in your application。',
      },
    ],
    tips: [
      '一個格式良好嘅 XML 文件必須遵守五條規則：(1) 單一根元素包含晒所有其他元素；(2) 每個開標籤都要有對應嘅閂標籤（或者係自閉合，例如 &lt;br/&gt;）；(3) 標籤必須正確巢狀 — &lt;a&gt;&lt;b&gt;&lt;/a&gt;&lt;/b&gt; 係唔合法嘅；(4) 屬性值一定要加引號（單引號或雙引號都得）；(5) 五個預定義實體（&amp;amp;、&amp;lt;、&amp;gt;、&amp;apos;、&amp;quot;）必須用喺保留字元度。',
      'XML 命名空間（xmlns 屬性）防止組合多個 XML 詞彙表嗰陣嘅元素名稱衝突。例如，單一個 XML 文件可以同時包埋 XHTML 元素（xmlns="http://www.w3.org/1999/xhtml"）同 SVG 元素（xmlns:svg="http://www.w3.org/2000/svg"）。命名空間前綴（例如 svg:）係本地別名；元素嘅實際身分取決於命名空間 URI 加本地名稱。',
      'CDATA 區段（&lt;![CDATA[ ... ]]&gt;）俾你包埋一啲原本需要跳脫嘅字元（例如 &lt;、&gt; 同 &amp;）。佢哋通常用嚟喺 XML 入面嵌入程式碼片段、HTML 片段或者 JSON，而唔使跳脫每個特殊字元。不過，CDATA 唔可以包埋字串 "]]&gt;"（CDATA 結束標記），亦都唔可以巢狀。',
      'XPath 係 XML 嘅查詢語言 — 就好似 XML 資料嘅 SQL 咁。常見表達式：/root/element（絕對路徑）、//element（搵文件入面任何位置嘅所有元素）、/root/element[@attr="value"]（按屬性篩選）、/root/element[position()&lt;=3]（頭三個元素）、/root/element/text()（提取文字內容）。XPath 1.0 幾乎所有 XML 解析器都支援；XPath 2.0 同 3.0 加咗函數、資料類型同條件表達式，但支援度冇咁普及。',
      'XML vs JSON 取捨：XML 有正式 schema 語言（XSD）、命名空間、註解、處理指令同混合內容（文字同子元素交織）— 呢啲功能 JSON 缺乏或者要透過臨時慣例處理。JSON 比較輕量、直接映射到程式語言資料結構、解析更快。對於有複雜結構同正式驗證要求嘅文件中心資料（法律文件、財務報告、健康紀錄）用 XML；對於服務之間嘅 API 資料交換用 JSON。',
      'SOAP（簡單物件存取協定）API 將佢哋嘅酬載包裝喺一個 XML 信封入面，有標準化元素：&lt;soapenv:Envelope&gt;、&lt;soapenv:Header&gt;（可選 — 認證、交易、路由）同 &lt;soapenv:Body&gt;（實際請求/回應資料）。除錯 SOAP 錯誤通常牽涉檢查 Body 入面嘅 &lt;soapenv:Fault&gt; 元素。我哋嘅格式化器偵測到 SOAP 信封就會套用 SOAP 專用格式化，展開命名空間。',
      'RSS 2.0 同 Atom 係基於 XML 嘅網頁 feed 格式。RSS 要求一個 &lt;rss version="2.0"&gt; 根元素，包住一個包咗 &lt;item&gt; 元素嘅單一 &lt;channel&gt;。Atom 用 &lt;feed&gt; 根配 &lt;entry&gt; 子元素。兩種格式廣泛用喺播客、blog 聯合同新聞聚合。我哋嘅格式化器驗證 feed 專用嘅必需元素（例如 RSS 嘅 &lt;title&gt;、&lt;link&gt;、&lt;description&gt;；Atom 嘅 &lt;id&gt;、&lt;title&gt;、&lt;updated&gt;）同 highlight 缺失或格式錯誤嘅欄位。',
      '處理指令（&lt;? ... ?&gt;）係畀 XML 處理器嘅指令，唔屬於文件字元資料嘅一部分。最常見嘅係檔案開頭嘅 XML 宣告：&lt;?xml version="1.0" encoding="UTF-8"?&gt;。其他包括用嚟連結 CSS 嘅 &lt;?xml-stylesheet?&gt; 同用嚟嵌入 PHP 程式碼嘅 &lt;?php ... ?&gt;。處理指令喺格式化期間會被保留。',
    ],
    faqs: [
      {
        q: '格式良好嘅 XML 同有效嘅 XML 有咩分別？',
        a: '格式良好嘅 XML 遵守基本語法規則：正確巢狀、加引號嘅屬性、匹配嘅標籤同正確嘅實體跳脫。任何 XML 解析器都可以解析格式良好嘅 XML。有效嘅 XML 更進一步：佢係格式良好而且符合 schema（DTD 或 XSD），schema 定義咗容許嘅元素、屬性、佢哋嘅順序、資料類型同基數。一個格式良好嘅 XML 文件仍然可以係無效嘅 — 例如，有個 &lt;price&gt; 元素，schema 要求整數但文件入面個值係 "free"。',
      },
      {
        q: 'DTD 同 XSD 係咩？',
        a: 'DTD（文件類型定義）係原始嘅 XML schema 語言，喺 XML 1.0 規範度定義。佢定義容許嘅元素、屬性同實體參考，但資料類型支援有限（冇數字範圍、regex 模式或者條件驗證）。XSD（XML Schema 定義，W3C，2001）係現代嘅替代方案 — 佢支援 44 種內建資料類型（字串、整數、日期等）、命名空間感知驗證、複雜類型繼承同精細嘅出現限制。XSD 本身係用 XML 寫嘅，而 DTD 有自己嘅非 XML 語法。大部分現代企業系統用 XSD 多過 DTD。',
      },
      {
        q: '格式化器 Handle 到非常大嘅 XML 檔案嗎？',
        a: '處理到。串流解析器喺瀏覽器度處理高達 50 MB 嘅檔案。對於超深層巢狀（100+ 層），樹狀檢視會對節點做分頁確保效能。對於超過 50 MB 嘅檔案，「預覽」模式解析頭 10,000 個元素做格式化，同時報告完整文件嘅元素數量同結構。對於生產規模嘅 XML 處理，將我哋嘅格式化器配合命令列工具使用，例如 xmllint（libxml2）或 Saxon（XSLT/XQuery 處理器）。',
      },
      {
        q: 'XPath 係咩？點樣用佢？',
        a: 'XPath 係一種由 XML 文件揀選節點嘅查詢語言。可以將佢想像成 XML 嘅 SQL，或者 XML 樹嘅 CSS 選擇器。基本 XPath 表達式：/catalog/book（直接喺 catalog 下面嘅所有 book 元素）、//book（任何位置嘅 book 元素）、/catalog/book[1]（第一個 book）、/catalog/book[@category="fiction"]（category 屬性等如 "fiction" 嘅 book 元素）、/catalog/book[price&gt;30]/title（price 子元素大過 30 嘅 book 嘅 title 元素）。我哋嘅 XPath 評估器支援 XPath 1.0 同即時 highlight 匹配嘅節點。',
      },
      {
        q: '點解 JSON available 嗰陣仲用 XML？',
        a: 'XML 喺需要佢獨特功能嘅領域度持續存在：(1) 用 XSD 嘅正式 schema 驗證 — 對資料完整性至關重要嘅金融、法律同醫療資料交換好關鍵；(2) 命名空間 — 喺一個文件度組合多個 XML 詞彙表嗰陣必不可少；(3) 混合內容 — 用內聯標記表示文字（例如 "the &lt;em&gt;quick&lt;/em&gt; brown fox"），JSON 冇辦法原生表示；(4) 成熟嘅工具生態系統 — XSLT 做轉換、XPath 做查詢、XSD 做驗證、XQuery 做 XML 集合嘅類資料庫操作。',
      },
      {
        q: '點樣 debug SOAP API response？',
        a: '將原始 SOAP XML 回應貼落我哋嘅格式化器度。工具會偵測 SOAP 信封、展開命名空間前綴提高可讀性，同 highlight Body 內容。如果回應係 SOAP 故障，&lt;soapenv:Fault&gt; 元素會用紅色標記，顯示 faultcode（例如 soapenv:Client 表示錯誤嘅請求、soapenv:Server 表示伺服器端錯誤）同 faultstring（人類睇得明嘅錯誤描述）。檢查 faultactor 元素嚟識別係邊個 SOAP 中間節點產生咗個故障。',
      },
    ],
    conclusion:
      'XML 推動緊企業世界 — 由 SOAP API 到文件格式再到組態管理。我哋嘅免費格式化器令 XML 變得易讀、根據 schema 驗證佢，同埋俾你用 XPath 查詢佢 — 全部喺你個瀏覽器度，完全私密。貼你個 XML 落嚟，睇住佢變身成乾淨、可以導覽嘅結構。',
  },

  // ========== 10. YAML 格式化器 ==========
  'how-to-use-yaml-formatter': {
    title: 'YAML 格式化器：網上格式化、驗證同美化 YAML',
    metaTitle: 'YAML 格式化器 – 免費網上格式化同驗證 YAML',
    metaDescription:
      '網上格式化、驗證同美化 YAML。偵測 tab 同空格嘅錯誤、驗證巢狀，同支援 YAML 1.2。包埋 Kubernetes 同 Docker Compose。',
    keywords: [
      'yaml 格式化器',
      '網上格式化 yaml',
      'yaml 驗證器',
      'yaml 美化器',
      'yaml pretty print',
      'yaml 檢查器',
      'kubernetes yaml 格式化器',
      'docker compose 格式化器',
      'yaml lint',
    ],
    intro:
      'YAML（YAML 唔係標記語言）已經成為雲端原生生態系統嘅首選組態格式 — Kubernetes manifests、Docker Compose files、Ansible playbooks、GitHub Actions workflows 同 CI/CD pipelines 全部都係用 YAML 寫。佢嘅人性化語法（冇括號、簡單字串唔使引號、容許註解）令佢比 JSON 更易讀，但佢依賴縮排嚟定義結構就令佢特別容易出錯。喺應該用兩個空格嘅地方出現一個 tab 字元，或者一個喺錯巢狀層級嘅對唔齊 key，可以沉默咁改變成個組態嘅語義 — 或者喺第 47 行出一個神秘嘅解析錯誤，但問題實際上發生喺第 12 行。我哋嘅 YAML 格式化器用一致嘅 2 空格縮排美化亂晒嘅 YAML、用精確嘅錯誤位置同簡單易明嘅解釋驗證語法，同埋雙向轉換 YAML 同 JSON。佢偵測常見陷阱 — 用 tab 做縮排（YAML 禁止 tab）、同一文件內唔一致嘅縮排、重複 key（YAML 會沉默覆蓋）同挪威問題（冇引號嘅國家代碼如 \'NO\' 被解讀做布林值 false）。工具處理多文件 YAML 檔案（由 --- 分隔）同支援 YAML 1.2 規範，包括錨點、別名、標籤同多行字串風格。所有處理都喺你個瀏覽器度執行 — 你嘅 Kubernetes secrets、deployment configs 同 CI/CD credentials 永遠唔會離開你部機。',
    steps: [
      {
        heading: '貼上、輸入或上傳 YAML',
        body: '貼你嘅 YAML 落編輯器度或上傳 .yaml / .yml 檔案。編輯器包含標量、key、序列同錨點嘅語法 highlight。多文件 YAML（由三個連字號 --- 分隔嘅文件）會被偵測到，每個文件獨立格式化。工具甚至處理嵌入喺字串欄位嘅 YAML（例如 CloudFormation 範本），透過提取同格式化嵌入嘅 YAML。',
      },
      {
        heading: '格式化同 Validate',
        body: 'Click「格式化」用一致嘅 2 空格縮排、適當嘅引號（喺需要嗰陣幫模糊值加引號）同正規化嘅錨點/別名引用嚟美化 YAML。驗證器會自動執行同標記：tab 字元（確切行同欄）、唔一致嘅縮排、重複嘅映射 key 同埋可能因為 YAML 隱含類型強制而被錯誤解讀嘅值。每個錯誤都會連結到編輯器位置同提供修復建議。',
      },
      {
        heading: 'Convert to JSON 或 Download',
        body: '用「轉換做 JSON」按鈕由你嘅 YAML 產生等效 JSON — 啱晒某啲工具或 API 要求 JSON 輸入但你鍾意用 YAML 寫組態嗰陣。反向（「由 JSON 轉換」）都可以用。將格式化咗嘅 YAML 下載做 .yaml 檔案、複製去剪貼簿，或者將解析咗嘅資料結構以互動式樹狀檢視。',
      },
    ],
    tips: [
      'YAML 1.2（2009）解決咗最臭名昭著嘅 YAML 陷阱：喺 YAML 1.1 度，冇引號嘅 "yes"、"no"、"on"、"off"、"true" 同 "false" 會被解讀做布林值。國家代碼如 "NO"（挪威）同 "YES" 會變成布林值 false 同 true — 呢個 bug 普遍到俾人叫做「挪威問題」。YAML 1.2 只認 "true" 同 "false"（唔分大小寫）做布林值。我哋嘅格式化器偵測模糊值同建議幫佢哋加引號。',
      'YAML 縮排嘅黃金法則：每個巢狀層級用 2 個空格，永遠唔好用 tab。YAML 1.2 明確禁止用 tab 字元做縮排（tab 冇縮排值 — 佢哋喺解析器嘅欄位計數器度顯示做 0）。如果你由某啲將空格轉換做 tab 嘅來源（某啲聊天應用程式、網頁表單或者 PDF）複製 YAML，驗證器會標記每個 tab 同佢嘅確切位置。',
      'YAML 錨點（&）同別名（*）俾你定義一次值然後喺同一文件度多次引用佢。例如：`defaults: &defaults timeout: 30 retries: 3` 定義一個錨點，然後 `service_a: <<: *defaults` 將嗰啲預設值合併到 service_a 度。呢個喺 Docker Compose 度廣泛用嚟跨服務共享公共組態，同埋喺 Kubernetes 度用嚟減少大型 manifests 嘅重複。',
      'YAML 入面嘅多行字串有兩種風格：字面區塊純量（|），保留換行 — 用喺 shell scripts、SQL 查詢或者任何換行好重要嘅內容；同摺疊區塊純量（>），將換行摺疊做空格（好似 HTML 咁）— 用喺長段落、描述或者需要重新排文嘅文字。可以用 |-（拎走尾隨換行）或 |+（保留尾隨換行，包埋額外嗰啲）覆蓋預設嘅尾隨換行行為。',
      'YAML 對註解（# 註解）嘅支援係佢比起 JSON 喺組態檔案方面最大嘅優勢。註解俾你記錄點解揀某個值、連結去 Jira 飛仔、標記 TODO 同解釋唔明顯嘅設定 — 全部都唔會破壞解析器。JSON 同 JSON5 嘅變通方法（例如 "__comment": "explanation"）係 hack；喺 YAML 度，註解係一等公民。',
      'YAML 合併鍵（<<）係一個特殊嘅映射鍵，將一個映射嘅鍵合併到另一個映射度。佢係 YAML 1.1 規範嘅一部分，廣泛支援但唔喺 YAML 1.2 核心度。Docker Compose 大量使用合併鍵配錨點嚟定義服務範本。不過，合併鍵喺巢狀映射度有已知嘅邊緣情況 — 要明確深層合併同淺層合併嘅期望。',
      '喺部署之前喺 CI/CD 度驗證 YAML 檔案。一個喺本機測試通過但喺 CI 失敗嘅格式錯誤 YAML 會浪費開發者時間。喺你嘅管線度加 YAML lint 步驟：`yamllint .` 或 `python -c "import yaml; yaml.safe_load(open(\'config.yaml\'))"`。我哋嘅網上驗證器而家同 GitHub Actions 整合 — 喺你個 repo 度加個徽章顯示你 YAML 組態嘅驗證狀態。',
      '當除錯 Kubernetes pods 啟動失敗出神秘嘅「error converting YAML to JSON」嗰陣，問題差唔多永遠係你個 manifest 度嘅 YAML 格式錯誤。我哋嘅格式化器捉到縮排錯誤、重複 key（喺 YAML 度最後一個值沉默勝出 — 係設定被神秘忽略嘅常見原因）同埋放喺錯巢狀層級嘅欄位。格式化你個 manifest，然後用 kubectl 重新套用。',
    ],
    faqs: [
      {
        q: 'YAML 1.1 同 YAML 1.2 有咩分別？',
        a: 'YAML 1.2（2009 年發布）係現行規範，對 YAML 1.1 做咗兩個關鍵變更：(1) 佢將 YAML 同 JSON 對齊做子集 — 任何有效嘅 JSON 文件都係有效嘅 YAML 1.2 文件（喺 YAML 1.1 度，JSON 係子集但有一啲邊緣情況唔相容）；(2) 佢移除咗模糊嘅布林值 — 喺 YAML 1.2 度，只有 "true" 同 "false"（唔分大小寫）係布林值，而 YAML 1.1 仲將 "yes"、"no"、"on"、"off" 當做布林值。大部分工具（Kubernetes、Ansible、Docker Compose）使用同 YAML 1.1 相容嘅解析器，有更廣泛嘅布林值集合。',
      },
      {
        q: '點解 YAML 要求用空格而唔係 tab？',
        a: 'YAML 用縮排嚟確定結構 — 同 JSON 嘅明確括號唔同，YAML 由前置空格嘅數量推斷巢狀。因為 tab 字元有可變嘅顯示寬度（tab 根據編輯器設定可能顯示做 2、4 或 8 個空格），但對解析器嚟講係一個字元，佢哋會造成歧義 — 一個 tab 應該代表一個縮排層級定係幾個？為咗避免呢個歧義，YAML 規範簡單咁禁止用 tab 做縮排。Tab 喺引號字串值入面係容許嘅，但永遠唔可以用嚟做結構化。',
      },
      {
        q: '點樣修復「mapping values are not allowed here」錯誤？',
        a: '呢個係 YAML 最常見嘅錯誤訊息，差唔多永遠意味住你有縮排錯誤。一個映射值（key: value 入面冒號後面嗰部分）放咗喺錯嘅縮排層級，或者冒號後面漏咗空格。YAML 要求映射入面冒號後面啱啱好一個空格 — "key:value" 係字串，唔係映射。我哋嘅驗證器標記確切嗰行，附帶顯示嗰個巢狀層級正確縮排嘅修復建議。',
      },
      {
        q: 'YAML 係咪做到晒 JSON 做到嘅所有嘢？',
        a: 'YAML 係 JSON 嘅超集（喺 YAML 1.2 度）。你可以喺 JSON 度表達嘅任何嘢，都可以喺 YAML 度表達 — 加埋註解、錨點同別名、多行字串、透過標籤嘅明確資料類型同更易讀嘅冇括號語法。取捨係解析器複雜度：YAML 解析器比 JSON 解析器更大、更慢同有更多邊緣情況。對於機器對機器通訊（API），JSON 通常更好因為佢更簡單、更快同普遍支援。對於人類維護嘅組態，YAML 通常更好因為佢更易讀同支援註解。',
      },
      {
        q: 'YAML tags 係咩？幾時需要佢哋？',
        a: 'YAML 標籤（!!str、!!int、!!float、!!null、!!timestamp 等）明確指定一個值嘅資料類型，覆蓋 YAML 嘅自動類型推斷。例如，!!str 123 強制將數字當做字串 "123" 而唔係整數 123。實踐上好少需要標籤，因為 YAML 嘅類型推斷正確處理到常見情況，但喺以下情況有用：(1) 強制將值做字串，當佢可能被錯誤解讀嗰陣（例如版本號如 1.10 被解析做浮點數 1.1）；(2) 喺擴展 YAML 嘅框架度用自訂類型。',
      },
      {
        q: '點樣驗證大型 Kubernetes 或 Docker Compose YAML 檔案？',
        a: '將你嘅 manifest 貼落我哋嘅格式化器做即時語法驗證。對於語義驗證（檢查你個 Kubernetes manifest 用緊有效嘅 API 版本、必需欄位係咪存在同選擇器係咪匹配標籤），將我哋嘅格式化器配合：`kubectl apply --dry-run=client -f manifest.yaml`（Kubernetes）或 `docker compose config`（Docker Compose），兩者都喺唔實際部署嘅情況下驗證結構。我哋嘅驗證器喺嗰啲工具見到個檔案之前就捉到語法錯誤、重複 key 同縮排問題。',
      },
    ],
    conclusion:
      'YAML 嘅可讀性係有代價嘅 — 一個縮排錯誤就可以破壞成個部署。我哋嘅格式化器同驗證器即刻捉到呢啲錯誤，提供人類睇得明嘅錯誤訊息同確切行號。無論你係寫緊 Kubernetes manifests、Docker Compose files 定係 CI/CD pipelines，喺你個瀏覽器度免費格式化同驗證你嘅 YAML。',
  },

  // ========== 11. Markdown 格式化器 ==========
  'how-to-use-markdown-formatter': {
    title: 'Markdown 格式化器：網上格式化、Preview 同美化 Markdown',
    metaTitle: 'Markdown 格式化器 – 免費網上 Preview 同格式化 Markdown',
    metaDescription:
      '網上格式化同預覽 Markdown，提供即時渲染。支援 CommonMark、GFM（表格、任務清單、刪除線）、語法 highlight 同 Mermaid 圖表。',
    keywords: [
      'markdown 格式化器',
      '網上 markdown preview',
      'markdown editor',
      'markdown 美化器',
      'github markdown',
      'readme 格式化器',
      'commonmark 格式化器',
      'gfm markdown',
      'markdown 格式化工具',
    ],
    intro:
      'Markdown 係開發者文件嘅通用語言 — 每個 README、GitHub issue、Stack Overflow 答案同靜態網站 blog 文章都用佢寫。John Gruber 喺 2004 年創造咗 Markdown，目標好簡單：一種純文字格式，可以原樣閱讀但又可以轉換做結構有效嘅 HTML。二十年後，Markdown 分裂成多種風格（CommonMark、GitHub Flavored Markdown、MDX、R Markdown），各有唔同嘅擴展，而寫有巢狀清單、清單入面嘅程式碼區塊同表格嘅複雜 Markdown 出奇咁麻煩。我哋嘅 Markdown 格式化器解決咗呢個問題：一個分屏編輯器，左邊係原始 Markdown，右邊係即時渲染嘅預覽。格式化器將你嘅 Markdown 規範化做一致嘅格式 — 標準化標題風格、清單縮排、程式碼圍欄標記同連結參考定義。佢支援 CommonMark 規範（解決咗原始 Markdown 語法模糊性嘅正式標準）加埋 GitHub Flavored Markdown 擴展（表格、任務清單、刪除線、自動連結同註腳）。佢仲會渲染嵌入喺程式碼圍欄嘅 Mermaid 圖表（流程圖、序列圖、類別圖、甘特圖）— 將你嘅文件變成豐富嘅視覺內容。對於靜態網站產生器嘅用家（Jekyll、Hugo、Next.js with MDX、Astro、Docusaurus），格式化器包含 frontmatter（YAML/TOML）驗證同喺格式化期間保持佢原封不動。',
    steps: [
      {
        heading: '喺編輯器度寫或貼上 Markdown',
        body: '左面板係一個功能齊全嘅 Markdown 編輯器，有標題、粗體、斜體、連結、程式碼同清單嘅語法 highlight。由 README、GitHub issue 或 CMS 匯出貼上現有嘅 Markdown — 格式化器自動偵測 Markdown 風格同保留擴展。編輯器包含工具列用嚟插入常見元素（表格、圖片、連結、程式碼區塊），如果你唔想記確切語法嘅話。',
      },
      {
        heading: '即時預覽同格式化',
        body: '右面板喺你打字嗰陣渲染即時預覽 — 預覽喺你最後一次按鍵 50 毫秒內更新。用預覽嚟視覺驗證格式、檢查連結目標同確保程式碼區塊有正確嘅語言標籤做語法 highlight。Click「格式化」去標準化原始 Markdown：正規化標題風格、修復唔一致嘅清單縮排、對齊表格欄位同盡可能將內聯 HTML 轉換做 Markdown。',
      },
      {
        heading: '複製、下載或匯出做 HTML',
        body: '複製格式化咗嘅 Markdown、下載做 .md 檔案，或者將渲染咗嘅輸出匯出做獨立嘅 HTML 檔案，包埋嵌入式 CSS（匹配 GitHub 嘅渲染風格）。HTML 匯出包晒成個渲染咗嘅文件，隨時可以貼落 CMS 或電郵度。對於靜態網站設定，匯出做同 MDX 相容嘅 Markdown 同保留 frontmatter。',
      },
    ],
    tips: [
      'CommonMark（2014）係正式嘅 Markdown 規範，解決咗超過 15 年嘅模糊性。關鍵澄清：清單前要有一個空行；縮排程式碼區塊係 4 個空格（唔係 4 個字元）；setext 標題（用 === 或 --- 加底線）前面要有一個空行；反斜線跳脫嘅換行係硬換行。每個主要嘅 Markdown 處理器（GitHub、Reddit、Stack Overflow、Discord）都同 CommonMark 對齊。',
      'GitHub Flavored Markdown（GFM）擴展咗 CommonMark，加咗：(1) 表格 — 用 pipe 同連字號建立，可選冒號對齊；(2) 任務清單 — 用 - [ ]（未勾選）同 - [x]（已勾選）嘅 checkbox；(3) 刪除線 — 用 ~~雙波浪線~~；(4) 自動連結 — 原始 URL 自動轉換做可點擊連結，唔使尖括號；(5) 註腳 — 用 [^1] 語法嘅參考式註解；(6)「禁止嘅原始 HTML」過濾器，為咗安全性拎走危險標籤同屬性。',
      '程式碼區塊應該永遠包埋語言識別碼做語法 highlight：```javascript、```python、```bash、```yaml。冇語言標籤嘅話，程式碼會冇 highlight 咁渲染，更難閱讀。大部分語法 highlight 器（Prism、highlight.js、Shiki）支援超過 200 種語言。三重反引號圍欄（```）比縮排程式碼區塊更受歡迎，因為佢哋支援語言標籤同視覺上更清晰。',
      'Markdown 入面嘅表格用 pipe 同連字號定義。標題列同內文之間由一行連字號分隔，可選冒號做對齊：靠左 (:---)、置中 (:---:)、靠右 (---:)。儲存格內容可以包埋內聯 Markdown（粗體、斜體、連結、程式碼），但唔可以包區塊元素（標題、程式碼區塊、清單）。對於複雜表格，考慮使用 HTML &lt;table&gt; 元素，喺大部分 Markdown 風格度都係有效嘅。',
      '對於 README.md 檔案，遵循標準結構：(1) 專案標題同一行描述；(2) 徽章（建置狀態、npm 版本、授權）；(3) 目錄（用 doctoc 或 markdown-toc 等工具自動產生）；(4) 安裝（可複製貼上嘅指令）；(5) 用法（有真實場景嘅程式碼示例）；(6) API 參考；(7) 貢獻指南連結；(8) 授權。根據 GitHub 2023 年開源調查，結構良好嘅 README 可以將專案採用率提高 40%。',
      'Markdown 程式碼圍欄入面嘅 Mermaid 圖表俾你直接喺文件度建立流程圖、序列圖、類別圖、狀態圖、甘特圖、圓形圖同 Git 圖 — 唔使由外部繪圖工具匯出圖片。用 ```mermaid 做語言標籤。我哋嘅格式化器喺預覽面板度即時渲染 Mermaid 圖表，將抽象嘅圖表定義變成視覺輸出。',
      '為靜態網站產生器（Jekyll、Hugo、Next.js、Astro、Docusaurus）寫 Markdown 嗰陣，檔案以 frontmatter 開始 — 喺 --- 分隔符之間嘅 YAML（或者喺 +++ 分隔符之間嘅 TOML），包含標題、日期、標籤同 slug 等元資料。我哋嘅格式化器驗證 frontmatter 係咪格式良好嘅 YAML/TOML、喺格式化期間保持佢原封不動同喺缺少必要欄位（因 SSG 而異）嗰陣發出警告。',
      'Markdown 連結參考風格 — 將 URL 同內聯文字分開定義 — 提高長文件嘅可讀性：`[連結文字][ref]` 喺內文度，然後 `[ref]: https://example.com` 喺底部。格式化器可以一 click 將內聯連結轉換做參考風格（或者相反），同自動重新編號參考定義以匹配佢哋出現嘅順序。',
    ],
    faqs: [
      {
        q: 'CommonMark 同 GitHub Flavored Markdown 有咩分別？',
        a: 'CommonMark 係正式規範，明確咁定義咗核心 Markdown 語法 — 段落、標題、清單、程式碼區塊、強調、連結、圖片同引用區塊。GitHub Flavored Markdown（GFM）係 CommonMark 嘅超集，加咗表格、任務清單、刪除線、自動連結同註腳。GFM 仲對原始 HTML 套用更嚴格嘅規則（過濾危險標籤如 &lt;script&gt;）同修改咗某啲區塊元素入面換行嘅處理方式。唔肯定嗰陣，寫同 CommonMark 相容嘅 Markdown — 佢喺任何地方都可以正確渲染。',
      },
      {
        q: '我可唔可以喺 Markdown 入面用 HTML？',
        a: '可以，喺大部分風格度都得。CommonMark 容許原始 HTML — 你可以直接喺 Markdown 度寫 &lt;div&gt;、&lt;span&gt;、&lt;details&gt;/&lt;summary&gt; 甚至 &lt;style&gt; 標籤，佢哋會被傳遞到 HTML 輸出。不過，某啲平台為咗安全性限制原始 HTML：GitHub 拎走大部分 HTML 標籤，除咗安全白名單（div、span、details、summary、a、img 同幾個其他）。我哋嘅格式化器喺偵測到可能被常見平台拎走嘅 HTML 標籤嗰陣會發出警告。',
      },
      {
        q: '點樣喺 Markdown 度建立巢狀清單？',
        a: '將巢狀清單項目相對於父項目縮排 2 或 4 個空格。對於無序巢狀清單，使用一致嘅縮排 — 喺同一份文件度混合 2 空格同 4 空格縮排，喺 CommonMark 度技術上有效但視覺上唔一致。對於有序巢狀清單，父清單嘅編號唔會影響巢狀清單嘅編號。我哋嘅格式化器將巢狀清單縮排規範化做每個層級一致嘅 2 個空格。',
      },
      {
        q: '點樣喺 Markdown 度加圖片？',
        a: '用語法 ![替代文字](圖片-url "可選標題")。替代文字對無障礙好關鍵 — 佢向螢幕閱讀器用家描述圖片。對於儲存庫入面嘅本地圖片，用相對路徑：![螢幕截圖](./images/screenshot.png)。對於需要控制大細嘅圖片，用原始 HTML：&lt;img src="url" width="400" alt="描述"&gt;。格式化器驗證圖片路徑同喺引用嘅本地檔案喺預期路徑唔存在嗰陣發出警告。',
      },
      {
        q: 'MDX 係咩？同普通 Markdown 有咩唔同？',
        a: 'MDX 用 JSX 擴展咗 Markdown — 你可以直接喺 Markdown 檔案入面 import 同嵌入 React/Vue/Svelte 元件。例如，`import Chart from \'./Chart\'` 然後 `<Chart data={myData} />` 喺你份文件度嵌入一個互動式圖表。MDX 被 Next.js、Docusaurus、Astro 同 Storybook 使用。同普通 Markdown 唔同，MDX 內容必須編譯（唔止係渲染）同需要建置步驟。我哋嘅格式化器喺格式化期間保留 MDX imports 同 JSX 元件。',
      },
      {
        q: '點樣格式化 Markdown 以獲得最大相容性？',
        a: '按照 CommonMark 規範寫 — 除非你知道目標平台支援，否則避免只用 GFM 嘅擴展。永遠喺標題、清單同程式碼區塊前後放一個空行。用 ATX 標題（#）而唔係 setext 標題（===、---）— 佢哋更清晰同支援全部六個層級。對於有好多連結嘅文件用參考式連結。永遠喺程式碼圍欄度指定語言標籤。盡可能避免用原始 HTML。用我哋嘅「相容性檢查」功能針對多個平台驗證你嘅 Markdown。',
      },
    ],
    conclusion:
      'Markdown 將純文字變成結構精美嘅文件 — 但前提係格式正確。我哋嘅即時預覽編輯器準確顯示你嘅 Markdown 會點樣渲染，而格式化器保持你嘅語法乾淨同一致。即刻寫、預覽同格式化你嘅 Markdown — 唔使註冊，全部喺你個瀏覽器度。',
  },

  // ========== 12. 字數計數器 ==========
  'how-to-use-word-counter': {
    title: '網上字數計數器：數字數、字元、句子同閱讀時間',
    metaTitle: '字數計數器 – 免費網上數字數同字元數',
    metaDescription:
      '數字數、字元數（包/唔包空格）、句子、段落同估算閱讀時間。包埋關鍵詞密度分析同 SEO meta 描述檢查。',
    keywords: [
      '網上字數計數器',
      '數字數 字元數',
      '字數工具',
      '字元計數器',
      '閱讀時間計算器',
      '字詞頻率計數器',
      '文章字數計數',
      'seo 字數計數',
      '關鍵詞密度檢查器',
      '文字統計',
    ],
    intro:
      '字數統計睇落好簡單 — 直到你要為文章、blog 文章、meta 描述或者推文達到精確嘅目標。唔同平台用唔同方式數字數：Microsoft Word 用專有演算法，以特定方式處理標點同空白字元；Google Docs 數字數類似但喺 CJK（中文/日文/韓文）字元處理方面有細微分別；程式語言分詞器喺同人類可讀詞語唔對齊嘅邊界上分割。我哋嘅字數計數器用 Unicode 文字分割標準（UAX #29）為拉丁文字語言同 CJK 文字（「詞語」定義冇咁明確）提供明確、透明嘅計數。除咗基本計數之外，呢個工具仲計算閱讀時間（用英文散文每分鐘 238 字同技術內容每分鐘 200 字嘅既定平均值）、估算演講時間（簡報每分鐘 130 字）、分析關鍵詞密度、測量句子同段落分佈，同標記超出特定平台字元限制嘅部分 — Twitter（280 字元）、meta 描述（SEO 用 150-160 字元）同 SMS 分段（160 字元）。所有處理都喺你個瀏覽器度進行；你嘅文字永遠唔會被上傳。',
    steps: [
      {
        heading: '貼上、輸入或上傳你嘅文字',
        body: '直接貼上文字、喺編輯器度輸入，或者上傳 .txt、.docx 或 .md 檔案。計數器即時運作 — 字數同字元數喺你打字嗰陣更新。編輯器喺底部狀態列顯示即時字數，統計面板每 200 毫秒更新一次，對長文件做防抖處理以提高效能。',
      },
      {
        heading: '檢視詳細統計資料',
        body: '統計面板顯示：總字數、字元數（包空格）、字元數（唔包空格）、句子數、段落數、平均字詞長度（以字元計）、平均句子長度（以字詞計）、估算閱讀時間（以分鐘同秒計）、估算演講時間同 Flesch-Kincaid 閱讀易度分數。對於多語言文字，工具會自動偵測主要語言同相應調整字數計算方法。',
      },
      {
        heading: '使用 SEO 同平台專屬檢查',
        body: 'SEO 分頁將你嘅文字同常見內容限制對比：meta 描述長度（120-155 字元顯示綠色、155-160 黃色、超過 160 紅色）、標題標籤長度（50-60 字元最佳）同關鍵詞密度（以總字數百分比衡量，主要關鍵詞推薦範圍 1-3%）。平台分頁顯示 Twitter、SMS、LinkedIn 同 Instagram 標題嘅字元計數。',
      },
    ],
    tips: [
      '成年人閱讀英文散文嘅平均速度係每分鐘 238 個字（wpm），基於 Brysbaert（2019）對 190 項研究嘅薈萃分析。對於包埋術語、公式同複雜句子嘅技術或學術內容，用 200 wpm。對於輕量內容（社交媒體、短 blog 文章），用 260 wpm。我哋嘅閱讀時間估算器根據文字複雜度分析套用適當嘅速率。',
      'SEO meta 描述應該喺 150-160 個字元之間（包空格）。Google 通常喺桌面端約 920 像素同手機端約 680 像素處截斷 meta 描述，大致對應 155-160 個字元。寫你嘅 meta 描述要喺完整嘅 155 個字元內有吸引力，但要將最重要嘅資訊放喺頭 120 個字元，嗰度最顯眼。',
      '關鍵詞密度係文字入面匹配目標關鍵詞嘅字詞百分比。1-2% 嘅密度被認為係自然嘅 — 對於一篇 1,000 字嘅文章，你嘅主要關鍵詞應該出現 10-20 次，包括喺標題、第一段、最少一個標題同結論度。更高嘅密度（3%+）有被搜尋引擎標記為關鍵詞堆砌嘅風險。我哋嘅關鍵詞密度分析器顯示每個關鍵詞嘅計數、百分比同比較密度嘅視覺條形圖。',
      'Flesch-Kincaid 閱讀易度公式（1948 年，仍然廣泛使用）以 0-100 分制評分文字：90-100 = 小五程度（非常容易）、60-70 = 中二三程度（通俗英文，適合一般受眾）、30-50 = 大學程度、0-30 = 研究生程度（非常困難）。公式使用平均句子長度同平均每詞音節數。大部分網頁內容應該瞄準 60-80 嘅分數 — 對廣泛受眾易於理解而唔會顯得居高臨下。',
      '句子長度直接影響可讀性。網頁內容嘅理想平均句子長度係 15-20 個字詞。超過 25 個字詞嘅句子開始流失讀者；超過 35 個字詞嘅句子應該拆開或重寫。我哋嘅句子統計顯示分佈：短句子（<10 字詞）、中等句子（10-25 字詞）同長句子（>25 字詞）嘅數量，加埋文字入面最長嘅句子供審閱。',
      '對於 CJK 文字（中文、日文、韓文），字數計算方式唔同。中文文字喺字詞之間冇空格，所以字詞邊界係模糊嘅。日文混合使用漢字同假名而冇一致嘅間距。韓文喺諺文字元內使用空格分隔字詞（同英文類似）。我哋嘅計數器對中文同日文使用字元計數作為主要指標（因為每個字元大致對應一個語義單元），對韓文使用空格分隔嘅字詞計數。',
      '段落長度影響可掃描性。網頁內容嘅理想段落係 2-4 句（40-80 字詞）。單句段落啱用於強調同過渡。超過 150 字詞嘅段落會變成手機用家會跳過嘅「文字牆」。我哋嘅計數器對段落做顏色編碼：綠色（80 字詞以下）、黃色（80-150 字詞）、紅色（150 字詞以上），幫你識別同拆開長段落。',
      '對於 Twitter/X 帖子，字元限制係 280（非高級用家；截至 2024 年，X Premium 容許 25,000 字元）。URL 無論實際長度幾多都被計為 23 個字元（Twitter 嘅 t.co 連結包裝器）。我哋嘅平台檢查器根據每個平台嘅特定規則計算字元數，而唔止係原始字串長度。',
    ],
    faqs: [
      {
        q: 'Words 係點樣數㗎？',
        a: '對於拉丁文字語言（英文、西班牙文、法文等），字詞由空白字元（空格、tab、換行）分隔，標點符號被拎走。字母、數字序列同帶連字號嘅複合詞（例如 "state-of-the-art"）被計為單一字詞。對於 CJK 語言（中文、日文），字元被計為個別單元，因為字詞邊界冇用空格標記。Unicode 文字分割標準（UAX #29）引導我哋對使用空格嘅文字做字詞邊界偵測。',
      },
      {
        q: '閱讀時間係點樣計算㗎？',
        a: '閱讀時間 = 總字數除以閱讀速度。我哋對一般英文散文用每分鐘 238 個字詞（基於 Brysbaert 2019 年薈萃分析）、對技術/學術內容用 200 wpm（透過術語密度同句子複雜度偵測）、對輕量內容用 260 wpm（短句子、低閱讀等級）。公式對 10 分鐘以下嘅時間向上取整到最近 30 秒，對更長嘅時間向上取整到最近嘅分鐘。',
      },
      {
        q: 'Blog 文章嘅理想字數係幾多？',
        a: '對於 SEO 驅動嘅 blog 文章，最佳區間係 1,500-2,500 字 — 夠長深入涵蓋一個主題、滿足搜尋意圖同賺取反向連結，但又唔會長到讀者放棄閱讀。HubSpot 研究（2023 年）發現，2,100-2,400 字嘅文章平均產生最多嘅自然流量。不過，質量比數量更重要 — 一篇完全回答查詢嘅 1,200 字文章表現會好過一篇用填充物充數嘅 3,000 字文章。',
      },
      {
        q: '關鍵詞密度分析點樣運作？',
        a: '分析器將文字分詞做字詞、移除停用詞（the、a、an、is 等 — 可喺設定度配置）同計算每個剩低字詞嘅頻率。單詞關鍵詞直接計算；多詞短語（二元組、三元組）透過喺文字上滑動 N 個字詞嘅視窗嚟計算。密度計算為（關鍵詞出現次數 / 總字數）x 100%。推薦嘅 1-2% 密度意味住你嘅主要關鍵詞應該大約每 100 個字詞出現一到兩次。',
      },
      {
        q: '字數計數器可唔可以離線用？',
        a: '可以。一旦頁面載入，所有字數計算邏輯都喺你個瀏覽器度用 JavaScript 執行。文字分析期間唔會進行伺服器呼叫。即係話呢個工具冇互聯網連接都可以運作，你嘅文字內容永遠唔會離開你嘅設備 — 對於喺敏感文件、未發表手稿或專有商業內容度數字數嗰陣嘅保密性好重要。',
      },
      {
        q: '點樣數 PDF 或圖片入面嘅字數？',
        a: '對於 PDF，由 PDF 複製文字然後貼落字數計數器度（或者先用我哋嘅 PDF 工具提取文字）。對於包埋文字嘅圖片，先用 OCR（光學字元辨識）軟件 — 我哋嘅字數計數器唔執行 OCR。免費 OCR 選項包括 Google Docs（檔案 > 開啟 > 上傳圖片，然後檔案 > 另存為 Google Docs）、Microsoft OneNote（右鍵點擊圖片 > 從圖片複製文字）或者網上 OCR 服務。',
      },
    ],
    conclusion:
      '字數好重要 — 對於 SEO 排名、可讀性、平台合規同達到編輯目標。我哋嘅字數計數器為你提供精確、透明嘅計數，同埋關於閱讀時間、關鍵詞密度同可讀性分數嘅可行洞見。貼你嘅文字落嚟，喺幾秒內獲得完整嘅統計分解。',
  },

  // ========== 13. QR 碼產生器 ==========
  'how-to-use-qr-code': {
    title: 'QR 碼產生器：幫 URLs、WiFi、vCard 同更多建立 QR 碼（免費網上）',
    metaTitle: 'QR 碼產生器 – 免費網上建立 QR 碼',
    metaDescription:
      '免費網上產生自訂 QR 碼。支援 URL、文字、WiFi、vCard、電郵、SMS、地理位置、日曆同加密貨幣錢包。',
    keywords: [
      'qr 碼產生器',
      '免費產生 qr 碼',
      'qr 碼製作器',
      '建立 qr 碼',
      'wifi qr 碼',
      'vcard qr 碼',
      '動態 qr 碼',
      '自訂 qr 碼',
      '帶 logo 嘅 qr 碼',
      '免費 qr 碼產生器',
    ],
    intro:
      'QR 碼連接咗物理世界同數位世界 — 相機一掃就將印刷嘅方格變成網站訪問、WiFi 連接、儲存落手機嘅聯絡人或者處理咗嘅付款。每個餐廳 menu、產品標籤、活動門飛同埋行銷傳單都用緊佢哋。我哋嘅 QR 碼產生器喺你個瀏覽器度直接為全部十種標準資料類型 — URL、純文字、WiFi 網絡憑證、vCard 聯絡卡、電郵訊息、SMS 訊息、地理座標、日曆事件、電話號碼同加密貨幣錢包地址 — 建立生產品質嘅 QR 碼。同好多「免費」QR 產生器唔同，後者會幫輸出加水印、限制解析度或者將你嘅 URL 重新導向經過佢哋嘅追蹤伺服器（將你嘅 QR 碼變成佢哋嘅資料收集工具），我哋嘅產生器產生乾淨、冇水印嘅 QR 碼，解析度高達 4096x4096 像素，冇重新導向、冇追蹤。你揀錯誤修正級別（L、M、Q 或 H — 7% 到 30% 恢復率）、自訂顏色（前景同背景）同時保持對比度要求、可選喺中心嵌入 logo（有正確嘅 25% 安靜區清除空間），同埋以 PNG、SVG 或 PDF 格式下載，提供適合印刷嘅 300 DPI。所有 QR 碼都喺你個瀏覽器度本機產生 — 你嘅 URLs、WiFi 密碼同聯絡資料永遠唔會離開你部設備。',
    steps: [
      {
        heading: '揀資料類型同輸入內容',
        body: '由下拉式選單揀你嘅 QR 碼類型：URL、文字、WiFi、vCard/聯絡人、電郵、SMS、地理位置、日曆事件、電話來電或加密貨幣錢包。每種類型顯示專屬表單 — 對於 WiFi，輸入 SSID、密碼同加密類型（WPA/WPA2/WEP/冇）；對於 vCard，填寫姓名、電話、電郵、組織同地址欄位。QR 碼嘅即時預覽喺你打字嗰陣更新，等你可以喺下載前驗證資料係咪正確。',
      },
      {
        heading: '自訂外觀',
        body: '用顏色選擇器設定前景同背景顏色。工具強制執行最低對比度比率（每 WCAG AA 為 4.5:1）同喺你揀嘅顏色太相似而無法可靠掃描嗰陣發出警告。對於 logo 嵌入，上傳 PNG 或 SVG 圖片 — 工具會自動調整大細令佢佔據唔超過 QR 碼中心區域嘅 25%，保持 logo 周圍所需嘅安靜區，等錯誤修正可以補償。喺方形模組（經典）同圓角模組（現代美學）之間揀。',
      },
      {
        heading: '設定錯誤修正同下載',
        body: '揀錯誤修正級別：L（7% 恢復、最大資料、用於數位/螢幕顯示）、M（15% 恢復、標準選擇）、Q（25% 恢復、良好平衡）或 H（30% 恢復、用於印刷/戶外/包裝）。揀輸出大細（256x256 到 4096x4096 像素）同下載格式：PNG（點陣、最啱螢幕同一般用途）、SVG（向量、最啱任何大細嘅印刷、無限縮放）或 PDF（向量、準備好畀專業印刷用，300 DPI 連裁切標記）。',
      },
    ],
    tips: [
      'QR 碼錯誤修正級別：L（低，7%）— 恢復多達 7% 嘅受損碼字；用喺唔預期有物理損壞嘅數位螢幕。M（中，15%）— 大部分產生器嘅預設值，資料容量同耐用性嘅最佳平衡。Q（四分位，25%）— 用喺印刷材料、傳單同產品標籤。H（高，30%）— 用喺戶外標誌、可能會被刮花嘅包裝或者會被部分遮擋嘅碼。更高嘅修正會減少最大資料容量。',
      '喺 QR 碼中心嵌入 logo 嗰陣，logo 唔可以覆蓋超過 QR 碼總面積嘅 25%（大約闊度同高度嘅 30%）。錯誤修正碼字補償咗被遮擋嘅模組。冇足夠嘅錯誤修正容量，個碼會變得掃唔到。嵌入 logo 嗰陣最少用錯誤修正級別 Q（25%）；H（30%）更安全，特別係對於細碼或複雜 logo。',
      '安靜區 — QR 碼周圍嘅白色邊框 — 必須喺四邊最少 4 個模組闊。冇足夠嘅安靜區，掃描器冇辦法將 QR 碼同佢周圍嘅背景（文字、圖片、邊框）區分開。我哋嘅產生器根據 QR 碼版本自動加返正確嘅安靜區。如果你喺後期處理度裁剪安靜區（例如裁剪 PNG），個碼可能會變得掃唔到。',
      '對於印刷，永遠最少以 300 DPI 匯出。打算由 30 厘米（12 吋）距離掃描嘅 QR 碼應最少為 2 厘米 x 2 厘米（0.8 x 0.8 吋）。對於喺廣告牌上由 3 米（10 呎）距離掃描嘅 QR 碼，個碼應最少為 20 厘米 x 20 厘米（8 x 8 吋）。一般規則：掃描距離唔應該超過 QR 碼闊度嘅 10 倍。',
      '靜態 QR 碼直接將資料編碼喺模組度 — 一旦印刷咗，編碼內容冇得改。動態 QR 碼編碼一個短 URL，該 URL 重新導向到你嘅目標 URL，等你可以唔使重新印刷就改個碼指向嘅地方。對於你可能想更新目標嘅印刷行銷材料（傳單、名片、產品包裝），透過 URL 縮短服務用動態 QR 碼。我哋嘅產生器產生靜態 QR 碼；配搭 URL 縮短器實現動態功能。',
      'WiFi QR 碼以以下格式編碼網絡憑證：WIFI:S:&lt;SSID&gt;;T:&lt;WPA|WEP|nopass&gt;;P:&lt;password&gt;;;。當被智能手機相機掃描嗰陣，手機會自動連接到網絡（iOS 11+ 同 Android 10+），用家唔使輸入密碼。呢個係對家居、辦公室、咖啡店同活動最實用嘅 QR 碼 — 印一個同用相框裝裱畀客人用。',
      '顏色自訂：前景（深色）模組必須明顯比背景（淺色）模組深色。掃描器將圖片轉換做灰階同套用閾值 — 如果對比度太低，二值化圖片會失去模組邊界，個碼變得讀唔到。最低對比度比率：4.5:1（WCAG AA）。避免：深色背景上嘅淺色前景（掃描器唔一致咁反轉顏色）、白底紅字（好多掃描器用睇唔到紅色嘅紅色雷射）同低對比度嘅粉彩組合。黑底白字仍然係最可靠嘅組合。',
      '強烈建議印刷用向量格式（SVG、PDF）而非點陣格式（PNG），因為佢哋可以無限縮放而冇像素化。印喺名片上 2 厘米闊嘅 SVG QR 碼，同印喺展會 banner 上 2 米嘅同一個 SVG 都會完全清晰。下載兩種格式：PNG 畀數位用途（嵌入網站、社交媒體、電郵簽名）同 SVG/PDF 畀印刷生產。',
    ],
    faqs: [
      {
        q: '我可以喺 QR 碼度編碼咩資料類型？',
        a: '我哋嘅產生器支援十種資料類型：(1) 網站 URL — 最常見用途，掃描嗰陣開連結；(2) 純文字 — 顯示任何文字訊息；(3) WiFi 網絡 — 自動連接到 WiFi 網絡（SSID + 密碼 + 加密類型）；(4) vCard 聯絡人 — 將聯絡卡儲存到手機（姓名、電話、電郵、組織、地址）；(5) 電郵 — 開啟電郵用戶端，預填收件人、主旨同內文；(6) SMS — 開啟訊息應用程式，預填收件人同訊息；(7) 地理位置 — 喺特定座標（緯度、經度）開啟地圖應用程式；(8) 日曆事件 — 將事件加到日曆（標題、日期/時間、位置、描述）；(9) 電話來電 — 撥打電話號碼；(10) 加密貨幣錢包 — 編碼 Bitcoin、Ethereum 或其他加密貨幣嘅錢包地址。',
      },
      {
        q: '靜態同動態 QR 碼有咩分別？',
        a: '靜態 QR 碼直接將目標資料（URL、文字、WiFi 憑證）編碼到 QR 碼模組度。資料係固定嘅 — 一旦個碼產生同印刷咗，就冇得改。動態 QR 碼編碼一個短 URL，該 URL 重新導向到目標 URL。因為重新導向係伺服器端嘅，你可以唔使重新印刷就改個 QR 碼指向嘅地方。動態碼仲提供掃描分析（幾多次掃描、幾時、嚟自咩設備）。我哋嘅產生器建立靜態 QR 碼；配搭任何 URL 縮短服務（Bitly、Rebrandly、Short.io）建立動態 QR 碼 — 為縮短咗嘅 URL 產生 QR 碼。',
      },
      {
        q: '印刷應該下載咩檔案格式？',
        a: '對於專業印刷，下載 SVG 或 PDF — 兩者都係向量格式，可以無限縮放而冇像素化。向你嘅印刷店指定所需嘅物理尺寸（例如「印 5 厘米 x 5 厘米」或「印 2 吋 x 2 吋」）。對於 DIY 印刷，以 300 DPI 下載 PNG：對於 5 厘米 x 5 厘米（約 2 x 2 吋）嘅 QR 碼，你需要最少 600 x 600 像素嘅 PNG。我哋產生器入面嘅 PNG 下載大細有標明對應常見印刷尺寸嘅 DPI 等價。',
      },
      {
        q: '我可唔可以改 QR 碼嘅顏色？',
        a: '可以。你可以設定自訂前景（模組）同背景顏色。唯一要求係足夠嘅對比度 — 前景必須相對背景夠深色，令掃描器能夠區分模組。我哋嘅顏色選擇器強制執行最低 4.5:1 對比度比率。深色前景顏色（黑色、海軍藍、深綠色、深酒紅色）喺白色或非常淺色背景上效果良好。避免：深色背景上嘅淺色前景（掃描器唔一致咁反轉顏色）、白底紅字（好多掃描器用睇唔到紅色嘅紅色雷射）同低對比度嘅粉彩組合。',
      },
      {
        q: 'QR 碼可以印到幾細？',
        a: '最低可行印刷尺寸取決於 QR 碼版本（模組數量）、掃描距離同掃描器嘅相機解析度。對於版本 5 QR 碼（37x37 模組，URL 嘅典型大細），用現代智能手機相機嘅最低可靠尺寸係 2 厘米 x 2 厘米（0.8 x 0.8 吋）。更細嘅碼（1 厘米或更細）需要非常好嘅相機同穩定嘅手。對於版本 10 及以上，按比例增加最低尺寸。通用公式：印刷尺寸（厘米）>= 掃描距離（厘米）/ 10。',
      },
      {
        q: '加咗 logo 之後個 QR 碼仲用唔用到？',
        a: '用到，如果做得正確嘅話。加 logo 利用咗 QR 碼嘅錯誤修正 — 被覆蓋嘅模組被當做「受損」同由 Reed-Solomon 錯誤修正碼字重建。要求：(1) 對 logo 嵌入用錯誤修正 H（30% 恢復）；(2) logo 必須覆蓋唔超過 QR 碼總面積嘅 25%；(3) 喺 logo 同最近嘅 QR 模組之間留一個小邊距（最少 2 個模組），等掃描器可以清楚咁識別 logo 係同資料模組分開嘅。喺大量印刷之前，用最少三個唔同嘅掃描器應用程式測試 QR 碼。',
      },
    ],
    conclusion:
      '一個產生得好嘅 QR 碼每次都 work — 啱嘅錯誤修正、啱嘅大細、啱嘅格式畀每個工作。我哋嘅免費產生器為每個用例建立生產品質嘅 QR 碼，完全可自訂，冇水印同冇追蹤。即刻產生你嘅 QR 碼 — 唔使 10 秒。',
  },
};

export default content;