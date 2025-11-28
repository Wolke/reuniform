import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyLineLogin } from '../api';

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { saveUser } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');

            // 檢查錯誤
            if (error) {
                console.error('LINE Login error:', error);
                alert('登入失敗：' + error);
                navigate('/');
                return;
            }

            // 驗證 state
            const storedState = sessionStorage.getItem('line_state');
            if (!state || state !== storedState) {
                console.error('State mismatch');
                alert('登入驗證失敗，請重試');
                navigate('/');
                return;
            }

            // 如果沒有 code，也視為錯誤
            if (!code) {
                console.error('No authorization code');
                alert('登入失敗，請重試');
                navigate('/');
                return;
            }

            try {
                // 呼叫後端驗證並獲取使用者資訊
                const userData = await verifyLineLogin(code);

                // 儲存使用者資訊
                saveUser(userData);

                // 清除 session storage
                sessionStorage.removeItem('line_state');
                sessionStorage.removeItem('line_nonce');

                // 導向首頁
                navigate('/');
            } catch (error) {
                console.error('Failed to verify LINE login:', error);
                alert('登入處理失敗：' + error.message);
                navigate('/');
            }
        };

        handleCallback();
    }, [searchParams, navigate, saveUser]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div className="loading-spinner" style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #06c755',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite'
            }}></div>
            <p>正在處理 LINE 登入...</p>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default AuthCallback;
