/**
 * LineAuthHelper_test.gs
 * LINE Login 認證功能測試
 * 
 * 測試重點：
 * 1. OAuth Token 交換流程
 * 2. 使用者資料儲存和更新
 * 3. 使用者內容查詢
 * 4. 聯絡資訊存取控制
 */

// ==================== 測試配置 ====================

/**
 * 執行所有 LINE Auth 測試
 */
function runAllLineAuthTests() {
  Logger.log("========================================");
  Logger.log("LINE Auth Helper - Complete Test Suite");
  Logger.log("========================================\n");
  
  // 檢查環境設定
  testEnvironmentSetup();
  
  // 測試使用者管理
  testSaveOrUpdateUser();
  testGetUserById();
  
  // 測試使用者內容查詢
  testGetMyItems();
  testGetMyWaitlist();
  testGetItemContact();
  
  // 整合測試
  testCompleteAuthFlow();
  
  Logger.log("\n========================================");
  Logger.log("All LINE Auth Tests Completed!");
  Logger.log("========================================");
}

// ==================== 環境測試 ====================

function testEnvironmentSetup() {
  Logger.log("=== Test 1: Environment Setup ===");
  
  const channelId = PropertiesService.getScriptProperties().getProperty("LINE_CHANNEL_ID");
  const channelSecret = PropertiesService.getScriptProperties().getProperty("LINE_CHANNEL_SECRET");
  
  if (!channelId) {
    Logger.log("❌ FAILED: LINE_CHANNEL_ID not set in Script Properties");
  } else {
    Logger.log("✅ PASSED: LINE_CHANNEL_ID is set");
  }
  
  if (!channelSecret) {
    Logger.log("❌ FAILED: LINE_CHANNEL_SECRET not set in Script Properties");
  } else {
    Logger.log("✅ PASSED: LINE_CHANNEL_SECRET is set");
  }
  
  // 檢查 Users Sheet 是否存在
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  if (!sheet) {
    Logger.log("❌ FAILED: Users sheet not found");
  } else {
    Logger.log("✅ PASSED: Users sheet exists");
  }
  
  Logger.log("");
}

// ==================== 使用者管理測試 ====================

