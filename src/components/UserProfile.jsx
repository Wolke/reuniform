import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyItems, getMyWaitlist, updateContactInfo } from '../api';

function UserProfile() {
    const { user, logout, saveUser } = useAuth();
    const [myItems, setMyItems] = useState([]);
    const [myWaitlist, setMyWaitlist] = useState([]);
    const [loading, setLoading] = useState(true);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editContactInfo, setEditContactInfo] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            loadUserData();
            setEditContactInfo(user.contact_info || '');
        }
    }, [user]);

    const loadUserData = async () => {
        setLoading(true);
        try {
            const [items, waitlist] = await Promise.all([
                getMyItems(user.line_user_id),
                getMyWaitlist(user.line_user_id)
            ]);
            setMyItems(items);
            setMyWaitlist(waitlist);
        } catch (error) {
            console.error('Failed to load user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveContactInfo = async () => {
        setSaving(true);
        try {
            const updatedUser = await updateContactInfo(user.line_user_id, editContactInfo);
            saveUser(updatedUser);
            setIsEditing(false);
            alert('聯絡資訊已更新！');
        } catch (error) {
            console.error('Update failed:', error);
            alert('更新失敗，請稍後再試。');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
                <p>請先登入</p>
                <Link to="/">返回首頁</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '20px' }}>
            {/* 使用者資訊 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
            }}>
                {user.picture_url && (
                    <img
                        src={user.picture_url}
                        alt={user.display_name}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '3px solid #06c755'
                        }}
                    />
                )}
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 10px 0' }}>{user.display_name}</h2>
                    <p style={{ margin: 0, color: '#666' }}>LINE ID: {user.line_user_id}</p>

                    <div style={{ marginTop: '10px' }}>
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={editContactInfo}
                                    onChange={(e) => setEditContactInfo(e.target.value)}
                                    placeholder="輸入聯絡資訊 (例如 Line ID)"
                                    style={{
                                        padding: '5px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        flex: 1
                                    }}
                                />
                                <button
                                    onClick={handleSaveContactInfo}
                                    disabled={saving}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {saving ? '儲存中...' : '儲存'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContactInfo(user.contact_info || '');
                                    }}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    取消
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
                                    聯絡資訊: <span style={{ color: user.contact_info ? '#333' : '#dc3545', fontWeight: 'bold' }}>
                                        {user.contact_info || '未設定 (請點擊編輯設定)'}
                                    </span>
                                </p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        padding: '2px 8px',
                                        fontSize: '12px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #007bff',
                                        color: '#007bff',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    編輯
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={logout}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        登出
                    </button>
                </div>
            </div>

            {/* 我的上架商品 */}
            <section style={{ marginBottom: '40px' }}>
                <h3>我的上架商品 ({myItems.length})</h3>
                {loading ? (
                    <p>載入中...</p>
                ) : myItems.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {myItems.map(item => (
                            <div key={item.id} style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: 'white'
                            }}>
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.school} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                )}
                                <div style={{ padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>{item.school}</h4>
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                                        {item.type} | {item.gender} | {item.size}
                                    </p>
                                    <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#06c755' }}>
                                        {item.conditions}
                                    </p>
                                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                                        狀態: {item.status === 'published' ? '已發布' : '草稿'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#999' }}>尚無上架商品</p>
                )}
            </section>

            {/* 我的缺貨預約 */}
            <section>
                <h3>我的缺貨預約 ({myWaitlist.length})</h3>
                {loading ? (
                    <p>載入中...</p>
                ) : myWaitlist.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {myWaitlist.map(wait => (
                            <div key={wait.id} style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                backgroundColor: 'white'
                            }}>
                                <h4 style={{ margin: '0 0 10px 0' }}>{wait.target_school}</h4>
                                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                                    類型: {wait.target_type} | 尺寸: {wait.target_size}
                                </p>
                                <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                                    狀態: {wait.status === 'active' ? '等待中' : '已完成'}
                                </p>
                                <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                                    建立時間: {wait.created_at}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#999' }}>尚無缺貨預約</p>
                )}
            </section>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <Link to="/" style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold'
                }}>
                    返回首頁
                </Link>
            </div>
        </div>
    );
}

export default UserProfile;
