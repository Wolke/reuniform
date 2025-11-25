/**
 * Re:Uniform Frontend Logic
 * Premium Mobile-First Version
 */

// ==================== Configuration ====================
const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbwRjKXzkd7dNd8dkyKeobfE8DacmHp20z-Ubh14qUcliVmbNNhXW_Egh6IxwNlEUaq40Q/exec",
    MOCK_USER_ID: "user_001"
};

// ==================== State ====================
const state = {
    currentView: 'home',
    searchQuery: '',
    uploadImage: null,
    uploadData: {}
};

// ==================== DOM Elements ====================
const dom = {
    views: document.querySelectorAll('.view'),
    navItems: document.querySelectorAll('.nav-item'),
    uploadModal: document.getElementById('uploadModal'),
    toast: document.getElementById('toast'),

    // Home
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    recentItemsList: document.getElementById('recentItemsList'),
    recentWaitlistList: document.getElementById('recentWaitlistList'),

    // Upload
    uploadBtn: document.getElementById('uploadBtn'),
    closeUploadBtn: document.getElementById('closeUploadBtn'),
    imageInput: document.getElementById('imageInput'),
    uploadTrigger: document.getElementById('uploadTrigger'),
    previewContainer: document.getElementById('previewContainer'),
    imagePreview: document.getElementById('imagePreview'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    retakeBtn: document.getElementById('retakeBtn'),
    itemForm: document.getElementById('itemForm'),

    // Result
    queryDisplay: document.getElementById('queryDisplay'),
    resultsContainer: document.getElementById('resultsContainer'),
    emptyState: document.getElementById('emptyState'),
    addWaitlistBtn: document.getElementById('addWaitlistBtn')
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initEventListeners();
    loadDashboardData();
});

function initEventListeners() {
    // Navigation
    dom.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.dataset.view;
            if (view) navigateTo(view);
        });
    });

    // Search
    dom.searchBtn.addEventListener('click', handleSearch);
    dom.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Search Tags
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            dom.searchInput.value = tag.dataset.query;
            handleSearch();
        });
    });

    // Upload Flow
    dom.uploadBtn.addEventListener('click', openUploadModal);
    dom.closeUploadBtn.addEventListener('click', closeUploadModal);

    dom.uploadTrigger.addEventListener('click', () => dom.imageInput.click());
    dom.imageInput.addEventListener('change', handleImageSelect);

    dom.retakeBtn.addEventListener('click', resetUploadStep);
    dom.analyzeBtn.addEventListener('click', handleAnalyze);

    dom.itemForm.addEventListener('submit', handleSubmitItem);

    // Range Slider UI
    document.getElementById('conditionRange').addEventListener('input', (e) => {
        document.getElementById('conditionValue').textContent = e.target.value;
    });

    // Result View
    document.querySelector('.btn-back').addEventListener('click', () => navigateTo('home'));
    dom.addWaitlistBtn.addEventListener('click', handleAddToWaitlist);

    // Reset Flow
    document.getElementById('resetUploadBtn').addEventListener('click', () => {
        resetUploadStep();
        showStep('step-camera');
    });
}

// ==================== Router ====================
function initRouter() {
    // Simple hash-based routing or default to home
    const hash = window.location.hash.slice(1);
    if (hash && ['home', 'result'].includes(hash)) {
        navigateTo(hash);
    } else {
        navigateTo('home');
    }
}

