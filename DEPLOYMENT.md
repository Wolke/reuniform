# Re:Uniform - 部署與設定指南

## 📋 概述

此專案已從 Vanilla JS 重構為 **React + Vite** 架構，並整合：
- ✅ **OpenAI API** (gpt-4o for vision, gpt-4o-mini for NLP)
- ✅ **Google Drive** 圖片儲存
- ✅ **Google Sheets** 資料庫
- ✅ **GitHub Pages** 前端託管

---

## 🎯 快速開始

### 1. 前端本地開發

```bash
cd /Users/chienhunglin/demo/reuniform

# 安裝依賴（需要清理磁碟空間）
npm install

# 啟動開發伺服器
npm run dev

# 建置生產版本
npm run build

# 部署到 GitHub Pages
npm run deploy
```

### 2. 後端設定 (Google Apps Script)

#### 步驟 A: 創建 Google Apps Script 專案

1. 前往 [Google Apps Script](https://script.google.com)
2. 點擊「新專案」
3. 複製以下檔案內容到對應的 Script 檔案：
   - `backend/Code.gs` → 主要 API 邏輯
   - `backend/DriveHelper.gs` → Google Drive 上傳功能

#### 步驟 B: 設定 Script Properties（API Key）

1. 在 Apps Script 編輯器中，點擊左側 **設定** (⚙️)
2. 選擇 **Script Properties** 頁籤
3. 新增以下屬性：

| Property | Value | 說明 |
|----------|-------|------|
| `OPENAI_API_KEY` | `sk-proj-xxxxx...` | 你的 OpenAI API Key |
| `DRIVE_FOLDER_ID` | (選填) | 若未設定，系統會自動創建資料夾 |

#### 步驟 C: 部署為 Web App

1. 點擊右上角「部署」→「新增部署」
2. 類型選擇：「網頁應用程式」
3. 設定：
   - **執行身分**: 我
   - **誰可以存取**: 任何人
4. 點擊「部署」
5. **複製 Web App URL**（例如：`https://script.google.com/macros/s/AKfycby.../exec`）

---

## 📊 資料庫設定 (Google Sheets)

### 創建 Google Sheet

1. 前往 [Google Sheets](https://sheets.google.com)
2. 創建新試算表，命名為 "Re_Uniform_Database"
3. 創建以下三個工作表（Tabs）：

### Tab 1: Items

複製 `backend/mock_data_items.csv` 內容，或手動創建表頭：

```
id | seller_id | school | type | gender | size | conditions | condition_score | defects | status | image_url | created_at
```

### Tab 2: Waitlist

複製 `backend/mock_data_waitlist.csv` 內容，或手動創建表頭：

```
id | requester_id | target_school | target_type | target_size | status | created_at
```

### Tab 3: Users

複製 `backend/mock_data_users.csv` 內容，或手動創建表頭：

```
uid | name | contact_info
```

### 連結 Sheet 到 Apps Script

1. 在 Google Apps Script 專案中
2. 點擊左側「編輯器」
3. 在 Code.gs 開頭確認已正確連結到你的 Google Sheet

---

## 🔧 前端環境變數設定

在 React 專案中，需要設定 Google Apps Script Web App URL。

創建 `src/config.js`：

```javascript
export const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

記得替換為你的實際 Web App URL。

---

## 🚀 部署流程

### GitHub Pages 部署

專案已配置自動部署腳本：

```bash
npm run deploy
```

這會：
1. 執行 `npm run build` 建置生產版本
2. 使用 `gh-pages` 套件將 `dist/` 資料夾部署到 `gh-pages` 分支
3. GitHub Pages 會自動從該分支提供網站服務

**訪問網址**：`https://wolke.github.io/reuniform`

### 注意事項

- 首次部署後，需要到 GitHub repo 設定中啟用 Pages (通常會自動啟用)
- Settings → Pages → Source: `gh-pages` branch
- 網站可能需要 1-2 分鐘才會生效

---

## ✅ 測試清單

### 後端測試

在 Google Apps Script 中執行 `testFullFlow()` 函式：

```javascript
// 在 Apps Script 編輯器中
// 選擇函式：testFullFlow
// 點擊「執行」
```

檢查日誌：
- ✅ OPENAI_API_KEY 已設定
- ✅ 可讀取 Recent Items
- ✅ 可解析搜尋意圖
- ✅ 可寫入 Waitlist

### Google Drive 測試

執行 `testDriveUpload()` 函式：

```javascript
// 測試圖片上傳功能
```

檢查：
- ✅ 資料夾 "Re_Uniform_Images" 已創建
- ✅ 測試圖片已上傳
- ✅ 返回的 URL 可正常訪問

### 前端測試

1. **本地測試**: `npm run dev`
   - ✅ 首頁正常載入
   - ✅ 可上傳圖片
   - ✅ AI 分析正常
   - ✅ 搜尋功能正常

2. **線上測試**: 訪問 `https://wolke.github.io/reuniform`
   - ✅ 所有路由正常
   - ✅ API 呼叫成功
   - ✅ 手機版顯示正常

---

## 🐛 常見問題

### Q: npm install 失敗（磁碟空間不足）

```bash
# 清理 npm cache
npm cache clean --force

# 刪除舊的 node_modules
rm -rf node_modules

# 重新安裝
npm install
```

### Q: OpenAI API 呼叫失敗

1. 檢查 Script Properties 中的 API Key 格式
2. 確認 OpenAI 帳戶有足夠額度
3. 查看 Apps Script 日誌了解詳細錯誤訊息

### Q: Google Drive 上傳失敗

1. 檢查 Apps Script 是否有 Drive 存取權限
2. 執行 `testDriveUpload()` 查看詳細錯誤
3. 確認 Drive 儲存空間足夠

### Q: GitHub Pages 顯示 404

1. 檢查 repo Settings → Pages 是否啟用
2. 確認 `vite.config.js` 中的 `base` 路徑正確
3. 等待 1-2 分鐘讓 Pages 完全部署

---

## 📝 開發筆記

### 已完成項目

- ✅ 移除舊的 Vanilla JS 檔案 (index.html, app.js, style.css)
- ✅ 初始化 React + Vite 專案
- ✅ 配置 GitHub Pages 部署
- ✅ 整合 OpenAI API (取代 Gemini)
- ✅ 實作 Google Drive 圖片上傳
- ✅ 創建 Mock Data CSV 檔案
- ✅ 更新系統規格書

### 待辦項目

- [ ] 建立 React 元件 (Home, Upload, Search, Items, Waitlist)
- [ ] 配置 Tailwind CSS
- [ ] 實作 React Router 路由
- [ ] 連接前端與後端 API
- [ ] 實作「更多」按鈕和分頁功能
- [ ] 手機版 UI 優化
- [ ] 完整測試流程

---

## 📚 相關連結

- [React 文件](https://react.dev/)
- [Vite 文件](https://vitejs.dev/)
- [Google Apps Script 文件](https://developers.google.com/apps-script)
- [OpenAI API 文件](https://platform.openai.com/docs)
- [Google Drive API (Apps Script)](https://developers.google.com/apps-script/reference/drive)
