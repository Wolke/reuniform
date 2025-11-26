# Re:Uniform 前端開發說明

## 環境設定

### 設定 Google Apps Script API URL

在專案根目錄創建 `.env.local` 檔案：

```bash
VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

替換 `YOUR_SCRIPT_ID` 為你的 Google Apps Script Web App URL。

或者直接修改 `src/api.js` 中的 `API_URL` 常數。

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 開啟瀏覽器訪問 http://localhost:5173/reuniform
```

## 部署到 GitHub Pages

```bash
# 建置並部署
npm run deploy
```

網站會自動部署到: `https://wolke.github.io/reuniform`

## 專案結構

```
src/
├── api.js              # API 配置與helper函式
├── App.jsx             # 路由配置
├── main.jsx            # 應用入口
├── index.css           # 全域樣式
└── components/
    ├── Home.jsx        # 首頁（顯示最近3筆）
    ├── Upload.jsx      # 上傳制服（AI分析）
    ├── Search.jsx      # 搜尋（NLP）
    ├── Items.jsx       # 完整商品列表
    ├── Waitlist.jsx    # 完整預約列表
    └── ItemCard.jsx    # 商品卡片元件
```

## 功能說明

### 首頁 (Home)
- 顯示最近上傳的 3 筆制服
- 顯示最近的 3 筆需求
- 搜尋框（傳到 Search 頁面）
- 浮動上傳按鈕（導到 Upload 頁面）
- 「更多」按鈕導向 Items 或 Waitlist 頁面

### 上傳 (Upload)
- 拍照或選擇圖片
- 自動轉 Base64
- 呼叫 OpenAI Vision API 分析
- 顯示 AI 填寫的結果
- 已自動上架（AI 分析時）

### 搜尋 (Search)
- 輸入自然語言（例如「海山國小女生運動服」）
- 呼叫 OpenAI NLP API 解析意圖
- 顯示符合的商品
- 無結果時顯示「加入預約」按鈕

### 商品列表 (Items)
- 顯示所有已上架的商品
- 使用 ItemCard 元件呈現

### 預約列表 (Waitlist)
- 顯示所有待媒合的需求
- 顯示學校、類型、尺寸資訊

## 注意事項

1. **Tailwind 使用 CDN**: 為了減少 build size，使用 CDN 而非 npm 安裝
2. **API URL 設定**: 記得設定正確的 Google Apps Script URL
3. **圖片上傳**: 圖片會轉為 Base64 上傳，大小建議不超過 5MB
4. **瀏覽器相容性**: 使用現代瀏覽器（Chrome, Edge, Safari, Firefox）

## 待優化項目

- [ ] 加入 loading skeleton
- [ ] 圖片懶載入
- [ ] 分頁功能（目前顯示所有資料）
- [ ] 錯誤處理優化
- [ ] PWA 支援
