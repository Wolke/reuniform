import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callAPI, ApiActions, fileToBase64 } from '../api';

export default function Upload() {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [error, setError] = useState(null);

    // 處理檔案選擇
    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 檢查檔案類型
        if (!file.type.startsWith('image/')) {
            setError('請選擇圖片檔案');
            return;
        }

        setSelectedFile(file);
        setError(null);

        // 顯示預覽
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // 自動開始 AI 分析
        analyzeImage(file);
    }

    // AI 分析圖片
    async function analyzeImage(file) {
        setAnalyzing(true);
        setError(null);

        try {
            // 轉換為 Base64
            const base64 = await fileToBase64(file);

            // 呼叫後端 API
            const response = await callAPI(ApiActions.UPLOAD_ITEM, {
                imageBase64: base64,
                sellerId: 'user_001' // Mock User
            });

            if (response.status === 'success') {
                setAiResult(response.data);
            } else {
                setError(response.message || 'AI 分析失敗');
            }
        } catch (err) {
            setError('上傳失敗: ' + err.message);
        } finally {
            setAnalyzing(false);
        }
    }

    // 確認上架
    function handleConfirm() {
        // AI 已經在分析時就上架了，直接導回首頁
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* 標題 */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
                    >
                        ← 返回
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">上傳制服</h1>
                    <p className="text-gray-600 mt-2">拍攝或選擇制服照片，AI 會自動幫您填寫資訊</p>
                </div>

                {/* 上傳區域 */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    {!selectedFile ? (
                        <div>
                            <label
                                htmlFor="photo-upload"
                                className="block w-full"
                            >
                                <div className="border-4 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-lg font-semibold text-gray-700 mb-2">點擊上傳或拍照</p>
                                    <p className="text-sm text-gray-500">支援 JPG, PNG 格式</p>
                                </div>
                            </label>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div>
                            {/* 圖片預覽 */}
                            <div className="mb-6">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-96 object-contain bg-gray-100 rounded-lg"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(null);
                                        setAiResult(null);
                                        setError(null);
                                    }}
                                    className="mt-4 text-sm text-red-600 hover:text-red-800"
                                >
                                    重新選擇
                                </button>
                            </div>

                            {/* AI 分析中 */}
                            {analyzing && (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                                    <p className="text-lg font-semibold text-gray-700">AI 正在分析您的制服...</p>
                                    <p className="text-sm text-gray-500 mt-2">請稍候片刻</p>
                                </div>
                            )}

                            {/* 錯誤訊息 */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            {/* AI 分析結果 */}
                            {aiResult && !analyzing && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">✨ AI 分析結果</h3>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">學校</label>
                                            <input
                                                type="text"
                                                value={aiResult.school}
                                                readOnly
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">類型</label>
                                                <input
                                                    type="text"
                                                    value={aiResult.type}
                                                    readOnly
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">尺寸</label>
                                                <input
                                                    type="text"
                                                    value={aiResult.size}
                                                    readOnly
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">性別</label>
                                                <input
                                                    type="text"
                                                    value={aiResult.gender === 'M' ? '男' : aiResult.gender === 'F' ? '女' : '不拘'}
                                                    readOnly
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">狀況評分</label>
                                                <input
                                                    type="text"
                                                    value={`${aiResult.condition}/5`}
                                                    readOnly
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">建議售價/條件</label>
                                            <input
                                                type="text"
                                                value={aiResult.conditions}
                                                readOnly
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">瑕疵說明</label>
                                            <textarea
                                                value={aiResult.defects}
                                                readOnly
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                    {/* 成功訊息 */}
                                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                                        ✅ 商品已成功上架！
                                    </div>

                                    {/* 確認按鈕 */}
                                    <button
                                        onClick={handleConfirm}
                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all"
                                    >
                                        返回首頁
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
