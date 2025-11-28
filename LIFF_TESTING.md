# LIFF 登入測試指南

## 🎯 測試目標

驗證 LIFF 登入功能是否正常運作。

## ✅ 當前狀態

- **LIFF ID**: `2008583001-z76qJ0OL`
- **部署狀態**: ✅ 成功
- **構建版本**: `index-BYhuqXct.js` (197.17 kB)
- **部署時間**: 2025-11-28 11:20

## 🧪 測試步驟

### 方法 1: 在 LINE 內測試 (推薦)

這是 LIFF 的最佳使用方式,用戶體驗最好。

1. **獲取 LIFF URL**
   ```
   https://liff.line.me/2008583001-z76qJ0OL
   ```

2. **在 LINE 中開啟**
   - 方法 A: 將 LIFF URL 傳送給朋友或自己,然後點擊
   - 方法 B: 在 LINE Developers Console 掃描 LIFF QR code
   - 方法 C: 使用 LINE 內的任何聊天室傳送連結給自己

3. **預期結果**
   - ✅ 頁面在 LINE 內瀏覽器開啟
   - ✅ 點擊「登入」後自動登入(無需額外授權)
   - ✅ 顯示您的 LINE 頭像和名稱
   - ✅ 可以正常使用所有功能

### 方法 2: 在一般瀏覽器測試

1. **開啟網址**
   ```
   https://wolke.github.io/reuniform/
   ```

2. **開啟開發者工具**
   - Chrome/Edge: `F12` 或 `Cmd+Option+I` (Mac)
   - Safari: `Cmd+Option+I`

3. **檢查控制台訊息**
   應該看到:
   ```
   ✅ LIFF SDK initialized successfully
   ```
   
   如果看到錯誤,請記下錯誤訊息。

4. **點擊「登入」按鈕**
   - 如果按鈕顯示「載入中...」,表示 LIFF 未初始化
   - 如果按鈕顯示「登入」,可以點擊

5. **預期流程**
   - ✅ 跳轉到 LINE Login 頁面
   - ✅ 輸入 LINE 帳號密碼 (或使用二維碼)
   - ✅ 授權後返回網站
   - ✅ 顯示登入成功訊息
   - ✅ 顯示您的頭像和名稱

### 方法 3: 使用 LIFF Inspector (開發者工具)

LINE 提供了官方的 LIFF 測試工具。

1. **開啟 LIFF Inspector**
   ```
   https://liff.line.me/2008583001-z76qJ0OL?liffInspector=true
   ```

2. **功能**
   - 查看 LIFF 初始化狀態
   - 查看使用者資訊
   - 測試 LIFF API 呼叫
   - 查看錯誤訊息

## 🔍 除錯檢查清單

如果登入無法運作,請檢查:

### 前端檢查

- [ ] LIFF SDK 是否載入? (檢查 Network 分頁是否有 `sdk.js`)
- [ ] 控制台是否有 LIFF 初始化訊息?
- [ ] 控制台是否有錯誤訊息?
- [ ] `.env.production` 中的 LIFF ID 是否正確?
- [ ] 登入按鈕狀態如何? (載入中/登入/已登入)

### LINE Developers Console 檢查

- [ ] LIFF 應用狀態是否為「Active」?
- [ ] Endpoint URL 是否設定為 `https://wolke.github.io/reuniform/`?
- [ ] Scope 是否包含 `profile` 和 `openid`?
- [ ] Size 設定是否為 `Full`?

### 網路檢查

- [ ] 是否在中國大陸? (LINE 服務可能被封鎖)
- [ ] 網路連線是否正常?
- [ ] 是否使用 VPN 或代理?

## 🐛 常見問題排解

### 問題 1: 「LIFF ID is not configured」

**原因**: LIFF ID 未正確設定

**解決方法**:
1. 檢查 `.env.production` 內容
2. 重新執行 `npm run build && npm run deploy`

### 問題 2: 登入按鈕一直顯示「載入中...」

**原因**: LIFF 初始化失敗

**可能原因**:
- LIFF ID 錯誤
- Endpoint URL 不符
- 網路問題

**解決方法**:
1. 打開控制台查看錯誤訊息
2. 確認 LIFF ID 和 Endpoint URL 正確

### 問題 3: 點擊登入沒反應

**原因**: JavaScript 錯誤或 LIFF 未載入

**解決方法**:
1. 檢查控制台錯誤
2. 確認 `liff-auth.js` 正確載入
3. 清除瀏覽器快取重試

### 問題 4: 登入後立即登出

**原因**: localStorage 被清除或 token 過期

**解決方法**:
1. 檢查瀏覽器是否允許 localStorage
2. 確認不在無痕模式

## 📊 測試報告範本

測試完成後,請填寫:

```
測試時間: ___________
測試方法: □ LINE 內 □ 一般瀏覽器 □ LIFF Inspector
瀏覽器: ___________
LIFF 初始化: □ 成功 □ 失敗
登入功能: □ 成功 □ 失敗
錯誤訊息 (如有):
___________________________________________

其他備註:
___________________________________________
```

## 📸 測試截圖

部署成功截圖:
![Re:Uniform 首頁](/Users/wolkebidian/.gemini/antigravity/brain/24642748-db53-4354-9abf-1915d9ad2a27/reuniform_home_1764300069794.png)

## 🎬 測試錄影

瀏覽器測試錄影:
![LIFF 登入測試](/Users/wolkebidian/.gemini/antigravity/brain/24642748-db53-4354-9abf-1915d9ad2a27/liff_login_test_1764300051106.webp)

## 📞 需要協助?

如果測試遇到問題:
1. 記錄完整的錯誤訊息
2. 提供截圖
3. 說明您的測試環境 (瀏覽器、設備等)
