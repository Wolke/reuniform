/**
 * Re:Uniform - Google Apps Script Backend
 * 二手制服交易平台後端 API
 */

// ==================== 設定區 ====================
const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// LINE Login Configuration (used by LineAuthHelper.gs)
const LINE_CHANNEL_ID = PropertiesService.getScriptProperties().getProperty("LINE_CHANNEL_ID");
const LINE_CHANNEL_SECRET = PropertiesService.getScriptProperties().getProperty("LINE_CHANNEL_SECRET");

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
      case "analyzeItem":
        response = analyzeItem(params);
        break;
      case "publishItem":
        response = publishItem(params);
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
      case "verifyLineLogin":
        response = verifyLineLogin(params);
        break;
      case "registerLiffUser":
        response = registerLiffUser(params);
        break;
      case "getMyItems":
        response = getMyItems(params);
        break;
      case "getMyWaitlist":
        response = getMyWaitlist(params);
        break;
      case "getItemContact":
        response = getItemContact(params);
        break;
      case "updateContactInfo":
        response = updateContactInfo(params);
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
 * uploadItem - 使用 AI 分析制服圖片並上傳到 Cloudinary
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
    
    // 生成商品 ID
    const itemId = "item_" + new Date().getTime();
    
    // 1. 上傳圖片到 Cloudinary（在 AI 分析之前，這樣即使 AI 失敗圖片也已保存）
    let imageUrl;
    try {
      imageUrl = uploadImageToCloudinary(base64Data, itemId);
    } catch(cloudinaryError) {
      Logger.log("Cloudinary upload error: " + cloudinaryError.toString());
      return { status: "error", message: "圖片上傳失敗: " + cloudinaryError.toString() };
    }
    
    // 2. 呼叫 OpenAI Vision API 分析圖片
    const aiResult = analyzeUniformImage(base64Data);
    
    if (!aiResult) {
      return { status: "error", message: "AI 分析失敗，請重試" };
    }
    
    // 3. 寫入 Items Sheet（儲存 Cloudinary URL）
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
    
    const newRow = [
      itemId,
      sellerId,
      aiResult.school || "未知學校",
      aiResult.type || "unknown",
      aiResult.gender || "U",
      aiResult.size || "M",
      aiResult.suggested_conditions || "可議", 
      aiResult.condition || 3,
      aiResult.defects || "無",
      "published",
      imageUrl, // 儲存 Cloudinary URL
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
        conditions: aiResult.suggested_conditions,
        condition: aiResult.condition,
        defects: aiResult.defects,
        image_url: imageUrl
      }
    };
    
  } catch (error) {
    Logger.log("Error in uploadItem: " + error.toString());
    return { status: "error", message: "上架失敗: " + error.toString() };
  }
}

/**
 * analyzeItem - 使用 AI 分析制服圖片，但不儲存到 Sheet
 * @param {Object} params - { imageBase64: string }
 */
function analyzeItem(params) {
  try {
    const imageBase64 = params.imageBase64;
    
    if (!imageBase64) {
      return { status: "error", message: "缺少圖片資料" };
    }
    
    // 移除 data:image/xxx;base64, 前綴
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // 生成商品 ID
    const itemId = "item_" + new Date().getTime();
    
    // 1. 上傳圖片到 Cloudinary
    let imageUrl;
    try {
      imageUrl = uploadImageToCloudinary(base64Data, itemId);
    } catch(cloudinaryError) {
      Logger.log("Cloudinary upload error: " + cloudinaryError.toString());
      return { status: "error", message: "圖片上傳失敗: " + cloudinaryError.toString() };
    }
    
    // 2. 呼叫 OpenAI Vision API 分析圖片
    const aiResult = analyzeUniformImage(base64Data);
    
    if (!aiResult) {
      return { status: "error", message: "AI 分析失敗，請重試" };
    }
    
    // 回傳分析結果，但不寫入 Sheet
    return {
      status: "success",
      data: {
        id: itemId,
        school: aiResult.school,
        type: aiResult.type,
        gender: aiResult.gender,
        size: aiResult.size,
        conditions: aiResult.suggested_conditions,
        condition: aiResult.condition,
        defects: aiResult.defects,
        image_url: imageUrl
      }
    };
    
  } catch (error) {
    Logger.log("Error in analyzeItem: " + error.toString());
    return { status: "error", message: "分析失敗: " + error.toString() };
  }
}

