# Re:Uniform - 二手制服交易平台

<div align="center">

👕 **讓制服找到新主人**

使用 AI 讓制服交易變簡單

[開始使用](#快速開始) · [功能介紹](#功能特色) · [技術架構](#技術堆疊)

</div>

---

## 專案簡介

**Re:Uniform** 是一個專為台灣家長設計的二手制服交易平台，透過 AI 技術簡化上架和搜尋流程：

- 📸 **AI 自動辨識**：拍照後自動填寫學校、尺寸、價格
- 💬 **白話文搜尋**：用自然語言搜尋，不用填複雜表單
- 🔔 **缺貨預約**：沒貨時加入等候清單，有貨立即通知

本專案為 Hackathon 快速原型，採用輕量化無伺服器架構，使用 Google 生態系（Sheets + Apps Script + Gemini AI）快速構建 MVP。

## 功能特色

### Story A: 賣家/捐贈者流程

1. 點擊「📸 賣制服」按鈕
2. 拍攝或上傳制服照片
3. AI 自動分析並填寫資料（學校、款式、尺寸、新舊狀況、建議售價）
4. 檢視並調整資料
5. 確認上架完成

### Story B: 買家/搜尋者流程

1. 在搜尋框輸入白話文需求（例：「海山國小三年級女生運動服」）
2. AI 自動解析搜尋意圖
3. 顯示符合的商品列表
4. 若無貨，可加入預約通知清單

## 技術堆疊

### Frontend
- **框架**: 純 HTML5、CSS3、Vanilla JavaScript (ES6+)
- **樣式**: Tailwind CSS (CDN)
- **字體**: Google Fonts - Noto Sans TC
- **部署**: GitHub Pages

### Backend
- **運算**: Google Apps Script (GAS)
- **資料庫**: Google Sheets
- **AI**: Gemini 2.0 Flash Experimental
  - Vision API（圖片辨識）
  - Text API（自然語言處理）

## 專案結構

```
reuniform/
├── index.html           # 主 HTML 頁面
├── style.css            # 自訂樣式
├── app.js               # 前端邏輯
├── backend/
│   ├── Code.gs          # Google Apps Script 後端程式碼
│   └── README_GAS_SETUP.md  # GAS 設定指南
├── assets/              # 資源檔案
└── README.md            # 本檔案
```

## 快速開始

### 1. 設定後端（Google Apps Script）

詳細步驟請參考 [backend/README_GAS_SETUP.md](backend/README_GAS_SETUP.md)

**簡要步驟：**
1. 建立 Google Sheet 並設定三個工作表（Items、Waitlist、Users）
2. 建立 Apps Script 專案，複製 `backend/Code.gs` 的內容
3. 填入您的 Gemini API Key
4. 部署為 Web App 並複製 URL

### 2. 設定前端

1. 開啟 `app.js` 檔案
2. 找到第 2 行：
   ```javascript
   const API_URL = "YOUR_GAS_WEB_APP_URL_HERE";
   ```
3. 替換為您的 GAS Web App URL

### 3. 本地測試

直接在瀏覽器開啟 `index.html` 即可測試。

### 4. 部署到 GitHub Pages

```bash
# 初始化 Git 倉庫（如果尚未初始化）
git init

# 添加檔案
git add .

# 提交
git commit -m "Initial commit: Re:Uniform system"

# 連結遠端倉庫（替換為您的倉庫 URL）
git remote add origin https://github.com/YOUR_USERNAME/reuniform.git

# 推送到 GitHub
git push -u origin main
```

然後在 GitHub 倉庫設定中啟用 GitHub Pages（選擇 main 分支）。

## 資料庫結構

### Items（商品表）
| 欄位 | 說明 |
|------|------|
| id | 商品 ID |
| seller_id | 賣家 ID |
| school | 學校名稱 |
| type | 類型（sport_top/uniform_bottom 等） |
| gender | 性別（M/F/U） |
| size | 尺寸 |
| price | 價格 |
| condition_score | 新舊程度（1-5） |
| defects | 瑕疵描述 |
| status | 狀態（published/sold） |
| created_at | 建立時間 |

### Waitlist（預約單）
| 欄位 | 說明 |
|------|------|
| id | 預約 ID |
| requester_id | 請求者 ID |
| target_school | 目標學校 |
| target_type | 目標類型 |
| target_size | 目標尺寸 |
| status | 狀態（active/fulfilled） |
| created_at | 建立時間 |

### Users（使用者）
| 欄位 | 說明 |
|------|------|
| uid | 使用者 ID |
| name | 姓名 |
| contact_info | 聯絡方式 |

## API 文檔

### uploadItem（上架商品）

**Request:**
```json
{
  "action": "uploadItem",
  "imageBase64": "data:image/jpeg;base64,...",
  "sellerId": "user_001"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "商品已成功上架！",
  "data": {
    "id": "item_xxx",
    "school": "新北市板橋區海山國小",
    "type": "sport_top",
    "gender": "F",
    "size": "140",
    "price": 150,
    "condition": 4,
    "defects": "無明顯瑕疵"
  }
}
```

### searchItems（搜尋商品）

**Request:**
```json
{
  "action": "searchItems",
  "query": "我要找海山國小女生的運動服"
}
```

**Response:**
```json
{
  "status": "success",
  "query": "我要找海山國小女生的運動服",
  "intent": {
    "school": "海山國小",
    "type": "sport_top",
    "gender": "F",
    "size_approx": "130-140"
  },
  "results": [...],
  "suggestWaitlist": false
}
```

### addToWaitlist（加入預約）

**Request:**
```json
{
  "action": "addToWaitlist",
  "school": "海山國小",
  "type": "sport_top",
  "size": "140",
  "requesterId": "user_001"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "已加入預約清單！當有符合的商品上架時，我們會通知您。",
  "data": {
    "id": "wait_xxx",
    "school": "海山國小",
    "type": "sport_top",
    "size": "140"
  }
}
```

## 開發指南

### 本地開發

由於本專案使用純 HTML/CSS/JS，可以直接在瀏覽器開啟 `index.html` 進行開發。

建議使用 VS Code 的 Live Server 擴充套件以獲得更好的開發體驗。

### 修改 GAS 程式碼

修改 `backend/Code.gs` 後：
1. 在 Apps Script 編輯器中儲存
2. 點擊「部署 → 管理部署作業」
3. 編輯部署並選擇「新版本」
4. 重新部署

### 樣式自訂

所有自訂樣式變數都在 `style.css` 的 `:root` 區塊中定義，可以輕鬆調整顏色主題：

```css
:root {
    --primary: #6366f1;
    --secondary: #ec4899;
    --accent: #f59e0b;
    /* ... */
}
```

## 常見問題

### Q: API 呼叫失敗怎麼辦？

**A:** 請檢查：
1. `app.js` 中的 `API_URL` 是否正確
2. GAS Web App 是否已部署且權限設定為「所有人」
3. Gemini API Key 是否有效
4. 在瀏覽器開發者工具的 Console 查看詳細錯誤訊息

### Q: AI 分析不準確？

**A:** Gemini API 的準確度取決於圖片品質和 Prompt 設計。可以調整 `Code.gs` 中的 Prompt 來優化結果。

### Q: 如何加入使用者認證？

**A:** 目前版本使用 Mock User ID。正式版本可以整合：
- Google Sign-In
- Firebase Authentication
- LINE Login

## 安全性注意事項

⚠️ **重要提醒**：

1. 目前 Gemini API Key 直接存在 GAS 腳本中，適合 Hackathon 或測試環境
2. 正式上線前應使用 Apps Script Properties Service 儲存敏感資訊
3. 考慮加入基本的 API 驗證機制（例如：token 驗證）
4. 限制 CORS 來源以防止未授權存取

## 未來規劃

- [ ] 使用者認證系統
- [ ] 即時聊天功能（買賣家溝通）
- [ ] 交易評價系統
- [ ] 推播通知（缺貨預約通知）
- [ ] 圖片上傳至 Cloud Storage
- [ ] 地圖定位（面交地點）
- [ ] 進階篩選（價格區間、新舊程度）

## 授權

MIT License

## 聯絡方式

如有問題或建議，歡迎透過 GitHub Issues 回報。

---

<div align="center">

**Made with ❤️ for Taiwan parents**

</div>
