import { useState, useEffect } from 'react';
import { Puzzle, Globe, CheckCircle, AlertCircle, LogOut, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { supabase } from '../lib/supabase';

export default function Ayarlar() {
  const role = localStorage.getItem('userRole') || 'Kullanıcı';
  const displayEmail = role === 'Sahip' ? 'kagulle31@gmail.com' : 'autocarkullanici1@gmail.com';
  const displayPassword = role === 'Sahip' ? 'kz19gll28' : 'AutoCAR2026!1';
  
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        const { data, error } = await supabase.rpc('get_vip_api_key', { p_email: email });
        if (error) {
          console.error("API key loading error:", error);
        } else if (data && data.api_key) {
          setApiKey(data.api_key);
        }
      }
    };
    fetchProfile();
  }, []);
  
  const [toast, setToast] = useState(null); // { type: 'success' | 'warning', message: '' }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      showToast('warning', 'Lütfen bir API anahtarı girin!');
      return;
    }
    setSavingKey(true);
    try {
      const email = localStorage.getItem('userEmail');
      if (email) {
        const { error } = await supabase.rpc('update_vip_api_key', { p_email: email, p_api_key: apiKey });
        if (error) throw error;
        localStorage.setItem('openai_api_key', apiKey);
        showToast('success', 'OpenAI API Anahtarı başarıyla kaydedildi!');
      } else {
        showToast('warning', 'Kullanıcı oturumu bulunamadı.');
      }
    } catch (err) {
      console.error(err);
      showToast('warning', 'API anahtarı kaydedilirken hata oluştu.');
    } finally {
      setSavingKey(false);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Firefox Ext */}
          <div className="w-full p-8 rounded-3xl bg-[#F4F4F4] shadow-inner flex flex-col items-center text-center relative overflow-hidden group">
            <div className={`w-20 h-20 rounded-full shadow-embossed flex items-center justify-center mb-6 transition-colors bg-black text-white`}>
              <Globe size={32} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-lg mb-2">Mozilla Firefox</h3>
            <p className="text-sm font-medium text-black/60 mb-8 leading-relaxed max-w-[240px]">
              AutoCAR analiz asistanını Firefox tarayıcınıza ekleyerek ilanları saniyeler içinde okuyun.
            </p>
            <a 
              href="/autocar.xpi"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-black text-white font-bold text-sm hover:bg-black/80 transition-all shadow-embossed w-full mt-auto"
            >
              Firefox'a Ekle <ArrowRight size={14} strokeWidth={3} />
            </a>
          </div>

          {/* API Key Input */}
          <div className="w-full p-8 rounded-3xl bg-[#F5F5F7] shadow-inner-embossed flex flex-col items-center text-center border border-transparent hover:bg-white hover:border-black/5 hover:shadow-embossed transition-all duration-300">
            <div className="w-20 h-20 rounded-full shadow-embossed flex items-center justify-center mb-6 bg-black text-[#FFCC00]">
              <Puzzle size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">OpenAI API Anahtarı</h3>
            <p className="text-xs font-bold text-black/40 mb-8 leading-relaxed px-4">
              Yapay zeka analizlerinin çalışması için gizli API anahtarınızı (sk-...) buraya kaydedin.
            </p>
            <div className="w-full mt-auto space-y-3">
              <input 
                type="password" 
                placeholder="sk-proj-..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white shadow-inner-embossed border border-transparent rounded-2xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-colors text-center font-mono"
              />
              <button 
                onClick={handleSaveApiKey}
                disabled={savingKey}
                className="w-full py-4 rounded-full font-bold tracking-[0.2em] text-[10px] uppercase transition-all shadow-embossed bg-black text-[#FFCC00] hover:bg-black/80 disabled:opacity-50"
              >
                {savingKey ? 'Kaydediliyor...' : 'Anahtarı Kaydet'}
              </button>
            </div>
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
                Öncelikle yukarıdaki tarayıcı eklentisini kurmalısınız. Ardından desteklenen sitelere (sahibinden, arabam vb.) girip ilgilendiğiniz araçların listelendiği arama sayfasına gidin. 
                Sağ üstteki AutoCAR eklentisine tıkladığınızda sistem sayfayı otomatik algılar. "Derin Tarama" butonuna tıklayarak işlemi başlatabilirsiniz. Sistem arka planda 'Hayalet Sekmeler' ile ilanları çekecektir.
                <strong>Unutmayın, sistem API limitleri gereği bir aramada en fazla 1000 ilana kadar Derin Tarama yapabilir.</strong>
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
                her zaman bakiye (kredi) bulunması gerekmektedir. Analiz başı ortalama harcama 100'lü paket mimarisi sayesinde çok düşüktür (Örn: Yüzlerce araç için ~3-5 TL). 
                Kredi kartınızı sisteme tanımlamak ve bakiye yüklemek için aşağıdaki OpenAI faturalandırma paneline gitmelisiniz.
              </p>
              <a 
                href="https://platform.openai.com/account/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#FFCC00] text-black font-bold tracking-[0.2em] text-[10px] uppercase rounded-full hover:scale-105 transition-transform mb-2"
              >
                OpenAI Bakiye Yükleme Sayfasına Git <Globe size={16} />
              </a>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-[#FFCC00] font-bold text-lg mb-3 tracking-wide">4. Eklentiyle Hızlı ve Toplu Tarama Taktikleri (Fare Tekerleği Metodu)</h3>
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                • <strong>Taramayı Başlatın:</strong> Arama sonuçları listesinde eklenti popup'ından <strong>"Taramayı Başlat"</strong> butonuna basın.<br/>
                • <strong>İlanları Sekmede Açın:</strong> Fare tekerleğine (orta tuşa) basarak ilan başlıklarını hızlıca yeni sekmelerde açın. Tek seferde bilgisayarınızın gücüne göre <strong>20, 50 veya 100 ilanı</strong> sekmelerde açabilirsiniz.<br/>
                • <strong>Sekmeleri Kapatın:</strong> Popup penceresinde ilanların karşısında <strong>"Yüklendi"</strong> yazdığını ve sayacın arttığını gördüğünüzde o ilan sekmelerini kapatabilirsiniz. Hafızaya alınan sekmeleri kapatmak tarayıcınızın RAM tüketimini azaltır.<br/>
                • <strong>Analizi Başlatın:</strong> Toplama bittiğinde <strong>"Analizi Başlat"</strong> diyerek işlemi tamamlayın.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-[#FFCC00] font-bold text-lg mb-3 tracking-wide">5. Sahibinden "Olağan Dışı Durum" (Robot Kontrolü) Engelini Aşma Rehberi</h3>
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                İlan siteleri hızlı ve çoklu taramalarda güvenlik sebebiyle robot kontrolü (Captcha) ekranı açabilir. Bu sekmeler için eklentide "Hata Oluştu" yazar. Bunu aşmak son derece pratiktir:<br/>
                • <strong>Robot Doğrulamasını Çözün:</strong> Uyarı veren sekmelerden <strong>sadece bir tanesine</strong> geçerek robot doğrulamasını elinizle çözüp ilan detayına ulaşın.<br/>
                • <strong>Diğer Sayfaları Yenileyin:</strong> Tarayıcı bir kez doğrulandıktan sonra, uyarı veren diğer sekmelere giderek <strong>Ctrl + R</strong> (Sayfayı Yenile) yapın.<br/>
                • Yenilenen sekmeler çerezler aktif olduğu için normal açılacak ve eklenti verileri saniyeler içinde otomatik olarak hafızaya alacaktır.
              </p>
            </div>
          </div>
        </div>
        
        {/* Logout Section */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem('userRole');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('openai_api_key');
              localStorage.removeItem('autocar_isAuthenticated');
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