/**
 * publishItem - 將確認後的商品資訊寫入 Sheet
 * @param {Object} params - 商品資訊
 */
function publishItem(params) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ITEMS);
    const sellerId = params.sellerId || "user_001"; // Mock User
    
    // 確保必要欄位存在
    if (!params.id || !params.image_url) {
      return { status: "error", message: "缺少必要欄位 (id, image_url)" };
    }
    
    const newRow = [
      params.id,
      sellerId,
      params.school || "未知學校",
      params.type || "unknown",
      params.gender || "U",
      params.size || "M",
      params.conditions || "可議", 
      params.condition || 3,
      params.defects || "無",
      "published",
      params.image_url,
      new Date().toLocaleDateString('zh-TW')
    ];
    
    sheet.appendRow(newRow);
    
    return {
      status: "success",
      message: "商品已成功上架！",
      data: params
    };
    
  } catch (error) {
    Logger.log("Error in publishItem: " + error.toString());
    return { status: "error", message: "上架失敗: " + error.toString() };
  }
}

/**
 * analyzeUniformImage - 使用 OpenAI Vision API 分析制服圖片
 * @param {string} base64Image - Base64 編碼的圖片
 * @returns {Object} 分析結果
 */
function analyzeUniformImage(base64Image) {
  try {
    const prompt = `請分析這張台灣學校制服照片，並以 JSON 格式回傳以下資訊：

{
  "school": "學校全名（例如：新北市板橋區海山國小）",
  "type": "制服類型（sport_top_short/sport_top_long/sport_bottom_short/sport_bottom_long/uniform_top_short/uniform_top_long/uniform_bottom_short/uniform_bottom_long/uniform_skirt/dress/jacket）",
  "gender": "性別（M/F/U）",
  "size": "尺寸（例如：130/140/150/S/M/L）",
  "condition": "新舊程度1-5分（5為全新）",
  "defects": "瑕疵描述（若無則填'無明顯瑕疵'）",
  "suggested_conditions": "建議交換條件（例如：免費、換飲料、100元，預設為'可議'）"
}

請根據圖片內容盡可能準確判斷，若無法確定某項資訊，請給予合理推測。`;

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024
    };
    
    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(OPENAI_API_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      Logger.log("OpenAI API Error: " + responseText);
      return null;
    }

    const result = JSON.parse(responseText);
    
    if (result.choices && result.choices.length > 0) {
      const content = result.choices[0].message.content;
      return JSON.parse(content);
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
    
    // 使用 OpenAI NLP 解析搜尋意圖
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
        conditions: row[6], // 原本是 price
        condition_score: row[7],
        defects: row[8],
        status: row[9],
        image_url: row[10], // Cloudinary URL
        created_at: row[11]
      };
      
      // 只搜尋已發布的商品
      if (item.status !== "published" && item.status !== true) continue;
      
      // 簡單的篩選邏輯
      let match = true;
      
      if (intent.school && item.school.indexOf(intent.school) === -1) {
        match = false;
      }
      
      // 類型比對 (支援部分匹配，例如 "運動服" 可以匹配 "運動服上衣")
      if (intent.type && item.type.indexOf(intent.type) === -1) {
        match = false;
      }
      
      // 性別比對
      if (intent.gender && item.gender !== intent.gender && item.gender !== '不拘' && item.gender !== 'U') {
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
 * parseSearchIntent - 使用 OpenAI NLP 解析搜尋意圖
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
  "type": "制服類型（請回傳對應的英文關鍵字以進行模糊比對。'sport'對應運動服(PE Kit), 'uniform'對應制服(Formal Uniform), 'short'對應短袖, 'long'對應長袖, 'bottom'對應褲子, 'skirt'對應裙子, 'dress'對應洋裝, 'jacket'對應外套。注意：若使用者只說'制服'但未明確指明是正式制服還是泛指所有衣服，若無法區分則回傳 null。若使用者完全未提及類型（例如只說'海山國小女生'），請務必回傳 null，切勿預設為 'uniform'）",
  "gender": "性別（M=男, F=女, U=不拘，若未提及則為null）",
  "size_approx": "大約尺寸（例如：130-140，若未提及則為null）"
}

只回傳 JSON，不要其他說明。`;

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    };
    
    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(OPENAI_API_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      Logger.log("OpenAI API Error: " + responseText);
      return null;
    }

    const result = JSON.parse(responseText);
    
    if (result.choices && result.choices.length > 0) {
      const content = result.choices[0].message.content;
      return JSON.parse(content);
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
    if (!sheet) {
      return { status: "error", message: "Items sheet not found" };
    }
    
    const data = sheet.getDataRange().getValues();
    
    // 跳過標題行
    const items = [];
    // 從最後一行開始往前讀取（最新的在後面）
    for (let i = data.length - 1; i >= 1; i--) {
      if (items.length >= 10) break; // 只取前 10 筆
      
      const row = data[i];
      
      // 檢查狀態：支援 "published" 字串或 true (Checkbox)
      const status = row[9];
      if (status === "published" || status === true) {
        items.push({
          id: row[0],
          school: row[2],
          type: row[3],
          gender: row[4],
          size: row[5],
          conditions: row[6], // 原本是 price
          condition_score: row[7],
          defects: row[8],
          image_url: row[10], // Cloudinary URL
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
    if (!sheet) {
      return { status: "error", message: "Waitlist sheet not found" };
    }

    const data = sheet.getDataRange().getValues();
    
    const requests = [];
    for (let i = data.length - 1; i >= 1; i--) {
      if (requests.length >= 10) break;
      
      const row = data[i];

      // 檢查狀態：支援 "active" 字串或 true (Checkbox)
      const status = row[5];
      if (status === "active" || status === true) {
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

// ==================== 測試功能 ====================

function testFullFlow() {
  Logger.log("=== Checking API Key ===");
  if (!OPENAI_API_KEY) {
    Logger.log("ERROR: OPENAI_API_KEY is not set! Please check Script Properties.");
  } else {
    Logger.log("OPENAI_API_KEY is set (Length: " + OPENAI_API_KEY.length + ")");
  }

  Logger.log("\n=== 1. Testing Dashboard Data (Recent Items) ===");
  const recentItems = getRecentItems();
  Logger.log("Recent Items Count: " + (recentItems.data ? recentItems.data.length : 0));
  if (recentItems.data && recentItems.data.length > 0) {
    Logger.log("First Item: " + JSON.stringify(recentItems.data[0]));
  }

  Logger.log("\n=== 2. Testing Dashboard Data (Waitlist) ===");
  const recentWaitlist = getRecentWaitlist();
  Logger.log("Waitlist Count: " + (recentWaitlist.data ? recentWaitlist.data.length : 0));

  Logger.log("\n=== 3. Testing Search (Query: '海山國小女生') ===");
  const searchResult = searchItems({ query: "海山國小女生" });
  Logger.log("Search Status: " + searchResult.status);
  if (searchResult.status === "success") {
    Logger.log("Intent Parsed: " + JSON.stringify(searchResult.intent));
    Logger.log("Results Found: " + searchResult.results.length);
    Logger.log("First Match: " + JSON.stringify(searchResult.results[0]));
  } else {
    Logger.log("Search Failed: " + searchResult.message);
  }

  Logger.log("\n=== 4. Testing Cloudinary Upload via Code.gs ===");
  const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  const testItemId = 'test_code_gs_' + new Date().getTime();
  try {
    const url = uploadImageToCloudinary(testBase64, testItemId);
    Logger.log("Upload Success! URL: " + url);
  } catch (e) {
    Logger.log("Upload Failed: " + e.toString());
  }
}

// ==================== Note: LINE Login Functions ====================
// LINE Login related functions have been moved to LineAuthHelper.gs
// Please ensure LineAuthHelper.gs is included in your Apps Script project

/**
 * updateContactInfo - 更新使用者聯絡資訊
 * @param {Object} params - { userId: string, contactInfo: string }
 */
function updateContactInfo(params) {
  try {
    const userId = params.userId;
    const contactInfo = params.contactInfo;
    
    if (!userId || !contactInfo) {
      return { status: "error", message: "缺少必要參數" };
    }
    
    const updatedUser = updateUserContact(userId, contactInfo);
    
    return {
      status: "success",
      message: "聯絡資訊已更新",
      data: updatedUser
    };
    
  } catch (error) {
    Logger.log("Error in updateContactInfo: " + error.toString());
    return { status: "error", message: "更新失敗: " + error.toString() };
  }
}
