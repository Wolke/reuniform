import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ItemCard from './ItemCard';
import { callAPI, ApiActions } from '../api';

export default function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [suggestWaitlist, setSuggestWaitlist] = useState(false);
    const [intent, setIntent] = useState(null);

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setQuery(q);
            performSearch(q);
        }
    }, [searchParams]);

    async function performSearch(searchQuery) {
        setLoading(true);
        setSearched(true);
        setSuggestWaitlist(false);

        const response = await callAPI(ApiActions.SEARCH_ITEMS, {
            query: searchQuery
        });

        if (response.status === 'success') {
            setResults(response.results || []);
            setSuggestWaitlist(response.suggestWaitlist || false);
            setIntent(response.intent);
        }

        setLoading(false);
    }

    function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }

    async function handleAddToWaitlist() {
        if (!intent) return;

        const response = await callAPI(ApiActions.ADD_TO_WAITLIST, {
            school: intent.school,
            type: intent.type,
            size: intent.size_approx,
            requesterId: 'user_001'
        });

        if (response.status === 'success') {
            alert('✅ 已加入預約清單！當有符合的商品上架時，我們會通知您。');
            navigate('/waitlist');
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* 返回按鈕 */}
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
                >
                    ← 返回首頁
                </button>

                {/* 搜尋框 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">搜尋制服</h1>
                    <form onSubmit={handleSearch}>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="例如：我要找海山國小三年級女生的運動服"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                🔍 搜尋
                            </button>
                        </div>
                    </form>

                    {/* 顯示 AI 解析的意圖 */}
                    {intent && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>AI 理解您的需求:</strong> {intent.school} • {intent.type} • {intent.gender} • 尺寸 {intent.size_approx}
                            </p>
                        </div>
                    )}
                </div>

                {/* 載入中 */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">搜尋中...</p>
                    </div>
                )}

                {/* 搜尋結果 */}
                {!loading && searched && (
                    <div>
                        {results.length > 0 ? (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    找到 {results.length} 件商品
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.map((item) => (
                                        <ItemCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* 無結果 - 顯示加入預約清單選項 */
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">目前缺貨</h3>
                                <p className="text-gray-600 mb-6">
                                    沒有找到符合「{query}」的商品
                                </p>

                                {suggestWaitlist && (
                                    <button
                                        onClick={handleAddToWaitlist}
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all inline-flex items-center gap-2"
                                    >
                                        🔔 加入缺貨預約清單
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 初始狀態 */}
                {!searched && !loading && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-gray-600">輸入您想找的制服，AI 會幫您智慧搜尋</p>
                    </div>
                )}
            </div>
        </div>
    );
}
