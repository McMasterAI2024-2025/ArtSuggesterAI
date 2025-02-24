import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Favourites from './pages/Favourites';
import Suggested from './pages/Suggested';
import NoPage from './pages/NoPage';
import './App.css';
import "@fontsource/fira-code";
import CreateAccount from './pages/CreateAccount';

function App() {
  
  return (
    <AuthProvider>
      <div className="app-container">
        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/suggested" element={<Suggested />} />
            <Route path="/createAccount" element={<CreateAccount />} />
            <Route path="*" element={<NoPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
