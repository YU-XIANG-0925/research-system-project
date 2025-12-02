
建議的專案目錄結構

Plaintext



my-project-root/                # 專案根目錄

├── .env                        # 環境變數 (API Keys, 設定檔)

├── .gitignore                  # Git 忽略檔 (忽略 venv, \_\_pycache\_\_, model權重檔)

├── GEMINI.md                   # 給 Gemini CLI 的專案規則 (記憶 uv 習慣等)

├── pyproject.toml              # uv 的專案設定檔

├── uv.lock                     # uv 的版本鎖定檔

│

├── app/                        # \[Backend] 後端核心程式碼 (FastAPI Service)

│   ├── \_\_init\_\_.py

│   ├── main.py                 # 程式進入點 (啟動 FastAPI, 掛載路由)

│   ├── config.py               # 設定載入 (讀取 .env)

│   │

│   ├── api/                    # API 路由層 (處理 HTTP/WebSocket 請求)

│   │   ├── \_\_init\_\_.py

│   │   ├── endpoints.py        # 定義 /save-motion, /motions 等路徑

│   │   └── websocket.py        # 定義 STT 音訊流的 WebSocket 路徑

│   │

│   └── services/               # 業務邏輯層 (實際功能的實作)

│       ├── \_\_init\_\_.py

│       ├── file\_service.py     # 處理 XML 讀寫邏輯

│       ├── stt\_service.py      # \[STT] Whisper 模型載入與推論邏輯

│       └── llm\_service.py      # \[LLM] RAG 與動作生成邏輯

│

├── data/                       # \[FileSys] 資料儲存區

│   ├── motions/                # 存放 XML 動作檔案

│   │   ├── wave.xml

│   │   └── walk.xml

│   └── vector\_db/              # \[RAG] 存放向量資料庫 (未來擴充用)

│

├── models/                     # 存放 AI 模型權重檔 (Whisper/LLM)

│   └── .keep                   # (通常這些檔案很大，不入 Git，但在地端需要此資料夾)

│

└── frontend/                   # \[Client] 前端程式碼 (你目前的檔案搬來這裡)

&nbsp;   ├── index.html

&nbsp;   ├── css/

&nbsp;   ├── js/

&nbsp;   │   ├── main.js

&nbsp;   │   └── api.js              # 專門負責呼叫後端的 fetch 函式

&nbsp;   └── assets/

&nbsp;       └── models/             # 3D 模型檔案 (.glb, .fbx 等)

對應架構圖的詳細說明

frontend/ (Client)



對應圖表： \[前端 Browser]



說明： 將你原本所有的 HTML、JS、CSS 檔案都搬進這裡。這樣 FastAPI 可以把它當作「靜態資源目錄」來提供服務。



app/main.py \& app/api/ (Backend Interface)



對應圖表： \[FastAPI Service]



說明：



main.py 負責啟動伺服器，並把 frontend 資料夾掛載到網址 /。



api/endpoints.py 處理 HTTP POST (存 XML) 和 HTTP GET (讀列表)。



api/websocket.py 處理 WebSocket 連線。



app/services/ (Backend Logic)



對應圖表： \[STT], \[LLM], \[FileSys]



說明： 這是最重要的部分。不要把邏輯全部寫在 main.py 裡。



stt\_service.py: 負責載入 Whisper 模型，接收音訊 bytes，回傳文字。



llm\_service.py: 負責呼叫 OpenAI 或本地 LLM，執行 RAG 檢索。



file\_service.py: 負責安全的讀寫 data/motions/ 下的檔案。



data/ \& models/ (Storage)



對應圖表： FileSys 資料庫與模型



說明： 這些是「變動」或「巨大」的檔案，通常會被 Git 忽略（除了 XML 範例檔外）。

