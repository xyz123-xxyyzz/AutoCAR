import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Fetch IP automatically on mount
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(err => {
        console.error("IP Fetch Error:", err);
        setIp('Unknown-IP');
      });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Supabase Authentication (SADECE GİRİŞ, YENİ KAYIT YASAK)
      let { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error('Geçersiz e-posta veya şifre. Lütfen yöneticinizden aldığınız VIP bilgileri kontrol edin.');
      }

      if (data?.user) {
        // Cihaz Kilidi (Device Fingerprinting)
        let deviceId = localStorage.getItem('autocar_device_id');
        if (!deviceId) {
          deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
          localStorage.setItem('autocar_device_id', deviceId);
        }

        // vip_users tablosundan VIP hesabı çek
        const { data: vipUser, error: vipError } = await supabase
          .from('vip_users')
          .select('*')
          .eq('email', email)
          .single();

        if (vipError || !vipUser) {
          await supabase.auth.signOut();
          throw new Error('Bu e-posta yetkili bir VIP hesabı değil.');
        }

        const role = vipUser.role; // 'sahip' veya 'kullanici'
        
        if (role === 'sahip') {
          // SAHİP KURALI: Sadece ve sadece Sahip'in kendi bilgisayarı (1 Adet) girebilir.
          if (!vipUser.admin_device_id) {
            // İlk kez giriyorsa cihazı Master Device olarak kaydet
            await supabase.from('vip_users').update({ admin_device_id: deviceId }).eq('email', email);
          } else if (vipUser.admin_device_id !== deviceId) {
            // İkinci bir bilgisayardan girmeye çalışıyorsa reddet
            await supabase.auth.signOut();
            throw new Error('Güvenlik: Yönetici hesabı yalnızca tanımlı Ana Bilgisayardan (Sizin Bilgisayarınızdan) açılabilir.');
          }
        } else {
          // MÜŞTERİ KURALI: 
          // 1. Sahip (Master Device) her zaman girebilir.
          // 2. Müşteri (Kendi Device'ı) 1 kez kaydedilir ve sadece o bilgisayardan girebilir.
          
          // Önce Master Device'ı (Sahibin Cihazını) veritabanından öğrenelim
          const { data: ownerUser } = await supabase
            .from('vip_users')
            .select('admin_device_id')
            .eq('role', 'sahip')
            .limit(1)
            .single();
            
          const masterDeviceId = ownerUser?.admin_device_id;

          // Eğer giren kişi SİZSİNİZ (Master Device) ise, müşteri hesabına direkt izin ver.
          if (deviceId === masterDeviceId) {
            // Geçiş Serbest (Müşteri slotunu bile harcamaz)
          } else {
            // Eğer giren kişi MÜŞTERİ ise (Master Device değilse)
            if (!vipUser.customer_device_id) {
              // Müşteri ilk defa giriyorsa, onun bilgisayarını müşteriye ait cihaz olarak kaydet (2. slot doldu)
              await supabase.from('vip_users').update({ customer_device_id: deviceId }).eq('email', email);
            } else if (vipUser.customer_device_id !== deviceId) {
              // Eğer giren bilgisayar ne SİZİN bilgisayarınız, ne de MÜŞTERİNİN ilk girdiği bilgisayar değilse (Yani 3. bir kişi/arkadaşıysa) -> REDDET
              await supabase.auth.signOut();
              throw new Error('İzinsiz Erişim: Bu hesap yalnızca tanımlı Müşteri bilgisayarından veya Yönetici bilgisayarından açılabilir.');
            }
          }
        }

        // Güncel rolü localStorage'a yaz
        const demoRole = role === 'sahip' ? 'Sahip' : 'Kullanıcı';
        localStorage.setItem('userRole', demoRole);

        if (demoRole === 'Sahip') navigate('/sahip');
        else navigate('/kullanici');
      }

    } catch (err) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black font-sans flex flex-col items-center justify-center p-6 selection:bg-black selection:text-white">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-10">
          <div className="font-display font-black text-4xl tracking-[0.2em] uppercase mb-4">AutoCAR</div>
          <p className="text-black/50 font-bold tracking-widest text-xs uppercase">Geleceğin Otomobil Analizi</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-embossed border border-white relative overflow-hidden">
          {/* Security Badge */}
          <div className="absolute top-0 right-0 bg-[#F5F5F7] px-4 py-2 rounded-bl-2xl flex items-center gap-2 shadow-inner-embossed">
            <ShieldCheck size={12} className="text-black" />
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-black/50">Cihaz Koruması Aktif</span>
          </div>

          <h2 className="text-3xl font-display font-black tracking-tight mb-8 mt-4 text-center">VIP Sisteme Giriş</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-inner-embossed border border-red-100">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/50 ml-4">VIP E-posta</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Mail className="text-black/30" size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-[#F5F5F7] border-none rounded-full text-black font-bold focus:outline-none focus:ring-2 focus:ring-black/10 transition-all shadow-inner-embossed"
                  placeholder="vip@mail.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/50 ml-4">Şifre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Lock className="text-black/30" size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-[#F5F5F7] border-none rounded-full text-black font-bold focus:outline-none focus:ring-2 focus:ring-black/10 transition-all shadow-inner-embossed"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 mt-4 bg-black text-white font-display font-black tracking-[0.2em] text-[10px] uppercase rounded-full hover:bg-black/80 transition-colors flex items-center justify-center gap-3 shadow-embossed hover:shadow-embossed-hover disabled:opacity-70"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Bekleniyor...</>
              ) : (
                <>Giriş Yap <ArrowRight size={14} strokeWidth={3} /></>
              )}
            </button>

          </form>

          <p className="text-center text-[10px] text-black/30 font-bold mt-8 tracking-widest leading-relaxed uppercase">
            Sadece yöneticinizden aldığınız VIP şifre ile giriş yapabilirsiniz.<br/>
            Güvenliğiniz için cihaz kimliğiniz kaydedilmektedir.
          </p>

        </div>
      </div>
    </div>
  );
}
