// ==================== Configuration ====================
const API_URL = "YOUR_GAS_WEB_APP_URL_HERE"; // 請替換為您的 Google Apps Script Web App URL
const MOCK_USER_ID = "user_001"; // Mock User for testing

// ==================== State Management ====================
let currentImageBase64 = null;
let currentSearchIntent = null;

// ==================== View Management ====================
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function showStep(stepId) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
}

// ==================== Toast Notifications ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== Home View - Event Listeners ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Example tags
    document.querySelectorAll('.example-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            const query = e.target.dataset.query;
            document.getElementById('searchInput').value = query;
            handleSearch();
        });
    });
    
    // Upload flow
    document.getElementById('uploadBtn').addEventListener('click', () => {
        showView('uploadView');
        resetUploadFlow();
    });
    
    document.getElementById('closeUploadBtn').addEventListener('click', () => {
        showView('homeView');
    });
    
    document.getElementById('imageInput').addEventListener('change', handleImageSelect);
    document.getElementById('retakeBtn').addEventListener('click', () => {
        document.getElementById('imagePreview').classList.add('hidden');
        document.getElementById('uploadArea').style.display = 'block';
        currentImageBase64 = null;
    });
    
    document.getElementById('analyzeBtn').addEventListener('click', handleAnalyze);
    
    // Form
    document.getElementById('itemForm').addEventListener('submit', handleSubmitItem);
    document.getElementById('conditionInput').addEventListener('input', (e) => {
        document.getElementById('conditionValue').textContent = e.target.value;
    });
    
    // Success flow
    document.getElementById('uploadAnotherBtn').addEventListener('click', () => {
        resetUploadFlow();
        showStep('uploadStep');
    });
    
    document.getElementById('backHomeBtn').addEventListener('click', () => {
        showView('homeView');
    });
    
    // Result view
    document.getElementById('backToHomeBtn').addEventListener('click', () => {
        showView('homeView');
    });
    
    document.getElementById('addWaitlistBtn').addEventListener('click', handleAddToWaitlist);
}

function resetUploadFlow() {
    showStep('uploadStep');
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('itemForm').reset();
    document.getElementById('conditionValue').textContent = '3';
    currentImageBase64 = null;
}

// ==================== Story A: Upload Item (Seller Flow) ====================

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('請選擇圖片檔案', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('圖片檔案過大，請選擇小於 5MB 的圖片', 'error');
        return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
        currentImageBase64 = event.target.result;
        
        // Show preview
        document.getElementById('previewImage').src = currentImageBase64;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('imagePreview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

async function handleAnalyze() {
    if (!currentImageBase64) {
        showToast('請先選擇圖片', 'error');
        return;
    }
    
    showStep('loadingStep');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'uploadItem',
                imageBase64: currentImageBase64,
                sellerId: MOCK_USER_ID
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // Populate form with AI results
            document.getElementById('schoolInput').value = result.data.school || '';
            document.getElementById('typeInput').value = result.data.type || 'sport_top';
            document.getElementById('genderInput').value = result.data.gender || 'U';
            document.getElementById('sizeInput').value = result.data.size || '';
            document.getElementById('priceInput').value = result.data.price || 100;
            document.getElementById('conditionInput').value = result.data.condition || 3;
            document.getElementById('conditionValue').textContent = result.data.condition || 3;
            document.getElementById('defectsInput').value = result.data.defects || '無';
            
            showStep('reviewStep');
            showToast('AI 分析完成！請檢查資料', 'success');
        } else {
            showToast(result.message || 'AI 分析失敗，請重試', 'error');
            showStep('uploadStep');
        }
    } catch (error) {
        console.error('Error analyzing image:', error);
        showToast('網路錯誤，請確認已設定 API URL', 'error');
        showStep('uploadStep');
    }
}

async function handleSubmitItem(e) {
    e.preventDefault();
    
    showStep('loadingStep');
    
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showStep('successStep');
}

// ==================== Story B: Search Items (Buyer Flow) ====================

async function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        showToast('請輸入搜尋內容', 'warning');
        return;
    }
    
    showView('resultView');
    document.getElementById('queryDisplay').innerHTML = `
        <p class="text-sm text-gray-400">搜尋：</p>
        <p class="text-lg font-semibold">${escapeHtml(query)}</p>
    `;
    
    // Show loading state
    document.getElementById('resultsContainer').innerHTML = `
        <div class="loading-animation">
            <div class="spinner"></div>
            <p class="loading-text">正在搜尋...</p>
        </div>
    `;
    document.getElementById('emptyState').classList.add('hidden');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'searchItems',
                query: query
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            currentSearchIntent = result.intent;
            displaySearchResults(result.results, result.suggestWaitlist);
        } else {
            showToast(result.message || '搜尋失敗', 'error');
            document.getElementById('resultsContainer').innerHTML = '';
        }
    } catch (error) {
        console.error('Error searching:', error);
        showToast('網路錯誤，請確認已設定 API URL', 'error');
        document.getElementById('resultsContainer').innerHTML = '';
    }
}

function displaySearchResults(results, suggestWaitlist) {
    const container = document.getElementById('resultsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (results.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    const html = results.map(item => `
        <div class="result-card">
            <h3>${escapeHtml(item.school)}</h3>
            <div class="result-meta">
                <span class="meta-tag">${getTypeName(item.type)}</span>
                <span class="meta-tag">${getGenderName(item.gender)}</span>
                <span class="meta-tag">尺寸: ${escapeHtml(item.size)}</span>
                <span class="meta-tag">狀況: ${item.condition_score}/5</span>
            </div>
            <p class="text-sm text-gray-400">瑕疵：${escapeHtml(item.defects)}</p>
            <p class="result-price">NT$ ${item.price}</p>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

async function handleAddToWaitlist() {
    if (!currentSearchIntent) {
        showToast('無法加入預約清單', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addToWaitlist',
                school: currentSearchIntent.school,
                type: currentSearchIntent.type,
                size: currentSearchIntent.size_approx,
                requesterId: MOCK_USER_ID
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('已加入預約清單！有貨時會通知您', 'success');
            setTimeout(() => {
                showView('homeView');
            }, 2000);
        } else {
            showToast(result.message || '加入預約失敗', 'error');
        }
    } catch (error) {
        console.error('Error adding to waitlist:', error);
        showToast('網路錯誤', 'error');
    }
}

// ==================== Helper Functions ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTypeName(type) {
    const typeNames = {
        'sport_top': '運動服上衣',
        'sport_bottom': '運動褲',
        'uniform_top': '制服上衣',
        'uniform_bottom': '制服褲/裙',
        'dress': '洋裝',
        'jacket': '外套'
    };
    return typeNames[type] || type;
}

function getGenderName(gender) {
    const genderNames = {
        'M': '男生',
        'F': '女生',
        'U': '不限'
    };
    return genderNames[gender] || gender;
}

// ==================== Service Worker Registration (Optional) ====================
if ('serviceWorker' in navigator) {
    // Uncomment to enable PWA features
    // navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed'));
}
