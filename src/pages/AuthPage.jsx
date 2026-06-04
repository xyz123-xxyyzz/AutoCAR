import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck, MonitorSmartphone, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Consent Modal States
  const [showDeviceConsent, setShowDeviceConsent] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(err => {
        console.error("IP Fetch Error:", err);
        setIp('Unknown-IP');
      });
  }, []);

  const finalizeLogin = async (vipUser, deviceId) => {
    try {
      const role = vipUser.role; 
      
      if (role === 'sahip') {
        if (!vipUser.admin_device_id) {
          await supabase.from('vip_users').update({ admin_device_id: deviceId }).eq('email', email);
        } else if (vipUser.admin_device_id !== deviceId) {
          throw new Error('Güvenlik: Yönetici hesabı yalnızca tanımlı Ana Bilgisayardan (Sizin Bilgisayarınızdan) açılabilir.');
        }
      } else {
        const { data: ownerUser } = await supabase
          .from('vip_users')
          .select('admin_device_id')
          .eq('role', 'sahip')
          .limit(1)
          .single();
          
        const masterDeviceId = ownerUser?.admin_device_id;

        if (deviceId === masterDeviceId) {
          // Geçiş Serbest (Sahip, müşteri hesabına giriyor)
        } else {
          if (!vipUser.customer_device_id) {
            await supabase.from('vip_users').update({ customer_device_id: deviceId }).eq('email', email);
          } else if (vipUser.customer_device_id !== deviceId) {
            throw new Error('İlk başta hangi cihazdan girdiyseniz o cihazdan tekrardan giriş yapmalısınız.');
          }
        }
      }

      const demoRole = role === 'sahip' ? 'Sahip' : 'Kullanıcı';
      localStorage.setItem('userRole', demoRole);
      localStorage.setItem('userEmail', email);
      if (vipUser.openai_api_key) {
        localStorage.setItem('openai_api_key', vipUser.openai_api_key);
      }

      if (demoRole === 'Sahip') navigate('/sahip');
      else navigate('/kullanici');
    } catch (err) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleDeviceConsent = async () => {
    setShowDeviceConsent(false);
    setLoading(true);
    let deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('autocar_device_id', deviceId);
    await finalizeLogin(pendingLogin, deviceId);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: vipUser, error: vipError } = await supabase
        .from('vip_users')
        .select('password, role, admin_device_id, customer_device_id, openai_api_key')
        .eq('email', email)
        .single();

      if (vipError || !vipUser) {
        throw new Error('Bu e-posta yetkili bir VIP hesabı değil.');
      }

      if (vipUser.password !== password) {
        throw new Error('Geçersiz e-posta veya şifre. Lütfen yöneticinizden aldığınız VIP bilgileri kontrol edin.');
      }

      let deviceId = localStorage.getItem('autocar_device_id');
      if (!deviceId) {
         // Cihaz daha önce hiç kayıt olmamış, izin isteyelim
         setPendingLogin(vipUser);
         setShowDeviceConsent(true);
         setLoading(false);
         return;
      }

      await finalizeLogin(vipUser, deviceId);

    } catch (err) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black font-sans flex flex-col items-center justify-center p-6 selection:bg-black selection:text-white relative">
      
      {/* Device Consent Modal */}
      {showDeviceConsent && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 shadow-2xl border border-white/50 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner-embossed">
              <MonitorSmartphone size={32} />
            </div>
            <h3 className="text-2xl font-display font-black tracking-tight mb-4">Cihaz Kayıt Onayı</h3>
            <p className="text-black/60 font-medium text-sm leading-relaxed mb-8">
              VIP Hesabınız, güvenlik gereği yalnızca kullandığınız bu cihazdan (bilgisayardan) açılacak şekilde kilitlenecektir.<br/><br/>
              Sizin cihazınıza özel güvenlik altyapısını kurmamız için onay vermeniz gerekmektedir.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleDeviceConsent}
                className="w-full py-4 bg-black text-white font-bold tracking-widest text-[11px] uppercase rounded-full hover:bg-black/80 transition-colors flex items-center justify-center gap-2 shadow-embossed"
              >
                <CheckCircle2 size={16} /> İzin Ver ve Kurulumu Tamamla
              </button>
              <button 
                onClick={() => { setShowDeviceConsent(false); setPendingLogin(null); }}
                className="w-full py-4 bg-transparent text-black/50 font-bold tracking-widest text-[11px] uppercase rounded-full hover:bg-black/5 transition-colors"
              >
                İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

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
