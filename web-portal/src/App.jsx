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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/sahip" element={<SahipDashboard />} />
        <Route path="/kullanici" element={<KullaniciDashboard />} />
        <Route path="/satin-alan" element={<SatinAlanDashboard />} />
        <Route path="/analiz" element={<AnalysisReport />} />
        <Route path="/gecmis" element={<GecmisIslemler />} />
        <Route path="/kullanici-detay" element={<KullaniciDetay />} />
        <Route path="/eklenti-onizleme" element={<ExtensionPreview />} />
        <Route path="/kullanicilar" element={<Kullanicilar />} />
        <Route path="/abonelik" element={<Abonelik />} />
        <Route path="/ayarlar" element={<Ayarlar />} />
      </Routes>
    </Router>
  );
}

export default App;
