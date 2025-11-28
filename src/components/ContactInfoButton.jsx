import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedAction from './ProtectedAction';

export default function ContactInfoButton({
    fetchContact,
    label = '📞 查看聯絡方式',
    loadingLabel = '載入中...'
}) {
    const { user, isAuthenticated } = useAuth();
    const [showContact, setShowContact] = useState(false);
    const [contactInfo, setContactInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleViewContact = async () => {
        if (!isAuthenticated || !user) return;

        setLoading(true);
        try {
            const contact = await fetchContact();
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
                    {loading ? loadingLabel : label}
                </button>
            ) : (
                <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs font-semibold text-gray-700 mb-1">聯絡方式：</p>
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
    );
}
