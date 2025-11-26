import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemCard from './ItemCard';
import { callAPI, ApiActions } from '../api';

export default function Items() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        setLoading(true);
        const response = await callAPI(ApiActions.GET_RECENT_ITEMS);

        if (response.status === 'success') {
            setItems(response.data || []);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* 標題 */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
                    >
                        ← 返回首頁
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">所有商品</h1>
                    <p className="text-gray-600 mt-2">瀏覽所有二手制服</p>
                </div>

                {/* 載入中 */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">載入中...</p>
                    </div>
                ) : items.length > 0 ? (
                    <div>
                        <p className="text-gray-600 mb-6">共 {items.length} 件商品</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map((item) => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-600">目前尚無商品</p>
                    </div>
                )}
            </div>
        </div>
    );
}
