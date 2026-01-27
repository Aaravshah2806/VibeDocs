import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import './index.css';
import './components.css';
import './pages.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generator/:repoId" element={<Generator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
