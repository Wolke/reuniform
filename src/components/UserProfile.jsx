import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyItems, getMyWaitlist } from '../api';

function UserProfile() {
    const { user, logout } = useAuth();
    const [myItems, setMyItems] = useState([]);
    const [myWaitlist, setMyWaitlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadUserData();
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
                </div>
                <button
                    onClick={logout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    登出
                </button>
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
