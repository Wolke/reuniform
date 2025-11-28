# Google Apps Script 設定指南

本指南將協助您設定 Re:Uniform 的後端系統（使用 Google Apps Script 和 Google Sheets）。

## 步驟 1: 建立 Google Sheet

1. 前往 [Google Sheets](https://sheets.google.com)
2. 點擊「+ 空白」建立新試算表
3. 將試算表命名為 **「Re:Uniform Database」**

## 步驟 2: 建立三個工作表

### 2.1 Items 工作表（商品表）

1. 將第一個工作表重新命名為 **「Items」**
2. 在第一列輸入以下標題（A1 到 L1）：

```
id | seller_id | school | type | gender | size | conditions | condition_score | defects | status | image_base64 | created_at
```

3. 填入 Mock Data（範例資料）：

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| item_001 | user_001 | 新北市板橋區海山國小 | sport_top | F | 140 | 150元 | 4 | 無明顯瑕疵 | published | (skip) | 2025-10-01 |
| item_002 | user_002 | 新北市板橋區光復國小 | uniform_bottom | M | M | 200元 | 5 | 無 | published | (skip) | 2025-10-02 |
| item_003 | user_001 | 台北市大安區建國國小 | dress | F | 130 | 180元 | 3 | 裙擺有小污漬 | published | (skip) | 2025-10-03 |

### 2.2 Waitlist 工作表（預約單）

1. 點擊下方的 **「+」** 新增工作表
2. 命名為 **「Waitlist」**
3. 在第一列輸入標題（A1 到 G1）：

```
id | requester_id | target_school | target_type | target_size | status | created_at
```

4. 填入 Mock Data：

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| wait_001 | user_003 | 海山國小 | dress | 130 | active | 2025-10-05 |
| wait_002 | user_004 | 光復國小 | sport_top | 150 | active | 2025-10-06 |

### 2.3 Users 工作表（使用者 - LINE Login）

1. 再次點擊 **「+」** 新增工作表
2. 命名為 **「Users」**
3. 在第一列輸入標題（A1 到 F1）：

```
line_user_id | display_name | picture_url | contact_info | created_at | last_login
```

4. **說明**：此工作表用於儲存 LINE Login 使用者資訊，系統會自動新增和更新資料。

5. 手動填入測試資料（可選）：

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| U1234567890abcdef | 林爸爸 | https://... | Line: lin_papa | 2025-11-01 | 2025-11-27 |
| U0987654321fedcba | 陳媽媽 | https://... | Line: chen_mama | 2025-11-02 | 2025-11-26 |

## 步驟 3: 建立 Apps Script 專案

1. 在 Google Sheet 中，點擊上方選單：**擴充功能 → Apps Script**
2. 系統會開啟 Apps Script 編輯器
3. 刪除預設的 `function myFunction() {}` 程式碼
4. 複製 `Code.gs` 的完整內容並貼上

## 步驟 4: 設定 API Keys 和 LINE Login

### 4.1 OpenAI API Key

1. 前往 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登入並點擊「Create new secret key」取得 API Key
3. 在 Apps Script 編輯器中，點擊左側的 **「專案設定」**（齒輪圖示）
4. 滾動到 **「指令碼屬性」** 區段
5. 點擊 **「新增指令碼屬性」**，新增：
   - 屬性名稱：`OPENAI_API_KEY`
   - 值：您的 OpenAI API Key（sk-...）

### 4.2 LINE Login 設定

1. 參考 `LINE_LOGIN_SETUP.md` 檔案完成 LINE Developers Console 設定
2. 取得 LINE Channel ID 和 Channel Secret
3. 在 **「指令碼屬性」** 中新增以下兩個屬性：
   - 屬性名稱：`LINE_CHANNEL_ID`，值：您的 Channel ID（例如：2008583001）
   - 屬性名稱：`LINE_CHANNEL_SECRET`，值：您的 Channel Secret

### 4.3 Cloudinary 設定（如果使用圖片上傳）

參考 `CloudinaryHelper.gs` 檔案設定 Cloudinary 相關屬性。

## 步驟 5: 設定 Gemini API Key

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 點擊「Create API Key」取得 Gemini API Key
3. 在 Apps Script 編輯器中，找到第 7 行：
   ```javascript
   const GEMINI_API_KEY = "YOUR_API_KEY_HERE";
   ```
4. 將 `YOUR_API_KEY_HERE` 替換為您的 API Key：
   ```javascript
   const GEMINI_API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX";
   ```

## 步驟 6: 儲存並部署

### 6.1 儲存專案

1. 點擊上方的 **「專案設定」**（齒輪圖示）
2. 將專案命名為 **「Re:Uniform Backend」**
3. 點擊 **檔案 → 儲存**（或按 Ctrl/Cmd + S）

### 5.2 部署為 Web App

1. 點擊右上角的 **「部署 → 新增部署作業」**
2. 點擊 **「選取類型 → 網頁應用程式」**
3. 填寫設定：
   - **說明**：Re:Uniform API v1
   - **執行身分**：我
   - **具有應用程式存取權的使用者**：所有人
4. 點擊 **「部署」**
5. 授予必要權限（可能需要點擊「進階」並允許存取）
6. **複製 Web App URL**（類似 `https://script.google.com/macros/s/XXXXX/exec`）

## 步驟 6: 測試 API

### 測試連線

在瀏覽器中開啟您的 Web App URL，應該會看到：

```json
{
  "status": "success",
  "message": "Re:Uniform API is running",
  "timestamp": "2025-11-24T06:30:00.000Z"
}
```

### 測試 POST 請求（可選）

使用 Postman 或其他工具發送 POST 請求：

**測試搜尋功能：**
```json
POST https://script.google.com/macros/s/XXXXX/exec

Body (JSON):
{
  "action": "searchItems",
  "query": "我要找海山國小女生的運動服"
}
```

應該會回傳符合的商品列表。

## 步驟 7: 將 URL 填入前端

1. 複製您的 Web App URL
2. 開啟前端專案的 `app.js` 檔案
3. 找到第 1 行：
   ```javascript
   const API_URL = "YOUR_GAS_WEB_APP_URL_HERE";
   ```
4. 替換為您的 URL：
   ```javascript
   const API_URL = "https://script.google.com/macros/s/XXXXX/exec";
   ```

## 完成！

您的後端系統已經設定完成。現在可以開始使用前端網頁進行測試了。

## 常見問題

### Q: 為什麼 API 回傳錯誤？

A: 請檢查：
1. Gemini API Key 是否正確填寫
2. Google Sheet 的三個工作表名稱是否正確（Items, Waitlist, Users）
3. 是否已授予 Apps Script 必要權限

### Q: 如何更新程式碼？

A: 
1. 在 Apps Script 編輯器中修改程式碼
2. 點擊「儲存」
3. 點擊「部署 → 管理部署作業」
4. 點擊編輯圖示（鉛筆）
5. 將版本改為「新版本」
6. 點擊「部署」

### Q: 如何查看錯誤日誌？

A:
1. 在 Apps Script 編輯器中點擊「執行」
2. 點擊「查看執行記錄」
3. 可以看到所有 Logger.log() 的輸出和錯誤訊息

## 安全性注意事項

⚠️ **重要**: 目前 API Key 是直接寫在程式碼中，適合 Hackathon 或測試環境。正式上線前，建議使用以下方式提升安全性：

1. 使用 Apps Script 的 **Properties Service** 儲存敏感資訊：
   ```javascript
   const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
   ```

2. 在 Apps Script 編輯器中：
   - 點擊「專案設定」
   - 滾動到「指令碼屬性」
   - 新增屬性：鍵 = `GEMINI_API_KEY`，值 = 您的 API Key

3. 考慮加入基本的 API 驗證機制（例如：token 驗證）
