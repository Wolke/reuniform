# **Re:Uniform 系統開發規格書 (Hackathon Version)**

## **1\. 專案概述 (Project Overview)**

專案名稱：Re:Uniform  
核心目標：建立一個 Mobile-First 的響應式網頁，利用 AI 視覺辨識簡化二手制服上架流程，並利用 NLP 自然語言處理優化搜尋體驗。  
開發策略：使用輕量化、無伺服器架構，以 Google 生態系 (Sheets, App Script, Gemini) 快速構建 MVP。

## **2\. 使用者故事 (User Stories)**

系統核心邏輯分為兩大路徑，請確保 UI/UX 設計能清楚引導這兩個情境：

### **Story A: 賣家/捐贈者 (The Seller)**

*"我是一個忙碌的家長，家裡有一堆小孩穿不下的制服，我想快速清理它們，不想花時間填表格。"*

* **流程**：  
  1. 使用者在首頁點擊 **「📸 我要賣 (AI 上架)」**。  
  2. 系統開啟相機，使用者拍攝制服照片。  
  3. 顯示 "AI 分析中..." Loading 動畫。  
  4. **AI 自動填寫**：學校、款式、尺寸、新舊狀況、建議售價。  
  5. 使用者檢視草稿，點擊 **「確認上架」**。  
  6. 顯示成功畫面。

### **Story B: 買家/搜尋者 (The Buyer)**

*"我正在找特定學校的制服，但我不知道確切尺寸，只想用白話文搜尋。如果沒貨，希望有貨時通知我。"*

* **流程**：  
  1. 使用者在首頁搜尋框輸入自然語言：**「我要找海山國小三年級女生的運動服」**。  
  2. **AI 解析**：系統自動分析出 學校:海山國小、尺寸:130-140cm、類別:運動服。  
  3. **情境 1 (有貨)**：顯示符合的商品列表。  
  4. **情境 2 (無貨)**：列表為空，系統顯示 **「🔔 目前缺貨，加入預約通知？」** 按鈕。  
  5. 使用者點擊加入，系統將需求存入 Waitlist。

## **3\. 技術堆疊 (Tech Stack)**

請使用以下技術進行開發：

### **Frontend (Hosting: GitHub Pages)**

* **Framework**: React 19 with Vite build tool.  
* **Language**: JavaScript (ES6+) with JSX.  
* **Styling**: Tailwind CSS (integrated via npm).  
* **Routing**: React Router DOM for SPA navigation.  
* **Hosting**: GitHub Pages (deployed via `gh-pages` package to `gh-pages` branch).
* **Deployment**: `npm run deploy` (自動 build 並部署到 GitHub Pages).

### **Backend (Google Apps Script)**

* **Logic**: Google Apps Script (GAS) 部署為 Web App (doGet, doPost).  
* **Database**: Google Sheets (作為資料庫).  
* **AI Integration**: 直接在 GAS 中呼叫 Gemini API.  
* **Security**: Gemini API Key 直接儲存在 GAS 腳本變數中 (Hackathon 快速實作).

### **AI Models**

* **Vision**: OpenAI gpt-4o (用於 Story A: 辨識制服圖片).  
* **NLP**: OpenAI gpt-4o-mini (用於 Story B: 解析搜尋語意).
* **API Key Storage**: Script Properties (在 GAS 中設定 `OPENAI_API_KEY`).

## **4\. 系統架構 (Architecture)**

Data Flow:  
\[React App (GitHub Pages)\] \--(fetch POST)--\> \[GAS Web App URL\]  
  └─> \[OpenAI API\] (圖片辨識 & NLP)  
  └─> \[Google Drive\] (圖片儲存)  
  └─> \[Google Sheets\] (資料庫)

1. **前端 (React)**：負責 UI 呈現、拍照、將圖片轉為 Base64 傳送給後端。使用 React Router 進行頁面路由。  
2. **後端 (GAS)**：接收前端 JSON 請求，根據 action 分流處理。圖片上傳至 Google Drive 並取得公開 URL，再呼叫 OpenAI API 進行分析。  
3. **圖片儲存 (Drive)**：使用 Google Drive API，每張圖片儲存為獨立檔案並設定公開分享，返回 URL 存入 Sheets。  
4. **資料庫 (Sheets)**：每個 Tab 代表一個資料表，儲存商品資訊（含 Google Drive 圖片 URL）。

## **5\. 資料庫設計 (Google Sheets Structure)**

請在 Google Sheet 中建立以下三個工作表 (Tabs)，並預填 Mock Data：

### **Tab 1: Items (商品表 \- 支援 Story A)**

| id | seller\_id | school | type | gender | size | conditions | condition\_score | defects | status | image\_url | created\_at |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| *ITEM001* | *user\_001* | *新北市板橋區海山國小* | *sport\_top* | *F* | *140* | *150元* | *4* | *無明顯瑕疵* | *published* | *https://drive.google.com/...* | *2025-10-01* |
| *ITEM002* | *user\_002* | *新北市板橋區光復國小* | *uniform\_bottom* | *M* | *M* | *200元* | *5* | *無* | *published* | *https://drive.google.com/...* | *2025-10-02* |

**Mock Data CSV**: 請直接複製 `backend/mock_data_items.csv` 內容貼入 Google Sheets。

