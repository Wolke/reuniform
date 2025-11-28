/**
 * LineAuthHelper.gs
 * LINE Login 認證相關函數
 * 處理 OAuth 2.0 流程、使用者資訊管理
 * 
 * Note: 此檔案使用 Code.gs 中定義的常數：
 * - LINE_CHANNEL_ID
 * - LINE_CHANNEL_SECRET
 * - SHEET_USERS
 * - SHEET_ITEMS
 * - SHEET_WAITLIST
 */

// ==================== 主要認證流程 ====================

/**
 * verifyLineLogin - 驗證 LINE Login 授權碼並取得使用者資訊
 * @param {Object} params - { code: string, redirect_uri: string }
 * @returns {Object} { status: string, data?: Object, message?: string }
 */
function verifyLineLogin(params) {
  try {
    const code = params.code;
    const redirectUri = params.redirect_uri;
    
    if (!code || !redirectUri) {
      return { status: "error", message: "缺少必要參數" };
    }
    
    if (!LINE_CHANNEL_ID || !LINE_CHANNEL_SECRET) {
      return { status: "error", message: "LINE Login 設定不完整，請檢查 Script Properties" };
    }
    
    // 1. 使用授權碼交換 Access Token
    const tokenResponse = getLineAccessToken(code, redirectUri);
    
    if (!tokenResponse || !tokenResponse.access_token) {
      return { status: "error", message: "無法取得 LINE Access Token" };
    }
    
    // 2. 使用 Access Token 取得使用者資訊
    const profile = getLineProfile(tokenResponse.access_token);
    
    if (!profile || !profile.userId) {
      return { status: "error", message: "無法取得 LINE 使用者資訊" };
    }
    
    // 3. 儲存或更新使用者資訊到 Users Sheet
    const userData = saveOrUpdateUser(profile);
    
    return {
      status: "success",
      data: userData
    };
    
  } catch (error) {
    Logger.log("Error in verifyLineLogin: " + error.toString());
    return { status: "error", message: "LINE 登入驗證失敗: " + error.toString() };
  }
}

// ==================== LINE API 呼叫 ====================

/**
 * getLineAccessToken - 使用授權碼交換 Access Token
 * @param {string} code - OAuth 授權碼
 * @param {string} redirectUri - Callback URL
 * @returns {Object|null} Token response 或 null
 */
