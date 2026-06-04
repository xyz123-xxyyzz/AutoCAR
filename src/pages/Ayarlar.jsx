import { useState } from 'react';
import { Puzzle, Globe, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { supabase } from '../lib/supabase';

export default function Ayarlar() {
  const role = localStorage.getItem('userRole') || 'Kullanıcı';
  const displayEmail = role === 'Sahip' ? 'kagulle31@gmail.com' : 'autocarkullanici1@gmail.com';
  const displayPassword = role === 'Sahip' ? 'kz19gll28' : 'AutoCAR2026!1';
  
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
        
        {/* Kullanım Kılavuzu & Bilgilendirme (PDF Formatında) */}
        <div className="mt-12 bg-black rounded-[2.5rem] p-10 shadow-embossed text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Globe size={200} />
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight mb-8 uppercase flex items-center gap-3 relative z-10">
            <div className="w-2 h-8 bg-[#FFCC00] rounded-full"></div>
            Kullanım Kılavuzu & Önemli Bilgiler
          </h2>
          
          <div className="relative z-10 space-y-8">
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-[#FFCC00] font-bold text-lg mb-3 tracking-wide">1. Nasıl Analiz Yaparım?</h3>
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                Öncelikle yukarıdaki tarayıcı eklentisini kurmalısınız. Ardından desteklenen sitelere (sahibinden, arabam vb.) girip ilgilendiğiniz ilanları yeni sekmelerde açın. 
                Sağ üstteki AutoCAR eklentisine tıkladığınızda sistem sekmeleri otomatik algılar. "Analiz Et" diyerek işlemi başlatabilirsiniz. 
                <strong>Unutmayın, sistem güvenliği için aynı anda en fazla 50 araç analiz edilebilir.</strong>
              </p>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-[#FFCC00] font-bold text-lg mb-3 tracking-wide">2. Hesabım ve Bilgilerim</h3>
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                Size tahsis edilmiş e-posta adresiniz: <strong className="text-white bg-black/50 px-2 py-1 rounded">{displayEmail}</strong> ve 
                şifreniz: <strong className="text-white bg-black/50 px-2 py-1 rounded">{displayPassword}</strong> olarak ayarlanmıştır. Bu bilgiler yapay zeka 
                erişimi ve kontrol paneli girişi için ortaktır. Şifrenizi kimseyle paylaşmayınız.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-[#FFCC00] font-bold text-lg mb-3 tracking-wide">3. Fatura ve OpenAI (Yapay Zeka) Ödemeleri</h3>
              <p className="text-sm text-white/80 leading-relaxed font-medium mb-4">
                AutoCAR sistemi, gücünü doğrudan OpenAI API sistemlerinden alır. Sistemin sorunsuz çalışmaya devam edebilmesi için OpenAI hesabınızda 
                her zaman bakiye (kredi) bulunması gerekmektedir. Analiz başı ortalama harcama çok düşüktür (Örn: 100 araç için ~1 TL). 
                Kredi kartınızı sisteme tanımlamak ve bakiye yüklemek için aşağıdaki OpenAI faturalandırma paneline gitmelisiniz.
              </p>
              <a 
                href="https://platform.openai.com/account/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#FFCC00] text-black font-bold tracking-[0.2em] text-[10px] uppercase rounded-full hover:scale-105 transition-transform"
              >
                OpenAI Bakiye Yükleme Sayfasına Git <Globe size={16} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Logout Section */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem('userRole');
              navigate('/');
            }}
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
