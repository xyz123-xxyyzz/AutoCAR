import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KullaniciDashboard from './pages/KullaniciDashboard';
import SahipDashboard from './pages/SahipDashboard';
import SatinAlanDashboard from './pages/SatinAlanDashboard';
import AnalysisReport from './pages/AnalysisReport';
import ExtensionPreview from './pages/ExtensionPreview';
import LandingPage from './pages/LandingPage';
import GecmisIslemler from './pages/GecmisIslemler';
import KullaniciDetay from './pages/KullaniciDetay';
import Kullanicilar from './pages/Kullanicilar';
import Abonelik from './pages/Abonelik';
import Ayarlar from './pages/Ayarlar';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        
        {/* Sadece Yönetici (Sahip) Rotaları */}
        <Route path="/sahip" element={<ProtectedRoute allowedRoles={['Sahip']}><SahipDashboard /></ProtectedRoute>} />
        
        {/* Sadece Müşteri (Kullanıcı) Rotaları */}
        <Route path="/kullanici" element={<ProtectedRoute allowedRoles={['Kullanıcı', 'Premium', 'Satın Alan']}><KullaniciDashboard /></ProtectedRoute>} />
        <Route path="/satin-alan" element={<ProtectedRoute allowedRoles={['Kullanıcı', 'Premium', 'Satın Alan']}><SatinAlanDashboard /></ProtectedRoute>} />
        
        {/* Ortak Korumalı Rotalar */}
        <Route path="/analiz" element={<ProtectedRoute><AnalysisReport /></ProtectedRoute>} />
        <Route path="/analiz/:id" element={<ProtectedRoute><AnalysisReport /></ProtectedRoute>} />
        <Route path="/gecmis" element={<ProtectedRoute><GecmisIslemler /></ProtectedRoute>} />
        <Route path="/kullanici-detay" element={<ProtectedRoute><KullaniciDetay /></ProtectedRoute>} />
        <Route path="/eklenti-onizleme" element={<ProtectedRoute><ExtensionPreview /></ProtectedRoute>} />
        <Route path="/kullanicilar" element={<ProtectedRoute><Kullanicilar /></ProtectedRoute>} />
        <Route path="/abonelik" element={<ProtectedRoute><Abonelik /></ProtectedRoute>} />
        <Route path="/ayarlar" element={<ProtectedRoute><Ayarlar /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
