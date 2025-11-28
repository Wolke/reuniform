import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateContactInfo } from '../api';

function Settings() {
    const { user, saveUser } = useAuth();
    const navigate = useNavigate();
    const [contactInfo, setContactInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setContactInfo(user.contact_info || '');
        } else {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updatedUser = await updateContactInfo(user.line_user_id, contactInfo);
            saveUser(updatedUser); // Update context with new user data
            setMessage({ type: 'success', text: '聯絡資訊已更新！' });
        } catch (error) {
            console.error('Update failed:', error);
            setMessage({ type: 'error', text: '更新失敗，請稍後再試。' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>設定聯絡資訊</h2>

            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.5' }}>
                    請設定您的聯絡方式（例如：LINE ID、手機號碼或 Email）。<br />
                    當買家對您的商品有興趣時，將會看到此資訊以便與您聯繫。
                </p>

                {message.text && (
                    <div style={{
                        padding: '10px',
                        marginBottom: '20px',
                        borderRadius: '4px',
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="contactInfo"
                            style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
                        >
                            聯絡資訊
                        </label>
                        <input
                            type="text"
                            id="contactInfo"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder="例如：Line ID: mylineid123"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '16px'
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#06c755',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? '儲存中...' : '儲存設定'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            返回個人頁
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Settings;
