# LINE Login 設定教學

本文件說明如何在 LINE Developers Console 設定 LINE Login，以便 Re:Uniform 平台使用。

## 前置準備

1. LINE 帳號（個人帳號即可）
2. LINE Developers 帳號（使用 LINE 帳號登入）

## 步驟一：建立 LINE Developers 帳號

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 使用您的 LINE 帳號登入
3. 同意開發者條款

## 步驟二：建立 Provider（如果還沒有）

1. 點擊 **「Create a new provider」**
2. 輸入 Provider 名稱（例如：`Re:Uniform`）
3. 點擊 **「Create」**

## 步驟三：建立 LINE Login Channel

1. 在您的 Provider 頁面，點擊 **「Create a LINE Login channel」**
2. 填寫以下資訊：

### Channel 基本資訊
- **Channel type**: LINE Login
- **Provider**: 選擇您剛建立的 Provider
- **Company or owner's country or region**: Taiwan
- **Channel name**: `Re:Uniform` (或您想要的名稱)
- **Channel description**: `二手制服循環平台`
- **App types**: 勾選 **Web app**

### Channel icon（選填）
- 上傳應用程式圖示（建議 1024x1024 像素）

3. 閱讀並同意條款，點擊 **「Create」**

## 步驟四：設定 Callback URL

建立完成後，在 Channel 設定頁面：

1. 點擊 **「LINE Login」** 分頁
2. 找到 **「Callback URL」** 欄位
3. 點擊 **「Edit」**
4. 新增以下兩個 Callback URL：

```
http://localhost:5173/reuniform/auth/callback
https://wolke.github.io/reuniform/auth/callback
```

> **重要提醒**
> - 開發環境和生產環境都需要加入
> - 注意包含 `/reuniform` 這個 basename
> - URL 結尾是 `/auth/callback`

5. 點擊 **「Update」**

## 步驟五：取得 Channel ID 和 Channel Secret

在 **「Basic settings」** 分頁中：

1. **Channel ID**: `2008583001`（您已提供）
2. **Channel Secret**: 點擊 **「Issue」** 按鈕生成（如果還沒有）

## 步驟六：設定 Google Apps Script

1. 開啟您的 Google Apps Script 專案
2. 點擊左側的 **「專案設定」**（齒輪圖示）
3. 在 **「指令碼屬性」** 區段，點擊 **「新增指令碼屬性」**
4. 新增以下兩個屬性：

| 屬性名稱 | 值 |
|---------|-----|
| `LINE_CHANNEL_ID` | `2008583001` |
| `LINE_CHANNEL_SECRET` | 您的 Channel Secret（從 LINE Developers Console 複製） |

5. 點擊 **「儲存指令碼屬性」**

## 步驟七：更新本地環境變數

確認 `.env.local` 檔案包含：

```bash
VITE_LINE_CHANNEL_ID=2008583001
VITE_LINE_CALLBACK_URL=http://localhost:5173/reuniform/auth/callback
VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## 測試登入流程

1. 執行 `npm run dev` 啟動開發伺服器
2. 開啟 `http://localhost:5173/reuniform`
3. 點擊右上角的 **「登入」** 按鈕
4. 應該會跳轉到 LINE 授權頁面
5. 授權後會返回應用程式並完成登入

## 常見問題

### Q: Callback URL 設定錯誤會怎樣？
A: 會在 OAuth 流程中收到 `redirect_uri_mismatch` 錯誤。請確認：
- URL 必須完全一致（包含 http/https、路徑等）
- 已在 LINE Developers Console 中新增該 URL

### Q: 為什麼需要兩個 Callback URL？
A: 一個用於本地開發（localhost），一個用於生產環境（GitHub Pages）

### Q: 如何取得 Channel Secret？
A: 在 LINE Developers Console 的 Basic settings 分頁，Channel secret 區段點擊 「Issue」按鈕

### Q: 忘記 Channel Secret 怎麼辦？
A: 可以重新 Issue 一個新的，但記得要同步更新 Google Apps Script 中的設定

## 相關文件

- [LINE Login 官方文件](https://developers.line.biz/en/docs/line-login/)
- [LINE Login API Reference](https://developers.line.biz/en/reference/line-login/)
- [OAuth 2.0 Authorization Code Flow](https://developers.line.biz/en/docs/line-login/integrate-line-login/#making-an-authorization-request)

## 需要協助？

如果遇到問題，請檢查：
1. Callback URL 是否正確設定
2. Channel ID 和 Secret 是否正確
3. Google Apps Script 的 Script Properties 是否設定正確
4. 瀏覽器 Console 是否有錯誤訊息
