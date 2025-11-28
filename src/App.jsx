import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import Home from './components/Home';
import Upload from './components/Upload';
import Search from './components/Search';
import Items from './components/Items';
import Waitlist from './components/Waitlist';
import AuthCallback from './components/AuthCallback';
import UserProfile from './components/UserProfile';
import RequestForm from './components/RequestForm';

function ContactInfoReminder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check if user exists AND contact_info property exists (meaning backend sync is done)
    // AND contact_info is empty
    if (user && 'contact_info' in user && !user.contact_info && location.pathname !== '/profile') {
      // Simple confirm dialog for MVP
      if (window.confirm('您尚未設定聯絡資訊，這會影響買家與您聯繫。是否立即前往設定？')) {
        navigate('/profile');
      }
    }
  }, [user, navigate, location]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/reuniform">
        <ContactInfoReminder />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/search" element={<Search />} />
          <Route path="/items" element={<Items />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/waitlist/new" element={<RequestForm />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
