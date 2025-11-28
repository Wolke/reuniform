import { useAuth } from '../contexts/AuthContext';

function ProtectedAction({ children, fallback }) {
    const { isAuthenticated, login } = useAuth();

    if (isAuthenticated) {
        return children;
    }

    if (fallback) {
        return fallback;
    }

    // 預設的登入提示介面
    return (
        <div style={{
            padding: '20px',
            textAlign: 'center',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <p style={{ marginBottom: '15px', color: '#666' }}>
                此功能需要登入才能使用
            </p>
            <button
                onClick={login}
                style={{
                    backgroundColor: '#06c755',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span>使用 LINE 登入</span>
            </button>
        </div>
    );
}

export default ProtectedAction;
