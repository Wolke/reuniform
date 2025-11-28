/**
 * LIFF Authentication Module
 * Handles LINE LIFF login, user profile retrieval, and session management
 * Based on LINE Front-end Framework (LIFF) SDK
 */

// Local storage keys
const STORAGE_KEY = {
    USER_PROFILE: 'liff_user_profile',
    EXPIRES_AT: 'liff_token_expires_at'
};

// LIFF Configuration
const LIFF_ID = import.meta.env.VITE_LIFF_ID;

if (!LIFF_ID || LIFF_ID === 'your_liff_id_here') {
    console.warn('⚠️ LIFF_ID not configured. Please set VITE_LIFF_ID in your .env file');
}

/**
 * Initialize LIFF SDK
 * @returns {Promise<boolean>} Success status
 */
export async function initializeLIFF() {
    try {
        if (!LIFF_ID || LIFF_ID === 'your_liff_id_here') {
            console.error('LIFF ID is not configured');
            return false;
        }

        await liff.init({ liffId: LIFF_ID });
        console.log('✅ LIFF SDK initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ LIFF initialization failed:', error);
        return false;
    }
}

/**
 * Check if user is logged in
 * @returns {boolean} Login status
 */
export function isLoggedIn() {
    // First check if LIFF says we're logged in
    if (liff.isLoggedIn && liff.isLoggedIn()) {
        return true;
    }

    // Then check if we have stored credentials
    return hasStoredCredentials();
}

/**
 * Check if we have valid stored credentials
 * @returns {boolean} Whether stored credentials exist and are valid
 */
function hasStoredCredentials() {
    try {
        const userProfileJson = localStorage.getItem(STORAGE_KEY.USER_PROFILE);
        const expiresAt = parseInt(localStorage.getItem(STORAGE_KEY.EXPIRES_AT) || '0', 10);

        // Check if token has expired
        if (Date.now() > expiresAt) {
            console.log('Stored credentials have expired');
            clearLoginState();
            return false;
        }

        return !!userProfileJson;
    } catch (error) {
        console.error('Error checking stored credentials:', error);
        return false;
    }
}

/**
 * Login with LIFF
 * @returns {Promise<Object|null>} User profile or null
 */
export async function login() {
    try {
        if (!liff.isLoggedIn()) {
            // Redirect to LINE login
            liff.login();
            return null; // Will redirect, so no profile yet
        }

        // Already logged in, get profile
        const profile = await getProfile();
        if (profile) {
            // Save to backend Users sheet
            try {
                const { registerLiffUser } = await import('./api.js');
                await registerLiffUser(profile);
                console.log('✅ User registered/updated in backend');
            } catch (apiError) {
                console.error('Failed to register user in backend:', apiError);
                // Don't fail login if backend fails
            }

            saveLoginState(profile);
        }
        return profile;
    } catch (error) {
        console.error('Login failed:', error);
        throw new Error('LINE 登入失敗: ' + error.message);
    }
}

/**
 * Logout
 */
export function logout() {
    try {
        if (liff.isLoggedIn && liff.isLoggedIn()) {
            liff.logout();
        }
        clearLoginState();
        console.log('✅ Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
        // Clear local state anyway
        clearLoginState();
    }
}

/**
 * Get user profile
 * @returns {Promise<Object|null>} User profile or null
 */
export async function getProfile() {
    try {
        // First try to get from LIFF
        if (liff.isLoggedIn && liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            return {
                line_user_id: profile.userId,
                display_name: profile.displayName,
                picture_url: profile.pictureUrl,
                status_message: profile.statusMessage || ''
            };
        }

        // Try to restore from storage
        const storedProfile = restoreLoginState();
        return storedProfile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Get access token (if needed for API calls)
 * @returns {string|null} Access token or null
 */
export function getAccessToken() {
    try {
        if (liff.isLoggedIn && liff.isLoggedIn()) {
            return liff.getAccessToken();
        }
        return null;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

/**
 * Save login state to local storage
 * @param {Object} profile User profile
 */
function saveLoginState(profile) {
    if (!profile) return;

    try {
        // Set expiration time (30 days)
        const expiresIn = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const expiresAt = Date.now() + expiresIn;

        // Save to local storage
        localStorage.setItem(STORAGE_KEY.USER_PROFILE, JSON.stringify(profile));
        localStorage.setItem(STORAGE_KEY.EXPIRES_AT, expiresAt.toString());

        console.log('✅ Login state saved to local storage');
    } catch (error) {
        console.error('Error saving login state:', error);
    }
}

/**
 * Restore login state from local storage
 * @returns {Object|null} User profile or null
 */
function restoreLoginState() {
    try {
        const userProfileJson = localStorage.getItem(STORAGE_KEY.USER_PROFILE);
        const expiresAt = parseInt(localStorage.getItem(STORAGE_KEY.EXPIRES_AT) || '0', 10);

        // Check if token has expired
        if (Date.now() > expiresAt) {
            console.log('Stored credentials have expired');
            clearLoginState();
            return null;
        }

        if (userProfileJson) {
            return JSON.parse(userProfileJson);
        }
    } catch (error) {
        console.error('Error restoring login state:', error);
    }

    return null;
}

/**
 * Clear login state from local storage
 */
function clearLoginState() {
    localStorage.removeItem(STORAGE_KEY.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEY.EXPIRES_AT);
    console.log('✅ Login state cleared from local storage');
}
