/**
 * Re:Uniform - Google Drive Image Upload Helper
 * 此檔案提供 Google Drive 圖片上傳功能
 * 使用說明：請在 Script Properties 中設定 DRIVE_FOLDER_ID
 */

// ==================== Google Drive 設定 ====================

/**
 * 取得或創建 Google Drive 資料夾
 * @returns {Folder} Google Drive 資料夾物件
 */
function getOrCreateDriveFolder() {
  const folderIdProperty = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  
  if (folderIdProperty) {
    try {
      return DriveApp.getFolderById(folderIdProperty);
    } catch(e) {
      Logger.log('Stored folder ID is invalid, creating new folder...');
    }
  }
  
  // 如果沒有設定或 ID 無效，創建新資料夾
  const folderName = 'Re_Uniform_Images';
  const folders = DriveApp.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    const folder = folders.next();
    PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', folder.getId());
    return folder;
  } else {
    const newFolder = DriveApp.createFolder(folderName);
    PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', newFolder.getId());
    Logger.log('Created new folder with ID: ' + newFolder.getId());
    return newFolder;
  }
}

/**
 * 上傳圖片到 Google Drive
 * @param {string} base64String - Base64 編碼的圖片（移除 data URI 前綴）
 * @param {string} itemId - 商品 ID（作為檔名）
 * @returns {string} 圖片的公開存取 URL
 */
function uploadImageToDrive(base64String, itemId) {
  try {
    // 移除可能的 data URI 前綴
    const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    // 將 Base64 轉換為 Blob
    const decoded = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decoded, 'image/jpeg', `${itemId}.jpg`);
    
    // 取得或創建資料夾
    const folder = getOrCreateDriveFolder();
    
    // 上傳檔案
    const file = folder.createFile(blob);
    
    // 設定分享權限為「任何人都可以透過連結查看」
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 取得公開存取URL
    // 使用 uc?export=view&id= 格式可以直接顯示圖片
    const fileId = file.getId();
    const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    Logger.log(`Image uploaded successfully: ${imageUrl}`);
    
    return imageUrl;
    
  } catch (error) {
    Logger.log('Error uploading image to Drive: ' + error.toString());
    throw new Error('圖片上傳失敗: ' + error.toString());
  }
}

/**
 * 測試 Google Drive 上傳功能
 */
function testDriveUpload() {
  // 創建一個簡單的測試圖片（1x1 紅色像素的 PNG）
  const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  try {
    const testItemId = 'test_' + new Date().getTime();
    const url = uploadImageToDrive(testBase64, testItemId);
    Logger.log('Test upload successful!');
    Logger.log('Image URL: ' + url);
    Logger.log('You can access the image at: ' + url);
    return url;
  } catch(e) {
    Logger.log('Test upload failed: ' + e);
    return null;
  }
}

/**
 * 列出資料夾中的所有圖片（用於調試）
 */
function listUploadedImages() {
  try {
    const folder = getOrCreateDriveFolder();
    const files = folder.getFiles();
    const imageList = [];
    
    while (files.hasNext()) {
      const file = files.next();
      imageList.push({
        name: file.getName(),
        id: file.getId(),
        url: `https://drive.google.com/uc?export=view&id=${file.getId()}`,
        size: file.getSize(),
        created: file.getDateCreated()
      });
    }
    
    Logger.log('Total images in folder: ' + imageList.length);
    imageList.forEach(img => {
      Logger.log(`- ${img.name}: ${img.url}`);
    });
    
    return imageList;
  } catch(e) {
    Logger.log('Error listing images: ' + e);
    return [];
  }
}
