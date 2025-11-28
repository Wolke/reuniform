import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { callAPI, ApiActions } from '../api';

const UNIFORM_TYPES = [
    { value: 'any', label: '不拘' },
    { value: 'sport_top_short', label: '運動服-短袖上衣' },
    { value: 'sport_top_long', label: '運動服-長袖上衣' },
    { value: 'sport_bottom_short', label: '運動服-短褲' },
    { value: 'sport_bottom_long', label: '運動服-長褲' },
    { value: 'uniform_top_short', label: '制服-短袖上衣' },
    { value: 'uniform_top_long', label: '制服-長袖上衣' },
    { value: 'uniform_bottom_short', label: '制服-短褲' },
    { value: 'uniform_bottom_long', label: '制服-長褲' },
    { value: 'uniform_skirt', label: '制服-裙子' },
    { value: 'dress', label: '洋裝' },
    { value: 'jacket', label: '外套' },
    { value: 'other', label: '其他' }
];

export default function RequestForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        school: '',
        type: '',
        size: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Pre-fill from location state if available (e.g. from Search redirect)
        if (location.state?.initialData) {
            const { school, type, size_approx } = location.state.initialData;
            setFormData(prev => ({
                ...prev,
                school: school || '',
                type: type || '', // Note: type might not match our select values if it came from raw AI text, but we'll try
                size: size_approx || ''
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!user) {
            setError('請先登入');
            setLoading(false);
            return;
        }

        try {
            const response = await callAPI(ApiActions.ADD_TO_WAITLIST, {
                school: formData.school,
                type: formData.type,
                size: formData.size,
                requesterId: user.line_user_id
            });

            if (response.status === 'success') {
                alert('✅ 需求單已送出！');
                navigate('/waitlist');
            } else {
                setError(response.message || '送出失敗，請稍後再試');
            }
        } catch (err) {
            setError('發生錯誤，請檢查網路連線');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-md">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
                >
                    ← 返回
                </button>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">填寫需求單</h1>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">學校名稱</label>
                            <input
                                type="text"
                                name="school"
                                value={formData.school}
                                onChange={handleChange}
                                placeholder="例如：海山國小"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">制服種類</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">請選擇種類</option>
                                {UNIFORM_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">尺寸</label>
                            <input
                                type="text"
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                placeholder="例如：140, M, 30腰"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? '送出中...' : '送出需求'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
