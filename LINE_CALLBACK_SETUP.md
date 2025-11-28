# LINE Login Callback 配置說明

## 問題背景
GitHub Pages 是靜態托管服務,無法處理 React Router 的動態路由(如 `/auth/callback`)。當 LINE Login 回調到 `https://wolke.github.io/reuniform/auth/callback` 時會出現 404 錯誤。

## 解決方案

我們採用了兩種方案來解決這個問題:

### 方案 1: 主頁面處理 Callback (主要方案)
將 LINE callback URL 設定為主頁面 `https://wolke.github.io/reuniform/`,然後在 `Home.jsx` 中檢測 URL 參數來處理登入:

1. **Callback URL**: `https://wolke.github.io/reuniform/`
2. **處理邏輯**: `src/components/Home.jsx` 中的 `useEffect` hook
3. **優點**: 簡單直接,無需額外配置

### 方案 2: 404.html 重定向 (備用方案)
使用 GitHub Pages 的 404.html 特性,將所有 404 請求重定向到 index.html:

1. **404 處理**: `public/404.html`
2. **路由恢復**: `index.html` 中的重定向腳本
3. **優點**: 支援所有 React Router 路由

## LINE Developers Console 配置

請在 [LINE Developers Console](https://developers.line.biz/console/) 中設定:

### Callback URL
```
https://wolke.github.io/reuniform/
```

### 其他設定
- **Channel ID**: `2008583001` (已設定在 `.env.production`)
- **Channel Secret**: 請在 Google Apps Script Properties 中設定 `LINE_CHANNEL_SECRET`

## 環境變數

### `.env.production`
```bash
VITE_LINE_CHANNEL_ID=2008583001
VITE_LINE_CALLBACK_URL=https://wolke.github.io/reuniform/
```

### Google Apps Script Properties
在 Apps Script 專案中設定:
- `LINE_CHANNEL_ID` = `2008583001`
- `LINE_CHANNEL_SECRET` = `你的 Channel Secret`

## 部署步驟

1. 確認環境變數已正確設定
2. 在 LINE Developers Console 設定 Callback URL
3. 執行部署:
   ```bash
   npm run deploy
   ```

## 測試流程

1. 訪問 https://wolke.github.io/reuniform/
2. 點擊「登入」按鈕
3. 完成 LINE Login 授權
4. 應該會重定向回主頁面並顯示登入成功訊息

## 相關文件

- `src/components/Home.jsx` - 主頁面 + Callback 處理
- `src/components/AuthCallback.jsx` - 獨立 Callback 頁面(保留,但 GitHub Pages 不使用)
- `public/404.html` - GitHub Pages 404 處理
- `index.html` - SPA 路由重定向腳本
- `backend/LineAuthHelper.gs` - 後端 LINE Login 驗證
