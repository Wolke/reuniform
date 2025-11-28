import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyItems, updateItem } from '../api';
import ItemForm from './ItemForm';

export default function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [itemData, setItemData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;

        // If data passed via state, use it
        if (location.state?.item) {
            setItemData(location.state.item);
            setLoading(false);
            return;
        }

        // Otherwise fetch from API
        loadItem();
    }, [user, id, location.state]);

    async function loadItem() {
        try {
            const items = await getMyItems(user.line_user_id);
            const item = items.find(i => i.id === id);
            if (item) {
                setItemData(item);
            } else {
                setError('找不到此商品');
            }
        } catch (err) {
            setError('載入失敗: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(formData) {
        setSaving(true);
        setError(null);

        try {
            await updateItem({
                ...formData,
                id: id,
                sellerId: user.line_user_id
            });
            alert('✅ 商品資訊已更新！');
            navigate('/profile');
        } catch (err) {
            setError('更新失敗: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8 text-center">載入中...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!itemData) return <div className="p-8 text-center">找不到資料</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <button
                    onClick={() => navigate('/profile')}
                    className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
                >
                    ← 返回個人頁面
                </button>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">編輯商品</h1>

                    {itemData.image_url && (
                        <div className="mb-6">
                            <img
                                src={itemData.image_url}
                                alt="Product"
                                className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                            />
                        </div>
                    )}

                    <ItemForm
                        initialData={itemData}
                        onSubmit={handleSave}
                        loading={saving}
                        submitLabel="儲存變更"
                        showStatus={true}
                    />
                </div>
            </div>
        </div>
    );
}