function navigateTo(viewId) {
    state.currentView = viewId;

    // Update UI
    dom.views.forEach(view => {
        if (view.id === `${viewId}-view`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Update Nav
    dom.navItems.forEach(item => {
        if (item.dataset.view === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    window.scrollTo(0, 0);
}

// ==================== API Service ====================
const api = {
    async post(action, data = {}) {
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action, ...data })
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            showToast('網路連線錯誤', 'error');
            throw error;
        }
    }
};

// ==================== Feature: Dashboard ====================
async function loadDashboardData() {
    try {
        // Parallel fetch
        const [itemsRes, waitlistRes] = await Promise.all([
            api.post('getRecentItems'),
            api.post('getRecentWaitlist')
        ]);

        if (itemsRes.status === 'success') {
            renderItems(itemsRes.data, dom.recentItemsList);
        }

        if (waitlistRes.status === 'success') {
            renderWaitlist(waitlistRes.data, dom.recentWaitlistList);
        }
    } catch (e) {
        console.error('Dashboard load failed', e);
    }
}

function renderItems(items, container) {
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">目前沒有商品</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="item-card">
            <div class="item-thumb" style="background-color: ${stringToColor(item.school)}"></div>
            <div class="item-info">
                <div class="item-school">${escapeHtml(item.school)}</div>
                <div class="item-meta">
                    <span>${getTypeName(item.type)}</span>
                    <span>•</span>
                    <span>${escapeHtml(item.size)}</span>
                    <span>•</span>
                    <span>${item.condition_score}/5</span>
                </div>
                <div class="item-conditions">${escapeHtml(item.conditions || '可議')}</div>
            </div>
        </div>
    `).join('');
}

function renderWaitlist(list, container) {
    if (!list || list.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">目前沒有需求</p>';
        return;
    }

    container.innerHTML = list.map(req => `
        <div class="waitlist-row">
            <div class="waitlist-school">${escapeHtml(req.school)}</div>
            <div class="waitlist-req">徵求：${getTypeName(req.type)} / ${escapeHtml(req.size)}</div>
        </div>
    `).join('');
}

// ==================== Feature: Search ====================
async function handleSearch() {
    const query = dom.searchInput.value.trim();
    if (!query) return showToast('請輸入搜尋內容', 'error');

    navigateTo('result');
    dom.queryDisplay.innerHTML = `<span class="text-muted">搜尋：</span> <strong>${escapeHtml(query)}</strong>`;
    dom.resultsContainer.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';
    dom.emptyState.classList.add('hidden');

    const res = await api.post('searchItems', { query });

    if (res.status === 'success') {
        state.lastSearchIntent = res.intent;
        if (res.results.length > 0) {
            renderItems(res.results, dom.resultsContainer);
        } else {
            dom.resultsContainer.innerHTML = '';
            dom.emptyState.classList.remove('hidden');
        }
    } else {
        showToast(res.message || '搜尋失敗', 'error');
        dom.resultsContainer.innerHTML = '';
    }
}

async function handleAddToWaitlist() {
    if (!state.lastSearchIntent) return;

    const { school, type, size_approx } = state.lastSearchIntent;
    const res = await api.post('addToWaitlist', {
        school, type, size: size_approx, requesterId: CONFIG.MOCK_USER_ID
    });

    if (res.status === 'success') {
        showToast('已加入預約清單！', 'success');
        setTimeout(() => navigateTo('home'), 2000);
    }
}

// ==================== Feature: Upload ====================
function openUploadModal() {
    dom.uploadModal.classList.add('active');
    resetUploadStep();
}

function closeUploadModal() {
    dom.uploadModal.classList.remove('active');
}

function showStep(stepId) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        state.uploadImage = event.target.result;
        dom.imagePreview.src = state.uploadImage;
        dom.uploadTrigger.classList.add('hidden');
        dom.previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function resetUploadStep() {
    state.uploadImage = null;
    dom.imageInput.value = '';
    dom.uploadTrigger.classList.remove('hidden');
    dom.previewContainer.classList.add('hidden');
    showStep('step-camera');
}

async function handleAnalyze() {
    if (!state.uploadImage) return showToast('請先選擇照片', 'error');

    showStep('step-loading');

    const res = await api.post('uploadItem', {
        imageBase64: state.uploadImage,
        sellerId: CONFIG.MOCK_USER_ID
    });

    if (res.status === 'success') {
        const data = res.data;
        // Fill Form
        document.getElementById('schoolInput').value = data.school || '';
        document.getElementById('typeInput').value = data.type || 'sport_top';
        document.getElementById('sizeInput').value = data.size || '';
        document.getElementById('conditionsInput').value = data.conditions || '';
        document.getElementById('conditionRange').value = data.condition || 3;
        document.getElementById('conditionValue').textContent = data.condition || 3;

        showStep('step-form');
    } else {
        showToast('AI 分析失敗，請重試', 'error');
        showStep('step-camera');
    }
}

async function handleSubmitItem(e) {
    e.preventDefault();
    // In a real app, we would send the edited data back to update the item
    // For this demo, we assume the initial upload created the item and we are just confirming
    showStep('step-success');
}

// ==================== Helpers ====================
function showToast(msg, type = 'success') {
    dom.toast.textContent = msg;
    dom.toast.className = `toast-notification show ${type}`;
    setTimeout(() => {
        dom.toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getTypeName(type) {
    const map = {
        'sport_top_short': '運動服短袖',
        'sport_top_long': '運動服長袖',
        'sport_bottom_short': '運動短褲',
        'sport_bottom_long': '運動長褲',
        'uniform_top_short': '制服短袖',
        'uniform_top_long': '制服長袖',
        'uniform_bottom_short': '制服短褲',
        'uniform_bottom_long': '制服長褲',
        'uniform_skirt': '制服裙',
        'dress': '洋裝',
        'jacket': '外套',
        // Legacy support
        'sport_top': '運動服上衣',
        'sport_bottom': '運動褲',
        'uniform_top': '制服上衣',
        'uniform_bottom': '制服褲/裙'
    };
    return map[type] || type;
}

function stringToColor(str) {
    // Generate a consistent pastel color from string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
}
