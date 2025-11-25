/**
 * Re:Uniform - Google Apps Script Backend
 * 二手制服交易平台後端 API
 */

// ==================== 設定區 ====================
const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; // 請替換為您的 Gemini API Key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

// Sheet 名稱
const SHEET_ITEMS = "Items";
const SHEET_WAITLIST = "Waitlist";
const SHEET_USERS = "Users";

// ==================== 主要 API 入口 ====================

/**
 * doPost - 處理所有 POST 請求
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    let response;
    
    switch(action) {
      case "uploadItem":
        response = uploadItem(params);
        break;
      case "searchItems":
        response = searchItems(params);
        break;
      case "addToWaitlist":
        response = addToWaitlist(params);
        break;
      case "getRecentItems":
        response = getRecentItems();
        break;
      case "getRecentWaitlist":
        response = getRecentWaitlist();
        break;
      default:
        response = {
          status: "error",
          message: "Unknown action: " + action
        };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * doGet - 用於測試連線
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      message: "Re:Uniform API is running",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== Story A: 上架制服 (AI 視覺辨識) ====================

/**
 * uploadItem - 使用 AI 分析制服圖片並上架
 * @param {Object} params - { imageBase64: string, sellerId?: string }
 */
function uploadItem(params) {
  try {
    const imageBase64 = params.imageBase64;
    const sellerId = params.sellerId || "user_001"; // Mock User
    
    if (!imageBase64) {
      return { status: "error", message: "缺少圖片資料" };
    }
    
    // 移除 data:image/xxx;base64, 前綴（如果有的話）
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // 呼叫 Gemini Vision API 分析圖片
    const aiResult = analyzeUniformImage(base64Data);
    
    if (!aiResult) {
      return { status: "error", message: "AI 分析失敗，請重試" };
    }
    
    // 寫入 Items Sheet
    const itemId = "item_" + new Date().getTime();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
    
    const newRow = [
      itemId,
      sellerId,
      aiResult.school || "未知學校",
      aiResult.type || "unknown",
      aiResult.gender || "U",
      aiResult.size || "M",
      aiResult.suggested_price || 100,
      aiResult.condition || 3,
      aiResult.defects || "無",
      "published",
      "data:image/jpeg;base64," + base64Data.substring(0, 100) + "...", // 儲存部分 base64 作為示意
      new Date().toLocaleDateString('zh-TW')
    ];
    
    sheet.appendRow(newRow);
    
    return {
      status: "success",
      message: "商品已成功上架！",
      data: {
        id: itemId,
        school: aiResult.school,
        type: aiResult.type,
        gender: aiResult.gender,
        size: aiResult.size,
        price: aiResult.suggested_price,
        condition: aiResult.condition,
        defects: aiResult.defects
      }
    };
    
  } catch (error) {
    Logger.log("Error in uploadItem: " + error.toString());
    return { status: "error", message: "上架失敗: " + error.toString() };
  }
}

/**
 * analyzeUniformImage - 使用 Gemini Vision API 分析制服圖片
 * @param {string} base64Image - Base64 編碼的圖片
 * @returns {Object} 分析結果
 */
function analyzeUniformImage(base64Image) {
  try {
    const prompt = `請分析這張台灣學校制服照片，並以 JSON 格式回傳以下資訊：

{
  "school": "學校全名（例如：新北市板橋區海山國小）",
  "type": "制服類型（sport_top/sport_bottom/uniform_top/uniform_bottom/dress/jacket）",
  "gender": "性別（M/F/U）",
  "size": "尺寸（例如：130/140/150/S/M/L）",
  "condition": "新舊程度1-5分（5為全新）",
  "defects": "瑕疵描述（若無則填'無明顯瑕疵'）",
  "suggested_price": "建議售價（新台幣，數字）"
}

請根據圖片內容盡可能準確判斷，若無法確定某項資訊，請給予合理推測。`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
      }
    };
    
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(GEMINI_API_URL + "?key=" + GEMINI_API_KEY, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.candidates && result.candidates.length > 0) {
      const text = result.candidates[0].content.parts[0].text;
      // 提取 JSON（移除可能的 markdown 格式）
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log("Error in analyzeUniformImage: " + error.toString());
    return null;
  }
}

// ==================== Story B: 搜尋制服 (NLP 語意理解) ====================

/**
 * searchItems - 使用 AI 解析搜尋意圖並篩選商品
 * @param {Object} params - { query: string }
 */
