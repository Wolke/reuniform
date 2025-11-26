// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

// API Actions
export const ApiActions = {
    UPLOAD_ITEM: 'uploadItem',
    SEARCH_ITEMS: 'searchItems',
    ADD_TO_WAITLIST: 'addToWaitlist',
    GET_RECENT_ITEMS: 'getRecentItems',
    GET_RECENT_WAITLIST: 'getRecentWaitlist'
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
