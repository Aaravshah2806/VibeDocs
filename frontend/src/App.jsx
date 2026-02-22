import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import SpaceBackground from './components/SpaceBackground';
import './index.css';
import './components.css';
import './pages.css';

import AuthCallback from './pages/AuthCallback';

const Debug404 = () => (
  <div style={{ padding: '40px', color: 'white' }}>
    <h1>DEBUG 404</h1>
    <p>Current Path: {window.location.pathname}</p>
    <a href="/" style={{ color: '#6366f1' }}>Go Home</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Global animated space background */}
      <SpaceBackground starCount={120} shootingStarInterval={4000} nebulaeCount={4} />
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generator/:owner/:repo" element={<Generator />} />
        <Route path="/generator/:repoId" element={<Generator />} />
        <Route path="/generator" element={<Dashboard />} />
        <Route path="*" element={<Debug404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