function searchItems(params) {
  try {
    const query = params.query;
    
    if (!query) {
      return { status: "error", message: "請輸入搜尋內容" };
    }
    
    // 使用 Gemini NLP 解析搜尋意圖
    const intent = parseSearchIntent(query);
    
    if (!intent) {
      return { status: "error", message: "無法理解搜尋內容，請重新描述" };
    }
    
    // 從 Items Sheet 讀取所有商品
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
    const data = sheet.getDataRange().getValues();
    
    // 跳過標題行，篩選商品
    const results = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const item = {
        id: row[0],
        seller_id: row[1],
        school: row[2],
        type: row[3],
        gender: row[4],
        size: row[5],
        price: row[6],
        condition_score: row[7],
        defects: row[8],
        status: row[9],
        created_at: row[11]
      };
      
      // 只搜尋已發布的商品
      if (item.status !== "published") continue;
      
      // 簡單的篩選邏輯
      let match = true;
      
      if (intent.school && item.school.indexOf(intent.school) === -1) {
        match = false;
      }
      
      if (intent.type && item.type !== intent.type) {
        match = false;
      }
      
      if (intent.gender && item.gender !== intent.gender && item.gender !== 'U') {
        match = false;
      }
      
      if (match) {
        results.push(item);
      }
    }
    
    return {
      status: "success",
      query: query,
      intent: intent,
      results: results,
      suggestWaitlist: results.length === 0
    };
    
  } catch (error) {
    Logger.log("Error in searchItems: " + error.toString());
    return { status: "error", message: "搜尋失敗: " + error.toString() };
  }
}

/**
 * parseSearchIntent - 使用 Gemini NLP 解析搜尋意圖
 * @param {string} query - 使用者搜尋的白話文
 * @returns {Object} 解析結果
 */
function parseSearchIntent(query) {
  try {
    const prompt = `請分析以下台灣家長搜尋二手制服的需求，提取關鍵資訊並以 JSON 格式回傳：

搜尋內容：「${query}」

請回傳 JSON 格式：
{
  "school": "學校名稱（提取關鍵字，例如：海山國小）",
  "type": "制服類型（sport_top/sport_bottom/uniform_top/uniform_bottom/dress/jacket，若未提及則為null）",
  "gender": "性別（M/F/U，若未提及則為null）",
  "size_approx": "大約尺寸（例如：130-140，若未提及則為null）"
}

只回傳 JSON，不要其他說明。`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 1,
        maxOutputTokens: 512,
      }
    };
    
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(GEMINI_API_URL + "?key=" + GEMINI_API_KEY, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.candidates && result.candidates.length > 0) {
      const text = result.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log("Error in parseSearchIntent: " + error.toString());
    return null;
  }
}

// ==================== Story B: 加入缺貨預約 ====================

/**
 * addToWaitlist - 將需求加入缺貨預約清單
 * @param {Object} params - { school, type, size, requesterId }
 */
function addToWaitlist(params) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_WAITLIST);
    
    const waitlistId = "wait_" + new Date().getTime();
    const requesterId = params.requesterId || "user_001"; // Mock User
    
    const newRow = [
      waitlistId,
      requesterId,
      params.school || "未指定",
      params.type || "未指定",
      params.size || "未指定",
      "active",
      new Date().toLocaleDateString('zh-TW')
    ];
    
    sheet.appendRow(newRow);
    
    return {
      status: "success",
      message: "已加入預約清單！當有符合的商品上架時，我們會通知您。",
      data: {
        id: waitlistId,
        school: params.school,
        type: params.type,
        size: params.size
      }
    };
    
  } catch (error) {
    Logger.log("Error in addToWaitlist: " + error.toString());
    return { status: "error", message: "加入預約失敗: " + error.toString() };
  }
}

// ==================== Dashboard Data ====================

/**
 * getRecentItems - 取得最新上架商品
 */
function getRecentItems() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
    const data = sheet.getDataRange().getValues();
    
    // 跳過標題行
    const items = [];
    // 從最後一行開始往前讀取（最新的在後面）
    for (let i = data.length - 1; i >= 1; i--) {
      if (items.length >= 10) break; // 只取前 10 筆
      
      const row = data[i];
      if (row[9] === "published") { // 只取已發布
        items.push({
          id: row[0],
          school: row[2],
          type: row[3],
          gender: row[4],
          size: row[5],
          price: row[6],
          condition_score: row[7],
          defects: row[8],
          created_at: row[11]
        });
      }
    }
    
    return {
      status: "success",
      data: items
    };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}

/**
 * getRecentWaitlist - 取得最新預約需求
 */
function getRecentWaitlist() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_WAITLIST);
    const data = sheet.getDataRange().getValues();
    
    const requests = [];
    for (let i = data.length - 1; i >= 1; i--) {
      if (requests.length >= 10) break;
      
      const row = data[i];
      if (row[5] === "active") {
        requests.push({
          id: row[0],
          school: row[2],
          type: row[3],
          size: row[4],
          created_at: row[6]
        });
      }
    }
    
    return {
      status: "success",
      data: requests
    };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}
