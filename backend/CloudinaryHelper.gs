/**
 * Re:Uniform - Cloudinary Image Upload Helper
 * 此檔案提供 Cloudinary 圖片上傳功能
 * 使用說明：請在 Script Properties 中設定以下三個屬性：
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

// ==================== Cloudinary 設定 ====================

/**
 * 取得 Cloudinary 設定
 * @returns {Object} { cloudName }
 */
function getCloudinaryConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    cloudName: props.getProperty('CLOUDINARY_CLOUD_NAME')
  };
}

/**
 * 上傳圖片到 Cloudinary
 * @param {string} base64Image - Base64 編碼的圖片（移除 data URI 前綴）
 * @param {string} itemId - 商品 ID（作為檔名參考）
 * @returns {string} 圖片的公開存取 URL
 */
function uploadImageToCloudinary(base64Image, itemId) {
  try {
    const config = getCloudinaryConfig();
    
    // 驗證設定
    if (!config.cloudName) {
      throw new Error('Cloudinary Cloud Name 未設定，請檢查 Script Properties');
    }
    
    // 移除可能的 data URI 前綴
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // 組合完整的 base64 data URI (Cloudinary API 需要這個格式)
    const base64DataUri = 'data:image/jpeg;base64,' + cleanBase64;
    
    // Sanitize itemId to be safe for public_id and display_name
    // Replace slashes and other unsafe characters with underscores
    const safeId = itemId.replace(/[^a-zA-Z0-9_\-]/g, '_');
    
    // 使用 Unsigned Upload (需要在 Cloudinary 設定 Upload Preset)
    // 這種方式不需要簽名,更簡單可靠
    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    
    // 準備 POST 資料
    // upload_preset 需要在 Cloudinary Dashboard 中創建
    const payload = {
      file: base64DataUri,
      upload_preset: 'reuniform_preset', // 需要在 Cloudinary 創建這個 preset
      folder: 'reuniform',
      public_id: safeId,
      filename_override: safeId
    };
    
    const options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true
    };
    
    // 上傳圖片
    const response = UrlFetchApp.fetch(uploadUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      Logger.log('Cloudinary Upload Error: ' + responseText);
      throw new Error('Cloudinary 上傳失敗: ' + responseText);
    }
    
    const result = JSON.parse(responseText);
    
    // 返回安全的 HTTPS URL
    const imageUrl = result.secure_url;
    
    Logger.log(`Image uploaded successfully to Cloudinary: ${imageUrl}`);
    
    return imageUrl;
    
  } catch (error) {
    Logger.log('Error uploading image to Cloudinary: ' + error.toString());
    throw new Error('圖片上傳失敗: ' + error.toString());
  }
}

/**
 * 從 Cloudinary 刪除圖片（未來功能）
 * @param {string} publicId - 圖片的 public_id
 * @returns {boolean} 是否成功刪除
 */
function deleteImageFromCloudinary(publicId) {
  try {
    const config = getCloudinaryConfig();
    
    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      throw new Error('Cloudinary 設定不完整');
    }
    
    const deleteUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`;
    
    const timestamp = Math.floor(Date.now() / 1000);
    
    // 生成簽名
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
    const signature = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_1,
      signatureString,
      Utilities.Charset.UTF_8
    ).map(function(byte) {
      const v = (byte < 0) ? 256 + byte : byte;
      return ('0' + v.toString(16)).slice(-2);
    }).join('');
    
    const payload = {
      public_id: publicId,
      api_key: config.apiKey,
      timestamp: timestamp.toString(),
      signature: signature
    };
    
    const options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(deleteUrl, options);
    const result = JSON.parse(response.getContentText());
    
    Logger.log('Delete result: ' + JSON.stringify(result));
    
    return result.result === 'ok';
    
  } catch (error) {
    Logger.log('Error deleting image from Cloudinary: ' + error.toString());
    return false;
  }
}

/**
 * 測試 Cloudinary 上傳功能
 */
function testCloudinaryUpload() {
  // 創建一個簡單的測試圖片（1x1 紅色像素的 PNG）
  const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  try {
    Logger.log('=== Testing Cloudinary Upload (Unsigned) ===');
    
    const config = getCloudinaryConfig();
    Logger.log('Cloud Name: ' + (config.cloudName ? config.cloudName : 'NOT SET'));
    
    if (!config.cloudName) {
      Logger.log('ERROR: Please set CLOUDINARY_CLOUD_NAME in Script Properties');
      Logger.log('Also make sure you have created an unsigned upload preset named "reuniform_preset" in Cloudinary Dashboard');
      return null;
    }
    
    const testItemId = 'test_' + new Date().getTime();
    Logger.log('Uploading test image with ID: ' + testItemId);
    
    const url = uploadImageToCloudinary(testBase64, testItemId);
    
    Logger.log('✅ Test upload successful!');
    Logger.log('Image URL: ' + url);
    Logger.log('You can access the image at: ' + url);
    
    return url;
  } catch(e) {
    Logger.log('❌ Test upload failed: ' + e);
    Logger.log('If you see "Upload preset not found", please create an unsigned upload preset in Cloudinary Dashboard:');
    Logger.log('1. Go to Settings > Upload > Upload presets');
    Logger.log('2. Click "Add upload preset"');
    Logger.log('3. Set Signing Mode to "Unsigned"');
    Logger.log('4. Set Upload preset name to "reuniform_preset"');
    Logger.log('5. Set Folder to "reuniform"');
    Logger.log('6. Save');
    return null;
  }
}
