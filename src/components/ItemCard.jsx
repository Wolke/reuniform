import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedAction from './ProtectedAction';
import { getItemContact } from '../api';

export default function ItemCard({ item }) {
    console.log('ItemCard item:', item);
    const { user, isAuthenticated } = useAuth();
    const [showContact, setShowContact] = useState(false);
    const [contactInfo, setContactInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleViewContact = async () => {
        if (!isAuthenticated || !user) return;

        setLoading(true);
        try {
            const contact = await getItemContact(item.id, user.line_user_id);
            setContactInfo(contact);
            setShowContact(true);
        } catch (error) {
            console.error('Failed to get contact info:', error);
            alert('無法取得聯絡資訊：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* 圖片 */}
            <div className="relative h-64 bg-gray-200">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={`${item.school} ${item.type}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            console.error('Image failed to load:', item.image_url);
                            e.target.src = '';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* 狀況評分 Badge */}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {item.condition_score || 3}/5
                </div>
            </div>

            {/* 內容 */}
            <div className="p-4">
                {/* 學校名稱 */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {item.school || '未知學校'}
                </h3>

                {/* 類型與尺寸 */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {getTypeLabel(item.type)}
                    </span>
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {item.gender === 'M' ? '男' : item.gender === 'F' ? '女' : '不拘'}
                    </span>
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        尺寸 {item.size || 'M'}
                    </span>
                </div>

                {/* 瑕疵說明 */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.defects || '無明顯瑕疵'}
                </p>

                {/* 價格/條件 */}
                <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-green-600">
                        {item.conditions || '可議'}
                    </div>
                    <div className="text-xs text-gray-400">
                        {formatDate(item.created_at)}
                    </div>
                </div>

                {/* 聯絡資訊區域 - 需要登入 */}
                <div className="border-t pt-3">
                    <ProtectedAction
                        fallback={
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-2">登入後可查看聯絡方式</p>
                            </div>
                        }
                    >
                        {!showContact ? (
                            <button
                                onClick={handleViewContact}
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {loading ? '載入中...' : '📞 查看聯絡方式'}
                            </button>
                        ) : (
                            <div className="bg-blue-50 p-3 rounded">
                                <p className="text-xs font-semibold text-gray-700 mb-1">賣家聯絡方式：</p>
                                {contactInfo && (
                                    <div className="text-sm text-gray-800">
                                        <p>👤 {contactInfo.seller_name}</p>
                                        {contactInfo.contact_info && (
                                            <p>📱 {contactInfo.contact_info}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </ProtectedAction>
                </div>
            </div>
        </div>
    );
}

// Helper function to get type label in Chinese
function getTypeLabel(type) {
    if (!type) return '制服';
    const cleanType = type.trim();
    const typeMap = {
        'sport_top_short': '運動短袖',
        'sport_top_long': '運動長袖',
        'sport_bottom_short': '運動短褲',
        'sport_bottom_long': '運動長褲',
        'uniform_top_short': '制服短袖',
        'uniform_top_long': '制服長袖',
        'uniform_bottom_short': '制服短褲',
        'uniform_bottom_long': '制服長褲',
        'uniform_skirt': '裙子',
        'dress': '洋裝',
        'jacket': '外套'
    };

    return typeMap[cleanType] || cleanType;
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}
