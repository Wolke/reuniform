/**
 * Test registerLiffUser function
 */
function testRegisterLiffUser() {
  Logger.log("=== Testing registerLiffUser ===");
  
  const testProfile = {
    line_user_id: "LIFF_TEST_USER_" + new Date().getTime(),
    display_name: "LIFF 測試使用者",
    picture_url: "https://example.com/liff-test.jpg",
    status_message: "LIFF test user"
  };
  
  try {
    // Test registering a new LIFF user
    const result = registerLiffUser({ profile: testProfile });
    
    if (result.status === "success") {
      Logger.log("✅ PASSED: LIFF user registered");
      Logger.log("   User ID: " + result.data.line_user_id);
      Logger.log("   Display Name: " + result.data.display_name);
      
      // Verify user was actually saved
      const savedUser = getUserById(testProfile.line_user_id);
      if (savedUser && savedUser.line_user_id === testProfile.line_user_id) {
        Logger.log("✅ PASSED: User was saved to sheet");
      } else {
        Logger.log("❌ FAILED: User not found in sheet");
      }
      
      // Clean up
      cleanupTestUser(testProfile.line_user_id);
    } else {
      Logger.log("❌ FAILED: " + result.message);
    }
    
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  
  Logger.log("");
}

/**
 * Helper: Clean up test user
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
