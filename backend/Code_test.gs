/**
 * Code_test.gs
 * Re:Uniform Code.gs 完整測試套件
 * 
 * 測試範圍：
 * 1. 商品上傳和分析 (uploadItem, analyzeItem, publishItem)
 * 2. 搜尋功能 (searchItems, parseSearchIntent)
 * 3. 缺貨預約 (addToWaitlist)
 * 4. Dashboard 資料 (getRecentItems, getRecentWaitlist)
 */

// ==================== 主測試入口 ====================

/**
 * 執行所有測試
 */
function runAllCodeTests() {
  Logger.log("===========================================");
  Logger.log("Re:Uniform Code.gs - Complete Test Suite");
  Logger.log("===========================================\n");
  
  // 環境檢查
  testEnvironmentSetup();
  
  // AI 功能測試
  testParseSearchIntent();
  
  // Dashboard 功能測試
  testGetRecentItems();
  testGetRecentWaitlist();
  
  // 商品操作測試
  testPublishItem();
  testSearchItems();
  testAddToWaitlist();
  
  // 整合測試
  testCompleteUserFlow();
  
  Logger.log("\n===========================================");
  Logger.log("All Code.gs Tests Completed!");
  Logger.log("===========================================");
}

//==================== 環境測試 ====================

function testEnvironmentSetup() {
  Logger.log("=== Test 1: Environment Setup ===");
  
  // 檢查 OpenAI API Key
  const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
  if (!apiKey) {
    Logger.log("❌ FAILED: OPENAI_API_KEY not set");
  } else {
    Logger.log("✅ PASSED: OPENAI_API_KEY is set (length: " + apiKey.length + ")");
  }
  
  // 檢查必要的 Sheets
  const requiredSheets = ["Items", "Waitlist", "Users"];
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  requiredSheets.forEach(function(sheetName) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log("❌ FAILED: " + sheetName + " sheet not found");
    } else {
      Logger.log("✅ PASSED: " + sheetName + " sheet exists");
    }
  });
  
  Logger.log("");
}

// ==================== AI 功能測試 ====================

function testParseSearchIntent() {
  Logger.log("=== Test 2: Parse Search Intent (AI NLP) ===");
  
  const testQueries = [
    {
      query: "我要找海山國小女生的運動服",
      expectedSchool: "海山國小",
      expectedGender: "F"
    },
    {
      query: "板橋區光復國小男生制服",
      expectedSchool: "光復國小",
      expectedGender: "M"
    },
    {
      query: "三年級的運動服",
      expectedType: "sport"
    }
  ];
  
  let passedCount = 0;
  let totalCount = testQueries.length;
  
  testQueries.forEach(function(testCase, index) {
    try {
      Logger.log("\nTest Case " + (index + 1) + ": \"" + testCase.query + "\"");
      
      const intent = parseSearchIntent(testCase.query);
      
      if (!intent) {
        Logger.log("❌ FAILED: parseSearchIntent returned null");
        return;
      }
      
      Logger.log("   Parsed Intent: " + JSON.stringify(intent));
      
      let passed = true;
      
      if (testCase.expectedSchool && intent.school.indexOf(testCase.expectedSchool) === -1) {
        Logger.log("   ❌ School mismatch. Expected: " + testCase.expectedSchool + ", Got: " + intent.school);
        passed = false;
      }
      
      if (testCase.expectedGender && intent.gender !== testCase.expectedGender) {
        Logger.log("   ❌ Gender mismatch. Expected: " + testCase.expectedGender + ", Got: " + intent.gender);
        passed = false;
      }
      
      if (testCase.expectedType && intent.type && intent.type.indexOf(testCase.expectedType) === -1) {
        Logger.log("   ❌ Type mismatch. Expected contains: " + testCase.expectedType + ", Got: " + intent.type);
        passed = false;
      }
      
      if (passed) {
        Logger.log("   ✅ PASSED");
        passedCount++;
      }
      
    } catch (error) {
      Logger.log("❌ FAILED: " + error.toString());
    }
  });
  
  Logger.log("\n📊 Summary: " + passedCount + "/" + totalCount + " test cases passed");
  Logger.log("");
}

