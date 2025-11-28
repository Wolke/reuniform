import { useState, useEffect } from 'react';
import { UNIFORM_TYPE_MAP } from '../constants';

export default function ItemForm({ initialData, onSubmit, submitLabel = '確認並上架', loading = false, showStatus = false }) {
    const [formData, setFormData] = useState({
        school: '',
        type: '',
        gender: 'U',
        size: '',
        condition: 3,
        conditions: '',
        defects: '',
        status: 'published',
        ...initialData
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">✨ 確認並編輯資訊</h3>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">學校</label>
                    <input
                        type="text"
                        value={formData.school}
                        onChange={(e) => handleChange('school', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">類型</label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">請選擇類型</option>
                            {Object.entries(UNIFORM_TYPE_MAP).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">尺寸</label>
                        <input
                            type="text"
                            value={formData.size}
                            onChange={(e) => handleChange('size', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">性別</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="U">不拘</option>
                            <option value="M">男</option>
                            <option value="F">女</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">狀況評分 (1-5)</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.condition}
                            onChange={(e) => handleChange('condition', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">建議售價/條件</label>
                    <input
                        type="text"
                        value={formData.conditions}
                        onChange={(e) => handleChange('conditions', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">瑕疵說明</label>
                    <textarea
                        value={formData.defects}
                        onChange={(e) => handleChange('defects', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {showStatus && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">商品狀態</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="published">上架中</option>
                            <option value="unshelved">不上架</option>
                            <option value="completed">交易完成</option>
                        </select>
                    </div>
                )}
            </div>

            {/* 確認按鈕 */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? '處理中...' : submitLabel}
            </button>
        </div>
    );
}
