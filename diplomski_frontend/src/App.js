import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PropertyDetails from './pages/PropertyDetails';
import Favorites from './pages/Favorites';
import Analytics from './pages/Analytics';
import Footer from './components/Footer';

const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';
  const isAuthPage = location.pathname === '/';

  return (
    <div className={`app-container ${isAuthPage ? 'auth-page' : ''}`}>
      {showNavbar && <Navbar />}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};



function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
