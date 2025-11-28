// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

// API Actions
export const ApiActions = {
    UPLOAD_ITEM: 'uploadItem',
    ANALYZE_ITEM: 'analyzeItem',
    PUBLISH_ITEM: 'publishItem',
    SEARCH_ITEMS: 'searchItems',
    ADD_TO_WAITLIST: 'addToWaitlist',
    GET_RECENT_ITEMS: 'getRecentItems',
    GET_RECENT_WAITLIST: 'getRecentWaitlist',
    VERIFY_LINE_LOGIN: 'verifyLineLogin',
    REGISTER_LIFF_USER: 'registerLiffUser', // New: for LIFF SDK authentication
    GET_MY_ITEMS: 'getMyItems',
    GET_MY_WAITLIST: 'getMyWaitlist',
    GET_ITEM_CONTACT: 'getItemContact',
    GET_WAITLIST_CONTACT: 'getWaitlistContact',
    UPDATE_CONTACT_INFO: 'updateContactInfo'
};

// API Helper Functions
export async function callAPI(action, params = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action,
                ...params
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return {
            status: 'error',
            message: error.message || '網路連線失敗'
        };
    }
}

// Image to Base64 converter
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

// LINE Login API Functions
export async function verifyLineLogin(authorizationCode) {
    const response = await callAPI(ApiActions.VERIFY_LINE_LOGIN, {
        code: authorizationCode,
        redirect_uri: import.meta.env.VITE_LINE_CALLBACK_URL
    });

    if (response.status === 'success') {
        return response.data;
    }
    throw new Error(response.message || 'LINE 登入驗證失敗');
}

export async function getMyItems(userId) {
    const response = await callAPI(ApiActions.GET_MY_ITEMS, { userId });
    if (response.status === 'success') {
        return response.data || [];
    }
    throw new Error(response.message || '無法取得商品列表');
}

export async function getMyWaitlist(userId) {
    const response = await callAPI(ApiActions.GET_MY_WAITLIST, { userId });
    if (response.status === 'success') {
        return response.data || [];
    }
    throw new Error(response.message || '無法取得預約列表');
}

export async function getItemContact(itemId, userId) {
    const response = await callAPI(ApiActions.GET_ITEM_CONTACT, { itemId, userId });
    if (response.status === 'success') {
        return response.data;
    }
    throw new Error(response.message || '無法取得聯絡資訊');
}

export async function getWaitlistContact(requestId, userId) {
    const response = await callAPI(ApiActions.GET_WAITLIST_CONTACT, { requestId, userId });
    if (response.status === 'success') {
        return response.data;
    }
    throw new Error(response.message || '無法取得聯絡資訊');
}

export async function registerLiffUser(profile) {
    const response = await callAPI(ApiActions.REGISTER_LIFF_USER, { profile });
    if (response.status === 'success') {
        return response.data;
    }
    throw new Error(response.message || '無法註冊使用者');
}

export async function updateContactInfo(userId, contactInfo) {
    const response = await callAPI(ApiActions.UPDATE_CONTACT_INFO, { userId, contactInfo });
    if (response.status === 'success') {
        return response.data;
    }
    throw new Error(response.message || '無法更新聯絡資訊');
}
