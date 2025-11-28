import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Upload from './components/Upload';
import Search from './components/Search';
import Items from './components/Items';
import Waitlist from './components/Waitlist';
import AuthCallback from './components/AuthCallback';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/reuniform">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/search" element={<Search />} />
          <Route path="/items" element={<Items />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
