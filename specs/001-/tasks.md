# 演講能力輔助系統任務列表

## 階段一：後端基礎建設

### T001: [P] 初始化 FastAPI 專案
- **檔案**：`backend/main.py`
- **描述**：建立一個新的 FastAPI 應用程式。包含一個基本的 "hello world" 端點用於測試設定。

### T002: [P] 設定後端依賴套件
- **檔案**：`backend/pyproject.toml`
- **描述**：將 `fastapi`、`uvicorn`、`httpx`、`opencv-python`、`mediapipe`、`paho-mqtt` 加入到專案依賴中。

### T003: [P] LLM 處理模組
- **檔案**：`backend/llm_handler.py`
- **描述**：實作一個函式，使用 `httpx` 呼叫大型語言模型 API。這將用於建議標註。

### T004: [P] MQTT 客戶端模組
- **檔案**：`backend/mqtt_client.py`
- **描述**：實作一個類別來處理 MQTT 連線、發布和訂閱。

### T005: 姿勢分析模組
- **檔案**：`backend/pose_analyzer.py`
- **描述**：實作一個函式，使用 `opencv-python` 和 `mediapipe` 來分析影片影格並提取姿勢資料。
- **依賴於**：T002

## 階段二：核心功能 (講稿標註)

### T006: 資料模型
- **檔案**：`backend/src/models/script.py`
- **描述**：根據 `data-model.md` 的定義，為 `Script` 和 `Annotation` 建立 Pydantic 模型。

### T007: [P] 前端講稿上傳介面
- **檔案**：`frontend/index.html`, `frontend/script.js`
- **描述**：建立用於上傳講稿檔案的使用者介面。使用 Fetch API 實作檔案上傳邏輯。

### T008: 後端講稿上傳端點
- **檔案**：`backend/main.py`
- **描述**：實作 `/scripts` 端點，用於上傳講稿檔案。此端點將儲存講稿，然後呼叫 LLM 處理器以取得標註。
- **依賴於**：T001, T003, T006

### T009: 講稿標註服務
- **檔案**：`backend/src/services/annotation_service.py`
- **描述**：實作使用 LLM 處理器自動標註講稿的邏輯。
- **依賴於**：T003

### T010: 前端標註顯示
- **檔案**：`frontend/index.html`, `frontend/script.js`
- **描述**：顯示從後端收到的講稿內容和標註。允許編輯和刪除標註。
- **依賴於**：T007

### T011: 自定義動作資料模型
- **檔案**：`backend/src/models/action.py`
- **描述**：根據 `data-model.md` 的定義，為 `CustomAction` 建立 Pydantic 模型。

### T012: [P] 前端自定義動作介面
- **檔案**：`frontend/index.html`, `frontend/script.js`
- **描述**：建立用於建立和管理自定義機器人動作的使用者介面。

### T013: 後端自定義動作端點
- **檔案**：`backend/main.py`
- **描述**：為自定義動作實作 CRUD 端點。
- **依賴於**：T001, T011

## 階段三：演講輔助

### T014: [P] 前端提詞器介面
- **檔案**：`frontend/index.html`, `frontend/script.js`
- **描述**：建立顯示講稿文字的提詞器使用者介面。

### T015: 前端語音辨識
- **檔案**：`frontend/script.js`
- **描述**：使用 Web Audio API 取得麥克風輸入，並實作語音辨識以追蹤使用者在講稿中的進度。

### T016: 用於即時提示的 WebSocket
- **檔案**：`backend/main.py`
- **描述**：實作 WebSocket 端點 `/ws/speech-to-text/{scriptId}` 以向前端發送即時提示。
- **依賴於**：T001

### T017: 前端 WebSocket 客戶端
- **檔案**：`frontend/script.js`
- **描述**：實作 WebSocket 客戶端以連接到後端並接收即時提示。
- **依賴於**：T015

## 階段四：系統整合與定版

### T018: 硬體設定資料模型
- **檔案**：`backend/src/models/config.py`
- **描述**：根據 `data-model.md` 的定義，為 `HardwareConfiguration` 建立 Pydantic 模型。

### T019: [P] 前端設定介面
- **檔案**：`frontend/index.html`, `frontend/script.js`
- **描述**：建立用於設定硬體連線的使用者介面。

### T020: 後端設定端點
- **檔案**：`backend/main.py`
- **描述**：為硬體設定實作 CRUD 端點。
- **依賴於**：T001, T018

### T021: 端到端整合測試
- **檔案**：`tests/test_integration.py`
- **描述**：撰寫涵蓋完整使用者流程的整合測試，從上傳講稿到在演講期間接收提示。
- **依賴於**：所有先前的任務

### T022: [P] 專案文件
- **檔案**：`README.md`
- **描述**：為專案撰寫全面的文件，包括設定說明和 API 參考。