import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { callAPI, ApiActions } from '../api';
import WaitlistCard from './WaitlistCard';

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
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                        >
                            ← 返回首頁
                        </button>
                        <button
                            onClick={() => navigate('/waitlist/new')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + 新增需求
                        </button>
                    </div>
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
                                <WaitlistCard key={req.id} req={req} />
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
