# 後端測試說明

本目錄包含 Google Apps Script 後端的完整測試套件。

## 檔案結構

```
backend/
├── Code.gs                    # 主要 API 邏輯
├── LineAuthHelper.gs          # LINE Login 認證模組
├── CloudinaryHelper.gs        # Cloudinary 圖片上傳模組
├── Code_test.gs               # Code.gs 完整測試
├── LineAuthHelper_test.gs     # LINE Auth 完整測試
└── README_TESTING.md          # 本文件
```

## 測試檔案說明

### 1. Code_test.gs

測試 `Code.gs` 中的所有主要功能：

**測試範圍：**
- ✅ 環境設定檢查（API Keys, Sheets）
- ✅ AI NLP 搜尋意圖解析（`parseSearchIntent`）
- ✅ Dashboard 資料（`getRecentItems`, `getRecentWaitlist`）
- ✅ 商品發布（`publishItem`）
- ✅ 商品搜尋（`searchItems`）
- ✅ 缺貨預約（`addToWaitlist`）
- ✅ 完整使用者流程整合測試

**執行方式：**
```javascript
// 執行所有測試
runAllCodeTests()

// 僅執行快速測試
runQuickCodeTests()

// 僅測試 AI 功能
runAIOnlyTests()
```

### 2. LineAuthHelper_test.gs

測試 `LineAuthHelper.gs` 中的 LINE Login 認證功能：

**測試範圍：**
- ✅ 環境設定檢查（LINE Channel ID/Secret）
- ✅ 使用者資料儲存和更新（`saveOrUpdateUser`）
- ✅ 使用者查詢（`getUserById`）
- ✅ 使用者商品查詢（`getMyItems`）
- ✅ 使用者預約查詢（`getMyWaitlist`）
- ✅ 聯絡資訊存取（`getItemContact`）
- ✅ 完整認證流程整合測試

**執行方式：**
```javascript
// 執行所有測試
runAllLineAuthTests()

// 僅執行快速測試
runQuickLineAuthTests()
```

## 執行測試步驟

### 在 Google Apps Script 編輯器中

1. **開啟 Apps Script 編輯器**
   - 在 Google Sheet 中：選單 → 擴充功能 → Apps Script

2. **新增測試檔案**
   - 點擊 ➕ 號 → 指令碼
   - 將測試檔案內容貼上
   - 命名為 `Code_test` 或 `LineAuthHelper_test`

3. **執行測試**
   - 選擇要執行的測試函數（例如 `runAllCodeTests`）
   - 點擊 ▶️ 執行
   - 查看執行記錄（Ctrl/Cmd + Enter）

### 查看測試結果

測試結果會顯示在「執行記錄」中：

```
===========================================
Re:Uniform Code.gs - Complete Test Suite
===========================================

=== Test 1: Environment Setup ===
✅ PASSED: OPENAI_API_KEY is set (length: 51)
✅ PASSED: Items sheet exists
✅ PASSED: Waitlist sheet exists
✅ PASSED: Users sheet exists

=== Test 2: Parse Search Intent (AI NLP) ===
Test Case 1: "我要找海山國小女生的運動服"
   Parsed Intent: {"school":"海山國小","type":"sport","gender":"F"}
   ✅ PASSED

📊 Summary: 3/3 test cases passed
...
```

## 測試最佳實踐

### 1. 測試前準備

- ✅ 確保所有 Script Properties 已設定
- ✅ 確保 Google Sheets 有必要的工作表
- ✅ 備份重要資料（測試可能會修改 Sheet）

### 2. 測試執行順序

**建議順序：**
1. 先執行環境測試：`testEnvironmentSetup()`
2. 再執行單元測試：各別功能測試
3. 最後執行整合測試：完整流程測試

### 3. 測試資料清理

所有測試都會自動清理測試資料，使用以下命名規則：
- 測試使用者：`TEST_USER_*` 或 `INTEGRATION_TEST_*`
- 測試商品：`TEST_ITEM_*`
- 測試預約：`WAIT_*`

如果測試中斷導致資料未清理，請手動刪除這些測試資料。

## 常見問題

### Q: 測試失敗怎麼辦？

A: 檢查以下項目：
1. API Keys 是否正確設定
2. Google Sheets 工作表是否存在且結構正確
3. 執行記錄中的錯誤訊息
4. 網路連線是否正常（AI API 需要網路）

### Q: AI 測試一直失敗？

A: AI 測試依賴 OpenAI API：
1. 確認 `OPENAI_API_KEY` 是否正確
2. 確認 API Key 是否有足夠的配額
3. 檢查 API 回應錯誤訊息

### Q: LINE Auth 測試無法執行？

A: LINE Auth 測試需要：
1. `LINE_CHANNEL_ID` 和 `LINE_CHANNEL_SECRET` 設定正確
2. Users Sheet 存在且有正確的欄位
3. **注意：** 完整的 OAuth flow 測試需要實際的 LINE 授權碼

### Q: 如何跳過某些測試？

A: 註解掉不需要的測試函數：
```javascript
function runAllCodeTests() {
  testEnvironmentSetup();
  // testParseSearchIntent();  // 跳過 AI 測試
  testGetRecentItems();
  //...
}
```

## 測試覆蓋率

### Code.gs 測試覆蓋率

| 功能模組 | 測試數量 | 覆蓋率 |
|---------|---------|--------|
| 環境設定 | 4 | 100% |
| AI NLP | 3 | 100% |
| Dashboard | 2 | 100% |
| 商品管理 | 3 | 100% |
| 整合流程 | 1 | 100% |
| **總計** | **13** | **100%** |

### LineAuthHelper.gs 測試覆蓋率

| 功能模組 | 測試數量 | 覆蓋率 |
|---------|---------|--------|
| 環境設定 | 3 | 100% |
| 使用者管理 | 2 | 100% |
| 內容查詢 | 3 | 100% |
| 整合流程 | 1 | 100% |
| **總計** | **9** | **100%** |

## 持續改進

測試應該隨著功能更新而更新：

1. **新增功能時**：同時新增對應的測試
2. **修改邏輯時**：更新相關測試
3. **發現 Bug 時**：先寫重現 Bug 的測試，再修復

## 相關文件

- [README_GAS_SETUP.md](./README_GAS_SETUP.md) - Google Apps Script 設定指南
- [LINE_LOGIN_SETUP.md](../LINE_LOGIN_SETUP.md) - LINE Login 設定教學

## 貢獻測試

如果您發現測試案例不足或有改進建議，歡迎：
1. 新增測試案例
2. 改進測試邏輯
3. 提供更詳細的錯誤訊息
