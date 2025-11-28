# **Re:Uniform 系統開發規格書 (Hackathon Version)**

## **1. 專案概述 (Project Overview)**

專案名稱：Re:Uniform  
核心目標：建立一個 Mobile-First 的響應式網頁，利用 AI 視覺辨識簡化二手制服上架流程，並利用 NLP 自然語言處理優化搜尋體驗。整合 LINE Login 與 LIFF，提供流暢的使用者體驗。  
開發策略：使用輕量化、無伺服器架構，以 Google 生態系 (Sheets, App Script) 搭配 Cloudinary 與 Gemini/OpenAI 快速構建 MVP。

## **2. 使用者故事 (User Stories)**

系統核心邏輯分為兩大路徑，並透過 LINE 帳號進行身份驗證：

### **Story A: 賣家/捐贈者 (The Seller)**

*"我是一個忙碌的家長，家裡有一堆小孩穿不下的制服，我想快速清理它們，不想花時間填表格。"*

* **流程**：  
  1. 使用者在首頁點擊 **「📸 我要賣 (AI 上架)」**。  
  2. 若未登入，系統引導進行 LINE 登入。
  3. 系統開啟相機，使用者拍攝制服照片。  
  4. 顯示 "AI 分析中..." Loading 動畫。  
  5. **AI 自動填寫**：學校、款式、尺寸、新舊狀況、建議售價。  
  6. 使用者檢視草稿，點擊 **「確認上架」**。  
  7. 顯示成功畫面，並可在個人頁面查看已上架商品。

### **Story B: 買家/搜尋者 (The Buyer)**

*"我正在找特定學校的制服，但我不知道確切尺寸，只想用白話文搜尋。如果沒貨，希望有貨時通知我。"*

* **流程**：  
  1. 使用者在首頁搜尋框輸入自然語言：**「我要找海山國小三年級女生的運動服」**。  
  2. **AI 解析**：系統自動分析出 學校:海山國小、尺寸:130-140cm、類別:運動服。  
  3. **情境 1 (有貨)**：顯示符合的商品列表。使用者登入後可查看賣家聯絡資訊。
  4. **情境 2 (無貨)**：列表為空，系統顯示 **「🔔 目前缺貨，加入預約通知？」** 按鈕。  
  5. 使用者登入後點擊加入，系統將需求存入 Waitlist。

## **3. 技術堆疊 (Tech Stack)**

請使用以下技術進行開發：

### **Frontend (Hosting: GitHub Pages)**

* **Framework**: React 19 with Vite build tool.  
* **Language**: JavaScript (ES6+) with JSX.  
* **Styling**: Tailwind CSS (integrated via npm).  
* **Routing**: React Router DOM for SPA navigation.  
* **Authentication**: LINE Login (OAuth 2.0) & LIFF SDK.
* **Hosting**: GitHub Pages (deployed via `gh-pages` package to `gh-pages` branch).
* **Deployment**: `npm run deploy` (自動 build 並部署到 GitHub Pages).

### **Backend (Google Apps Script)**

* **Logic**: Google Apps Script (GAS) 部署為 Web App (doGet, doPost).  
* **Database**: Google Sheets (作為資料庫).  
* **Image Storage**: Cloudinary (用於儲存圖片，提供 CDN 加速與優化).
* **AI Integration**: 直接在 GAS 中呼叫 OpenAI API.  
* **Security**: API Keys (OpenAI, Cloudinary, LINE) 儲存在 GAS Script Properties 中.

### **AI Models**

* **Vision**: OpenAI gpt-4o-mini (用於 Story A: 辨識制服圖片).  
* **NLP**: OpenAI gpt-4o-mini (用於 Story B: 解析搜尋語意).
* **API Key Storage**: Script Properties (在 GAS 中設定 `OPENAI_API_KEY`).

## **4. 系統架構 (Architecture)**

Data Flow:  
\[React App (GitHub Pages)\] \--(fetch POST)--\> \[GAS Web App URL\]  
  ├─> \[LINE Platform\] (身分驗證 & LIFF)
  └─> \[Cloudinary\] (圖片儲存 & CDN)  
  └─> \[OpenAI API\] (圖片辨識 & NLP)  
  └─> \[Google Sheets\] (資料庫)

1. **前端 (React)**：負責 UI 呈現、拍照、LIFF 整合。使用 React Router 進行頁面路由。  
2. **後端 (GAS)**：
   - `Code.gs`: 主要 API 入口與業務邏輯。
   - `LineAuthHelper.gs`: 處理 LINE 登入驗證與使用者資料管理。
   - `CloudinaryHelper.gs`: 處理圖片上傳。
3. **圖片儲存 (Cloudinary)**：使用 Cloudinary API (Unsigned Upload)，將 Base64 圖片上傳並取得 Secure URL，再存入 Sheets。  
4. **資料庫 (Sheets)**：每個 Tab 代表一個資料表，儲存商品資訊、預約清單與使用者資料。

## **5. 資料庫設計 (Google Sheets Structure)**

請在 Google Sheet 中建立以下三個工作表 (Tabs)：

### **Tab 1: Items (商品表 - 支援 Story A)**

| id | seller_id | school | type | gender | size | conditions | condition_score | defects | status | image_url | created_at |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| *item_123* | *U123456* | *新北市板橋區海山國小* | *sport_top* | *F* | *140* | *150元* | *4* | *無明顯瑕疵* | *published* | *https://res.cloudinary.com/...* | *2025-11-27* |

