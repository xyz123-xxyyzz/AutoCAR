import { useState } from 'react';
import { Puzzle, Globe, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

export default function Ayarlar() {
  const role = localStorage.getItem('userRole') || 'Kullanıcı';
  const navigate = useNavigate();
  const [chromeInstalled, setChromeInstalled] = useState(false);
  const [firefoxInstalled, setFirefoxInstalled] = useState(false);
  
  const [toast, setToast] = useState(null); // { type: 'success' | 'warning', message: '' }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInstallChrome = () => {
    if (chromeInstalled) {
      showToast('warning', 'Eklenti zaten eklenmiş!');
    } else {
      setChromeInstalled(true);
      showToast('success', 'Chrome tarayıcınıza başarıyla eklendi!');
    }
  };

  const handleInstallFirefox = () => {
    if (firefoxInstalled) {
      showToast('warning', 'Eklenti zaten eklenmiş!');
    } else {
      setFirefoxInstalled(true);
      showToast('success', 'Firefox tarayıcınıza başarıyla eklendi!');
    }
  };

  return (
    <DashboardLayout subscriptionType={role} userName={role === 'Sahip' ? 'Yönetici' : 'Demo'} credits={role === 'Sahip' ? '999.999' : role === 'Premium' ? '15.400' : 15}>
      <header className="mb-12">
        <h1 className="text-5xl font-display font-black tracking-tighter mb-4 text-black uppercase">
          Ayarlar
        </h1>
        <p className="text-black/50 font-bold tracking-[0.2em] uppercase text-xs">Eklenti Yönetimi ve Tercihler</p>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-2xl shadow-embossed border border-white flex items-center gap-4 animate-fade-in-up
          ${toast.type === 'success' ? 'bg-[#F0FDF4] text-green-800' : 'bg-[#FFFBEB] text-yellow-800'}
        `}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-10 shadow-embossed border border-white max-w-3xl">
        <h2 className="text-xl font-display font-black tracking-tight mb-8 uppercase flex items-center gap-3">
          <div className="w-2 h-8 bg-black rounded-full"></div>
          Tarayıcı Eklentileri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chrome Ext */}
          <div className="bg-[#F5F5F7] rounded-3xl p-8 shadow-inner-embossed flex flex-col items-center text-center border border-transparent hover:bg-white hover:border-black/5 hover:shadow-embossed transition-all duration-300">
            <div className={`w-20 h-20 rounded-full shadow-embossed flex items-center justify-center mb-6 transition-colors ${chromeInstalled ? 'bg-black text-white' : 'bg-white text-black'}`}>
              <Globe size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Google Chrome</h3>
            <p className="text-xs font-bold text-black/40 mb-8 leading-relaxed px-4">
              AutoCAR analiz asistanını Chrome tarayıcınıza ekleyerek ilanları saniyeler içinde okuyun.
            </p>
            <button 
              onClick={handleInstallChrome}
              className={`w-full py-4 rounded-full font-bold tracking-[0.2em] text-[10px] uppercase transition-all shadow-embossed
                ${chromeInstalled ? 'bg-white text-black opacity-50' : 'bg-black text-white hover:bg-black/80'}
              `}
            >
              {chromeInstalled ? 'Eklendi' : 'Chrome\'a Ekle'}
            </button>
          </div>

          {/* Firefox Ext */}
          <div className="bg-[#F5F5F7] rounded-3xl p-8 shadow-inner-embossed flex flex-col items-center text-center border border-transparent hover:bg-white hover:border-black/5 hover:shadow-embossed transition-all duration-300">
            <div className={`w-20 h-20 rounded-full shadow-embossed flex items-center justify-center mb-6 transition-colors ${firefoxInstalled ? 'bg-black text-white' : 'bg-white text-black'}`}>
              {/* Globe icon for Firefox mock */}
              <Puzzle size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Mozilla Firefox</h3>
            <p className="text-xs font-bold text-black/40 mb-8 leading-relaxed px-4">
              AutoCAR analiz asistanını Firefox tarayıcınıza ekleyerek ilanları saniyeler içinde okuyun.
            </p>
            <button 
              onClick={handleInstallFirefox}
              className={`w-full py-4 rounded-full font-bold tracking-[0.2em] text-[10px] uppercase transition-all shadow-embossed
                ${firefoxInstalled ? 'bg-white text-black opacity-50' : 'bg-black text-white hover:bg-black/80'}
              `}
            >
              {firefoxInstalled ? 'Eklendi' : 'Firefox\'a Ekle'}
            </button>
          </div>
        </div>
        
        {/* Logout Section */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-full shadow-embossed hover:shadow-embossed-hover transition-all duration-300 border border-transparent hover:border-red-100"
          >
            <div className="p-2 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors">
              <LogOut size={16} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Hesaptan Çıkış Yap</span>
          </button>
        </div>

      </div>

    </DashboardLayout>
  );
}
