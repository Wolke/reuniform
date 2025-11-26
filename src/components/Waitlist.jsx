import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { callAPI, ApiActions } from '../api';

export default function Waitlist() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        setLoading(true);
        const response = await callAPI(ApiActions.GET_RECENT_WAITLIST);

        if (response.status === 'success') {
            setRequests(response.data || []);
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
                    <h1 className="text-3xl font-bold text-gray-800">預約需求</h1>
                    <p className="text-gray-600 mt-2">查看所有待媒合的制服需求</p>
                </div>

                {/* 載入中 */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">載入中...</p>
                    </div>
                ) : requests.length > 0 ? (
                    <div>
                        <p className="text-gray-600 mb-6">共 {requests.length} 筆需求</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {requests.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
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
                                            <span>{req.type || '不限'}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-700">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                            </svg>
                                            <span className="font-semibold">尺寸:</span>
                                            <span>{req.size || '不限'}</span>
                                        </div>

                                        <div className="pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">發布時間: {req.created_at}</p>
                                        </div>
                                    </div>

                                    {/* 聯絡按鈕 */}
                                    <button
                                        onClick={() => alert('請實作聯絡功能')}
                                        className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                                    >
                                        📱 有相關制服，聯絡需求者
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-600">目前無待媒合需求</p>
                    </div>
                )}
            </div>
        </div>
    );
}
