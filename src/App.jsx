import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Upload from './components/Upload';
import Search from './components/Search';
import Items from './components/Items';
import Waitlist from './components/Waitlist';

function App() {
  return (
    <BrowserRouter basename="/reuniform">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/search" element={<Search />} />
        <Route path="/items" element={<Items />} />
        <Route path="/waitlist" element={<Waitlist />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
