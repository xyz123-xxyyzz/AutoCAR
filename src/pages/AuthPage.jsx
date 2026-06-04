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
      // Cihaz Kilidi (Device Fingerprinting)
      let deviceId = localStorage.getItem('autocar_device_id');
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('autocar_device_id', deviceId);
      }

      // Her şeyi Supabase'deki akıllı RPC fonksiyonuna gönderiyoruz.
      // Parola, Admin/Müşteri cihaz eşleşmesi ve Master cihaz iznini bu fonksiyon kontrol eder.
      const { data: response, error: rpcError } = await supabase.rpc('process_vip_login', {
        p_email: email,
        p_password: password,
        p_device_id: deviceId
      });

      if (rpcError) {
        throw new Error('Sistemsel bir hata oluştu: ' + rpcError.message);
      }

      if (!response.success) {
        throw new Error(response.error || 'Giriş reddedildi.');
      }

      const vipUser = response.user;
      const role = vipUser.role.toLowerCase();

      const demoRole = role === 'sahip' ? 'Sahip' : 'Kullanıcı';
      localStorage.setItem('userRole', demoRole);
      localStorage.setItem('userEmail', email);
      if (vipUser.openai_api_key) {
        localStorage.setItem('openai_api_key', vipUser.openai_api_key);
      } else {
        localStorage.removeItem('openai_api_key');
      }

      if (demoRole === 'Sahip') navigate('/sahip');
      else navigate('/kullanici');

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
            <span className="text-red-500 font-black">DİKKAT:</span> BU SİSTEME SADECE İLK GİRDİĞİNİZ BİLGİSAYAR İLE GİRİŞ YAPABİLİRSİNİZ.
          </p>

        </div>
      </div>
    </div>
  );
}
