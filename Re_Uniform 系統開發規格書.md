# **Re:Uniform 系統開發規格書 (Hackathon Version)**

## **1. 專案概述 (Project Overview)**

專案名稱：Re:Uniform  
核心目標：建立一個 Mobile-First 的響應式網頁，利用 AI 視覺辨識簡化二手制服上架流程，並利用 NLP 自然語言處理優化搜尋體驗。  
開發策略：使用輕量化、無伺服器架構，以 Google 生態系 (Sheets, App Script) 搭配 Cloudinary 與 Gemini/OpenAI 快速構建 MVP。

## **2. 使用者故事 (User Stories)**

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

## **3. 技術堆疊 (Tech Stack)**

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
* **Image Storage**: Cloudinary (用於儲存圖片，提供 CDN 加速與優化).
* **AI Integration**: 直接在 GAS 中呼叫 OpenAI API.  
* **Security**: API Keys (OpenAI, Cloudinary) 儲存在 GAS Script Properties 中.

### **AI Models**

* **Vision**: OpenAI gpt-4o-mini (用於 Story A: 辨識制服圖片).  
* **NLP**: OpenAI gpt-4o-mini (用於 Story B: 解析搜尋語意).
* **API Key Storage**: Script Properties (在 GAS 中設定 `OPENAI_API_KEY`).

## **4. 系統架構 (Architecture)**

Data Flow:  
\[React App (GitHub Pages)\] \--(fetch POST)--\> \[GAS Web App URL\]  
  └─> \[Cloudinary\] (圖片儲存 & CDN)  
  └─> \[OpenAI API\] (圖片辨識 & NLP)  
  └─> \[Google Sheets\] (資料庫)

1. **前端 (React)**：負責 UI 呈現、拍照、將圖片轉為 Base64 傳送給後端。使用 React Router 進行頁面路由。  
2. **後端 (GAS)**：接收前端 JSON 請求，根據 action 分流處理。  
3. **圖片儲存 (Cloudinary)**：使用 Cloudinary API (Unsigned Upload)，將 Base64 圖片上傳並取得 Secure URL，再存入 Sheets。  
4. **資料庫 (Sheets)**：每個 Tab 代表一個資料表，儲存商品資訊（含 Cloudinary 圖片 URL）。

## **5. 資料庫設計 (Google Sheets Structure)**

請在 Google Sheet 中建立以下三個工作表 (Tabs)：

### **Tab 1: Items (商品表 - 支援 Story A)**

| id | seller_id | school | type | gender | size | conditions | condition_score | defects | status | image_url | created_at |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| *item_123* | *user_001* | *新北市板橋區海山國小* | *sport_top* | *F* | *140* | *150元* | *4* | *無明顯瑕疵* | *published* | *https://res.cloudinary.com/...* | *2025-11-27* |

### **Tab 2: Waitlist (預約單 - 支援 Story B)**

| id | requester_id | target_school | target_type | target_size | status | created_at |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| *wait_456* | *user_003* | *海山國小* | *dress* | *130* | *active* | *2025-11-27* |

### **Tab 3: Users (使用者 - 簡易版)**

| uid | name | contact_info |
| :---- | :---- | :---- |
| *user_001* | *林爸爸* | *Line: lin_papa* |

## **6. 後端 API 設計 (Google Apps Script)**

請參考 `backend/Code.gs` 和 `backend/CloudinaryHelper.gs` 的完整實作。

**Script Properties 設定**：

1. 在 Google Apps Script Editor 中: **設定** (⚙️) → **Script Properties**  
2. 必須設定以下屬性:  
   - `OPENAI_API_KEY`: OpenAI API Key (sk-...)  
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary Cloud Name  
   - `CLOUDINARY_API_KEY`: Cloudinary API Key (若需要刪除功能)  
   - `CLOUDINARY_API_SECRET`: Cloudinary API Secret (若需要刪除功能)

### **API Actions:**

#### **Action 1: uploadItem (對應 Story A - 直接上架)**

* **Input**: `{ "action": "uploadItem", "imageBase64": "..." }`  
* **Logic**:  
  1. 呼叫 `CloudinaryHelper` 將圖片上傳至 Cloudinary。  
  2. 呼叫 **OpenAI gpt-4o-mini (Vision)** 分析圖片。  
  3. 將 Cloudinary URL 與 AI 分析結果寫入 Items Sheet。  
* **Output**: `{ "status": "success", "data": { ...item_details } }`

#### **Action 2: analyzeItem (對應 Story A - 僅分析)**

* **Input**: `{ "action": "analyzeItem", "imageBase64": "..." }`  
* **Logic**:  
  1. 呼叫 `CloudinaryHelper` 將圖片上傳至 Cloudinary。  
  2. 呼叫 **OpenAI gpt-4o-mini (Vision)** 分析圖片。  
  3. 回傳分析結果與圖片 URL，**不**寫入 Sheet。  
* **Output**: `{ "status": "success", "data": { ...item_details, "image_url": "..." } }`

#### **Action 3: publishItem (對應 Story A - 確認發布)**

* **Input**: `{ "action": "publishItem", "id": "...", "image_url": "...", ...other_fields }`  
* **Logic**: 將前端確認後的商品資訊寫入 Items Sheet。  
* **Output**: `{ "status": "success", "data": ... }`

#### **Action 4: searchItems (對應 Story B)**

* **Input**: `{ "action": "searchItems", "query": "我要找海山國小女生的運動服" }`  
* **Logic**:  
  1. 呼叫 **OpenAI gpt-4o-mini (Text)** 解析 Intent。  
  2. 讀取 Items Sheet 所有資料。  
  3. 在 GAS 中進行篩選 (比對 school, type, gender 等)。  
  4. 若無結果，回傳 `suggestWaitlist: true`。  
* **Output**: `{ "status": "success", "results": [...], "suggestWaitlist": boolean }`

#### **Action 5: addToWaitlist (對應 Story B - 無貨時)**

* **Input**: `{ "action": "addToWaitlist", "school": "...", "type": "..." }`  
* **Logic**: 將資料寫入 Waitlist Sheet。  
* **Output**: `{ "status": "success" }`

## **7. 前端頁面規劃 (React SPA)**

### **UI Sections (React Router):**

1. **Home View (`/`)**:  
   - Hero Section: "Re:Uniform" 大標題。  
   - **最近上傳**: 顯示最新商品卡片。  
   - **最近需求**: 顯示最新預約需求。  
   - **Story B 入口**: Search Bar。  
   - **Story A 入口**: Big Floating Button (📸 賣制服)。  

2. **Upload View (`/upload`)**:  
   - 拍照/上傳介面。  
   - Loading State (AI 分析中)。  
   - 編輯/確認表單 (顯示 AI 辨識結果)。  
   - 發布成功頁面。  

3. **Result View (`/search`)**:  
   - 搜尋結果列表。  
   - Empty State: 顯示 [加入缺貨預約] 按鈕。  

4. **Items View (`/items`)**:  
   - 完整商品列表。  

5. **Waitlist View (`/waitlist`)**:  
   - 完整預約需求列表。  

## **8. 開發注意事項**

1. **Cloudinary Setup**:  
   - 需在 Cloudinary Dashboard 建立一個 **Unsigned Upload Preset** (例如 `reuniform_preset`)。  
   - 將 Cloud Name 設定在 GAS Script Properties。

2. **OpenAI Setup**:  
   - 確保 GAS Script Properties 中有有效的 `OPENAI_API_KEY`。  

3. **Mock Data**:  
   - 前端開發時可使用 `src/api.js` 中的 Mock Data 或直接呼叫後端 API (需設定 `VITE_API_URL`)。