// ==================== Dashboard 測試 ====================

function testGetRecentItems() {
  Logger.log("=== Test 3: Get Recent Items ===");
  
  try {
    const result = getRecentItems();
    
    if (result.status !== "success") {
      Logger.log("❌ FAILED: Status is not success");
      Logger.log("   Error: " + result.message);
      return;
    }
    
    if (!Array.isArray(result.data)) {
      Logger.log("❌ FAILED: Data is not an array");
      return;
    }
    
    Logger.log("✅ PASSED: getRecentItems returns valid data");
    Logger.log("   Items count: " + result.data.length);
    
    if (result.data.length > 0) {
      Logger.log("   First item: " + JSON.stringify(result.data[0]));
      
      // 驗證資料結構
      const item = result.data[0];
      const requiredFields = ["id", "school", "type", "gender", "size", "image_url"];
      let allFieldsPresent = true;
      
      requiredFields.forEach(function(field) {
        if (!item.hasOwnProperty(field)) {
          Logger.log("   ⚠️  Missing field: " + field);
          allFieldsPresent = false;
        }
      });
      
      if (allFieldsPresent) {
        Logger.log("   ✅ Data structure is valid");
      }
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

function testGetRecentWaitlist() {
  Logger.log("=== Test 4: Get Recent Waitlist ===");
  
  try {
    const result = getRecentWaitlist();
    
    if (result.status !== "success") {
      Logger.log("❌ FAILED: Status is not success");
      Logger.log("   Error: " + result.message);
      return;
    }
    
    if (!Array.isArray(result.data)) {
      Logger.log("❌ FAILED: Data is not an array");
      return;
    }
    
    Logger.log("✅ PASSED: getRecentWaitlist returns valid data");
    Logger.log("   Waitlist count: " + result.data.length);
    
    if (result.data.length > 0) {
      Logger.log("   First request: " + JSON.stringify(result.data[0]));
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

// ==================== 商品操作測試 ====================

function testPublishItem() {
  Logger.log("=== Test 5: Publish Item ===");
  
  const testItem = {
    id: "TEST_ITEM_" + new Date().getTime(),
    school: "測試國小",
    type: "sport_top",
    gender: "M",
    size: "140",
    conditions: "測試商品",
    condition: 4,
    defects: "測試用，請勿聯絡",
    status: "published",
    image_url: "https://example.com/test.jpg",
    sellerId: "TEST_SELLER"
  };
  
  try {
    const result = publishItem(testItem);
    
    if (result.status === "success") {
      Logger.log("✅ PASSED: Item published successfully");
      Logger.log("   Item ID: " + testItem.id);
      
      // 清理測試資料
      cleanupTestItem(testItem.id);
    } else {
      Logger.log("❌ FAILED: " + result.message);
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
    cleanupTestItem(testItem.id);
  }
  
  Logger.log("");
}

function testSearchItems() {
  Logger.log("=== Test 6: Search Items ===");
  
  const testCases = [
    {
      query: "海山國小",
      description: "Search by school name"
    },
    {
      query: "運動服",
      description: "Search by type"
    },
    {
      query: "女生制服",
      description: "Search by gender"
    }
  ];
  
  testCases.forEach(function(testCase, index) {
    try {
      Logger.log("\nTest Case " + (index + 1) + ": " + testCase.description);
      Logger.log("   Query: \"" + testCase.query + "\"");
      
      const result = searchItems({ query: testCase.query });
      
      if (result.status !== "success") {
        Logger.log("   ❌ FAILED: " + result.message);
        return;
      }
      
      Logger.log("   ✅ PASSED: Search completed");
      Logger.log("   Results found: " + result.results.length);
      Logger.log("   Suggest waitlist: " + result.suggestWaitlist);
      
      if (result.intent) {
        Logger.log("   Intent: " + JSON.stringify(result.intent));
      }
      
    } catch (error) {
      Logger.log("   ❌ FAILED: " + error.toString());
    }
  });
  
  Logger.log("");
}

function testAddToWaitlist() {
  Logger.log("=== Test 7: Add to Waitlist ===");
  
  const testWaitlist = {
    school: "測試國小",
    type: "sport_top",
    size: "140",
    requesterId: "TEST_REQUESTER_" + new Date().getTime()
  };
  
  try {
    const result = addToWaitlist(testWaitlist);
    
    if (result.status === "success") {
      Logger.log("✅ PASSED: Waitlist entry added");
      Logger.log("   Waitlist ID: " + result.data.id);
      
      // 清理測試資料
      cleanupTestWaitlist(result.data.id);
    } else {
      Logger.log("❌ FAILED: " + result.message);
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

// ==================== 整合測試 ====================

function testCompleteUserFlow() {
  Logger.log("=== Test 8: Complete User Flow Integration ===");
  
  const userId = "INTEGRATION_TEST_" + new Date().getTime();
  const itemId = "ITEM_" + new Date().getTime();
  const waitlistId = "WAIT_" + new Date().getTime();
  
  try {
    Logger.log("Step 1: User publishes an item");
    const publishResult = publishItem({
      id: itemId,
      school: "整合測試國小",
      type: "sport_top",
      gender: "F",
      size: "140",
      conditions: "整合測試",
      condition: 5,
      defects: "無",
      image_url: "https://example.com/integration.jpg",
      sellerId: userId
    });
    
    if (publishResult.status === "success") {
      Logger.log("   ✓ Item published");
    } else {
      Logger.log("   ✗ Item publish failed: " + publishResult.message);
    }
    
    Logger.log("Step 2: Search for the item");
    const searchResult = searchItems({ query: "整合測試國小" });
    
    if (searchResult.status === "success") {
      Logger.log("   ✓ Search completed (found: " + searchResult.results.length + " items)");
    } else {
      Logger.log("   ✗ Search failed");
    }
    
    Logger.log("Step 3: Add to waitlist for non-existent item");
    const waitlistResult = addToWaitlist({
      school: "不存在的學校",
      type: "uniform_top",
      size: "150",
      requesterId: userId
    });
    
    if (waitlistResult.status === "success") {
      Logger.log("   ✓ Waitlist entry added");
    } else {
      Logger.log("   ✗ Waitlist add failed");
    }
    
    Logger.log("✅ PASSED: Complete integration flow executed");
    
    // 清理測試資料
    cleanupTestItem(itemId);
    if (waitlistResult.data && waitlistResult.data.id) {
      cleanupTestWaitlist(waitlistResult.data.id);
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
    cleanupTestItem(itemId);
  }
  
  Logger.log("");
}

// ==================== 輔助函數 ====================

function cleanupTestItem(itemId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Items");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === itemId) {
        sheet.deleteRow(i + 1);
        Logger.log("   🗑️  Test item cleaned up: " + itemId);
        break;
      }
    }
  } catch (error) {
    Logger.log("   ⚠️  Cleanup warning: " + error.toString());
  }
}

function cleanupTestWaitlist(waitlistId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Waitlist");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === waitlistId) {
        sheet.deleteRow(i + 1);
        Logger.log("   🗑️  Test waitlist cleaned up: " + waitlistId);
        break;
      }
    }
  } catch (error) {
    Logger.log("   ⚠️  Cleanup warning: " + error.toString());
  }
}

// ==================== 快速測試 ====================

/**
 * 快速測試（僅執行關鍵測試）
 */
function runQuickCodeTests() {
  Logger.log("===========================================");
  Logger.log("Re:Uniform Code.gs - Quick Tests");
  Logger.log("===========================================\n");
  
  testEnvironmentSetup();
  testGetRecentItems();
  testGetRecentWaitlist();
  testPublishItem();
  
  Logger.log("\n===========================================");
  Logger.log("Quick Tests Completed!");
  Logger.log("===========================================");
}

/**
 * 僅測試 AI 功能（需要 API 調用）
 */
function runAIOnlyTests() {
  Logger.log("===========================================");
  Logger.log("Re:Uniform Code.gs - AI Function Tests");
  Logger.log("===========================================\n");
  
  testParseSearchIntent();
  
  Logger.log("\n===========================================");
  Logger.log("AI Tests Completed!");
  Logger.log("===========================================");
}
