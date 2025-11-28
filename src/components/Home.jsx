import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ItemCard from './ItemCard';
import WaitlistCard from './WaitlistCard';
import { callAPI, ApiActions } from '../api';

export default function Home() {
    const [recentItems, setRecentItems] = useState([]);
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, login, isAuthenticated } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);

        // 載入最近商品
        const itemsResponse = await callAPI(ApiActions.GET_RECENT_ITEMS);
        if (itemsResponse.status === 'success') {
            setRecentItems(itemsResponse.data.slice(0, 3)); // 只取前 3 筆
        }

        // 載入最近需求
        const requestsResponse = await callAPI(ApiActions.GET_RECENT_WAITLIST);
        if (requestsResponse.status === 'success') {
            setRecentRequests(requestsResponse.data.slice(0, 3)); // 只取前 3 筆
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
                <div className="container mx-auto px-4">
                    {/* 使用者登入狀態 */}
                    <div className="flex justify-end mb-4">
                        {isAuthenticated ? (
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
                            >
                                {user?.picture_url && (
                                    <img
                                        src={user.picture_url}
                                        alt={user.display_name}
                                        className="w-8 h-8 rounded-full border-2 border-white"
                                    />
                                )}
                                <span className="font-semibold">{user?.display_name}</span>
                            </Link>
                        ) : (
                            <button
                                onClick={login}
                                className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full font-semibold transition-colors"
                            >
                                登入
                            </button>
                        )}
                    </div>

                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-4">Re:Uniform</h1>
                        <p className="text-xl mb-8">二手制服循環平台 • 讓愛傳遞</p>

                        {/* 搜尋框 - Story B 入口 */}
                        <div className="max-w-2xl mx-auto">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const query = e.target.search.value;
                                window.location.href = `/reuniform/search?q=${encodeURIComponent(query)}`;
                            }}>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="例如：我要找海山國小三年級女生的運動服"
                                        className="flex-1 px-6 py-4 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                                    >
                                        🔍 搜尋
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* 最近上傳的制服 */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">最近上傳的制服</h2>
                    <Link
                        to="/items"
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
                    >
                        更多 →
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">載入中...</p>
                    </div>
                ) : recentItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500">目前尚無商品</p>
                    </div>
                )}
            </div>

            {/* 最近的需求 */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">最近的需求</h2>
                    <Link
                        to="/waitlist"
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
                    >
                        更多 →
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                    </div>
                ) : recentRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentRequests.map((req) => (
                            <WaitlistCard key={req.id} req={req} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500">目前無待媒合需求</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button - Story A 入口 */}
            <Link
                to="/upload"
                className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-50"
                title="上傳制服"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </Link>
        </div>
    );
}