function getLineAccessToken(code, redirectUri) {
  try {
    const tokenUrl = "https://api.line.me/oauth2/v2.1/token";
    
    const payload = {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
      client_id: LINE_CHANNEL_ID,
      client_secret: LINE_CHANNEL_SECRET
    };
    
    const options = {
      method: "post",
      contentType: "application/x-www-form-urlencoded",
      payload: payload,
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(tokenUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      Logger.log("LINE Token Error: " + responseText);
      return null;
    }
    
    return JSON.parse(responseText);
    
  } catch (error) {
    Logger.log("Error in getLineAccessToken: " + error.toString());
    return null;
  }
}

/**
 * getLineProfile - 取得 LINE 使用者資訊
 * @param {string} accessToken - LINE Access Token
 * @returns {Object|null} User profile 或 null
 */
function getLineProfile(accessToken) {
  try {
    const profileUrl = "https://api.line.me/v2/profile";
    
    const options = {
      method: "get",
      headers: {
        "Authorization": "Bearer " + accessToken
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(profileUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      Logger.log("LINE Profile Error: " + responseText);
      return null;
    }
    
    return JSON.parse(responseText);
    
  } catch (error) {
    Logger.log("Error in getLineProfile: " + error.toString());
    return null;
  }
}

// ==================== 使用者資料管理 ====================

/**
 * saveOrUpdateUser - 儲存或更新使用者資訊到 Google Sheets
 * @param {Object} profile - LINE user profile { userId, displayName, pictureUrl, statusMessage }
 * @returns {Object} 使用者資料
 */
function saveOrUpdateUser(profile) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
    
    if (!sheet) {
      throw new Error("Users sheet not found");
    }
    
    // 檢查使用者是否已存在
    const data = sheet.getDataRange().getValues();
    let userRow = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profile.userId) {
        userRow = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    // 決定 contact_info: 若是舊使用者，使用 Sheet 中的資料；若是新使用者，預設為空 (由使用者自行設定)
    let contactInfo = "";
    if (userRow !== -1) {
      contactInfo = data[userRow - 1][3]; // Column 4 (Index 3)
    }

    const now = new Date().toISOString();
    const userData = {
      line_user_id: profile.userId,
      display_name: profile.displayName,
      picture_url: profile.pictureUrl || "",
      contact_info: contactInfo,
      created_at: userRow === -1 ? now : data[userRow - 1][4],
      last_login: now
    };
    
    if (userRow === -1) {
      // 新增使用者
      sheet.appendRow([
        userData.line_user_id,
        userData.display_name,
        userData.picture_url,
        userData.contact_info,
        userData.created_at,
        userData.last_login
      ]);
      Logger.log("New user created: " + userData.line_user_id);
    } else {
      // 更新使用者（更新名稱、頭像、最後登入時間）
      sheet.getRange(userRow, 2).setValue(userData.display_name);
      sheet.getRange(userRow, 3).setValue(userData.picture_url);
      sheet.getRange(userRow, 6).setValue(userData.last_login);
      Logger.log("User updated: " + userData.line_user_id);
    }
    
    return userData;
    
  } catch (error) {
    Logger.log("Error in saveOrUpdateUser: " + error.toString());
    throw error;
  }
}

/**
 * registerLiffUser - LIFF SDK 專用：註冊或更新使用者
 * @param {Object} params - { profile: Object }
 * @returns {Object} { status: string, data?: Object, message?: string }
 */
function registerLiffUser(params) {
  try {
    const profile = params.profile;
    
    if (!profile || !profile.line_user_id) {
      return { status: "error", message: "缺少使用者資料" };
    }
    
    // 轉換 LIFF profile 格式為內部格式
    const lineProfile = {
      userId: profile.line_user_id,
      displayName: profile.display_name,
      pictureUrl: profile.picture_url,
      statusMessage: profile.status_message || ""
    };
    
    // 使用現有的 saveOrUpdateUser 函數
    const userData = saveOrUpdateUser(lineProfile);
    
    return {
      status: "success",
      data: userData,
      message: "使用者註冊成功"
    };
    
  } catch (error) {
    Logger.log("Error in registerLiffUser: " + error.toString());
    return { status: "error", message: "註冊失敗: " + error.toString() };
  }
}


/**
 * getUserById - 根據 LINE User ID 取得使用者資訊
 * @param {string} userId - LINE User ID
 * @returns {Object|null} 使用者資料或 null
 */
function getUserById(userId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return {
          line_user_id: data[i][0],
          display_name: data[i][1],
          picture_url: data[i][2],
          contact_info: data[i][3],
          created_at: data[i][4],
          last_login: data[i][5]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log("Error in getUserById: " + error.toString());
    return null;
  }
}

// ==================== 使用者內容查詢 ====================

/**
 * getMyItems - 取得特定使用者的所有上架商品
 * @param {Object} params - { userId: string }
 * @returns {Object} { status: string, data?: Array, message?: string }
 */
function getMyItems(params) {
  try {
    const userId = params.userId;
    
    if (!userId) {
      return { status: "error", message: "缺少使用者 ID" };
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Items");
    
    if (!sheet) {
      return { status: "error", message: "Items sheet not found" };
    }
    
    const data = sheet.getDataRange().getValues();
    
    const items = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // 檢查是否為該使用者的商品
      if (row[1] === userId) {
        items.push({
          id: row[0],
          seller_id: row[1],
          school: row[2],
          type: row[3],
          gender: row[4],
          size: row[5],
          conditions: row[6],
          condition_score: row[7],
          defects: row[8],
          status: row[9],
          image_url: row[10],
          created_at: row[11]
        });
      }
    }
    
    return {
      status: "success",
      data: items
    };
    
  } catch (error) {
    Logger.log("Error in getMyItems: " + error.toString());
    return { status: "error", message: "取得商品失敗: " + error.toString() };
  }
}

/**
 * getMyWaitlist - 取得特定使用者的所有預約需求
 * @param {Object} params - { userId: string }
 * @returns {Object} { status: string, data?: Array, message?: string }
 */
function getMyWaitlist(params) {
  try {
    const userId = params.userId;
    
    if (!userId) {
      return { status: "error", message: "缺少使用者 ID" };
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Waitlist");
    
    if (!sheet) {
      return { status: "error", message: "Waitlist sheet not found" };
    }
    
    const data = sheet.getDataRange().getValues();
    
    const waitlist = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // 檢查是否為該使用者的預約
      if (row[1] === userId) {
        waitlist.push({
          id: row[0],
          requester_id: row[1],
          target_school: row[2],
          target_type: row[3],
          target_size: row[4],
          status: row[5],
          created_at: row[6]
        });
      }
    }
    
    return {
      status: "success",
      data: waitlist
    };
    
  } catch (error) {
    Logger.log("Error in getMyWaitlist: " + error.toString());
    return { status: "error", message: "取得預約失敗: " + error.toString() };
  }
}

/**
 * getItemContact - 取得商品賣家的聯絡資訊（需要登入）
 */
function getItemContact(params) {
  return getContactFromSheet(params.itemId, params.userId, "Items", "商品");
}

/**
 * getWaitlistContact - 取得預約需求者的聯絡資訊（需要登入）
 */
function getWaitlistContact(params) {
  return getContactFromSheet(params.requestId, params.userId, "Waitlist", "預約需求");
}

/**
 * getContactFromSheet - 共用的聯絡資訊取得邏輯
 * @param {string} targetId - 商品 ID 或 需求 ID
 * @param {string} userId - 查詢者的 User ID (用於驗證登入)
 * @param {string} sheetName - "Items" 或 "Waitlist"
 * @param {string} itemName - 錯誤訊息用的名稱 (e.g. "商品", "預約需求")
 */
function getContactFromSheet(targetId, userId, sheetName, itemName) {
  try {
    if (!targetId || !userId) {
      return { status: "error", message: "缺少必要參數" };
    }
    
    // 1. 從指定 Sheet 找到目標
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      return { status: "error", message: `${sheetName} sheet not found` };
    }
    
    const data = sheet.getDataRange().getValues();
    
    let targetUserId = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === targetId) {
        targetUserId = data[i][1]; // 假設 Owner ID 都在第二欄 (Index 1)
        break;
      }
    }
    
    if (!targetUserId) {
      return { status: "error", message: `找不到該${itemName}` };
    }
    
    // 2. 從 Users Sheet 取得使用者資訊
    const userInfo = getUserById(targetUserId);
    
    if (!userInfo) {
      return { status: "error", message: "找不到使用者資訊" };
    }
    
    return {
      status: "success",
      data: {
        seller_name: userInfo.display_name,
        contact_info: userInfo.contact_info || "使用者未提供聯絡資訊"
      }
    };
    
  } catch (error) {
    Logger.log(`Error in getContactFromSheet (${sheetName}): ` + error.toString());
    return { status: "error", message: "取得聯絡資訊失敗: " + error.toString() };
  }
}

/**
 * updateUserContact - 更新使用者聯絡資訊
 * @param {string} userId - LINE User ID
 * @param {string} contactInfo - 新的聯絡資訊
 * @returns {Object} 更新後的使用者資料
 */
function updateUserContact(userId, contactInfo) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
    
    if (!sheet) {
      throw new Error("Users sheet not found");
    }
    
    const data = sheet.getDataRange().getValues();
    let userRow = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        userRow = i + 1;
        break;
      }
    }
    
    if (userRow === -1) {
      throw new Error("User not found");
    }
    
    // 更新聯絡資訊 (Column 4, Index 3)
    sheet.getRange(userRow, 4).setValue(contactInfo);
    
    // 回傳更新後的資料
    return {
      line_user_id: data[userRow - 1][0],
      display_name: data[userRow - 1][1],
      picture_url: data[userRow - 1][2],
      contact_info: contactInfo,
      created_at: data[userRow - 1][4],
      last_login: data[userRow - 1][5]
    };
    
  } catch (error) {
    Logger.log("Error in updateUserContact: " + error.toString());
    throw error;
  }
}
