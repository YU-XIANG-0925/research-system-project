# 階段 1：基礎產出

## 資料模型 (`data-model.md`)

### 實體

- **機器人**：
  - `motors`：`Motor` 物件的列表。
- **馬達**：
  - `id`：馬達的唯一識別碼。
  - `angle`：馬達的目前角度。
- **機器人動作**：
  - `name`：動作的名稱。
  - `sequence`：一系列的馬達角度組態。

## API 合約 (`contracts/`)

### MQTT 主題

- `robot/angles/status`：用於發布機器人目前的馬達角度。
- `robot/action/command`：用於向機器人傳送指令。

## 快速入門指南 (`quickstart.md`)

### 設定

1.  複製儲存庫：`git clone https://github.com/YU-XIANG-0925/NuwaSDKExample.git`
2.  將 SDK 從 `tools` 複製到 `app/libs`。
3.  在應用程式中設定 MQTT 代理的詳細資料。

### 執行應用程式

1.  建置並執行 Android 應用程式。
2.  連線到 MQTT 代理。
3.  導覽至所需的功能頁面。