### **Tab 2: Waitlist (預約單 - 支援 Story B)**

| id | requester_id | target_school | target_type | target_size | status | created_at |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| *wait_456* | *U789012* | *海山國小* | *dress* | *130* | *active* | *2025-11-27* |

### **Tab 3: Users (使用者 - LINE Login)**

| line_user_id | display_name | picture_url | contact_info | created_at | last_login |
| :---- | :---- | :---- | :---- | :---- | :---- |
| *U123456* | *林爸爸* | *https://profile...* | *Line: lin_papa* | *2025-11-27* | *2025-11-28* |

## **6. 後端 API 設計 (Google Apps Script)**

請參考 `backend/Code.gs` 和 `backend/LineAuthHelper.gs` 的完整實作。

**Script Properties 設定**：

1. 在 Google Apps Script Editor 中: **設定** (⚙️) → **Script Properties**  
2. 必須設定以下屬性:  
   - `OPENAI_API_KEY`: OpenAI API Key (sk-...)  
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary Cloud Name  
   - `CLOUDINARY_API_KEY`: Cloudinary API Key  
   - `CLOUDINARY_API_SECRET`: Cloudinary API Secret
   - `LINE_CHANNEL_ID`: LINE Login Channel ID
   - `LINE_CHANNEL_SECRET`: LINE Login Channel Secret

### **API Actions:**

#### **Action 1: uploadItem (Story A - 上傳圖片)**
* **Input**: `{ "action": "uploadItem", "imageBase64": "..." }`  
* **Output**: `{ "status": "success", "data": { ...item_details } }`

#### **Action 2: analyzeItem (Story A - AI 分析)**
* **Input**: `{ "action": "analyzeItem", "imageBase64": "..." }`  
* **Output**: `{ "status": "success", "data": { ...item_details, "image_url": "..." } }`

#### **Action 3: publishItem (Story A - 發布商品)**
* **Input**: `{ "action": "publishItem", "id": "...", "sellerId": "...", ... }`  
* **Logic**: 需驗證 sellerId 是否存在。
* **Output**: `{ "status": "success", "data": ... }`

#### **Action 4: searchItems (Story B - 搜尋)**
* **Input**: `{ "action": "searchItems", "query": "..." }`  
* **Output**: `{ "status": "success", "results": [...], "suggestWaitlist": boolean }`

#### **Action 5: addToWaitlist (Story B - 加入預約)**
* **Input**: `{ "action": "addToWaitlist", "requesterId": "...", ... }`  
* **Output**: `{ "status": "success" }`

#### **Action 6: registerLiffUser (Auth - LIFF 註冊)**
* **Input**: `{ "action": "registerLiffUser", "profile": { "line_user_id": "...", ... } }`
* **Logic**: 註冊新使用者或更新現有使用者資料。
* **Output**: `{ "status": "success", "data": { ...user_data } }`

#### **Action 7: verifyLineLogin (Auth - Web Login)**
* **Input**: `{ "action": "verifyLineLogin", "code": "...", "redirect_uri": "..." }`
* **Output**: `{ "status": "success", "data": { ...user_data } }`

#### **Action 8: User Data (Profile)**
* `getMyItems`: 取得特定使用者的上架商品。
* `getMyWaitlist`: 取得特定使用者的預約清單。
* `getItemContact`: 取得商品賣家的聯絡資訊 (需登入)。

## **7. 前端頁面規劃 (React SPA)**

### **UI Sections (React Router):**

1. **Home View (`/`)**:  
   - Hero Section: "Re:Uniform" 大標題。  
   - **Header**: 顯示登入按鈕或使用者頭像 (連結至 Profile)。
   - **最近上傳**: 顯示最新商品卡片。  
   - **最近需求**: 顯示最新預約需求。  
   - **Story B 入口**: Search Bar。  
   - **Story A 入口**: Big Floating Button (📸 賣制服)。  

2. **Upload View (`/upload`)**:  
   - **Protected**: 需登入才能訪問。
   - 拍照/上傳介面。  
   - Loading State (AI 分析中)。  
   - 編輯/確認表單。  
   - 發布成功頁面。  

3. **Result View (`/search`)**:  
   - 搜尋結果列表。  
   - Empty State: 顯示 [加入缺貨預約] 按鈕 (需登入)。  

4. **UserProfile View (`/profile`)**:  
   - **Protected**: 需登入才能訪問。
   - 顯示使用者基本資料 (頭像、名稱)。
   - **我的上架**: 管理已上架商品。
   - **我的預約**: 查看預約狀態。
   - 登出功能。

5. **Auth Callback (`/auth/callback`)**:
   - 處理 LINE Login Redirect 回調。

## **8. 開發注意事項**

1. **Cloudinary Setup**:  
   - 需在 Cloudinary Dashboard 建立一個 **Unsigned Upload Preset**。  
   - 將 Cloud Name 設定在 GAS Script Properties。

2. **LINE Login Setup**:
   - 在 LINE Developers Console 建立 LINE Login Channel。
   - 設定 Callback URL (Production & Localhost/ngrok)。
   - 開啟 LIFF App 並關聯 Channel。

3. **OpenAI Setup**:  
   - 確保 GAS Script Properties 中有有效的 `OPENAI_API_KEY`。  

4. **Testing**:
   - 後端測試位於 `backend/Code_test.gs` 與 `backend/LineAuthHelper_test.gs`。
   - 本地開發 LIFF 需使用 `ngrok` 提供 HTTPS URL。