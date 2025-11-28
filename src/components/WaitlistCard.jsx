import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ContactInfoButton from './ContactInfoButton';
import { getWaitlistContact } from '../api';
import { UNIFORM_TYPE_MAP } from '../constants';

export default function WaitlistCard({ req, showContactInfo = true, showEditButton = false }) {
    const { user } = useAuth();

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* 標題 */}
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{req.school}</h3>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                    尋找中
                </span>
            </div>

            {/* 詳細資訊 */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-semibold">類型:</span>
                    <span>{getTypeLabel(req.type)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    <span className="font-semibold">尺寸:</span>
                    <span>{req.size || '不限'}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">發布時間: {formatDate(req.created_at)}</p>
                </div>
            </div>

            {/* 聯絡按鈕 */}
            {showContactInfo && (
                <div className="mt-4">
                    <ContactInfoButton
                        fetchContact={() => getWaitlistContact(req.id, user?.line_user_id)}
                    />
                </div>
            )}

            {/* 編輯按鈕 */}
            {showEditButton && (
                <Link
                    to={`/edit-waitlist/${req.id}`}
                    state={{ request: req }}
                    className="block text-center mt-4 p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                    編輯需求
                </Link>
            )}
        </div>
    );
}

// Helper function to get type label in Chinese
function getTypeLabel(type) {
    if (!type) return '不限';
    const cleanType = type.trim();
    return UNIFORM_TYPE_MAP[cleanType] || cleanType;
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
