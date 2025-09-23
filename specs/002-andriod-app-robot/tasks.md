# Android 機器人控制應用程式 - 詳細開發任務

**功能**: 根據 `plan.md` 的規劃，實作一個 Android 應用程式來控制機器人。

---

## 任務清單

### 階段 1：專案設定與基礎架構 (可平行執行)

- **T001: [設定]** 建立 Android 專案 [P]
  - **檔案**: `robot/`
  - **說明**: 嚴格遵循 `plan.md` 中「技術背景」的指示，參考 `https://github.com/YU-XIANG-0925/NuwaSDKExample.git` 的結構，在 `robot/` 目錄下建立一個新的 Android 專案。需使用 Java 語言。

- **T002: [設定]** 整合專用 SDK [P]
  - **檔案**: `robot/app/libs/`
  - **說明**: 根據 `plan.md` 的「技術背景」，將 `tools/` 資料夾中的專用 SDK 檔案複製到 `robot/app/libs/` 目錄。
  - **依賴**: T001

- **T003: [設定]** 新增 MQTT 函式庫依賴 [P]
  - **檔案**: `robot/app/build.gradle`
  - **說明**: 根據 `plan.md` 的「技術背景」，在 `build.gradle` 中新增 Paho MQTT Client 或其他適用於 Java 的 MQTT 函式庫依賴。
  - **依賴**: T001

### 階段 2：核心服務開發

- **T004: [核心]** 實作 MQTT 連線背景服務
  - **檔案**: `robot/app/src/main/java/.../MqttService.java`
  - **說明**: 建立一個 Android `Service` 來處理 MQTT 連線，以滿足 `spec.md` 的 `FR-003` 需求 (連線需在不同功能間保持)。此服務需包含：
    - 連線 (`connect`)、斷線 (`disconnect`)、發布 (`publish`)、訂閱 (`subscribe`) 的公開方法。
    - 處理連線失敗與自動重連的邏輯 (參考 `spec.md` 的「邊界案例」)。
    - 使用 `data-model.md` 中定義的 MQTT 主題 (`robot/angles/status`, `robot/action/command`)。
  - **依賴**: T003

### 階段 3：UI 與功能實作

- **T005: [UI]** 建立主頁面與導覽邏輯
  - **檔案**: `robot/app/src/main/java/.../MainActivity.java`, `robot/app/src/main/res/layout/activity_main.xml`
  - **說明**: 實作 `spec.md` 的 `FR-001`。建立主畫面，包含三個按鈕，分別導覽至「連線」、「播放動作」和「手動調整」三個 `Activity`。
  - **依賴**: T001

- **T006: [功能]** 實作連線頁面 (ConnectionActivity)
  - **檔案**: `robot/app/src/main/java/.../ConnectionActivity.java`, `robot/app/src/main/res/layout/activity_connection.xml`
  - **說明**: 實作 `spec.md` 的 `FR-002`。UI 需包含 MQTT Broker 位址和 Topic 的輸入欄位，以及一個「連線」按鈕。點擊按鈕後，呼叫 `MqttService` (T004) 的 `connect` 方法。
  - **依賴**: T004, T005

- **T007: [功能]** 實作播放機器人動作頁面 (PlayActionActivity)
  - **檔案**: `robot/app/src/main/java/.../PlayActionActivity.java`, `robot/app/src/main/res/layout/activity_play_action.xml`
  - **說明**: 實作 `spec.md` 的 `FR-004` 和 `FR-005`。
    - **T007.1**: UI 需包含一個 `RecyclerView` 來顯示動作列表。
    - **T007.2**: 載入官方動作列表。**注意**: 動作列表的具體內容為 `research.md` 中的 `[需要釐清]` 項目，此處可先使用佔位符 (e.g., `["Action 1", "Action 2"])`。
    - **T007.3**: 建立一個每秒觸發的 `Handler` 或 `Timer`，以 1Hz 的頻率呼叫 `MqttService` 發布馬達角度。**注意**: 角度格式同樣為 `[需要釐清]` 項目，可暫時發送模擬的 JSON 字串，例如 `{"motor1": 10, "motor2": 20}`。
  - **依賴**: T004, T005

- **T008: [功能]** 實作手動調整頁面 (ManualControlActivity) - 基礎
  - **檔案**: `robot/app/src/main/java/.../ManualControlActivity.java`, `robot/app/src/main/res/layout/activity_manual_control.xml`
  - **說明**: 實作 `spec.md` 的 `FR-006`, `FR-007`, `FR-008`。
    - **T008.1**: 在 `onResume` 或進入頁面時，發送一個命令來初始化/歸零馬達角度 (滿足 `FR-007`)。
    - **T008.2**: UI 需包含用於顯示即時馬達角度的 `TextView`。
    - **T008.3**: 訂閱 `robot/angles/status` 主題，並將接收到的角度資訊以 1Hz 的頻率更新到畫面上 (滿足 `FR-008`)。
  - **依賴**: T004, T005

- **T009: [功能]** 實作手動調整頁面 - 按鈕功能
  - **檔案**: `robot/app/src/main/java/.../ManualControlActivity.java`
  - **說明**: 實作 `spec.md` 的 `FR-009` 和 `FR-010`。
    - **T009.1**: 實作「Record」按鈕的 `onClick` 事件。點擊後，應有一個狀態旗標 (e.g., `isRecording`)，並開始將馬達角度持續發布到 MQTT。
    - **T009.2**: 實作「Return」按鈕的 `onClick` 事件。點擊後，發送歸零命令。
  - **依賴**: T008

### 階段 4：測試 (可平行執行)

- **T010: [測試]** 撰寫 MQTT 服務的單元測試 [P]
  - **檔案**: `robot/app/src/test/java/.../MqttServiceTest.java`
  - **說明**: 針對 `MqttService` 的 `connect`, `publish`, `subscribe` 等核心功能撰寫 JUnit 測試。
  - **依賴**: T004

- **T011: [測試]** 撰寫 UI 功能的儀器測試 [P]
  - **檔案**: `robot/app/src/androidTest/java/.../`
  - **說明**: 使用 Espresso 為 `ConnectionActivity` 和 `ManualControlActivity` 的核心互動（例如，點擊按鈕、文字顯示）撰寫儀器測試，驗證 `spec.md` 中的驗收場景。
  - **依賴**: T006, T008, T009

---

## 執行順序建議

1.  **平行開始**: `T001`, `T002`, `T003` 可以同時進行。
2.  **服務先行**: 完成 `T004`，這是後續所有功能的基礎。
3.  **UI 開發**: `T005` -> `T006` -> `T007` -> `T008` -> `T009`。
4.  **平行測試**: `T010` 和 `T011` 可以在其依賴的功能完成後隨時開始。