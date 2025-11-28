# LIFF (LINE Front-end Framework) 設定指南

## 什麼是 LIFF?

LIFF 是 LINE 提供的前端框架,讓您可以在 LINE 應用程式中或外部瀏覽器中建立互動式網頁應用程式。相比傳統的 LINE Login OAuth 2.0,LIFF 提供了更簡單的實作方式。

## 為什麼選擇 LIFF?

✅ **簡單**: 完全在前端處理,無需複雜的後端 OAuth 流程  
✅ **無需 Callback URL**: 不會遇到 GitHub Pages 的路由問題  
✅ **用戶體驗好**: 在 LINE 內瀏覽器中提供無縫體驗  
✅ **支援 localStorage**: 自動保持登入狀態  

## 設定步驟

### 步驟 1: 創建 LIFF 應用

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇您的 Provider (如果沒有,請先創建一個)
3. 選擇您的 Channel (使用現有的 LINE Login Channel 或創建新的)
4. 點擊 **「LIFF」** 分頁
5. 點擊 **「Add」** 按鈕

### 步驟 2: 填寫 LIFF 應用資訊

**基本設定:**
- **LIFF app name**: `Re:Uniform` (或您喜歡的名稱)
- **Size**: `Full` (推薦,全屏顯示)
- **Endpoint URL**: 
  - 開發環境: `http://localhost:5173/`
  - 生產環境: `https://wolke.github.io/reuniform/`
- **Scope**: 
  - ✅ `profile` (必須,用於獲取使用者名稱和頭像)
  - ✅ `openid` (推薦,用於獲取使用者 ID)
- **Bot link feature**: `Off` (除非您有 LINE Bot)
- **Scan QR**: `Off`
- **Module mode**: `Off` (預設)

### 步驟 3: 取得 LIFF ID

創建完成後,您會看到 **LIFF ID**,格式類似: `1234567890-abcdefgh`

### 步驟 4: 設定環境變數

#### 開發環境 (`.env.local`)
```bash
VITE_LIFF_ID=1234567890-abcdefgh
```

#### 生產環境 (`.env.production`)
```bash
VITE_LIFF_ID=1234567890-abcdefgh
```

### 步驟 5: 測試

#### 本地測試
```bash
npm run dev
```

訪問 `http://localhost:5173/`,點擊「登入」按鈕

#### 生產環境測試
```bash
npm run deploy
```

訪問 `https://wolke.github.io/reuniform/`,點擊「登入」按鈕

## 使用方式

### 在 LINE 內測試
1. 在 LINE Developers Console 的 LIFF 頁面,點擊 LIFF ID 旁的 **「QR code」**
2. 用 LINE 掃描 QR code
3. 應該會在 LINE 內瀏覽器中開啟您的應用程式
4. 點擊「登入」應該會自動登入(因為已經在 LINE 內)

### 在外部瀏覽器測試
1. 訪問您的應用程式 URL
2. 點擊「登入」
3. 會跳轉到 LINE Login 頁面
4. 授權後會返回您的應用程式

## LIFF vs LINE Login OAuth 2.0

| 特性 | LIFF | LINE Login OAuth 2.0 |
|------|------|---------------------|
| 實作難度 | ⭐ 簡單 | ⭐⭐⭐ 複雜 |
| 後端需求 | ❌ 不需要 | ✅ 需要處理 callback |
| GitHub Pages | ✅ 完美支援 | ⚠️ 需要特殊處理 |
| LINE 內體驗 | ⭐⭐⭐ 優秀 | ⭐⭐ 良好 |
| 外部瀏覽器 | ⭐⭐ 良好 | ⭐⭐⭐ 優秀 |

## 常見問題

### Q: LIFF ID 在哪裡找?
A: LINE Developers Console → 您的 Channel → LIFF 分頁

### Q: 為什麼本地測試時登入後又登出?
A: 請確認:
1. LIFF Endpoint URL 設定正確
2. `.env.local` 中的 `VITE_LIFF_ID` 設定正確
3. 使用 `npm run dev` 啟動開發伺服器

### Q: 可以在電腦瀏覽器測試嗎?
A: 可以!LIFF 支援外部瀏覽器,會導向 LINE Login 頁面進行授權

### Q: 需要刪除之前的 LINE Login Channel 嗎?
A: 不需要,可以在同一個 Channel 下使用 LIFF

## 相關文件

- [LINE LIFF 官方文件](https://developers.line.biz/en/docs/liff/overview/)
- [LIFF SDK 參考](https://developers.line.biz/en/reference/liff/)
- [LIFF 最佳實踐](https://developers.line.biz/en/docs/liff/development-guidelines/)

## 技術支援

如果遇到問題:
1. 檢查瀏覽器 Console 是否有錯誤訊息
2. 確認 LIFF ID 設定正確
3. 確認 Endpoint URL 與當前訪問的 URL 一致
4. 查看 [LINE Developers FAQ](https://developers.line.biz/en/faq/)