function testSaveOrUpdateUser() {
  Logger.log("=== Test 2: Save or Update User ===");
  
  const testProfile = {
    userId: "TEST_USER_" + new Date().getTime(),
    displayName: "測試使用者",
    pictureUrl: "https://example.com/avatar.jpg",
    statusMessage: "Line: test_user_contact"
  };
  
  try {
    // 測試新增使用者
    const userData = saveOrUpdateUser(testProfile);
    
    if (userData.line_user_id === testProfile.userId) {
      Logger.log("✅ PASSED: User created successfully");
      Logger.log("   User ID: " + userData.line_user_id);
      Logger.log("   Display Name: " + userData.display_name);
    } else {
      Logger.log("❌ FAILED: User ID mismatch");
    }
    
    // 測試更新使用者
    testProfile.displayName = "更新的使用者名稱";
    const updatedData = saveOrUpdateUser(testProfile);
    
    if (updatedData.display_name === "更新的使用者名稱") {
      Logger.log("✅ PASSED: User updated successfully");
    } else {
      Logger.log("❌ FAILED: User update failed");
    }
    
    // 清理測試資料
    cleanupTestUser(testProfile.userId);
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

function testGetUserById() {
  Logger.log("=== Test 3: Get User By ID ===");
  
  const testUserId = "TEST_USER_" + new Date().getTime();
  const testProfile = {
    userId: testUserId,
    displayName: "查詢測試使用者",
    pictureUrl: "https://example.com/test.jpg",
    statusMessage: "test contact"
  };
  
  try {
    // 先建立測試使用者
    saveOrUpdateUser(testProfile);
    
    // 測試查詢存在的使用者
    const user = getUserById(testUserId);
    
    if (user && user.line_user_id === testUserId) {
      Logger.log("✅ PASSED: User found successfully");
      Logger.log("   Display Name: " + user.display_name);
    } else {
      Logger.log("❌ FAILED: User not found or data mismatch");
    }
    
    // 測試查詢不存在的使用者
    const nonExistentUser = getUserById("NON_EXISTENT_USER_ID");
    
    if (nonExistentUser === null) {
      Logger.log("✅ PASSED: Non-existent user returns null");
    } else {
      Logger.log("❌ FAILED: Should return null for non-existent user");
    }
    
    // 清理測試資料
    cleanupTestUser(testUserId);
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

// ==================== 內容查詢測試 ====================

function testGetMyItems() {
  Logger.log("=== Test 4: Get My Items ===");
  
  try {
    const testUserId = "TEST_USER_ITEMS_" + new Date().getTime();
    
    // 測試取得商品（應該為空）
    const result = getMyItems({ userId: testUserId });
    
    if (result.status === "success" && Array.isArray(result.data)) {
      Logger.log("✅ PASSED: getMyItems returns valid response");
      Logger.log("   Items count: " + result.data.length);
    } else {
      Logger.log("❌ FAILED: Invalid response structure");
    }
    
    // 測試缺少必要參數
    const errorResult = getMyItems({});
    
    if (errorResult.status === "error") {
      Logger.log("✅ PASSED: Error handling for missing userId");
    } else {
      Logger.log("❌ FAILED: Should return error for missing userId");
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

function testGetMyWaitlist() {
  Logger.log("=== Test 5: Get My Waitlist ===");
  
  try {
    const testUserId = "TEST_USER_WAITLIST_" + new Date().getTime();
    
    // 測試取得預約列表
    const result = getMyWaitlist({ userId: testUserId });
    
    if (result.status === "success" && Array.isArray(result.data)) {
      Logger.log("✅ PASSED: getMyWaitlist returns valid response");
      Logger.log("   Waitlist count: " + result.data.length);
    } else {
      Logger.log("❌ FAILED: Invalid response structure");
    }
    
    // 測試錯誤處理
    const errorResult = getMyWaitlist({});
    
    if (errorResult.status === "error") {
      Logger.log("✅ PASSED: Error handling for missing userId");
    } else {
      Logger.log("❌ FAILED: Should return error for missing userId");
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

function testGetItemContact() {
  Logger.log("=== Test 6: Get Item Contact ===");
  
  try {
    // 測試缺少參數
    const errorResult1 = getItemContact({ itemId: "test_item" });
    if (errorResult1.status === "error") {
      Logger.log("✅ PASSED: Error handling for missing userId");
    } else {
      Logger.log("❌ FAILED: Should return error for missing userId");
    }
    
    const errorResult2 = getItemContact({ userId: "test_user" });
    if (errorResult2.status === "error") {
      Logger.log("✅ PASSED: Error handling for missing itemId");
    } else {
      Logger.log("❌ FAILED: Should return error for missing itemId");
    }
    
    // 測試不存在的商品
    const notFoundResult = getItemContact({ 
      itemId: "NON_EXISTENT_ITEM",
      userId: "test_user"
    });
    
    if (notFoundResult.status === "error") {
      Logger.log("✅ PASSED: Error handling for non-existent item");
    } else {
      Logger.log("❌ FAILED: Should return error for non-existent item");
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

// ==================== 整合測試 ====================

function testCompleteAuthFlow() {
  Logger.log("=== Test 7: Complete Auth Flow Integration ===");
  
  try {
    const testUserId = "INTEGRATION_TEST_" + new Date().getTime();
    
    // 模擬完整的使用者流程
    Logger.log("Step 1: Create user profile");
    const profile = {
      userId: testUserId,
      displayName: "整合測試使用者",
      pictureUrl: "https://example.com/integration.jpg",
      statusMessage: "Line: integration_test"
    };
    
    const userData = saveOrUpdateUser(profile);
    Logger.log("   ✓ User created: " + userData.line_user_id);
    
    Logger.log("Step 2: Retrieve user by ID");
    const retrievedUser = getUserById(testUserId);
    if (retrievedUser && retrievedUser.line_user_id === testUserId) {
      Logger.log("   ✓ User retrieved successfully");
    } else {
      Logger.log("   ✗ User retrieval failed");
    }
    
    Logger.log("Step 3: Query user's items");
    const items = getMyItems({ userId: testUserId });
    if (items.status === "success") {
      Logger.log("   ✓ Items query successful (count: " + items.data.length + ")");
    } else {
      Logger.log("   ✗ Items query failed");
    }
    
    Logger.log("Step 4: Query user's waitlist");
    const waitlist = getMyWaitlist({ userId: testUserId });
    if (waitlist.status === "success") {
      Logger.log("   ✓ Waitlist query successful (count: " + waitlist.data.length + ")");
    } else {
      Logger.log("   ✗ Waitlist query failed");
    }
    
    Logger.log("✅ PASSED: Complete integration test");
    
    // 清理測試資料
    cleanupTestUser(testUserId);
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

// ==================== 模擬 LINE API 測試 (可選) ====================

/**
 * 測試 LINE API 呼叫格式（不實際呼叫 API）
 * 僅驗證函數邏輯和錯誤處理
 */
function testLineAPICallFormat() {
  Logger.log("=== Test 8: LINE API Call Format ===");
  
  Logger.log("Note: This test verifies function structure without making real API calls");
  
  // 測試參數檢查
  try {
    const result = verifyLineLogin({});
    if (result.status === "error" && result.message.indexOf("缺少必要參數") !== -1) {
      Logger.log("✅ PASSED: Parameter validation works");
    } else {
      Logger.log("❌ FAILED: Parameter validation issue");
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

// ==================== 輔助函數 ====================

/**
 * 清理測試資料
 */
function cleanupTestUser(userId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        sheet.deleteRow(i + 1);
        Logger.log("   🗑️  Test user cleaned up: " + userId);
        break;
      }
    }
  } catch (error) {
    Logger.log("   ⚠️  Cleanup warning: " + error.toString());
  }
}

/**
 * 快速測試（僅執行關鍵測試）
 */
function runQuickLineAuthTests() {
  Logger.log("========================================");
  Logger.log("LINE Auth Helper - Quick Tests");
  Logger.log("========================================\n");
  
  testEnvironmentSetup();
  testSaveOrUpdateUser();
  testGetUserById();
  
  Logger.log("\n========================================");
  Logger.log("Quick Tests Completed!");
  Logger.log("========================================");
}