### **Tab 2: Waitlist (預約單 \- 支援 Story B)**

| id | requester\_id | target\_school | target\_type | target\_size | status | created\_at |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| *WAIT001* | *user\_003* | *海山國小* | *dress* | *130* | *active* | *2025-10-05* |

**Mock Data CSV**: 請直接複製 `backend/mock_data_waitlist.csv` 內容貼入 Google Sheets。

### **Tab 3: Users (使用者 \- 簡易版)**

| uid | name | contact\_info |
| :---- | :---- | :---- |
| *user\_001* | *林爸爸* | *Line: lin\_papa* |

**Mock Data CSV**: 請直接複製 `backend/mock_data_users.csv` 內容貼入 Google Sheets。

## **6\. 後端 API 設計 (Google Apps Script)**

請參考 `backend/Code.gs` 和 `backend/DriveHelper.gs` 的完整實作。

**API Key 設定（Script Properties）**：

1. 在 Google Apps Script Editor 中: **設定** (⚙️) → **Script Properties**  
2. 新增屬性:  
   - Property: `OPENAI_API_KEY`  
   - Value: `sk-proj-...` (你的 OpenAI API Key)  
3. (選填) Property: `DRIVE_FOLDER_ID` - 若未設定，系統會自動創建名為 `Re_Uniform_Images` 的資料夾。

### **API Actions:**

#### **Action 1: uploadItem (對應 Story A)**

* **Input**: { "action": "uploadItem", "imageBase64": "..." }  
* **Logic**:  
  1. 呼叫 **Gemini 2.5 Flash (Vision)** 分析圖片。  
  2. Prompt: "Analyze this school uniform. Return JSON with fields: school (Taiwanese school name), type (sport_top_short/sport_top_long/sport_bottom_short/sport_bottom_long/uniform_top_short/uniform_top_long/uniform_bottom_short/uniform_bottom_long/uniform_skirt/dress/jacket), gender, size, condition (1-5), defects, suggested_conditions."  
  3. 將 Gemini 回傳的 JSON 資料寫入 Items Sheet。  
* **Output**: { "status": "success", "data": { ...item\_details } }

#### **Action 2: searchItems (對應 Story B)**

* **Input**: { "action": "searchItems", "query": "我要找海山國小女生的運動服" }  
* **Logic**:  
  1. 呼叫 **Gemini 2.5 Flash (Text)** 解析 Intent。  
  2. Prompt: "Extract search keywords from: '${query}'. Return JSON: { school, type, gender, size\_approx }."  
  3. 讀取 Items Sheet 所有資料。  
  4. 在 GAS 中進行簡單的 Filter (比對 school, type 等)。  
  5. 若無結果，回傳 suggestWaitlist: true。  
* **Output**: { "status": "success", "results": \[...\], "suggestWaitlist": boolean }

#### **Action 3: addToWaitlist (對應 Story B \- 無貨時)**

* **Input**: { "action": "addToWaitlist", "school": "...", "type": "..." }  
* **Logic**: 將資料寫入 Waitlist Sheet。  
* **Output**: { "status": "success" }

## **7\. 前端頁面規劃 (React SPA)**

### **UI Sections (React Router):**

1. **Home View (`/`)**:  
   * Hero: 大標題 "Re:Uniform"。  
   * **最近上傳的制服**: 顯示最新 3 筆商品卡片 + \[更多\] 按鈕 → 連到 `/items`。  
   * **最近的需求**: 顯示最新 3 筆預約需求 + \[更多\] 按鈕 → 連到 `/waitlist`。  
   * **Story B 入口**: Search Bar (輸入框 \+ 🔍 按鈕)。  
   * **Story A 入口**: Big Floating Button (📸 賣制服)。  
2. **Upload View (`/upload` - Modal/Page)**:  
   * \<input type="file" capture="environment"\> 啟動相機。  
   * Preview Image (\<img\>).  
   * Loading Spinner ("AI 正在分析您的制服...").  
   * Form: 顯示 AI 填好的結果 (School, Size, Conditions)，允許手動修改。  
   * \[確認上架\] 按鈕。  
3. **Result View (`/search`)**:  
   * 列出符合的搜尋結果。  
   * **Empty State**: 若無結果，顯示 \[🔔 加入缺貨預約清單\] 按鈕。  
4. **Items View (`/items`)**:  
   * 完整列表顯示所有商品（分頁）。  
5. **Waitlist View (`/waitlist`)**:  
   * 完整列表顯示所有預約需求（分頁）。

## **8\. Mock Data & Testing 指引**

由於是黑克松，請在前端 JS 預設一些變數，方便 demo：

1. **Mock User**: 預設 currentUserId \= "user\_001"。  
2. **Mock Image**: 可以在前端準備一個 base64 string 範例，如果相機失敗可以用來測試 AI API。

## **9\. 開發指令 (Prompt for AI)**

請依照上述規格：

1. 先提供 Code.gs 的完整程式碼 (包含 Gemini API 呼叫邏輯與 Sheet 操作)。  
2. 接著提供 index.html, style.css, app.js 的完整前端程式碼。  
3. 確保前端使用 fetch 呼叫 GAS Web App URL (請預留 const API\_URL \= "..." 變數)。